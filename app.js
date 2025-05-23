var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
var cors = require("cors");
require("dotenv").config();
require("./db.js");

var indexRouter = require("./routes/api/v1/index");
var usersRouter = require("./routes/api/v1/users");
var loginRouter = require("./routes/api/v1/login");
var registerRouter = require("./routes/api/v1/register.js");
var productRouter = require("./routes/api/v1/product");
var orderRouter = require("./routes/api/v1/order");

var app = express();

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "jade");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/api/v1", indexRouter);
app.use("/api/v1/users", usersRouter);
app.use("/api/v1/login", loginRouter);
app.use("/api/v1/register", registerRouter);
app.use("/api/v1/products", productRouter);
app.use("/api/v1/orders", orderRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
