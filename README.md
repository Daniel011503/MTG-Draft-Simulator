# MTG Draft Simulator

A real-time Magic: The Gathering draft practice tool built with modern web technologies. Practice drafting against AI bots to improve your skills!

## 🎯 Features

### ✅ **Currently Implemented**
- **User Authentication**: Complete registration and login system
- **Draft Creation**: Create new draft pods with customizable settings
- **Bot AI Opponents**: Intelligent AI bots that make realistic draft picks
- **Real-time Drafting**: Pick cards from booster packs with live updates
- **Pack Generation**: Proper MTG booster pack distribution (1 rare, 3 uncommons, 10+ commons)
- **Draft Management**: Track your picks, see drafted cards, and manage active drafts
- **Responsive UI**: Clean, modern interface that works on all devices
- **Card Database**: 30+ sample cards from Lord of the Rings set
- **Practice Mode**: Start instant practice drafts with 7 AI opponents

### 🚧 **Coming Soon**
- Real card images from Scryfall API
- Additional MTG sets and formats
- Advanced bot AI with different difficulty levels
- Draft analytics and pick tracking
- Multiplayer drafts with friends
- Export drafted decks
- Draft history and statistics

## 🛠️ Tech Stack

- **Backend**: Node.js + Fastify + TypeScript
- **Database**: PostgreSQL with dynamic table creation
- **Frontend**: Next.js 14 + React + TypeScript + Tailwind CSS
- **Authentication**: JWT tokens with bcrypt password hashing
- **Infrastructure**: Docker + Docker Compose
- **API Documentation**: Swagger/OpenAPI

## 🚀 Quick Start

### Prerequisites

- Docker and Docker Compose
- Git

### 1. Clone and Start

```bash
git clone https://github.com/Daniel011503/MTG-Draft-Simulator.git
cd MTG-Draft-Simulator
docker-compose up --build
```

### 2. Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **API Docs**: http://localhost:3001/docs
- **Database Admin**: http://localhost:8080 (user: `admin`, pass: `admin`)

### 3. Start Drafting!

1. Register a new account
2. Click "Start Practice" to begin a draft with AI bots
3. Pick cards from your pack
4. Watch as bots make their picks automatically
5. Continue until all packs are completed

## 🎮 How to Use

### Practice Mode
1. **Register/Login** - Create your account
2. **Start Practice** - Click the purple "Start Practice" button
3. **Draft Cards** - Click cards in your pack to pick them
4. **Continue Drafting** - Bots will automatically pick and pass packs
5. **View Your Picks** - See all cards you've drafted on the right

### Draft Features
- **Pack Passing**: Cards automatically pass to the next player
- **Bot Intelligence**: AI bots prioritize rare cards and make logical picks
- **Real-time Updates**: See pack changes and new cards immediately
- **Pick Tracking**: All your picks are saved and displayed

## 📁 Project Structure

```
MTG-Draft-Simulator/
├── backend/                 # Node.js + Fastify API
│   ├── src/
│   │   └── index.ts        # Main server with all routes and game logic
│   └── package.json
├── frontend/               # Next.js React application
│   ├── src/
│   │   └── app/
│   │       ├── page.tsx           # Main lobby page
│   │       └── draft/[id]/        # Draft gameplay page
│   │           └── page.tsx
│   └── public/
│       └── placeholder-card.svg   # Card placeholder image
├── docker-compose.yml      # All services configuration
└── README.md
```

## 🔧 API Endpoints

### Authentication
- `POST /auth/register` - Create new user account
- `POST /auth/login` - Login user
- `GET /auth/me` - Get current user info

### Draft Management
- `POST /api/drafts` - Create new draft
- `GET /api/drafts` - Get available drafts
- `GET /api/drafts/my-active` - Get user's active drafts
- `POST /api/drafts/:id/join` - Join a draft
- `POST /api/drafts/:id/start` - Start draft (fills with bots)

### Draft Gameplay
- `GET /api/drafts/:id/pack` - Get current pack for user
- `POST /api/drafts/:id/pick` - Pick a card from pack
- `GET /api/drafts/:id/picks` - Get all user's picked cards

### System
- `GET /health` - Health check
- `GET /health/db` - Database health check
- `GET /docs` - API documentation (Swagger)

## 🤖 Bot AI Features

The AI bots are designed to simulate realistic draft opponents:

- **Rarity Priority**: Bots prefer rare and mythic cards
- **Random Selection**: Falls back to random picks for variety
- **Automatic Timing**: 1-second delay between picks for realism
- **Named Bots**: Each bot has a unique name (AlphaDrafter, BetaBot, etc.)

## 🚀 Deployment

Ready for deployment to any Docker-compatible platform:

- **Railway** (Recommended)
- **Render**
- **AWS ECS**
- **DigitalOcean**
- **Google Cloud Run**

### Environment Variables
```bash
DATABASE_URL=postgresql://user:pass@host:5432/db
JWT_SECRET=your-super-secure-secret
NODE_ENV=production
PORT=3001
```

## 🧪 Testing

Manual testing commands for development:

```bash
# Test health endpoints
curl http://localhost:3001/health
curl http://localhost:3001/health/db

# Test user registration
curl -X POST http://localhost:3001/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","username":"testuser","password":"password123"}'

# Test draft creation (requires auth token)
curl -X POST http://localhost:3001/api/drafts \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"name":"Test Draft","setCode":"LTR","maxPlayers":8}'
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a Pull Request

## 📜 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Magic: The Gathering © Wizards of the Coast
- Built for educational and practice purposes
- Lord of the Rings card names used for demonstration

---

**Ready to draft? Start your practice session now!** 🎉
