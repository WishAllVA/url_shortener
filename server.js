const express = require('express')
const expressLayouts = require('express-ejs-layouts')
const mongoose = require('mongoose')
const passport = require('passport')
const ShortUrl = require('./models/shortUrl')
var favicon = require('serve-favicon')
const session = require('express-session')
const flash = require('connect-flash')
const path = require('path')
const { ensureAuthenticated } = require('./config/auth')
const dotenv = require('dotenv')
dotenv.config()
const app = express();
require('./config/passport')(passport)

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

// Body parser
app.use(express.urlencoded({ extended: false }))

// Express session
app.use(session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true
}))

// Passport middleware
app.use(passport.initialize())
app.use(passport.session())

// Connect flash
app.use(flash())

// Global vars
app.use((req, res, next) => {
    res.locals.success_msg = req.flash('success_msg')
    res.locals.error_msg = req.flash('error_msg')
    res.locals.error = req.flash('error')
    next()
})

app.use(express.static(__dirname + '/public'));

app.use(favicon(__dirname + '/public/images/favicon.ico'))

// EJS
app.use(expressLayouts)
app.set('view engine', 'ejs');

// Routes
app.use('/users', require('./routes/users'))

app.get('/', async (req, res, next) => {
    res.render('welcome')
})

app.get('/dashboard', ensureAuthenticated, async (req, res, next) => {
    const { theme } = req.query
    colorScheme = theme || 'light'
    let urls = await ShortUrl.find()
    res.render('index', { urls: urls, theme: colorScheme || 'light', username: req.user.username, message: [] })
    // res.render('dashboard', { username: req.user.username })
})

app.post('/shortUrl', ensureAuthenticated, async (req, res, next) => {
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

app.post('/deleteUrl', ensureAuthenticated, async (req, res, next) => {
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