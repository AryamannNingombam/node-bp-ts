import nodemailer from 'nodemailer'
import { BACKEND_URL } from '../constants'

export const SendAccountVerificationMail = async (
  email: string,
  hash: string,
) => {
  let testAccount = await nodemailer.createTestAccount()
  let transporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: testAccount.user, // generated ethereal user
      pass: testAccount.pass, // generated ethereal password
    },
  })
  await transporter.sendMail({
    from: testAccount.user, // sender address
    to: email, // list of receivers
    subject: 'Forgot Password Mail!', // Subject line

    html: `
    <h1>Hey!</h1>
    Here is the <a href="${BACKEND_URL}/api/auth/verify-account/${hash}">link</a> to verify your account.
    `, // html body
  })
}
