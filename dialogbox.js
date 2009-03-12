var DialogBox = Class.create({
  
  initialize: function(url, title, opts) {
    this.opts = {
      title:            '&nbsp;',
      content:          'Loading...',
      classNames:       '',
      url:              '',
      method:           'post',
      submit_url:       '',

      ok_value:         'OK',
      cancel_value:     'Cancel',
      ok_callback:      Prototype.emptyFunction,
      cancel_callback:  function(){ this.close(); },
      close_callback:   Prototype.emptyFunction,
      cancel_enable:    true,
      ok_enable:        true,
      actions_enable:   true,
      effects_enable:   true,
      standalone:       false,
      ajax_init:        true,
      on_ok_reload:     false,
      ignore_detection: false
    };
    
    this.opts['url']        = url || this.opts['url'];    
    
    if (Object.isString(title)) {
      this.opts['title']    = title || this.opts['title']; 
    }                                                      
    else if (!Object.isUndefined(title) && Object.isUndefined(opts)) {
      opts = title;
    }
    
    this.opts['submit_url'] = this.opts['url'] || this.opts['submit_url'];

    this.setOptions(opts);
    this.createWrapper();
    this.create();

    if (this.opts['ajax_init'] !== false) {
      this.makeRequest(this.opts['url']);
    }
  },
  
  setOptions: function(new_opts) {
    for(var key in new_opts) {
      this.opts[key] = new_opts[key];
    }                                      
    this.detectAjaxInit();
    
    if (this.opts['ajax_init'] === false) {
      this.opts['content'] = this.opts['url'];
      this.opts['submit_url'] = '';
    }
  },     
  
  detectAjaxInit: function() {
    if (this.opts['ajax_init'] === true && !this.opts['ignore_detection']) {
      if (this.opts['submit_url'].indexOf(' ') !== -1 || this.opts['url'].indexOf(' ') !== -1) {
        this.opts['ajax_init'] = false;
        return;
      }        
      
      if (this.opts['submit_url'].indexOf('http://') !== 0 
          && this.opts['url'].indexOf('http://') !== 0
          && this.opts['submit_url'].indexOf('/') !== 0 
          && this.opts['url'].indexOf('/') !== 0) {
        this.opts['ajax_init'] = false;
        return;
      }
    }
  },
  
  create: function() {
    var box = new Template(DialogBox.code);
    
    this.opts['id'] = 'msgTipBox_'+(new String($$('.DialogBox').length+1));

    var box_output = box.evaluate(this.opts);
      
    // fixes bug in IE6/7 where it's impossible to insert data into body element while it's not fully loaded
    if (Prototype.Browser.IE && !document.loaded) {
      document.write(box_output);
    }
    else {
      $(document.body).insert({bottom:box_output});
    }
      
    this.el = $(this.opts['id']);
    this.setPanes();
    this.setVisibility();
    this.setPosition();
    this.attachEvents();
    
    return this.el;
  },
  
  setPanes: function() {
    this.actions_pane = this.el.down('.DialogBoxActions');
    this.content_pane = this.el.down('.DialogBoxContent');
    this.title_pane = this.el.down('H4');
  },
  
  update: function(content, not_hide_actions) {
    this.content_pane.update(content);
    if (!not_hide_actions) {
      this.actions_pane.hide();
    }
  },
  
  setVisibility: function() {
    if (this.opts['ok_enable'] === false) {
      this.actions_pane.down('input.Done').remove();
    }
    if (this.opts['cancel_enable'] === false) {
      this.actions_pane.down('input.Cancel').remove();
    }
    if (this.opts['actions_enable'] === false) {
      this.actions_pane.remove();
    }
  },
  
  createWrapper: function() {
    DialogBox.wrapper = new Element('div', {
      'id': 'dialogBoxWrapper'
    });
                   
    var existing_dialog_box_wrapper = $('dialogBoxWrapper');
    if (existing_dialog_box_wrapper) {
      existing_dialog_box_wrapper.remove();
    }                                      
    delete existing_dialog_box_wrapper;
    
    // fixes bug in IE6/7 where it's impossible to insert data into body element while it's not fully loaded
    if (Prototype.Browser.IE && !document.loaded) {
      document.write(DialogBox.wrapper.inspect()+"&nbsp;</div>");
    }
    else {
      $(document.body).insert({top:DialogBox.wrapper});
    }

    DialogBox.wrapper.setStyle({
      'position':         'fixed',
      'top':              '0px',
      'left':             '0px',
      'width':            '100%',
      'height':           '100%',
      'backgroundColor':  '#000',
      'zIndex':           9998,
      'margin':           0,
      'padding':          0,     
      'opacity':          0.0
    });
    
    if (Object.isFunction(DialogBox.wrapper.appear) && this.opts['effects_enable']) {
      DialogBox.wrapper.appear({to:0.4});
    }
    else {
      DialogBox.wrapper.setStyle({opacity: 0.4});
    }
    
    //IE fixes
    if (Prototype.Browser.IE) {
      var setPosition = function() {
        DialogBox.wrapper.setStyle({
          top: document.viewport.getScrollOffsets().top+"px"
        });
      }
      
      setPosition();
      
      DialogBox.wrapper.setStyle({
        'position':   'absolute',
        'width':      document.viewport.getWidth()+'px',
        'height':     document.viewport.getHeight()+'px'
      });
      
      var onScroll = function() {
        setPosition();
      }
      
      window.attachEvent('onresize', onScroll.bind(this));
      window.attachEvent('onscroll', onScroll.bind(this));
    }
    
  },
  
  setPosition: function() {
    var top = 0, left = 0;
    var styles = {
        position: 'fixed'
    };
    
    if (Prototype.Browser.IE) {
      styles['position'] = 'absolute';
    }
    
    this.el.setStyle(styles);
    
    var dimesions = document.viewport.getDimensions();
    top = parseInt(dimesions.height/2) - (parseInt(this.el.getStyle('height'))/2);
    left = dimesions.width/2 - (parseInt(this.el.getStyle('width'))/2);
    
    if (Prototype.Browser.IE) {
        top += document.viewport.getScrollOffsets().top;
    }
    
    styles['top'] = top+'px';
    styles['left'] = left+'px';
    
    this.el.setStyle(styles);
  },
  
  makeRequest: function(url, elements, is_click) {    
    var opts = {
      method: this.opts['method'],           
      
      onComplete: function(req) {
        if (this.opts['on_ok_reload'] === true && is_click === true) {
            this.update("Please wait while reloading the page");
            window.location.reload();
            return;
        }
        
        this.content_pane.update(req.responseText);
      }.bind(this),
      
      onFailure: function(req){
        this.update("Requested page doesn't exists");
      }.bind(this)
    };
    
    if (elements) {
      opts['parameters'] = Form.serializeElements(elements);
    }
    
    new Ajax.Request(url, opts);
  },
    
  attachCallbacks: function() {
    var ok_button = this.actions_pane.down('.Done');
    var cancel_button = this.actions_pane.down('.Cancel');
    
    if (Object.isElement(ok_button)) {
      ok_button.observe('click', this.opts['ok_callback'].bind(this));
    }
    if (Object.isElement(cancel_button)) {
      cancel_button.observe('click', this.opts['cancel_callback'].bind(this));
    }
  },
  
  attachEvents: function() {
    this.closeButtonEventAttach();
    this.attachCallbacks();
    this.submitAjaxedForm(this.el.down('form'));
    
    if (this.opts['standalone'] !== true && !Object.isUndefined(Draggable)) {;
      new Draggable(this.el, {'handle': this.title_pane});
      
      // change cursor if is draggable
      this.title_pane.setStyle({cursor: 'move'});
    }
    
    var onScroll = function() {
      this.setPosition();
    }
    
    Event.observe(window, 'resize', onScroll.bind(this));
    
    //onscroll move window
    if (Prototype.Browser.IE) {
      window.attachEvent('onscroll', onScroll.bind(this));
    }
  },
  
  submitAjaxedForm: function(form) {    
    form.observe('submit', function(ev){
      var form = Event.element(ev);
      if (!form.action.empty()) {
        this.makeRequest(form.action, form.getElements(), true);
      }

      Event.stop(ev);
      return false;
    }.bind(this));
  },                
  
  closeButtonEventAttach: function() {
    this.el.select('.closeButton').invoke('observe', 'click', function(ev) {
      Event.stop(ev);
      this.close();
      this.opts['close_callback']();
      return false;
    }.bind(this));
    
    DialogBox.wrapper.observe('click', function(ev) {
      this.close();
    }.bind(this));
  },
  
  remove: function() {
    if (!Object.isUndefined(this.el.fade) && this.opts['effects_enable']) {
      this.el.fade({
        afterFinish: function() {
          this.el.remove();
        }.bind(this)
       });
       
      DialogBox.wrapper.fade({
        afterFinish: function() {
          DialogBox.wrapper.remove();
        }.bind(this)
      });
    }
    else {
      this.el.remove();
      DialogBox.wrapper.setStyle({
        opacity: 0.0, 
        display: 'none'
      });
      DialogBox.wrapper.remove();
    }
  },
  
  close: function() {
    // alias method for remove
    return this.remove();
  }
});
                              
