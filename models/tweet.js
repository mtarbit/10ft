var db = require(appRoot + '/db');

var TweetSchema = new db.Schema({
    id: { type: String, unique: true }
  , user: String
  , icon: String
  , text: String
  , date: Date
  , video: { type: db.Schema.ObjectId, ref: 'Video' }
});

module.exports = db.model('Tweet', TweetSchema);
