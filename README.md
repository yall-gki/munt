# Munt

Munt is a Next.js crypto dashboard and portfolio tracker for monitoring real-time prices, visualizing charts, managing strategies, and tracking wallet performance.

## Features (Crypto Dashboard & Portfolio Tracker)
- Real-time market data with live BTC/ETH ticker
- Interactive line and candlestick charts with indicators (SMA, EMA, Bollinger Bands, RSI, MACD, VWAP)
- Portfolio wallet view with allocation charts, history, and performance
- Strategy creation and management (Indicator, Grid, DCA, Manual) with limits and safeguards
- In-app swaps using live prices, plus trade execution logs and strategy performance
- Favorite coins strip for quick access to tracked assets
- Authentication with email verification plus OAuth (Google, Discord)

## Tech Stack (Next.js, Prisma, PostgreSQL)
- Next.js App Router, React, TypeScript
- Prisma ORM + PostgreSQL (`pg`)
- NextAuth.js (Credentials, Google, Discord)
- Tailwind CSS, Radix UI, Framer Motion
- TanStack Query + Zustand
- Chart.js + Lightweight Charts + technicalindicators
- Upstash Redis caching, Nodemailer SMTP

## Installation (Node.js, Prisma, PostgreSQL)
1. Install dependencies: `npm install`
2. Create `.env` with the variables listed below.
3. Run database migrations: `npx prisma migrate dev`
4. Start the dev server: `npm run dev`

Required environment variables:
- `DATABASE_URL`
- `NEXTAUTH_URL`
- `NEXTAUTH_SECRET`

Optional environment variables:
- OAuth: `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `DISCORD_CLIENT_ID`, `DISCORD_CLIENT_SECRET`
- Email/OTP: `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD`, `SMTP_FROM`, `SMTP_SECURE`, `EMAIL_ALLOW_MOCK`, `OTP_TTL_MINUTES`, `OTP_MAX_ATTEMPTS`, `OTP_RESEND_COOLDOWN_SECONDS`
- Cache: `REDIS_URL`, `REDIS_SECRET`
- Uploads: `UPLOADTHING_APP_ID`, `UPLOADTHING_SECRET`
- Cron: `CRON_SECRET`
- Pooling: `PG_POOL_MAX`, `PG_POOL_IDLE_MS`, `PG_POOL_TIMEOUT_MS`

## Usage (Crypto Dashboard Workflow)
1. Run `npm run dev` and open `http://localhost:3000`.
2. Sign up or sign in with email/password, Google, or Discord.
3. Open the Dashboard to view charts and indicators for a coin.
4. Use Wallet to generate demo balances, view allocations, and check history.
5. Create a strategy, execute an in-app trade, and review trade logs and performance.

## Use Cases (Crypto Portfolio, Strategy Research)
- Personal crypto portfolio tracking and performance monitoring
- Exploring technical indicators and real-time market data
- Testing strategy parameters with in-app trades and logs
- Reference project for Next.js, Prisma, and NextAuth integration
