(function(root, factory){
	if (typeof define === 'function' && define.amd) {
		// AMD. Register as an anonymous module.
		define(function () {
			root.SlideShow = factory();
			return root.SlideShow;
		});
	} else if (typeof exports === 'object') {
		// Node. Does not work with strict CommonJS.
		module.exports = factory();
	} else {
		// Browser globals.
		root.SlideShow = factory();
	}
}(this, function(){
	'use strict';
	
	var dom = {};
	
	var _timer;
	var _slideIdx = 1;
	var _prevIdx = 0;
	var settings = {};
								
	//private functions
	function init(options){		
		settings = $.extend({
			marginTop: 0,
			marginBotom:0,
			displayLength : 1000,
			containerID: '#slideDeck',
			slideClass: '.slide',
			autoStart: false
		},options);
	
		dom.slideDeck = document.querySelector(settings.containerID);
		dom.slides = document.querySelector(settings.slideClass);
	
		reload();
		sizeDisplay();
		start();
		
		//Setup some event Listeners
		window.addEventListener("resize", sizeDisplay, false);
	};
	
	function sizeDisplay(){
		var container = document.getElementById('slideDeck');
		var h = window.innerHeight - settings.marginTop - settings.marginBottom; 
		var w = window.innerWidth;
		
		container.style.height = h +'px';
		container.style.width = w +'px';
	}
	
	function publishEvent(evntNme, args){
		var event = document.createEvent( 'HTMLEvents', 1, 2 );
		event.initEvent( evntNme, true, true );
		$.extend(event, args);
		dom.slideDeck.dispatchEvent( event );
	}
		
	function changeSlide(nextIdx){
		if(nextIdx <= 0 || nextIdx > dom.slides.length)
		{
			nextIdx = 1; 
		}
		
		//change slide
		$(settings.slideClass +'.present').addClass('past').removeClass('present');
		$(settings.slideClass +':nth-child('+(nextIdx)+')').addClass('present').removeClass('past');
		
		//store our current index
		_prevIdx = _slideIdx;	
		_slideIdx = nextIdx;
			
		if(nextIdx != _prevIdx)
		{
			publishEvent('SlideChanged', {
				'OldIndex': _prevIdx,
				'NewIndex': _slideIdx,
				'IsFirstSlide': (_slideIdx == 1),
				'IsLastSlide' : (_slideIdx == dom.slides.length)		
			});
		}			
			
		if(settings.autoStart){
			//figure out how long to display the slide					
			var len = $('.present').data('displaylength');
			
			if(!len){
				len = settings.displayLength;
			}

			//figure out how long to display it
			if(_timer)
			{
				clearInterval(_timer);
				_timer = null;
			}
			
			_timer = setTimeout(next, len);
		}
	};
	
	//public functions
	function stop(){
		if(settings.autoStart){
			if(_timer)
			{
				clearInterval(_timer);
				_timer = null;
			}
				
			publishEvent('SlideShowStopped', {'CurrentIndex': _slideIdx});
		}
	};
	
	function start(){
		if(settings.autoStart){
			changeSlide(_slideIdx);
			publishEvent('SlideShowStarted', {'CurrentIndex': _slideIdx});
		}
	};
	
	function previous() {
		var nxtIdx = _slideIdx - 1;
		
		if(nxtIdx <= 0 ){
			nxtIdx = 1;
		}

		changeSlide(nxtIdx);
	};
	
	function next(){
		var nxtIdx = _slideIdx +1;
		
		if(nxtIdx > dom.slides.length){
			nxtIdx = 1;
		}
		
		changeSlide(nxtIdx);
	};
	
	function reload(){
		dom.slides = [];

		$(settings.containerID).children(settings.slideClass).each(function(){
			$(this).removeClass("present");
			$(this).addClass("past");
		});

		//Make the first class Present
		$(settings.containerID).find(settings.slideClass +':first-child').removeClass('past');
		$(settings.containerID).find(settings.slideClass +':first-child').addClass('present');

		dom.slides = document.querySelectorAll(settings.slideClass);
		_slideIdx = 1;
		_prevIdx = 0;	
	};

	/*API*/
	var SlideShow = {
		initialize : init,
		reload : reload,
		previous : previous,
		next : next,
		start : start,
		stop : stop,
		
		// Forward event binding to the reveal DOM element
		addEventListener: function( type, listener, useCapture ) {
			if( 'addEventListener' in window ) {
				( dom.slideDeck || document.querySelector(settings.containerID)).addEventListener( type, listener, useCapture );
			}
		},
		removeEventListener: function( type, listener, useCapture ) {
			if( 'removeEventListener' in window ) {
				( dom.slideDeck || document.querySelector(settings.containerID)).removeEventListener( type, listener, useCapture );
			}
		},	
	};
	
	return SlideShow;
}));