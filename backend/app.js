var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var loginRouter = require('./routes/login');
var registerRouter = require('./routes/register');
var sp_lie_biaoRouter=require("./routes/shang_pin_liebiao")
var lb_lie_biaoRouter=require("./routes/lei_bie_liebiao")
var wjmmRouter=require("./routes/wjmm")
var tui_chuRouter=require("./routes/tui_chu")
var grzx_Router=require("./routes/grzx")
var ding_dan_Router=require("./routes/ding_dan")
var ke_hu_Router=require("./routes/ke_hu")
var hu_dong_Router=require("./routes/hu_dong")
var gou_wu_che_Router=require("./routes/cart")
var address_Router=require("./routes/address")

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/login', loginRouter);
app.use('/register', registerRouter);
app.use('/sp_lie_biao',sp_lie_biaoRouter);
app.use('/lb_lie_biao',lb_lie_biaoRouter)
app.use('/wjmm',wjmmRouter)
app.use('/logout',tui_chuRouter)
app.use('/grzx',grzx_Router)
app.use('/ding_dan',ding_dan_Router)
app.use('/ke_hu',ke_hu_Router)
app.use('/hu_dong',hu_dong_Router)
app.use('/cart',gou_wu_che_Router)
app.use('/address',address_Router)

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
