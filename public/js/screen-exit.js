/** 
 * @namespace
 * elefart.screens['screen-exit']
 * quit screen for the game
 */
window.elefart.screens['screen-exit'] = (function () {

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