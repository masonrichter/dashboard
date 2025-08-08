# Buffer Social Media Scheduler

This document describes the Buffer social media scheduler functionality implemented in the Avista Dashboard.

## Overview

The Buffer scheduler allows you to create, schedule, and manage social media posts across multiple platforms using the Buffer API. You can schedule posts for specific dates and times, view upcoming scheduled posts, and manage your social media content from one central location.

## Features

### 1. Social Media Platform Integration
- **Multiple Platforms**: Support for Twitter, LinkedIn, Facebook, Instagram, Pinterest, and more
- **Real Account Data**: Displays actual connected social media accounts from your Buffer profile
- **Platform Icons**: Visual indicators for each social media platform
- **Account Usernames**: Shows the actual usernames for each connected account

### 2. Post Creation & Scheduling
- **Rich Text Editor**: Create posts with up to 280 characters
- **Multi-Platform Selection**: Choose which platforms to post to
- **Date & Time Scheduling**: Schedule posts for specific dates and times
- **Image Support**: Add images to posts via URL
- **Character Counter**: Real-time character count display

### 3. Post Management
- **Scheduled Posts View**: See all upcoming scheduled posts
- **Post Status**: Track post status (pending, sent, failed)
- **Post Actions**: 
  - Share immediately
  - Move to top of queue
  - Delete posts
- **Post Details**: View scheduled date/time, content, and target platforms

### 4. Platform Statistics
- **Overview Dashboard**: See post counts per platform
- **Account Information**: Display connected account details
- **Visual Statistics**: Easy-to-read platform overview

## Setup Instructions

### 1. Buffer API Configuration

1. **Get Buffer Access Token**:
   - Go to [Buffer App](https://buffer.com)
   - Navigate to Settings → API
   - Generate a new access token
   - Copy the token

2. **Environment Variables**:
   Add the following to your `.env.local` file:
   ```
   BUFFER_ACCESS_TOKEN=your_buffer_access_token_here
   ```

   Or for client-side access (if needed):
   ```
   NEXT_PUBLIC_BUFFER_ACCESS_TOKEN=your_buffer_access_token_here
   ```

### 2. Connect Social Media Accounts

1. **Buffer Account Setup**:
   - Log into your Buffer account
   - Connect your social media accounts (Twitter, LinkedIn, Facebook, etc.)
   - Ensure accounts are properly authenticated

2. **Verify Connection**:
   - The scheduler will automatically detect connected accounts
   - You'll see account usernames and platform icons

## Usage Guide

### Creating a New Post

1. **Open the Scheduler**:
   - Navigate to the Buffer Scheduler component
   - Click "Create Post" button

2. **Write Your Content**:
   - Enter your post text (max 280 characters)
   - Use the character counter to stay within limits

3. **Select Platforms**:
   - Choose which social media platforms to post to
   - You can select multiple platforms for the same post
   - Each platform shows the account username

4. **Schedule the Post**:
   - Pick a date and time for the post
   - The minimum date is set to the current time
   - Posts can be scheduled up to several months in advance

5. **Add Media (Optional)**:
   - Include an image URL if desired
   - The image will be attached to the post

6. **Submit**:
   - Click "Schedule Post" to create the scheduled post
   - The post will appear in your scheduled posts list

### Managing Scheduled Posts

1. **View Scheduled Posts**:
   - All scheduled posts are displayed in chronological order
   - Each post shows status, scheduled time, content, and target platforms

2. **Post Actions**:
   - **Share Now**: Immediately publish a pending post
   - **Move to Top**: Prioritize a post in the queue
   - **Delete**: Remove a post from the schedule

3. **Post Status**:
   - **Pending**: Scheduled but not yet published
   - **Sent**: Successfully published
   - **Failed**: Failed to publish (with error details)

### Platform Overview

- **Statistics Dashboard**: See how many posts are scheduled per platform
- **Account Information**: View connected account details
- **Quick Overview**: Get a snapshot of your social media activity

## API Integration

The scheduler uses the Buffer API v1 to:

- **Fetch Profiles**: Get connected social media accounts
- **Create Updates**: Schedule new posts
- **Get Updates**: Retrieve scheduled posts
- **Delete Updates**: Remove scheduled posts
- **Share Updates**: Publish posts immediately
- **Move Updates**: Reorder post queue

### API Endpoints Used

- `GET /profiles.json` - Get connected social media accounts
- `GET /updates/pending.json` - Get scheduled posts
- `POST /updates/create.json` - Create new scheduled post
- `POST /updates/{id}/destroy.json` - Delete a post
- `POST /updates/{id}/share.json` - Share a post immediately
- `POST /updates/{id}/move_to_top.json` - Move post to top of queue

## Error Handling

The scheduler includes comprehensive error handling:

- **API Configuration Errors**: Clear messages when Buffer API is not configured
- **Network Errors**: Proper error messages for connection issues
- **Validation Errors**: Form validation with helpful error messages
- **API Response Errors**: Detailed error messages from Buffer API
- **Retry Functionality**: Easy retry options for failed operations

## Security Features

- **Environment Variables**: Secure storage of API tokens
- **Client-Side Validation**: Form validation before API calls
- **Error Boundaries**: Graceful error handling without exposing sensitive data
- **Token Management**: Secure handling of Buffer access tokens

## Technical Implementation

### Files Modified/Created

1. **`lib/buffer.ts`** - Enhanced Buffer API integration:
   - Added comprehensive error handling
   - New helper functions for platform display
   - Enhanced types and interfaces
   - Better API response handling

2. **`app/components/BufferScheduler.tsx`** - Updated component:
   - Real API integration instead of mock data
   - Loading states and error handling
   - Form validation and submission
   - Post management functionality

### Key Features

- **Real-time Data**: Live data from Buffer API
- **Responsive Design**: Works on desktop and mobile
- **Loading States**: Proper loading indicators
- **Error Recovery**: Easy retry mechanisms
- **Form Validation**: Client-side validation
- **Character Limits**: Twitter-style character counting

## Troubleshooting

### Common Issues

1. **"Buffer API not configured" Error**:
   - Ensure `BUFFER_ACCESS_TOKEN` is set in environment variables
   - Check that the token is valid and not expired

2. **"No social media accounts connected"**:
   - Verify your Buffer account has connected social media accounts
   - Check that accounts are properly authenticated in Buffer

3. **Posts not appearing**:
   - Refresh the scheduled posts list
   - Check Buffer dashboard for any API errors
   - Verify post scheduling time is in the future

4. **API Rate Limits**:
   - Buffer has rate limits on API calls
   - Wait a few minutes before retrying if you hit limits

### Getting Help

- Check Buffer's [API Documentation](https://buffer.com/developers/api)
- Verify your access token in Buffer's API settings
- Check the browser console for detailed error messages
- Ensure all social media accounts are properly connected in Buffer

## Future Enhancements

Potential improvements could include:
- Post templates and saved drafts
- Bulk post scheduling
- Analytics and engagement tracking
- Image upload functionality
- Post preview for each platform
- Advanced scheduling options (recurring posts)
- Integration with other social media tools 