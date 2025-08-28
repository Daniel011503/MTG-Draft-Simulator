import 'dotenv/config'
import Fastify from 'fastify'
import cors from '@fastify/cors'
import helmet from '@fastify/helmet'
import swagger from '@fastify/swagger'
import swaggerUi from '@fastify/swagger-ui'
import jwt from '@fastify/jwt'
import { Client } from 'pg'
import bcrypt from 'bcryptjs'

// Sample card data for Lord of the Rings set
const SAMPLE_CARDS = [
  { id: 'ltr_001', name: 'Aragorn, King of Gondor', mana_cost: '{3}{W}{B}{G}', type_line: 'Legendary Creature — Human Noble', rarity: 'mythic', image_uris: { normal: 'https://cards.scryfall.io/normal/front/4/f/4f8129b8-73b2-4b9b-822b-4e8f9b2b6b8b.jpg' } },
  { id: 'ltr_002', name: 'Gandalf the Grey', mana_cost: '{3}{U}{R}', type_line: 'Legendary Creature — Avatar Wizard', rarity: 'mythic', image_uris: { normal: 'https://cards.scryfall.io/normal/front/4/f/4f8129b8-73b2-4b9b-822b-4e8f9b2b6b8b.jpg' } },
  { id: 'ltr_003', name: 'Legolas, Counter of Kills', mana_cost: '{2}{G}{W}', type_line: 'Legendary Creature — Elf Archer', rarity: 'rare', image_uris: { normal: 'https://cards.scryfall.io/normal/front/4/f/4f8129b8-73b2-4b9b-822b-4e8f9b2b6b8b.jpg' } },
  { id: 'ltr_004', name: 'Gimli, Counter of Kills', mana_cost: '{1}{R}{W}', type_line: 'Legendary Creature — Dwarf Warrior', rarity: 'rare', image_uris: { normal: 'https://cards.scryfall.io/normal/front/4/f/4f8129b8-73b2-4b9b-822b-4e8f9b2b6b8b.jpg' } },
  { id: 'ltr_005', name: 'Frodo, Sauron\'s Bane', mana_cost: '{W}{B}', type_line: 'Legendary Creature — Halfling Citizen', rarity: 'rare', image_uris: { normal: 'https://cards.scryfall.io/normal/front/4/f/4f8129b8-73b2-4b9b-822b-4e8f9b2b6b8b.jpg' } },
  { id: 'ltr_006', name: 'Sam, Loyal Attendant', mana_cost: '{1}{G}', type_line: 'Legendary Creature — Halfling Peasant', rarity: 'uncommon', image_uris: { normal: 'https://cards.scryfall.io/normal/front/4/f/4f8129b8-73b2-4b9b-822b-4e8f9b2b6b8b.jpg' } },
  { id: 'ltr_007', name: 'Merry, Esquire of Rohan', mana_cost: '{1}{W}', type_line: 'Legendary Creature — Halfling Knight', rarity: 'uncommon', image_uris: { normal: 'https://cards.scryfall.io/normal/front/4/f/4f8129b8-73b2-4b9b-822b-4e8f9b2b6b8b.jpg' } },
  { id: 'ltr_008', name: 'Pippin, Guard of the Citadel', mana_cost: '{1}{U}', type_line: 'Legendary Creature — Halfling Soldier', rarity: 'uncommon', image_uris: { normal: 'https://cards.scryfall.io/normal/front/4/f/4f8129b8-73b2-4b9b-822b-4e8f9b2b6b8b.jpg' } },
  { id: 'ltr_009', name: 'Boromir, Warden of the Tower', mana_cost: '{2}{W}', type_line: 'Legendary Creature — Human Soldier', rarity: 'rare', image_uris: { normal: 'https://cards.scryfall.io/normal/front/4/f/4f8129b8-73b2-4b9b-822b-4e8f9b2b6b8b.jpg' } },
  { id: 'ltr_010', name: 'Arwen, Elven Queen', mana_cost: '{1}{G}{U}', type_line: 'Legendary Creature — Elf Noble', rarity: 'rare', image_uris: { normal: 'https://cards.scryfall.io/normal/front/4/f/4f8129b8-73b2-4b9b-822b-4e8f9b2b6b8b.jpg' } },
  { id: 'ltr_011', name: 'Galadriel, Light of Valinor', mana_cost: '{2}{G}{U}', type_line: 'Legendary Creature — Elf Noble', rarity: 'mythic', image_uris: { normal: 'https://cards.scryfall.io/normal/front/4/f/4f8129b8-73b2-4b9b-822b-4e8f9b2b6b8b.jpg' } },
  { id: 'ltr_012', name: 'Elrond, Master of Healing', mana_cost: '{3}{G}{U}', type_line: 'Legendary Creature — Elf Noble', rarity: 'rare', image_uris: { normal: 'https://cards.scryfall.io/normal/front/4/f/4f8129b8-73b2-4b9b-822b-4e8f9b2b6b8b.jpg' } },
  { id: 'ltr_013', name: 'Sauron, the Necromancer', mana_cost: '{3}{B}{B}', type_line: 'Legendary Creature — Avatar Horror', rarity: 'mythic', image_uris: { normal: 'https://cards.scryfall.io/normal/front/4/f/4f8129b8-73b2-4b9b-822b-4e8f9b2b6b8b.jpg' } },
  { id: 'ltr_014', name: 'The One Ring', mana_cost: '{4}', type_line: 'Legendary Artifact', rarity: 'mythic', image_uris: { normal: 'https://cards.scryfall.io/normal/front/4/f/4f8129b8-73b2-4b9b-822b-4e8f9b2b6b8b.jpg' } },
  { id: 'ltr_015', name: 'Orcish Bowmasters', mana_cost: '{1}{B}', type_line: 'Creature — Orc Archer', rarity: 'rare', image_uris: { normal: 'https://cards.scryfall.io/normal/front/4/f/4f8129b8-73b2-4b9b-822b-4e8f9b2b6b8b.jpg' } },
  // Add more commons and uncommons for better pack distribution
  { id: 'ltr_016', name: 'Rohirrim Lancer', mana_cost: '{2}{W}', type_line: 'Creature — Human Knight', rarity: 'common', image_uris: { normal: 'https://cards.scryfall.io/normal/front/4/f/4f8129b8-73b2-4b9b-822b-4e8f9b2b6b8b.jpg' } },
  { id: 'ltr_017', name: 'Gondorian Soldier', mana_cost: '{1}{W}', type_line: 'Creature — Human Soldier', rarity: 'common', image_uris: { normal: 'https://cards.scryfall.io/normal/front/4/f/4f8129b8-73b2-4b9b-822b-4e8f9b2b6b8b.jpg' } },
  { id: 'ltr_018', name: 'Elvish Mariner', mana_cost: '{1}{U}', type_line: 'Creature — Elf Pilot', rarity: 'common', image_uris: { normal: 'https://cards.scryfall.io/normal/front/4/f/4f8129b8-73b2-4b9b-822b-4e8f9b2b6b8b.jpg' } },
  { id: 'ltr_019', name: 'Scroll of Isildur', mana_cost: '{1}', type_line: 'Artifact', rarity: 'common', image_uris: { normal: 'https://cards.scryfall.io/normal/front/4/f/4f8129b8-73b2-4b9b-822b-4e8f9b2b6b8b.jpg' } },
  { id: 'ltr_020', name: 'Mordor Orc', mana_cost: '{1}{B}', type_line: 'Creature — Orc Warrior', rarity: 'common', image_uris: { normal: 'https://cards.scryfall.io/normal/front/4/f/4f8129b8-73b2-4b9b-822b-4e8f9b2b6b8b.jpg' } },
  { id: 'ltr_021', name: 'Uruk-hai Berserker', mana_cost: '{2}{B}', type_line: 'Creature — Orc Berserker', rarity: 'uncommon', image_uris: { normal: 'https://cards.scryfall.io/normal/front/4/f/4f8129b8-73b2-4b9b-822b-4e8f9b2b6b8b.jpg' } },
  { id: 'ltr_022', name: 'Ent-Draught Basin', mana_cost: '{2}', type_line: 'Artifact', rarity: 'uncommon', image_uris: { normal: 'https://cards.scryfall.io/normal/front/4/f/4f8129b8-73b2-4b9b-822b-4e8f9b2b6b8b.jpg' } },
  { id: 'ltr_023', name: 'Hobbiton', mana_cost: '', type_line: 'Land', rarity: 'common', image_uris: { normal: 'https://cards.scryfall.io/normal/front/4/f/4f8129b8-73b2-4b9b-822b-4e8f9b2b6b8b.jpg' } },
  { id: 'ltr_024', name: 'Minas Tirith', mana_cost: '', type_line: 'Land', rarity: 'rare', image_uris: { normal: 'https://cards.scryfall.io/normal/front/4/f/4f8129b8-73b2-4b9b-822b-4e8f9b2b6b8b.jpg' } },
  { id: 'ltr_025', name: 'Eagle of the North', mana_cost: '{3}{W}', type_line: 'Creature — Bird', rarity: 'common', image_uris: { normal: 'https://cards.scryfall.io/normal/front/4/f/4f8129b8-73b2-4b9b-822b-4e8f9b2b6b8b.jpg' } },
  { id: 'ltr_026', name: 'Shire Veteran', mana_cost: '{1}{G}', type_line: 'Creature — Halfling Warrior', rarity: 'common', image_uris: { normal: 'https://cards.scryfall.io/normal/front/4/f/4f8129b8-73b2-4b9b-822b-4e8f9b2b6b8b.jpg' } },
  { id: 'ltr_027', name: 'Wizard\'s Rockets', mana_cost: '{1}{R}', type_line: 'Sorcery', rarity: 'common', image_uris: { normal: 'https://cards.scryfall.io/normal/front/4/f/4f8129b8-73b2-4b9b-822b-4e8f9b2b6b8b.jpg' } },
  { id: 'ltr_028', name: 'Scrying Palantír', mana_cost: '{3}', type_line: 'Artifact', rarity: 'uncommon', image_uris: { normal: 'https://cards.scryfall.io/normal/front/4/f/4f8129b8-73b2-4b9b-822b-4e8f9b2b6b8b.jpg' } },
  { id: 'ltr_029', name: 'Ranger of Ithilien', mana_cost: '{2}{G}', type_line: 'Creature — Human Ranger', rarity: 'uncommon', image_uris: { normal: 'https://cards.scryfall.io/normal/front/4/f/4f8129b8-73b2-4b9b-822b-4e8f9b2b6b8b.jpg' } },
  { id: 'ltr_030', name: 'Fell Beast', mana_cost: '{4}{B}', type_line: 'Creature — Beast', rarity: 'uncommon', image_uris: { normal: 'https://cards.scryfall.io/normal/front/4/f/4f8129b8-73b2-4b9b-822b-4e8f9b2b6b8b.jpg' } }
]

