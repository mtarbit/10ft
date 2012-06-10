var db = require(appRoot + '/db');

var VideoSchema = new db.Schema({
    id: String
  , thumb: String
  , title: String
  , description: String
});

module.exports = db.model('Video', VideoSchema);
