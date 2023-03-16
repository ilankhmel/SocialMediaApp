const router = require('express').Router()
const bcrypt = require("bcrypt")
const User = require("../models/User")
const Post = require("../models/Post")

//Update user
router.put("/:id",async (req,res)=>{
    if(req.body.userId === req.params.id || req.body.isAdmin){
        if(req.body.password){
            try{
                const salt = await bcrypt.genSalt(10)
                req.body.password = await bcrypt.hash(req.body.password, salt)
            }catch(err){
                console.log(err);
                return res.status(500).json(err)
            }
        }

        try{
            const user = await User.findByIdAndUpdate(req.params.id, {
                $set:req.body
            })
            res.status(200).json('Account has been updated')
        }catch(err){
            return res.status(500).json(err)
        }

    } else{
        return res.status(403).json("Not your account")
    }
})
//Delete user

router.delete("/:id",async (req,res)=>{
    if(req.body.userId === req.params.id || req.body?.isAdmin){

        try{
            const user = await User.findByIdAndDelete(req.params.id)
            res.status(200).json('Account has been deleted')
        }catch(err){
            return res.status(500).json(err)
        }

    } else{
        return res.status(403).json("Not your account")
    }
})

//Get all users

router.get('/all', async (req,res)=>{
    try{
        const users = await User.find({})
        // console.log(users);
        // users = users.map(user =>{
        //     const {password, updatedAt, ... other} = user
        //     return other
        // })
        // console.log(users);
        // const {password, updatedAt, ... other} = user._doc
        res.status(200).json(users)
    }catch(err){
        res.status(400).json(err)
    }
})

//Get user

router.get('/:id', async (req,res)=>{
    try{
        const user = await User.findById(req.params.id)
        const {password, updatedAt, ... other} = user._doc
        res.status(200).json(other)
    }catch(err){
        res.status(400).json(err)
    }
})


//Follow user

router.put('/:id/follow', async (req, res)=>{
    if(req.body.userId !== req.params.id){
        
        try{
            const user = await User.findById(req.params.id)
            const currentUser = await User.findById(req.body.userId)
            
            if(!user.followers.includes(req.body.userId)){
                await user.updateOne({$push: {followers:req.body.userId}})
                await currentUser.updateOne({$push: {following :req.params.id}})
                res.status(200).json('Account followed')
            }else{
                res.status(403).json("already following this account")
            } 
        }catch(err){
            res.status(500).json(err)
            res.status(403).json("You cant follow yourself")
        }
    }else{

    }
})

//Unfollow user

router.put('/:id/unfollow', async (req, res)=>{
    if(req.body.userId !== req.params.id){
        
        try{
            const user = await User.findById(req.params.id)
            const currentUser = await User.findById(req.body.userId)
            
            if(user.followers.includes(req.body.userId)){
                await user.updateOne({$pull: {followers:req.body.userId}})
                await currentUser.updateOne({$pull: {following :req.params.id}})
                res.status(200).json('Account unfollowed')
            }else{
                res.status(403).json("Not following this account")
            } 
        }catch(err){
            res.status(500).json(err)
            res.status(403).json("You cant unfollow yourself")
        }
    }else{

    }
})

//Change profile picture

router.put('/:id/setprofile', async (req, res)=>{
    const url = req.body.url
        try{
            const user = await User.findByIdAndUpdate(req.params.id, {$set:{profilePicture: url}})            
            res.status(200).json(user)
        }catch(err){
            res.status(500).json(err)
        }
})

//Change cover picture

router.put('/:id/setcover', async (req, res)=>{
    const url = req.body.url
        try{
            const user = await User.findByIdAndUpdate(req.params.id, {$set:{coverPicture: url}})            
            res.status(200).json(user)
        }catch(err){
            res.status(500).json(err)
        }
})

//Get user friends

router.get('/friends/:userId', async (req, res)=>{
    try{
        const user = await User.findById(req.params.userId)
        const friends = await Promise.all(
            user.following.map(async friendId =>{
                const friend = await User.findById(friendId)
                const {_id, username, profilePicture} = friend
                return{
                    _id, username, profilePicture
                }
            })
            )
        res.status(200).json(friends)
    }catch(err){
        console.log(err);
        res.status(500).json(err)
    }
})

//Handle user notifications

//Like notification
router.post('/notification/like/:userId', async (req, res) => {

    try {
        const post = await Post.findById(req.body.postId)
        const user = await User.findById(req.params.userId)
        if (post.likes.some(id=> id === req.body.userId)) {
            await user.update({ $push: {"notifications.likes": req.body}} )
            res.status(200).json('Added')
        } else {
            await user.update({ $pull: {"notifications.likes": {userId: req.body.userId}}} )
            // await user.notifications.updateOne({ $pull: { likes: req.body } })
            res.status(200).json('Removed')
        }
    } catch (err) {
        console.log(err);
        res.status(500).json(err)
    }
})

//Follow notification
router.post('/notification/follow/:userId', async (req, res) => {
    try {
        const user = await User.findById(req.params.userId)
        console.log(!user.followers.some(id=> id === req.body.userId));
        if (user.followers.some(id=> id === req.body.userId)) {
            console.log('following');
            await user.update({ $push: {"notifications.newFollows": req.body}} )
            res.status(200).json('Added')
        } else {
            await user.update({ $pull: {"notifications.newFollows": {userId: req.body.userId}}} )
            // await user.notifications.updateOne({ $pull: { likes: req.body } })
            res.status(200).json('Removed')
        }
    } catch (err) {
        console.log(err);
        res.status(500).json(err)
    }
})

//Clear notifications
router.delete('/notification/:userId/:type', async (req, res) => {
    try {
        const user = await User.findById(req.params.userId)
            // const path = `notifications.${req.params.type}`
            // user.replaceOne({_id: req.params.userId}, {[path]: []})
            user.notifications[req.params.type] = []
            await user.save()
            res.status(200).json('Removed')
    } catch (err) {
        console.log(err);
        res.status(500).json(err)
    }
})


module.exports = router