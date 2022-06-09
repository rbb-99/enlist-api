import express from 'express'
const router = new express.Router
import auth from '../middleware/auth.js'
import User from '../models/user.js'
import multer from 'multer'
import sharp from 'sharp'
import mail from '../emails/account.js'

//create user | signup
router.post('/users', async (req, res) => {
    const user = new User(req.body)
    try {
        await user.save()
        mail.sendWelcomeEmail(user.email, user.name)
        const token = await user.generateAuthToken()
        res.status(201).send({ user, token })
    } catch (e) {
        res.status(400).send(e)
    }
})

//login user
router.post('/users/login', async (req, res) => {
    try {
        const user = await User.findByCredentials(req.body.email, req.body.password)
        const token = await user.generateAuthToken()
        res.send({ user, token })
    } catch (e) {
        res.status(400).send()
    }
})

//logout user
router.post('/users/logout', auth, async (req, res) => {
    try {
        req.user.tokens = req.user.tokens.filter((token) => token.token !== req.token)
        await req.user.save()
        res.send()
    } catch (e) {
        res.status(500).send()
    }
})

//logout of all devices/sessions
router.post('/users/logoutAll', auth, async (req, res) => {
    try {
        req.user.tokens = []
        await req.user.save()
        res.send()
    } catch (e) {
        res.status(500).send()
    }
})

//read profile
router.get('/users/me', auth, async (req, res) => {
    //since this function runs only if the user is authorized, we can directly send the user 
    res.send(req.user)
})

//upload an avatar
const upload = multer({
    limits: {
        fileSize: 1000000
    },
    fileFilter(req, file, cb) {
        if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
            return cb(new Error('Please upload an image'))
        }
        //accept the image
        cb(undefined, true)
    }
})
router.post('/users/me/avatar', auth, upload.single('avatar'), async (req, res) => {
    // req.user.avatar = req.file.buffer
    const buffer = await sharp(req.file.buffer).resize({width: 250, height: 250}).png().toBuffer()
    req.user.avatar = buffer
    await req.user.save()
    res.send()
}, (error, req, res, next) => {
    res.status(400).send({ error: error.message })
})

//delete avatar
router.delete('/users/me/avatar', auth, async(req, res)=>{
    req.user.avatar =  undefined
    await req.user.save()
    res.send()
})

//get the avatar for serving
router.get('/users/:id/avatar', async(req, res)=>{
    try {
        const user = await User.findById(req.params.id)
        if(!user || !user.avatar)
            throw new Error()
        res.set('Content-Type', 'image/png')
        res.send(user.avatar)
    } catch (e) {
        res.status(404).send()
    }
})

//update profile
router.patch('/users/me', auth, async (req, res) => {
    //updates will be an array of properties on the object
    const updates = Object.keys(req.body)
    const allowedUpdates = ['name', 'email', 'password', 'age']
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update))
    if (!isValidOperation)
        return res.status(400).send({ error: 'Invalid Updates!' })
    try {
        updates.forEach((update) => req.user[update] = req.body[update])
        await req.user.save()
        res.send(req.user)
    } catch (e) {
        //can be a server connection error or validtion error
        //for the time being send client error, bad request
        res.status(400).send(e)
    }
})

//delete profile
router.delete('/users/me', auth, async (req, res) => {
    try {
        await req.user.remove()
        mail.sendCancellationEmail(req.user.email, req.user.name)
        res.send(req.user)
    } catch (e) {
        res.status(500).send()
    }
})

export default router
