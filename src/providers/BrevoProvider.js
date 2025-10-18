import {env} from '~/config/environment'
const SibApiV3Sdk = require('@getbrevo/brevo')

let apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();

let apiKey = apiInstance.authentications['apiKey']
apiKey.apiKey = env.BREVO_API_KEY



const sendEmail = async (recipientEmail,customSubject,htmlContent) =>{
//Khởi tạo SendSmtpEmail với thông tin cần thiết
let message = new SibApiV3Sdk.SendSmtpEmail();
//Tài khoản gửi mail : email tạo tk của bạn trên brevo
message.sender = { name: env.ADMIN_EMAIL_NAME, email: env.ADMIN_EMAIL_ADDRESS };
//Những tài khoản nhận email
//To là 1 array để tùy biến gửi đến nhiều user
message.to = [{ email: recipientEmail }]
//Tiêu đề email
message.subject = customSubject;
//Nội dung email dạng html
message.htmlContent = htmlContent
//Gọi hành động gửi mail
return apiInstance.sendTransacEmail(message)
}

export const BrevoProvider = {
    sendEmail
}