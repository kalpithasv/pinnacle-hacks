#!/bin/bash

# Create a unique session ID. Note the space between `date` and `+`.
SESSION_ID="intense-research-$(date +%s)"

echo "Sending message to ADK agent..."

# Send a single POST request to the /run endpoint.
# Using an empty session_id lets the ADK API create a new session.
RESPONSE=$(curl -s -X POST "http://localhost:8000/run" \
  -H "Content-Type: application/json" \
  -d "{
    \"app_name\": \"simple_market_research\",
    \"user_id\": \"$USER_ID\",
    \"session_id\": \"\",
    \"new_message\": {
      \"parts\": [{\"text\": \"Do market research on Kandhamal turmeric demand in Europe\"}],
      \"role\": \"user\"
    }
  }")

# Print the response to the terminal
echo "$RESPONSE" | jq .

echo "Done."