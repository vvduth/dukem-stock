# 📈 Dukem Stock

A modern, full-stack stock market tracking and analysis platform built with Next.js 15, featuring real-time market data, watchlists, personalized news, and comprehensive stock analysis tools.

🌐 **Live Demo:** [https://dukem-stock.vercel.app/](https://dukem-stock.vercel.app/)

![Dukem Stock Dashboard](snip-1.png)

## ✨ Features

### 🔍 Stock Search & Discovery
- **Real-time Search**: Search stocks using Finnhub API with autocomplete
- **Popular Stocks**: Browse top 10 popular stocks when no query is provided
- **Keyboard Shortcuts**: Quick access with `Cmd/Ctrl + K`

### 📊 Market Visualization
- **Interactive Charts**: Multiple TradingView widgets including:
  - Market Overview
  - Stock Heatmaps
  - Candlestick Charts
  - Baseline Charts
  - Technical Analysis
- **Company Profiles**: Detailed company information and financials
- **Real-time Data**: Live market quotes and price updates

### ⭐ Watchlist Management
- **Personal Watchlists**: Add/remove stocks to your watchlist
- **Persistent Storage**: MongoDB-backed watchlist with user authentication
- **Duplicate Prevention**: Compound indexes prevent duplicate entries

### 📰 Personalized News
- **Daily News Summary**: Scheduled emails at 12 PM UTC daily
- **Company-Specific News**: Get news for stocks in your watchlist
- **Smart Distribution**: Round-robin news fetching (max 6 articles per user)
- **AI-Powered Summaries**: Gemini AI integration for personalized content
- **Market News Fallback**: General market news when no watchlist exists

### 🔐 Authentication
- **Better Auth Integration**: Secure email/password authentication
- **User Profiles**: Store investment goals, risk tolerance, and preferences
- **Country Selection**: International support with country-specific features
- **Personalized Onboarding**: AI-generated welcome emails

### 🎨 Modern UI/UX
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Dark Mode**: Custom dark theme optimized for trading
- **ShadCN Components**: Beautiful, accessible UI components
- **Command Palette**: Quick navigation and search

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 15 (App Router, React 19, Turbopack)
- **Styling**: Tailwind CSS 4 with custom animations
- **UI Components**: Radix UI + ShadCN
- **State Management**: React Hooks
- **Forms**: React Hook Form
- **Icons**: Lucide React

### Backend
- **Runtime**: Node.js with Next.js API Routes
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: Better Auth
- **Job Scheduling**: Inngest (cron jobs & event-driven functions)
- **Email**: Nodemailer
- **AI Integration**: Google Gemini API

### External APIs
- **Market Data**: Finnhub API
- **Charts**: TradingView Widgets
- **Symbol Conversion**: Custom Finnhub ↔ TradingView mapping

## 📁 Project Structure

```
dukem-stock/
├── app/
│   ├── (auth)/              # Authentication pages
│   │   ├── sign-in/
│   │   └── sign-up/
│   ├── (root)/              # Main application
│   │   ├── page.tsx         # Dashboard
│   │   └── stocks/
│   │       └── [symbol]/    # Stock details page
│   ├── api/
│   │   └── inngest/         # Inngest function handlers
│   ├── globals.css
│   └── layout.tsx
├── components/
│   ├── forms/               # Form components
│   ├── ui/                  # ShadCN components
│   ├── Header.tsx
│   ├── SearchCommand.tsx    # Cmd+K search
│   ├── TradingViewWidget.tsx
│   └── WatchlistButton.tsx
├── database/
│   ├── models/
│   │   └── watchlist.model.ts
│   └── mongoose.ts          # Database connection
├── lib/
│   ├── actions/             # Server actions
│   │   ├── auth.action.ts
│   │   ├── finnhub.actions.ts
│   │   ├── user.actions.ts
│   │   └── watchlist.actions.ts
│   ├── better-auth/         # Auth configuration
│   ├── inngest/             # Job definitions
│   ├── nodemailer/          # Email templates
│   ├── constants.ts         # Widget configs
│   └── utils.ts             # Utility functions
├── hooks/                   # Custom React hooks
├── middleware/              # Auth middleware
└── types/
    └── global.d.ts          # TypeScript definitions
```

## 🚀 Getting Started

### Prerequisites
- Node.js 20+
- MongoDB database
- Finnhub API key
- Gemini API key (optional, for AI features)

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/vvduth/dukem-stock.git
cd dukem-stock
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**

Create a `.env.local` file:

```env
# Database
MONGODB_URI=your_mongodb_connection_string

# Finnhub API
NEXT_PUBLIC_FINNHUB_API_KEY=your_finnhub_api_key

# Better Auth
BETTER_AUTH_SECRET=your_secret_key
BETTER_AUTH_URL=http://localhost:3000

# Gemini AI (optional)
GEMINI_API_KEY=your_gemini_api_key

# Email (optional)
NODEMAILER_EMAIL=ducthai060501@gmail.com 
NODEMAILER_PASSWORD=rdfgfzysrbrmpnxv
```

4. **Run the development server**
```bash
npm run dev
```

5. **Run Inngest dev server** (in separate terminal)
```bash
npx inngest-cli@latest dev
```

6. **Open the app**

Navigate to [http://localhost:3000](http://localhost:3000)

## 📝 Key Features Implementation

### Stock Search
```typescript
// Uses React cache for optimal performance
export const searchStocks = cache(async (query?: string) => {
  // Returns popular stocks if no query
  // Searches Finnhub API with query
  // Maps to StockWithWatchlistStatus
});
```

### Symbol Mapping
The app handles symbol format differences between Finnhub and TradingView:

```typescript
// Finnhub: FIA1S.HE → TradingView: OMXH:FIA1S
export function finnhubToTradingViewSymbol(symbol: string) {
  // Maps exchange suffixes to prefixes
  // Supports multiple international exchanges
}
```

### Daily News Job
```typescript
export const sendDailyNewsSummary = inngest.createFunction(
  { id: "daily-news-summary" },
  [{ event: "app/send.daily.news" }, { cron: "0 12 * * *" }],
  async ({ step }) => {
    // 1. Get all users
    // 2. Fetch personalized news per user
    // 3. Summarize with AI
    // 4. Send emails
  }
);
```

## 🎯 API Endpoints

- `GET /api/inngest` - Inngest webhook endpoint
- Server Actions (via Next.js):
  - `searchStocks(query)` - Search stocks
  - `getNews(symbols)` - Fetch news
  - `getWatchlistSymbolsByEmail(email)` - Get user watchlist

## 🔧 Configuration

### TradingView Widgets
Widget configurations are stored in `/lib/constants.ts`:
- `SYMBOL_INFO_WIDGET_CONFIG`
- `CANDLE_CHART_WIDGET_CONFIG`
- `BASELINE_WIDGET_CONFIG`
- `TECHNICAL_ANALYSIS_WIDGET_CONFIG`
- `COMPANY_PROFILE_WIDGET_CONFIG`
- `COMPANY_FINANCIALS_WIDGET_CONFIG`

### Inngest Jobs
- **Sign-up Email**: Triggered on user creation
- **Daily News Summary**: Runs daily at 12 PM UTC

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is open source and available under the MIT License.

## 🙏 Acknowledgments

- [Finnhub](https://finnhub.io/) for market data API
- [TradingView](https://www.tradingview.com/) for interactive charts
- [Vercel](https://vercel.com/) for hosting
- [ShadCN](https://ui.shadcn.com/) for UI components

## 📧 Contact

For questions or feedback, please open an issue on GitHub.

---

Built using Next.js and modern web technologies.
