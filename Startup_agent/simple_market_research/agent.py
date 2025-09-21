import logging
import re
from collections.abc import AsyncGenerator
from typing import Literal

import requests
from bs4 import BeautifulSoup
from google.adk.agents import BaseAgent, LlmAgent, LoopAgent, SequentialAgent
from google.adk.agents.callback_context import CallbackContext
from google.adk.agents.invocation_context import InvocationContext
from google.adk.events import Event, EventActions
from google.adk.tools import google_search
from google.genai import types as genai_types
from pydantic import BaseModel

# ---------------- CONFIG ----------------
class AppConfig:
    worker_model: str = "gemini-2.5-pro"
    critic_model: str = "gemini-2.5-pro"
    max_search_iterations: int = 4
    target_report_word_count_min: int = 5000
    target_report_word_count_max: int = 9000

config = AppConfig()

# ---------------- STRUCTURED MODELS ----------------
class MarketSearchQuery(BaseModel):
    search_query: str
    research_phase: str

class MarketFeedback(BaseModel):
    grade: Literal["pass", "fail"]
    comment: str

class ScrapeInput(BaseModel):
    url: str

class ScrapeOutput(BaseModel):
    url: str
    title: str
    domain: str
    headings: list[str]
    paragraphs: list[str]
    tables: list[list[list[str]]]

# ---------------- WEB SCRAPER ----------------
def simple_web_scraper(input: ScrapeInput) -> ScrapeOutput:
    resp = requests.get(input.url, timeout=10)
    soup = BeautifulSoup(resp.text, "html.parser")
    title = soup.title.string.strip() if soup.title else input.url
    headings = [h.get_text(strip=True) for h in soup.find_all(["h1","h2","h3"])]
    paragraphs = [p.get_text(strip=True) for p in soup.find_all("p")]
    tables = []
    for table in soup.find_all("table"):
        rows = []
        for tr in table.find_all("tr"):
            rows.append([td.get_text(strip=True) for td in tr.find_all(["td","th"])])
        if rows:
            tables.append(rows)
    return ScrapeOutput(
        url=input.url,
        title=title,
        domain=re.sub(r"^https?://(www\.)?", "", input.url).split("/")[0],
        headings=headings,
        paragraphs=paragraphs,
        tables=tables,
    )

# ---------------- WEB SCRAPER AGENT ----------------
class WebScraperAgent(BaseAgent):
    """Runs web scraping on URLs obtained from Google Search."""
    def scrape_url(self, url: str) -> ScrapeOutput:
        return simple_web_scraper(ScrapeInput(url=url))

web_scraper_agent = WebScraperAgent(name="web_scraper_agent")

# ---------------- CALLBACKS ----------------
def collect_research_sources_callback(callback_context: CallbackContext) -> None:
    logging.info(f"[{callback_context.agent_name}] collected research sources.")

def citation_replacement_callback(callback_context: CallbackContext) -> genai_types.Content:
    return genai_types.Content(parts=[genai_types.Part(text="Citations replaced.")])

# ---------------- ESCALATION CHECKER ----------------
class EscalationChecker(BaseAgent):
    min_reliability: float = 0.6

    async def _run_async_impl(self, ctx: InvocationContext) -> AsyncGenerator[Event, None]:
        evaluation_result = ctx.session.state.get("research_evaluation")
        reliability = ctx.session.state.get("data_reliability_overall", 0.0)
        if evaluation_result and evaluation_result.get("grade") == "pass" and reliability >= self.min_reliability:
            logging.info(f"[{self.name}] Research passed. Escalating loop stop.")
            yield Event(author=self.name, actions=EventActions(escalate=True))
        else:
            yield Event(author=self.name)

# ---------------- AGENTS ----------------
market_section_planner = LlmAgent(
    model=config.worker_model,
    name="market_section_planner"
)

market_researcher = LlmAgent(
    model=config.worker_model,
    name="market_researcher",
    tools=[google_search],  # Only Google Search for LLM
    after_agent_callback=collect_research_sources_callback,
)

market_evaluator = LlmAgent(
    model=config.critic_model,
    name="market_evaluator"
)

enhanced_market_search = LlmAgent(
    model=config.worker_model,
    name="enhanced_market_search",
    tools=[google_search],
    after_agent_callback=collect_research_sources_callback,
)

market_report_composer = LlmAgent(
    model=config.worker_model,
    name="market_report_composer",
    instruction="""
    Generate a comprehensive market research report as MARKDOWN.
    - Use # for section headings, ## for sub-sections
    - Use bullet points, numbered lists where relevant
    - Include tables where appropriate using Markdown table syntax
    - Keep the tone professional, structured, and easy to read
    """,
    after_agent_callback=citation_replacement_callback,
)

# ---------------- PIPELINE ----------------
market_research_pipeline = SequentialAgent(
    name="market_research_pipeline",
    sub_agents=[
        market_section_planner,
        market_researcher,
        LoopAgent(
            name="quality_assurance_loop",
            max_iterations=config.max_search_iterations,
            sub_agents=[
                market_evaluator,
                EscalationChecker(name="escalation_checker"),
                enhanced_market_search,
            ],
        ),
        market_report_composer,
    ],
)

root_agent = market_research_pipeline
