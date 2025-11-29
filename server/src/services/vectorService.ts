import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';
import { MemoryVectorStore } from '@langchain/classic/vectorstores/memory';
import { OpenAIEmbeddings } from '@langchain/openai';
import { Document } from '@langchain/core/documents';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs/promises';

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
 * Recursively find all markdown files in a directory
 */
async function findMarkdownFiles(dir: string): Promise<string[]> {
  const files: string[] = [];

  async function walk(currentPath: string) {
    const entries = await fs.readdir(currentPath, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(currentPath, entry.name);

      if (entry.isDirectory()) {
        await walk(fullPath);
      } else if (entry.isFile() && entry.name.endsWith('.md')) {
        files.push(fullPath);
      }
    }
  }

  await walk(dir);
  return files;
}

/**
 * Load a markdown file and create a Document
 */
async function loadMarkdownFile(filePath: string): Promise<Document> {
  const content = await fs.readFile(filePath, 'utf-8');
  const fileName = path.basename(filePath, '.md');
  const category = path.dirname(filePath).split(path.sep).pop() || 'general';

  return new Document({
    pageContent: content,
    metadata: {
      source: filePath,
      fileName,
      category,
    },
  });
}

/**
 * Initialize the vector store by loading and embedding all documents
 * This function is called once when the server starts
 */
export async function initializeVectorStore(): Promise<void> {
  try {
    console.log('🔄 Initializing vector store...');
    console.log(`📂 Loading documents from: ${VECTOR_CONFIG.docsPath}`);

    // Find all markdown files
    const markdownFiles = await findMarkdownFiles(VECTOR_CONFIG.docsPath);
    console.log(`📄 Found ${markdownFiles.length} markdown files`);

    if (markdownFiles.length === 0) {
      console.warn('⚠️  No markdown files found in docs directory');
      return;
    }

    // Load all markdown files
    const docs = await Promise.all(markdownFiles.map(loadMarkdownFile));
    console.log(`📚 Loaded ${docs.length} documents`);

    // Split documents into chunks for better retrieval
    const textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: VECTOR_CONFIG.chunkSize,
      chunkOverlap: VECTOR_CONFIG.chunkOverlap,
    });

    const splitDocs = await textSplitter.splitDocuments(docs);
    console.log(`✂️  Split into ${splitDocs.length} chunks`);

    // Create embeddings and store in memory vector store
    const embeddings = new OpenAIEmbeddings({
      openAIApiKey: process.env.OPENAI_API_KEY,
      modelName: 'text-embedding-3-small', // Cost-effective embedding model
    });

    vectorStore = await MemoryVectorStore.fromDocuments(splitDocs, embeddings);
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

/**
 * Initialize vector store if not already initialized (for serverless environments)
 * This function checks if the vector store exists and initializes it only if needed
 */
export async function initializeVectorStoreIfNeeded(): Promise<void> {
  if (vectorStore !== null) {
    console.log('✅ Vector store already initialized, reusing cached instance');
    return;
  }

  console.log('🔄 Vector store not initialized, initializing now...');
  await initializeVectorStore();
}
