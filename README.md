# F&O Watchlist with Live Margin (Netlify)

Production-ready React + Vite frontend with Netlify Functions backend for Definedge Securities integration.

## Project Structure

```txt
.
├── netlify
│   └── functions
│       ├── _client.js
│       ├── margin.js
│       ├── master.js
│       └── quotes.js
├── public
├── src
│   ├── components
│   │   ├── ControlPanel.jsx
│   │   ├── FuturesTable.jsx
│   │   └── OptionsTable.jsx
│   ├── hooks
│   │   └── useDebounce.js
│   ├── lib
│   │   ├── api.js
│   │   └── fno.js
│   ├── App.jsx
│   ├── index.css
│   └── main.jsx
├── .env.example
├── netlify.toml
├── package.json
└── tailwind.config.js
```

## Features

- Futures watchlist with Near / Next / Far expiry mapping.
- Options chain around ATM using N ITM + N OTM strikes.
- CE/PE LTP and Buy/Sell margin.
- Delivery margin risk warning for ITM options with expiry <= 1 day.
- Polling every 2.5 seconds.
- 1-2 second in-function cache for quotes/margin.
- Parallel margin requests for faster response.

## Environment Variables

Use Netlify UI or `.env` locally.

```bash
DEFINEDGE_API_KEY=your_definedge_api_key
DEFINEDGE_BASE_URL=https://api.definedgesecurities.com
MASTER_FILE_URL=https://your-hosted-master-file.csv
```

## Local Development

```bash
npm install
npm run dev
```

## Netlify Deployment

1. Push this repository to GitHub.
2. In Netlify, **Add new site > Import from Git**.
3. Build settings:
   - Build command: `npm run build`
   - Publish directory: `dist`
   - Functions directory: `netlify/functions`
4. Add environment variables:
   - `DEFINEDGE_API_KEY`
   - `DEFINEDGE_BASE_URL` (optional if default works)
   - `MASTER_FILE_URL` (optional)
5. Deploy.

All frontend calls are routed through `/.netlify/functions/*` via `netlify.toml` rewrite `/api/*`.

## API Endpoints (Netlify Functions)

- `POST /api/quotes` → proxies Definedge `/quotes`
- `POST /api/margin` → proxies Definedge `/margin`
- `GET /api/master` → reads master file URL or Definedge `/master`

## Optional Extensions

- Margin efficiency (premium / margin)
- Greeks (delta, theta) if quote feed provides greeks endpoint
- Multi-leg strategy margin calculator using bundled margin payload
