import User from './models/User.js'
import bcrypt from 'bcrypt'
import connectToDatabase from './db/db.js'
import dotenv from 'dotenv'

dotenv.config()
const userRegister = async()=>{
    await connectToDatabase()
    try{

        const existing = await User.findOne({email:"admin@gmail.com"})
        if(existing){
            console.log("Admin user already exists")
            return;
        }
        const hashPassword = await bcrypt.hash("admin",10)
        const newUser = new User({
            name:"admin",
            email:"admin@gmail.com",
            password:hashPassword,
            role:"admin"
        })
        await newUser.save()
        console.log("Admin user created successfully")
    }catch(err){
        console.log(err);
    }
}
userRegister()
