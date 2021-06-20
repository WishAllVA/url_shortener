const express = require('express')
const router = express.Router()
const User = require('../models/User')
const bcrypt = require('bcryptjs')
const passport = require('passport')

// Login UI
router.get('/login', (req, res) => {
    res.render('login')
})

// Handle Login
router.post('/login', (req, res, next) => {
    passport.authenticate('local', {
        successRedirect: '/dashboard',
        failureRedirect: '/users/login',
        failureFlash: true
    })(req, res, next)
})

// Register UI
router.get('/register', (req, res) => {
    res.render('register')
})

// Register handle
router.post('/register', async (req, res) => {
    const { username, email, password, password2 } = req.body
    const errors = []
    if (!username || !email || !password || !password2) {
        const msg = 'Please fill all the necessary fields'
        errors.push({ msg })
    }
    if (password.length < 6) {
        const msg = 'Password should be atleast 6 characters'
        errors.push({ msg })
    }
    if (password !== password2) {
        const msg = 'Passwords should match'
        errors.push({ msg })
    }
    if (errors.length > 0)
        res.render('register', {
            errors,
            username,
            email,
            password,
            password2
        })
    else {
        // Front end Validations passed
        // Check duplicate username and email
        const checkDuplicateUser = await User.findOne({ username: username, email: email })
        if (checkDuplicateUser) {
            let msg = ''
            if (username === checkDuplicateUser.username)
                msg = 'Username already taken'
            else msg = 'Email already taken'
            errors.push({ msg })
            res.render('register', {
                errors,
                username,
                email,
                password,
                password2
            })
        } else {
            // Hash the password and then save the user
            const newUser = new User({
                username,
                email,
                password
            })
            const salt = await bcrypt.genSalt(10)
            if (!salt) throw new Error('Salt Error')
            const hash = await bcrypt.hash(newUser.password, salt)
            if (!hash) throw new Error('Hash Error')
            newUser.password = hash
            const user = await newUser.save()
            if (user) {
                req.flash('success_msg', 'You are successfully registered. Login to continue')
                res.redirect('/users/login')
            } else throw new Error('Could not create user')
        }
    }
})

router.get('/logout', (req, res) => {
    req.logOut()
    req.flash('success_msg', 'You have been successfully logged out')
    res.redirect('/users/login')
})

module.exports = router
