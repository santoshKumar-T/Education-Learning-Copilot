# PDF Ingestion Guide

## Overview

This guide explains how to ingest PDF documents into the Qdrant vector database for RAG (Retrieval-Augmented Generation) functionality.

## Prerequisites

1. **Qdrant configured** - See `QDRANT_SETUP.md`
2. **OpenAI API key** - Required for generating embeddings
3. **PDF file** - The document you want to ingest

## Quick Start

### Step 1: Ensure Environment Variables are Set

Make sure your `backend/.env` file contains:

```env
# Qdrant Configuration
QDRANT_URL=https://your-cluster-endpoint.qdrant.io
QDRANT_API_KEY=your_qdrant_api_key_here
QDRANT_COLLECTION_NAME=education_copilot
QDRANT_VECTOR_SIZE=1536

# OpenAI Configuration
OPENAI_API_KEY=sk-your_openai_api_key_here

# Optional: Chunking Configuration
CHUNK_SIZE=1000
CHUNK_OVERLAP=200
```

### Step 2: Run the Ingestion Script

```bash
cd backend
npm run ingest-pdf ../../docs/GDPR_FINAL_EPSU.pdf
```

Or use the direct path:

```bash
cd backend
node src/scripts/ingest-pdf.js ../docs/GDPR_FINAL_EPSU.pdf
```

## What the Script Does

1. **Extracts Text**: Parses the PDF and extracts all text content
2. **Cleans Text**: Removes excessive whitespace and normalizes the text
3. **Chunks Text**: Splits the text into smaller pieces (default: 1000 characters with 200 overlap)
4. **Generates Embeddings**: Creates vector embeddings for each chunk using OpenAI
5. **Stores Vectors**: Uploads all vectors to Qdrant with metadata
6. **Verifies Storage**: Confirms the vectors were stored successfully

## Configuration Options

### Chunk Size

Control how large each text chunk is:

```env
CHUNK_SIZE=1000  # Characters per chunk (default: 1000)
CHUNK_OVERLAP=200  # Overlap between chunks (default: 200)
```

**Recommendations:**
- **Small chunks (500-800)**: Better for precise retrieval, more chunks
- **Medium chunks (1000-1500)**: Balanced approach (default)
- **Large chunks (2000+)**: Better context, fewer chunks

### Collection Name

Specify which Qdrant collection to use:

```env
QDRANT_COLLECTION_NAME=education_copilot
```

## Expected Output

```
============================================================
📄 PDF Document Ingestion to Vector Database
============================================================

📋 Validating configurations...
✅ All configurations valid

📂 PDF File: /path/to/GDPR_FINAL_EPSU.pdf

📖 Step 1: Extracting text from PDF...
✅ Text extracted: 125430 characters

🧹 Step 2: Cleaning text...
✅ Text cleaned: 124890 characters

✂️  Step 3: Chunking text...
✅ Text chunked into 125 pieces
   Chunk size: 1000 characters
   Overlap: 200 characters

📦 Step 4: Ensuring collection "education_copilot" exists...
✅ Collection ready

🧠 Step 5: Generating embeddings...
   📊 Generating embeddings for batch 1/2 (100 texts)
   📊 Generating embeddings for batch 2/2 (25 texts)
✅ Generated 125 embeddings
   Vector size: 1536 dimensions

📝 Step 6: Preparing vectors for storage...
✅ Prepared 125 points

💾 Step 7: Storing vectors in Qdrant collection "education_copilot"...
   📤 Uploading batch 1/2 (100 vectors)...
   📤 Uploading batch 2/2 (25 vectors)...
✅ All vectors stored successfully

🔍 Step 8: Verifying storage...
✅ Collection info:
   Name: education_copilot
   Vectors count: 125
   Points count: 125

============================================================
✅ PDF INGESTION COMPLETED SUCCESSFULLY!
============================================================

📊 Summary:
   PDF File: GDPR_FINAL_EPSU.pdf
   Text Length: 124890 characters
   Chunks Created: 125
   Vectors Stored: 125
   Collection: education_copilot
   Total Vectors in Collection: 125

💡 The document is now searchable in your vector database!
```

## Troubleshooting

### Error: "PDF file not found"

**Solution**: Check the file path. Use absolute path or relative path from the script location.

```bash
# Use absolute path
node src/scripts/ingest-pdf.js /absolute/path/to/file.pdf

# Or relative path from backend directory
node src/scripts/ingest-pdf.js ../docs/file.pdf
```

### Error: "QDRANT_URL is not set"

**Solution**: Add Qdrant configuration to your `.env` file. See `QDRANT_SETUP.md`.

### Error: "OPENAI_API_KEY is not set"

**Solution**: Add your OpenAI API key to `.env`:

```env
OPENAI_API_KEY=sk-your-actual-api-key
```

### Error: "Failed to generate embedding"

**Possible causes:**
- Invalid OpenAI API key
- Rate limit exceeded
- Network connectivity issues

**Solutions:**
- Verify API key is correct
- Wait a few minutes and try again
- Check network connection

### Error: "Failed to upsert vectors"

**Possible causes:**
- Qdrant cluster is down
- Invalid API key
- Collection doesn't exist

**Solutions:**
- Run `npm run verify-qdrant` to test connection
- Check Qdrant cluster status
- Verify API key permissions

## Advanced Usage

### Ingest Multiple PDFs

Create a simple script to ingest multiple files:

```javascript
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

const pdfs = [
  '../docs/GDPR_FINAL_EPSU.pdf',
  '../docs/another-document.pdf',
];

for (const pdf of pdfs) {
  console.log(`Ingesting ${pdf}...`);
  await execAsync(`node src/scripts/ingest-pdf.js ${pdf}`);
}
```

### Custom Metadata

The script automatically adds metadata to each vector:
- `source`: PDF filename
- `chunk_index`: Position in document
- `total_chunks`: Total number of chunks
- `document_type`: Always "pdf"
- `ingested_at`: Timestamp

You can modify `ingest-pdf.js` to add custom metadata.

## Next Steps

After ingesting PDFs:

1. **Test Search**: Use the Qdrant service to search for similar content
2. **Integrate RAG**: Use retrieved vectors in your chatbot for context-aware responses
3. **Monitor Usage**: Track embedding generation costs and Qdrant storage

## Cost Considerations

- **OpenAI Embeddings**: ~$0.0001 per 1K tokens
- **Qdrant Storage**: Depends on your plan
- **Example**: A 100-page PDF (~50K tokens) costs ~$0.005 for embeddings

## Best Practices

1. **Chunk Size**: Start with 1000 characters, adjust based on your use case
2. **Overlap**: Use 10-20% overlap to maintain context between chunks
3. **Batch Processing**: The script processes embeddings in batches to avoid rate limits
4. **Collection Organization**: Use different collections for different document types
5. **Regular Updates**: Re-ingest documents when they're updated

## Support

For issues or questions:
1. Check the error message in the script output
2. Verify all environment variables are set correctly
3. Test Qdrant connection with `npm run verify-qdrant`
4. Check OpenAI API key and quota

