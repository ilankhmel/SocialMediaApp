const router = require("express").Router()
const Message = require("../models/Message")

//Add message

router.post('/', async (req, res)=>{
    const newMessage = new Message(req.body)
    console.log(newMessage);
    try {
        const savedMessage = await newMessage.save()
        res.status(200).json(savedMessage)
    } catch (err) {
        res.status(500).json(err)
    }
})

//Get conversations's messages

router.get('/:conversationId', async (req, res)=>{
    try {
        const messages = await Message.find({
            conversationId: req.params.conversationId
        })
        res.status(200).json(messages)
    } catch (err) {
        res.status(500).json(err)
    }
})

module.exports = router