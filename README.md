# My Setup API Server

Backend API for the 3D Workspace Designer application.

## 🚀 Quick Start

1. Install dependencies:
```bash
npm install
```

2. Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

3. Start development server:
```bash
npm run dev
```

The API will be available at `http://localhost:4000`

## 📁 Project Structure

```
my-setup-server/
├── src/
│   ├── server.ts              # Main Express server
│   ├── routes/
│   │   ├── index.ts           # Main API router
│   │   └── layouts.example.ts # Example route template
│   ├── middleware/
│   │   └── errorHandler.ts    # Error handling middleware
│   ├── types/
│   │   └── index.ts           # TypeScript type definitions
│   ├── config/
│   │   └── index.ts           # Configuration management
│   ├── controllers/           # Ready for your controllers
│   ├── models/                # Ready for database models
│   └── utils/                 # Ready for utility functions
├── .env                       # Environment variables (gitignored)
├── .env.example               # Environment variables template
├── package.json
├── tsconfig.json
└── README.md
```

## 📝 Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run type-check` - Check TypeScript types

## 🔌 API Endpoints

### Current Endpoints

- `GET /health` - Health check
- `GET /api` - API information

### Ready to Implement

- Layout routes (template provided in `src/routes/layouts.example.ts`)
- User authentication
- Public gallery
- Collaboration features

## 🔧 Configuration

Environment variables (`.env`):

- `PORT` - Server port (default: 4000)
- `NODE_ENV` - Environment (development/production)
- `FRONTEND_URL` - Frontend URL for CORS (default: http://localhost:3000)
- `JWT_SECRET` - Secret key for JWT tokens

## 🔗 Frontend Connection

The backend is configured to accept requests from:
- `http://localhost:3000` (frontend)

CORS is properly configured to allow cross-origin requests.

## 📦 Tech Stack

- **Express.js** - Web framework
- **TypeScript** - Type safety
- **CORS** - Cross-origin resource sharing
- **dotenv** - Environment variable management

## ✅ All Files Present

All backend files are organized in the `src/` folder structure:
- ✅ Server setup complete
- ✅ Routes structure ready
- ✅ Error handling configured
- ✅ Types defined
- ✅ Configuration management ready

## 🎯 Next Steps

1. Implement layout routes (copy `layouts.example.ts` to `layouts.ts`)
2. Add database (PostgreSQL/MongoDB/SQLite)
3. Add user authentication
4. Implement additional features

---

**Backend is ready and connected to frontend!** 🎉
