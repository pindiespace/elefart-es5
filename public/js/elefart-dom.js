/** 
 * @namespace
 * elefart.dom
 * DOM manipulation
 */
window.elefart.dom = (function () {

	var firstTime = true;

	function init () {

	}


	function run () {
		if(firstTime()) {
			init();
		}
	}

	return {
		init:init,
		run:run
	};

})();