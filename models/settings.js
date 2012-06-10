var db = require(appRoot + '/db');

var SettingsSchema = new db.Schema({
    twitterMaxId: String
  , twitterSinceId: String
});

module.exports = db.model('Settings', SettingsSchema);
