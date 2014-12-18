/** 
 * @namespace 
 * @fileoverview elefart.building (Model) game objects (building, shafts, elevators, users, goodies, gas)
 * @version 0.1.1
 * @author Pete Markeiwicz
 * @license MIT
 */
window.elefart.building = (function () {

	var factory,
	dashboard,
	display,
	controller, 
	parts = {
		elevators:[],
		shafts:[],
		floors:[],
		goodies:[],
		people:[]
	},
	firstTime = true;

	/* 
	 * ============================
	 * ELEVATORS
	 * ============================
	 */

	function Elevator () {
		console.log("FACTORYYYYYYYYYYYY:"+elefart.factory)
		var elev = {
			disp:factory.ScreenRect(
				10, 10, 
				100, 100, 
				4, 
				display.DARK_GREY, display.LIGHT_GREY, 
				factory.setRectPadding(elev, factory.Rect(0,0,0,0)), 
				0
			)
		};
		parts.elevators.push(elev);
		elev.setStroke(rect, 4, 'rgb(25,50,100');
		elev.setFill(rect,'rgb(200,100,100');
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
		factory = elefart.factory,
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

		//test objects
		console.log('in building, making test objects');
		Elevator();

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
		parts:parts,
		init:init,
		run:run
	};

})();