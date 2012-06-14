var db = require(appRoot + '/db');

var VideoSchema = new db.Schema({
    id: { type: String, unique: true }
  , thumb: String
  , title: String
  , description: String
});

VideoSchema.methods.getUrl = function(){
    return "http://www.youtube.com/watch?v=" + this.id;
};

module.exports = db.model('Video', VideoSchema);
