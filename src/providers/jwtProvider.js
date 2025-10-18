import JWT from 'jsonwebtoken';

/**
 * Function tạo mã token - Cần 3 tham số đầu vào
 * userInfo: Thông tin người dùng (đã mã hóa token)
 * secretSignature: Chuỗi ký bí mật (dùng để chuỗi string cần nhiền) trên docs thì đề tên là privateKey tuy nhiên
 *  tokenLife: Thời gian sống của token
 */
const generateToken = async (userInfo, secretSignature, tokenLife) => {
    try {
        // Xử lý tạo token
        return JWT.sign(userInfo, secretSignature, { algorithm: 'HS256', expiresIn: tokenLife })
    } catch (error) {
        throw new Error(error);
    }
};

/**
 * Function kiểm tra token có hợp lệ hay không
 * Hợp lệ thì dùng gian la cài token được tạo ra để dùng với cái chư ký bí mật secretSignature trong một hay không
 */
const verifyToken = async (token, secretSignature, tokenLife) => {
    try {
        // Xử lý verify token
      return JWT.verify(token, secretSignature)
    } catch (error) {
        throw new Error(error);
    }
};

export const jwtProvider = {
    generateToken,
    verifyToken,
}