import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import searchRouter from './routes/search'
import trademarksRouter from './routes/trademarks'
import uploadRouter from './routes/upload'
import authRouter from './routes/auth'
import usersRouter from './routes/users'
import submissionsRouter from './routes/submissions'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 4000

const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim())
  : ['http://localhost:3000', 'http://localhost:3001']
app.use(cors({ origin: allowedOrigins, credentials: true }))
app.use(express.json())

app.use('/api/auth', authRouter)
app.use('/api/users', usersRouter)
app.use('/api/search', searchRouter)
app.use('/api/trademarks', trademarksRouter)
app.use('/api/admin/upload', uploadRouter)
app.use('/api/admin/submissions', submissionsRouter)

app.get('/health', (_req, res) => res.json({ status: 'ok' }))

app.listen(PORT, () => console.log(`Server running on port ${PORT}`))
