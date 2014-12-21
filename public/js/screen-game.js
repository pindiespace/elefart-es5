/** 
 * @namespace elefart.screens['screen-game']
 * @fileoverview wrapper for game, which is created entirely in HTML5 canvas
 * @requres elefart.screens
 */
window.elefart.screens['screen-game'] = (function () {

	var dom = elefart.dom,
	factory = elefart.factory,
	id ='screen-game',
	panel,
	firstTime = true;

	/** 
	 * @method init game-screen
	 * @description initialize the game screen
	 */
	function init () {
		panel = document.getElementById(id);
		firstTime = false;
	}

	/** 
	 * @method run game-screen
	 * @description show the correct screen in the active game.
	 */
	function run () {
		if(firstTime) {
			init();
		}

		if(!panel) elefart.showError("game panel (from elefart.screens['screen-game']) didn't initialize");

		//set up game objects
		elefart.building.run();

		//show the screen
		dom.showScreenById(id);

		//start the game!
		elefart.display.run(panel);
		elefart.controller.run();

	}

	//returned object
	return {
		init:init,
		run:run
	};

})();