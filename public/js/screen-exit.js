/** 
 * @namespace elefart.screens['screen-exit']
 * @fileoverview quit screen for the game
 * @requrires elefart.screens
 */
window.elefart.screens['screen-exit'] = (function () {

	var dom = elefart.dom,
	id = 'screen-exit',
	panel,
	firstTime = true;

	/** 
	 * @method init exit-screen
	 * @description initialize the exit dialog for the game.
	 */
	function init () {
		panel = document.getElementById(id);
		firstTime = false;
	}

	/** 
	 * @method run exit-screen
	 * @description show the exit dialog for the game.
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