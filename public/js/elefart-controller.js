/** 
 * @namespace
 * window.elefart.controller (Controller)
 * trap user input, also route in-game events to
 * Model (elefart.building) or Views (elefart.display, elefart.dashboard)
 */
window.elefart.controller = (function () {

	var building,
	display,
	dashboard, 
	firstTime = true;

	/** 
	 * @method init
	 */
	function init () {
		board = elefart.building,
		display = elefart.display,
		dashboard = elefart.dashboard;
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