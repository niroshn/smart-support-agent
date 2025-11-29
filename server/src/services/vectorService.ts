import { DirectoryLoader } from 'langchain/document_loaders/fs/directory';
import { TextLoader } from 'langchain/document_loaders/fs/text';
import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';
import { MemoryVectorStore } from 'langchain/vectorstores/memory';
import { OpenAIEmbeddings } from '@langchain/openai';
import { Document } from '@langchain/core/documents';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Vector store instance - initialized once and reused
 */
let vectorStore: MemoryVectorStore | null = null;

/**
 * Configuration for document processing
 */
const VECTOR_CONFIG = {
  // Chunk size for splitting documents
  chunkSize: 1000,
  chunkOverlap: 200,
  // Number of documents to retrieve
  topK: 4,
  // Docs directory path (relative to project root)
  docsPath: path.join(__dirname, '../../../docs'),
};

/**
 * Initialize the vector store by loading and embedding all documents
 * This function is called once when the server starts
 */
export async function initializeVectorStore(): Promise<void> {
  try {
    console.log('🔄 Initializing vector store...');
    console.log(`📂 Loading documents from: ${VECTOR_CONFIG.docsPath}`);

    // Load all markdown files from the docs directory
    const loader = new DirectoryLoader(VECTOR_CONFIG.docsPath, {
      '.md': (filePath: string) => new TextLoader(filePath),
    });

    const docs = await loader.load();
    console.log(`📄 Loaded ${docs.length} documents`);

    if (docs.length === 0) {
      console.warn('⚠️  No documents found in docs directory');
      return;
    }

    // Split documents into chunks for better retrieval
    const textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: VECTOR_CONFIG.chunkSize,
      chunkOverlap: VECTOR_CONFIG.chunkOverlap,
    });

    const splitDocs = await textSplitter.splitDocuments(docs);
    console.log(`✂️  Split into ${splitDocs.length} chunks`);

    // Add metadata to chunks for better context
    const enrichedDocs = splitDocs.map((doc) => {
      const fileName = path.basename(doc.metadata.source, '.md');
      const category = path.dirname(doc.metadata.source).split(path.sep).pop();

      return new Document({
        pageContent: doc.pageContent,
        metadata: {
          ...doc.metadata,
          fileName,
          category,
        },
      });
    });

    // Create embeddings and store in memory vector store
    const embeddings = new OpenAIEmbeddings({
      openAIApiKey: process.env.OPENAI_API_KEY,
      modelName: 'text-embedding-3-small', // Cost-effective embedding model
    });

    vectorStore = await MemoryVectorStore.fromDocuments(enrichedDocs, embeddings);
    console.log('✅ Vector store initialized successfully');
  } catch (error) {
    console.error('❌ Failed to initialize vector store:', error);
    throw error;
  }
}

/**
 * Retrieve relevant documents for a given query
 * @param query - The user's question
 * @param k - Number of documents to retrieve (default: 4)
 * @returns Array of relevant documents with metadata
 */
export async function retrieveRelevantDocs(
  query: string,
  k: number = VECTOR_CONFIG.topK,
): Promise<Document[]> {
  if (!vectorStore) {
    throw new Error('Vector store not initialized. Call initializeVectorStore() first.');
  }

  try {
    // Perform similarity search
    const relevantDocs = await vectorStore.similaritySearch(query, k);
    return relevantDocs;
  } catch (error) {
    console.error('Error retrieving documents:', error);
    return [];
  }
}

/**
 * Get formatted context from retrieved documents
 * @param query - The user's question
 * @returns Formatted string containing relevant document content
 */
export async function getContextForQuery(query: string): Promise<string> {
  const docs = await retrieveRelevantDocs(query);

  if (docs.length === 0) {
    return 'No relevant information found in the knowledge base.';
  }

  // Format documents into a readable context string
  const context = docs
    .map((doc, index) => {
      const category = doc.metadata.category || 'general';
      const fileName = doc.metadata.fileName || 'unknown';
      return `[Source ${index + 1}: ${category}/${fileName}]\n${doc.pageContent}`;
    })
    .join('\n\n---\n\n');

  return context;
}

/**
 * Get vector store statistics
 */
export function getVectorStoreStats(): {
  initialized: boolean;
  documentCount?: number;
} {
  return {
    initialized: vectorStore !== null,
    documentCount: vectorStore ? (vectorStore as any).memoryVectors?.length : 0,
  };
}
