import express from 'express'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import { register } from '../controllers/authMethods/singUp.js'
import { checkPassword, getUserData } from '../controllers/authMethods/logIn.js'
import multer from 'multer'
import { uploadSingleImage, uploadImageWithoutBuffer } from '../controllers/postMethods/uploadMethods.js'
import { getUserDataWithRecipes, getUserFavoriteRecipes, getAllUserData } from '../controllers/getMethods/getUserData.js'
import { setFavoriteRecipe, updateFavoriteRecipes, updateUserData } from '../controllers/postMethods/uploadUserData.js'
import { getAllRecipeScoresByUserId, getRecipeScoreByUserId } from '../controllers/getMethods/getRecipes.js'

const router = express.Router()

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const storage = multer.memoryStorage()
const uploads = multer({ storage: storage })

// Endpoints de la APIRest 

router.post('/auth/login', async (req, res) => {
    try {
        const { emailInput, passwordInput } = req.body

        const { success, error, id } = await checkPassword(emailInput, passwordInput)

        if (!success) {
            res.json({
                message: 'Ha ocurrido un error',
                status: 'Error',
                error,
                id: null
            })
        } else {
            res.json({
                message: 'Inicio de sesion exitoso',
                status: 'Success',
                id,
                error
            })
        }

    } catch (error) {
        res.json({
            message: 'Ha ocurrido un error',
            status: 'Error',
            error
        })
    }
})


router.post('/auth/register', async (req, res) => {
    try {
        const { img, username, name, lastname, email, password } = req.body
        var url

        if (!img || !img.base64 || img.base64 === "" || img.base64.length < 1) {
            url = 'https://ik.imagekit.io/uv3u01crv/User_default.webp'
        } else {
            const buffer = Buffer.from(img.base64, 'base64')
            url = await uploadImageWithoutBuffer(buffer, img.fileName)
        }

        const { data, error, message, status, errorMessage } = await register(email, password, name, username, lastname, url)

        if (error || status == 'Error') {
            throw new Error('Ocurrio un error: ' + error + "\n Mensaje: " + errorMessage)
        }

        res.json(
            {
                id: data[0].user_id,
                status: status,
                message: message,
                error: false,
                errorMessage: null
            }
        )
    } catch (error) {
        res.json({
            id: null,
            error: error,
        })
    }
})

router.post('/update/user-data/:id', async (req, res) => {
    try {

        const { img, username, name, lastname, description, color } = req.body
        const { id } = req.params

        var url

        if (!img || !img.base64 || img.base64 === "" || img.base64.length < 1) {
            url = ""
        } else {
            const buffer = Buffer.from(img.base64, 'base64')
            url = await uploadImageWithoutBuffer(buffer, img.fileName)
        }

        const updates = {
            user_name: name,
            user_username: username,
            user_last_name: lastname,
            user_description: description,
            user_color: color,
            user_pfp: url,
        }

        const filteredUpdates = Object.fromEntries(
            Object.entries(updates).filter(([_, value]) => value !== "" && value !== undefined)
        )

        const { status, error, errorMessage, message } = await updateUserData(id, filteredUpdates)

        if (error || status == 'Fail') throw new Error(errorMessage)

        res.json(
            {
                status: status,
                message: message,
                error: false,
                errorMessage: null
            }
        )
    } catch (error) {
        res.json({
            status: 'Fail',
            message: 'Los datos no se pudieron actualizar',
            error: true,
            errorMessage: error.message
        })
    }
})

router.post('/add/favorite/:user_id/recipe/:recipe_id', async (req, res) => {
    try {
        const { user_id, recipe_id } = req.params

        if (!user_id || user_id == "" || user_id == null || user_id == undefined || user_id == NaN) throw new Error('Para realizar esta accion necesitas iniciar sesion')

        var favoriteArray = await updateFavoriteRecipes(user_id)

        if (favoriteArray.includes(recipe_id)) {
            res.json({
                message: 'La receta ya esta agregada',
                status: 'Fail',
            })
        } else {
            favoriteArray.push(recipe_id)

            const { data } = await setFavoriteRecipe(user_id, favoriteArray)

            res.json({
                message: 'Receta agregada a favoritos',
                status: 'Success',
            })
        }
    } catch (error) {
        res.json({
            message: error,
            status: 'Error',
        })
    }
})

router.get('/get/score/:userid', async (req, res) => {
    try {
        const { userid } = req.params

        const { score, status, error, errorMessage, amount } = await getAllRecipeScoresByUserId(userid)

        if (error) throw new Error(errorMessage)

        res.json(
            {
                status,
                error,
                errorMessage,
                score,
                amount,
            }
        )

    } catch (error) {
        res.json(
            {
                status: 'Fail',
                error: true,
                errorMessage: error,
                score: 0,
                amount: 0,
            }
        )
    }
})

router.get('/get/score/:userid/recipe/:recipeid', async (req, res) => {
    try {
        const { userid, recipeid } = req.params

        const { score, status, error, errorMessage, amount } = await getRecipeScoreByUserId(userid, recipeid)

        if (error) throw new Error(errorMessage)
        if (score = []) {
            res.json(
                {
                    status: 'No score',
                    error,
                    errorMessage: null,
                    score: 0,
                    amount: 0,
                }
            )
        }

        res.json(
            {
                status,
                error,
                errorMessage,
                score,
                amount,
            }
        )

    } catch (error) {
        res.json(
            {
                status: 'Fail',
                error: true,
                errorMessage: error,
                score: 0,
                amount: 0,
            }
        )
    }
})


