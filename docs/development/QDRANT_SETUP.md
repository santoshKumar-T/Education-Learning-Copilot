# Qdrant Vector Database Setup

## Overview

Qdrant is a vector database used for storing and searching embeddings. This guide helps you set up and verify your Qdrant connection.

## Prerequisites

1. Qdrant cluster endpoint URL
2. Qdrant API key
3. Node.js installed

## Setup Steps

### 1. Install Dependencies

```bash
cd backend
npm install
```

This will install `@qdrant/js-client-rest` package.

### 2. Configure Environment Variables

Add the following to your `backend/.env` file:

```env
# Qdrant Vector Database Configuration
QDRANT_URL=https://your-cluster-endpoint.qdrant.io
QDRANT_API_KEY=your_qdrant_api_key_here
QDRANT_COLLECTION_NAME=education_copilot
QDRANT_VECTOR_SIZE=1536
```

**Where to find these values:**
- **QDRANT_URL**: Your Qdrant cluster endpoint (e.g., `https://xyz-123.us-east-1-1.aws.cloud.qdrant.io`)
- **QDRANT_API_KEY**: Your API key from Qdrant dashboard
- **QDRANT_COLLECTION_NAME**: Name for your collection (default: `education_copilot`)
- **QDRANT_VECTOR_SIZE**: Vector dimension size (1536 for OpenAI embeddings)

### 3. Verify Connection

Run the verification script:

```bash
cd backend
npm run verify-qdrant
```

Or directly:

```bash
cd backend
node src/scripts/verify-qdrant.js
```

## What the Verification Script Tests

1. **Configuration Check**: Validates that all required environment variables are set
2. **Connection Test**: Tests connection to Qdrant cluster
3. **Collection Check**: Checks if the specified collection exists
4. **Collection Creation**: Tests creating a collection (with cleanup)
5. **Vector Operations**: Tests inserting, retrieving, and searching vectors

## Expected Output

### Success Output

```
============================================================
🔍 Qdrant Vector Database Connection Verification
============================================================

📋 Checking configuration...
✅ Configuration valid
   URL: https://your-cluster.qdrant.io
   API Key: xxxxxx...xxxx
   Collection: education_copilot
   Vector Size: 1536

🔌 Creating Qdrant client...

📡 Test 1: Getting cluster information...
✅ Successfully connected to Qdrant!
   Collections found: 2

   Existing collections:
   1. education_copilot (150 vectors)
   2. test_collection (50 vectors)

📚 Test 2: Checking collection "education_copilot"...
✅ Collection exists!
   Name: education_copilot
   Vectors Count: 150
   Points Count: 150
   Vector Size: 1536

🧪 Test 3: Testing collection creation...
✅ Successfully created test collection: test_1234567890
   Cleaning up test collection...
✅ Test collection deleted

🧪 Test 4: Testing vector operations...
✅ Successfully inserted test vector
✅ Successfully retrieved test vector
   Retrieved points: 1
✅ Successfully performed vector search
   Search results: 1 points found
✅ Test collection cleaned up

============================================================
✅ QDRANT CONNECTION VERIFICATION SUCCESSFUL!
============================================================

📊 Summary:
   ✅ Connection: Working
   ✅ Authentication: Valid
   ✅ Permissions: Sufficient
   ✅ Vector Operations: Functional

💡 Your Qdrant database is ready to use!
```

### Error Output

If there's an issue, you'll see:

```
============================================================
❌ QDRANT CONNECTION VERIFICATION FAILED
============================================================

🔍 Error Details:
   Type: Error
   Message: Connection refused

💡 Troubleshooting:
   1. Check QDRANT_URL in .env file
   2. Verify QDRANT_API_KEY is correct
   3. Ensure your Qdrant cluster is running
   4. Check network connectivity to Qdrant endpoint
   5. Verify API key has proper permissions
```

## Common Issues

### Issue 1: "QDRANT_URL is not set"
**Solution**: Add `QDRANT_URL` to your `.env` file

### Issue 2: "QDRANT_API_KEY is not set"
**Solution**: Add `QDRANT_API_KEY` to your `.env` file

### Issue 3: "Connection refused" or "Network error"
**Solutions**:
- Verify the URL is correct (should start with `https://`)
- Check if the cluster is running
- Verify network connectivity
- Check firewall settings

### Issue 4: "401 Unauthorized"
**Solutions**:
- Verify API key is correct
- Check if API key has expired
- Ensure API key has proper permissions

### Issue 5: "404 Not Found" (for collection)
**Solution**: This is normal if the collection doesn't exist yet. It will be created automatically when needed.

## Next Steps

Once verification is successful:

1. **Use Qdrant in your application**: The configuration is ready
2. **Create collections**: Collections will be created automatically when needed
3. **Store embeddings**: Use the Qdrant client to store and search vectors
4. **Integrate with RAG**: Use Qdrant for Retrieval-Augmented Generation

## Example Usage in Code

```javascript
import { QdrantClient } from '@qdrant/js-client-rest';
import { getQdrantClientConfig } from '../config/qdrant.js';

const clientConfig = getQdrantClientConfig();
const client = new QdrantClient({
  url: clientConfig.url,
  apiKey: clientConfig.apiKey,
});

// Create collection
await client.createCollection('my_collection', {
  vectors: {
    size: 1536,
    distance: 'Cosine',
  },
});

// Insert vector
await client.upsert('my_collection', {
  points: [{
    id: 1,
    vector: [0.1, 0.2, ...], // 1536-dimensional vector
    payload: { text: 'Sample document' },
  }],
});

// Search vectors
const results = await client.search('my_collection', {
  vector: [0.1, 0.2, ...],
  limit: 5,
});
```

## Support

If you encounter issues:
1. Check the error message in the verification output
2. Verify your `.env` file has correct values
3. Test your Qdrant cluster from Qdrant dashboard
4. Check Qdrant documentation: https://qdrant.tech/documentation/

