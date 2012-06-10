global.appRoot = __dirname;

var express = require('express')
  , routes = require(appRoot + '/routes')
  , app = express.createServer();

// Configuration

app.configure(function(){
  app.set('views', appRoot + '/views');
  app.set('view engine', 'ejs');
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(appRoot + '/public'));
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function(){
  app.use(express.errorHandler());
});


// Routes

app.get('/', routes.index);
app.get('/show/*', routes.show);
app.get('/feed/', routes.feed);

app.listen(3000, function(){
  console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
});


module.exports = app;

