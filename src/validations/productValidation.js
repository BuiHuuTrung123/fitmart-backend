// src/validations/productValidation.js
import Joi from 'joi'
import { StatusCodes } from 'http-status-codes'
import ApiError from '~/utils/ApiError'

// Category Configuration
const MAIN_CATEGORIES = {
  WHEY_PROTEIN: 'Whey Protein',
  MASS_GAINER: 'Sữa tăng cân',
  BCAA_AMINO: 'BCAA Amino Acids',
  STRENGTH: 'Tăng sức mạnh',
  WEIGHT_LOSS: 'Hỗ trợ giảm cân',
  VITAMINS: 'Vitamin khoáng chất',
  FISH_OIL: 'Dầu cá',
  ACCESSORIES: 'Phụ kiện tập gym'
}

const SUB_CATEGORIES = {
  [MAIN_CATEGORIES.WHEY_PROTEIN]: [
    'Hydrolyzed Whey Protein',
    'Whey Protein Isolate',
    'Whey Protein Blend',
    'Casein Protein',
    'Meal Replacement',
    'Protein Bar'
  ],
  [MAIN_CATEGORIES.MASS_GAINER]: [],
  [MAIN_CATEGORIES.BCAA_AMINO]: [
    'Essential Amino Acids'
  ],
  [MAIN_CATEGORIES.STRENGTH]: [
    'Pre Workout',
    'Beta Alanine',
    'Creatine'
  ],
  [MAIN_CATEGORIES.WEIGHT_LOSS]: [
    'Fat Burn',
    'CLA',
    'L-Carnitine',
    'Yến mạch'
  ],
  [MAIN_CATEGORIES.VITAMINS]: [
    'MultiVitamin',
    'Astaxanthin',
    'Testosterone',
    'Xương khớp',
    'ZMA'
  ],
  [MAIN_CATEGORIES.FISH_OIL]: [],
  [MAIN_CATEGORIES.ACCESSORIES]: [
    'Bình lắc',
    'Dây kháng lực',
    'Phụ kiện riêng của lacu',
    'Phụ kiện Harbinger'
  ]
}

const BRANDS = [
  'Redcon1', 'BPI Sports', 'Ostrovit', 'Ultimate Nutrition', 'Labrada',
  'Optimum Nutrition', 'Quaker', 'VitaXtrong', 'Now Foods', 'JNX Sports',
  'Biotech USA', 'Puritan\'s Pride', 'Doctor\'s Best', 'Webber Naturals', 'Scivation'
]

const PRODUCT_STATUS = {
  IN_STOCK: 'in_stock',
  OUT_OF_STOCK: 'out_of_stock',
  DISCONTINUED: 'discontinued',
  LOW_STOCK: 'low_stock'
}

// Price limits
const PRICE_LIMITS = {
  MIN: 0,
  MAX: 1000000000, // 1 tỷ VNĐ
}

// Get all subcategories for validation
const ALL_SUB_CATEGORIES = Object.values(SUB_CATEGORIES).flat()

