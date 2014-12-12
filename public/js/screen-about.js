/** 
 * @namespace
 * elefart-screens['screen-about']
 * online documentation for the game
 */
window.elefart.screens['screen-about'] = (function () {

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