import { StatusCodes } from 'http-status-codes'
import { jwtProvider } from '~/providers/jwtProvider'
import { env } from '~/config/environment'
import ApiError from '~/utils/ApiError'

    // Middleware này sẽ đảm nhiệm việc quan trọng: Xác thực cái JWT accessToken nhận được từ phía FE có hợp lệ hay không
    const isAuthorized = async (req, res, next) => {
        const clientAcessToken = req.cookies?.accessToken

    if (!clientAcessToken) {
        next(new ApiError(StatusCodes.UNAUTHORIZED, 'Unauthorized! (token not found)'))
        return
    }
    try {
        //B1: Giải token xem hợp lệ k
        const accessTokenDecoded = await jwtProvider.verifyToken(clientAcessToken, env.ACCESS_TOKEN_SECRET_SIGNATURE)
 
        //B2: Nếu như token hợp lệ , thì lưu vào req, jwtDecoded, 
        req.jwtDecoded = accessTokenDecoded

        //B3: cho phép req đi tiếp
        next()
    } catch (err) {
        // console.log(authMiddleware: ', error)
        // Nếu lỗi là accessToken không còn hiệu lực (expired) thì mình có thể trả về lỗi với mã lỗi GONE - 410 cho phía FE
        // biết để gọi api refreshToken
        if (err?.message?.includes('jwt expired')) {
            next(new ApiError(StatusCodes.GONE, 'Need to refresh token...'))
            return
        }
        // Ngược lại thì accessToken không còn tồn tại nữa, mình trả về lỗi 401
        return next(new ApiError(StatusCodes.UNAUTHORIZED, 'UNAUTHORIZED'));
    }
}

export const authMiddleware = {
        isAuthorized
}