var feed = {};

feed.CHROMELESS_PLAYER_URL = "http://www.youtube.com/apiplayer?enablejsapi=1&version=3";

feed.init = function(){
  this.container = $('.feed');
  this.items = this.container.find('.feed-item');
  this.items.on('click', this.itemClickHandler).css({ cursor: 'pointer' });
  this.initPlayer();
};

feed.initPlayer = function(){
  this.playerId = 'feed-player';
  this.playerDivId = this.playerId + '-container';

  this.playerDiv = $('<div>').attr({ id: this.playerDivId, class: this.playerDivId }).text("You need Flash player 8+ to view this video.");
  $('body').append(this.playerDiv);

  var parameters = { allowScriptAccess: 'always' };
  var attributes = { id: this.playerId };
  swfobject.embedSWF(feed.CHROMELESS_PLAYER_URL, this.playerDivId, '100%', '100%', '8', null, null, parameters, attributes);
};

feed.play = function(id){
  this.player.css({ left: 0 });
  this.player.get(0).loadVideoById(id);
};

feed.pause = function(){
  this.player.get(0).pauseVideo();
};

feed.stop = function(){
  this.player.css({ left: '-100%' });
  this.player.get(0).pauseVideo();
};

feed.itemClickHandler = function(e){
  var id = $(this).data('video-id');
  if (id) feed.play(id);
  e.preventDefault();
};

$(function(){
  feed.init();
});

function onYouTubePlayerReady() {
  feed.player = $('#' + feed.playerId);
}
