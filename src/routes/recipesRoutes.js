import express from 'express'
import multer from 'multer'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'
import { getFoodData } from '../controllers/getMethods/getFoodData.js'
import { getAllRecipes, getBasicRecipeInformation, getBasicRecipeInformationById, getRandomRecipe, getRecipeByCategory, getRecipeByRecipeId, getRecipeScore } from '../controllers/getMethods/getRecipes.js'
import { getUserById } from '../controllers/getMethods/getUserData.js'
import { uploadImageWithoutBuffer, uploadSingleImage } from '../controllers/postMethods/uploadMethods.js'
import { upload } from '../controllers/postMethods/uploadRecipe.js'

const router = express.Router()
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const storage = multer.memoryStorage()
const uploads = multer({
    storage: storage,
    preservePath: true
})

router.post('/all-data', uploads.fields([{ name: 'recipeImage', maxCount: 1 }]), async (req, res) => {
    try {
        var { recipeName, recipeType, recipeTag, recipeTime, recipeTimeUnit, recipeIngredient, recipeIngredientUnit, recipeIngredientUnitCount, recipeSteps, recipeDescription } = req.body

        recipeIngredient = Array.isArray(recipeIngredient) ? recipeIngredient : [recipeIngredient]
        recipeIngredientUnitCount = Array.isArray(recipeIngredientUnitCount) ? recipeIngredientUnitCount : [recipeIngredientUnitCount]
        recipeIngredientUnit = Array.isArray(recipeIngredientUnit) ? recipeIngredientUnit : [recipeIngredientUnit]
        recipeTag = Array.isArray(recipeTag) ? recipeTag : [recipeTag]
        recipeType = Array.isArray(recipeType) ? recipeType : [recipeType]
        recipeTime = Array.isArray(recipeTime) ? recipeTime : [recipeTime]
        recipeSteps = Array.isArray(recipeSteps) ? recipeSteps : [recipeSteps]
        recipeTimeUnit = Array.isArray(recipeTimeUnit) ? recipeTimeUnit : [recipeTimeUnit]

        const userId = req.cookies['logged-user-id'] ?? '66cc5465-8cac-4462-97a0-707a6652e32f'

        const img = await uploadSingleImage(req.files.recipeImage[0])

        const success = await upload.basicRecipe(userId, recipeName, recipeTag, recipeType, recipeTime, recipeSteps, recipeIngredient, recipeTimeUnit, recipeIngredientUnit, recipeIngredientUnitCount, img, recipeDescription)

        if (success) {
            res.json({
                status: 'OK',
                message: 'La receta fue subida'
            })
        } else {
            throw new Error('Error al subir la receta.')
        }
    } catch (error) {
        res.status(500).json({
            status: 'Error',
            message: error.message
        })
    }
})

router.post('/post/recipe', async (req, res) => {
    try {
        var { userId, recipeName, recipeType, recipeTag, recipeTime, recipeTimeUnit, recipeIngredient, recipeIngredientUnit, recipeIngredientUnitCount, recipeSteps, recipeDescription, Img } = req.body

        recipeIngredient = Array.isArray(recipeIngredient) ? recipeIngredient : [recipeIngredient]
        recipeIngredientUnitCount = Array.isArray(recipeIngredientUnitCount) ? recipeIngredientUnitCount : [recipeIngredientUnitCount]
        recipeIngredientUnit = Array.isArray(recipeIngredientUnit) ? recipeIngredientUnit : [recipeIngredientUnit]
        recipeTag = Array.isArray(recipeTag) ? recipeTag : [recipeTag]
        recipeType = Array.isArray(recipeType) ? recipeType : [recipeType]
        recipeTime = Array.isArray(recipeTime) ? recipeTime : [recipeTime]
        recipeSteps = Array.isArray(recipeSteps) ? recipeSteps : [recipeSteps]
        recipeTimeUnit = Array.isArray(recipeTimeUnit) ? recipeTimeUnit : [recipeTimeUnit]

        const buffer = Buffer.from(Img.base64, 'base64')
        url = await uploadImageWithoutBuffer(buffer, Img.fileName)

        const success = await upload.basicRecipe(userId, recipeName, recipeTag, recipeType, recipeTime, recipeSteps, recipeIngredient, recipeTimeUnit, recipeIngredientUnit, recipeIngredientUnitCount, img, recipeDescription)

        if (success) {
            res.json({
                status: 'OK',
                message: 'La receta fue subida'
            })
        } else {
            throw new Error('Error al subir la receta.')
        }
    } catch (error) {
        res.status(500).json({
            status: 'Error',
            message: error.message
        })
    }
})

