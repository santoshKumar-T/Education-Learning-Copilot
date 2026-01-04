# API Middleware Architecture

## Overview

All API calls now go through a centralized middleware system that handles authentication, error handling, logging, and request/response transformation.

## Architecture

```
Frontend Components
       ↓
API Services (auth.api.js, chatbot.api.js, etc.)
       ↓
API Middleware (api.middleware.js)
       ↓
Backend API
```

## Middleware Components

### 1. Request Interceptor (`requestInterceptor`)
- **URL Normalization**: Ensures consistent API base URL
- **Authentication**: Automatically adds JWT token from localStorage
- **Headers**: Sets default Content-Type and Authorization headers
- **Request ID**: Generates unique request IDs for tracking
- **Credentials**: Handles CORS credentials

### 2. Response Interceptor (`responseInterceptor`)
- **JSON Parsing**: Automatically parses JSON responses
- **Error Detection**: Checks for non-OK responses
- **Standardization**: Returns consistent response format
- **Error Throwing**: Throws errors for failed requests

### 3. Error Handler (`errorHandler`)
- **Error Logging**: Logs all errors with context
- **Status Code Handling**: 
  - 401: Clears auth tokens (unauthorized)
  - 403: Access forbidden
  - 404: Resource not found
  - 500+: Server errors
- **Consistent Format**: Returns errors in standardized format

### 4. Logging Middleware (`loggingMiddleware`)
- **Request Logging**: Logs outgoing requests (in dev mode)
- **Response Logging**: Logs successful responses
- **Error Logging**: Logs errors with details
- **Performance Tracking**: Tracks request duration

## Usage

### Basic API Call

```javascript
import { api } from '../../middleware/api/index.js';

// GET request
const response = await api.get('/api/endpoint');
const data = response.data;

// POST request
const response = await api.post('/api/endpoint', { 
  key: 'value' 
});
```

### With Options

```javascript
// Skip authentication
const response = await api.get('/api/public-endpoint', { 
  skipAuth: true 
});

// Enable detailed logging
const response = await api.post('/api/endpoint', body, { 
  enableLogging: true 
});
```

### Authentication

```javascript
import { 
  isAuthenticated, 
  getAuthToken, 
  setAuthToken,
  getStoredUser 
} from '../../middleware/api/index.js';

// Check if authenticated
if (isAuthenticated()) {
  // User is logged in
}

// Get token
const token = getAuthToken();

// Get user
const user = getStoredUser();
```

## API Services

All API services have been refactored to use middleware:

### Auth API (`auth.api.js`)
- `register()` - User registration
- `login()` - User login
- `logout()` - User logout
- `getCurrentUser()` - Get current user
- `verifyToken()` - Verify JWT token

### Chatbot API (`chatbot.api.js`)
- `sendChatMessage()` - Send message to chatbot
- `createSession()` - Create new session
- `getSessionHistory()` - Get conversation history
- `checkChatbotHealth()` - Health check

### Session API (`session.api.js`)
- `getMySessions()` - Get user's sessions
- `getRecentSessions()` - Get recent sessions

### Quiz API (`quiz.api.js`)
- `generateQuiz()` - Generate quiz from topic
- `generateQuizFromConversation()` - Generate from chat history
- `validateQuizAnswers()` - Validate quiz answers

## Benefits

1. **Centralized Logic**: All API logic in one place
2. **Consistent Error Handling**: Standardized error format
3. **Automatic Authentication**: Tokens added automatically
4. **Better Logging**: Comprehensive request/response logging
5. **Easier Maintenance**: Changes in one place affect all APIs
6. **Type Safety**: Consistent response structure
7. **Performance Tracking**: Built-in duration tracking

## Response Format

### Success Response
```javascript
{
  data: { ... },           // Response data
  status: 200,            // HTTP status
  statusText: 'OK',       // Status text
  headers: Headers,      // Response headers
  config: { ... },        // Request config
  duration: 150           // Request duration (ms)
}
```

### Error Response
```javascript
{
  success: false,
  error: 'Error message',
  status: 400,
  data: { ... },
  config: { ... }
}
```

## Configuration

### Environment Variables
- `VITE_API_URL` - API base URL (default: `http://localhost:5000`)

### Middleware Options
- `skipAuth` - Skip authentication token injection
- `enableLogging` - Enable detailed logging
- `credentials` - CORS credentials (default: 'include')

## Migration Notes

All existing API services have been migrated to use middleware. The API remains the same from the component perspective, but now all requests go through the middleware layer.

## Future Enhancements

- Request retry logic
- Request caching
- Request queuing
- Rate limiting
- Request/response transformation hooks
- Custom interceptors

