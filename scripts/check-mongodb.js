/**
 * MongoDB Connection Check Script
 * 
 * This script checks if MongoDB is accessible and displays connection information.
 * 
 * Usage:
 *   mongosh scripts/check-mongodb.js
 */

print('🔍 Checking MongoDB connection...\n');

try {
  // Get server info
  const serverInfo = db.serverStatus();
  const buildInfo = db.serverBuildInfo();
  
  print('✅ Successfully connected to MongoDB!\n');
  
  print('📊 Server Information:');
  print('  Version: ' + buildInfo.version);
  print('  Host: ' + serverInfo.host);
  print('  Process: ' + serverInfo.process);
  print('  Uptime: ' + Math.floor(serverInfo.uptime / 60) + ' minutes');
  print('  Connections: ' + serverInfo.connections.current + ' current, ' + 
        serverInfo.connections.available + ' available');
  
  print('\n📚 Databases:');
  db.adminCommand('listDatabases').databases.forEach(function(database) {
    print('  - ' + database.name + ' (' + 
          (database.sizeOnDisk / 1024 / 1024).toFixed(2) + ' MB)');
  });
  
  // Check if noc-reports database exists
  print('\n🔍 Checking noc-reports database...');
  const nocDb = db.getSiblingDB('noc-reports');
  const collections = nocDb.getCollectionNames();
  
  if (collections.length > 0) {
    print('  ✅ Database exists with ' + collections.length + ' collections:');
    collections.forEach(function(col) {
      const count = nocDb.getCollection(col).countDocuments();
      print('    - ' + col + ': ' + count + ' documents');
    });
  } else {
    print('  ⚠️  Database exists but has no collections yet');
    print('  💡 Run "mongosh noc-reports scripts/init-mongodb.js" to initialize');
  }
  
  print('\n✅ MongoDB is ready to use!\n');
} catch (e) {
  print('❌ Failed to connect to MongoDB');
  print('Error: ' + e.message + '\n');
  print('💡 Troubleshooting:');
  print('  1. Make sure MongoDB is running');
  print('  2. Check your connection string');
  print('  3. Verify port 27017 is accessible');
  print('  4. Check MongoDB logs for errors\n');
}