// Generate a booster pack
function generateBoosterPack(setCode: string): any[] {
  // Proper booster pack distribution: 1 rare/mythic, 3 uncommons, 10 commons, 1 land
  const pack = []
  
  // Get cards by rarity
  const commons = SAMPLE_CARDS.filter(card => card.rarity === 'common')
  const uncommons = SAMPLE_CARDS.filter(card => card.rarity === 'uncommon')
  const rares = SAMPLE_CARDS.filter(card => ['rare', 'mythic'].includes(card.rarity))
  const lands = SAMPLE_CARDS.filter(card => card.type_line.includes('Land'))
  
  // Add 1 rare/mythic
  if (rares.length > 0) {
    pack.push(rares[Math.floor(Math.random() * rares.length)])
  }
  
  // Add 3 uncommons
  for (let i = 0; i < 3; i++) {
    if (uncommons.length > 0) {
      pack.push(uncommons[Math.floor(Math.random() * uncommons.length)])
    }
  }
  
  // Add 10 commons
  for (let i = 0; i < 10; i++) {
    if (commons.length > 0) {
      pack.push(commons[Math.floor(Math.random() * commons.length)])
    }
  }
  
  // Add 1 land
  if (lands.length > 0) {
    pack.push(lands[Math.floor(Math.random() * lands.length)])
  }
  
  // Fill remaining slots if we don't have enough cards
  while (pack.length < 15) {
    const allCards = [...SAMPLE_CARDS]
    pack.push(allCards[Math.floor(Math.random() * allCards.length)])
  }
  
  return pack.slice(0, 15) // Ensure exactly 15 cards
}

