var db = require(appRoot + '/db');

var VideoSchema = new db.Schema({
    id: { type: String, unique: true }
  , thumb: String
  , title: String
  , description: String
});

module.exports = db.model('Video', VideoSchema);