router.get('/view/:id', async (req, res) => {
    try {
        const { id } = req.params
        const userId = req.cookies['logged-user-id']

        res.render('recipe', { userId: userId, page: 'profile', recipeId: id })
    } catch (error) {
        console.log(error)
    }
})

router.get('/all/view', async (req, res) => {
    try {
        const recipes = await getAllRecipes()
        const userId = req.cookies['logged-user-id']

        res.render('allRecipes', { data: recipes, userId: userId, page: 'all_recipes' })
    } catch (error) {

    }
})

router.get('/all', async (req, res) => {
    try {
        const recipe = await getAllRecipes()
        res.json(recipe).status(200)
    } catch (error) {
        console.log('Error ' + error)
    }
})

router.post('/add/score/:score/:user_id/recipe/:recipe_id', async (req, res) => {
    try {
        const { score, user_id, recipe_id } = req.params

        if (score == 0) throw new Error('El minimo de calificacion es 1')
        if (score == undefined || score == null) throw new Error('Introduce una calificacion valida')

        if (user_id == "" || user_id == null || user_id == undefined) throw new Error('Para realizar esta accion debes iniciar sesion')
        if (recipe_id == "" || recipe_id == null || recipe_id == undefined) throw new Error('Debes calificar una receta valida')

        const data = await upload.calicateRecipe(score, user_id, recipe_id)

        if (data.error) throw new Error(data.errorMessage)

        res.json({
            status: 'Fail',
            data: data.data,
            error: false,
            errorMessage: null
        })

    } catch (error) {
        res.json({
            status: 'Fail',
            data: null,
            error: true,
            errorMessage: error.message
        })
    }
})

router.get('/get/score/:id', async (req, res) => {
    try {
        const { id } = req.params

        const { score, status, error, errorMessage, amount, prom } = await getRecipeScore(id)

        if (error) throw new Error(errorMessage)

        res.json(
            {
                status,
                error,
                errorMessage,
                score,
                amount,
                prom: prom
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
                prom: 0
            }
        )
    }
})

