import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },

    email: {
        type: String,
        required: true,
        unique: true,
    },

    password: {
        type: String,
        required: true,
    },

    credits: {
        type: Number,
        default: 20,
    }
});


// Hash password before saving
userSchema.pre("save", async function () {

    // If password is not modified
    if (!this.isModified("password")) {
        return;
    }

    // Generate salt
    const salt = await bcrypt.genSalt(10);

    // Hash password
    this.password = await bcrypt.hash(this.password, salt);
});


const User = mongoose.model("User", userSchema);

export default User;