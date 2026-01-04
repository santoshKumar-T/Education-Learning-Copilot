# Environment Variables Setup Guide

This guide explains how to set up your environment variables for the Education & Learning Copilot backend.

## Quick Start

1. Copy the example file to create your `.env` file:
   ```bash
   cp .env.example .env
   ```

2. Open `.env` and replace all placeholder values with your actual credentials.

3. **IMPORTANT**: Never commit `.env` to version control. It's already in `.gitignore`.

## Environment Variables Categories

### Application Configuration
- `NODE_ENV`: Environment mode (development, staging, production)
- `PORT`: Server port number
- `APP_NAME`: Application name
- `APP_URL`: Backend API URL
- `FRONTEND_URL`: Frontend application URL

### Database Configuration
Choose one or both depending on your setup:

**PostgreSQL:**
- `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`
- Or use `DB_URL` for connection string format

**MongoDB:**
- `MONGODB_URI`: Full MongoDB connection string
- `MONGODB_USER`, `MONGODB_PASSWORD`: Separate credentials

### Redis Configuration
- `REDIS_HOST`, `REDIS_PORT`, `REDIS_PASSWORD`
- Or use `REDIS_URL` for connection string

### Authentication & Security
- `JWT_SECRET`: Secret key for JWT tokens (use a strong random string)
- `JWT_EXPIRES_IN`: Token expiration time
- `JWT_REFRESH_SECRET`: Secret for refresh tokens
- `SESSION_SECRET`: Secret for session management
- `ENCRYPTION_KEY`: 32-character key for data encryption

### OAuth & Social Login
- `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`: Google OAuth credentials
- `GOOGLE_CALLBACK_URL`: OAuth callback URL

### AWS & Cloud Storage
- `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`: AWS credentials
- `AWS_REGION`: AWS region
- `AWS_S3_BUCKET_NAME`: S3 bucket for file storage

### Email Service
Choose one:

**SendGrid:**
- `EMAIL_SERVICE=sendgrid`
- `SENDGRID_API_KEY`: Your SendGrid API key

**SMTP:**
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD`

### Payment Gateway
- `STRIPE_SECRET_KEY`: Stripe secret key
- `STRIPE_PUBLISHABLE_KEY`: Stripe publishable key
- `STRIPE_WEBHOOK_SECRET`: Webhook secret for Stripe events

### Third-Party APIs

**YouTube API:**
- `YOUTUBE_API_KEY`: YouTube Data API v3 key

**OpenAI/LLM:**
- `OPENAI_API_KEY`: OpenAI API key for AI agents
- `OPENAI_MODEL`: Model to use (e.g., gpt-4, gpt-3.5-turbo)
- `ANTHROPIC_API_KEY`: Anthropic API key (alternative)

**RAG (Retrieval-Augmented Generation):**
- `VECTOR_DB_URL`: Vector database connection URL
- `EMBEDDING_MODEL`: Model for embeddings
- `RAG_TOP_K`: Number of top results to retrieve

### LMS Integration
- `CANVAS_API_URL`, `CANVAS_API_TOKEN`: Canvas LMS
- `MOODLE_API_URL`, `MOODLE_API_TOKEN`: Moodle LMS
- `BLACKBOARD_API_URL`, `BLACKBOARD_API_KEY`: Blackboard LMS

### File Upload
- `MAX_FILE_SIZE`: Maximum file size in bytes (default: 10MB)
- `ALLOWED_FILE_TYPES`: Comma-separated list of allowed extensions
- `UPLOAD_DIR`: Directory for storing uploaded files

### Rate Limiting
- `RATE_LIMIT_WINDOW_MS`: Time window in milliseconds
- `RATE_LIMIT_MAX_REQUESTS`: Maximum requests per window

### CORS
- `CORS_ORIGIN`: Comma-separated list of allowed origins
- `CORS_CREDENTIALS`: Whether to allow credentials

### Logging & Monitoring
- `LOG_LEVEL`: Logging level (error, warn, info, debug)
- `LOG_FILE`: Path to log file
- `SENTRY_DSN`: Sentry DSN for error tracking
- `ANALYTICS_API_KEY`: Analytics service API key

### Message Queue
- `RABBITMQ_URL`: RabbitMQ connection URL
- `KAFKA_BROKERS`: Kafka broker addresses

### Feature Flags
Enable/disable features:
- `FEATURE_QUIZ_GENERATOR`
- `FEATURE_LESSON_PLANNER`
- `FEATURE_LEARNING_PATH`
- `FEATURE_RAG`
- `FEATURE_YOUTUBE_INTEGRATION`
- `FEATURE_LMS_INTEGRATION`

## Security Best Practices

1. **Never commit `.env` files** - They're in `.gitignore`
2. **Use strong secrets** - Generate random strings for JWT_SECRET, SESSION_SECRET, etc.
3. **Rotate keys regularly** - Especially in production
4. **Use different values** - Different secrets for development, staging, and production
5. **Limit access** - Only team members who need access should have `.env` files
6. **Use secret management** - For production, consider using AWS Secrets Manager, HashiCorp Vault, etc.

## Generating Secure Secrets

You can generate secure random strings using:

```bash
# Generate a random 32-character string
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Generate a random 64-character string
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

## Environment-Specific Files

You can create environment-specific files:
- `.env.development` - Development environment
- `.env.staging` - Staging environment
- `.env.production` - Production environment

Load them based on `NODE_ENV` value.

## Loading Environment Variables

In your Node.js application, use `dotenv` package:

```javascript
require('dotenv').config();
```

Or for ES modules:
```javascript
import dotenv from 'dotenv';
dotenv.config();
```

## Troubleshooting

- **Variables not loading?** Make sure `.env` is in the backend root directory
- **Wrong values?** Check for typos and ensure no extra spaces
- **Connection issues?** Verify database/Redis URLs are correct
- **API errors?** Confirm API keys are valid and have proper permissions




