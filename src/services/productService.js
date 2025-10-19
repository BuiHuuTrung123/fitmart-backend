
import { productModel } from '~/models/productModel'
const createNew = async (reqBody) => {
    try {
        // Xử lý logic dữ liệu
        const newProduct = {
            ...reqBody,
            // slug: slugify(reqBody.title)

        }
        //Gọi tới tầng model để xử lý lưu bản ghi newBoard
        const createdProduct = await productModel.createNew(newProduct)
        const getNewProduct = await productModel.findOneById(createdProduct.insertedId)
 

        return getNewProduct

    } catch (error) {
        throw error
    }
}
export const productService = {
    createNew

}