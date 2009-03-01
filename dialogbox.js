var DialogBox = Class.create({
	
	initialize: function(url, title, opts) {
		
	  this.opts = {
			title: '&nbsp;',
			content: 'Ładowanie...',
			classNames: '',
			url: '',
			method: 'post',
			submit_url: '',

			ok_value: 'OK',
			cancel_value: 'Anuluj',
			ok_callback: function(){},
			cancel_callback: function(){ this.close(); },
			close_callback: function(){},
			cancel_enable: true,
			ok_enable: true,
			actions_enable: true
	  };
		
      this.opts['url'] = url || this.opts['url'];
	  this.opts['title'] = title || this.opts['title']; 
  	  this.opts['submit_url'] = this.opts['url'] || this.opts['submit_url'];
	
	  this.setOptions(opts);
	  this.create();
	  this.createWrapper();
	
	  if(this.opts['ajax_init'] !== false) {
	     this.makeRequest(this.opts['url']);
	  }
	},
	
	setOptions: function(new_opts) {

		for(var key in new_opts) {
			this.opts[key] = new_opts[key];
		}
		
		if(this.opts['ajax_init'] === false) {
		  this.opts['content'] = this.opts['url'];
		  this.opts['submit_url'] = '';
		}
	},
	
	create: function() {
		var box = new Template(DialogBox.code);
		
		this.opts['id'] = 'msgTipBox_'+(new String($$('.DialogBox').length+1));

    	var box_output = box.evaluate(this.opts);
    	$$('body').first().insert({bottom:box_output});
		
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
		if(!not_hide_actions) {
			this.actions_pane.hide();
		}
	},
	
	setVisibility: function() {
		
		if(this.opts['ok_enable'] === false) {
			this.actions_pane.down('input.Done').remove();
		}
		if(this.opts['cancel_enable'] === false) {
			this.actions_pane.down('input.Cancel').remove();
		}
		if(this.opts['actions_enable'] === false) {
			this.actions_pane.remove();
		}
	},
	
	createWrapper: function() {
		DialogBox.wrapper = new Element('div', {
			'id': 'dialogBoxWrapper'
		});
		
		
		
		if($('dialogBoxWrapper')) {
			$('dialogBoxWrapper').remove();
		}
		
		$$('body').first().insert({top: DialogBox.wrapper});

		DialogBox.wrapper.setStyle({
			'position': 'fixed',
			'top':'0px',
			'left': '0px',
			'width':'100%',
			'height': '100%',
			'backgroundColor': '#000',
			'zIndex': 9998,
			'margin': 0,
			'padding': 0,			
			'opacity': 0.0
		});
		
		if(typeof DialogBox.wrapper.appear === 'function') {
			DialogBox.wrapper.appear({to:0.4});
		}
		else {
			DialogBox.wrapper.setStyle({opacity: 0.4});
		}
		
		//IE fixes
		if (Prototype.Browser.IE) {
			
			var setPosition = function() {
				DialogBox.wrapper.setStyle({top: document.viewport.getScrollOffsets().top+"px"});
			}
			
			setPosition();
			
			DialogBox.wrapper.setStyle({
				'position': 'absolute',
				'width': document.viewport.getWidth()+'px',
				'height': document.viewport.getHeight()+'px'
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
	  
	  var dimesions = document.viewport.getDimensions();
	  top = parseInt(dimesions.height/2) - 50;
	  left = dimesions.width/2 - (parseInt(this.el.getStyle('width'))/2);

	  var styles = {};
	  
	  if(Prototype.Browser.IE) {
	    styles['position'] = 'absolute';
	    top += document.viewport.getScrollOffsets().top;
	  }
	  else {
	    styles['position'] = 'fixed';
	  }
	
	  styles['top'] = top+'px';
      styles['left'] = left+'px';
    
	  this.el.setStyle(styles);
	},
	
	makeRequest: function(url, elements) {    

	  var opts = {
			method: this.opts['method'],
			onComplete: function(req) {
				this.content_pane.update(req.responseText);
				this.onSubmitAjaxResults();
			}.bind(this)
		};
		
		if(elements) {
		  opts['parameters'] = Form.serializeElements(elements);
		}
	  	new Ajax.Request(url, opts);
	},
		
	attachCallbacks: function() {
	  var ok_button = this.actions_pane.down('.Done');
	  var cancel_button = this.actions_pane.down('.Cancel');
      if(ok_button) {
		ok_button.observe('click', this.opts['ok_callback'].bind(this));
	  }
      if(cancel_button) {
		cancel_button.observe('click', this.opts['cancel_callback'].bind(this));
	  }
	  
	},
	
	attachEvents: function() {
		
		this.closeButtonEventAttach();
		this.attachCallbacks();
		this.submitAjaxedForm($(this.el).down('form'));
		this.onSubmitAjaxResults();
		
		if(this.opts['standalone'] != true && typeof(Draggable) !== 'undefined') {
			var handler = this.el.down('h4');
			new Draggable(this.el, {'handle': handler});
			handler.setStyle({cursor: 'move'});
		}
		
		//onscroll move window
		if(Prototype.Browser.IE) {
			
			var onScroll = function() {
				this.setPosition();
			}
			
			window.attachEvent('onresize', onScroll.bind(this));
			window.attachEvent('onscroll', onScroll.bind(this));
		}
 	},
 	
 	submitAjaxedForm: function(form) {	  
		form.observe('submit', function(ev){
		  
			var form = Event.element(ev);
			if(form.action !== '') {
				this.makeRequest(form.action, form.getElements());
			}

			Event.stop(ev);
			return false;
		}.bind(this));
	},

	onSubmitAjaxResults: function() {
		this.content_pane.select('form').each(this.submitAjaxedForm.bind(this));
	},
	
	closeButtonEventAttach: function() {
		$(this.el).select('.closeButton').invoke('observe', 'click', function(ev) {
			Event.stop(ev);
			this.close();
			this.opts['close_callback']();
			return false;
		}.bind(this));
	},
	
	remove: function() {
	  if(typeof(this.el.fade) !== 'undefined' ) {
	    this.el.fade();
		DialogBox.wrapper.fade();
	  }
	  else {
		  this.el.remove();
		  DialogBox.wrapper.setStyle({opacity: 0.0, display: 'none'});
	  }
	},
	
	close: function() {
		return this.remove();
	}
});

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
	
	if(typeof ok_callback !== 'undefined') {
		modeOpts['ok_callback'] = ok_callback;
	}
	if(typeof cancel_callback !== 'undefined') {
		modeOpts['cancel_callback'] = cancel_callback;
	}
	
	var opts = opts || {};
	
	for(var i in opts) {
		modeOpts[i] = opts[i];
	}
	
	return new DialogBox(url, title, modeOpts);
};

DialogBox.code = '<div id="#{id}" class="#{classNames} DialogBox" style="width: 450px"><a title="Zamknij" class="closeButton" href="#" >x</a><h4>#{title}</h4><form action="#{submit_url}" method="#{method}" class="DialogBoxSubmit"><div class="DialogBoxContent">#{content}</div><div class="DialogBoxActions"><input type="submit" value="#{ok_value}" class="Done" /> <input type="reset" value="#{cancel_value}" class="Cancel"/></div></form></div>';
