/**
 * Initialize MongoDB Cloud Database
 * 
 * This script creates collections and indexes for the NOC Reports application
 */

const { MongoClient } = require('mongodb');

const uri = 'mongodb://root:AD5Db8zE1N0R1bs0LZEfU1winw7QvEzkAYp4Gt2AEIcvhrtVmir5PqcOS826vNtM@66.179.240.208:5444/?directConnection=true';
const dbName = 'noc-reports';

async function initializeDatabase() {
  console.log('🚀 Initializing NOC Reports Database...\n');
  
  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log('✅ Connected to MongoDB\n');

    const db = client.db(dbName);
    console.log(`📊 Database: ${dbName}\n`);

    // Create Users Collection with Indexes
    console.log('👤 Setting up users collection...');
    const usersCollection = db.collection('users');
    
    try {
      await usersCollection.createIndex({ email: 1 }, { unique: true, name: 'email_unique' });
      console.log('   ✅ Created unique index on email');
      
      await usersCollection.createIndex({ microsoftId: 1 }, { unique: true, name: 'microsoftId_unique' });
      console.log('   ✅ Created unique index on microsoftId');
      
      await usersCollection.createIndex({ lastLogin: -1 }, { name: 'lastLogin_desc' });
      console.log('   ✅ Created index on lastLogin');
    } catch (e) {
      if (e.code === 85 || e.code === 11000) {
        console.log('   ℹ️  Indexes already exist');
      } else {
        throw e;
      }
    }

    // Create Reports Collection with Indexes
    console.log('\n📝 Setting up reports collection...');
    const reportsCollection = db.collection('reports');
    
    try {
      await reportsCollection.createIndex({ userId: 1, date: -1 }, { name: 'userId_date' });
      console.log('   ✅ Created compound index on userId and date');
      
      await reportsCollection.createIndex({ 'entries.emailId': 1 }, { name: 'entries_emailId' });
      console.log('   ✅ Created index on entries.emailId');
      
      await reportsCollection.createIndex({ createdAt: -1 }, { name: 'createdAt_desc' });
      console.log('   ✅ Created index on createdAt');
      
      await reportsCollection.createIndex({ updatedAt: -1 }, { name: 'updatedAt_desc' });
      console.log('   ✅ Created index on updatedAt');
    } catch (e) {
      if (e.code === 85 || e.code === 11000) {
        console.log('   ℹ️  Indexes already exist');
      } else {
        throw e;
      }
    }

    // Create Email Cache Collection with Indexes
    console.log('\n📧 Setting up email_cache collection...');
    const emailCacheCollection = db.collection('email_cache');
    
    try {
      await emailCacheCollection.createIndex(
        { userId: 1, emailId: 1 }, 
        { unique: true, name: 'userId_emailId_unique' }
      );
      console.log('   ✅ Created unique compound index on userId and emailId');
      
      await emailCacheCollection.createIndex(
        { userId: 1, receivedDateTime: -1 }, 
        { name: 'userId_receivedDateTime' }
      );
      console.log('   ✅ Created compound index on userId and receivedDateTime');
      
      // TTL index - automatically delete old cache after 30 days
      await emailCacheCollection.createIndex(
        { createdAt: 1 }, 
        { expireAfterSeconds: 2592000, name: 'ttl_createdAt' }
      );
      console.log('   ✅ Created TTL index (30 days expiration)');
    } catch (e) {
      if (e.code === 85 || e.code === 11000) {
        console.log('   ℹ️  Indexes already exist');
      } else {
        throw e;
      }
    }

    // Verify all indexes
    console.log('\n🔍 Verifying indexes...\n');

    const usersIndexes = await usersCollection.indexes();
    console.log('Users collection indexes:');
    usersIndexes.forEach(idx => {
      console.log(`   - ${idx.name}: ${JSON.stringify(idx.key)}`);
    });

    const reportsIndexes = await reportsCollection.indexes();
    console.log('\nReports collection indexes:');
    reportsIndexes.forEach(idx => {
      console.log(`   - ${idx.name}: ${JSON.stringify(idx.key)}`);
    });

    const emailCacheIndexes = await emailCacheCollection.indexes();
    console.log('\nEmail cache collection indexes:');
    emailCacheIndexes.forEach(idx => {
      console.log(`   - ${idx.name}: ${JSON.stringify(idx.key)}`);
    });

    // Show collection stats
    console.log('\n📊 Collection Statistics:\n');
    const usersCount = await usersCollection.countDocuments();
    const reportsCount = await reportsCollection.countDocuments();
    const emailCacheCount = await emailCacheCollection.countDocuments();
    
    console.log(`   Users: ${usersCount} documents`);
    console.log(`   Reports: ${reportsCount} documents`);
    console.log(`   Email Cache: ${emailCacheCount} documents`);

    console.log('\n✅ Database initialization complete!\n');
    console.log('📝 Summary:');
    console.log('   - 3 collections created');
    console.log('   - 10 indexes configured');
    console.log('   - TTL policy set (30 days for email cache)');
    console.log('\n🎉 Your database is ready to use!\n');

  } catch (error) {
    console.error('❌ Initialization failed!');
    console.error('Error:', error.message);
    process.exit(1);
  } finally {
    await client.close();
  }
}

initializeDatabase();


