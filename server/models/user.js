const mongoose = require('mongoose')

const Schema = mongoose.Schema
const userSchema = new Schema({
    email: {type: String, required: true, unique: true},
    password: {type: String, required: true},
    username: {type: String, required: false},
    age: {type: Number, required: false},
    games: {type: [""], required: false},
    friends: {type: [""], required: false}
})

module.exports = mongoose.model('user', userSchema, 'users')
