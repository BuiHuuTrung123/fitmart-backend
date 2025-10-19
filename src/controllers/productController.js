import { StatusCodes } from 'http-status-codes'
import { productService } from '~/services/productService'
import { productModel } from '~/models/productModel'
const createNew = async (req, res, next) => {
    try {
        //Điều hướng dữ liệu sang tầng service
        const createProduct = await productService.createNew(req.body)
        // Có kết quả trả về Client
        res.status(StatusCodes.CREATED).json(createProduct)

    } catch (error) {
        next(error)
    }
}
const getAllData = async (req, res, next) => {
    try {
        //Điều hướng dữ liệu sang tầng service
        const allData = await productModel.getAllData(req.body)
        console.log(allData)
        // Có kết quả trả về Client
        res.status(StatusCodes.OK).json(allData)

    } catch (error) {
        next(error)
    }
}
export const productController = {
    createNew,
    getAllData
}