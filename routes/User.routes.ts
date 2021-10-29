import express from 'express'
import * as Controller from '../controllers/Auth.controllers'

const router = express.Router()

//all get requests;
router.get('/verify-account/:hash', Controller.VerifyAccount)

//all post requests;
router.post('/sign-in', Controller.SignIn)
router.post('/sign-up', Controller.SignUp)

//all put requests;

//all delete requests;

export { router as AuthRoutes }
