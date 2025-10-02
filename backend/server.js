const express = require('express')
const dotenv = require('dotenv')
const fs = require('fs')
const cors = require('cors')
const { exec } = require('child_process')
const { stdout, stderr } = require('process')
dotenv.config()
const http = require('http')
const {Server} = require('socket.io')
const { default: axios } = require('axios')
// const apiUrl = "http://localhost:3000"
const judgeapiUrl =  "https://judge0-ce.p.rapidapi.com/submissions?base64_encoded=false&wait=true"
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


app.post('/execute', async (req, res) => {
    const {code, language} = req.body;
    //to judge 0 language id
    const langMap = {
        "cpp" : 54,
        "python" : 71,
        "javascript" : 63,
        "java" : 62
    }
    const langId = langMap[language];
    if(!langId){
        return res.status(400).json({
            error : "unsupported language"
        });
    }
    try {
        const response = await axios.post(judgeapiUrl, {
            source_code : code,
            language_id: langId
        },{
         headers: {
                    "Content-Type": "application/json",
                    "X-RapidAPI-Host": "judge0-ce.p.rapidapi.com",
                    "X-RapidAPI-Key": process.env.JUDGE0_API_KEY  // keep key in .env
                }  
        });
        res.json({
            output : response.data.stdout || response.data.stderr || "no output"
        });
    } catch (error){
        console.error('execution error', error.message);
        res.status(500).json({
            error : "code execution failed"
        })
    }
    // const {code, language} = req.body;
    // console.log('The code recieved was: ',code);
    // const filepath = `temp.${language}`;
    // fs.writeFileSync(filepath,code);
    // const isWindows = process.platform === 'win32';

    // const command = 
    // language === "python"? `python3 ${filepath}` : language === "javascript" ? `node ${filepath}`: language === "cpp" ? `g++ ${filepath} -o temp && ${isWindows ? 'temp.exe' : './temp'}` : null;
    // console.log("command id",command);
    // if (command) {
    //     exec(command, (error,stdout,stderr) => {
    //         if (error) {
    //             console.log('there was an error')
    //             res.json({output : stderr});
    //         } else {
    //             console.log('here is the output:',stdout);
    //             res.json({ output : stdout});
    //         }
    //     })
    // }
    // else {
    //     res.status(400).send("unsupported language");
    // }
})


server.listen(PORT, ()=> {
    console.log(`The server is listening on port ${PORT}`);
})

