# Deploying StartupSim on a Shared Web Hosting Server

This guide will help you deploy the StartupSim platform on a typical shared web hosting environment.

## Prerequisites

- Web hosting account with:
  - Node.js support (v16+)
  - PostgreSQL database or MySQL with support for PostgreSQL connection strings
  - SSH access or a control panel (cPanel, Plesk, etc.)
  - PHP version 7.4+ (if using cPanel or similar)

## Step 1: Prepare Your Hosting Environment

### Check for Node.js Support

Most shared hosting environments today offer Node.js support. Check your hosting control panel for Node.js options.

- **cPanel**: Look for "Setup Node.js App" or similar
- **Plesk**: Look for "Node.js" under the "Web Hosting Access" section
- **Other control panels**: Search for Node.js in the available features

If Node.js is not available, contact your hosting provider to confirm if they support Node.js applications.

### Create a Database

1. Log in to your hosting control panel
2. Navigate to the database section:
   - **cPanel**: "MySQL Databases" or "PostgreSQL Databases"
   - **Plesk**: "Databases" section
3. Create a new database for your application (name it something like `startupsim`)
4. Create a database user and password
5. Assign the user to the database with all privileges
6. Note your database details:
   - Database name
   - Username
   - Password
   - Hostname (usually localhost or a provided host address)
   - Port (usually 5432 for PostgreSQL, 3306 for MySQL)

## Step 2: Upload Your Application

### Using the File Manager (Control Panel)

1. Navigate to the File Manager in your control panel
2. Go to the directory where you want to deploy your application (typically public_html, www, or httpdocs)
3. Create a subdirectory for your application (e.g., startupsim)
4. Use the upload tool to upload all extracted files from your downloaded ZIP

### Using FTP/SFTP

1. Connect to your server using an FTP client (like FileZilla, Cyberduck, etc.)
   - Server: Your hosting server address
   - Username: Your hosting account username
   - Password: Your hosting account password
   - Port: Usually 21 for FTP, 22 for SFTP
2. Navigate to your web root directory
3. Create a new folder for your application (e.g., startupsim)
4. Upload all the files from your extracted ZIP to this folder

## Step 3: Configure Your Application

### Create a .env File

1. In your application directory, create a file named `.env`
2. Add your database connection string:
   ```
   DATABASE_URL=postgres://username:password@hostname:port/database_name
   ```

### Update package.json (if needed)

If your hosting provider requires a specific Node.js version, update the `engines` section in package.json:

```json
"engines": {
  "node": "16.x"
}
```

## Step 4: Set Up Application on Your Hosting Provider

### cPanel Node.js App Setup

1. Go to "Setup Node.js App" in cPanel
2. Click "Create Application"
3. Fill out the form:
   - Node.js version: Choose the latest available version (preferably 16+)
   - Application mode: Production
   - Application root: Path to your uploaded application (e.g., /startupsim)
   - Application URL: Your domain or subdomain for the app
   - Application startup file: server.js (create this file if not already present - see Step 6)
4. Click "Create"

### Plesk Node.js Setup

1. Go to "Node.js" in Plesk
2. Click "Enable Node.js"
3. Configure the application:
   - Application root: Path to your application
   - Document root: Usually the same as application root
   - Application startup file: server.js
   - Node.js version: Choose the latest available
4. Click "Save"

## Step 5: Set Up the Database

You'll need to run your database migrations and seed your database. There are a few ways to do this:

### Option 1: Using SSH (if available)

1. Connect to your server via SSH
2. Navigate to your application directory
3. Run the database commands:
   ```bash
   npm run db:push
   npm run db:seed
   ```

### Option 2: Using a Database Management Tool

If SSH isn't available, you can use a database management tool like phpMyAdmin, phpPgAdmin, or Adminer (usually provided by your host):

1. Log in to the database tool
2. Import the SQL schema file (you'll need to generate this locally first)
   
   To generate the SQL schema locally:
   ```bash
   # If using Drizzle
   npx drizzle-kit generate:pg --schema=./shared/schema.ts

   # Then look for the generated SQL files in the output directory
   ```

3. Import your seed data SQL file (generate this locally as well)

## Step 6: Create a Server File for Shared Hosting

Create a file named `server.js` in your project root:

```javascript
// Load environment variables from .env file
require('dotenv').config();

// Import required modules
const express = require('express');
const path = require('path');
const { registerRoutes } = require('./server/routes');

// Create Express app
const app = express();
const PORT = process.env.PORT || 5000;

// Serve static files from the 'dist' directory
app.use(express.static(path.join(__dirname, 'dist')));

// Register API routes
registerRoutes(app).then(() => {
    console.log('Routes registered successfully');
});

// Serve index.html for all routes (for SPA)
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Start server
const server = app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
```

## Step 7: Build Your Application

If your hosting provider allows:

1. Connect via SSH to your server
2. Navigate to your application directory
3. Install dependencies and build:
   ```bash
   npm install
   npm run build
   ```

If SSH is not available, you'll need to:

1. Build the application locally:
   ```bash
   npm install
   npm run build
   ```
2. Upload the built `dist` directory to your server

## Step 8: Configure Web Server (if needed)

If your hosting uses Apache, create a `.htaccess` file in your application's root directory:

```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>
```

## Step 9: Start Your Application

1. In your hosting control panel, restart your Node.js application
2. For cPanel: Go to "Setup Node.js App", select your app, and click "Restart"
3. For Plesk: Go to Node.js, find your app, and click "Restart"

## Step 10: Test Your Deployment

1. Visit your website at your configured domain or subdomain
2. Test different features to ensure everything works as expected

## Troubleshooting Common Issues

### Application Won't Start
- Check if your hosting environment meets all Node.js requirements
- Verify that your server.js file is properly configured
- Check your hosting control panel for any error logs

### Database Connection Issues
- Double-check your DATABASE_URL in the .env file
- Verify that the database user has the proper permissions
- Some hosts restrict connections; check if there are special connection parameters needed

### 500 Server Errors
- Check your application logs in the hosting control panel
- Verify that all dependencies are installed correctly
- Some hosting providers might have restrictions on certain npm packages

### 404 Not Found Errors
- Make sure your .htaccess file is configured correctly
- Verify that the build process completed successfully
- Check if your hosting provider supports client-side routing

## Contact Your Hosting Provider

If you continue to experience issues, contact your hosting provider's support team. Be prepared to share:
- The type of application you're trying to deploy (Node.js/React)
- Specific error messages you're seeing
- The steps you've taken so far

Most hosting providers have documentation specific to Node.js applications that can be helpful.

---

Remember that shared hosting environments can vary significantly in their support for Node.js applications. If you encounter persistent issues, you might want to consider a more Node.js-friendly hosting option like Digital Ocean, Linode, Heroku, or Render.