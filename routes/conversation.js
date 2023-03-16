const router = require("express").Router()
const Conversation = require("../models/Conversation")

//New conversation

router.post('/', async (req,res)=>{
    const newConversation = new Conversation({
        members:[req.body[0], req.body[1]]
    })
    try {
        const savedConversation = await newConversation.save()
        res.status(200).json(savedConversation)
    } catch (err) {
        res.status(500).json(err)
    }
})

//Get user conversations

router.get('/:userId', async (req, res) => {
    try{
        const userConversations = await Conversation.find({
            members: {$in: [req.params.userId]}
        })
        res.status(200).json(userConversations)
    }catch(err){
        res.status(500).json(err)
    }
})

//Find conversation by user id's

router.get('/find/:firstUserId/:secondUserId', async (req, res)=>{
    try {
        const conversation = await Conversation.findOne({
            members: {$all : [req.params.firstUserId, req.params.secondUserId]}
        })
        res.status(200).json(conversation)

    } catch (err) {
        res.status(500).json(err)
    }
})

module.exports = router