router.get('/get/category/:cat', async (req, res) => {
    try {
        const { cat } = req.params

        const recipeData = await getRecipeByCategory(cat)
        const typeData = await getFoodData.foodTypes()
        const tagData = await getFoodData.foodTags()
        const unitsData = await getFoodData.foodUnits()

        const recipes = await Promise.all(recipeData.map(async (recipe) => {
            const tags = tagData.filter(tag => recipe.recipe_tag.some(tagId => tag.tag_id === tagId))
            const types = typeData.filter(type => recipe.recipe_type.some(tagId => type.categoty_id === tagId))
            const timeU = recipe.recipe_time_unit.map(unit => {
                if (unit === 1) {
                    return "Minutos"
                } else if (unit === 2) {
                    return "Horas"
                } else {
                    return "Desconocido"
                }
            })

            return {
                id: recipe.recipe_id,
                owner: {
                    id: recipe.user_id,
                    username: recipe.user_basic_information.user_username
                },
                name: recipe.recipe_name,
                description: recipe.recipe_description,
                mainImg: recipe.recipe_img,
                addedAt: recipe.created_at,
                tag: {
                    count: tags.length,
                    tags: tags.map(tag => {
                        return {
                            key: tag.tag_id,
                            value: tag.name,
                        }
                    })
                },
                category: {
                    count: types.length,
                    tags: types.map(type => {
                        return {
                            key: type.categoty_id,
                            value: type.category,
                        }
                    })
                },
                time: {
                    from: `${recipe.recipe_time[0]} ${timeU[0]}`,
                    to: `${recipe.recipe_time[1]} ${timeU[1]}`
                },
                ingredients: {
                    count: recipe.recipe_ingredients.length,
                    ingredients: recipe.recipe_ingredients.map((ingredient, i) => {
                        const unit = unitsData.find(unit => unit.filter_id === recipe.recipe_ingredient_amount[i])

                        return {
                            name: ingredient,
                            amount: recipe.recipe_ingredient_unit[i],
                            unit: {
                                key: unit.filter_id,
                                value: unit.unit
                            }
                        }
                    })
                },
                steps: {
                    count: recipe.recipe_steps.length,
                    steps: recipe.recipe_steps,
                }
            }
        }))

        res.json(recipes).status(200)
    } catch (error) {
        console.log('Error ' + error)
    }
})


let lastDailyRecipe = null

router.get('/get/daily', async (req, res) => {
    try {
        let data = null
        let error = null

        const typeData = await getFoodData.foodTypes()
        const tagData = await getFoodData.foodTags()
        const unitsData = await getFoodData.foodUnits()

        const currentTime = new Date()

        if (lastDailyRecipe && currentTime - new Date(lastDailyRecipe.date) < 12 * 60 * 60 * 1000) {
            data = lastDailyRecipe.data
        } else {
            let retries = 3
            while (retries > 0) {
                const result = await getRandomRecipe()
                if (!result.error) {
                    data = result.data
                    break
                }
                retries--
            }

            if (!data) {
                data = lastDailyRecipe ? lastDailyRecipe.data : null
            } else {
                lastDailyRecipe = {
                    date: currentTime.toISOString(),
                    data: data
                }
            }
        }

        const tags = tagData.filter(tag => data.recipe_tag.some(tagId => tag.tag_id === tagId))
        const types = typeData.filter(type => data.recipe_type.some(tagId => type.categoty_id === tagId))
        const timeU = data.recipe_time_unit.map(unit => {
            if (unit === 1) {
                return "Minutos"
            } else if (unit === 2) {
                return "Horas"
            } else {
                return "Desconocido"
            }
        })

        const recipe = {
            id: data.recipe_id,
            owner: {
                id: data.user_id,
                username: data.user_username
            },
            name: data.recipe_name,
            description: data.recipe_description,
            mainImg: data.recipe_img,
            addedAt: data.created_at,
            tag: {
                count: tags.length,
                tags: tags.map(tag => {
                    return {
                        key: tag.tag_id,
                        value: tag.name,
                    }
                })
            },
            category: {
                count: types.length,
                tags: types.map(type => {
                    return {
                        key: type.categoty_id,
                        value: type.category,
                    }
                })
            },
            time: {
                from: `${data.recipe_time[0]} ${timeU[0]}`,
                to: `${data.recipe_time[1]} ${timeU[1]}`
            },
            ingredients: {
                count: data.recipe_ingredients.length,
                ingredients: data.recipe_ingredients.map((ingredient, i) => {
                    const unit = unitsData.find(unit => unit.filter_id === data.recipe_ingredient_amount[i])

                    return {
                        name: ingredient,
                        amount: data.recipe_ingredient_unit[i],
                        unit: {
                            key: unit.filter_id,
                            value: unit.unit
                        }
                    }
                })
            },
            steps: {
                count: data.recipe_steps.length,
                steps: data.recipe_steps,
            }
        }

        res.json(recipe)
    } catch (error) {
        res.json({
            status: 'Error',
            error: true,
            errorMessage: error.message,
            data: 'Hubo un error al cargar la receta del día'
        })
    }
})

