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
			width: 960,
			height: 700,
			margin: 0,
			minScale: 0.2,
			maxScale: 1.5, 
			
			displayLength : 1000,
			containerID: '#slideDeck',
			slideClass: '.slide',
			autoStart: false
		},options);
	
		dom.slideDeck = document.querySelector(settings.containerID);
		dom.slides = document.querySelector(settings.slideClass);
	
		reload();
		resizeSlides();
		start();
	};
	
	function publishEvent(evntNme, args){
		var event = document.createEvent( 'HTMLEvents', 1, 2 );
		event.initEvent( evntNme, true, true );
		$.extend(event, args);
		dom.slideDeck.dispatchEvent( event )
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

	/* Dom Manuipulation */
	function resizeSlides(){
		if(dom.slideDeck){
			var size = ComputeSlideSize();
			var padding = 20;
			
			resizeSlideContents(size.width, size.height, padding)
			
			for(var i = 0; i < dom.slides.length; i++){
				var element = dom.slides[i];
				
				element.style.width = size.width + 'px';
				element.style.height = size.height + 'px';
				
				var slideDeckSize = ComputeSlideDeckSize();
				var scale = Math.min( slideDeckSize.width / size.width, slideDeckSize.height / size.height );
	
				// Respect max/min scale settings
				scale = Math.max( scale, settings.minScale );
				scale = Math.min( scale, settings.maxScale );
				
				// Don't apply any scaling styles if scale is 1
				if( scale === 1 ) {
					element.style.zoom = '';
					element.style.left = '';
					element.style.top = '';
					element.style.bottom = '';
					element.style.right = '';
					transformElement(element, '' );
				}
				else {
					// Prefer zooming in desktop Chrome so that content remains crisp
					if( /chrome/i.test( navigator.userAgent ) && typeof element.style.zoom !== 'undefined' ) {
						element.style.zoom = scale;
					}
					// Apply scale transform as a fallback
					else {
						element.style.left = '50%';
						element.style.top = '50%';
						element.style.bottom = 'auto';
						element.style.right = 'auto';
						transformElement( element, 'translate(-50%, -50%) scale('+ scale +')' );
					}
				}
			}
			

		}
	}
	
	function resizeSlideContents(width, height, padding){
		for(var i = 0; i < dom.slides.length; i++){
			var element = dom.slides[i];
			// Determine how much vertical space we can use
			var remainingHeight = getRemainingHeight( element, height );

			// Consider the aspect ratio of media elements
			if( /(img|video)/gi.test( element.nodeName ) ) {
				var nw = element.naturalWidth || element.videoWidth,
					nh = element.naturalHeight || element.videoHeight;

				var es = Math.min( width / nw, remainingHeight / nh );

				element.style.width = ( nw * es ) + 'px';
				element.style.height = ( nh * es ) + 'px';

			}
			else {
				element.style.width = width + 'px';
				element.style.height = remainingHeight + 'px';
			}
		}
	}
	
	function getRemainingHeight( element, height ) {
		height = height || 0;

		if( element ) {
			var newHeight, oldHeight = element.style.height;

			// Change the .stretch element height to 0 in order find the height of all
			// the other elements
			element.style.height = '0px';
			newHeight = height - element.parentNode.offsetHeight;

			// Restore the old height, just in case
			element.style.height = oldHeight + 'px';

			return newHeight;
		}

		return height;
	}
	
	function toArray(o) {
		return Array.prototype.slice.call(o);
	}
	
	
	function transformElement( element, transform ) {
		if(element)
		{
			element.style.WebkitTransform = transform;
			element.style.MozTransform = transform;
			element.style.msTransform = transform;
			element.style.OTransform = transform;
			element.style.transform = transform;	
		}
	}
		
	function ComputeSlideSize(width, height){
		var size = {
			width : settings.width,
			height : settings.height
		};
		
		// Slide width may be a percentage of available width
		if( typeof size.width === 'string' && /%$/.test( size.width ) ) {
			size.width = parseInt( size.width, 10 ) / 100 * size.presentationWidth;
		}

		// Slide height may be a percentage of available height
		if( typeof size.height === 'string' && /%$/.test( size.height ) ) {
			size.height = parseInt( size.height, 10 ) / 100 * size.presentationHeight;
		}
		
		return size; 		
	}
	
	function ComputeSlideDeckSize(width, height)
	{
		var size = {
			width : width || dom.slideDeck.offsetWidth,
			height : height || dom.slideDeck.offsetHeight
		};
		
		size.width  -= (size.height * settings.margin);
		size.height -= (size.height * settings.margin);
		
		return size; 
	}
	

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