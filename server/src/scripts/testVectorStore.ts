import dotenv from 'dotenv';
import { initializeVectorStore, retrieveRelevantDocs, getContextForQuery } from '../services/vectorService.js';

// Load environment variables
dotenv.config();

/**
 * Test script to verify vector store functionality
 * Run with: npx tsx src/scripts/testVectorStore.ts
 */
async function testVectorStore() {
  console.log('🧪 Testing Vector Store...\n');

  try {
    // Initialize the vector store
    console.log('Step 1: Initializing vector store...');
    await initializeVectorStore();
    console.log('✅ Vector store initialized\n');

    // Test queries
    const testQueries = [
      'What credit cards do you offer?',
      'Tell me about cash back cards',
      'What are the fees for personal loans?',
      'How do I apply for a credit card?',
    ];

    for (const query of testQueries) {
      console.log('─'.repeat(80));
      console.log(`\n📝 Query: "${query}"\n`);

      // Test 1: Retrieve relevant documents
      console.log('Retrieving relevant documents...');
      const docs = await retrieveRelevantDocs(query, 3);
      console.log(`Found ${docs.length} relevant documents:\n`);

      docs.forEach((doc, index) => {
        console.log(`Document ${index + 1}:`);
        console.log(`  Category: ${doc.metadata.category}`);
        console.log(`  File: ${doc.metadata.fileName}`);
        console.log(`  Preview: ${doc.pageContent.substring(0, 150)}...`);
        console.log();
      });

      // Test 2: Get formatted context
      console.log('Getting formatted context...');
      const context = await getContextForQuery(query);
      console.log('\nFormatted Context Preview:');
      console.log(context.substring(0, 300) + '...\n');
    }

    console.log('─'.repeat(80));
    console.log('\n✅ All tests completed successfully!\n');
  } catch (error) {
    console.error('\n❌ Test failed:', error);
    process.exit(1);
  }
}

// Run the test
testVectorStore();
