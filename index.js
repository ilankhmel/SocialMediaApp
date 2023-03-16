const express = require("express")
const app = express()

const mongoose = require("mongoose")
const dotenv = require("dotenv")
const helmet = require("helmet")
const morgan = require("morgan")
const cors = require('cors')
const userRoute = require('./routes/user')
const authRoute = require('./routes/auth')
const postRoute = require('./routes/post')
const conversationRoute = require('./routes/conversation')
const messageRoute = require('./routes/message')
const { setupSocketAPI } = require("./socket")

const http = require('http').createServer(app)

setupSocketAPI(http)

dotenv.config()

try{
    mongoose.connect(process.env.MONGO_URL, { useNewUrlParser: true, useUnifiedTopology: true },
        () => {
            console.log("Connected to MongoDB");
        });
}catch(err){
    console.log('ERROR');
    console.log(err);
}

//Middleware
app.use(express.json())
app.use(helmet())
app.use(morgan())

if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'public')))
} else {
    const corsOptions = {
        origin: ['http://127.0.0.1:3000', 'http://localhost:3000'],
        credentials: true
    }
    app.use(cors(corsOptions))
}

app.use("/api/user", userRoute)
app.use("/api/auth", authRoute)
app.use("/api/post", postRoute)
app.use("/api/conversation", conversationRoute)
app.use("/api/message", messageRoute)

const port = process.env.PORT || 8800




http.listen(port, () => {
    console.log(`Backend server is running at port ${port}`);
})
