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
	var _slideIdx = 0;
					
	var settings = {};
								
	//private functions
	function init(options){		
		settings = $.extend({
			displayLength : 3000,
			containerID: '#slideDeck',
			slideClass: '.slide'
		},options);
	
		dom.slideDeck = document.querySelector(settings.containerID);
		dom.slides = document.querySelector(settings.slideClass);
	
		reload();
		start();
	};
	
	function publishEvent(evntNme, args){
		var event = document.createEvent( 'HTMLEvents', 1, 2 );
		event.initEvent( evntNme, true, true );
		$.extend(event, args);
		dom.slideDeck.dispatchEvent( event );
	}
		
	function changeSlide(nextIdx){
		if(nextIdx < 0 || nextIdx > dom.slides.length)
		{
			return;
		}
		
		//change slide
		$(settings.slideClass +'.present').removeClass('present').addClass('past');
		$(settings.slideClass +':nth-child('+(nextIdx +1 )+')').removeClass('past').addClass('present');
		
		//figure out how long to display the slide					
		var len = $('.present').data('displaylength');
		
		if(!len){
			len = settings.displayLength;
		}
		
		//figure out how long to display it
		_timer = setTimeout(next, len);
	
									
		publishEvent('SlideChanged', {
						'OldIndex': _slideIdx,
						'NewIndex': nextIdx,
						'IsFirstSlide': (nextIdx == 0),
						'IsLastSlide' : (nextIdx == dom.slides.length -1)		
					});
		
		//store our current index	
		_slideIdx = nextIdx;
	};
	
	//public functions
	function stop(){
		clearInterval(_timer);
		publishEvent('SlideShowStopped', {'CurrentIndex': _slideIdx});
	};
	
	function start(){
		changeSlide(_slideIdx);
		publishEvent('SlideShowStarted', {'CurrentIndex': _slideIdx});
	};
	
	function previous() {
		var nxtIdx = _slideIdx - 1;
		
		if(nxtIdx < 0 ){
			nxtIdx = 0;
		}

		changeSlide(nxtIdx);
		stop();
	};
	
	function next(){
		var nxtIdx = _slideIdx +1;
		
		if(nxtIdx >= dom.slides.length){
			nxtIdx = 0;
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
		$(settings.containerID).find(settings.slideClass +':first-child')
				.removeClass('past')
				.addClass('present');
				
		dom.slides = document.querySelectorAll(settings.slideClass);		
		
		console.log(dom.slides.length)
		_slideIdx = 0;	
	};

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