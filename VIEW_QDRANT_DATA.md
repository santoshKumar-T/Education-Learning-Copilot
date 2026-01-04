# Viewing Your PDF Data in Qdrant

## Overview

After ingesting your PDF into Qdrant, you have several options to view and explore your data:

## Option 1: Command Line Viewer (Quick View)

Use the built-in script to view your data:

```bash
cd backend
npm run view-qdrant
```

Or specify a collection name:

```bash
npm run view-qdrant my-vector-db
```

This will show:
- Collection information (name, vector count, etc.)
- Sample documents with text previews
- Metadata (source file, chunk index, timestamps)
- Statistics

## Option 2: Qdrant Cloud Dashboard (Recommended)

If you're using **Qdrant Cloud**, you have access to a web-based dashboard:

1. **Log in to Qdrant Cloud**: https://cloud.qdrant.io
2. **Select your cluster**
3. **Navigate to Collections** in the sidebar
4. **Click on your collection** (e.g., `my-vector-db` or `education_copilot`)
5. **View Points** - You'll see all your ingested vectors with:
   - Point IDs
   - Payload data (text, source, metadata)
   - Vector dimensions
   - Timestamps

### Features in Qdrant Cloud Dashboard:
- ✅ Browse all points in your collection
- ✅ Search and filter points
- ✅ View payload data (your PDF text chunks)
- ✅ See vector information
- ✅ Test similarity searches
- ✅ Monitor collection statistics

## Option 3: Qdrant REST API

You can query your data directly using the Qdrant REST API:

### Get Collection Info
```bash
curl -X GET "https://your-cluster.qdrant.io/collections/my-vector-db" \
  -H "api-key: your-api-key"
```

### Scroll Through Points
```bash
curl -X POST "https://your-cluster.qdrant.io/collections/my-vector-db/points/scroll" \
  -H "api-key: your-api-key" \
  -H "Content-Type: application/json" \
  -d '{
    "limit": 10,
    "with_payload": true,
    "with_vectors": false
  }'
```

### Search Similar Vectors
```bash
curl -X POST "https://your-cluster.qdrant.io/collections/my-vector-db/points/search" \
  -H "api-key: your-api-key" \
  -H "Content-Type: application/json" \
  -d '{
    "vector": [0.1, 0.2, ...],  # Your query vector
    "limit": 5,
    "with_payload": true
  }'
```

## Option 4: Build a Custom Dashboard (Future)

You can create a custom web interface to:
- Search your PDF content
- Display chunks with context
- Show similarity search results
- Visualize vector relationships

## Quick Reference

### Your Collection Details:
- **Collection Name**: Check your `.env` file (`QDRANT_COLLECTION_NAME`)
- **Vector Size**: 1536 (OpenAI embeddings)
- **Distance Metric**: Cosine
- **Total Points**: Run `npm run view-qdrant` to see current count

### Finding Your Qdrant URL:
Check your `backend/.env` file:
```env
QDRANT_URL=https://your-cluster-endpoint.qdrant.io
QDRANT_API_KEY=your-api-key
QDRANT_COLLECTION_NAME=my-vector-db
```

## Troubleshooting

### "Collection not found"
- Verify the collection name in your `.env` file
- Run `npm run verify-qdrant` to test connection
- Check if the ingestion completed successfully

### "Cannot access dashboard"
- If using Qdrant Cloud, ensure you're logged in
- Verify your API key has proper permissions
- Check your cluster is running

### "No data shown"
- Verify the PDF ingestion completed: `npm run ingest-pdf`
- Check collection name matches in `.env`
- Use `npm run view-qdrant` to verify data exists

## Next Steps

1. **View your data**: Use `npm run view-qdrant` or Qdrant Cloud dashboard
2. **Search content**: Use similarity search to find relevant sections
3. **Integrate with RAG**: Use the vectors in your chatbot for context-aware responses

## Example: Viewing Your GDPR PDF

After ingesting `GDPR_FINAL_EPSU.pdf`, you can:

1. **View in terminal**:
   ```bash
   cd backend
   npm run view-qdrant
   ```

2. **View in Qdrant Cloud**:
   - Go to https://cloud.qdrant.io
   - Select your cluster
   - Open the collection
   - Browse the 98 chunks from your PDF

3. **Search for specific topics**:
   - Use the search feature in Qdrant Cloud
   - Or build a search query using the API

Your PDF is now fully searchable and ready for RAG integration! 🎉

