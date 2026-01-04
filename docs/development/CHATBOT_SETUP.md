# Chatbot Setup Guide - OpenAI Integration

This guide will help you set up the OpenAI-powered chatbot for the Education & Learning Copilot project.

## Prerequisites

1. **OpenAI API Key** - Get one from [OpenAI Platform](https://platform.openai.com/api-keys)
2. **Node.js** - Version 16 or higher
3. **npm** - Package manager

## Backend Setup

### 1. Navigate to Backend Directory

```bash
cd backend
```

### 2. Install Dependencies

```bash
npm install
```

This will install:
- `express` - Web framework
- `openai` - OpenAI SDK
- `cors` - CORS middleware
- `dotenv` - Environment variables
- `axios` - HTTP client

### 3. Configure Environment Variables

Create a `.env` file from the template:

```bash
cp env.template .env
```

Edit `.env` and add your OpenAI API key:

```env
OPENAI_API_KEY=sk-your-actual-openai-api-key-here
OPENAI_MODEL=gpt-3.5-turbo
OPENAI_TEMPERATURE=0.7
OPENAI_MAX_TOKENS=1000
```

**Important:** 
- Replace `sk-your-actual-openai-api-key-here` with your actual OpenAI API key
- Never commit the `.env` file to version control
- The API key should start with `sk-`

### 4. Start the Backend Server

```bash
npm run dev
```

The server will start on `http://localhost:5000`

You should see:
```
🚀 Server running on http://localhost:5000
📚 Education & Learning Copilot API
🤖 Chatbot endpoint: http://localhost:5000/api/chatbot/message
✅ OpenAI API key configured
```

## Frontend Setup

The frontend is already configured to use the backend API. The chatbot component will automatically connect to the backend.

### API URL Configuration

If your backend is running on a different URL, create a `.env` file in the `frontend` directory:

```env
VITE_API_URL=http://localhost:5000
```

## Testing the Chatbot

### 1. Start Both Servers

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

### 2. Open the Application

Navigate to `http://localhost:3000` in your browser.

### 3. Test the Chatbot

1. Click the chat button in the bottom-right corner
2. Type a message like "How does quiz generation work?"
3. The chatbot will respond using OpenAI

## API Endpoints

### Send Message

**POST** `/api/chatbot/message`

Request body:
```json
{
  "message": "How does quiz generation work?",
  "conversationHistory": []
}
```

Response:
```json
{
  "success": true,
  "message": "Quiz generation works by...",
  "usage": {
    "prompt_tokens": 50,
    "completion_tokens": 100,
    "total_tokens": 150
  },
  "model": "gpt-3.5-turbo",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### Health Check

**GET** `/api/chatbot/health`

Returns the health status of the chatbot service.

## Troubleshooting

### Error: "OPENAI_API_KEY is not set"

- Make sure you've created a `.env` file in the `backend` directory
- Verify the `OPENAI_API_KEY` is set correctly
- Restart the server after adding the key

### Error: "Invalid OpenAI API key"

- Check that your API key is correct
- Ensure the key starts with `sk-`
- Verify the key is active on OpenAI platform

### Error: "Failed to generate chatbot response"

- Check your internet connection
- Verify OpenAI API is accessible
- Check your OpenAI account has credits/quota

### Frontend can't connect to backend

- Ensure backend is running on port 5000
- Check CORS settings in backend
- Verify `VITE_API_URL` in frontend `.env` matches backend URL

### Rate Limit Errors

- OpenAI has rate limits based on your plan
- Wait a few moments and try again
- Consider upgrading your OpenAI plan

## OpenAI Model Options

You can change the model in `.env`:

- `gpt-3.5-turbo` - Fast and cost-effective (default)
- `gpt-4` - More capable but slower and more expensive
- `gpt-4-turbo` - Latest GPT-4 with improvements

## Cost Considerations

- GPT-3.5-turbo is cheaper (~$0.002 per 1K tokens)
- GPT-4 is more expensive (~$0.03 per 1K tokens)
- Monitor your usage on OpenAI dashboard
- Set up billing alerts

## Security Best Practices

1. **Never commit `.env` files** - Already in `.gitignore`
2. **Use environment variables** - Don't hardcode API keys
3. **Rotate keys regularly** - Especially if exposed
4. **Use different keys** - Separate keys for dev/staging/production
5. **Monitor usage** - Check OpenAI dashboard regularly

## Next Steps

- Add authentication to protect API endpoints
- Implement rate limiting per user
- Add conversation history persistence
- Integrate with database for user sessions
- Add error handling and retry logic

## Support

For issues or questions:
- Check OpenAI API documentation: https://platform.openai.com/docs
- Review backend logs for error messages
- Verify environment variables are set correctly




