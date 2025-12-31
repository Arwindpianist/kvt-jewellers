# KVT Jewellers Website & Staff Web App

A modern, secure rebuild of the KVT Jewellers website and staff management system.

## Features

### Public Website
- Homepage with brand messaging and featured products
- Live gold and silver price display
- Product catalog (Coins, Bars, Jewelry)
- Product detail pages
- About Us and Contact pages
- PWA support (installable, offline fallback)

### Staff Web App
- Secure authentication (mock implementation)
- Gold price management (view, override, publish/unpublish)
- Product management (CRUD operations)
- Tablet-optimized interface

## Tech Stack

- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + shadcn/ui
- **PWA**: next-pwa
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
cp .env.example .env
```

Edit `.env` and configure:
- `GOLD_PRICE_API_URL` - URL for gold price API (e.g., metals.live or goldapi.io)
- `GOLD_PRICE_API_KEY` - API key for gold price service
- `AUTH_SECRET` - Secret for authentication (for future real auth)
- `NEXT_PUBLIC_APP_URL` - Public URL of the app

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Demo Credentials

### Staff Login
- **Admin**: admin@kvtjewellers.com / password
- **Staff**: staff@kvtjewellers.com / password

## Project Structure

```
kvt-jewellers/
├── app/
│   ├── (public)/          # Public website routes
│   ├── (staff)/            # Staff app routes (protected)
│   ├── api/               # API routes
│   └── layout.tsx         # Root layout
├── components/
│   ├── public/            # Public site components
│   ├── staff/             # Staff app components
│   └── ui/                # shadcn/ui components
├── lib/                   # Utility functions
├── types/                  # TypeScript type definitions
└── public/                # Static assets
```

## Security Features

- **Server-side gold price fetching**: All external API calls happen server-side only
- **No exposed endpoints**: Provider URLs and API keys never reach the client
- **Protected staff routes**: Middleware protects all `/staff/*` routes
- **Rate limiting**: Public API endpoints have basic rate limiting

## PWA Setup

The app is configured as a PWA. To complete setup:

1. Add app icons to `public/icons/` in the following sizes:
   - 72x72, 96x96, 128x128, 144x144, 152x152, 192x192, 384x384, 512x512

2. Icons should be square PNG images with a gold/logo design.

## Development Notes

- Mock authentication is implemented for development
- Product and price data is stored in-memory (will be migrated to database)
- Gold price API supports metals.live and goldapi.io formats
- All sensitive operations are server-side only

## Future Enhancements

- Migrate to Supabase Auth for real authentication
- Move data storage to Supabase Postgres
- Add image upload functionality for products
- Implement real-time price updates
- Add analytics and monitoring

## License

Proprietary - KVT Jewellers

