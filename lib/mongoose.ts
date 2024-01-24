import mongoose from 'mongoose'
import { Monomaniac_One } from 'next/font/google'

let isConnected = false
export const connectToDB = async () => {
    mongoose.set('strictQuery', true) //prevent unknown query

    if (!process.env.MONGODB_URL) return console.log('MONGODB URL NOT FOUND')

    if (isConnected) return console.log('Already connected to MONGODB')

    try {
        await mongoose.connect(process.env.MONGODB_URL)
        isConnected = true
        console.log('Connected to mongodb')
    } catch (error) {
        console.log(error)
    }
}