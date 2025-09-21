# main.py
try:
    # Newer ADK (>=0.4.x)
    from google.adk import register_app
    from simple_market_research.agent import root_agent

    @register_app(name="simple_market_research")
    def app():
        return root_agent

except ImportError:
    # Older ADK (<0.4.x) – fallback
    from simple_market_research.agent import root_agent

    # ADK auto-detects if you expose `app`
    app = root_agent
