/** @namespace */
elefart.dom = (function() {
	
	function hasClass(el, clsName) {
		var regex = new RegExp("(^|\\s)" + clsName + "(\\s|$)");
		return regex.test(el.className);
	}

	function addClass(el, clsName) {
		if (!hasClass(el, clsName)) {
			el.className += " " + clsName;
		}
	}

	function removeClass(el, clsName) {
		var regex = new RegExp("(^|\\s)" + clsName + "(\\s|$)");
		el.className = el.className.replace(regex, " ");
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
		return parent.querySelectorAll(path); //path is a CSS selector
	}
	/** 
	 * @method bind
	 * BOOK: Listing 3-9, p. 53
	 */
	function bind(el, evt, callback) {
		el = $(el)[0];
		el.addEventListener(evt, function (e) {
			e.preventDefault();			
			callback(e);
		}, false);
	}

	return {
		$ : $,
		hasClass : hasClass, //pp. 31-32
		addClass : addClass,
		removeClass : removeClass,
		bind : bind //p. 53
	};
})();

//console.log("typeof elefart.dom:"+elefart.dom);