router.get('/check/favorite/:user_id/recipe/:recipe_id', async (req, res) => {
    try {
        const { user_id, recipe_id } = req.params

        if (!user_id || user_id == "" || user_id == null || user_id == undefined || user_id == NaN) throw new Error('Para realizar esta accion necesitas iniciar sesion')

        var favoriteArray = await updateFavoriteRecipes(user_id)

        if (favoriteArray.includes(recipe_id)) {
            res.json({
                message: 'La receta esta agregada en los favoritos',
                status: 'Success',
                favorite: true
            })
        } else {
            res.json({
                message: 'La receta no esta agregada en favoritos',
                status: 'Success',
                favorite: false
            })
        }
    } catch (error) {
        res.json({
            message: error,
            status: 'Error',
        })
    }
})


router.post('/remove/favorite/:user_id/recipe/:recipe_id', async (req, res) => {
    try {
        const { user_id, recipe_id } = req.params

        if (!user_id || user_id == "" || user_id == null || user_id == undefined || user_id == NaN) throw new Error('Para realizar esta accion necesitas iniciar sesion')

        var favoriteArray = await updateFavoriteRecipes(user_id)

        if (!(favoriteArray.includes(recipe_id))) {
            res.json({
                message: 'La receta no esta agregada como favoritos',
                status: 'Fail',
            })
        }
        let removeFavorites = []
        let removeId = favoriteArray.indexOf(recipe_id)

        favoriteArray.filter((favorite, i) => {
            if (removeId !== i) removeFavorites.push(favorite)
        })

        const { data } = await setFavoriteRecipe(user_id, removeFavorites)

        res.json({
            message: 'Receta eliminada de favoritos',
            status: 'Success',
        })

    } catch (error) {
        res.json({
            message: error,
            status: 'Error',
        })
    }
})

router.get('/get-data/:id', async (req, res) => {
    try {
        const { id } = req.params

        const data = await getAllUserData(id)

        res.json(data)
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: 'Error interno del servidor' })
    }
})

router.get('/get-data/:id/favorites', async (req, res) => {
    try {
        const { id } = req.params

        const data = await getUserFavoriteRecipes(id)

        res.json(data)
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: 'Error interno del servidor' })
    }
})

router.get('/profile/:id', async (req, res) => {
    try {
        const { id } = req.params
        const data = await getAllUserData(id)

        res.json(data)
    } catch (error) {
        console.log(error)
    }
})

// Endpoints de la pagina

router.get('/view/test/form', (req, res) => {
    res.sendFile(join(__dirname, '../public/test.html'))
})

router.post('/api/test', async (req, res) => {
    try {
        const { img } = req.body

        const buffer = Buffer.from(img.base64, 'base64')

        const url = await uploadImageWithoutBuffer(buffer, img.fileName)

        res.json(
            {
                name: img.fileName,
                buffer: buffer,
                url: url
            }
        )
    } catch (error) {
        res.json(error)
    }
})

router.get('/view/form/register', (req, res) => {
    res.sendFile(join(__dirname, '../public/SingIn.html'))
})

router.get('/view/form/login', (req, res) => {
    if (req.cookies['logged-user-id'] == null || req.cookies['logged-user-id'] == "" || req.cookies['logged-user-id'] == undefined) {
        res.render('logIn')
    } else {
        res.sendFile(join(__dirname, '../public/userProfile.html'))
    }
})

router.post('/view/auth/register', uploads.single('pfp_img'), async (req, res) => {
    try {
        const { user_name, user_last_name, user_username, user_mail, user_password } = req.body
        var pfp

        if (req.file) {
            pfp = await uploadSingleImage(req.file)
        } else {
            pfp = 'https://ik.imagekit.io/uv3u01crv/User_default.webp'
        }

        const { error, errorMessage, message, status, data } = await register(user_mail, user_password, user_name, user_username, user_last_name, pfp)

        if (error) {
            throw new Error(message + errorMessage)
        }

        if (status == 'Success') {
            res.cookie('logged-user-id', data, { httpOnly: true })
            res.redirect('/')
        }
    } catch (error) {
        console.log(error)
    }
})

router.post('/view/auth/login', async (req, res) => {
    try {
        const { emailInput, passwordInput } = req.body

        const { success, id } = await checkPassword(emailInput, passwordInput)

        if (success == true) {
            res.cookie('logged-user-id', id, { httpOnly: true })
            res.redirect('/')
        } else {
            res.send('<h1>Correo o contraseña incorrectos</h1>')
        }
    } catch (error) {
        console.log(error)
    }
})

router.get('/view/profile/:id', async (req, res) => {
    try {
        const { id } = req.params
        const data = await getAllUserData(id)

        res.render('profile', { userId: id, page: 'profile', userData: data, message: null, error: null })
    } catch (error) {
        console.log(error)
    }
})

router.post('/profile/close', async (req, res) => {
    try {
        res.clearCookie('logged-user-id')
        res.redirect('/')
    } catch (error) {
        console.log(error)
    }
})


export default router