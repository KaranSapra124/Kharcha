const express = require("express");
const BodyParser = require("body-parser");
const ejs = require("ejs");
const app = express();
const path = require('path');
// const bodyParser = require("body-parser");
const mime = require('mime');
const cors = require('cors')
const mongoose = require("mongoose")
const md5 = require("md5")
const Notifier = require('node-notifier')

var email = ""
var BudgetVal = ''

mongoose.set("strictQuery", true)


mongoose.connect("mongodb+srv://Kharcha:Iamphenomenol1@cluster0.u9alo9z.mongodb.net/?retryWrites=true&w=majority")

app.set('view engine', 'ejs')
app.use(BodyParser.urlencoded({ extended: true }))
app.use(express.static(path.join(__dirname, 'public')))
app.use(cors());

const NewUser = new mongoose.Schema({
    Name: { type: String },
    Email: { type: String },
    Password: { type: String },
    PhoneNum: { type: Number }
})


const Exp = new mongoose.Schema({

    Name: { type: String },
    Amount: { type: Number },
    Email: { type: String },
    Budget: { type: String }

})

const NewExp = mongoose.model("NewExp", Exp)
const User = mongoose.model("User", NewUser)

app.post("/Signup", (req, res) => {
    const user = new User({
        Name: req.body.Name,
        Email: req.body.Email,
        Password: md5(md5(req.body.pass)),
        PhoneNum: req.body.PhoneNum
    })

    user.save();
    res.redirect('/Login')
})

app.get('/Login', (req, res) => {
    res.render('Login')
})
app.post('/Login', (req, res) => {
    email = req.body.Email
    User.find({ Email: req.body.Email })
        .then((docs) => {
            // console.log("Found");
            // console.log(docs);
            if (docs[0].Password === md5(md5(req.body.pass))) {
                console.log(docs);
                Notifier.notify("Login Success")
                res.redirect('/Budget')
            }
            else {
                // console.log("Nothing Found");
                Notifier.notify("Wrong Password or email");
                return res.redirect('/Login')
            }
        })
        .catch((err) => {

            Notifier.notify("No Account Found , Please sign up!!!")
            return res.redirect('/Signup')

        })



})
app.get('/Signup', (req, res) => {
    res.render('SignUp')
})
app.get("/", (req, res) => {
    res.render("index")
})
app.get('/Expense', (req, res) => {
    console.log(email);
    console.log(BudgetVal);
    NewExp.find({ Email: email })
        .then((docs) => {
            // console.log(docs);

            res.render("ExpenseTracker", { Exp: docs })
        })
})

app.post('/Expense', (req, res) => {
    const Expense = new NewExp({
        Name: req.body.ExpName,
        Amount: req.body.ExpAmt,
        Email: email,
        Budget: BudgetVal
    })
    NewExp.find({})
        .then(() => {
            Expense.save()
            console.log("Posted");
           res.redirect('/Expense')
        })
        .catch((err) => {
            console.log(err);
        })
})
app.get('/Budget', (req, res) => {
    res.render('Budget')
})
app.post('/Budget', (req, res) => {
    BudgetVal = req.body.budget
    res.redirect('/Expense')
})

app.listen(3000, () => { console.log("Running"); })