const createNew = async (req, res, next) => {
  const correctCondition = Joi.object({
    // Basic Information
    slug: Joi.string().min(3).trim().strict().default(''),
    
    name: Joi.string().required().min(3).max(100).trim().strict()
      .messages({
        'string.empty': 'Product name is required',
        'string.min': 'Product name must be at least 3 characters',
        'string.max': 'Product name must be less than 100 characters',
        'any.required': 'Product name is required'
      }),

    description: Joi.string().required().min(10).max(1000).trim().strict()
      .messages({
        'string.empty': 'Product description is required',
        'string.min': 'Product description must be at least 10 characters',
        'string.max': 'Product description must be less than 1000 characters',
        'any.required': 'Product description is required'
      }),

    shortDescription: Joi.string().max(200).trim().strict().default(''),

    // Category System
    mainCategory: Joi.string().valid(...Object.values(MAIN_CATEGORIES)).required()
      .messages({
        'any.only': 'Main category must be one of the predefined categories',
        'any.required': 'Main category is required'
      }),

    subCategory: Joi.string().valid(...ALL_SUB_CATEGORIES).when('mainCategory', {
      is: Joi.valid(MAIN_CATEGORIES.MASS_GAINER, MAIN_CATEGORIES.FISH_OIL),
      then: Joi.optional().allow('').allow(null),
      otherwise: Joi.required()
    }).messages({
      'any.only': 'Sub category must be one of the predefined sub categories',
      'any.required': 'Sub category is required for this main category'
    }),

    // Brand
    brand: Joi.string().valid(...BRANDS).required()
      .messages({
        'any.only': 'Brand must be one of the predefined brands',
        'any.required': 'Brand is required'
      }),

    // Price
    price: Joi.object({
      current: Joi.number()
        .min(PRICE_LIMITS.MIN)
        .max(PRICE_LIMITS.MAX)
        .required()
        .messages({
          'number.min': 'Current price must be greater than or equal to 0',
          'number.max': 'Current price is too large',
          'any.required': 'Current price is required'
        }),
      original: Joi.number()
        .min(PRICE_LIMITS.MIN)
        .max(PRICE_LIMITS.MAX)
        .default(Joi.ref('current'))
        .messages({
          'number.min': 'Original price must be greater than or equal to 0',
          'number.max': 'Original price is too large'
        }),
      discount: Joi.number().min(0).max(100).default(0)
        .messages({
          'number.min': 'Discount must be greater than or equal to 0',
          'number.max': 'Discount cannot exceed 100%'
        })
    }).required(),

    // Inventory & Stock
    stock: Joi.object({
      quantity: Joi.number().min(0).required()
        .messages({
          'number.min': 'Stock quantity must be greater than or equal to 0',
          'any.required': 'Stock quantity is required'
        }),
      status: Joi.string().valid(...Object.values(PRODUCT_STATUS)).default(PRODUCT_STATUS.IN_STOCK)
        .messages({
          'any.only': 'Stock status must be one of: in_stock, out_of_stock, low_stock, discontinued'
        })
    }).required(),

    // Media - Required with at least 1 image
    images: Joi.array().items(
      Joi.object({
        url: Joi.string().uri().required()
          .messages({
            'string.uri': 'Image URL must be a valid URI',
            'any.required': 'Image URL is required'
          }),
        alt: Joi.string().max(100).default(''),
        isPrimary: Joi.boolean().default(false)
      })
    ).min(1).required()
      .messages({
        'array.min': 'At least one product image is required',
        'any.required': 'Product images are required'
      }),

    _destroy: Joi.boolean().default(false)
  })

  try {
    await correctCondition.validateAsync(req.body, { abortEarly: false })
    next()
  } catch (error) {
    const errorMessage = new Error(error).message
    const customError = new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, errorMessage)
    next(customError)
  }
}

const update = async (req, res, next) => {
  const correctCondition = Joi.object({
    // Basic Information
    name: Joi.string().min(3).max(100).trim().strict(),
    description: Joi.string().min(10).max(1000).trim().strict(),
    shortDescription: Joi.string().max(200).trim().strict(),

    // Category System
    mainCategory: Joi.string().valid(...Object.values(MAIN_CATEGORIES)),
    subCategory: Joi.string().valid(...ALL_SUB_CATEGORIES),

    // Brand
    brand: Joi.string().valid(...BRANDS),

    // Price
    price: Joi.object({
      current: Joi.number().min(0),
      original: Joi.number().min(0),
      discount: Joi.number().min(0).max(100)
    }),

    // Inventory & Stock
    stock: Joi.object({
      quantity: Joi.number().min(0),
      status: Joi.string().valid(...Object.values(PRODUCT_STATUS))
    }),

    // Media
    images: Joi.array().items(
      Joi.object({
        url: Joi.string().uri().required(),
        alt: Joi.string().max(100).default(''),
        isPrimary: Joi.boolean().default(false)
      })
    ).min(1)
  }).min(1) // At least one field must be updated

  try {
    await correctCondition.validateAsync(req.body, { abortEarly: false })
    next()
  } catch (error) {
    const errorMessage = new Error(error).message
    const customError = new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, errorMessage)
    next(customError)
  }
}

export const productValidation = {
  createNew,
  update
}