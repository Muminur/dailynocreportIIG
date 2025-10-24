/**
 * MongoDB Database Initialization Script
 * 
 * This script initializes the NOC Reports database with required collections and indexes.
 * 
 * Usage:
 *   mongosh noc-reports scripts/init-mongodb.js
 * 
 * Or from the MongoDB shell:
 *   use noc-reports
 *   load('scripts/init-mongodb.js')
 */

print('🚀 Starting MongoDB initialization for NOC Reports...\n');

// Switch to the database
db = db.getSiblingDB('noc-reports');

print('📊 Database: ' + db.getName() + '\n');

// Drop existing indexes if they exist (optional, comment out for production)
// print('⚠️  Dropping existing indexes...');
// db.users.dropIndexes();
// db.reports.dropIndexes();
// db.email_cache.dropIndexes();

// Create Users Collection Indexes
print('👤 Creating indexes for users collection...');
try {
  db.users.createIndex({ email: 1 }, { unique: true, name: 'email_unique' });
  print('  ✅ Created unique index on email');
  
  db.users.createIndex({ microsoftId: 1 }, { unique: true, name: 'microsoftId_unique' });
  print('  ✅ Created unique index on microsoftId');
  
  db.users.createIndex({ lastLogin: -1 }, { name: 'lastLogin_desc' });
  print('  ✅ Created index on lastLogin');
} catch (e) {
  print('  ⚠️  Users indexes may already exist: ' + e.message);
}

// Create Reports Collection Indexes
print('\n📝 Creating indexes for reports collection...');
try {
  db.reports.createIndex({ userId: 1, date: -1 }, { name: 'userId_date' });
  print('  ✅ Created compound index on userId and date');
  
  db.reports.createIndex({ 'entries.emailId': 1 }, { name: 'entries_emailId' });
  print('  ✅ Created index on entries.emailId');
  
  db.reports.createIndex({ createdAt: -1 }, { name: 'createdAt_desc' });
  print('  ✅ Created index on createdAt');
  
  db.reports.createIndex({ updatedAt: -1 }, { name: 'updatedAt_desc' });
  print('  ✅ Created index on updatedAt');
} catch (e) {
  print('  ⚠️  Reports indexes may already exist: ' + e.message);
}

// Create Email Cache Collection Indexes
print('\n📧 Creating indexes for email_cache collection...');
try {
  db.email_cache.createIndex(
    { userId: 1, emailId: 1 }, 
    { unique: true, name: 'userId_emailId_unique' }
  );
  print('  ✅ Created unique compound index on userId and emailId');
  
  db.email_cache.createIndex(
    { userId: 1, receivedDateTime: -1 }, 
    { name: 'userId_receivedDateTime' }
  );
  print('  ✅ Created compound index on userId and receivedDateTime');
  
  db.email_cache.createIndex({ createdAt: 1 }, { name: 'createdAt_asc' });
  print('  ✅ Created index on createdAt');
} catch (e) {
  print('  ⚠️  Email cache indexes may already exist: ' + e.message);
}

// Create TTL index for email cache (optional - expires old cache after 30 days)
print('\n🗑️  Setting up TTL index for email cache (30 days expiration)...');
try {
  db.email_cache.createIndex(
    { createdAt: 1 }, 
    { expireAfterSeconds: 2592000, name: 'ttl_createdAt' }
  );
  print('  ✅ Created TTL index - old emails will be automatically deleted after 30 days');
} catch (e) {
  print('  ⚠️  TTL index may already exist: ' + e.message);
}

// Verify all indexes
print('\n🔍 Verifying indexes...\n');

print('Users collection indexes:');
db.users.getIndexes().forEach(function(idx) {
  print('  - ' + idx.name + ': ' + JSON.stringify(idx.key));
});

print('\nReports collection indexes:');
db.reports.getIndexes().forEach(function(idx) {
  print('  - ' + idx.name + ': ' + JSON.stringify(idx.key));
});

print('\nEmail cache collection indexes:');
db.email_cache.getIndexes().forEach(function(idx) {
  print('  - ' + idx.name + ': ' + JSON.stringify(idx.key));
});

// Show collection stats
print('\n📊 Collection Statistics:\n');
print('Users: ' + db.users.countDocuments() + ' documents');
print('Reports: ' + db.reports.countDocuments() + ' documents');
print('Email Cache: ' + db.email_cache.countDocuments() + ' documents');

print('\n✅ MongoDB initialization complete!\n');
print('📝 Database: noc-reports');
print('📦 Collections: users, reports, email_cache');
print('🔍 All indexes created successfully\n');

