import { userModel } from '~/models/userModel'
import ApiError from '~/utils/ApiError'
import { StatusCodes } from 'http-status-codes'
import bcryptjs from 'bcryptjs'
import { v4 as uuidv4 } from 'uuid'
import { pickUser } from '~/utils/formatters'
import { WEBSITE_DOMAIN } from '~/utils/constants'
import { BrevoProvider } from '~/providers/BrevoProvider'
import { env } from '~/config/environment'
import { jwtProvider } from '~/providers/jwtProvider'
import {CloudinaryProvider} from '~/providers/CloudinaryProvider'
const createNew = async (reqBody) => {
    try {
        // Kiem tra email da ton tai trong hệ thống chưa
        const existUser = await userModel.findOneByEmail(reqBody.email)
        if (existUser) {
            throw new ApiError(StatusCodes.CONFLICT, 'Email already exists !')

        }
        //nameFromEmail: nếu email là trung@gmail.com thì sẽ lấy được trung
        const nameFromEmail = reqBody.email.split('@')[0]
        const newUser = {
            email: reqBody.email,
            password: bcryptjs.hashSync(reqBody.password, 8),
            username: nameFromEmail,
            displayName: nameFromEmail,
            verifyToken: uuidv4()

        }
        //Tạo data để lưu vào dataBase
        const createdUser = await userModel.createNew(newUser)
        const getNewUser = await userModel.findOneById(createdUser.insertedId)

        //Gửi email cho người dùng xác thực
        const verifycationLink = `${WEBSITE_DOMAIN}/account/verification?email=${getNewUser.email}&token=${getNewUser.verifyToken}`
        const customSubject = 'Please verify your email before using our service'
        const htmlContent = `
        <h3>Here is your verifycation link: </h3>
        <h3>${verifycationLink}</h3>
        <h3>Sincerely, <br/> - TrungBuiDev -Mot lap trinh vien </h3>
        `
        //gọi tới Provider gửi email
        await BrevoProvider.sendEmail(getNewUser.email, customSubject, htmlContent)
        // return trả về dữ liệu
        return pickUser(getNewUser)
    } catch (error) { throw error }
}

const verifyAccount = async (reqBody) => {
    try {
        const existUser = await userModel.findOneByEmail(reqBody.email)
        if (!existUser) throw new ApiError(StatusCodes.NOT_FOUND, 'Account not found')
        if (existUser.isActive) throw new ApiError(StatusCodes.NOT_ACCEPTABLE, 'Your account is already active')
        if (reqBody.token !== existUser.verifyToken) throw new ApiError(StatusCodes.NOT_ACCEPTABLE, 'Token invalid')

        const updateData = {
            isActive: true,
            verifyToken: null
        }
        const updatedUser = await userModel.update(existUser._id, updateData)
        return pickUser(updatedUser)
    } catch (error) {
        throw error
    }
}
const login = async (reqBody) => {
    try {
        const existUser = await userModel.findOneByEmail(reqBody.email)

        if (!existUser) throw new ApiError(StatusCodes.NOT_FOUND, 'Account not found')
        if (!existUser.isActive) throw new ApiError(StatusCodes.NOT_ACCEPTABLE, 'Your account is not active')
        if (!bcryptjs.compareSync(reqBody.password, existUser.password)) {
            throw new ApiError(StatusCodes.NOT_ACCEPTABLE, 'Your email or password is incorrect!')
        }
        // Nếu mọi thứ ok thì bắt đầu tạo tokens đăng nhập để trả về FE
        //Tạo thông tin để đính kèm trong JWT Token bao gồm _id và email của user
        const userInfo = {
            _id: existUser._id,
            email: existUser.email
        }

        // Tạo ra 2 loại token, accessToken và refreshToken để trả FE
        const accessToken = await jwtProvider.generateToken(
            userInfo,
            env.ACCESS_TOKEN_SECRET_SIGNATURE,

            env.ACCESS_TOKEN_LIFE
        )
        const refreshToken = await jwtProvider.generateToken(
            userInfo,
            env.REFRESH_TOKEN_SECRET_SIGNATURE,
            env.REFRESH_TOKEN_LIFE

        )
        // Trả về thông tin user kèm 2 cái Token vừa tạo
        return { accessToken, refreshToken, ...pickUser(existUser) }
    } catch (error) {
        throw error
    }
}
const refreshToken = async (clientRefreshToken) => {
    try {
        // Verify / giải mã cái refresh token xem có hợp lệ không
        const refreshTokenDecoded = await jwtProvider.verifyToken(
            clientRefreshToken,
            env.REFRESH_TOKEN_SECRET_SIGNATURE
        )

        // Đoạn này vì chúng ta chỉ lưu những thông tin unique và cố định của user trong token rồi,
        // vì vậy có thể lấy luôn từ decoded ra, tiết kiệm query vào DB để lấy data mới.
        const userInfo = {
            _id: refreshTokenDecoded._id,
            email: refreshTokenDecoded.email
        }

        // Tạo accessToken mới
        const accessToken = await jwtProvider.generateToken(
            userInfo,
            env.ACCESS_TOKEN_SECRET_SIGNATURE,

            env.ACCESS_TOKEN_LIFE // Ví dụ: '1h' (1 tiếng)
        )

        return { accessToken }
    } catch (error) {
        throw error
    }
}
const update = async (userId, reqBody, userAvataFile) => {
    try {
        // Query User và kiểm tra cho chắc chắn
        const existUser = await userModel.findOneById(userId)
        if (!existUser) throw new ApiError(StatusCodes.NOT_FOUND, 'Account not found!')
        if (!existUser.isActive) throw new ApiError(StatusCodes.NOT_ACCEPTABLE, 'Your account is not active!')

        // Khởi tạo kết quả updated User ban đầu là empty
        let updatedUser = {}    

        if (reqBody.current_password && reqBody.new_password) {
            //Kiểm tra xem current_password có đúng k 
            if (!bcryptjs.compareSync(reqBody.current_password, existUser.password)) {
               
                throw new ApiError(StatusCodes.NOT_ACCEPTABLE, 'Your current password is incorrect!')
            }
            updatedUser = await userModel.update(existUser._id, {
                password: bcryptjs.hashSync(reqBody.new_password, 8),
            })
            
        }
        else if (userAvataFile) {
        //upload file len cloudinary
        const uploadResult = await CloudinaryProvider.streamUpload(userAvataFile.buffer,'users')

         updatedUser = await userModel.update(existUser._id, {
           avatar: uploadResult.secure_url
         })
      
        }
        else {
            //Update các thông tin chung
            updatedUser = await userModel.update(existUser._id, reqBody)
        }
        return pickUser(updatedUser)
    } catch (error) {
 throw error
    }
}
export const userService = {
    createNew,
    verifyAccount,
    login,
    refreshToken,
    update
}