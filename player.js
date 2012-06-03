var child_process = require('child_process'),
    platform = require('os').platform(),
    semver = require('semver'),
    http = require('http'),
    qs = require('querystring');

// External Video Player

var vlc = exports = module.exports = {};

vlc.httpHost = '127.0.0.1';
vlc.httpPort = '8080';

vlc.platformCmds = {
    darwin: '/Applications/VLC.app/Contents/MacOS/VLC',
    linux: 'vlc',
    win32: 'C:/Program Files/VideoLAN/VLC/vlc.exe'
}

vlc.defaultCmdArgs = [
    '--fullscreen',
    '--video-on-top',
    '--no-video-title-show',
    '--extraintf=http',
];

vlc.init = function(){
    var self = this;

    this.cmd = this.platformCmds[platform];
    this.cmdArgs = this.defaultCmdArgs;

    this.initCmdVersion(function(){
        self.initCmdArgs();
        self.initCmdProcess();
    });
};

vlc.initCmdVersion = function(next){
    var self = this;
    child_process.exec(this.cmd + ' --version', function(err, stdout, stderr){
        if (err !== null) {
            console.log('exec error: ' + err);
        } else {
            // Version info may be in either stream depending on platform.
            var versionRE = /\b\d+\.\d+\.\d+\b/;
            var m = stdout.match(versionRE) || stderr.match(versionRE);
            if (m) self.cmdVersion = m[0];
            next();
        }
    });
};

vlc.initCmdArgs = function() {
    if (platform == 'linux') {
        // Don't have pulseaudio working on my HTPC,
        // you may not need this if it works for you.
        this.cmdArgs = this.cmdArgs.concat(['-A alsa']);
    }

    if (platform != 'darwin') {
        // Have tried to disable the playlist GUI on OS X in a number 
        // of ways but it always seems to disable the video window too
        // and gives me colour ASCII art output in the terminal instead.
        this.cmdArgs = this.cmdArgs.concat(['-I dummy']);
    }

    if (semver.gte(this.cmdVersion, '2.0.0')) {
        this.cmdArgs = this.cmdArgs.concat([
            '--http-host=' + this.httpHost,
            '--http-port=' + this.httpPort
        ]);
    } else {
        this.cmdArgs = this.cmdArgs.concat([
            '--http-host=' + this.httpHost + ':' + this.httpPort
        ]);
    }
};

vlc.initCmdProcess = function() {
    if (this.process) {
        console.log('Already running');
    } else {
        console.log('Spawning: ', this.cmd);
        console.log(this.cmdArgs.join("\n"));
        this.process = child_process.spawn(this.cmd, this.cmdArgs);
    }
};

vlc.req = function(query) {
    var path = '/requests/status.xml';
    if (query) {
        path += '?' + qs.stringify(query);
    }

    console.log("Requesting: " + path);

    var req = http.request({
        host: this.httpHost,
        port: this.httpPort,
        path: path,
        method: 'GET'
    });

    req.on('error', function(e){
        console.log('Error: ' + e.message);
    });

    req.end();
}

// Details of HTTP interface can be found in the VLC source:
//  /share/lua/http/requests/README.txt
// For a general overview see:
//  http://detlev.home.xs4all.nl/dpw/2010/talk/vlc-http.pdf

vlc.play = function(path){
    this.req({
        'command': 'in_play',
        'input' : 'file://' + path
    });
};

vlc.init();

