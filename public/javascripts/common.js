
// Util - generic bits & pieces

var util = {};

util.KEYS = {
    37: 'lt'
  , 39: 'rt'
  , 38: 'up'
  , 40: 'dn'
  , 27: 'esc'
  , 32: 'space'
  , 13: 'enter'
  , 74: 'j'
  , 75: 'k'
};

util.clamp = function(n, min, max){
  if (n < min) n = max;
  if (n > max) n = min;
  return n;
};

// Feed - list of video thumbs

var feed = {};

feed.init = function(){
  this.initDom();
  this.initKeyboard();
};

feed.initDom = function(){
  this.container = $('.feed');

  this.items = this.container.find('.feed-item');
  this.items.on('click', this.itemClickHandler);

  this.select(0);
};

feed.initKeyboard = function(){
  var self = this;

  $(document).on('keydown', function(e){
    if (player.active || e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) return true;

    var key = util.KEYS[e.which];
    var caught = true;

    switch (key) {
      case 'lt':
      case 'up':
      case 'k':
        self.prev();
        break;

      case 'rt':
      case 'dn':
      case 'j':
        self.next();
        break;

      case 'space':
      case 'enter':
        self.play();
        break;

      default:
        caught = false;
        break;
    }

    if (caught) e.stopImmediatePropagation();
  });
};

feed.next = function(){
  this.select(this.n + 1);
};

feed.prev = function(){
  this.select(this.n - 1);
};

feed.select = function(n){
  this.n = util.clamp(n, 0, this.items.length - 1);

  this.items.removeClass('selected');

  var item = this.items.eq(this.n);
  item.addClass('selected');

  var top = item.position().top;
  var pad = parseInt(item.closest('section').css('paddingTop'), 10);

  $('body').animate({ scrollTop: top - pad }, 300);
};

feed.play = function(){
  var id = this.items.eq(this.n).data('video-id');
  if (id) player.play(id);
};

feed.itemClickHandler = function(e){
  feed.select(feed.items.index(this));
  feed.play();
  e.preventDefault();
};

// Player - chromeless YouTube swf

var player = {};

player.CHROMELESS_PLAYER_URL = "http://www.youtube.com/apiplayer?enablejsapi=1&version=3";
player.active = false;

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
    if (state == self.api.STATES.ended) self.stop();
  }
};

player.getDom = function(){
  this.dom = $('#' + this.domId);
  this.dom.get(0).addEventListener('onStateChange', 'onYouTubePlayerStateChange');
  this.api.init();
}

player.initKeyboard = function(){
  var self = this;

  $(document).on('keydown', function(e){
    if (!self.active || e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) return true;

    var key = util.KEYS[e.which];
    var caught = true;

    switch (key) {
      case 'esc':   self.stop();  break;
      case 'space': self.pause(); break;

      default:
        caught = false;
        break;
    }

    if (caught) e.stopImmediatePropagation();
  });
}

player.play = function(id){
  this.active = true;
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
  this.active = false;
  this.dom.css({ left: '-100%' });
  this.api.pause();
};

// YouTube Chromeless Player API
// https://developers.google.com/youtube/js_api_reference

var api = player.api = {};

api.STATES = {
    'unstarted': -1
  , 'ended':      0
  , 'playing':    1
  , 'paused':     2
  , 'buffering':  3
};

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

