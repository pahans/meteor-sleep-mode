_SleepMode = function () {  
  EV.call(this);
}
_.extend(_SleepMode.prototype, EV.prototype);

_SleepMode.prototype.configure = function(config){
  config = config || {};
  this.config = config;
  this.sleepModeStatus = false;
  this.timer = null;
  this.config.timeout = this.config.timeout || 1000 * 60 * 5 // 5mins
  this.config.ddp = this.config.ddp || true;
  this.config.focus = this.config.focus || true;
  this.config.route = this.config.route || true;

  if(this.config.ddp){
    this._trackDDPSend();
  }
  this._startTimer();
  _SleepMode.prototype.configure = function(){};
}

_SleepMode.prototype._startTimer = function() {
  var lastTimeoutTime = new Date().getTime();
  var self = this;
  if(!this.timer){
    this.timer = setInterval(function(){
      lastTimeoutTime = new Date().getTime();
      if(lastTimeoutTime - self.lastDDPSendTime >= self.config.timeout){
        self.sleepModeStatus = true;
        self.goSleepMode();
        self.emit('sleep', {type: 'ddp-send'});
      }
    }, this.config.timeout);
  }

};

_SleepMode.prototype._trackDDPSend = function(){
  var originalSend = Meteor.default_connection._send;
  this.lastDDPSendTime = new Date().getTime();
  var self = this;
  Meteor.default_connection._send = function (msg) {
    self.lastDDPSendTime = new Date().getTime();
    return originalSend.call(this, msg);
  }
  this._trackDDPSend = function(){};
}

_SleepMode.prototype._trackRouteChange = function(timeout) {

};

_SleepMode.prototype._trackMouseFocus = function(timeout) {

};

_SleepMode.prototype._clearTimer = function(first_argument) {
  clearInterval(this.timer);
  this.timer = null;
};

_SleepMode.prototype.wakeup = function() {
  Meteor.default_connection.reconnect();
  this.sleepModeStatus = false;
  this.emit('wakeup', {});
  this.removeOverlay();
  console.log('wakeup mode')
};

_SleepMode.prototype.goSleepMode = function() {
  var style = "position:absolute;height:10000px;width:10000px;background:white;z-index:100000;opacity:0.5";
  $('#sleep-overlay').attr('style', style);
  var self = this;
  Meteor.default_connection.disconnect(); 
  $('#sleep-overlay').mousemove(function(ev){
    if(self.sleepModeStatus){
      self.wakeup();
      self._startTimer();
    }
  });
  this._clearTimer();

}

_SleepMode.prototype.removeOverlay = function() {  
  $('#sleep-overlay').attr('style','') ;
};

SleepMode = new _SleepMode();

Handlebars.registerHelper("isSleepMode", function() {
  return SleepMode.sleepModeStatus; 
});

