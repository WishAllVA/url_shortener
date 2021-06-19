const express = require('express')
const mongoose = require('mongoose')
const ShortUrl = require('./models/shortUrl')
var favicon = require('serve-favicon')
const path = require('path')
const dotenv = require('dotenv')
dotenv.config()
const app = express();
const PORT = process.env.PORT

const dbName = process.env.DB_NAME
const dbUser = process.env.DB_USER
const dbPass = encodeURIComponent(process.env.DB_PASS)

var colorScheme = 'light'
mongoose.connect(`mongodb+srv://${dbUser}:${dbPass}@cluster0.vyola.mongodb.net/${dbName}?retryWrites=true&w=majority`,
    {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useFindAndModify: false,
        useCreateIndex: true
    })

app.listen(PORT, () => console.log(`Server running on port ${PORT}`))

app.use(express.urlencoded({ extended: false }))

app.use(express.static(__dirname + '/public'));

app.use(favicon(__dirname + '/public/images/favicon.ico'))

app.set('view engine', 'ejs');

app.get('/', async (req, res, next) => {
    const { theme } = req.query
    colorScheme = theme || 'light'
    let urls = await ShortUrl.find()
    res.render('index', { urls: urls, theme: colorScheme || 'light', message: [] })
})

app.post('/shortUrl', async (req, res, next) => {
    let { shortUrl } = req.body
    if (!shortUrl) {
        let message = ['URL is required']
        let urls = await ShortUrl.find()
        res.render('index', { urls: urls, theme: colorScheme || 'light', message: message || [] })
        return
    }
    else {
        await ShortUrl.create({
            longUrl: shortUrl
        })
    }
    res.redirect(`/?theme=${colorScheme}`)
})

app.post('/deleteUrl', async (req, res, next) => {
    await ShortUrl.findByIdAndDelete(req.query.id)
    res.redirect(`/?theme=${colorScheme}`)
})

app.get('/:shortUrl', async (req, res, next) => {
    let url = await ShortUrl.findOne({
        shortUrl: req.params.shortUrl
    })
    url.clicks++
    url.save()
    res.redirect(url.longUrl)
})