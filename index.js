const path = require('path')
const express = require('express')
const mongoose = require('mongoose')
const dotenv = require('dotenv')
const morgan = require('morgan')
const exphbs = require('express-handlebars')
const passport = require('passport')
const methodOverride = require('method-override')
const session = require('express-session')
const MongoStore = require('connect-mongo')
const connDB = require('./config/db')

dotenv.config({path : './config/config.env'})

//passport config
require('./config/passport')(passport)

connDB()

const PORT = process.env.PORT || 5000

const app = express()

//set port
app.set('port', PORT)

//Body parser
app.use(express.urlencoded({extended: false}))
app.use(express.json())


//method Override
app.use(
    methodOverride(function (req, res) {
      if (req.body && typeof req.body === 'object' && '_method' in req.body) {
        // look in urlencoded POST bodies and delete it
        let method = req.body._method
        delete req.body._method
        return method
      }
    })
  )


if(process.env.NODE_ENVIRONMENT === 'development'){
    app.use(morgan('dev'))
}




//Handlebars helper
const {formatDate, 
    stripTags,
    truncate, 
    editIcon, 
    select} = require('./helpers/hbs')

//handlebars
app.engine('.hbs', exphbs({ helpers: {
    formatDate,
    stripTags,
    truncate,
    editIcon,
    select
} ,defaultLayout: 'main', extname: '.hbs'}));
app.set('view engine', '.hbs');

//express-session middleware
app.use(session({
    secret : 'ankitdwivedi',
    resave: false,
    saveUninitialized: false,
    store : MongoStore.create({mongoUrl : process.env.MONGO_URI})
}))


//passport middleware
app.use(passport.initialize())
app.use(passport.session())


//set global variable
app.use(function(req, res, next){
    res.locals.user = req.user || null
    next()
})


//static folder
app.use(express.static(path.join(__dirname, 'public')))


//routes:
app.use('/', require('./routes/index'))
app.use('/auth', require('./routes/auth'))
app.use('/stories', require('./routes/stories'))



app.listen(PORT, ()=>{
    console.log(`environment mode : ` + process.env.NODE_ENVIRONMENT +`, port :  ` + PORT)
})