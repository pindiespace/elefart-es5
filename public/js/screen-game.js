/** 
 * @namespace
 * elefart.screens['screen-game']
 * wrapper for game (entirely in HTML5 canvas)
 */
window.elefart.screens['screen-game'] = (function () {

	var dom = elefart.dom,
	factory = elefart.factory,
	id ='screen-game',
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