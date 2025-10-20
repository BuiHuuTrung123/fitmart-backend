
import { productModel } from '~/models/productModel'
import { CloudinaryProvider } from '~/providers/CloudinaryProvider'
const createNew = async (reqBody, productImageFile) => {
    try {
        let imageUrl = null;

        if (productImageFile) {
            const uploadResult = await CloudinaryProvider.streamUpload(productImageFile.buffer, 'products');
            imageUrl = uploadResult.secure_url;
        }

        // XÓA: không tạo slug nữa
        const productData = {
            ...reqBody,
            images: imageUrl
            // XÓA: slug: slug
        };

        const createdProduct = await productModel.createNew(productData)
        const getNewProduct = await productModel.findOneById(createdProduct.insertedId)

        return getNewProduct

    } catch (error) {
        throw error
    }
}
const update = async (productId, reqBody, productImageFile) => {
    try {
        let imageUrl = null;

        // Upload ảnh mới lên Cloudinary nếu có file
        if (productImageFile) {
            const uploadResult = await CloudinaryProvider.streamUpload(productImageFile.buffer, 'products');
            imageUrl = uploadResult.secure_url;
        }

        // Tạo object update data - chỉ những field có giá trị
        const updateData = { ...reqBody };

        // Xử lý price nếu có
        if (reqBody.price) {
            updateData.price = {
                current: parseFloat(reqBody.price.current),
                original: parseFloat(reqBody.price.original),
                discount: reqBody.price.discount || 0
            };
        }

        // Xử lý stock nếu có
        if (reqBody.stock) {
            updateData.stock = {
                quantity: parseInt(reqBody.stock.quantity)
            };
        }

        // Xử lý subCategory rỗng
        if (reqBody.subCategory === '') {
            updateData.subCategory = null; // ← CHUYỂN THÀNH NULL
        }

        // Nếu có ảnh mới, thêm vào update data
        if (imageUrl) {
            updateData.images = imageUrl;
        }

        // Xóa các field không cần thiết
        delete updateData._id;
        delete updateData.createdAt;
        delete updateData.updatedAt;

        // Gọi model update
        const updatedProduct = await productModel.update(productId, updateData);
        
        return updatedProduct;

    } catch (error) {
        throw error;
    }
}
export const productService = {
    createNew,
    update

}