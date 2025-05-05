const fs = require('fs');
const path = require('path');

// Create a README with deployment instructions
const readmeContent = `# StartupSim Platform

A dynamic startup simulation platform that empowers entrepreneurs to create, analyze, 
and pitch their business ideas through interactive role-playing and intelligent tools.

## Deployment Instructions

### Netlify Deployment

1. Make sure you have the Netlify CLI installed:
   \`\`\`
   npm install -g netlify-cli
   \`\`\`

2. Login to your Netlify account:
   \`\`\`
   netlify login
   \`\`\`

3. Initialize a new Netlify site from this directory:
   \`\`\`
   netlify init
   \`\`\`

4. Add the following environment variables in Netlify:
   - DATABASE_URL: Your PostgreSQL connection string
   
5. Deploy the site:
   \`\`\`
   netlify deploy --prod
   \`\`\`

### Setup Database

1. Create a PostgreSQL database (you can use services like Neon.tech, Supabase, or any PostgreSQL provider)
2. Update the DATABASE_URL in your environment variables
3. Run database migrations:
   \`\`\`
   npm run db:push
   \`\`\`
4. Seed the database with initial data:
   \`\`\`
   npm run db:seed
   \`\`\`

## Development

1. Install dependencies:
   \`\`\`
   npm install
   \`\`\`

2. Start the development server:
   \`\`\`
   npm run dev
   \`\`\`
`;

// Write README
fs.writeFileSync('README.md', readmeContent);

// Create netlify.toml configuration file
const netlifyConfig = `[build]
  command = "npm run build"
  publish = "dist"
  functions = "netlify/functions"

[dev]
  command = "npm run dev"
  port = 5000
  
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[functions]
  node_bundler = "esbuild"
`;

fs.writeFileSync('netlify.toml', netlifyConfig);

// Create Netlify functions directory and server functions
const netlifyFunctionsDir = path.join(__dirname, 'netlify', 'functions');
if (!fs.existsSync(netlifyFunctionsDir)) {
  fs.mkdirSync(netlifyFunctionsDir, { recursive: true });
}

// Create a netlify server function
const serverFunction = `
const express = require('express');
const serverless = require('serverless-http');
const { registerRoutes } = require('../../server/routes');

const app = express();

// Register all routes from the main server
registerRoutes(app).then(() => {
  console.log('Routes registered in Netlify function');
});

module.exports.handler = serverless(app);
`;

fs.writeFileSync(
  path.join(netlifyFunctionsDir, 'api.js'),
  serverFunction
);

console.log('✅ Deployment files prepared successfully!');
console.log('✅ Created: README.md with deployment instructions');
console.log('✅ Created: netlify.toml configuration file');
console.log('✅ Created: Netlify serverless functions');
console.log('\nNext steps:');
console.log('1. Install Netlify CLI: npm install -g netlify-cli');
console.log('2. Login to Netlify: netlify login');
console.log('3. Initialize site: netlify init');
console.log('4. Deploy: netlify deploy --prod');