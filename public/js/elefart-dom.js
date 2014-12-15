/** 
 * @namespace 
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

	/** 
	 * @constructor
	 * use to partially polyfill browsers without a .classList 
	 * We do NOT try to add .classList to everything, instead 
	 * we add it on demand to specific DOM elements
	 * @link https://developer.mozilla.org/en-US/docs/Web/API/element.classList
	 * @link https://github.com/toddmotto/apollo
	 * @link http://toddmotto.com/creating-jquery-style-functions-in-javascript-hasclass-addclass-removeclass-toggleclass/
	 */
	function ClassList (elem) {

		this.el = elem;

		/** 
		 * @method contains
		 */
		this.contains = function contains(clsName) {
			var regex = new RegExp("(^|\\s)" + clsName + "(\\s|$)");
			return regex.test(this.el.className);
		}

		/** 
		 * @method add
		 */
		this.add = function add(clsName) {
			if (!this.contains(this.el, clsName)) {
				this.el.className += " " + clsName.trim();
			}
		}

		/** 
		 * @method remove
		 */
		this.remove = function remove(clsName) {
			var regex = new RegExp("(^|\\s)" + clsName + "(\\s|$)");
			if(this.el.className) {
				this.el.className = this.el.className.replace(regex, "").trim();
			}

		}

		/** 
		 * @method toggle
		 * toggle a class as present or absent in the DOM element
		 */
		this.toggle = function toggle(clsName) {
			if(this.contains(clsName)) this.remove(clsName); else this.add(clsName);
		}

	}; //end of classList constructor function

	/** 
	 * @method addClassList
	 * add .classList if it is not present to specified DOM elements
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
	 * queryselector wrapper
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

	function getByClassName(sel, parent) {
		if(sel.charAt(0) !== ".") sel = "." + sel;
		return Sizzle.matches(sel, parent);
	}

	/** 
	 * @method getElement
	 * return an element, either itself or by its id string
	 * @param {DOMElement|String} el either a DOM element or an id string
	 * @returns {DOMElement|false} if found, return element, else false
	 */
	function getElement(elm) {
		if(typeof elm == "object") {
			console.log("returning an object")
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
	 * cross-browser addEventListener
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
	 */
	function addEvent (elm, evt, callback) {
		if (elm.addEventListener) { // Modern
			elm.addEventListener(evt, function (e) {
				callback(e);
			}, false);
		}
		else if (document.attachEvent) { // Internet Explorer
			elm.attachEvent('on' + evt, function(e) {
				var e = e || win.event;
				e.target = e.srcElement; //normalize event
				e.preventDefault = e.preventDefault || function() { e.returnValue = false;}
				e.stopPropagation = e.stopPropagation || function() { e.cancelBubble = true;}
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
	 * remove an event
	 */
	function removeEvent (elm, evt, callback, useCapture) {
		if(doc.removeEventListener) {
			elm.removeEventListener(evt, callback, !!useCapture);
			return true;
		}
		else if(document.attachEvent) {
			elm.detachEvent("on" + evt, callback);
      		return true;
		}
		else {
			//can't be removed with extra code in addEvent
		}

	}

	/** 
	 * @method bind
	 * bind an event to a DOM element
	 * @param {DOMObject|String} el a DOM object, or an id for an element
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
		}
		if(elm.length) {
			for(var i = 0; i < elm.length; i++) {
				addEvent(elm[i], evt, callback);
				/*
				elm[i].addEventListener(evt, function (e) {
					e.preventDefault();
					callback(e);
				}, false);
				*/
			}
		}
		else {
			addEvent(elm, evt, callback);
			/*
			elm.addEventListener(evt, function (e) {
				e.preventDefault();
				callback(e);
			}, false);
			*/
		}
	}

	/** 
	 * @method showScreenById()
	 * show application screens
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

/* 
 * ============================
 * INIT AND RUN
 * ============================
 */

	function init () {

	}

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
		showScreenById:showScreenById,
		init:init,
		run:run
	};

})();