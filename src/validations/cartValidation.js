import Joi from 'joi'
import ApiError from '~/utils/ApiError'
import { StatusCodes } from 'http-status-codes'

const createNew = async (req, res, next) => {
  const correctCondition = Joi.object({
    // ID người dùng
    productId: Joi.string().required(),
    items: Joi.array().items.optional(), // Có thể rỗng khi tạo cart mới
    status: Joi.string().valid('active', 'completed', 'cancelled').default('active'),
    total: Joi.number().min(0).default(0)
  })

  try {
    await correctCondition.validateAsync(req.body, { abortEarly: false })
    next()
  } catch (error) {
    next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, new Error(error).message))
  }
}


const addItemToCart = async (req, res, next) => {
  const correctCondition = Joi.object({
    productId: Joi.string().required(), // Chỉ kiểm tra có tồn tại và là string
    quantity: Joi.number().integer().min(1).optional().default(1)
  })

  try {
    await correctCondition.validateAsync(req.body, { abortEarly: false })
    next()
  } catch (error) {
    next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, new Error(error).message))
  }
}

export const cartValidation = {
  createNew,
  addItemToCart, 

}