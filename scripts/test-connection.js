/**
 * MongoDB Connection Test Script
 * Tests if we can connect to the MongoDB server
 */

const { MongoClient } = require('mongodb');

const uri = process.env.MONGODB_URI || 'mongodb://root:AD5Db8zE1N0R1bs0LZEfU1winw7QvEzkAYp4Gt2AEIcvhrtVmir5PqcOS826vNtM@66.179.240.208:5444/noc-reports?directConnection=true';

async function testConnection() {
  console.log('🔍 Testing MongoDB connection...\n');
  
  const client = new MongoClient(uri, {
    serverSelectionTimeoutMS: 5000,
  });

  try {
    // Connect to MongoDB
    await client.connect();
    console.log('✅ Successfully connected to MongoDB!\n');

    // Get database info
    const adminDb = client.db().admin();
    const serverInfo = await adminDb.serverInfo();
    
    console.log('📊 Server Information:');
    console.log('  Version:', serverInfo.version);
    console.log('  Git Version:', serverInfo.gitVersion);
    
    // Test database access
    const db = client.db('noc-reports');
    console.log('\n📚 Database: noc-reports');
    
    // List collections
    const collections = await db.listCollections().toArray();
    console.log('  Collections:', collections.length || 'None yet');
    
    if (collections.length > 0) {
      collections.forEach(col => {
        console.log('    -', col.name);
      });
    }
    
    // Test write operation
    console.log('\n🧪 Testing write operation...');
    const testCollection = db.collection('connection_test');
    const result = await testCollection.insertOne({
      test: true,
      timestamp: new Date(),
      message: 'Connection test successful'
    });
    console.log('  ✅ Write successful! ID:', result.insertedId);
    
    // Clean up test data
    await testCollection.deleteOne({ _id: result.insertedId });
    console.log('  🧹 Cleaned up test data\n');
    
    console.log('✨ MongoDB is ready to use!\n');
    
  } catch (error) {
    console.error('❌ Connection failed!');
    console.error('Error:', error.message);
    console.error('\n💡 Troubleshooting:');
    console.error('  1. Verify MongoDB server is running');
    console.error('  2. Check connection string in .env.local');
    console.error('  3. Verify network access and firewall settings');
    console.error('  4. Check username and password are correct\n');
    process.exit(1);
  } finally {
    await client.close();
  }
}

testConnection();


