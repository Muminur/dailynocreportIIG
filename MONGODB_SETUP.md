# MongoDB Setup Guide

## 🗄️ MongoDB Installation & Configuration

This guide will help you set up MongoDB for the NOC Email Report Generator, both for local development and production.

---

## Option 1: Local MongoDB (Development)

### macOS

#### Using Homebrew (Recommended)

```bash
# Install Homebrew if not already installed
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Tap MongoDB formula
brew tap mongodb/brew

# Install MongoDB Community Edition
brew install mongodb-community@6.0

# Start MongoDB as a service
brew services start mongodb-community@6.0

# Verify MongoDB is running
brew services list | grep mongodb

# Connect to MongoDB shell
mongosh
```

#### Manual Installation

1. Download from [MongoDB Download Center](https://www.mongodb.com/try/download/community)
2. Extract the archive
3. Create data directory:
   ```bash
   sudo mkdir -p /usr/local/var/mongodb
   sudo mkdir -p /usr/local/var/log/mongodb
   sudo chown -R `id -un` /usr/local/var/mongodb
   sudo chown -R `id -un` /usr/local/var/log/mongodb
   ```
4. Start MongoDB:
   ```bash
   mongod --dbpath /usr/local/var/mongodb --logpath /usr/local/var/log/mongodb/mongo.log --fork
   ```

### Windows

#### Using Installer

1. Download the MongoDB Community Server MSI installer from [MongoDB Download Center](https://www.mongodb.com/try/download/community)
2. Run the installer
3. Choose "Complete" installation
4. Install as a Windows Service (checked by default)
5. MongoDB Compass will be installed automatically

#### Using Chocolatey

```powershell
# Install Chocolatey if not already installed
Set-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))

# Install MongoDB
choco install mongodb

# Start MongoDB service
net start MongoDB
```

### Linux (Ubuntu/Debian)

```bash
# Import MongoDB public GPG key
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -

# Create list file
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list

# Update package database
sudo apt-get update

# Install MongoDB
sudo apt-get install -y mongodb-org

# Start MongoDB
sudo systemctl start mongod

# Enable MongoDB to start on boot
sudo systemctl enable mongod

# Check status
sudo systemctl status mongod
```

### Verify Installation

```bash
# Connect to MongoDB
mongosh

# Inside mongosh:
# Show databases
show dbs

# Switch to your database
use noc-reports

# Create a test collection
db.test.insertOne({ message: "MongoDB is working!" })

# Query the test collection
db.test.find()

# Exit
exit
```

---

## Option 2: MongoDB Atlas (Cloud - Recommended for Production)

### Setup Steps

1. **Create Account**
   - Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
   - Sign up for a free account

2. **Create Cluster**
   - Click "Build a Database"
   - Choose "Free" tier (M0 Sandbox)
   - Select cloud provider and region (choose nearest to your location)
   - Name your cluster (e.g., "noc-reports-cluster")
   - Click "Create"

3. **Configure Security**
   
   **Database Access:**
   - Go to "Database Access" in left sidebar
   - Click "Add New Database User"
   - Authentication Method: Password
   - Username: `nocadmin` (or your choice)
   - Password: Generate a secure password
   - Database User Privileges: "Read and write to any database"
   - Click "Add User"

   **Network Access:**
   - Go to "Network Access" in left sidebar
   - Click "Add IP Address"
   - For development: Click "Allow Access from Anywhere" (0.0.0.0/0)
   - For production: Add your server's IP address
   - Click "Confirm"

4. **Get Connection String**
   - Go to "Database" in left sidebar
   - Click "Connect" on your cluster
   - Choose "Connect your application"
   - Driver: Node.js
   - Version: 5.5 or later
   - Copy the connection string
   - Replace `<password>` with your database user password
   - Replace `myFirstDatabase` with `noc-reports`

   Example:
   ```
   mongodb+srv://nocadmin:<password>@noc-reports-cluster.xxxxx.mongodb.net/noc-reports?retryWrites=true&w=majority
   ```

5. **Update Environment Variables**
   - Add to `.env.local`:
   ```bash
   MONGODB_URI=mongodb+srv://nocadmin:YOUR_PASSWORD@noc-reports-cluster.xxxxx.mongodb.net/noc-reports?retryWrites=true&w=majority
   ```

---

## MongoDB Compass (GUI Tool)

### Installation

**All Platforms:**
- Download from [MongoDB Compass](https://www.mongodb.com/products/compass)
- Install the appropriate version for your OS

### Connect to Local MongoDB

1. Open MongoDB Compass
2. Connection String: `mongodb://localhost:27017`
3. Click "Connect"

### Connect to MongoDB Atlas

1. Open MongoDB Compass
2. Use the connection string from Atlas (with password)
3. Click "Connect"

### Using Compass

- **View Collections:** Browse databases and collections
- **Query Data:** Use the query bar to filter documents
- **Create Indexes:** Optimize database performance
- **Import/Export:** Backup and restore data
- **Schema Analysis:** View document structure

---

## Database Initialization

### Create Indexes (Required for Performance)

Connect to MongoDB and run these commands:

```javascript
// Connect to the database
use noc-reports

// Users collection indexes
db.users.createIndex({ email: 1 }, { unique: true })
db.users.createIndex({ microsoftId: 1 }, { unique: true })

// Reports collection indexes
db.reports.createIndex({ userId: 1, date: -1 })
db.reports.createIndex({ "entries.emailId": 1 })

// Email cache collection indexes
db.email_cache.createIndex({ userId: 1, emailId: 1 }, { unique: true })
db.email_cache.createIndex({ userId: 1, receivedDateTime: -1 })

// Verify indexes were created
db.users.getIndexes()
db.reports.getIndexes()
db.email_cache.getIndexes()
```

### Create Database Initialization Script

Save this as `scripts/init-mongodb.js`:

```javascript
// This script will be created in your project later
```

Run with:
```bash
mongosh noc-reports scripts/init-mongodb.js
```

---

## Environment Configuration

### Development (.env.local)

```bash
# Local MongoDB
MONGODB_URI=mongodb://localhost:27017/noc-reports

# OR MongoDB Atlas
MONGODB_URI=mongodb+srv://username:password@cluster.xxxxx.mongodb.net/noc-reports?retryWrites=true&w=majority
```

### Production

Set environment variable on your hosting platform:
- **Vercel:** Project Settings → Environment Variables
- **Netlify:** Site Settings → Environment Variables
- **Heroku:** Settings → Config Vars
- **AWS/Azure:** Use their secret management services

---

## Troubleshooting

### MongoDB won't start (macOS)

```bash
# Check if MongoDB is running
brew services list

# Stop and restart
brew services stop mongodb-community@6.0
brew services start mongodb-community@6.0

# Check logs
tail -f /usr/local/var/log/mongodb/mongo.log
```

### Connection refused

- Verify MongoDB is running
- Check if port 27017 is available: `lsof -i :27017`
- Check firewall settings
- Verify connection string is correct

### Authentication failed (Atlas)

- Verify username and password
- Check database user permissions
- Ensure IP is whitelisted
- Password should be URL-encoded if it contains special characters

### Can't connect to Atlas from localhost

- Check Network Access settings
- Ensure 0.0.0.0/0 is whitelisted (development only)
- Verify your internet connection
- Try using MongoDB Compass to test connection

---

## Useful Commands

```bash
# Start MongoDB (macOS)
brew services start mongodb-community@6.0

# Stop MongoDB (macOS)
brew services stop mongodb-community@6.0

# Restart MongoDB (macOS)
brew services restart mongodb-community@6.0

# Connect to MongoDB shell
mongosh

# Connect to specific database
mongosh noc-reports

# Export database
mongodump --uri="mongodb://localhost:27017/noc-reports" --out=./backup

# Import database
mongorestore --uri="mongodb://localhost:27017/noc-reports" ./backup/noc-reports

# Show all databases
show dbs

# Show current database
db

# Show collections in current database
show collections

# Drop database (careful!)
db.dropDatabase()
```

---

## Next Steps

After setting up MongoDB:

1. ✅ Verify connection with MongoDB Compass
2. ✅ Create required indexes
3. ✅ Update `.env.local` with connection string
4. ✅ Test connection in your Next.js app
5. ✅ Set up backup strategy for production

---

## Resources

- [MongoDB Documentation](https://docs.mongodb.com/)
- [MongoDB University](https://university.mongodb.com/) - Free courses
- [Mongoose Documentation](https://mongoosejs.com/)
- [MongoDB Atlas Documentation](https://docs.atlas.mongodb.com/)

