var db = require('mongoose');
db.connect('mongodb://localhost/10ft');
module.exports = db;
