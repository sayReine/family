// server.ts or index.ts
import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import authRoutes from './routes/auth.ts'
import personRoutes from './routes/persons.ts'

dotenv.config()
const app = express()
const PORT = process.env.PORT || 3000

// Middleware
app.use(cors())
app.use(express.json())

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/persons', personRoutes)

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// Error handling
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack)
  res.status(500).json({ error: 'Something went wrong!' })
})

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`)
  console.log(`📊 API endpoints:`)
  console.log(`   - POST /api/auth/register`)
  console.log(`   - POST /api/auth/login`)
  console.log(`   - GET  /api/auth/me`)
  console.log(`   - GET  /api/persons`)
  console.log(`   - POST /api/persons`)
  console.log(`   - PUT  /api/persons/:id`)
})

export default app