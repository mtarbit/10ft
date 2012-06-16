
// Feed - list of video thumbs

var feed = {};

feed.init = function(){
  this.container = $('.feed');
  this.items = this.container.find('.feed-item');
  this.items.on('click', this.itemClickHandler).css({ cursor: 'pointer' });
};

feed.itemClickHandler = function(e){
  var id = $(this).data('video-id');
  if (id) player.play(id);
  e.preventDefault();
};

// Player - chromeless YouTube swf

var player = {};

player.CHROMELESS_PLAYER_URL = "http://www.youtube.com/apiplayer?enablejsapi=1&version=3";

player.init = function(){
  this.initCallbacks();
  this.initDom();
  this.initKeyboard();
};

player.initDom = function(){
  var innerId = this.domId = 'feed-player';
  var outerId = innerId + '-container';

  this.container = $('<div>').attr({ id: outerId, class: outerId }).text("You need Flash player 8+ to view this video.");
  $('body').append(this.container);

  var parameters = { allowScriptAccess: 'always' };
  var attributes = { id: innerId };
  swfobject.embedSWF(this.CHROMELESS_PLAYER_URL, outerId, '100%', '100%', '8', null, null, parameters, attributes);
};

player.initCallbacks = function(){
  var self = this;

  window.onYouTubePlayerReady = function() {
    self.getDom();
  }

  window.onYouTubePlayerStateChange = function(state) {
    if (state == self.api.STATES.finished) self.stop();
  }
};

player.getDom = function(){
  this.dom = $('#' + this.domId);
  this.dom.get(0).addEventListener('onStateChange', 'onYouTubePlayerStateChange');
  this.api.init();
}

player.initKeyboard = function(){
  var keys = {
      37: 'lt'
    , 39: 'rt'
    , 38: 'up'
    , 40: 'dn'
    , 27: 'esc'
    , 32: 'space'
    , 13: 'enter'
  };

  $(document).on('keydown', function(e){
    var key = keys[e.which];
    var caught = true;

    switch (key) {
      case 'lt':    break;
      case 'rt':    break;
      case 'up':    break;
      case 'dn':    break;
      case 'esc':   player.stop();  break;
      case 'space': player.pause(); break;
      case 'enter': break;

      default:
        caught = false;
        break;
    }

    if (caught) e.preventDefault();
  });
}

player.play = function(id){
  this.dom.css({ left: 0 });
  this.api.load(id);
};

player.pause = function(){
  if (this.api.is('paused')) {
    this.api.play();
  } else {
    this.api.pause();
  }
};

player.stop = function(){
  this.dom.css({ left: '-100%' });
  this.api.pause();
};

var api = player.api = {};

api.STATES = { 'finished':0, 'paused':2 };

api.init = function(){ this.dom = player.dom.get(0); }
api.load = function(id){ this.dom.loadVideoById(id); }
api.play = function(){ this.dom.playVideo(); }
api.pause = function(){ this.dom.pauseVideo(); }

api.is = function(state){
  return this.dom.getPlayerState() == this.STATES[state];
}

$(function(){
  feed.init();
  player.init();
});

