import express from "express"
import recipesRoutes from "./routes/recipesRoutes.js"
import userRoutes from './routes/userRoutes.js'
import srcRoutes from './routes/srcRoutes.js'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import bodyParser from 'body-parser'
import foodRoutes from './routes/foodRoutes.js'
import dotenv from 'dotenv'
import cookieParser from "cookie-parser"

dotenv.config()

const app = express()
const PORT = process.env.PORT ?? 4121
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

app.set('view engine', 'ejs')
app.set('views', join(__dirname, './views'))

app.use(bodyParser.json())

app.use(express.static(join(__dirname, '/public')))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())

app.get('/', (req, res) => {
    const userId = req.cookies['logged-user-id']

    res.render('index', { userId: req.cookies['logged-user-id'], page: 'index' })
})

app.use('/api/v1/recipe', recipesRoutes)
app.use('/api/v1/src', srcRoutes)
app.use('/api/v1/user', userRoutes)
app.use('/api/v1/food', foodRoutes)

app.listen(PORT, () => {
    console.log('server listening on https://localhost:' + PORT)
})