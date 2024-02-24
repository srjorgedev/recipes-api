import express from "express"
import recipesRoutes from "./routes/recipesRoutes.js"
import userRoutes from './routes/userRoutes.js'
import recipesImgRoutes from './routes/recipesImgRoutes.js'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import bodyParser from 'body-parser'

const app = express()
const PORT = 4121
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

app.use(bodyParser.json())

app.use(express.static(join(__dirname, '/public')))
app.use(express.json())
app.use(express.urlencoded({ extended: false}))

app.get('/', (req, res) => {
    res.sendFile('./public/index.html')
})

app.use('/recipe', recipesRoutes)
app.use('/recipe', recipesImgRoutes)
app.use('/user', userRoutes)

app.listen(PORT, () => {
    console.log('server listening on https://localhost:' + PORT)
})