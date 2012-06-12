var request = require('request')
  , Twitter = require('ntwitter')
  , Video = require(appRoot + '/models/video')
  , Tweet = require(appRoot + '/models/tweet')
  , CONFIG = require(appRoot + '/config');

var feed = module.exports = {};

feed.YOUTUBE_RE = /^https?:\/\/(?:www\.)?youtube\.com\/watch\?v=([\w-]+)/;
feed.YOUTUBE_RE_SHORT = /^https?:\/\/youtu\.be\/([\w-]+)/;

feed.refresh = function() {
  Tweet.findOne().desc('id').run(function(err, tweet){
    feed.sinceId = (tweet) ? tweet.id : null;
    feed.fetchTweets();
  });
};

feed.fetchTweets = function() {
  var twitterApi = new Twitter(CONFIG.twitter)
    , parameters = { count: 20, include_entities: true };

  if (feed.maxId) {
    console.log("Fetching tweets until: " + feed.maxId);
    parameters.max_id = feed.maxId;
  }
  if (feed.sinceId) {
    console.log("Fetching tweets since: " + feed.sinceId);
    parameters.since_id = feed.sinceId;
  }

  twitterApi.getHomeTimeline(parameters, function(err, results){
    if (err) return console.log(err) && false;

    // MaxID is inclusive so first result may be a dupe, see:
    // https://dev.twitter.com/docs/working-with-timelines
    if (feed.maxId && results[0] && results[0].id == feed.maxId) {
      results.shift();
    }

    console.log("Got " + results.length + " tweets");

    if (results.length) {
      console.log("------------------");
      results.forEach(feed.checkTweet);
      console.log("------------------");
      feed.maxId = results[results.length - 1].id;
      feed.fetchTweets();
    } else {
      feed.maxId = null;
    }

  });
};

feed.fetchVideo = function(id, next) {
  var url = 'http://gdata.youtube.com/feeds/api/videos/' + id + '?v=2&alt=json';

  request(url, function(err, res, body){
    if (err) return console.log(err) && false;
    next(JSON.parse(body));
  });
};

feed.checkTweet = function(tweetData) {
  var urls = tweetData.entities.urls;
  if (urls.length) {

    var id = feed.getVideoIdForUrl(urls[0].expanded_url);
    if (id) {

      feed.fetchVideo(id, function(videoData){
        var video = feed.storeVideo(videoData);
        var tweet = feed.storeTweet(tweetData, video._id);
      });

    }
  }

  console.log("%s @%s %s", tweetData.id, tweetData.user.screen_name, id ? (': '+id) : '');
};

feed.storeTweet = function(data, videoId) {
  var user = data.user
    , urls = data.entities.urls
    , text = data.text;

  urls.forEach(function(url){
      text = text.replace(url.url, '<a href="' + url.expanded_url + '">' + url.display_url + '</a>');
  });

  var tweet = new Tweet({
      id: data.id
    , user: user.screen_name
    , icon: user.profile_image_url
    , text: text
    , date: data.created_at
    , video: videoId
  });

  tweet.save();

  return tweet;
}

feed.storeVideo = function(data) {
  var group = data.entry.media$group;
  var video = new Video({
      id: group.yt$videoid.$t
    , thumb: group.media$thumbnail[0].url
    , title: group.media$title.$t
    , description: group.media$description.$t
  });

  video.save();

  return video;
};

feed.getVideoIdForUrl = function(url) {
  var m = url.match(feed.YOUTUBE_RE) || url.match(feed.YOUTUBE_RE_SHORT);
  if (m) return m[1];
};

