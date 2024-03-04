import express from 'express'
import { upload } from '../controllers/uploadRecipe.js'
import { get } from '../controllers/getRecipes.js'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import multer from 'multer'
import { uploadSingleImage, uploadMultipleImages } from '../controllers/uploadMethods.js'
import { isLogged } from '../controllers/middelwares.js'

const router = express.Router()
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const storage = multer.memoryStorage();
const uploads = multer({ storage: storage });

router.post('/all-data', uploads.array('recipeImage'), async (req, res) => {
    try {
        var { recipeName, recipeType, recipeTag, recipeTime, recipeTimeUnit, recipeIngredient, recipeIngreientUnitCount, recipeIngredientCount, recipeSteps } = req.body

        recipeTag = Array.isArray(recipeTag) ? recipeTag : [recipeTag]
        recipeType = Array.isArray(recipeType) ? recipeType : [recipeType]
        recipeTime = Array.isArray(recipeTime) ? recipeTime : [recipeTime]
        recipeSteps = Array.isArray(recipeSteps) ? recipeSteps : [recipeSteps]
        recipeIngredient = Array.isArray(recipeIngredient) ? recipeIngredient : [recipeIngredient]

        const userId = req.cookies['logged-user-id'] ?? 'f659951b-43ba-4704-b662-0edb234bba0c'

        const img = await uploadMultipleImages(req.files)
        console.log(img)

        const success  = await upload.recipe(userId, recipeName, recipeTag, recipeType, recipeTime, recipeSteps, recipeIngredient, img)

        if (success.success === true) {
            res.redirect('/recipe/form')
        } else {
            res.send('Algo salio mal').redirect('/recipe/form')
        }

    } catch (error) {
        console.log(error)
    }
})

router.get('/all', async (req, res) => {
    try {
        const recipe = await get._AllRecipes()
        res.json(recipe).status(200)
    } catch (error) {
        console.log('Error ' + error)
    }
})

router.get('/form/img', (req, res) => {
    res.sendFile(join(__dirname, '../public/recipeImgForm.html'))
})

router.get('/form', (req, res) => {
    res.sendFile(join(__dirname, '../public/recipeForm.html'))
})

router.post('/post', async (req, res) => {
    try {

        upload.basicRecipe('recipes_basic', TartaDeManzana)

    } catch (error) {
        console.log('Error al subir la receta' + error)
    }
})

export default router