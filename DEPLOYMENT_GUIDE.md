# StartupSim Platform Deployment Guide

This guide will help you export the StartupSim platform and deploy it to your Netlify server.

## Step 1: Export the Code

### Option 1: Download from Replit
1. In the Replit interface, click on the three dots menu in the Files panel
2. Select "Download as zip"
3. Save the zip file to your local machine
4. Extract the zip file to a directory on your computer

### Option 2: Use Git
If you prefer using Git:
1. Initialize a git repository (if not already done):
   ```bash
   git init
   ```
2. Add all files to the repository:
   ```bash
   git add .
   ```
3. Commit the files:
   ```bash
   git commit -m "Initial commit"
   ```
4. Create a repository on GitHub, GitLab, or your preferred Git provider
5. Push the code to the repository:
   ```bash
   git remote add origin YOUR_REPOSITORY_URL
   git push -u origin main
   ```

## Step 2: Set Up PostgreSQL Database

The StartupSim platform requires a PostgreSQL database. You have several options:

### Option 1: Neon.tech (Recommended)
1. Create an account at [Neon](https://neon.tech)
2. Create a new project and PostgreSQL database
3. Copy the connection string for later use

### Option 2: Supabase
1. Create an account at [Supabase](https://supabase.io)
2. Create a new project
3. Go to Project Settings > Database
4. Get the PostgreSQL connection string

### Option 3: Railway, Render, or any other PostgreSQL provider
Follow their documentation to create a PostgreSQL database and get the connection string.

## Step 3: Deploy to Netlify

### Prerequisites
1. Install Node.js and npm on your local machine if you haven't already
2. Install the Netlify CLI:
   ```bash
   npm install -g netlify-cli
   ```

### Steps
1. Navigate to your project directory:
   ```bash
   cd path/to/extracted/project
   ```

2. Install project dependencies:
   ```bash
   npm install
   ```

3. Run the Netlify build preparation script:
   ```bash
   node netlify-build.js
   ```

4. Login to your Netlify account:
   ```bash
   netlify login
   ```

5. Initialize a new Netlify site:
   ```bash
   netlify init
   ```
   - Follow the prompts to create a new site or use an existing team
   - When asked for the build command, enter: `npm run netlify:build`
   - When asked for the publish directory, enter: `dist`

6. Set up environment variables:
   ```bash
   netlify env:set DATABASE_URL "your-postgresql-connection-string"
   ```

7. Deploy the site:
   ```bash
   netlify deploy --prod
   ```

8. Your site will be deployed to a URL like `https://your-site-name.netlify.app`

## Step 4: Set Up the Database

After deploying, you need to initialize your database tables and seed them with initial data:

1. You'll need to run the database migrations from your local machine:
   ```bash
   # Set the DATABASE_URL environment variable to your database connection string
   export DATABASE_URL="your-postgresql-connection-string"
   
   # Run the Drizzle migration to create tables
   npm run db:push
   
   # Seed the database with initial data
   npm run db:seed
   ```

## Step 5: Verify Deployment

1. Visit your Netlify URL to verify the site is running
2. Check that the database connection is working properly by:
   - Logging in as a founder or investor
   - Creating a startup profile
   - Exploring the different features

## Troubleshooting

### Database Connection Issues
- Verify your `DATABASE_URL` is correctly set in Netlify's environment variables
- Make sure your database is accessible from external services (check firewall settings)
- Check the Netlify function logs for any connection errors

### Build Failures
- Review the build logs in the Netlify dashboard
- Make sure all dependencies are properly installed
- Check for any TypeScript errors in your code

### API Errors
- Check the Netlify function logs
- Verify the API routes are correctly set up in the serverless function
- Test individual API endpoints using tools like Postman or curl

## Ongoing Management

### Updates and Changes
When you make changes to your code:
1. Commit the changes to your repository
2. Push to your Git provider
3. If you've connected Netlify to your Git repository, it will automatically rebuild
4. Otherwise, run `netlify deploy --prod` to manually deploy

### Database Schema Changes
If you modify the database schema:
1. Update the schema in `shared/schema.ts`
2. Run `npm run db:push` to apply the changes to your database

## Database Backups
Regularly backup your PostgreSQL database using your provider's backup tools to prevent data loss.

---

If you encounter any issues with deployment, check the Netlify documentation or contact their support team for assistance.