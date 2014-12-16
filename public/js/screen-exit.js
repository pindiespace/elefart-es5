/** 
 * @namespace
 * elefart.screens['screen-exit']
 * quit screen for the game
 */
window.elefart.screens['screen-exit'] = (function () {

	var dom = elefart.dom,
	id = 'screen-exit',
	panel,
	firstTime = true;

	/** 
	 * @method init
	 */
	function init () {
		panel = document.getElementById(id);
		firstTime = false;
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