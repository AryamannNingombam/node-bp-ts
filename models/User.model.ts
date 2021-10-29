import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'
import { GetAccountVerificationHash } from '../services/randomstring.service'

export interface UserData {
  username: string
  email: string
  verified: boolean
}

export interface UserDoc extends mongoose.Document {
  username: string
  email: string
  password: string
  verified: boolean
  accountVerificationHash?: string
  accountVerificationDeadline?: Date
  MatchPassword(password: string): boolean
  GetUserData(): UserData
  VerifyAccount(): null
  SetAccountVerificationHash(): string
}

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    match: /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
  },
})

UserSchema.pre<UserDoc>('save', async function (next) {
  if (!this.isModified('password')) {
    next()
  }

  const salt = await bcrypt.genSalt(10)
  this.password = await bcrypt.hash(this.password, salt)
})
UserSchema.methods.matchPassword = async function (p: string) {
  const user = this as UserDoc
  return await bcrypt.compare(p, user.password)
}

UserSchema.methods.MatchPassword = async function (password: string) {
  const user = this as UserDoc
  return await bcrypt.compare(password, user.password)
}
UserSchema.methods.GetUserData = async function () {
  const user = this as UserDoc
  return {
    username: user.username,
    email: user.email,
    verified: user.verified,
  }
}

UserSchema.methods.VerifyAccount = async function () {
  const user = this as UserDoc
  user.verified = true
  await user.save()
  return
}
UserSchema.methods.SetAccountVerificationHash = async function () {
  const user = this as UserDoc
  user.accountVerificationHash = GetAccountVerificationHash()
  //giving 30 minutes to verify the account.
  user.accountVerificationDeadline = new Date(Date.now() + 30 * 60000)
  await user.save()
}

export default mongoose.model<UserDoc>('User', UserSchema)