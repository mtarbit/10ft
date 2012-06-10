var request = require('request')
  , Twitter = require('ntwitter')
  , Video = require(appRoot + '/models/video')
  , Tweet = require(appRoot + '/models/tweet')
  , CONFIG = require(appRoot + '/config');

var feed = module.exports = {};

feed.YOUTUBE_RE = /^https?:\/\/(?:www\.)?youtube\.com\/watch\?v=([\w-]+)/;
feed.YOUTUBE_RE_SHORT = /^https?:\/\/youtu\.be\/([\w-]+)/;

feed.refresh = function() {
  Tweet.find().sort({ id: -1 }).limit(1).run(function(err, tweet){
    feed.sinceId = (tweet) ? tweet.id : null;
    feed.fetchLatest();
  });
};

feed.fetchLatest = function() {
  var twitterApi = new Twitter(CONFIG.twitter)
    , parameters = { count: 200, include_entities: true };

  if (feed.sinceId) parameters.since_id = feed.sinceId;

  twitterApi.getHomeTimeline(parameters, function(err, results){
    if (err) return console.log(err) && false;
    results.forEach(feed.processResult);
  });
};

feed.processResult = function(result) {
  var user = result.user
    , urls = result.entities.urls
    , text = result.text;

  if (urls.length) {
    var id = feed.getYouTubeId(urls[0].expanded_url);
    if (id) {

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

      feed.getYouTubeData(id, function(result){
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
};

feed.getYouTubeId = function(url) {
  var m = url.match(feed.YOUTUBE_RE) || url.match(feed.YOUTUBE_RE_SHORT);
  if (m) return m[1];
};

feed.getYouTubeData = function(id, callback) {
  var url = 'http://gdata.youtube.com/feeds/api/videos/' + id + '?v=2&alt=json';

  request(url, function(err, res, body){
    if (err) return console.log(err) && false;
    try {
      var object = JSON.parse(body);
      callback(object);
    } catch (e) {
      console.log(e, "while parsing", url);
    }
  });
};

