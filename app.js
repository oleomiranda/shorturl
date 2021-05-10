const express = require("express")
const app = express()
const flash = require("connect-flash")
const session = require("express-session")
const handlebars = require("express-handlebars")
const mongoose = require('mongoose')
mongoose.connect("mongodb://localhost/shortUrl", ({useNewUrlParser: true, useUnifiedTopology: true}))
const urlschema = require("./models/urls")

app.use(session({
    secret: 'nosecret',
    resave: true,
    saveUninitialized: true
}))
app.use(flash())
app.use((req, res, next) => {
    res.locals.error = req.flash('error')
    next()
})


app.set("view engine", "handlebars")
app.engine("handlebars", handlebars())
app.use(express.json())
app.use(express.urlencoded({extended: false}))


app.get("/", (req, res) => {

    urlschema.find().lean().then((urls) => {
        res.render("index", {urls: urls}) 
    })

})

app.post("/create", async (req, res) => {

    var pattern = /(javascript.*(:)).*/gi
    var fullurl = req.body.fullUrl

    if(fullurl.match(pattern)){ //IF PARA PREVINIR XSS 
        req.flash("error", "Houve um erro")
        res.redirect("/")
    }else{
        await urlschema.create({ full: req.body.fullUrl })
        res.redirect("/")
    }

})


app.get("/follow/:shortUrl", async (req, res) => {

    const url = await urlschema.findOne({short: req.params.shortUrl})
    
    if(url == null ){
         req.flash("error", "Houve um erro")
         res.redirect("/")
    }else{
        url.click++
        url.save()
        res.redirect(url.full)
    }
})


app.listen(8081, console.log('RODANDOO...'))
