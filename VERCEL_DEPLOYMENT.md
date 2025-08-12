# Vercel Deployment Guide

This guide will help you deploy the Avista Dashboard to Vercel.

## Prerequisites

1. A Vercel account (free tier available)
2. All required API keys and credentials
3. Git repository with your code

## Required Environment Variables

Before deploying, you'll need to set up the following environment variables in your Vercel project:

### Copper CRM API Configuration
```
COPPER_API_KEY=your_copper_api_key_here
COPPER_BASE_URL=https://api.copper.com/developer_api/v1
COPPER_USER_EMAIL=your_copper_user_email@example.com
```

### MailerLite API Configuration
```
MAILERLITE_API_KEY=your_mailerlite_api_key_here
```

### Google OAuth Configuration (for Gmail and Calendar integration)
```
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
GOOGLE_REDIRECT_URI=https://your-domain.vercel.app/auth/callback
```

### Buffer API Configuration (for social media posting)
```
BUFFER_ACCESS_TOKEN=your_buffer_access_token_here
```

### Next.js Public Variables
```
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id_here
NEXT_PUBLIC_GOOGLE_REDIRECT_URI=https://your-domain.vercel.app/auth/callback
NEXT_PUBLIC_BUFFER_ACCESS_TOKEN=your_buffer_access_token_here
```

## Deployment Steps

### 1. Connect to Vercel

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click "New Project"
3. Import your Git repository
4. Select the repository containing this dashboard

### 2. Configure Project Settings

1. **Framework Preset**: Next.js (should be auto-detected)
2. **Root Directory**: Leave as default (root of repository)
3. **Build Command**: `npm run build` (default)
4. **Output Directory**: `.next` (default)
5. **Install Command**: `npm install` (default)

### 3. Set Environment Variables

1. In the project settings, go to the "Environment Variables" section
2. Add each environment variable listed above
3. Make sure to set them for all environments (Production, Preview, Development)

### 4. Deploy

1. Click "Deploy"
2. Vercel will automatically build and deploy your application
3. The first deployment may take a few minutes

## Post-Deployment Configuration

### 1. Update OAuth Redirect URIs

After deployment, update your OAuth applications (Google, etc.) with the new callback URLs:

- Google OAuth: `https://your-domain.vercel.app/auth/callback`
- Any other OAuth providers should use your Vercel domain

### 2. Test API Endpoints

Use the built-in test endpoint to verify your environment variables are working:

```
https://your-domain.vercel.app/api/test-env
```

### 3. Custom Domain (Optional)

1. In your Vercel project settings, go to "Domains"
2. Add your custom domain
3. Update your OAuth redirect URIs with the new domain

## Troubleshooting

### Build Errors

If you encounter build errors:

1. Check that all environment variables are set correctly
2. Ensure all dependencies are properly installed
3. Check the build logs in Vercel dashboard

### API Errors

If API calls are failing:

1. Verify all API keys are correct
2. Check that the API services are accessible from Vercel's servers
3. Ensure OAuth redirect URIs are updated with your Vercel domain

### Environment Variables Not Working

1. Make sure environment variables are set for all environments
2. Redeploy after adding new environment variables
3. Check that variable names match exactly (case-sensitive)

## Security Notes

- Never commit `.env` files to your repository
- Use Vercel's environment variable system for all secrets
- Regularly rotate your API keys
- Monitor your API usage to avoid rate limits

## Performance Optimization

- The application is configured for optimal performance on Vercel
- Static pages are pre-rendered where possible
- API routes are serverless functions with appropriate timeouts
- Images are optimized using Next.js Image component

## Support

If you encounter issues:

1. Check the Vercel deployment logs
2. Verify all environment variables are set correctly
3. Test API endpoints individually
4. Check the browser console for client-side errors
