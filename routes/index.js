
var fs = require('fs')
  , path = require('path')
  , async = require('async')
  , request = require('request')
  , player = require('../player')
  , CONFIG = require('../config')
  , Twitter = require('ntwitter');

exports.index = function(req, res, next){
  res.redirect('/show/');
};

exports.show = function(req, res, next){
  var showPath = req.params[0];
  var fullPath = path.join(CONFIG.mediaPath, showPath);

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
  var twitter = new Twitter(CONFIG.twitter);
  var results = [];

  twitter.getHomeTimeline({ count: 200, include_entities: true }, function(err, data){
    if (err) return next(err);

    for (var i = 0; i < data.length; i++) {
      var status = data[i];
      if (status.entities.urls.length) {
        var url = status.entities.urls[0].expanded_url;
        var id = getYoutubeId(url);
        if (id) results.push({ status: status, video: { id: id } });
      }
    }

    async.map(results, getResultWithVideo, function(err, results){
      if (err) return next(err);
      res.render('feed', { results: results });
    });
  });
}

var YOUTUBE_RE = /^https?:\/\/(?:www\.)?youtube\.com\/watch\?v=([\w-]+)/;
var YOUTUBE_RE_SHORT = /^https?:\/\/youtu\.be\/([\w-]+)/;

function getResultWithVideo(result, callback) {
  getYoutubeData(result.video.id, function(err, object){
    result.video = object;
    callback(err, result);
  });
}

function getYoutubeId(url) {
  var m = url.match(YOUTUBE_RE) || url.match(YOUTUBE_RE_SHORT);
  if (m) return m[1];
}

function getYoutubeData(id, callback) {
  var url = 'http://gdata.youtube.com/feeds/api/videos/' + id + '?v=2&alt=json';
  request(url, function(err, res, body){
    try {
      var object = JSON.parse(body);
      callback(err, object);
    } catch (e) {
      console.log(e, "while parsing", url);
      callback(err);
    }
  });
}

