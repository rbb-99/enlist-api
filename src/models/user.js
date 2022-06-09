import mongoose from 'mongoose'
import validator from 'validator'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import Task from './task.js'

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
        validate(value) {
            if (!validator.isEmail(value)) {
                throw new Error('Email is invalid')
            }
        }
    },
    age: {
        type: Number,
        default: 0,
        validate(value) {
            if (value < 0)
                throw new Error('Age must be a positive number')
        }
    },
    password: {
        type: String,
        required: true,
        minlength: 7,
        trim: true,
        validate(value) {
            if (value.toLowerCase().includes('password'))
                throw new Error('Password cannot contain the string "password"')
        }
    },
    tokens: [{
        token: {
            type: String,
            required: true
        }
    }],
    avatar: {
        type: Buffer  //no validation needed, multer already takes care of that 
    }
}, {
    timestamps: true
})

//instead of saving tasks array to the User model, we define a virtual attribute
//on User model that references the relation between user and tasks; 
//It is virtual because we are not changing what we store for user document
userSchema.virtual('tasks', {
    //refer the Task model
    ref: 'Task',
    localField: '_id',
    foreignField: 'owner'
    //ie user._id = task.owner
})

//part of hiding private data like passwords and tokens
userSchema.methods.toJSON = function () {
    const user = this
    const userObject = user.toObject()  //this helps manipulate what we return in user profile
    delete userObject.password
    delete userObject.tokens
    delete userObject.avatar
    return userObject
}

userSchema.methods.generateAuthToken = async function () {
    const user = this
    const token = jwt.sign({ _id: user._id.toString() }, process.env.JWT_SECRET)
    user.tokens = user.tokens.concat({ token })
    await user.save()
    return token
}

userSchema.statics.findByCredentials = async (email, password) => {
    const user = await User.findOne({ email })
    if (!user)
        throw new Error('Unable to login')
    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch)
        throw new Error('Unable to login')
    return user
}

//hash the plain text password before saving
userSchema.pre('save', async function (next) {
    const user = this

    //this will be true when the user is first created and when its updated
    if (user.isModified('password'))
        user.password = await bcrypt.hash(user.password, 8)

    next()
})

//middleware to delete tasks when a user is removed
userSchema.pre('remove', async function(next){
    const user = this
    await Task.deleteMany({owner: user._id})
    next()
})

const User = mongoose.model('User', userSchema)

export default User
