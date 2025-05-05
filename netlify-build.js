const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 Starting Netlify build preparation...');

// Install serverless-http package for Netlify Functions
console.log('📦 Installing serverless-http package...');
try {
  execSync('npm install --save serverless-http', { stdio: 'inherit' });
  console.log('✅ serverless-http installed successfully');
} catch (error) {
  console.error('❌ Failed to install serverless-http:', error);
  process.exit(1);
}

// Create Netlify configuration files
console.log('📝 Creating Netlify configuration files...');

// Create netlify.toml
const netlifyConfig = `[build]
  command = "npm run build"
  publish = "dist"
  functions = "netlify/functions"

[dev]
  command = "npm run dev"
  port = 5000
  
[[redirects]]
  from = "/api/*"
  to = "/.netlify/functions/api/:splat"
  status = 200

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[functions]
  node_bundler = "esbuild"
`;

fs.writeFileSync('netlify.toml', netlifyConfig);
console.log('✅ Created netlify.toml');

// Create Netlify functions directory
const functionsDir = path.join(__dirname, 'netlify', 'functions');
if (!fs.existsSync(functionsDir)) {
  fs.mkdirSync(functionsDir, { recursive: true });
}

// Create API function
const apiFunction = `const express = require('express');
const serverless = require('serverless-http');
const cors = require('cors');
const { json, urlencoded } = require('express');
const { registerRoutes } = require('../../server/routes');

const app = express();

// Middleware
app.use(cors());
app.use(json());
app.use(urlencoded({ extended: true }));

// Register routes
registerRoutes(app)
  .then(() => {
    console.log('Routes registered successfully');
  })
  .catch(err => {
    console.error('Error registering routes:', err);
  });

// Export handler for Netlify Functions
module.exports.handler = serverless(app);
`;

fs.writeFileSync(path.join(functionsDir, 'api.js'), apiFunction);
console.log('✅ Created Netlify serverless function');

// Create package.json scripts for Netlify
try {
  const packageJson = require('./package.json');
  
  packageJson.scripts = {
    ...packageJson.scripts,
    "netlify:dev": "netlify dev",
    "netlify:build": "node netlify-build.js && npm run build"
  };
  
  fs.writeFileSync('package.json', JSON.stringify(packageJson, null, 2));
  console.log('✅ Updated package.json with Netlify scripts');
} catch (error) {
  console.error('❌ Failed to update package.json:', error);
}

console.log(`
🎉 All done! Your project is ready for Netlify deployment.

Next steps:
1. Install Netlify CLI globally:
   npm install -g netlify-cli

2. Login to your Netlify account:
   netlify login

3. Initialize a new Netlify site:
   netlify init

4. Set up environment variables in Netlify:
   - DATABASE_URL (PostgreSQL connection string)

5. Deploy your site:
   netlify deploy --prod

For local development with Netlify:
   npm run netlify:dev
`);