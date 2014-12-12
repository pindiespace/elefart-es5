/** 
 * @namespace
 * elefart.screens['screen-game']
 * wrapper for game (entirely in HTML5 canvas)
 */
window.elefart.screens['screen-game'] = (function () {

	var dom = elefart.dom,
	firstTime = true;

	/** 
	 * @method init
	 */
	function init () {

	}

	/** 
	 * @method run
	 */
	function run () {
		if(firstTime) {
			init();
		}
	}

	//returned object
	return {
		init:init,
		run:run
	};

})();