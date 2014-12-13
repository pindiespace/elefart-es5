/** 
 * @namespace
 * elefart-screens['screen-about']
 * online documentation for the game
 */
window.elefart.screens['screen-about'] = (function () {

	var dom = elefart.dom,
	id = 'screen-about',
	panel,
	firstTime = true;

	/** 
	 * @method init
	 */
	function init () {
		panel = document.getElementById(id);
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