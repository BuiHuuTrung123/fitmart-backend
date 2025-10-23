import express from 'express'
import { cartValidation } from '~/validations/cartValidation'
import { cartController } from '~/controllers/cartController'
import { authMiddleware } from '~/middlewares/authMiddleware'

const Router = express.Router()
Router.route('/')
    .post(authMiddleware.isAuthorized, cartValidation.addItemToCart, cartController.addItemToCart)
// .get(productController.getAllData)
Router.route('/:id')
    .get(authMiddleware.isAuthorized, cartController.getCartDetail)
    .delete(authMiddleware.isAuthorized, cartController.deleteProductInCart)
//multerUploadMiddleware.upload.single('image')
export const cartRoute = Router