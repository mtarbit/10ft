var CONFIG = require(appRoot + '/config')
  , Feed = require(appRoot + '/lib/feed');

exports.index = function(req, res, next){
  res.redirect('/show/');
};

exports.show = function(req, res, next){
  var fs = require('fs')
    , path = require('path')
    , player = require(appRoot + '/lib/player')
    , showPath = req.params[0]
    , fullPath = path.join(CONFIG.mediaPath, showPath);

  fs.stat(fullPath, function(err, stats) {
    if (err) return next(err);
    if (stats.isDirectory()) {
      fs.readdir(fullPath, function(err, files){
        if (err) return next(err);
        res.render('index', { filesPath: showPath, files: files, join: path.join });
      });
    } else {
      player.play(fullPath);
      res.redirect('back');
    }
  });
};

exports.feed = function(req, res, next){
  var Tweet = require(appRoot + '/models/Tweet');

  Tweet.find().populate('video').limit(10).run(function(err, results){
    if (err) return next(err);
    res.render('feed', { results: results });
  });

  Feed.refresh();
};