// Bot AI for card selection
function botPickCard(pack: any[], botName: string): any {
  // Simple AI: pick the first rare/mythic, or random card
  const rareCards = pack.filter(card => ['rare', 'mythic'].includes(card.rarity))
  if (rareCards.length > 0) {
    return rareCards[0]
  }
  return pack[Math.floor(Math.random() * pack.length)]
}

// Process bot picks for a draft
async function processBotPicks(draftId: string) {
  const client = await getDBConnection()
  
  try {
    // Get all bots that have available packs
    const botPacks = await client.query(`
      SELECT dp.*, p.*
      FROM draft_participants dp
      JOIN draft_packs p ON dp.id = p.participant_id
      WHERE dp.draft_id = $1 AND dp.is_bot = true AND p.is_picked = false
      ORDER BY dp.position, p.created_at
    `, [draftId])
    
    for (const botPack of botPacks.rows) {
      const cards = JSON.parse(botPack.cards)
      if (cards.length === 0) continue
      
      // Bot picks a card
      const pickedCard = botPickCard(cards, botPack.bot_name)
      
      // Get draft info for pick tracking
      const draftResult = await client.query('SELECT * FROM drafts WHERE id = $1', [draftId])
      const draft = draftResult.rows[0]
      
      // Record the pick
      const pickId = `pick_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      await client.query(
        'INSERT INTO draft_picks (id, draft_id, participant_id, card_id, pick_number, pack_number) VALUES ($1, $2, $3, $4, $5, $6)',
        [pickId, draftId, botPack.id, pickedCard.id, draft.current_pick, draft.current_pack]
      )
      
      // Remove picked card from pack
      const remainingCards = cards.filter((card: any) => card.id !== pickedCard.id)
      
      // Mark pack as picked
      await client.query(
        'UPDATE draft_packs SET is_picked = true, cards = $1 WHERE id = $2',
        [JSON.stringify(remainingCards), botPack.id]
      )
      
      // Pass the pack to the next participant (if cards remain)
      if (remainingCards.length > 0) {
        const direction = draft.pack_direction
        const totalPlayers = await client.query(
          'SELECT COUNT(*) as count FROM draft_participants WHERE draft_id = $1',
          [draftId]
        )
        const playerCount = parseInt(totalPlayers.rows[0].count)
        
        let nextPosition = direction 
          ? (botPack.position % playerCount) + 1
          : botPack.position === 1 ? playerCount : botPack.position - 1
          
        const nextParticipant = await client.query(
          'SELECT * FROM draft_participants WHERE draft_id = $1 AND position = $2',
          [draftId, nextPosition]
        )
        
        if (nextParticipant.rows.length > 0) {
          const newPackId = `pack_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
          await client.query(
            'INSERT INTO draft_packs (id, draft_id, participant_id, pack_number, cards) VALUES ($1, $2, $3, $4, $5)',
            [newPackId, draftId, nextParticipant.rows[0].id, draft.current_pack, JSON.stringify(remainingCards)]
          )
        }
      }
    }
  } finally {
    await client.end()
  }
}

