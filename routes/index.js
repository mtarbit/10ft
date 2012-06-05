
var fs = require('fs'),
    path = require('path'),
    player = require('../player'),
    CONFIG = require('../config');

exports.index = function(req, res, next){
    res.redirect('/show/');
};

exports.show = function(req, res, next){
    var showPath = req.params[0];
    var fullPath = path.join(CONFIG.mediaPath, showPath);

    fs.stat(fullPath, function(err, stats) {
        if (err) return next(err);
        if (stats.isDirectory()) {
            fs.readdir(fullPath, function(err, files){
                if (err) return next(err);
                res.render('index', { filesPath: showPath, files: files, join: path.join });
            });
        } else {
            player.play(fullPath);
            res.redirect('back');
        }
    });
};

