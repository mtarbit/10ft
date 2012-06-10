var CONFIG = require(appRoot + '/config')
  , request = require('request');

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

  refreshTweets();
};


var YOUTUBE_RE = /^https?:\/\/(?:www\.)?youtube\.com\/watch\?v=([\w-]+)/
  , YOUTUBE_RE_SHORT = /^https?:\/\/youtu\.be\/([\w-]+)/;

function refreshTweets() {
  var Video = require(appRoot + '/models/video')
    , Tweet = require(appRoot + '/models/tweet')
    , Twitter = require('ntwitter')
    , twitter = new Twitter(CONFIG.twitter);

  twitter.getHomeTimeline({ count: 200, include_entities: true }, function(err, results){

    results.forEach(function(result){
      var user = result.user
        , urls = result.entities.urls
        , text = result.text;

      if (urls.length) {
        var id = getYoutubeId(urls[0].expanded_url);
        if (id) {
          console.log(id);

          urls.forEach(function(url){
              text = text.replace(url.url, '<a href="' + url.expanded_url + '">' + url.display_url + '</a>');
          });

          var tweet = new Tweet({
              id: result.id
            , user: user.screen_name
            , icon: user.profile_image_url
            , text: result.text
            , date: result.created_at
          });

          tweet.save();

          getYoutubeData(id, function(err, result){
              if (err) return;

              var group = result.entry.media$group;
              var video = new Video({
                  id: id
                , thumb: group.media$thumbnail[0].url
                , title: group.media$title.$t
                , description: group.media$description.$t
              });

              video.save();
              tweet.video = video._id;
              tweet.save();
          });

        }
      }
      
    });
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
