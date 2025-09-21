import asyncio
import logging

from simple_market_research.agent import root_agent, simple_web_scraper, ScrapeInput

logging.basicConfig(level=logging.INFO)

# ---------------- TESTING WEB SCRAPER ----------------
async def test_web_scraper():
    print("Testing Web Scraper Tool...")
    sample_url = "https://example.com"

    # Test the simple_web_scraper function (synchronous)
    scrape_input = ScrapeInput(url=sample_url)
    scraped_output = simple_web_scraper(scrape_input)
    print("\nDirect simple_web_scraper output:")
    print(f"Title: {scraped_output.title}")
    print(f"Domain: {scraped_output.domain}")
    print(f"Headings: {scraped_output.headings[:5]}")
    print(f"Paragraphs: {scraped_output.paragraphs[:5]}")

# ---------------- TESTING ROOT AGENT PIPELINE ----------------
async def test_root_agent():
    print("\nTesting root_agent pipeline...")
    # We cannot fully run LlmAgent without API keys or model access,
    # so we just print the structure here.
    print("Root agent name:", root_agent.name)
    print("Sub-agents in pipeline:")
    for agent in root_agent.sub_agents:
        print(" -", agent.name)

# ---------------- MAIN ----------------
async def main():
    print("Starting root_agent test...\n")
    await test_web_scraper()
    await test_root_agent()
    print("\nAll tests completed.")

if __name__ == "__main__":
    asyncio.run(main())
