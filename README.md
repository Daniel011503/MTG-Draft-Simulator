# MTG Draft Simulator

A real-time Magic: The Gathering draft practice tool built with modern web technologies.

## 🎯 Features

- **Real-time Draft Practice**: Practice MTG drafting with AI or friends
- **Multiple Draft Formats**: Support for various Magic draft formats
- **User Management**: Account creation and authentication
- **Draft Analytics**: Track your picks and improve your drafting skills
- **Responsive Design**: Works on desktop and mobile devices

## 🛠️ Tech Stack

- **Backend**: Node.js + Fastify + TypeScript
- **Database**: PostgreSQL + Prisma ORM
- **Frontend**: Next.js 14 + React + TypeScript + Tailwind CSS
- **Infrastructure**: Docker + Docker Compose
- **Real-time**: WebSockets + Redis (planned)

## 🚀 Quick Start

### Prerequisites

- Docker and Docker Compose
- Node.js 18+ (for local development)
- Git

### Development Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/Daniel011503/MTG-Draft-Simulator.git
   cd MTG-Draft-Simulator
   ```

2. **Set up environment variables**
   ```bash
   cp backend/.env.example backend/.env
   # Edit backend/.env with your configuration
   ```

3. **Start the application with Docker**
   ```bash
   docker-compose up --build
   ```

4. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:3001
   - API Documentation: http://localhost:3001/docs
   - Database Admin: http://localhost:8080

### Manual Setup (without Docker)

1. **Install dependencies**
   ```bash
   npm install
   cd backend && npm install
   cd ../frontend && npm install
   ```

2. **Set up PostgreSQL database**
   - Install PostgreSQL locally
   - Create database `mtg_draft_simulator`
   - Update `DATABASE_URL` in `backend/.env`

3. **Run database migrations**
   ```bash
   cd backend
   npm run db:migrate
   ```

4. **Start development servers**
   ```bash
   # Terminal 1 - Backend
   cd backend
   npm run dev

   # Terminal 2 - Frontend
   cd frontend
   npm run dev
   ```

## 📁 Project Structure

```
MTG-Draft-Simulator/
├── backend/                 # Node.js + Fastify API
│   ├── src/
│   │   ├── index.ts        # Main server file
│   │   └── routes/         # API routes
│   ├── prisma/             # Database schema and migrations
│   └── package.json
├── frontend/               # Next.js React application
│   ├── src/
│   │   └── app/           # Next.js 14 app router
│   └── package.json
├── docker-compose.yml      # Docker services configuration
└── README.md
```

## 🔧 Development

### API Endpoints

- `GET /health` - Health check
- `GET /health/db` - Database health check
- `GET /docs` - API documentation (Swagger)

### Database Migrations

```bash
cd backend
npm run db:migrate     # Run migrations
npm run db:generate    # Generate Prisma client
```

### Building for Production

```bash
npm run build          # Build all services
```

## 🚀 Deployment

This application is containerized and ready for deployment to:

- **Railway**: Easy deployment with automatic Docker builds
- **Render**: Free tier available with PostgreSQL addon
- **AWS ECS**: Scalable container deployment
- **DigitalOcean App Platform**: Simple container hosting
- **Google Cloud Run**: Serverless container platform

### Environment Variables for Production

- `DATABASE_URL`: Production PostgreSQL connection string
- `JWT_SECRET`: Secure random string for JWT signing
- `NODE_ENV`: Set to `production`
- `PORT`: Application port (default: 3001)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes
4. Commit your changes: `git commit -m 'Add amazing feature'`
5. Push to the branch: `git push origin feature/amazing-feature`
6. Open a Pull Request

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Magic: The Gathering is a trademark of Wizards of the Coast
- Built for educational and practice purposes
- Thanks to the MTG community for inspiration

## 📞 Support

If you have any questions or need help:

1. Check the [Issues](https://github.com/Daniel011503/MTG-Draft-Simulator/issues) page
2. Create a new issue with detailed information
3. Join our community discussions

---

**Happy Drafting!** 🎉
