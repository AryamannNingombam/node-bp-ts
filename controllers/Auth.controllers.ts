import { NextFunction, Request, Response } from 'express'
import UserModel, { UserDoc } from '../models/User.model'
import jwt from 'jsonwebtoken'
import { SendAccountVerificationMail } from '../services/mailer.service'

export const VerifyAccount = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { hash } = req.params
  if (!hash)
    return res.status(500).json({
      success: false,
      message: 'Required values not provided!',
    })
  UserModel.findOne({
    accountVerificationHash: hash,
    accountVerificationDeadline: {
      $gt: new Date(Date.now()),
    },
  })
    .then(async (user) => {
      await user?.VerifyAccount()
      return res.status(200).json({
        success: true,
      })
    })
    .catch((err) => {
      console.log('Error!')
      console.log(err)
      return res.status(500).json({
        success: false,
        message: 'Unknown server error!',
      })
    })
}

export const SignIn = (req: Request, res: Response, next: NextFunction) => {
  const { email, password } = req.body
  if (!email || !password) {
    return res.status(500).json({
      success: false,
      message: 'Required values not provided!',
    })
  }

  let jwtHash = process.env.JWT_TOKEN_VALUE
  UserModel.findOne({ email, verified: true })
    .then(async (user) => {
      if (user) {
        if (!user.verified) {
          return res.status(500).json({
            success: false,
            message: 'Account not verified!',
          })
        }
        const check = await user.MatchPassword(password)

        if (!check) {
          console.log('Error')

          return res.status(500).json({
            success: false,
            message: 'Unknown server error!',
          })
        }

        if (!jwtHash) {
          throw new Error('Hash not provided!')
        }
        const userData = user.GetUserData()
        const token = jwt.sign({ userData }, jwtHash, {
          expiresIn: '10h',
        })
        return res.status(200).json({
          success: true,
          token,
          userData: userData,
        })
      } else {
        return res.status(500).json({
          success: false,
          message: 'Username does not exist!',
        })
      }
    })
    .catch((err) => {
      console.log('Error')
      console.log(err)
      return res.status(500).json({
        success: false,
        message: 'Unknown server error!',
      })
    })
}

export const SignUp = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { username, email } = req.body

  //checking if the username or email already exists;
  const usernameCheck = await UserModel.find({
    username,
  })
  if (usernameCheck.length !== 0) {
    return res.status(500).json({
      success: false,
      message: 'Username already exists!',
    })
  }
  const emailCheck = await UserModel.find({ email })
  if (emailCheck.length !== 0) {
    return res.status(500).json({
      success: false,
      message: 'Email already exists!',
    })
  }
  const newUser = new UserModel(req.body as UserDoc)

  newUser
    .save()
    .then(async (n) => {
      const hash = await n.SetAccountVerificationHash()
      //sending the email;
      await SendAccountVerificationMail(email, hash)
      return res.status(200).json({
        success: true,
      })
    })
    .catch((err) => {
      console.log('Error!')
      console.log(err)
      return res.status(500).json({
        success: false,
        message: 'Unknown server error!',
      })
    })
}