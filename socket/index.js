
const baseUrl = process.env.NODE_ENV === 'production' ? '' : 'http://localhost:3000'
const port = process.env.PORT || 8800


let users = []

const addUser = (userId, socketId) => {
    if(!users.some(user => user.userId === userId)){
        users.push({userId, socketId})
    }
}
const removeUser = (socketId) => {
    users = users.filter((user)=>user.socketId !== socketId)
}

const getUser = (userId) => {
    // console.log(users);
    const user= users.find(user => {
        console.log(user);
        console.log(userId);
        return user.userId === userId})
    return user
}

var io = null

function setupSocketAPI(http) {
    
    io = require("socket.io")(http, {
        cors: { 
            origin: '*'
        }
    })
    
    
    io.on("connection", (socket) => {
        //Connecting
        console.log('User Connected');
        //Take user and socket Id's from user
        socket.on('addUser', userId=>{
            addUser(userId, socket.id)
            io.emit('getUsers', users)
        })
    
        //Send and get message
        socket.on("sendMessage", ({senderId, receiverId, text})=>{
            console.log(receiverId);
            const user = getUser(receiverId)
            console.log('io.to(' + user?.socketId + ')');
            io.to(user?.socketId).emit("getMessage", {
                senderId,
                text 
            })
        }) 
    
        //Post like
        socket.on("like", ({likerId, likedId,postId, timeStamp})=>{
            const user = getUser(likedId)
            console.log('socket emitting like');
            io.to(user?.socketId).emit("likeNotification", {
                userId: likerId,
                postId,
                timeStamp
            })
        }) 
        //Post like
        socket.on("message", ({senderId, receiverId, text})=>{
            const user = getUser(receiverId)
            console.log('socket emitting message not');
            io.to(user?.socketId).emit("messageNotification", {
                userId: senderId,
                text
            })
        }) 
    
        //New follow
        socket.on("follow", ({followerId, followedId, timeStamp})=>{
            const user = getUser(followedId)
            io.to(user?.socketId).emit("followNotification", {
                userId: followerId,
                timeStamp
            })
        }) 
    
        
        //When disconnecting  
        socket.on('disconnect', ()=>{
            console.log('A user disconnected!');
            removeUser(socket.id)
            io.emit('getUsers', users)
        })
    })
}

module.exports = {
    setupSocketAPI,
} 