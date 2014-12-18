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
	 * ELEVATORS
	 * ============================
	 */

	function Elevator () {

	}

	/* 
	 * ============================
	 * ELEVATOR DOORS
	 * ============================
	 */

	function ElevatorDoors () {

	}

	/* 
	 * ============================
	 * ELEVATOR SHAFTS
	 * ============================
 	 */

 	function ElevatorShaft () {

 	}

	/* 
	 * ============================
	 * BUILDING FLOORS
	 * ============================
	 */

	function BuildingFloor () {

	}

	/* 
	 * ============================
	 * BUILDING EXERIORS
	 * ============================
	 */

	function Building () {

	}

	/* 
	 * ============================
	 * PEOPLE
	 * ============================
	 */

	function Person () {

	}

	/* 
	 * ============================
	 * GAS
	 * ============================
	 */

	function Gas () {

	}

	/* 
	 * ============================
	 * GOODIES
	 * ============================
	 */

	function Goodie () {

	}

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
		Elevator:Elevator,
		ElevatorDoors:ElevatorDoors,
		ElevatorShaft:ElevatorShaft,
		BuildingFloor:BuildingFloor,
		Building:Building,
		Goodie:Goodie,
		Person:Person,
		init:init,
		run:run
	};

})();