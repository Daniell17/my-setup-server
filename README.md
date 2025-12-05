# My Setup API

Backend API for the 3D Workspace Designer application.

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Copy `.env.example` to `.env` and configure:
```bash
cp .env.example .env
```

3. Run development server:
```bash
npm run dev
```

The API will be available at `http://localhost:4000`

## 📁 Project Structure

```
my-setup-api/
├── src/
│   ├── config/          # Configuration files
│   ├── controllers/     # Route controllers
│   ├── middleware/      # Express middleware
│   ├── models/          # Data models (when database is added)
│   ├── routes/          # API routes
│   ├── types/           # TypeScript types
│   ├── utils/           # Utility functions
│   └── server.ts        # Main server file
├── .env                 # Environment variables (gitignored)
├── .env.example         # Environment variables template
├── tsconfig.json        # TypeScript configuration
└── package.json
```

## 📝 Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run type-check` - Check TypeScript types without building

## 🔌 API Endpoints

### Health Check
- `GET /health` - Check if API is running

More endpoints will be added as features are implemented.

## 🔧 Configuration

Environment variables (`.env`):

- `PORT` - Server port (default: 4000)
- `NODE_ENV` - Environment (development/production)
- `FRONTEND_URL` - Frontend URL for CORS (default: http://localhost:3000)
- `JWT_SECRET` - Secret key for JWT tokens

## 🔐 Future Features

- User authentication & authorization
- Layout storage & retrieval
- Public gallery
- Collaboration features
- Analytics

## 📦 Tech Stack

- **Express.js** - Web framework
- **TypeScript** - Type safety
- **CORS** - Cross-origin resource sharing
- **dotenv** - Environment variable management

## 🤝 Contributing

This is the backend repository for the My Setup project. See the main repository for contribution guidelines.

