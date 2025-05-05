# StartupSim Platform Deployment Guide for Traditional Web Servers

This guide will help you deploy the StartupSim platform to a traditional web server (like Apache, Nginx, etc.) instead of Netlify.

## Prerequisites

- A web server with Node.js (v16+) installed
- PostgreSQL database
- SSH access to your server
- Domain name (optional, but recommended)

## Step 1: Prepare Your Web Server

1. **Install Node.js and npm** if they're not already installed:
   ```bash
   # For Ubuntu/Debian
   sudo apt update
   sudo apt install nodejs npm

   # Verify installation
   node -v
   npm -v
   ```

2. **Install PM2** for process management:
   ```bash
   sudo npm install -g pm2
   ```

3. **Set up PostgreSQL** if not already available:
   ```bash
   # For Ubuntu/Debian
   sudo apt install postgresql postgresql-contrib
   
   # Start PostgreSQL service
   sudo systemctl start postgresql
   sudo systemctl enable postgresql
   
   # Create a database user and database
   sudo -u postgres createuser --interactive
   sudo -u postgres createdb startupsim
   ```

## Step 2: Upload and Configure Your Application

1. **Upload your application files** to your server:
   ```bash
   # Using SCP (run this on your local machine)
   scp -r /path/to/extracted/project user@your-server-ip:/path/to/destination
   
   # Alternatively, upload using SFTP with a client like FileZilla
   ```

2. **Navigate to your project directory on the server**:
   ```bash
   cd /path/to/destination
   ```

3. **Install dependencies**:
   ```bash
   npm install
   ```

4. **Create a .env file** for environment variables:
   ```bash
   touch .env
   ```

5. **Add your database connection string** to the .env file:
   ```
   DATABASE_URL=postgres://username:password@localhost:5432/startupsim
   ```

6. **Build the application**:
   ```bash
   npm run build
   ```

## Step 3: Set Up the Database

1. **Run database migrations** to create your tables:
   ```bash
   npm run db:push
   ```

2. **Seed the database** with initial data:
   ```bash
   npm run db:seed
   ```

## Step 4: Configure Your Web Server

### Option 1: Using Nginx as a Reverse Proxy (Recommended)

1. **Install Nginx** if not already installed:
   ```bash
   sudo apt install nginx
   ```

2. **Create an Nginx configuration file**:
   ```bash
   sudo nano /etc/nginx/sites-available/startupsim
   ```

3. **Add the following configuration** (replace 'yourdomain.com' with your domain):
   ```nginx
   server {
       listen 80;
       server_name yourdomain.com www.yourdomain.com;

       location / {
           proxy_pass http://localhost:5000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

4. **Enable the site**:
   ```bash
   sudo ln -s /etc/nginx/sites-available/startupsim /etc/nginx/sites-enabled/
   ```

5. **Test and restart Nginx**:
   ```bash
   sudo nginx -t
   sudo systemctl restart nginx
   ```

### Option 2: Using Apache as a Reverse Proxy

1. **Install Apache** if not already installed:
   ```bash
   sudo apt install apache2
   ```

2. **Enable necessary modules**:
   ```bash
   sudo a2enmod proxy proxy_http proxy_wstunnel rewrite
   ```

3. **Create an Apache configuration file**:
   ```bash
   sudo nano /etc/apache2/sites-available/startupsim.conf
   ```

4. **Add the following configuration** (replace 'yourdomain.com' with your domain):
   ```apache
   <VirtualHost *:80>
       ServerName yourdomain.com
       ServerAlias www.yourdomain.com

       ProxyPreserveHost On
       ProxyPass / http://localhost:5000/
       ProxyPassReverse / http://localhost:5000/

       ErrorLog ${APACHE_LOG_DIR}/startupsim-error.log
       CustomLog ${APACHE_LOG_DIR}/startupsim-access.log combined
   </VirtualHost>
   ```

5. **Enable the site**:
   ```bash
   sudo a2ensite startupsim.conf
   ```

6. **Restart Apache**:
   ```bash
   sudo systemctl restart apache2
   ```

## Step 5: Start the Application

1. **Create a server.js file** in your project root:
   ```bash
   nano server.js
   ```

2. **Add the following code** to the file:
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

   // Handle graceful shutdown
   process.on('SIGTERM', () => {
       server.close(() => {
           console.log('Server shutting down');
       });
   });
   ```

3. **Install dotenv** (if not already included in dependencies):
   ```bash
   npm install dotenv
   ```

4. **Start the server using PM2**:
   ```bash
   pm2 start server.js --name startupsim
   ```

5. **Make PM2 start automatically** after system reboot:
   ```bash
   pm2 startup
   pm2 save
   ```

## Step 6: Secure Your Application (Optional but Recommended)

1. **Install Certbot** for SSL/TLS:
   ```bash
   sudo apt install certbot python3-certbot-nginx  # For Nginx
   # OR
   sudo apt install certbot python3-certbot-apache  # For Apache
   ```

2. **Obtain SSL certificate**:
   ```bash
   # For Nginx
   sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
   
   # For Apache
   sudo certbot --apache -d yourdomain.com -d www.yourdomain.com
   ```

3. **Follow the prompts** to complete the certificate setup

## Step 7: Test Your Deployment

1. **Visit your website** at your domain or server IP
2. Verify that all features work properly:
   - Login functionality
   - Profile creation
   - Pitch deck uploads
   - Startup funding simulations

## Troubleshooting

### Application Not Starting
- Check logs with `pm2 logs startupsim`
- Ensure all dependencies are installed
- Verify the .env file has the correct DATABASE_URL

### Database Connection Issues
- Check if PostgreSQL is running: `sudo systemctl status postgresql`
- Verify username and password in the connection string
- Check database permissions

### Web Server Issues
- Nginx: Check logs at `/var/log/nginx/error.log`
- Apache: Check logs at `/var/log/apache2/error.log`
- Verify that the proxy settings are correct

## Maintenance

### Updates and Changes
When you need to update your application:

1. Pull the latest code or upload new files
2. Install dependencies if needed: `npm install`
3. Rebuild the application: `npm run build`
4. Restart the server: `pm2 restart startupsim`

### Database Backups
Regularly backup your PostgreSQL database:
```bash
pg_dump -U username startupsim > backup_$(date +%Y%m%d).sql
```

### Monitoring
Monitor your application health with PM2:
```bash
pm2 monit
```

---

If you need further assistance, feel free to reach out or consult with your server administrator.