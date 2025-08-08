# Glenn Dashboard

A comprehensive client management dashboard built with Next.js, TypeScript, and Tailwind CSS. This dashboard integrates with Copper CRM, MailerLite, Buffer, and Google Calendar to provide a unified platform for managing financial advisory clients.

## 🚀 Features

### Core Dashboard
- **Dashboard Overview**: AUM tracking, client analytics, and key performance metrics
- **Client Management**: Detailed client profiles with AUM tracking and status management
- **Task Management**: Create, track, and manage client-related tasks and appointments

### CRM Integration (Copper)
- **Contact Management**: View and manage all Copper CRM contacts
- **Search & Filter**: Advanced search and filtering capabilities
- **Tag Management**: Organize contacts with custom tags and categories
- **Real-time Sync**: Live data synchronization with Copper CRM

### Email Marketing (MailerLite)
- **Campaign Creation**: Create and send email campaigns from templates
- **Subscriber Management**: Manage email lists and subscriber groups
- **Analytics**: Track open rates, click rates, and campaign performance
- **Scheduling**: Schedule campaigns for optimal delivery times

### Social Media Management (Buffer)
- **Post Scheduling**: Schedule posts across multiple social media platforms
- **Content Management**: Create and manage social media content
- **Platform Integration**: Support for LinkedIn, Twitter, Facebook, and Instagram
- **Analytics**: Track engagement and performance metrics

### Calendar Integration (Google Calendar)
- **Event Management**: Create and manage client appointments
- **Calendar Sync**: Real-time synchronization with Google Calendar
- **Meeting Scheduling**: Schedule and track client meetings
- **Reminder System**: Automated reminders for upcoming appointments

### Analytics & Reporting
- **Campaign Analytics**: Comprehensive email and social media analytics
- **Client Analytics**: Track client engagement and portfolio performance
- **Performance Metrics**: Key performance indicators and trend analysis
- **Custom Reports**: Generate custom reports for different time periods

## 🛠️ Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Headless UI + Heroicons
- **Charts**: Recharts
- **HTTP Client**: Axios
- **Date Handling**: date-fns
- **Forms**: React Hook Form
- **Notifications**: React Hot Toast

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd glenn-dashboard
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp env.example .env.local
   ```
   
   Edit `.env.local` and add your API keys:
   ```env
   # Copper CRM API
   COPPER_API_KEY=your_copper_api_key_here
   COPPER_BASE_URL=https://api.copper.com

   # MailerLite API
   MAILERLITE_API_KEY=your_mailerlite_api_key_here

   # Buffer API
   BUFFER_ACCESS_TOKEN=your_buffer_access_token_here
   BUFFER_CLIENT_ID=your_buffer_client_id_here
   BUFFER_CLIENT_SECRET=your_buffer_client_secret_here

   # Google Calendar API
   GOOGLE_CLIENT_ID=your_google_client_id_here
   GOOGLE_CLIENT_SECRET=your_google_client_secret_here
   GOOGLE_REDIRECT_URI=http://localhost:3000/api/auth/google/callback
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🔧 API Setup

### Copper CRM
1. Sign up for a Copper account
2. Generate an API key from your Copper settings
3. Add the API key to your `.env.local` file

### MailerLite
1. Create a MailerLite account
2. Generate an API key from your account settings
3. Add the API key to your `.env.local` file

### Buffer
1. Create a Buffer account
2. Connect your social media accounts
3. Generate an access token from your Buffer settings
4. Add the access token to your `.env.local` file

### Google Calendar
1. Create a Google Cloud project
2. Enable the Google Calendar API
3. Create OAuth 2.0 credentials
4. Add the client ID and secret to your `.env.local` file

## 📁 Project Structure

```
glenn-dashboard/
├── app/
│   ├── components/          # Reusable UI components
│   │   ├── Layout.tsx       # Main layout wrapper
│   │   ├── Sidebar.tsx      # Navigation sidebar
│   │   ├── Header.tsx       # Top header bar
│   │   ├── DashboardSummary.tsx
│   │   ├── ClientCard.tsx
│   │   ├── CopperCRM.tsx
│   │   ├── MailerLiteSender.tsx
│   │   ├── CampaignAnalytics.tsx
│   │   ├── TagExplorer.tsx
│   │   └── BufferScheduler.tsx
│   ├── page.tsx             # Dashboard homepage
│   ├── clients/page.tsx     # Clients page
│   ├── crm/page.tsx         # CRM page
│   ├── mailer/page.tsx      # Email marketing page
│   ├── calendar/page.tsx    # Calendar page
│   ├── buffer/page.tsx      # Social media page
│   ├── analytics/page.tsx   # Analytics page
│   ├── tasks/page.tsx       # Tasks page
│   ├── layout.tsx           # Root layout
│   └── globals.css          # Global styles
├── lib/                     # API integrations and utilities
│   ├── copper.ts           # Copper CRM API
│   ├── mailerlite.ts       # MailerLite API
│   ├── buffer.ts           # Buffer API
│   ├── google.ts           # Google Calendar API
│   └── utils.ts            # Utility functions
├── public/                  # Static assets
├── package.json
├── tailwind.config.ts
├── next.config.ts
├── tsconfig.json
└── README.md
```

## 🎨 Customization

### Styling
The dashboard uses Tailwind CSS for styling. You can customize the design by modifying:
- `tailwind.config.ts` - Theme configuration
- `app/globals.css` - Global styles and custom components
- Individual component files for specific styling

### Components
All components are built with reusability in mind. You can easily:
- Modify existing components
- Create new components following the same patterns
- Extend functionality by adding new features

### API Integrations
The API integration files in the `lib/` directory can be extended to:
- Add new API endpoints
- Implement additional features
- Connect to other services

## 🚀 Deployment

### Vercel (Recommended)
1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add your environment variables in Vercel dashboard
4. Deploy

### Other Platforms
The dashboard can be deployed to any platform that supports Next.js:
- Netlify
- AWS Amplify
- DigitalOcean App Platform
- Railway

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

If you encounter any issues or have questions:
1. Check the [Issues](https://github.com/your-repo/issues) page
2. Create a new issue with detailed information
3. Contact the development team

## 🔮 Roadmap

- [ ] Real-time notifications
- [ ] Advanced reporting and analytics
- [ ] Mobile app version
- [ ] Multi-user support
- [ ] Advanced automation workflows
- [ ] Integration with additional CRM platforms
- [ ] Advanced social media analytics
- [ ] Client portal integration

---

Built with ❤️ for financial advisors who want to streamline their client management process. 