const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 Preparing StartupSim for shared hosting deployment...');

// Create a server.js file for shared hosting
console.log('📝 Creating server.js file...');

const serverJs = `// Load environment variables from .env file
require('dotenv').config();

// Import required modules
const express = require('express');
const path = require('path');
const { registerRoutes } = require('./server/routes');

// Create Express app
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from the 'dist' directory
app.use(express.static(path.join(__dirname, 'dist')));

// Register API routes
registerRoutes(app).then(() => {
    console.log('Routes registered successfully');
}).catch(err => {
    console.error('Error registering routes:', err);
});

// Serve index.html for all routes (for SPA)
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Start server
const server = app.listen(PORT, () => {
    console.log(\`Server running on port \${PORT}\`);
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
    server.close(() => {
        console.log('Server shutting down');
    });
});`;

fs.writeFileSync('server.js', serverJs);
console.log('✅ server.js created');

// Create an example .env file
console.log('📝 Creating example .env file...');

const envContent = `# Database connection (replace with your hosting provider's details)
DATABASE_URL=postgres://username:password@hostname:port/database_name

# Application port (some hosts require specific ports)
PORT=5000`;

fs.writeFileSync('.env.example', envContent);
console.log('✅ .env.example created');

// Create .htaccess file for Apache servers
console.log('📝 Creating .htaccess file...');

const htaccessContent = `<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>

# Set PHP values if PHP is used on the server
<IfModule mod_php7.c>
  php_value upload_max_filesize 50M
  php_value post_max_size 50M
  php_value max_execution_time 300
  php_value max_input_time 300
</IfModule>

# Disable directory listing
Options -Indexes

# Set security headers
<IfModule mod_headers.c>
  Header set X-Content-Type-Options "nosniff"
  Header set X-XSS-Protection "1; mode=block"
  Header set X-Frame-Options "SAMEORIGIN"
  Header set Referrer-Policy "strict-origin-when-cross-origin"
</IfModule>

# Compress text files
<IfModule mod_deflate.c>
  AddOutputFilterByType DEFLATE text/html text/plain text/xml text/css text/javascript application/javascript application/json
</IfModule>`;

fs.writeFileSync('.htaccess', htaccessContent);
console.log('✅ .htaccess created');

// Create a SQL export script
console.log('📝 Creating SQL export script...');

const sqlExportScript = `const fs = require('fs');
const { execSync } = require('child_process');
const schema = require('./shared/schema');

// Generate SQL for tables
console.log('Generating SQL for schema...');

// Function to generate CREATE TABLE statements
function generateCreateTableSQL() {
  let sql = '';
  
  // This is a simplified example - you would need to adapt this
  // based on your actual schema structure
  
  return sql;
}

// Write SQL to file
fs.writeFileSync('schema.sql', generateCreateTableSQL());
console.log('Schema SQL generated: schema.sql');

// Generate seed data SQL (very simplified)
console.log('Generating seed data SQL...');
const seedSQL = '-- Add your seed data SQL here';
fs.writeFileSync('seed-data.sql', seedSQL);
console.log('Seed data SQL generated: seed-data.sql');

console.log('Done! You can now import these SQL files into your hosting provider\\'s database management tool.');`;

fs.writeFileSync('export-sql.js', sqlExportScript);
console.log('✅ export-sql.js created');

// Create a README with instructions
console.log('📝 Creating hosting instructions README...');

const readmeContent = `# StartupSim - Shared Hosting Deployment

## Files Prepared for Deployment

- \`server.js\`: Main server file for shared hosting
- \`.env.example\`: Example environment variables (copy to .env and update)
- \`.htaccess\`: Apache configuration for routing
- \`export-sql.js\`: Script to generate SQL files for database setup

## Deployment Steps

1. **Build the application locally**:
   \`\`\`
   npm run build
   \`\`\`

2. **Copy these files to your hosting**:
   - All files in the \`dist\` folder (created after build)
   - \`server.js\`
   - \`server\` folder
   - \`shared\` folder
   - \`db\` folder
   - \`package.json\` and \`package-lock.json\`
   - \`.htaccess\`
   - Create a \`.env\` file based on \`.env.example\`

3. **Set up the database**:
   - Create a database on your hosting
   - Import \`schema.sql\` and \`seed-data.sql\` (generate these with \`node export-sql.js\`)

4. **Install dependencies** on your hosting (if SSH access is available):
   \`\`\`
   npm install
   \`\`\`

5. **Start the Node.js application** using your hosting's control panel

For detailed instructions, refer to the SHARED_HOSTING_GUIDE.md file.
`;

fs.writeFileSync('HOSTING_README.md', readmeContent);
console.log('✅ HOSTING_README.md created');

// Check if we can build the application
console.log('🛠️ Attempting to build the application...');

try {
  execSync('npm run build', { stdio: 'inherit' });
  console.log('✅ Application built successfully. Distribution files are in the dist folder.');
} catch (error) {
  console.error('❌ Build failed. Please run npm run build manually before deploying.');
}

console.log(`
🎉 Preparation complete! Your files are ready for shared hosting.

Next steps:
1. Copy the necessary files mentioned in HOSTING_README.md to your web hosting
2. Set up your database and import schema/data
3. Configure .env with your database details
4. Install dependencies (if possible)
5. Start the Node.js application

For detailed instructions, refer to the SHARED_HOSTING_GUIDE.md file.
`);