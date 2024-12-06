const express = require('express')
const dotenv = require('dotenv')
const fs = require('fs')
const { exec } = require('child_process')
const { stdout, stderr } = require('process')
dotenv.config()
const app = express()

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

const PORT = process.env.PORT

app.listen(PORT, ()=> {
    console.log(`The server is listening on port ${PORT}`);
})

module.exports = app;