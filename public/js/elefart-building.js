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
	world, //the top-level object 
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
	 * - parent: ElevatorShaft
	 * - grandparent: Building
	 * - chidren: ElevatorDoors, Person(s)
	 */
	function Elevator () {
		var elev = {
			queue: [],
			disp:factory.ScreenRect(
				10, 10, 
				100, 100, 
				4, 
				display.COLORS.BLACK, 
				display.COLORS.WHITE, 
				display.LAYERS.ELEBACK
			)
		};

		//visual features
		elev.disp.setStroke(4, 'rgb(25,50,100');
		elev.disp.setFill('rgb(200,100,100');
		elev.disp.setLayer(display.LAYERS.ELEBACK);

		//add to elefart.screens display list
		
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
	 * two smaller Rects functioning as the sliding doors. They are 
	 * part of the Building, rather than the elevator
	 * - parent: BuildingFloor
	 * - grandparent: Building
	 * - children: none
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
 	 * - parent: Building
 	 * - grandparent: World
 	 * - children: Elevator(s)
 	 */
 	function ElevatorShaft () {

 	}

	/* 
	 * ============================
	 * BUILDING FLOORS
	 * ============================
	 */

	/** 
	 * @constructor BuildingFloor
	 * @classdesc the floors passed by the Elevator. Contains Goodies (until they are 
	 * picked up by the Person) and any controls that indicate Elevator passage (e.g. 
	 * a ring when an Elevator arrives at a floor)
	 * - parent: Building
	 * - grandparent: World
	 * - children: ElevatorDoors, Goodies
	 */
	function BuildingFloor () {

	}

	/* 
	 * ============================
	 * BUILDING EXERIORS
	 * ============================
	 */

	/** 
	 * @constructor Building
	 * @classdesc the building where the action happens
	 * - parent: World
	 * - grandparent: none
	 * - children: BuildingFloor(s)
	 */
	function Building () {

	}

	/** 
	 * @constructor Sun
	 * @classdesc the sun over the Building
	 * - parent: World
	 * - grandparent: none
	 * - children: none
	 */
	function Sun () {

	}

	/** 
	 * @constructor Sky
	 * @classdesc the sky over the Building
	 * - parent: World
	 * - grandparent: none
	 * - children: none
	 */
	function Sky () {

	}

	/** 
	 * @constructor World
	 * @classdesc the top-level environment
	 * - parent: none
	 * - grandparent: none
	 * - children: Building
	 */
	function World () {

	}

	/* 
	 * ============================
	 * GAS
	 * ============================
	 */

	/** 
	 * @constructor Gas
	 * @classdesc the gas used as a weapon in the game
	 * - parent: Person(s) or Elevators (can transfer)
	 * - grandparent: ElevatorFloor or Building
	 * - children: none
	 */
	function Gas () {

	}

	/* 
	 * ============================
	 * GOODIES
	 * ============================
	 */

	/** 
	 * @constructor Goodie
	 * @classdesc an item which helps a Person withstand a Gas attack
	 * - parent: BuildingFloor or Person
	 * - grandparent: Building or Elevator
	 * - children: none
	 */
	function Goodie () {

	}

	/* 
	 * ============================
	 * PEOPLE
	 * ============================
	 */

	/** 
	 * @constructor Person
	 * @classdesc individual who rides Elevators
	 * - parent: Elevator or BuildingFloor
	 * - grandparent: ElevatorShaft or Building
	 * - children: Gas, Goodie(s)
	 */
	function Person () {

	}

	/* 
	 * ============================
	 * BUILDING ASSEMBLY
	 * ============================
	 */

	/** 
	 * @method buildWorld
	 * @description build the world structure, adding visible items to the 
	 * elefart.screens displayList
	 */
	function buildWorld () {

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
		Elevator:Elevator, //constructorss
		ElevatorDoors:ElevatorDoors,
		ElevatorShaft:ElevatorShaft,
		BuildingFloor:BuildingFloor,
		Building:Building,
		Sun:Sun,
		Sky:Sky,
		Goodie:Goodie,
		Person:Person,
		world:world, //the hierarchical world object
		init:init,
		run:run
	};

})();