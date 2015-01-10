/** 
 * @namespace
 * @fileoverview create the game object, which is created entirely in HTML5 canvas embedded 
 * in the default HTML file.
 * @requires elefart
 * @requires elefart.dom
 * @requires elefart.factory
 * @requires elefart.display
 * @version 0.1.1
 * @author Pete Markeiwicz
 * @license MIT
 */
window.elefart.screens['screen-game'] = (function () {

	var dom,
	factory,
	display,
	id ='screen-game',
	panel,
	firstTime = true;

	/** 
	 * @method init game-screen
	 * @description initialize the game screen
	 */
	function init () {
		dom = elefart.dom,
		factory = elefart.factory,
		display = elefart.display;
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


		//show the screen
		dom.showScreenById(id);

		//start the game!
		elefart.display.run(panel); //have to determine bounding Rect for elefart.building
		elefart.building.run(); //elefart.building calls display for dimensions
		elefart.display.drawBackground();
		elefart.controller.run(); //don't activate until prelim draw
	}

	//returned object
	return {
		init:init,
		run:run
	};

})();