router.get('/get/all', async (req, res) => {
    try {
        const recipeData = await getAllRecipes()
        const typeData = await getFoodData.foodTypes()
        const tagData = await getFoodData.foodTags()
        const unitsData = await getFoodData.foodUnits()

        const recipes = await Promise.all(recipeData.map(async (recipe) => {
            const tags = tagData.filter(tag => recipe.recipe_tag.some(tagId => tag.tag_id === tagId))
            const types = typeData.filter(type => recipe.recipe_type.some(tagId => type.categoty_id === tagId))
            const timeU = recipe.recipe_time_unit.map(unit => {
                if (unit === 1) {
                    return "Minutos"
                } else if (unit === 2) {
                    return "Horas"
                } else {
                    return "Desconocido"
                }
            })

            return {
                id: recipe.recipe_id,
                owner: {
                    id: recipe.user_id,
                    username: recipe.user_basic_information.user_username
                },
                name: recipe.recipe_name,
                description: recipe.recipe_description,
                mainImg: recipe.recipe_img,
                addedAt: recipe.created_at,
                tag: {
                    count: tags.length,
                    tags: tags.map(tag => {
                        return {
                            key: tag.tag_id,
                            value: tag.name,
                        }
                    })
                },
                category: {
                    count: types.length,
                    tags: types.map(type => {
                        return {
                            key: type.categoty_id,
                            value: type.category,
                        }
                    })
                },
                time: {
                    from: `${recipe.recipe_time[0]} ${timeU[0]}`,
                    to: `${recipe.recipe_time[1]} ${timeU[1]}`
                },
                ingredients: {
                    count: recipe.recipe_ingredients.length,
                    ingredients: recipe.recipe_ingredients.map((ingredient, i) => {
                        const unit = unitsData.find(unit => unit.filter_id === recipe.recipe_ingredient_amount[i])

                        return {
                            name: ingredient,
                            amount: recipe.recipe_ingredient_unit[i],
                            unit: {
                                key: unit.filter_id,
                                value: unit.unit
                            }
                        }
                    })
                },
                steps: {
                    count: recipe.recipe_steps.length,
                    steps: recipe.recipe_steps,
                }
            }
        }))

        res.json(recipes).status(200)
    } catch (error) {
        console.log('Error ' + error)
    }
})

router.get('/get/all/basic', async (req, res) => {
    try {
        const recipeData = await getBasicRecipeInformation()
        const tagData = await getFoodData.foodTags()

        const recipe = recipeData.map(recipe => {
            const tags = tagData.filter(tag => recipe.recipe_tag.some(tagId => tag.tag_id === tagId))
            const timeU = recipe.recipe_time_unit.map(unit => {
                if (unit === 1) {
                    return "Minutos"
                } else if (unit === 2) {
                    return "Horas"
                } else {
                    return "Desconocido"
                }
            })

            return {
                id: recipe.recipe_id,
                owner: {
                    id: recipe.user_id,
                    username: recipe.user_basic_information.user_username
                },
                name: recipe.recipe_name,
                mainImg: recipe.recipe_img,
                tag: {
                    count: tags.length,
                    tags: tags.map(tag => {
                        return {
                            key: tag.tag_id,
                            value: tag.name,
                        }
                    })
                },
                time: {
                    from: `${recipe.recipe_time[0]} ${timeU[0]}`,
                    to: `${recipe.recipe_time[1]} ${timeU[1]}`
                },

            }
        })

        res.json(recipe).status(200)
    } catch (error) {
        console.log('Error ' + error)
    }
})

