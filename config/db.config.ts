import mongoose from 'mongoose'

export const connectToDB = async () => {
  if (!process.env.MONGO_DB_URI) {
    console.log('URI not provided!')
    return
  }
  
  const conn = await mongoose.connect(process.env.MONGO_DB_URI)
  console.log(`MongoDB connected: ${conn.connection.host}`)
}
