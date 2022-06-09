import jwt from 'jsonwebtoken'
import User from '../models/user.js'

const auth = async (req, res, next) => {
    //validate the user
    try {
        const token = req.header('Authorization').replace('Bearer ', '')
        //if there is no token it'll return undefined and when we replace undefined it throws an error which is already handled by the try-catch block
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        //find the user id who has that authorization token still stored
        const user = await User.findOne({ _id: decoded._id, 'tokens.token': token })
        if (!user)
            throw new Error()
        //since, there is an authorised user we send it to the route handlers with the token so that the route handlers don't again have to find the user
        req.token = token
        req.user = user
        next()
    } catch (e) {
        res.status(401).send({ error: 'Please authenticate.' })
    }
}

export default auth
