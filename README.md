# CarGeek Frontend

Modern web frontend for the CarGeek automotive intelligence platform.

## Overview

This repository contains the frontend application for CarGeek, providing an intuitive interface for automotive research, vehicle comparisons, and market insights.

## Tech Stack

- **Framework**: [To be decided - Next.js/React/Vue]
- **Styling**: [To be decided - Tailwind CSS/CSS Modules]
- **State Management**: [To be decided]
- **API Integration**: REST/SSE with CarGeek Backend

## Features

- 🚗 Vehicle Research Interface
- 💬 Real-time Chat with CarGeek AI
- 📊 Market Analytics Dashboard
- 🔍 Advanced Vehicle Search
- 📱 Responsive Design
- ⚡ Server-Side Events for Real-time Updates

## Getting Started

### Prerequisites

- Node.js 18+
- npm/yarn/pnpm
- CarGeek backend running locally or accessible

### Installation

```bash
# Clone the repository
git clone https://github.com/tzulic/cargeek-frontend.git
cd cargeek-frontend

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local

# Start development server
npm run dev
```

### Environment Variables

```bash
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_API_KEY=your_api_key_here
```

## Project Structure

```
cargeek-frontend/
├── src/
│   ├── components/     # Reusable UI components
│   ├── pages/          # Application pages/routes
│   ├── services/       # API integration services
│   ├── hooks/          # Custom React hooks
│   ├── utils/          # Utility functions
│   └── styles/         # Global styles
├── public/             # Static assets
├── tests/              # Test files
└── docs/               # Documentation
```

## Development

```bash
# Run development server
npm run dev

# Build for production
npm run build

# Run tests
npm test

# Lint code
npm run lint
```

## API Integration

The frontend connects to the CarGeek backend API for:
- Vehicle data and specifications
- Real-time chat conversations
- Market listings and pricing
- Consumer sentiment analysis
- Media content (images/videos)

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is proprietary and confidential.

## Related Repositories

- [CarGeek Backend](https://github.com/tzulic/CarGeek) - Backend API and orchestration
- [CarGeek Chatbot](https://github.com/tzulic/cargeek-chatbot) - Chat interface component

## Contact

For questions or support, please contact the CarGeek development team.