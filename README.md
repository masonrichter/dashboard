# Flask MailerLite Campaign API

A Flask application that fully automates the process of creating and sending MailerLite campaigns through a single API endpoint.

## Features

- **Single Endpoint**: One POST request to create and send campaigns
- **Three-Step Automation**: Create campaign → Add content → Send campaign
- **Error Handling**: Comprehensive error handling and logging
- **Health Checks**: Built-in health check and connection testing
- **Logging**: Detailed logging for debugging and monitoring

## Setup

### 1. Install Dependencies

```bash
pip install -r requirements.txt
```

### 2. Set Environment Variables

Create a `.env` file in the project root:

```bash
MAILERLITE_API_KEY=your_mailerlite_api_key_here
```

### 3. Run the Flask Application

```bash
python flask_mailerlite_endpoint.py
```

The server will start on `http://localhost:5000`

## API Endpoints

### 1. Send Campaign
**POST** `/api/campaigns/send`

Creates and sends a MailerLite campaign in one request.

**Request Body:**
```json
{
    "subject": "Your Email Subject",
    "html_content": "<html><body><h1>Hello!</h1><p>This is HTML content.</p></body></html>",
    "plain_content": "Hello! This is plain text content.",
    "group_ids": [123, 456, 789]
}
```

**Response:**
```json
{
    "success": true,
    "message": "Campaign created and sent successfully",
    "campaign_id": "campaign_123456",
    "subject": "Your Email Subject",
    "groups_sent_to": [123, 456, 789],
    "timestamp": "2024-01-01T12:00:00.000Z"
}
```

### 2. Health Check
**GET** `/health`

Checks if the service is running and if the MailerLite API key is configured.

**Response:**
```json
{
    "status": "healthy",
    "timestamp": "2024-01-01T12:00:00.000Z",
    "mailerlite_api_configured": true
}
```

### 3. Test Connection
**POST** `/api/campaigns/test`

Tests the MailerLite API connection without sending any campaigns.

**Response:**
```json
{
    "success": true,
    "message": "MailerLite API connection successful",
    "account": {
        "id": "account_123",
        "name": "Your Account Name"
    }
}
```

## Usage Examples

### Python Example

```python
import requests

# Send a campaign
campaign_data = {
    "subject": "Welcome to Our Newsletter",
    "html_content": "<h1>Welcome!</h1><p>Thank you for subscribing.</p>",
    "plain_content": "Welcome! Thank you for subscribing.",
    "group_ids": [123, 456]
}

response = requests.post(
    "http://localhost:5000/api/campaigns/send",
    json=campaign_data
)

if response.ok:
    result = response.json()
    print(f"Campaign sent! ID: {result['campaign_id']}")
else:
    print(f"Error: {response.json()['error']}")
```

### cURL Example

```bash
curl -X POST http://localhost:5000/api/campaigns/send \
  -H "Content-Type: application/json" \
  -d '{
    "subject": "Test Campaign",
    "html_content": "<h1>Hello World</h1>",
    "plain_content": "Hello World",
    "group_ids": [123, 456]
  }'
```

### JavaScript Example

```javascript
const campaignData = {
    subject: "Test Campaign",
    html_content: "<h1>Hello World</h1>",
    plain_content: "Hello World",
    group_ids: [123, 456]
};

fetch('http://localhost:5000/api/campaigns/send', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
    },
    body: JSON.stringify(campaignData)
})
.then(response => response.json())
.then(data => {
    if (data.success) {
        console.log('Campaign sent!', data.campaign_id);
    } else {
        console.error('Error:', data.error);
    }
});
```

## Testing

Run the example usage script to test all endpoints:

```bash
python example_usage.py
```

This will:
1. Test the health check endpoint
2. Test the MailerLite API connection
3. Send a test campaign (if previous tests pass)

## Error Handling

The API returns detailed error messages for various scenarios:

- **Missing API Key**: `MAILERLITE_API_KEY` not set
- **Invalid Request**: Missing required fields or invalid data
- **API Errors**: MailerLite API errors with details
- **Network Errors**: Connection issues
- **Unexpected Errors**: General application errors

## Logging

The application logs all operations with timestamps:

```
INFO:__main__:Starting campaign creation process for subject: Test Campaign
INFO:__main__:Step 1: Creating campaign...
INFO:__main__:Campaign created successfully with ID: campaign_123456
INFO:__main__:Step 2: Adding content to campaign...
INFO:__main__:Content added successfully to campaign
INFO:__main__:Step 3: Sending campaign...
INFO:__main__:Campaign sent successfully!
```

## Security Notes

- Store your MailerLite API key securely
- Use environment variables for configuration
- Consider adding authentication to the Flask endpoints in production
- Use HTTPS in production environments

## Production Deployment

For production deployment:

1. Use a production WSGI server (e.g., Gunicorn)
2. Set up proper logging
3. Add authentication/authorization
4. Use HTTPS
5. Set up monitoring and health checks

Example with Gunicorn:
```bash
pip install gunicorn
gunicorn -w 4 -b 0.0.0.0:5000 flask_mailerlite_endpoint:app
``` 