import { GET_DB } from '~/config/mongodb'
import { ObjectId } from 'mongodb'
import Joi from 'joi'

// Define Collection (name & schema)
const CART_COLLECTION_NAME = 'carts'
const CART_COLLECTION_SCHEMA = Joi.object({
  userId: Joi.any().required(), // ID người dùng
  items: Joi.array().items(
    Joi.object({
      productId: Joi.any().required(),
      quantity: Joi.number().integer().min(1).required(),
      price: Joi.number().min(0).required(),
      name: Joi.string().required(),
      images: Joi.string().default(null)
    })
  ).default([]),
  status: Joi.string().valid('active', 'completed', 'cancelled').default('active'),
  total: Joi.number().min(0).default(0),

  createdAt: Joi.date().timestamp('javascript').default(Date.now),
  updatedAt: Joi.date().timestamp('javascript').default(null),
  _destroy: Joi.boolean().default(false)
})

const INVALID_UPDATE_FIELDS = ['_id', 'userId', 'createdAt']

const validateBeforeCreate = async (data) => {
  return await CART_COLLECTION_SCHEMA.validateAsync(data, { abortEarly: false })
}

const createNew = async (data) => {
  try {
    const validData = await validateBeforeCreate(data)
    const createdCart = await GET_DB()
      .collection(CART_COLLECTION_NAME)
      .insertOne(validData)

    return createdCart
  } catch (error) {
    throw new Error(error)
  }
}

// Tìm cart active của user
const findActiveCartByUserId = async (userId) => {
  try {
    return await GET_DB()
      .collection(CART_COLLECTION_NAME)
      .findOne({
        userId,
        status: 'active',
        _destroy: false
      })
  } catch (error) {
    throw new Error(error)
  }
}

// Thêm sản phẩm vào cart
const addItemToCart = async (userId, item) => {
  try {
    console.log('sdada')
    const userObjId = new ObjectId(userId)
    const simplifiedItem = {
      ...item,     // ✅ chỉ lấy id
      price: item.price.current,
      // ✅ lấy current price (number)
    }
    // 1. Tìm cart active của user
    const activeCart = await GET_DB()
      .collection(CART_COLLECTION_NAME)
      .findOne({
        userId: userObjId,
        status: 'active',
        _destroy: false
      })

    // 2. Nếu chưa có cart active → tạo mới
    if (!activeCart) {
      const newCart = {
        userId: userObjId,
        items: [simplifiedItem],
        status: 'active',
        total: item.price.current * item.quantity,
        createdAt: new Date(),
        updatedAt: new Date()
      }
      return await createNew(newCart)
    }

    const existingItem = await GET_DB().collection('carts').findOne({
      _id: activeCart._id,
      'items.productId': simplifiedItem.productId
    })
    if (existingItem) {
      // Nếu đã tồn tại -> tăng quantity thêm 1
      await GET_DB().collection('carts').updateOne(
        {
          _id: activeCart._id,
          'items.productId': simplifiedItem.productId
        },
        {
          $inc: { 'items.$.quantity': 1 } // tăng quantity
        }
      )
    }
    else {
      // Nếu chưa có -> thêm mới vào mảng
      await GET_DB().collection('carts').updateOne(
        { _id: activeCart._id },
        { $push: { items: simplifiedItem } }
      )
    }

    return activeCart

  } catch (error) {
    throw new Error(error)
  }
}
const findOneById = async (id) => {
  try {
    const result = await GET_DB().collection(CART_COLLECTION_NAME).findOne({
      _id: new ObjectId(id)
    })
    return result
  } catch (error) {
    throw new Error(error)
  }
}

const getCartDetail = async (userId) => {
  try {
    const result = await GET_DB().collection(CART_COLLECTION_NAME).findOne({
      userId: new ObjectId(userId),
      status: 'active',
      _destroy: false
    })
    
    return result
  } catch (error) {
    throw new Error(error)
  }
}

export const cartModel = {
  createNew,
  findActiveCartByUserId,
  findOneById,
  addItemToCart,
  getCartDetail
}