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

	var TYPES = {
		ELEVATOR:"ELEVATOR",
		ELEVATOR_DOORS:"ELEVATOR_DOORS",
		ELEVATOR_SHAFT:"ELEVATOR_SHAFT",
		BUILDING_FLOOR:"BUILDING_FLOOR",
		BUILDING:"BUILDING",
		SUN:"SUN",
		SKY:"SKY",
		WORLD:"WORLD",
		PERSON:"PERSON",
		GOODIE:"GOODIE",
		GAS:"GAS"
	};

	/* 
	 * Using Decorator pattern to augment 
	 * basic 2D screen objects from elefart.screens. 
	 * A publish-subscribe pattern links the game objects 
	 * instead of custom events.
	 */

	/* 
	 * ============================
	 * ELEVATORS
	 * ============================
	 */

	/** 
	 * @constructor Elevator
	 * @classdesc an Elevator consists of a single rounded Rect
	 * representing the elevator, plush some line arcs on top forming 
	 * the attachment in the shaft. 
	 * - parent: ElevatorShaft
	 * - grandparent: Building
	 * - chidren: ElevatorDoors, Person(s)
	 * @param {ScreenObject} parent a parent ScreenObject (can be null)
	 * @param {Boolean} display if true, add to displayList
	 * @returns {Elevator} if ok, return the Elevator, else false
	 */
	function Elevator (parent, display) {
		var elev = false,
		border = 4;
		//elevator should start in its parent (ElevatorShaft)
		if(parent === TYPES.ELEVATOR_SHAFT) {

			elev = factory.ScreenRect(
				parent.x, parent.bottom - parent.width, //square 
				parent.width, parent.width, 
				border,                //stroke width
				display.COLORS.BLACK,  //stroke color
				display.COLORS.WHITE,  //fill color
				display.LAYERS.ELEBACK //bottom layer
			);
			if(elev) {
				elev.buildingType = TYPES.ELEVATOR;
				//visual features
				if(parent.buildingType === TYPES.ELEVATOR_SHAFT) {
					elev.setParent(parent);
					elev.setRectBorderRadius(border);

					//TODO: draw top of elevator, creating Line children

					//add to elefart.screens display list
					if(display) {
						display.addToDisplayList(elev, display.LAYERS.ELEBACK);
					}
				}
			}

		}
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
	function ElevatorDoors (parent) {
		if(parent && parent.buildingType === TYPES.BUILDING_FLOOR) {
				var eDoors = factory.ScreenRect(

			);
		}
		else {
			elefart.showError("Tried to create ElevatorDoors without a parent");
		}

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
		var r = display.getGameRect();
		if(r) {
			var w = factory.ScreenRect(
			0,
			0,
			r.width,
			r.height,
			0, 
			display.COLORS.WHITE, 
			display.COLORS.BLACK,
			display.LAYERS.WORLD
			);
			if(w) {
				elev.setRectBorderRadius(border);
				elev.setOpacity(0.0); //world is invisible
			}
		
		}
		return false;
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