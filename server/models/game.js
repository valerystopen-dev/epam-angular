const mongoose = require('mongoose')

const Schema = mongoose.Schema
const gameSchema = new Schema({
    name: {type: String},
    description: {type: String},
    tag: {type: String},
    price: {type: Number}
})

module.exports = mongoose.model('game', gameSchema, 'games')
