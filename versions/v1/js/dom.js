/** @namespace */
elefart.dom = (function() {

	//BOOK Listing 2-9, pp. 31-32
	function $(path, parent) {
		parent = parent || document;
		return parent.querySelectorAll(path);
	}

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
	 * @method bind
	 * BOOK: Listing 3-9, p. 53
	 */
	function bind(element, event, handler) {
		if (typeof element == "string") {
			element = $(element)[0];
		}
		element.addEventListener(event, handler, false);
	}

	return {
		$ : $,
		hasClass : hasClass, //pp. 31-32
		addClass : addClass,
		removeClass : removeClass,
		bind : bind //p. 53
	};
})();
