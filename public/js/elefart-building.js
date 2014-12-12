/** 
 * @namespace
 * elefart.building (Model)
 * game objects (building, shafts, elevators, users, goodies, gas)
 */
window.elefart.building = (function () {

	var dashboard,
	display,
	controller, 
	firstTime = true;

	/** 
	 * @method init
	 */
	function init () {
		dashboard = elefart.dashboard,
		display = elefart.display,
		controller = elefart.controller;
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