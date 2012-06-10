var db = require('../db');

var TweetSchema = new db.Schema({
    id: String
  , user: String
  , icon: String
  , text: String
  , date: Date
  , video: { type: db.Schema.ObjectId, ref: 'Video' }
});

module.exports = db.model('Tweet', TweetSchema);
