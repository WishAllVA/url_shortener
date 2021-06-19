const express = require('express');
const mongoose = require('mongoose');
const ShortUrl = require('./models/shortUrl');
const dotenv = require('dotenv')
dotenv.config()
const app = express();
const PORT = process.env.PORT;

const dbName = process.env.DB_NAME
const dbUser = process.env.DB_USER
const dbPass = encodeURIComponent(process.env.DB_PASS)
console.log(process.env.DB_NAME)
mongoose.connect(`mongodb+srv://${dbUser}:${dbPass}@cluster0.vyola.mongodb.net/${dbName}?retryWrites=true&w=majority`,
    {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useFindAndModify: false,
        useCreateIndex: true
    })

app.listen(PORT, () => console.log(`Server running on port ${PORT}`))

app.use(express.urlencoded({ extended: false }))

app.set('view engine', 'ejs');

app.get('/', async (req, res, next) => {
    let urls = await ShortUrl.find()
    res.render('index', { urls: urls })
})

app.post('/shortUrl', async (req, res, next) => {
    await ShortUrl.create({
        longUrl: req.body.shortUrl
    })
    res.redirect('/')
})

app.get('/:shortUrl', async (req, res, next) => {
    let url = await ShortUrl.findOne({
        shortUrl: req.params.shortUrl
    })
    url.clicks++
    url.save()
    res.redirect(url.longUrl)
})