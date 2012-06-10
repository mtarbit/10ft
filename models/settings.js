var db = require('../db');

var SettingsSchema = new db.Schema({
    twitterMaxId: String
  , twitterSinceId: String
});

module.exports = db.model('Settings', SettingsSchema);
