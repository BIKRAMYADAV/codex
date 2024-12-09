const express = require('express')
const dotenv = require('dotenv')
const fs = require('fs')
const cors = require('cors')
const { exec } = require('child_process')
const { stdout, stderr } = require('process')
dotenv.config()
const http = require('http')
const {Server} = require('socket.io')
const apiUrl = "http://localhost:3000"
const PORT = process.env.PORT

const app = express()

const server = http.createServer(app);

const io = new Server(server, {
    cors : {
        origin : "http://localhost:5173",
        methods: ["GET", "POST"]
    }
})


io.on('connection', (socket) => {
    console.log("A user connected");

    socket.on('code-update', (code) => {
        socket.broadcast.emit('code-update', code);
    })

    socket.on('disconnect', () => {
        console.log('User disconnected');
    })
})

app.use(express.json());

app.post('/execute', (req, res) => {
    const {code, language} = req.body;
    const filepath = `temp.${language}`;
    fs.writeFileSync(filepath,code);

    const command = 
    language === "python"? `python3 ${filepath}` : language === "javascript" ? `node ${filepath}`: null;

    if (command) {
        exec(command, (error,stdout,stderr) => {
            if (error) {
                res.json({output : stderr});
            } else {
                res.json({ output : stdout});
            }
        })
    }
    else {
        res.status(400).send("unsupported language");
    }
})


server.listen(PORT, ()=> {
    console.log(`The server is listening on port ${PORT}`);
})

