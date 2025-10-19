import express from 'express'
import { productValidation } from '~/validations/productValidation'
import { productController } from '~/controllers/productController'

import { authMiddleware } from '~/middlewares/authMiddleware'

import { multerUploadMiddleware } from '~/middlewares/multerUploadMiddleware'
const Router = express.Router()
Router.route('/')
    .get(authMiddleware.isAuthorized, productController.getAllData)
    .post(authMiddleware.isAuthorized, productValidation.createNew, productController.createNew)

//multerUploadMiddleware.upload.single('image')
export const productRoute = Router