router.get('/get/:id/basic', async (req, res) => {
    try {
        const { id } = req.params

        const recipeData = await getBasicRecipeInformationById(id)
        const tagData = await getFoodData.foodTags()


        const tags = tagData.filter(tag => recipeData.recipe_tag.some(tagId => tag.tag_id === tagId))
        const timeU = recipeData.recipe_time_unit.map(unit => {
            if (unit === 1) {
                return "Minutos"
            } else if (unit === 2) {
                return "Horas"
            } else {
                return "Desconocido"
            }
        })

        const recipe = {
            id: recipeData.recipe_id,
            owner: {
                id: recipeData.user_id,
                username: recipeData.user_basic_information.user_username
            },
            name: recipeData.recipe_name,
            mainImg: recipeData.recipe_img,
            tag: {
                count: tags.length,
                tags: tags.map(tag => {
                    return {
                        key: tag.tag_id,
                        value: tag.name,
                    }
                })
            },
            time: {
                from: `${recipeData.recipe_time[0]} ${timeU[0]}`,
                to: `${recipeData.recipe_time[1]} ${timeU[1]}`
            },

        }

        res.json(recipe).status(200)
    } catch (error) {
        console.log('Error ' + error)
    }
})

router.get('/get/:id', async (req, res) => {
    try {
        const { id } = req.params

        const recipeData = await getRecipeByRecipeId(id)
        const typeData = await getFoodData.foodTypes()
        const tagData = await getFoodData.foodTags()
        const unitsData = await getFoodData.foodUnits()


        const tags = tagData.filter(tag => recipeData.recipe_tag.some(tagId => tag.tag_id === tagId))
        const types = typeData.filter(type => recipeData.recipe_type.some(tagId => type.categoty_id === tagId))
        const timeU = recipeData.recipe_time_unit.map(unit => {
            if (unit === 1) {
                return "Minutos"
            } else if (unit === 2) {
                return "Horas"
            } else {
                return "Desconocido"
            }
        })

        const recipes = {
            id: recipeData.recipe_id,
            owner: {
                id: recipeData.user_id,
                username: recipeData.user_basic_information.user_username
            },
            name: recipeData.recipe_name,
            description: recipeData.recipe_description,
            mainImg: recipeData.recipe_img,
            addedAt: recipeData.created_at,
            tag: {
                count: tags.length,
                tags: tags.map(tag => {
                    return {
                        key: tag.tag_id,
                        value: tag.name,
                    }
                })
            },
            category: {
                count: types.length,
                tags: types.map(type => {
                    return {
                        key: type.categoty_id,
                        value: type.category,
                    }
                })
            },
            time: {
                from: `${recipeData.recipe_time[0]} ${timeU[0]}`,
                to: `${recipeData.recipe_time[1]} ${timeU[1]}`
            },
            ingredients: {
                count: recipeData.recipe_ingredients.length,
                ingredients: recipeData.recipe_ingredients.map((ingredient, i) => {
                    const unit = unitsData.find(unit => unit.filter_id === recipeData.recipe_ingredient_amount[i])

                    return {
                        name: ingredient,
                        amount: recipeData.recipe_ingredient_unit[i],
                        unit: {
                            key: unit.filter_id,
                            value: unit.unit
                        }
                    }
                })
            },
            steps: {
                count: recipeData.recipe_steps.length,
                steps: recipeData.recipe_steps,
            }
        }


        res.json(recipes).status(200)
    } catch (error) {
        console.log('Error ' + error)
    }
})

router.get('/form/img', (req, res) => {
    res.sendFile(join(__dirname, '../public/recipeImgForm.html'))
})

router.get('/form', async (req, res) => {
    try {
        const typeData = await getFoodData.foodTypes()
        const tagData = await getFoodData.foodTags()
        const unitData = await getFoodData.foodUnits()

        res.render('recipeForm', { typeData, tagData, unitData })
    } catch (error) {

        console.log(error)
    }
})

router.post('/post', async (req, res) => {
    try {

        upload.basicRecipe('recipes_basic', TartaDeManzana)

    } catch (error) {
        console.log('Error al subir la receta' + error)
    }
})

export default router