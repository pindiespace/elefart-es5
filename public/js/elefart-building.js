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

	/**
	 * @readonly
	 * @enum {String}
	 * @typedef {TYPES}
	 * @description Enum for types of objects in the Building in the game
	 */
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

	var GAS_TYPES = {

	};

	var GOODIE_TYPES = {

	};

	/** 
	 * @readony
	 * @typedef (DIMENSIONS) 
	 * @description list of relative and absolute dimensions for 
	 * building objects. If relative, sizes are relative to the 
	 * size of the World object. Dimensions are in a Rect-like 
	 * format, but are NOT an elefart.factory.ScreenRect (more like 
	 * elefart.factory.Padding object. 
	 */
	var DIMENSIONS = {};
	DIMENSIONS[TYPES.SUN] = {
		top:0.05,
		left:0.85,
		bottom:0.08,
		right:0.88
	},
	DIMENSIONS[TYPES.SKY] = {
		top:0.0,
		left:0.0,
		bottom:0.1,
		right:1.0
	},
	DIMENSIONS[TYPES.BUILDING] = {
		top:0.1,
		left:0.0,
		bottom:0.8,
		right:1.0,
		wallWidth:0.05 //width of walls
	},
	DIMENSIONS[TYPES.BUILDING_FLOOR] = {
		floorWidth:1.0, //width of entire floor
		floorHeight:0.1, //height of entire floor
		floorBaseHeight:0.02 //height of horizontal band
	},
	DIMENSIONS[TYPES.ELEVATOR_SHAFT] = {
		top:0.1,
		bottom:0.8,
		shaftWidth:0.2
	},
	DIMENSIONS[TYPES.ELEVATOR] = {
		elevatorWidth:0.1,
		elevatorHeight:0.1
	},
	DIMENSIONS[TYPES.CONTROL_PANEL] = {
		top: 0.8,
		left:0.0,
		bottom:1.0,
		right:1.0
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
	 * @returns {Elevator|false} an Elevator object, or false
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
		if(!elev) {
			elefart.showError("failed to create Elevator");
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
	 * @returns {ElevatorDoors|false} an ElevatorDoors object, or false
	 */
	function ElevatorDoors (parent) {
		if(parent && parent.buildingType === TYPES.BUILDING_FLOOR) {
				var eDoors = factory.ScreenRect(

			);
		}
		else {
			elefart.showError("Tried to create ElevatorDoors without a parent");
		}
		//TODO: ElevatorDoors
		return false;
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
 	 * @returns {ElevatorShaft|false} an ElevatorShaft object, or false
 	 */
 	function ElevatorShaft () {
 		//TODO: ElevatorShaft
 		return false;
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
	 * @param {Building} building the parent building object
	 * @param {Number} floorNum the floor number
	 * @returns {BuildingFloor|false} a BuildingFloor object, or false
	 */
	function BuildingFloor (building, floorNum, numFloors) {
		if(building) {
			var t = DIMENSIONS.BUILDING.top + (floorNum * DIMENSIONS.BUILDING_FLOOR.floorHeight);
			var l = building.width + DIMENSIONS.BUILDING.wallWidth;
			var w = building.width - (2*DIMENSIONS.BUILDING.wallWidth);
			var h = DIMENSIONS.BUILDING_FLOOR.floorHeight * building.height;
			var floor = factory.ScreenRect(
				l,
				t,
				2,
				h,
				0,
				display.COLORS.BROWN,
				display.COLORS.YELLOW, //TODO: NOTE: THIS SHOULD BE AN IMAGE TEXTURE
				display.LAYERS.BUILDING
				);
			if(floor) {
				floor.name = TYPES.BUILDING_FLOOR;
				floor.floorNum = (numFloors - floorNum);
				t = DIMENSIONS.BUILDING.top + (floorNum)
				h = DIMENSIONS.BUILDING_FLOOR.floorBaseHeight;
				floorBase = factory.ScreenRect(
					l,
					t,
					w,
					h,
					0,
					display.COLORS.BROWN,
					display.COLORS.BROWN,
					display.LAYERS.BUILDING
					);
				floor.addChild(floorBase);
				//TODO: also add elevator doors where shafts are
				display.addToDisplayList(floor);
				display.addToDisplayList(floorBase)
			}
		}
		return false;
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
	 * @returns {Building|false} a Building object, or false
	 */
	function Building (world) {
		//compute sizes
		var l = DIMENSIONS.BUILDING.left * world.width;
		var t = DIMENSIONS.BUILDING.top * world.height;
		var w = (DIMENSIONS.BUILDING.right - DIMENSIONS.BUILDING.left) * world.width;
		var h = (DIMENSIONS.BUILDING.bottom - DIMENSIONS.BUILDING.top) * world.width;
		var b = factory.ScreenRect(
				l, t, w, h,
				DIMENSIONS.BUILDING.wallWidth,
				display.COLORS.BROWN,
				display.COLORS.YELLOW,
				display.LAYERS.WORLD
			);
		if(b) {
			b.name = TYPES.BUILDING;
			b.setParent(world);
			//add floors
			var numFloors = factory.toInt(DIMENSIONS.BUILDING.height/DIMENSIONS.BUILDING_FLOOR.floorHeight);
			console.log("NUMFLOORS:" + numFloors);
			for(var i = 0; i < numFloors; i++) {
				b.addChild(BuildingFloor(b, i, numFloors));
			}

			//compute number of shafts

			//ELEVATOR_DOORS:"ELEVATOR_DOORS",
			//ELEVATOR_SHAFT:"ELEVATOR_SHAFT",
			//BUILDING_FLOOR:"BUILDING_FLOOR",

			display.addToDisplayList(b, display.LAYERS.BUILDING);
		}
		if(!b) {
			elefart.showError("failed to create Building");
		}
		return b;
	}

	/** 
	 * @constructor Sun
	 * @classdesc the sun over the Building, a circle with a color gradient.
	 * - parent: World
	 * - grandparent: none
	 * - children: none
	 * @returns {Sun|false} a Sun object, or false
	 */
	function Sun (world) {
		var s = false;
		//compute sizes
		var l = DIMENSIONS.SUN.left * world.width;
		var t = DIMENSIONS.SUN.top * world.height;
		var r = (DIMENSIONS.SUN.right - DIMENSIONS.SUN.left) * world.width * 0.5;
		//create the radial gradient
		var grd = display.getBackgroundTexture(
			display.MATERIALS.GRADIENT_SUN, 
			l + r, //first circle
			t + r, 
			l + r, //second circle
			t + r);
		if(grd) {
			//create the Sun
			s = factory.ScreenCircle(
				l, t, r,
				0, display.COLORS.BLACK,
				grd,
				display.LAYERS.WORLD
				);
			if(s) {
				s.name = TYPES.SUN;
				s.setParent(world);
				display.addToDisplayList(s, display.LAYERS.WORLD); //visible
			}
		}
		if(!s) {
			elefart.showError("failed to create Sun");
		}
		return s;
	}

	/** 
	 * @constructor Sky
	 * @classdesc the sky over the Building, a rect with a color gradient.
	 * - parent: World
	 * - grandparent: none
	 * - children: none
	 * @returns {Sky|false} the Sky object, or false
	 */
	function Sky (world) {
		var s = false;
		//compute sizes
		var l = DIMENSIONS.SKY.left * world.width;
		var t = DIMENSIONS.SKY.top * world.height;
		var w = (DIMENSIONS.SKY.right - DIMENSIONS.SKY.left) * world.width;
		var h = (DIMENSIONS.SKY.bottom - DIMENSIONS.SKY.top) * world.width;
		var grd = display.getBackgroundTexture(
			display.MATERIALS.GRADIENT_SKY, 
			l, 
			t, 
			l + w,
			t + h);
		if(grd) {
			//create the Sky
			s = factory.ScreenRect(
				l, t, w, h,
				0, display.COLORS.BLACK,
				grd,
				display.LAYERS.WORLD
			);
			if(s) {
				s.name = TYPES.SKY;
				s.setParent(world);
				display.addToDisplayList(s, display.LAYERS.WORLD); //visible
			}
		}
		if(!s) {
			elefart.showError("failed to create Sky");
		}
		return s;
	}

	/** 
	 * @constructor World
	 * @classdesc the top-level environment
	 * - parent: none
	 * - grandparent: none
	 * - children: Building
	 * @returns {World|false} the World containing the Building
	 */
	function World () {
		var w = false;
		var r = display.getGameRect();
		var w = factory.toInt(r.right - r.left);
		var h = factory.toInt(r.bottom - r.top);
		if(r) {
			//World is a ScreenRect
			w = factory.ScreenRect(
			0, 0, w, h,
			0, display.COLORS.WHITE, 
			display.COLORS.BLACK,
			display.LAYERS.WORLD
			);
			//set World propeties
			if(w) {
				w.name = TYPES.WORLD;
				w.setParent(null);
				w.setRectBorderRadius(0); //no border
				w.setOpacity(0.0); //World is invisible
				//we don't add World to display list
			}
		}
		if(!w) {
			elefart.showError("Failed to create World");
		}
		return w;
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
	 * @returns {Gas|false} a Gas object, or false
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
	 * @returns {Goodie|false} a Goodie object, or false
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
	 * @returns {Person|false} a Person object, or false
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
		var w = World();
		console.log("SETTING w AS WORLD IN WINDOW:w");
		window.w = w;
		if(w) {
			w.addChild(Sky(w));
			w.addChild(Sun(w));
			w.addChild(Building(w));

			//once we're done, start the event loop
		}
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

		//create the World
		buildWorld();
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