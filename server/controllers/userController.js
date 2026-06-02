import User from "../models/user.js";
import jwt from 'jsonwebtoken'
import bcrypt from "bcryptjs";
import Chat from "../models/chat.js";
import { Images } from "openai/resources/images.mjs";



// Genrate JWT Token
const generateToken = (id)=>{
    return jwt.sign({id}, process.env.JWT_SECERT, {expiresIn:"30d"})
}
   
// API to register user
export const registerUser = async (req, res) => {
    const { name, email, password } = req.body;

    try {

        // Check if user already exists
        const userExists = await User.findOne({ email });

        if (userExists) {
            return res.json({
                success: false,
                message: "User already exists"
            });
        }

        // Create new user
        const user = await User.create({
            name,
            email,
            password
        });

        // Generate token
        const token = generateToken(user._id);

        return res.json({
            success: true,
            token,
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                credits: user.credits
            }
        });

    } catch (error) {
        return res.json({
            success: false,
            message: error.message
        });
    }
};




// API to login user
export const loginUser =async (req, res)=>{
    const {email, password} = req.body;
    try {
        const user =await User.findOne({email})
        if(user){
            const isMatch = await bcrypt.compare(password, user.password)
            if(isMatch){
                const token = generateToken(user._id);
                return res.json({success:true, token})
            }
        }
        return res.json({success:false, message:"invalid email or password"});
        
    } catch (error) {
          return res.json({success:false, message:error.message})

    }

}


// API to get user data
export const getUser = async(req, res)=>{
try {
    const user = req.user;
    return res.json({success:true, user})
} catch (error) {
    return res.json({success:false, message:error.message})
}
}





// Published Images 

export const getPublishedImages = async (req, res)=>{
    try {
        const publishedImageMessages = await Chat.aggregate([
            {$unwind: "$messages"},
            {
                $match:{
                    "messages.isImage":true,
                    "messages.isPublished":true,
                }
            },
            {
                $project:{
                    _id:0,
                    imageUrl:"$message.content",
                    userName :"$userName"
                }
            }
        ])

        res.json({success:true, Images:publishedImageMessages.reverse()})
    } catch (error) {
        
    }
}