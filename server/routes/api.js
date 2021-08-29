const express = require('express')
const jwt = require('jsonwebtoken')
const router = express.Router()
const User = require('../models/user')
const Game = require('../models/game')

const mongoose = require('mongoose')
const db = "mongodb+srv://Valeriia:V.nduY8W$izHn.u@cluster0.jycq5.mongodb.net/myFirstDatabase?retryWrites=true&w=majority"

mongoose.connect(db, err =>{
    if(err){
        console.error('Error!'+err)
    }else{
        console.log('connected to mongodb')
    }
})

function verifyToken(req, res, next){
    if(!req.headers.authorization){
        return  res.status(401).send('Unauthorized request')
    }
    let token = req.headers.authorization.split(' ')[1]
    if(token === 'null'){
        return  res.status(401).send('Unauthorized request')
    }
    let payload = jwt.verify(token, 'secretKey')
    if(!payload){
        return  res.status(401).send('Unauthorized request')
    }
    req.userId = payload.subject
    next()
}

router.get('/', (req, res)=>{
    res.send('from API route')
})
router.post('/user', (req, res)=>{
    const userData = req.body
    const user = new User(userData)
    user.save((error, registeredUser)=>{
        if(error){
            res.status(500).send(error)
        }else{
            res.status(200).send(registeredUser)
        }
    })
})

router.post('/login', (req, res)=>{
    let userData  = req.body

    User.findOne({email: userData.email}, (error, user)=>{
        if(error){
            res.status(500).send(error)
        }else{
            if(!user){
                res.status(400).send("Invalid email")
            }
            else{
                if(user.password === userData.password){
                    let payload = {subject: user._id}
                    let token = jwt.sign(payload, "secretKey")
                    res.status(200).send({token})
                }
                else{
                    res.status(400).send("Invalid password")
                }
            }
        }
    })
})

router.get('/user', async(req, res)=>{
    let token = req.headers.authorization.split(' ')[1]
    let payload = jwt.verify(token, 'secretKey')
    let user = await User.findOne({_id:payload.subject})
    res.send(user);
})

router.post('/upd_user', async (req, res)=>{
    let userData  = req.body
    let token = req.headers.authorization.split(' ')[1]
    let payload = jwt.verify(token, 'secretKey')
    let user = await User.findOne({_id:payload.subject})
    if(userData.age){
        user.age = userData.age;
    }
    if(userData.username) {
        user.username = userData.username;
    }
    user.save();
    res.send(user)
})

router.get('/games',verifyToken,async (req, res)=>{
    let token = req.headers.authorization.split(' ')[1]
    let payload = jwt.verify(token, 'secretKey')
    let user = await User.findOne({_id:payload.subject})
    let arr = []
    Game.find({}, function (err, games) {
        for(let i=0; i<games.length; i++){
            let add = true
            for(let j = 0; j<user.games.length; j++){
                if(JSON.stringify(games[i]._id).includes(user.games[j])){
                    add = false
                }
            }
            if(add){
                arr.push(games[i])
            }
        }
        res.send(arr)
    });
})
router.post('/games', (req, res)=>{
    const gameData = req.body
    const game = new Game(gameData)
    game.save((error, newGame)=>{
        if(error){
            res.status(500).send(error)
        }else{
            res.status(200).send(newGame)
        }
    })
})

router.get('/library',async(req, res)=>{
    let token = req.headers.authorization.split(' ')[1]
    let payload = jwt.verify(token, 'secretKey')
    let user = await User.findOne({_id:payload.subject})
    let arr = []
    for(let i =0; i<user.games.length; i++){
        let g = await Game.findOne({_id:user.games[i]})
        arr.push(g)
    }
    res.send(arr)
})
router.post('/library', async(req, res)=>{
    console.log(req.body)
    const gameData = req.body._id;
    let token = req.headers.authorization.split(' ')[1]
    let payload = jwt.verify(token, 'secretKey')
    let user = await User.findOne({_id:payload.subject})
    user.games.push(gameData)
    await user.save();
    res.send(user);
})

router.get('/friends',async(req, res)=>{
    let token = req.headers.authorization.split(' ')[1]
    let payload = jwt.verify(token, 'secretKey')
    let user = await User.findOne({_id:payload.subject})
    let arr = []
    for(let i =0; i<user.friends.length; i++){
        let g = await User.findOne({_id:user.friends[i]})
        arr.push(g)
    }
    res.send(arr)
})
router.get('/users',async(req, res)=> {
    let token = req.headers.authorization.split(' ')[1]
    let payload = jwt.verify(token, 'secretKey')
    let user = await User.findOne({_id: payload.subject})
    let arr = []
    User.find({}, function (err, users) {
        for (let i = 0; i < users.length; i++) {
            let add = true
            for (let j = 0; j < user.friends.length; j++) {
                if (JSON.stringify(users[i]._id).includes(user.friends[j])) {
                    add = false
                }
            }
            if (add) {
                arr.push(users[i])
            }
        }
        res.send(arr)
    })
})
router.post('/friends', async(req, res)=>{
    const userData = req.body._id;
    let token = req.headers.authorization.split(' ')[1]
    let payload = jwt.verify(token, 'secretKey')
    let user = await User.findOne({_id:payload.subject})
    user.friends.push(userData)
    await user.save();
    res.send(user);
})
router.post('/users', async (req, res)=>{
    const userData = req.body._id;
    console.log(userData)
    let token = req.headers.authorization.split(' ')[1]
    let payload = jwt.verify(token, 'secretKey')
    let user = await User.findOne({_id:payload.subject})
    let arr = []
    for(let i = 0; i<user.friends.length; i++){
        if(user.friends[i] !== userData){
            arr.push(user.friends[i])
        }
    }
    console.log(arr)
    user.friends = arr;
    await user.save();
})


module.exports = router
