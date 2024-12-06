const http = require('http')
const {Server} = require('socket.io')
const app = require('./server.js')
const dotenv = require('dotenv')
dotenv.config()
const socketPort = process.env.SOCKETPORT

const server = http.createServer(app);
const io = new Server(server)

io.on('connection', (socket) => {
    console.log("A user connected");

    socket.on('code-update', (code) => {
        socket.broadcast.emit('code-update', code);
    })

    socket.on('disconnect', () => {
        console.log('User disconnected');
    })
})

server.listen(socketPort, () => {
    console.log(`socket server running on port ${socketPort}`);
})