# Education & Learning Copilot - Backend API

Backend API server for the Education & Learning Copilot platform.

## Features

- 🤖 OpenAI-powered chatbot
- 🔐 JWT authentication
- 📚 Course and content management
- 📊 Analytics and performance tracking
- 🔗 LMS and YouTube integrations
- 🧠 RAG (Retrieval-Augmented Generation) support

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Configuration

Copy the environment template and configure your variables:

```bash
cp env.template .env
```

Edit `.env` and add your actual values, especially:

- `OPENAI_API_KEY` - Your OpenAI API key (required for chatbot)
- `DB_URL` - Database connection string
- `JWT_SECRET` - Secret key for JWT tokens
- Other service credentials as needed

### 3. Run the Server

**Development mode:**
```bash
npm run dev
```

**Production mode:**
```bash
npm start
```

The server will start on `http://localhost:5000` (or the port specified in `.env`).

## API Endpoints

### Chatbot

- `POST /api/chatbot/message` - Send a message to the chatbot
  ```json
  {
    "message": "How does quiz generation work?",
    "conversationHistory": []
  }
  ```

- `GET /api/chatbot/health` - Check chatbot service health

### Health Check

- `GET /health` - Server health check
- `GET /` - API information

## OpenAI Configuration

The chatbot uses OpenAI's GPT models. Configure in `.env`:

```env
OPENAI_API_KEY=sk-your-api-key-here
OPENAI_MODEL=gpt-3.5-turbo
OPENAI_TEMPERATURE=0.7
OPENAI_MAX_TOKENS=1000
```

## Project Structure

```
backend/
├── src/
│   ├── config/          # Configuration files
│   ├── controllers/     # Request handlers
│   ├── services/        # Business logic
│   ├── routes/          # API routes
│   ├── middleware/      # Express middleware
│   └── server.js        # Server entry point
├── .env                 # Environment variables (not in git)
├── env.template         # Environment template
└── package.json         # Dependencies
```

## Development

The server uses:
- **Express.js** - Web framework
- **OpenAI SDK** - For AI chatbot
- **dotenv** - Environment variable management
- **CORS** - Cross-origin resource sharing

## Security Notes

- Never commit `.env` file to version control
- Use strong, random secrets for production
- Keep API keys secure
- Enable rate limiting in production
- Use HTTPS in production




