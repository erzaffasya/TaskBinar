// require
const express = require('express');
const app = express();
const path = require('path');
const routes = require('./routes');
require('dotenv').config();
const server = require('http').createServer(app);
const io = require('socket.io')(server);
const port = process.env.PORT || 8889;
const swaggerUI = require('swagger-ui-express');
const swaggerDoc = require('./swagger.json');

// middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.set('views', './views')
app.set('view engine', 'ejs');
app.use('/api/docs', swaggerUI.serve, swaggerUI.setup(swaggerDoc))
app.use('/api', routes);
app.use('/uploads', express.static('uploads')); //serve avatar path from Users database
app.use('/api/chat', express.static('public')); 

app.use((err, req, res, next) => {
  const status = err.status || 500;
  const error = err.error || err.message || 'Internal server error'
  return res.status(status).json({
    status: status,
    message: 'Error',
    error: error 
  })
})

const rooms = {}
const users = {}

// query /api/chat/?role=user for user
// query /api/chat/?role=admin for admin
app.get('/api/chat', async (req, res) => {
    const { role } = req.query
    const { Users } = require('./models')
    const data = {}
    if(role == null) {
        res.status(400).json({
            status: 400,
            message: "Role for query parameter required"
        })
    }
    // if query role=user
    else if(role == 'user') {
        data.role = role
        const adminAccounts = await Users.findAll({ attributes: ['id', 'name'], where: { role: 'admin' } })
        adminAccounts.forEach((v, i) => {
            if(Object.keys(rooms).length == 0) {
                rooms[v.id] = { name: v.name, users: {} }
            } 
            else if(Object.keys(rooms).length > 0) {
                if(Object.keys(rooms)[i] != v.id) {
                    rooms[v.id] = { name: v.name, users: {} }
                }
            }
        })
        const userAccounts = await Users.findAll({ attributes: ['id', 'name'], where: { role: 'user' } })
        userAccounts.forEach((v, i) => {
            if(Object.keys(users).length == 0) {
                users[v.id] = { name: v.name, users: {} }
            } 
            else if(Object.keys(users).length > 0) {
                if(Object.keys(users)[i] != v.id) {
                    users[v.id] = { name: v.name, users: {} }
                }
            }
        })
        const rand = Math.floor(Math.random() * Object.entries(users).length)
        Object.entries(users).forEach((v, i, arr) => {
            data.id = arr[rand][0]
        })
    }
    // if query role=admin
    else if(role == 'admin') {
        data.role = role
    }
    // if query role=null
    else {
        res.status(400).json({
            status: 400,
            message: "Invalid role"
        })
    }
    res.render('inboxroom', { rooms: rooms, role: data.role, userId: data.id })
})

app.get('/api/chat/:room', async (req, res) => {
    const { role, id } = req.query
    const { room } = req.params
    if(rooms[room] == null) {
        res.redirect('/api/chat')
    }

    const { Users } = require('./models')
    let selectedAccount = null
    // if user join room
    if(role == 'user') {
        const account = await Users.findOne({ attributes: ['name'], where: { id: +id } })
        selectedAccount = account.name
    }
    // if admin join room
    else if(role == 'admin') {
        const account = await Users.findOne({ attributes: ['name'], where: {id: +room} })
        selectedAccount = account.name
    }
    else {
        res.status(400).json({
            status: 400,
            message: 'Not found'
        })
    }
    res.render('chatroom', { roomName: room, userName: selectedAccount })
})

// socket
io.on('connection', (socket) => {
    socket.on('userWannaChat', async (room, userId) => {
        // create room on admin side when a user join room
        const { Users } = require('./models')
        const userTarget = await Users.findOne({ attributes: ['id', 'name'], where: {id: userId} })
        const adminAccount = await Users.findOne({ attributes: ['id', 'name'], where: {id: room} })
        io.emit('createInbox', {room: room, adminId: adminAccount.id, adminName: adminAccount.name, userId: userTarget.id, userName: userTarget.name})
    })

    socket.on('newUser', (room, name, role) => {
        // send message if someone join room
        socket.join(room)
        rooms[room].users[socket.id] = `${role}-${name}` 
        io.to(room).emit('userConnected', {name: name, role: role})
    })
  
    socket.on('sendChatMessage', async (room, message, role, senderId, receiverId) => {
        // insert chat messages into db
        const { Chats, Users } = require('./models')
        const sender = await Users.findOne({ attributes: ['name'], where: {id: senderId} })
        const receiver = await Users.findOne({ attributes: ['name'], where: {id: receiverId} })
        const messageData = {
            senderID: senderId,
            receiverID: receiverId,
            sender: sender.name,
            receiver: receiver.name,
            message: message
        }
        await Chats.create(messageData)
        // send message to client
        if(role == 'admin')
            io.to(room).emit('chatMessage', {message: message, name: rooms[room].users[socket.id], role: role})
        else if(role == 'user')
            io.to(room).emit('chatMessage', {message: message, name: rooms[room].users[socket.id]})
    })
  
    socket.on('disconnect', () => {
        getUserRooms(socket).forEach(room => {
            socket.to(room).emit('userDisconnected', rooms[room].users[socket.id])
            delete rooms[room].users[socket.id]
        })
    })
})

function getUserRooms(socket) {
    return Object.entries(rooms).reduce((names, [name, room]) => {
        if(room.users[socket.id] != null) 
            names.push(name)
        return names 
    }, [])
}

// server
server.listen(port, () => {
  console.log(`Port running on localhost:${port}`);
});
