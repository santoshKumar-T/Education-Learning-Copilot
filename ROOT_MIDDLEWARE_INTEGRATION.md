# Root Middleware Folder Integration

## Overview

The root-level `middleware` folder has been integrated into the backend middleware architecture. All middleware now follows the centralized architecture flow.

## Integration Status

### ✅ Integrated Middleware

The following middleware has been implemented and integrated into `backend/src/middleware/`:

#### 1. Logging Middleware ✅
- **Location**: `backend/src/middleware/logging/`
- **Files**:
  - `request-logger.middleware.js` - Logs all HTTP requests
  - `error-logger.middleware.js` - Centralized error logging
  - `performance-logger.middleware.js` - Performance metrics tracking
  - `index.js` - Export point
- **Status**: ✅ Integrated into `server.js`
- **Usage**: All requests are logged through middleware

#### 2. Rate Limiting Middleware ✅
- **Location**: `backend/src/middleware/rate-limiting/`
- **Files**:
  - `rate-limiter.middleware.js` - IP/user-based rate limiting
  - `index.js` - Export point
- **Status**: ✅ Integrated into `server.js`
- **Configuration**: Uses `RATE_LIMIT_WINDOW_MS` and `RATE_LIMIT_MAX_REQUESTS` from `.env`

#### 3. Monitoring Middleware ✅
- **Location**: `backend/src/middleware/monitoring/`
- **Files**:
  - `health-check.middleware.js` - Health check endpoints
  - `index.js` - Export point
- **Status**: ✅ Integrated into `server.js`
- **Endpoints**: `/health` and `/health/detailed`

### 📋 Placeholder Folders (Future Implementation)

The root `middleware` folder contains placeholder directories for future features:

#### 1. API Gateway (Not Yet Implemented)
- `middleware/api-gateway/circuit-breaker/` - Circuit breaker pattern
- `middleware/api-gateway/load-balancing/` - Load balancing
- `middleware/api-gateway/retry-logic/` - Retry logic
- `middleware/api-gateway/routing/` - Request routing

#### 2. Auth (Partially Implemented)
- ✅ `backend/src/middleware/auth/auth.middleware.js` - JWT validation (implemented)
- `middleware/auth/jwt-validator/` - Additional JWT validators (future)
- `middleware/auth/oauth-handler/` - OAuth handlers (future)
- `middleware/auth/permission-checker/` - Permission checking (future)
- `middleware/auth/session-manager/` - Session management (future)

#### 3. Message Queue (Not Yet Implemented)
- `middleware/message-queue/config/` - Queue configuration
- `middleware/message-queue/consumers/` - Message consumers
- `middleware/message-queue/handlers/` - Message handlers
- `middleware/message-queue/producers/` - Message producers

## Current Middleware Architecture

### Backend Middleware Structure

```
backend/src/middleware/
├── auth/
│   └── auth.middleware.js          ✅ JWT authentication
├── database/
│   ├── database.middleware.js      ✅ Database operations
│   └── index.js
├── logging/
│   ├── request-logger.middleware.js    ✅ Request logging
│   ├── error-logger.middleware.js      ✅ Error logging
│   ├── performance-logger.middleware.js ✅ Performance tracking
│   └── index.js
├── rate-limiting/
│   ├── rate-limiter.middleware.js  ✅ Rate limiting
│   └── index.js
└── monitoring/
    ├── health-check.middleware.js   ✅ Health checks
    └── index.js
```

### Middleware Execution Order

```
1. CORS Middleware
2. Body Parsing (express.json, express.urlencoded)
3. Request Logger (from middleware/logging)
4. Performance Logger (from middleware/logging)
5. Rate Limiter (from middleware/rate-limiting)
6. Routes
7. Error Logger (from middleware/logging)
8. Error Handler
```

## Integration with Architecture Flow

All middleware follows the architecture flow:

```
Request → Logging Middleware → Rate Limiting → Routes → Controllers → Services → Database Middleware → DB
```

### Example Flow with All Middleware:

```
1. HTTP Request arrives
   ↓
2. Request Logger Middleware
   - Logs request details
   ↓
3. Performance Logger Middleware
   - Tracks request duration
   ↓
4. Rate Limiter Middleware
   - Checks rate limits
   ↓
5. Route Handler
   ↓
6. Controller
   ↓
7. Service (uses Database Middleware)
   ↓
8. Database Middleware
   - Connection check
   - Operation logging
   - Error handling
   ↓
9. MongoDB
   ↓
10. Response flows back
    ↓
11. Error Logger (if error)
    ↓
12. Response sent
```

## Configuration

### Environment Variables

All middleware uses environment variables from `.env`:

```env
# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000      # 15 minutes
RATE_LIMIT_MAX_REQUESTS=100      # Max requests per window

# Logging
LOG_LEVEL=info                   # Log level
LOG_FILE=./logs/app.log         # Log file path

# Monitoring
NODE_ENV=development            # Environment
```

## Usage Examples

### Request Logging
All requests are automatically logged:
```
🌐 [2026-01-04T14:30:00.000Z] POST /api/auth/register
   IP: 127.0.0.1
   User-Agent: Mozilla/5.0...
   Body: [Sensitive data - not logged]
   ✅ POST /api/auth/register - 200 (45ms)
```

### Rate Limiting
Rate limits are automatically enforced:
- Default: 100 requests per 15 minutes per IP/user
- Returns 429 status with retry information
- Headers: `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`

### Health Checks
```bash
# Basic health check
GET /health

# Detailed health check
GET /health/detailed
```

### Performance Metrics
Access performance metrics:
```javascript
import { getPerformanceMetrics } from './middleware/logging/index.js';

const metrics = getPerformanceMetrics();
// Returns: { requests, avgDuration, minDuration, maxDuration, errors }
```

## Future Enhancements

The placeholder folders in the root `middleware` directory can be implemented as needed:

1. **API Gateway**: Circuit breakers, load balancing, retry logic
2. **Advanced Auth**: OAuth handlers, permission checking
3. **Message Queue**: RabbitMQ/Kafka integration
4. **Advanced Monitoring**: Alert managers, metrics collectors

## Summary

✅ **All middleware is now in `backend/src/middleware/`**
✅ **All middleware follows the architecture flow**
✅ **Logging, rate limiting, and monitoring are integrated**
✅ **Database operations go through database middleware**
✅ **All requests go through logging and rate limiting middleware**

The root `middleware` folder structure is preserved for future implementations, but all active middleware is in `backend/src/middleware/` following the established architecture.

