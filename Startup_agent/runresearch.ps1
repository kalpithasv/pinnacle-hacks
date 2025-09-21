# Define variables
$APP_NAME = "simple_market_research"
$USER_ID = "testuser"

# Step 1: Explicitly create a new session
Write-Host "Creating a new session..."

$createSessionBody = @"
{
    "state": {}
}
"@

$sessionResponse = Invoke-RestMethod -Uri "http://localhost:8000/apps/$APP_NAME/users/$USER_ID/sessions" `
    -Method "POST" `
    -ContentType "application/json" `
    -Body $createSessionBody

$SESSION_ID = $sessionResponse.id
Write-Host "Session created with ID: $SESSION_ID"


# Step 2: Run the agent using the new session ID
Write-Host "Sending message to ADK agent..."

# Use a here-string to create the JSON payload directly for the /run endpoint
$runBody = @"
{
    "app_name": "$APP_NAME",
    "user_id": "$USER_ID",
    "session_id": "$SESSION_ID",
    "new_message": {
        "parts": [
            {
                "text": "Do market research on Kandhamal turmeric demand in Europe"
            }
        ],
        "role": "user"
    }
}
"@

$response = Invoke-RestMethod -Uri "http://localhost:8000/run" `
    -Method "POST" `
    -ContentType "application/json" `
    -Body $runBody

# Print the response to the terminal
$response | ConvertTo-Json -Depth 10 | Write-Host

Write-Host "Done."