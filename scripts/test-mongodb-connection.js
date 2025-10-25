/**
 * Test MongoDB Cloud Connection
 * 
 * This script tests the MongoDB connection and initializes the database
 */

const { MongoClient } = require('mongodb');

const uri = 'mongodb://root:AD5Db8zE1N0R1bs0LZEfU1winw7QvEzkAYp4Gt2AEIcvhrtVmir5PqcOS826vNtM@66.179.240.208:5444/?directConnection=true';
const dbName = 'noc-reports';

async function testConnection() {
  console.log('🔍 Testing MongoDB connection...\n');
  
  const client = new MongoClient(uri, {
    serverSelectionTimeoutMS: 5000,
  });

  try {
    // Connect to MongoDB
    await client.connect();
    console.log('✅ Successfully connected to MongoDB!\n');

    // Test database access
    const db = client.db(dbName);
    console.log(`📊 Database: ${dbName}\n`);

    // List existing collections
    const collections = await db.listCollections().toArray();
    console.log(`📦 Collections (${collections.length}):`);
    if (collections.length > 0) {
      collections.forEach(col => {
        console.log(`   - ${col.name}`);
      });
    } else {
      console.log('   (No collections yet - will be created during initialization)');
    }

    // Test write operation
    console.log('\n📝 Testing write operation...');
    const testCollection = db.collection('_connection_test');
    await testCollection.insertOne({ 
      test: true, 
      timestamp: new Date(),
      message: 'Connection test successful' 
    });
    console.log('✅ Write operation successful');

    // Test read operation
    console.log('📖 Testing read operation...');
    const doc = await testCollection.findOne({ test: true });
    if (doc) {
      console.log('✅ Read operation successful');
    }

    // Clean up test collection
    await testCollection.drop();
    console.log('🧹 Cleaned up test collection\n');

    // Show server info
    const admin = client.db().admin();
    const serverInfo = await admin.serverInfo();
    console.log('🖥️  Server Information:');
    console.log(`   Version: ${serverInfo.version}`);
    console.log(`   Platform: ${serverInfo.os.type} ${serverInfo.os.name}`);
    console.log(`   Architecture: ${serverInfo.os.architecture}\n`);

    console.log('🎉 MongoDB connection is fully functional!\n');
    console.log('Next steps:');
    console.log('1. Run: node scripts/init-mongodb-cloud.js');
    console.log('2. This will create all required collections and indexes');

  } catch (error) {
    console.error('❌ Connection failed!');
    console.error('Error:', error.message);
    console.error('\n💡 Troubleshooting:');
    console.error('   1. Check if MongoDB server is running');
    console.error('   2. Verify the connection string');
    console.error('   3. Check network connectivity');
    console.error('   4. Verify credentials are correct');
    process.exit(1);
  } finally {
    await client.close();
  }
}

testConnection();


