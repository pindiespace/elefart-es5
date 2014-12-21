/** 
 * @namespace elefart.screens['screen-join']
 * @fileoverview login system for joining multi-user elefart
 * @requres elefart.screens
 */
window.elefart.screens['screen-join'] = (function () {

	var com = elefart.dom,
	id = 'screen-join',
	panel,
	firstTime = true;

	/** 
	 * @method init join-screen
	 * @description initialize the multi-user version of the game 
	 */
	function init () {
		panel = document.getElementById(id);
		firstTime = false;
	}

	/** 
	 * @method run join-screen
	 * @description show the form allowing remote users to join the game.
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