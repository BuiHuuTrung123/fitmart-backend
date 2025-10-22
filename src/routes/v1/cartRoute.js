import express from 'express'
import { cartValidation } from '~/validations/cartValidation'
import { cartController } from '~/controllers/cartController'

import { authMiddleware } from '~/middlewares/authMiddleware'

import { multerUploadMiddleware } from '~/middlewares/multerUploadMiddleware'

const Router = express.Router()
Router.route('/')
    .post(authMiddleware.isAuthorized, cartValidation.addItemToCart, cartController.addItemToCart)
    // .get(productController.getAllData)
Router.route('/:id')
    .get( cartController.getCartDetail)

//multerUploadMiddleware.upload.single('image')
export const cartRoute = Router