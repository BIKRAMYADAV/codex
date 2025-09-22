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
app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
     cors: {
    origin: "*", 
    methods: ["GET", "POST"]
  }
})

io.on('connection', (socket) => {
    // console.log("A user connected");

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
    console.log('The code recieved was: ',code);
    const filepath = `temp.${language}`;
    fs.writeFileSync(filepath,code);
    const isWindows = process.platform === 'win32';

    const command = 
    language === "python"? `python3 ${filepath}` : language === "javascript" ? `node ${filepath}`: language === "cpp" ? `g++ ${filepath} -o temp && ${isWindows ? 'temp.exe' : './temp'}` : null;
    console.log("command id",command);
    if (command) {
        exec(command, (error,stdout,stderr) => {
            if (error) {
                console.log('there was an error')
                res.json({output : stderr});
            } else {
                console.log('here is the output:',stdout);
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