const fastify = Fastify({
  logger: true
})

// Register plugins
fastify.register(cors, {
  origin: process.env.NODE_ENV === 'production' ? false : true
})

fastify.register(helmet)

// JWT plugin
fastify.register(jwt, {
  secret: process.env.JWT_SECRET || 'your-super-secure-jwt-secret-change-this-in-production'
})

// Authentication hook
async function authenticate(request: any, reply: any) {
  try {
    await request.jwtVerify()
  } catch (err) {
    reply.code(401).send({ error: 'Authentication required' })
  }
}

// Swagger documentation
fastify.register(swagger, {
  swagger: {
    info: {
      title: 'MTG Draft Simulator API',
      description: 'REST API for Magic: The Gathering Draft Practice Tool',
      version: '1.0.0'
    },
    host: 'localhost:3001',
    schemes: ['http'],
    consumes: ['application/json'],
    produces: ['application/json']
  }
})

fastify.register(swaggerUi, {
  routePrefix: '/docs',
  uiConfig: {
    docExpansion: 'full',
    deepLinking: false
  }
})

// Helper function to get database connection
async function getDBConnection() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@postgres:5432/mtg_draft_simulator'
  })
  await client.connect()
  return client
}

// Health check endpoint
fastify.get('/health', async (request, reply) => {
  return { status: 'ok', timestamp: new Date().toISOString() }
})

// Database health check endpoint
fastify.get('/health/db', async (request, reply) => {
  try {
    const client = await getDBConnection()
    const result = await client.query('SELECT 1 as test')
    await client.end()
    
    return { 
      status: 'ok', 
      database: 'connected', 
      timestamp: new Date().toISOString() 
    }
  } catch (error) {
    reply.code(500)
    return { 
      status: 'error', 
      database: 'disconnected', 
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString() 
    }
  }
})

