var $ = function(selector) {
  var dom = null;
  if (typeof selector === 'string') {
    dom = document.querySelectorAll(selector);
  } else if (selector instanceof HTMLElement) {
    dom = selector
  }
  return new $Element(dom);
}

window.$ = $;

class $Element {
  constructor(_doms) {
    var doms = _doms.constructor === Array || _doms.constructor === NodeList
      ? _doms
      : [_doms]
      this.doms = doms;
      this.init();
      for (var i = 0; i < doms.length; i++) {
        this[i] = doms[i];
        if (!doms[i].listeners) {
          doms[i].listeners = {};
        }
      }
  }

  init() {
    for(var i = 0; i < this.doms.length; i++) {
      if (!this.doms[i].listeners) {
        this.initTapEvent(this.doms[i]);
      }
    }
  }

  initTapEvent(dom) {
    var x1 = 0, x2 = 0, y1 = 0, y2 = 0;
    dom.addEventListener("touchstart", function(event){
      var touch = event.touches[0];
      x1 = x2 = touch.pageX;
      y1 = y2 = touch.pageY;
    });
    dom.addEventListener("touchmove", function(event){
      var touch = event.touches[0];
      x2 = touch.pageX;
      y2 = touch.pageY;
    });
    dom.addEventListener("touchend", function(event){
      if(Math.abs(x2 - x1) < 10 && Math.abs(y2 - y1) < 10){
        $Element.dispatchEvent(dom, "tap", new $Event(x1, y1));
      }
      y2 = x2 = 0;
    });
  }

  on(eventType, callback) {
    for(var i = 0; i < this.doms.length; i++) {
      var dom =this.doms[i];
      if (!dom.listeners[eventType]) {
        dom.listeners[eventType] = [];
      }
      doms.listeners[eventType].push(callback);
    }
  }

  trigger(eventType, event) {
    for(var i = 0; i < this.doms.length; i++) {
      $Element.dispatchEvent(this.doms[i], eventType, event);
    }
  }

  static dispatchEvent(dom, eventType, event) {
    var listeners = dom.listeners[eventType];
    if (listeners) {
      for(var i = 0; i < listeners.length; i++) {
        listeners[i].call(dom, event);
      }
    }
  }
}

class $Event{
  constructor(pageX, pageY){
      this.pageX = pageX;
      this.pageY = pageY;
  }   
}

$("#target").on("tap", function(event){
  console.log("tap", event.pageX, event.pageY);
});
