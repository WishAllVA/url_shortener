const LocalStrategy = require('passport-local').Strategy
const brcypt = require('bcryptjs')

const User = require('../models/User')

module.exports = (passport) => {
    passport.use(
        new LocalStrategy({ usernameField: 'email' }, async (email, password, done) => {
            // Match User
            const user = await User.findOne({ $or: [{ email: email }, { username: email }] })
            if (!user) return done(null, false, { message: 'User does not exist' })

            // Match password
            const isMatch = await brcypt.compare(password, user.password)
            if (typeof isMatch === 'undefined') throw new Error('Could not authenticate user')
            if (!isMatch) return done(null, false, { message: 'Password incorrect' })
            return done(null, user)
        })
    )
    passport.serializeUser((user, done) => {
        done(null, user.id)
    })

    passport.deserializeUser((id, done) => {
        User.findById(id, (err, user) => {
            done(err, user)
        })
    })
}
