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

		var el = elem;

		/** 
		 * @method contains
		 */
		function contains(el, clsName) {
			var regex = new RegExp("(^|\\s)" + clsName + "(\\s|$)");
			return regex.test(el.className);
		}

		/** 
		 * @method add
		 */
		function add(el, clsName) {
			if (!contains(el, clsName)) {
				el.className += " " + clsName.trim();
			}
		}

		/** 
		 * @method remove
		 */
		function remove(el, clsName) {
			var regex = new RegExp("(^|\\s)" + clsName + "(\\s|$)");
			el.className = el.className.replace(regex, "").trim();
		}

		/** 
		 * @method toggle
		 * toggle a class as present or absent in the DOM element
		 */
		function toggle(el, clsName) {
			if(contains(clsName)) remove(clsName); else add(clsName);
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
	function $(path, parent) {
		parent = parent || document;
		if(typeof path !== "string") {
			return [path]; //path is a DOM element
		}
		return Sizzle(path);
		//return parent.querySelectorAll(path); //path is a CSS selector
	}

	/** 
	 * @method getElement
	 */
	function getElement(el) {
		if(typeof el === "object") {
			return el;
		}
		return $(el); //use as querySelector
	}

	/** 
	 * @method bind
	 */
	function bind(el, evt, callback) {
		el = $(el)[0];
		el.addEventListener(evt, function (e) {
			e.preventDefault();
			callback(e);
		}, false);
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
		$:$,
		bind:bind,
		init:init,
		run:run
	};

})();