// Auth Routes
fastify.register(async function (fastify) {
  // Register new user
  fastify.post('/auth/register', {
    schema: {
      body: {
        type: 'object',
        required: ['email', 'username', 'password'],
        properties: {
          email: { type: 'string', format: 'email' },
          username: { type: 'string', minLength: 3, maxLength: 20 },
          password: { type: 'string', minLength: 6 }
        }
      }
    }
  }, async (request: any, reply) => {
    const { email, username, password } = request.body
    
    try {
      const client = await getDBConnection()
      
      // Check if user already exists
      const existingUser = await client.query(
        'SELECT id FROM users WHERE email = $1 OR username = $2',
        [email, username]
      )
      
      if (existingUser.rows.length > 0) {
        await client.end()
        reply.code(400)
        return { error: 'User with this email or username already exists' }
      }
      
      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10)
      
      // Generate user ID
      const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      
      // Insert user
      await client.query(
        'INSERT INTO users (id, email, username, password) VALUES ($1, $2, $3, $4)',
        [userId, email, username, hashedPassword]
      )
      
      await client.end()
      
      // Generate JWT token
      const token = fastify.jwt.sign({ 
        userId, 
        email, 
        username 
      })
      
      return { 
        message: 'User registered successfully',
        token,
        user: { id: userId, email, username }
      }
      
    } catch (error) {
      reply.code(500)
      return { 
        error: 'Registration failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  })

  // Login user
  fastify.post('/auth/login', {
    schema: {
      body: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: { type: 'string' },
          password: { type: 'string' }
        }
      }
    }
  }, async (request: any, reply) => {
    const { email, password } = request.body
    
    try {
      const client = await getDBConnection()
      
      // Find user
      const userResult = await client.query(
        'SELECT id, email, username, password FROM users WHERE email = $1',
        [email]
      )
      
      if (userResult.rows.length === 0) {
        await client.end()
        reply.code(401)
        return { error: 'Invalid credentials' }
      }
      
      const user = userResult.rows[0]
      
      // Verify password
      const isValidPassword = await bcrypt.compare(password, user.password)
      
      if (!isValidPassword) {
        await client.end()
        reply.code(401)
        return { error: 'Invalid credentials' }
      }
      
      await client.end()
      
      // Generate JWT token
      const token = fastify.jwt.sign({ 
        userId: user.id, 
        email: user.email, 
        username: user.username 
      })
      
      return { 
        message: 'Login successful',
        token,
        user: { 
          id: user.id, 
          email: user.email, 
          username: user.username 
        }
      }
      
    } catch (error) {
      reply.code(500)
      return { 
        error: 'Login failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  })

  // Get current user (protected route)
  fastify.get('/auth/me', {
    preHandler: [authenticate]
  }, async (request: any, reply) => {
    try {
      const client = await getDBConnection()
      
      const userResult = await client.query(
        'SELECT id, email, username, created_at FROM users WHERE id = $1',
        [request.user.userId]
      )
      
      await client.end()
      
      if (userResult.rows.length === 0) {
        reply.code(404)
        return { error: 'User not found' }
      }
      
      return { user: userResult.rows[0] }
      
    } catch (error) {
      reply.code(500)
      return { 
        error: 'Failed to get user info',
        details: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  })
})

// API Routes (to be added)
fastify.register(async function (fastify) {
  fastify.get('/api', async (request, reply) => {
    return { message: 'MTG Draft Simulator API v1.0.0' }
  })
})

// Draft Routes
fastify.register(async function (fastify) {
  // Create new draft
  fastify.post('/api/drafts', {
    preHandler: [authenticate],
    schema: {
      body: {
        type: 'object',
        required: ['name', 'setCode'],
        properties: {
          name: { type: 'string', minLength: 1, maxLength: 100 },
          setCode: { type: 'string', minLength: 3, maxLength: 10 },
          maxPlayers: { type: 'number', minimum: 2, maximum: 8 }
        }
      }
    }
  }, async (request: any, reply) => {
    const { name, setCode, maxPlayers = 8 } = request.body
    
    try {
      const client = await getDBConnection()
      
      // Generate draft ID
      const draftId = `draft_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      
      // Create drafts table if it doesn't exist
      await client.query(`
        CREATE TABLE IF NOT EXISTS drafts (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          set_code TEXT NOT NULL,
          status TEXT DEFAULT 'WAITING',
          max_players INTEGER DEFAULT 8,
          current_pack INTEGER DEFAULT 1,
          current_pick INTEGER DEFAULT 1,
          pack_direction BOOLEAN DEFAULT true,
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW()
        )
      `)
      
      // Insert draft
      await client.query(
        'INSERT INTO drafts (id, name, set_code, max_players) VALUES ($1, $2, $3, $4)',
        [draftId, name, setCode, maxPlayers]
      )
      
      // Create draft_participants table if it doesn't exist
      await client.query(`
        CREATE TABLE IF NOT EXISTS draft_participants (
          id TEXT PRIMARY KEY,
          draft_id TEXT NOT NULL,
          user_id TEXT,
          position INTEGER NOT NULL,
          is_bot BOOLEAN DEFAULT false,
          bot_name TEXT,
          UNIQUE(draft_id, position)
        )
      `)
      
      // Create draft_packs table for pack management
      await client.query(`
        CREATE TABLE IF NOT EXISTS draft_packs (
          id TEXT PRIMARY KEY,
          draft_id TEXT NOT NULL,
          participant_id TEXT NOT NULL,
          pack_number INTEGER NOT NULL,
          cards TEXT NOT NULL,
          is_picked BOOLEAN DEFAULT false,
          created_at TIMESTAMPTZ DEFAULT NOW()
        )
      `)
      
      // Create draft_picks table for tracking picks
      await client.query(`
        CREATE TABLE IF NOT EXISTS draft_picks (
          id TEXT PRIMARY KEY,
          draft_id TEXT NOT NULL,
          participant_id TEXT NOT NULL,
          card_id TEXT NOT NULL,
          pick_number INTEGER NOT NULL,
          pack_number INTEGER NOT NULL,
          created_at TIMESTAMPTZ DEFAULT NOW()
        )
      `)
      
      // Add the creator as first participant
      const participantId = `participant_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      await client.query(
        'INSERT INTO draft_participants (id, draft_id, user_id, position, is_bot) VALUES ($1, $2, $3, $4, $5)',
        [participantId, draftId, request.user.userId, 1, false]
      )
      
      await client.end()
      
      return { 
        message: 'Draft created successfully',
        draft: {
          id: draftId,
          name,
          setCode,
          maxPlayers,
          status: 'WAITING'
        }
      }
      
    } catch (error) {
      reply.code(500)
      return { 
        error: 'Failed to create draft',
        details: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  })

  // Get all available drafts
  fastify.get('/api/drafts', async (request, reply) => {
    try {
      const client = await getDBConnection()
      
      const draftsResult = await client.query(`
        SELECT 
          d.*,
          COUNT(dp.id) as current_players
        FROM drafts d
        LEFT JOIN draft_participants dp ON d.id = dp.draft_id
        WHERE d.status = 'WAITING'
        GROUP BY d.id
        ORDER BY d.created_at DESC
      `)
      
      await client.end()
      
      return { drafts: draftsResult.rows }
      
    } catch (error) {
      reply.code(500)
      return { 
        error: 'Failed to get drafts',
        details: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  })
  
  // Get user's active drafts
  fastify.get('/api/drafts/my-active', {
    preHandler: [authenticate]
  }, async (request: any, reply) => {
    try {
      const client = await getDBConnection()
      
      const draftsResult = await client.query(`
        SELECT 
          d.*,
          dp.position,
          COUNT(dp2.id) as current_players
        FROM drafts d
        JOIN draft_participants dp ON d.id = dp.draft_id
        LEFT JOIN draft_participants dp2 ON d.id = dp2.draft_id
        WHERE dp.user_id = $1 AND d.status = 'ACTIVE'
        GROUP BY d.id, dp.position
        ORDER BY d.created_at DESC
      `, [request.user.userId])
      
      await client.end()
      
      return { drafts: draftsResult.rows }
      
    } catch (error) {
      reply.code(500)
      return { 
        error: 'Failed to get active drafts',
        details: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  })

  // Join a draft
  fastify.post('/api/drafts/:draftId/join', {
    preHandler: [authenticate]
  }, async (request: any, reply) => {
    const { draftId } = request.params
    
    try {
      const client = await getDBConnection()
      
      // Check if draft exists and is available
      const draftResult = await client.query(
        'SELECT * FROM drafts WHERE id = $1 AND status = $2',
        [draftId, 'WAITING']
      )
      
      if (draftResult.rows.length === 0) {
        await client.end()
        reply.code(404)
        return { error: 'Draft not found or no longer available' }
      }
      
      const draft = draftResult.rows[0]
      
      // Check if user is already in this draft
      const existingParticipant = await client.query(
        'SELECT id FROM draft_participants WHERE draft_id = $1 AND user_id = $2',
        [draftId, request.user.userId]
      )
      
      if (existingParticipant.rows.length > 0) {
        await client.end()
        reply.code(400)
        return { error: 'You are already in this draft' }
      }
      
      // Get current participant count
      const participantCount = await client.query(
        'SELECT COUNT(*) as count FROM draft_participants WHERE draft_id = $1',
        [draftId]
      )
      
      const currentCount = parseInt(participantCount.rows[0].count)
      
      if (currentCount >= draft.max_players) {
        await client.end()
        reply.code(400)
        return { error: 'Draft is full' }
      }
      
      // Add participant
      const participantId = `participant_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      await client.query(
        'INSERT INTO draft_participants (id, draft_id, user_id, position, is_bot) VALUES ($1, $2, $3, $4, $5)',
        [participantId, draftId, request.user.userId, currentCount + 1, false]
      )
      
      await client.end()
      
      return { 
        message: 'Joined draft successfully',
        position: currentCount + 1
      }
      
    } catch (error) {
      reply.code(500)
      return { 
        error: 'Failed to join draft',
        details: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  })

  // Start a draft (fill remaining slots with bots)
  fastify.post('/api/drafts/:draftId/start', {
    preHandler: [authenticate]
  }, async (request: any, reply) => {
    const { draftId } = request.params
    
    try {
      const client = await getDBConnection()
      
      // Verify user is in this draft
      const participantCheck = await client.query(
        'SELECT id FROM draft_participants WHERE draft_id = $1 AND user_id = $2',
        [draftId, request.user.userId]
      )
      
      if (participantCheck.rows.length === 0) {
        await client.end()
        reply.code(403)
        return { error: 'You are not in this draft' }
      }
      
      // Get draft info
      const draftResult = await client.query(
        'SELECT * FROM drafts WHERE id = $1 AND status = $2',
        [draftId, 'WAITING']
      )
      
      if (draftResult.rows.length === 0) {
        await client.end()
        reply.code(404)
        return { error: 'Draft not found or already started' }
      }
      
      const draft = draftResult.rows[0]
      
      // Get current participants
      const participantsResult = await client.query(
        'SELECT COUNT(*) as count FROM draft_participants WHERE draft_id = $1',
        [draftId]
      )
      
      const currentCount = parseInt(participantsResult.rows[0].count)
      
      // Fill remaining slots with bots
      const botNames = ['AlphaDrafter', 'BetaBot', 'GammaAI', 'DeltaDraft', 'EpsilonPicker', 'ZetaBot', 'EtaAI']
      
      for (let i = currentCount; i < draft.max_players; i++) {
        const participantId = `participant_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        const botName = botNames[i - currentCount] || `Bot${i + 1}`
        
        await client.query(
          'INSERT INTO draft_participants (id, draft_id, user_id, position, is_bot, bot_name) VALUES ($1, $2, $3, $4, $5, $6)',
          [participantId, draftId, null, i + 1, true, botName]
        )
      }
      
      // Update draft status to ACTIVE
      await client.query(
        'UPDATE drafts SET status = $1, updated_at = NOW() WHERE id = $2',
        ['ACTIVE', draftId]
      )
      
      // Generate packs for all participants
      const allParticipants = await client.query(
        'SELECT * FROM draft_participants WHERE draft_id = $1 ORDER BY position',
        [draftId]
      )
      
      // Generate 3 packs per participant
      for (const participant of allParticipants.rows) {
        for (let packNum = 1; packNum <= 3; packNum++) {
          const pack = generateBoosterPack(draft.set_code)
          const packId = `pack_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
          
          await client.query(
            'INSERT INTO draft_packs (id, draft_id, participant_id, pack_number, cards) VALUES ($1, $2, $3, $4, $5)',
            [packId, draftId, participant.id, packNum, JSON.stringify(pack)]
          )
        }
      }
      
      await client.end()
      
      return { 
        message: 'Draft started successfully',
        status: 'ACTIVE'
      }
      
    } catch (error) {
      reply.code(500)
      return { 
        error: 'Failed to start draft',
        details: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  })
  
  // Get current pack for a participant
  fastify.get('/api/drafts/:draftId/pack', {
    preHandler: [authenticate]
  }, async (request: any, reply) => {
    const { draftId } = request.params
    
    try {
      const client = await getDBConnection()
      
      // Get participant info
      const participantResult = await client.query(
        'SELECT * FROM draft_participants WHERE draft_id = $1 AND user_id = $2',
        [draftId, request.user.userId]
      )
      
      if (participantResult.rows.length === 0) {
        await client.end()
        reply.code(403)
        return { error: 'You are not in this draft' }
      }
      
      const participant = participantResult.rows[0]
      
      // Get draft info
      const draftResult = await client.query(
        'SELECT * FROM drafts WHERE id = $1',
        [draftId]
      )
      
      if (draftResult.rows.length === 0) {
        await client.end()
        reply.code(404)
        return { error: 'Draft not found' }
      }
      
      const draft = draftResult.rows[0]
      
      // Get current pack
      const packResult = await client.query(
        'SELECT * FROM draft_packs WHERE draft_id = $1 AND participant_id = $2 AND pack_number = $3 AND is_picked = false ORDER BY created_at LIMIT 1',
        [draftId, participant.id, draft.current_pack]
      )
      
      await client.end()
      
      if (packResult.rows.length === 0) {
        return { 
          pack: null, 
          message: 'No pack available',
          draft_status: draft.status,
          current_pack: draft.current_pack,
          current_pick: draft.current_pick
        }
      }
      
      const pack = packResult.rows[0]
      return { 
        pack: {
          id: pack.id,
          cards: JSON.parse(pack.cards),
          pack_number: pack.pack_number
        },
        draft_status: draft.status,
        current_pack: draft.current_pack,
        current_pick: draft.current_pick,
        position: participant.position
      }
      
    } catch (error) {
      reply.code(500)
      return { 
        error: 'Failed to get pack',
        details: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  })
  
  // Pick a card from current pack
  fastify.post('/api/drafts/:draftId/pick', {
    preHandler: [authenticate],
    schema: {
      body: {
        type: 'object',
        required: ['cardId'],
        properties: {
          cardId: { type: 'string' }
        }
      }
    }
  }, async (request: any, reply) => {
    const { draftId } = request.params
    const { cardId } = request.body
    
    try {
      const client = await getDBConnection()
      
      // Get participant info
      const participantResult = await client.query(
        'SELECT * FROM draft_participants WHERE draft_id = $1 AND user_id = $2',
        [draftId, request.user.userId]
      )
      
      if (participantResult.rows.length === 0) {
        await client.end()
        reply.code(403)
        return { error: 'You are not in this draft' }
      }
      
      const participant = participantResult.rows[0]
      
      // Get draft info
      const draftResult = await client.query(
        'SELECT * FROM drafts WHERE id = $1',
        [draftId]
      )
      
      const draft = draftResult.rows[0]
      
      // Get current pack
      const packResult = await client.query(
        'SELECT * FROM draft_packs WHERE draft_id = $1 AND participant_id = $2 AND pack_number = $3 AND is_picked = false ORDER BY created_at LIMIT 1',
        [draftId, participant.id, draft.current_pack]
      )
      
      if (packResult.rows.length === 0) {
        await client.end()
        reply.code(400)
        return { error: 'No pack available to pick from' }
      }
      
      const pack = packResult.rows[0]
      const cards = JSON.parse(pack.cards)
      
      // Verify card exists in pack
      const cardExists = cards.find((card: any) => card.id === cardId)
      if (!cardExists) {
        await client.end()
        reply.code(400)
        return { error: 'Card not found in current pack' }
      }
      
      // Record the pick
      const pickId = `pick_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      await client.query(
        'INSERT INTO draft_picks (id, draft_id, participant_id, card_id, pick_number, pack_number) VALUES ($1, $2, $3, $4, $5, $6)',
        [pickId, draftId, participant.id, cardId, draft.current_pick, draft.current_pack]
      )
      
      // Remove picked card from pack
      const remainingCards = cards.filter((card: any) => card.id !== cardId)
      
      // Mark pack as picked and update cards
      await client.query(
        'UPDATE draft_packs SET is_picked = true, cards = $1 WHERE id = $2',
        [JSON.stringify(remainingCards), pack.id]
      )
      
      // Pass the pack to the next participant (if cards remain)
      if (remainingCards.length > 0) {
        const direction = draft.pack_direction
        const totalPlayers = await client.query(
          'SELECT COUNT(*) as count FROM draft_participants WHERE draft_id = $1',
          [draftId]
        )
        const playerCount = parseInt(totalPlayers.rows[0].count)
        
        let nextPosition = direction 
          ? (participant.position % playerCount) + 1
          : participant.position === 1 ? playerCount : participant.position - 1
          
        const nextParticipant = await client.query(
          'SELECT * FROM draft_participants WHERE draft_id = $1 AND position = $2',
          [draftId, nextPosition]
        )
        
        if (nextParticipant.rows.length > 0) {
          const newPackId = `pack_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
          await client.query(
            'INSERT INTO draft_packs (id, draft_id, participant_id, pack_number, cards) VALUES ($1, $2, $3, $4, $5)',
            [newPackId, draftId, nextParticipant.rows[0].id, draft.current_pack, JSON.stringify(remainingCards)]
          )
        }
      }
      
      await client.end()
      
      // Process bot picks after the human pick
      setTimeout(() => {
        processBotPicks(draftId).catch(console.error)
      }, 1000) // 1 second delay for realism
      
      return { 
        message: 'Card picked successfully',
        picked_card: cardExists,
        remaining_cards: remainingCards.length
      }
      
    } catch (error) {
      reply.code(500)
      return { 
        error: 'Failed to pick card',
        details: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  })
  
  // Get player's drafted cards
  fastify.get('/api/drafts/:draftId/picks', {
    preHandler: [authenticate]
  }, async (request: any, reply) => {
    const { draftId } = request.params
    
    try {
      const client = await getDBConnection()
      
      // Get participant info
      const participantResult = await client.query(
        'SELECT * FROM draft_participants WHERE draft_id = $1 AND user_id = $2',
        [draftId, request.user.userId]
      )
      
      if (participantResult.rows.length === 0) {
        await client.end()
        reply.code(403)
        return { error: 'You are not in this draft' }
      }
      
      const participant = participantResult.rows[0]
      
      // Get all picks by this participant
      const picksResult = await client.query(
        'SELECT * FROM draft_picks WHERE draft_id = $1 AND participant_id = $2 ORDER BY pack_number, pick_number',
        [draftId, participant.id]
      )
      
      await client.end()
      
      // Convert card IDs to full card objects
      const picks = picksResult.rows.map(pick => {
        const card = SAMPLE_CARDS.find(c => c.id === pick.card_id)
        return {
          ...pick,
          card: card || { id: pick.card_id, name: 'Unknown Card' }
        }
      })
      
      return { picks }
      
    } catch (error) {
      reply.code(500)
      return { 
        error: 'Failed to get picks',
        details: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  })
  
  // Auto-advance draft and process bot picks
  fastify.post('/api/drafts/:draftId/advance', {
    preHandler: [authenticate]
  }, async (request: any, reply) => {
    const { draftId } = request.params
    
    try {
      // Process bot picks
      await processBotPicks(draftId)
      
      return { message: 'Draft advanced successfully' }
      
    } catch (error) {
      reply.code(500)
      return { 
        error: 'Failed to advance draft',
        details: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  })
})

const start = async () => {
  try {
    const port = process.env.PORT ? parseInt(process.env.PORT) : 3001
    await fastify.listen({ port, host: '0.0.0.0' })
    console.log(`🚀 Server running on http://localhost:${port}`)
    console.log(`📚 API Documentation available at http://localhost:${port}/docs`)
  } catch (err) {
    fastify.log.error(err)
    process.exit(1)
  }
}

start()
