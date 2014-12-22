/** 
 * @namespace elefart.building
 * @fileoverview elefart.building (Model) creates the game objects (building, shafts, elevators, 
 * users, goodies, gas) used during gameplay.
 * @requires elefart
 * @requires elefart.factory
 * @requires elefart.dashboard
 * @requires elefart.display
 * @requires elefart.controller
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

	/** 
	 * @constructor Elevator
	 * @classdesc an Elevator consists of a single rounded Rect
	 * representing the elevator, plush some line arcs on top forming 
	 * the attachment in the shaft
	 * - parent: elevator shaft
	 * - grandparent: building
	 * - chidren: elevator doors, people
	 */
	function Elevator () {
		var elev = {
			disp:factory.ScreenRect(
				10, 10, 
				100, 100, 
				4, 
				display.COLORS.BLACK, 
				display.COLORS.WHITE, 
				display.LAYERS.ELEBACK
			)
		};
		parts.elevators.push(elev);
		elev.disp.setStroke(4, 'rgb(25,50,100');
		elev.disp.setFill('rgb(200,100,100');
			return elev;
	}

	/* 
	 * ============================
	 * ELEVATOR DOORS
	 * ============================
	 */

	/** 
	 * @constructor ElevatorDoors
	 * @classdesc elevator doors consist of an enclosing rect, with 
	 * two smaller Rects functioning as the sliding doors
	 */
	function ElevatorDoors () {

	}

	/* 
	 * ============================
	 * ELEVATOR SHAFTS
	 * ============================
 	 */

 	/**
 	 * @constructor ElevatorShaft
 	 * @classdesc the elevator is a long Rect column running vertically 
 	 * in the building.
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
	 * @method init building
	 * @description initialize the building used in the game.
	 */
	function init () {
		factory = elefart.factory,
		dashboard = elefart.dashboard,
		display = elefart.display,
		controller = elefart.controller;
		firstTime = false;
	}


	/** 
	 * @method run building
	 * @description activate the building for display and updating in the game.
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