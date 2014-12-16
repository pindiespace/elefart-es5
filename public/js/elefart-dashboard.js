/** 
 * @namespace
 * elefart.dashboard (Model)
 * definitions for dashboard controls and HUD screens
 */
window.elefart.dashboard = (function () {

	var building,
	display,
	controller,
	firstTime = true;

	/** 
	 * @method init
	 */
	function init () {
		board = elefart.building,
		display = elefart.display,
		controller = elefart.controller;
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