/** 
 * @namespace 
 * @fileoverview elefart.building (Model) game objects (building, shafts, elevators, users, goodies, gas)
 * @version 0.1.1
 * @author Pete Markeiwicz
 * @license MIT
 */
window.elefart.building = (function () {

	var dashboard,
	display,
	controller, 
	firstTime = true;

/* 
 * ============================
 * INIT AND RUN
 * ============================
 */

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