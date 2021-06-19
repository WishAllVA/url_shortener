const mongoose = require('mongoose')
const { nanoid } = require('nanoid')

const shortUrlSchema = new mongoose.Schema({
    longUrl: {
        type: String,
        required: true
    },
    shortUrl: {
        type: String,
        default: nanoid,
        required: true
    },
    clicks: {
        type: Number,
        default: 0
    }
})

module.exports = mongoose.model('shortUrl', shortUrlSchema)