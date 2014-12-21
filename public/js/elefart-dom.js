/** 
 * @namespace elefart.dom
 * @fileoverview JavaScript DOM manipulation (classes, ids, event binding)
 * @version 0.1.1
 * @author Pete Markeiwicz
 * @license MIT
 */
window.elefart.dom = (function () {

	var firstTime = true;

/** 
 * ============================
 * POLYFILLS
 * @link https://github.com/inexorabletash/polyfill/blob/master/polyfill.js#L652
 * ============================
 */
	if (!String.prototype.trim) {
		(function() {
			// Make sure we trim BOM and NBSP
			var rtrim = /^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g;
			String.prototype.trim = function() {
				return this.replace(rtrim, '');
			};
		})();
	}

	//IE8 and other old browsers may not have this
	if (!Array.prototype.indexOf) {
		(function () {
			Array.prototype.indexOf = function(elt /*, from*/) {
    			var len = this.length >>> 0;
				var from = Number(arguments[1]) || 0;
				from = (from < 0) ? Math.ceil(from) : Math.floor(from);
				if (from < 0) from += len;
    			for (; from < len; from++) {
					if (from in this && this[from] === elt)
						return from;
				}
				return -1;
			};
		})();
	}

	/** 
	 * @constructor ClassList
	 * @classdesc ClassList polyfill. Use to partially polyfill browsers without a .classList 
	 * We do NOT try to add .classList to everything, instead 
	 * we add it on demand to specific DOM elements
	 * @link https://developer.mozilla.org/en-US/docs/Web/API/element.classList
	 * @link https://github.com/toddmotto/apollo
	 * @link http://toddmotto.com/creating-jquery-style-functions-in-javascript-hasclass-addclass-removeclass-toggleclass/
	 */
	function ClassList (elm) {

		this.elm = elm;

		/** 
		 * @method contains
		 * @description check if a DOMElement contains a class attribute
		 * @param {String} clsName the name of the class to check for
		 */
		this.contains = function contains(clsName) {
			var regex = new RegExp("(^|\\s)" + clsName + "(\\s|$)");
			return regex.test(this.elm.className);
		}

		/** 
		 * @method add
		 * @description add a class to a DOM element
		 * @param {String} clsName the name of the class to add to a DOMElemnt
		 */
		this.add = function add(clsName) {
			if (!this.contains(this.elm, clsName)) {
				this.elm.className += " " + clsName.trim();
			}
		}

		/** 
		 * @method remove
		 * @description remove a class
		 * @param {String} clsName the class to remove from a DOMElement
		 */
		this.remove = function remove(clsName) {
			var regex = new RegExp("(^|\\s)" + clsName + "(\\s|$)");
			if(this.elm.className) {
				this.elm.className = this.elm.className.replace(regex, "").trim();
			}

		}

		/** 
		 * @method toggle
		 * @description toggle a class as present or absent in the DOMElement
		 * @param {String} clsName the class name to add to or remove from a DOMElement
		 */
		this.toggle = function toggle(clsName) {
			if(this.contains(clsName)) this.remove(clsName); else this.add(clsName);
		}

	}; //end of classList constructor function

	/** 
	 * @method addClassList
	 * @description add .classList if it is not present to specified DOM elements
	 */
	function addClassList (elements) {
		for(var i in elements) {
			var ele = elements[i];
			if(ele.nodeType && ele.nodeType === 1 && !ele.classList) {
				ele.classList = new ClassList(ele);
			}
		}
	}

	/** 
	 * @method $
	 * @description queryselector wrapper
	 * BOOK Listing 2-9, pp. 31-32
	 * @param {String|Parent} either a string selecting a DOM element, or the 
	 * DOM element itself
	 * @param {DOMElement} parent (optional) if present, the starting point for 
	 * running querySelector(). Otherwise, document.querySelector() is used
	 * @return {Array} the recovered element
	 */
	function $(sel, parent) {
		parent = parent || document;
		return Sizzle(sel);
		//return parent.querySelectorAll(path); //path is a CSS selector
	}

	/** 
	 * @method getByClassName
	 * @description wrapper for Sizzle providing equivalent functionality to 
	 * getElementsByClassName for non-supporting browsers
	 */
	function getByClassName(sel, parent) {
		if(sel.charAt(0) !== ".") sel = "." + sel;
		return Sizzle.matches(sel, parent);
	}

	/** 
	 * @method getElement
	 * @description return an element, either itself or by its id string
	 * @param {DOMElement|String} el either a DOM element or an id="xxx" string
	 * @returns {DOMElement|false} if found, return element, else false
	 */
	function getElement(elm) {
		if(typeof elm == "object") {
			return elm;
		}
		else if(typeof elm == "string") {
			if(elm.charAt(0) == "#") elm = elm.substring(1); //strip "#"
			return document.getElementById(elm);
		}
		else {
			elefart.showError("invalid element, type:" + typeof elm, true);
		}
		return null;
	}


	/** 
	 * @method addEvent
	 * @description cross-browser addEventListener
	 * implemented here instead of polyfill 
	 * @link https://gist.github.com/eduardocereto/955642
	 *
	 * NOTE: the link above shows a much better method for traditional 
	 * browsers, in particular removing events so they don't accumulate 
	 * in memory. We didn't use it because old browsers won't run this app, 
	 * just receive a message that they need to suppport HTML5 canvas to run 
	 * the game. For general web apps, the gist solution is superior to below.
	 * 
	 * @param {DOMElement} elm the HTML DOM element to bind event to
	 * @param {EventType} evt the type of event (a String)
	 * @param {Function} callback the callback function
	 * @param {Boolean} useCapture (if true, capture in capturing phase (default 
	 * is false, use bubbling phase)
	 */
	function addEvent (elm, evt, callback, useCapture) {
		if (elm.addEventListener) { // Modern
			elm.addEventListener(evt, function (e) {
				callback(e);
			}, false);
		}
		else if (document.attachEvent) { // Internet Explorer
			elm.attachEvent('on' + evt, function(e) {
				var e = e || win.event;
				//normalize event object
				e.target = e.srcElement;
				e.preventDefault = e.preventDefault || function () { e.returnValue = false;}
				e.stopPropagation = e.stopPropagation || function () { e.cancelBubble = true;}
				callback.call(elm, e);
			});
		}
		else { // others
			 var type = 'on' + evt;
			if(typeof elm[evt] === 'function'){
				// Object already has a function on traditional
				// Let's wrap it with our own function inside another function
				fnc = (function(f1,f2) {
					return function() {
						f1.apply(this,arguments);
						f2.apply(this,arguments);
					}
				})(obj[evt], fnc);
			}
			obj[evt] = fnc;
			return true; 
		}
	}

	/** 
	 * @method removeEvent
	 * @description remove an event
	 * @param {DOMElement} elm the HTML DOM element to remove event from
	 * @param {EventType} evt the type of event (a String)
	 * @param {Function} callback the callback function
	 * @param {Boolean} useCapture (if true, capture in capturing phase (default 
	 * is false, use bubbling phase)
	 */
	function removeEvent (elm, evt, callback, useCapture) {
		if(useCapture === undefined) useCapture = false;
		if(doc.removeEventListener) {
			elm.removeEventListener(evt, callback, !!useCapture);
			return true;
		}
		else if(document.attachEvent) {
			elm.detachEvent("on" + evt, callback);
			return true;
		}
		else {
			//can't be removed without extra code in addEvent
			//@link https://gist.github.com/eduardocereto/955642
		}

	}

	/** 
	 * @method bind
	 * @description bind an event to a DOM element
	 * @param {DOMElement|String} elm a DOM object, or an id for an element
	 * @param {EventType} evt type of event
	 * @param {Function} callback callback to execute when event raised
	 */
	function bind(elm, evt, callback) {

		//if we get a string, do a query. otherwise, just use the DOM Element
		if(typeof elm === "string") {
			elm = $(elm);
		}
		if(!elm) {
			elefart.showError("tried to bind invalid element");
			return;
		}
		//elm may be an array of DOMElements in some cases
		if(elm.length) {
			for(var i = 0; i < elm.length; i++) {
				addEvent(elm[i], evt, callback);
			}
		}
		else {
			addEvent(elm, evt, callback);
		}
	}

	/** 
	 * @method remove
	 * @description remove event listener or listeners
	 * @param {DOMElement|String} elm a DOM object, or an id for an element
	 * @param {EventType} evt type of event
	 * @param {Function} callback callback to execute when event raised
	 */
	function remove(elm, evt, callback) {
		removeEvent(elm, evt, callback, false);
	}

	/** 
	 * @method showScreenById
	 * @description show application screens, assumes HTML has a class="screen" which 
	 * defines the main screens of the application
	 * @param {DOMElement|String} elm a DOM element, or its id string
	 * @returns {DOMElement|false} if changed, return the visible screen, else false
	 */
	function showScreenById(elm) {
		elm = getElement(elm);
		if(elm) {
			var screens = $(".screen");
			for(var i = 0; i < screens.length; i++) {
				if(screens[i] === elm) {
					screens[i].classList.add("active");
				}
				else {
					screens[i].classList.remove("active");
				}
			}
		}
		else {
			elefart.showError("couldn't find screen:" + elm, true);
		}
	}


	/** 
	 * @method isElementVisible
	 * @description confirm an element is visible onscreen
	 * @link http://stackoverflow.com/questions/123999/how-to-tell-if-a-dom-element-is-visible-in-the-current-viewport
	 * @param {DOMElement} elm the DOM element we are testing
	 * @returns {Boolean} if visible, return true, else false
	 */
	function isElementInViewport (elm) {

		var rect = elm.getBoundingClientRect();
    	var windowHeight = (window.innerHeight || document.documentElement.clientHeight);
    	var windowWidth = (window.innerWidth || document.documentElement.clientWidth);

    	return (
           (rect.left >= 0) && (rect.top >= 0) && 
           ((rect.left + rect.width) <= windowWidth) && 
           ((rect.top + rect.height) <= windowHeight));
	}

	/* 
	 * ============================
	 * INIT AND RUN
	 * ============================
	 */

	/** 
 	 * @method init dom
 	 * @description initialize the DOM interface for the game.
 	 */
	function init () {
		firstTime = false;
	}

	/** 
	 * @method run dom
	 * @description activate the DOM interface for the game.
	 */
	function run () {
		if(firstTime()) {
			init();
		}
	}

	return {
		addClassList:addClassList,
		$:$,
		getByClassName:getByClassName,
		bind:bind,
		remove:remove,
		showScreenById:showScreenById,
		init:init,
		run:run
	};

})();