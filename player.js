var child_process = require('child_process'),
    platform = require('os').platform(),
    http = require('http'),
    qs = require('querystring');

// External Video Player

var vlc = exports = module.exports = {};

vlc.httpHost = '127.0.0.1';
vlc.httpPort = '8080';

vlc.platformCmds = {
    'darwin':   '/Applications/VLC.app/Contents/MacOS/VLC',
    'linux':    'vlc',
    'windows':  'C:/Program Files/VideoLAN/VLC/vlc.exe'
}

vlc.defaultCmdArgs = [
    '--fullscreen',
    '--video-on-top',
    '--no-video-title-show',
    '--extraintf=http',
    '--http-host=' + vlc.httpHost,
    '--http-port=' + vlc.httpPort
];

vlc.__defineGetter__('cmd', function(){
    return this.platformCmds[platform];
});

vlc.__defineGetter__('cmdArgs', function(){
    var args = this.defaultCmdArgs;
    if (platform == 'linux') {
        // Don't have pulseaudio working on my HTPC,
        // you may not need this if it works for you.
        args = args.concat(['-A alsa']);
    }
    if (platform != 'darwin') {
        // Have tried to disable the playlist GUI on OS X in a number 
        // of ways but it always seems to disable the video window too
        // and gives me colour ASCII art output in the terminal instead.
        args = args.concat(['-I dummy']);
    }
    return args;
});

vlc.proc = child_process.spawn(vlc.cmd, vlc.cmdArgs);

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
        console.log('Error while requesting: ' + path + "\n\t" + e.message);
    });

    req.end();
}

// Details of HTTP interface can be found in the VLC source.
// For version 2.0.1 see /share/lua/http/requests/README.txt

vlc.play = function(path){
    this.req({
        'command': 'in_play',
        'input' : 'file://' + path
    });
};


