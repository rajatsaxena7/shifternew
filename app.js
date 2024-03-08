require('dotenv').config();
const express = require('express')
const app = express()
const port = process.env.PORT || 3000
const bodyParser = require('body-parser')
const ejs = require('ejs')
const path = require("path")
const flash = require('connect-flash');
const session = require('express-session')
const {connection} = require('./middleware/db')
const cookieParser = require('cookie-parser')



app.set('trust proxy', 1);
app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true,
    cookie: {maxAge: 1000 * 60 }
}));

app.use((req, res, next) => {
  connection.query("SELECT data FROM tbl_shift", (err, results) => {
    if (err) {
      console.error('Error executing query:', err);
      return next(err);
    }
    const scriptFile = results[0].data; // Get the script file data

    // Set the scriptFile variable in res.locals
    res.locals.scriptFile = scriptFile;
    next();
  });
});

app.use(flash());

app.set('view engine', 'ejs');
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.use(express.json());
app.use(cookieParser());


app.use(function (req, res, next) {
    res.locals.success = req.flash("success");
    res.locals.errors = req.flash("errors");
    next();
});


app.use("/", require("./router/log_in"))
app.use("/", require("./router/index"))
app.use("/user", require("./router/user"))
app.use("/allcategory", require("./router/category"))
app.use("/product", require("./router/product"))
app.use("/location", require("./router/location"))
app.use("/settings", require("./router/settings"))
// app.use("/packers_and_movers2", require("./router/packers_and_movers2"))
app.use("/packers_and_movers", require("./router/packers_and_movers"))
app.use("/courier_delivery", require("./router/courier_delivery"))
app.use("/coupon", require("./router/coupon"))
app.use("/transaction", require("./router/transaction"))
app.use("/order", require("./router/order"))
app.use("/payout", require("./router/payout"))
app.use("/report", require("./router/report"))
app.use("/role", require("./router/role_permission"))



app.listen(port, () => {
    console.log(`server running on port ${port}`);
})