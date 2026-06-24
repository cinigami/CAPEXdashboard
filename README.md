# PCFK CAPEX Dashboard

Capital Expenditure (CAPEX) Tracking and Visualization Dashboard for PETRONAS Chemicals Fertiliser Kedah (PCFK) - Maintenance & Reliability Department.

## Overview

A modern web-based dashboard for monitoring and tracking capital expenditure utilization across plant areas. Built to provide real-time visibility into budget allocation, spending patterns, and project status.

## Features

- 📊 **Budget Visualization** - Interactive charts showing CAPEX allocation and utilization
- 📈 **Spending Tracking** - Monitor expenditure against approved budgets
- 🏭 **Plant Area Breakdown** - View spending by Ammonia, Urea, Utility, and Offsite areas
- 📅 **Timeline View** - Track spending patterns over time
- 📁 **Data Import** - Excel file upload for budget data
- 🎨 **PETRONAS Branding** - Corporate styling and color scheme

## Tech Stack

- **React** - UI framework
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Utility-first styling
- **Recharts** - Data visualization (if applicable)

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/cinigami/CAPEXdashboard.git
cd CAPEXdashboard

# Install dependencies
npm install

# Start development server
npm run dev
```

### Build for Production

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## Deployment

### Netlify

1. Connect your GitHub repository to Netlify
2. Build command: `npm run build`
3. Publish directory: `dist`

### Vercel

```bash
npx vercel
```

## Project Structure

```
├── index.html          # HTML entry point
├── package.json        # Dependencies & scripts
├── vite.config.js      # Vite configuration
├── tailwind.config.js  # Tailwind CSS configuration
├── postcss.config.js   # PostCSS configuration
└── src/
    ├── main.jsx        # React entry point
    ├── App.jsx         # Main application component
    └── ...             # Additional components
```

## Development Approach

This project was developed using **AI-assisted development** (vibe coding) with Claude, demonstrating rapid prototyping and implementation of industrial dashboard solutions.

## Related Projects

- [InstrumentDashboard](https://github.com/cinigami/InstrumentDashboard) - Equipment Health Monitoring Dashboard

## Author

**Khadhijah** - Instrument Executive, Maintenance & Reliability Department, PCFK

## License

© 2025 PETRONAS Chemicals Fertiliser Kedah
