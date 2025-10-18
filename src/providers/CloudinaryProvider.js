import cloudinary from 'cloudinary'
import streamifier from 'streamifier'
import { env } from '~/config/environment'

const cloudinaryV2 = cloudinary.v2
cloudinaryV2.config({
    cloud_name: env.CLOUDINARY_CLOUD_NAME,
    api_key: env.CLOUDINARY_API_KEY,
    api_secret: env.CLOUDINARY_API_SECRET
})

//khoi tao function upload cloudinary
const streamUpload = (fileBuffer, folderName) => {
    return new Promise((resolve, reject) => {
        // Create a stream upload to Cloudinary
        const stream = cloudinaryV2.uploader.upload_stream({ folder: folderName }, (err, result) => {
            if (err) reject(err)
            else resolve(result)
        })

        // Upload the file buffer stream using streamifier
        streamifier.createReadStream(fileBuffer).pipe(stream)
    })
}

export const CloudinaryProvider = { streamUpload }