/**
  * Here you have common alternatives for JavaScript default window elements like: alert, confirm, debug, info
  * 
  * @todo: also prompt version of DialogBox needed
  */               
DialogBox.alert = function(url, title, opts) {
  var modeOpts = {
    ajax_init: false, 
    ok_callback: function(ev){Event.stop(ev); this.close();}, 
    cancel_enable: false
  }
  
  var opts = opts || {};
  
  for(var i in opts) {
    modeOpts[i] = opts[i];
  }

  return new DialogBox(url, title, modeOpts);
};

DialogBox.debug = function(content, opts) {                                  
  // @todo: multiple arguments and printf like form for first argument - just like console.log in Firebug
  var modeOpts = {
    ajax_init: false, 
    ok_callback: function(ev){Event.stop(ev); this.close();}, 
    cancel_enable: false
  }
  
  var opts = opts || {};
  
  for(var i in opts) {
    modeOpts[i] = opts[i];
  }

  return new DialogBox(content, 'Debug', modeOpts);
};

DialogBox.info = function(url, title, opts) {
  var modeOpts = {
    ajax_init: false, 
    actions_enable: false
  }
  
  var opts = opts || {};
  
  for(var i in opts) {
    modeOpts[i] = opts[i];
  }
  
  return new DialogBox(url, title, modeOpts);
};

DialogBox.confirm = function(url, title, ok_callback, cancel_callback, opts) {
  var modeOpts = {
    ajax_init: false
  }
  
  if (Object.isFunction(ok_callback)) {
    modeOpts['ok_callback'] = ok_callback;
  }
  if (Object.isFunction(cancel_callback)) {
    modeOpts['cancel_callback'] = cancel_callback;
  }                    
  else if (!Object.isUndefined(cancel_callback) && Object.isUndefined(opts)) {
    opts = cancel_callback;
  }
  
  var opts = opts || {};
  
  for(var i in opts) {
    modeOpts[i] = opts[i];
  }
  
  return new DialogBox(url, title, modeOpts);
};

DialogBox.code = '<div id="#{id}" class="DialogBox #{classNames}"><a title="Close" class="closeButton" href="#" >x</a><h4>#{title}</h4><form action="#{submit_url}" method="#{method}" class="DialogBoxSubmit"><div class="DialogBoxContent">#{content}</div><div class="DialogBoxActions"><input type="submit" value="#{ok_value}" class="Done" /> <input type="reset" value="#{cancel_value}" class="Cancel"/></div></form></div>';
