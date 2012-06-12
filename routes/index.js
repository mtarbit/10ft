
exports.index = function(req, res, next){
  res.redirect('/show/');
};

exports.show = function(req, res, next){
  var fs = require('fs')
    , path = require('path')
    , player = require(appRoot + '/lib/player')
    , CONFIG = require(appRoot + '/config')
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
  var Tweet = require(appRoot + '/models/Tweet')
    , feed = require(appRoot + '/lib/feed');

  Tweet.find().populate('video').desc('id').limit(10).run(function(err, results){
    if (err) return next(err);
    res.render('feed', { results: results });
  });

  feed.refresh();
};

