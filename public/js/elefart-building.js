/** 
 * @namespace
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
	 * @description max width of building walls and walking floorBase
	 */
	var MAX_WALLS = 10;

	/** 
	 * @readonly
	 * @description minimum height of building floors
	 */
	var MIN_FLOOR = 60;

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
		ELEVATOR_SUBSHAFT:"ELEVATOR_SUBSHAFT",
		BUILDING:"BUILDING",
		BUILDING_SIGN: "BUILDING_SIGN",
		BUILDING_FLOOR:"BUILDING_FLOOR",
		BUILDING_FLOORBASE:"BUILDING_FLOORBASE",
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
	 * building objects in the ENTIRE screen region devoted to the 
	 * game. If relative, sizes are relative to the 
	 * size of the World object. Dimensions are in a Rect-like 
	 * format, but are NOT an elefart.factory.ScreenRect. 
	 * On a resizable window, the DIMENSIONS may be altered if 
	 * the screen size changes.
	 */
	var DIMENSIONS = {};
	DIMENSIONS[TYPES.SUN] = {
		top:0.03,
		left:0.85,
		width:0.045,
		height:0.045
	},
	DIMENSIONS[TYPES.SKY] = {
		top:0.0,
		left:0.0,
		width:1.0,
		height:0.1,
	},
	DIMENSIONS[TYPES.BUILDING] = {
		top:0.1,
		left:0.0,
		width:1.0,
		height:0.8,
		wallSize:0.01, //size of walls (related to height)
		MIN_WALL:6
	},
	DIMENSIONS[TYPES.BUILDING_SIGN] = {
		top:0.04,
		left:0.07,
		width:0.3,
		height:0.05
	},
	DIMENSIONS[TYPES.BUILDING_FLOOR] = {
		height:0.1, //height of entire floor
	},
	DIMENSIONS[TYPES.BUILDING_FLOORBASE] = {
		height:0.01 //height of walking surface at bottom BuildingFloor
	},
	DIMENSIONS[TYPES.ELEVATOR_SHAFT] = {
		width:0.1, //the entire shaft
		subWidth:0.06, //the visible shaft rect
		subOpacity:0.3 //opacity of central colored region of shaft
	},
	DIMENSIONS[TYPES.ELEVATOR_SUBSHAFT] = {
		//nothing inherited at this point
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
	 * ===========================
	 * UTILITIES
	 * ===========================
	 */

	/** 
	 * @method getCSSvalues
	 * @description get the CSS values from an incoming JSON string. Expect the 
	 * following format:
	 * {"name":"smartphone","floors":"5","shafts":"4"}.
	 * NOTE: the incoming CSS string (from elefart.display.getCSSBreakpoint()) 
	 * may have appended quotes, which are removed by a regular expression
	 * @param {String} breakPt the JSON string
	 * @returns {Object|false} if a valid JSON string, return the object, else false
	 */
	function getCSSValues(breakPt) {
		if(factory.isString(breakPt)) {
			breakPt = breakPt.replace(/(^['"])|(['"]$)/g,'');
			return JSON.parse(breakPt);
		}
		return false;
	}

	/** 
	 * @method setDimensions
	 * @description (re) set the dimensions of the building
	 * using CSS media breakpoints defined in css file
	 * called by Elefart.controller.handleResize(). If the user 
	 * resizes the screen and a new CSS breakpoint is crossed, the 
	 * entire building redraws to adjust. The dimensions of key 
	 * elements (e.g. elevators and shafts) are changed in the 
	 * DISPLAY {} lists of this object. Redefines occur in:
	 * - DIMENSIONS[TYPES.ELEVATOR_SHAFT] 
	 * - DIMENSIONS[TYPES.BUILDING_FLOOR] 
	 * NOTE: dimensions are set for min-width and max-width CSS 
	 * breakpoints. The setFloors() function adjusts for very elongated 
	 * portrait displays (e.g. Kindle Fire).
	 * @param {String|false} breakPt a string matching a string 
	 * added to the body:before element in the CSS file, e.g.
	 * body:before { content: 'iphone'; display: none; }
	 */
	function setDimensions (breakPt) {

		console.log("New CSS breakpoint:" + breakPt);

		var dim = getCSSValues(breakPt);

		//compute ratios
		if(dim) {

			DIMENSIONS.ELEVATOR_SHAFT.width = 1/dim.shafts;
			DIMENSIONS.ELEVATOR_SHAFT.subWidth = DIMENSIONS.ELEVATOR_SHAFT.width * 0.6;
			DIMENSIONS.BUILDING_FLOOR.height = 1/dim.floors;
		}
		else {
			console.log("ERROR: elefart.building, invalid dimensions from CSS");
		}
	}


	/** 
	 * @method setFloors
	 * @description adjusts for portraits with narrow width (e.g. Kindle). CSS sets a standard 
	 * width and height in the setDimensions() function, but if the display is very long, 
	 * this routine adds a few floors
	 */
	function setFloors () {
		var gh = display.getGameRect().height;
		var h = gh.height * (1 - DIMENSIONS.BUILDING.HEIGHT);

		if(gh < 100) {
			DIMENSIONS.BUILDING_FLOOR.height = 0.5;
		}
		else if(gh < 240) {
			DIMENSIONS.BUILDING_FLOOR.height = 0.3333;
		}
		else if(gh < 320) {
			DIMENSIONS.BUILDING_FLOOR.height = 0.25;
		}
		else if(gh < 480) {
			DIMENSIONS.BUILDING_FLOOR.height = 0.20;
		}
		else if(gh < 760) {
			DIMENSIONS.BUILDING_FLOOR.height = 0.15;
		}
		else {
			DIMENSIONS.BUILDING_FLOOR.height = 0.10;
		}
		console.log("DIMENSIONS.BUILDING_FLOOR.height set to:"+DIMENSIONS.BUILDING_FLOOR.height)
	}

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
					parent.addChild(elev);
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
 	 * @param {Building} building the game building
 	 * @param {Number} shaftNum the number of the elevator shaft (left to right)
 	 * @param {Number} numShafts the total number of elevator shafts
 	 * @param {Boolean} hasShaftTop if true, there is a shaft top that should 
 	 * punch through the Building
 	 * @returns {ElevatorShaft|false} an ElevatorShaft object, or false
 	 */
	function ElevatorShaft (building, shaftNum, numShafts, hasShaftTop) {
		if(building) {
			var shaftWidth = factory.toInt(DIMENSIONS.ELEVATOR_SHAFT.width * building.width);
			var shaftSubWidth = factory.toInt(DIMENSIONS.ELEVATOR_SHAFT.subWidth * building.width);
			var shaftOffset = factory.toInt((shaftWidth - shaftSubWidth)/2);
			var ww = building.lineWidth; //control how shafts overlap building walls

			//compute shaft dimensions
			var t = building.top; //offset so overlaps roof, doesn't overlap bottom floor
			var l = building.left + (shaftWidth * shaftNum); //zero-based
			var w = shaftWidth;
			var h = building.height;

			var s = factory.ScreenRect(
				l,
				t,
				w,
				h, //we don't include the walking surface
				0,
				display.COLORS.BROWN,
				display.COLORS.YELLOW, //TODO: OVERLAPPING FLOORS, PARTIALLY OPAQUE
				display.LAYERS.SHAFTS
				);

			if(s) {
				s.name = TYPES.ELEVATOR_SHAFT;
				s.instanceName = "Shaft #:" + shaftNum;
				s.shaftNum = shaftNum;
				//draw the visible shaft as another Rect, partly transparent
				//TODO: ShaftTop on a shaft
				var rgbaColor = factory.getRGBAfromRGB(
					display.COLORS.PINK, 
					DIMENSIONS.ELEVATOR_SHAFT.subOpacity
					);

				var sb = factory.ScreenRect(
						l + shaftOffset,
						t,
						shaftSubWidth,
						h,
						0,
						display.COLORS.BLACK,
						rgbaColor,
						display.LAYERS.SHAFTS
					);
				if(sb) {
					sb.name = TYPES.ELEVATOR.SUBSHAFT;
					sb.instanceName = "Elevator Shaft #:" + shaftNum + "subshaft"
					s.addChild(sb);
					display.addToDisplayList(sb, display.LAYERS.SHAFTS);
					return s;
				}
				
			}
		}
		return false;
	}

	/* 
	 * ============================
	 * BUILDING FLOORS
	 * ============================
	 */

	/** 
	 * @constructor BuildingFloor
	 * @classdesc the floors passed by the Elevator. 
	 * BuildingFloor contains both parents and children
	 * - parent: Building
	 * - grandparent: World
	 * - children: floorBase, ElevatorDoors, Goodies, ElevatorControls
	 * @param {Building} building the parent building object
	 * @param {Number} floorNum the floor number
	 * @returns {BuildingFloor|false} a BuildingFloor object, or false
	 */
	function BuildingFloor (building, floorNum, numFloors) {
		if(building) {
			var baseHeight = DIMENSIONS.BUILDING.wallSize * building.height;
			if(baseHeight > MAX_WALLS) baseHeight = MAX_WALLS;
			var h = building.height/numFloors;
			var t = building.top + (floorNum * h);
			var l = building.left;
			var w = building.width;

			var f = factory.ScreenRect(
				l,
				t,
				w,
				h, //we don't include the walking surface
				0,
				display.COLORS.BROWN,
				display.COLORS.YELLOW, 
				display.LAYERS.BUILDING,
				display.getHotelWalls()//, //NOTE: ADDING AN IMAGE
				//function () {console.log("loading hotel walls in floor");}
				);

			if(f) {
				f.name = TYPES.BUILDING_FLOOR;
				f.floorNum = (numFloors - floorNum);
				f.instanceName = "Floor #" + f.floorNum;
				f.walkLine = f.bottom; //where Players should put the .bottom of their enclosing Rect
				f.setOpacity(1.0, 0.5); //object opaque, image faded
				f.setSpriteCoords({ //where to sample when drawing image
					rows:13,
					cols:1,
					currRow:floorNum,
					currCol:0
				});
				display.addToDisplayList(f, display.LAYERS.BUILDING);

				//floorbase
				//always add a floorbase (the walking layer at the bottom of the BuildingFloor)
				var fb = factory.ScreenRect(
					l,
					t,
					w,
					baseHeight, //drawn downwards into lower floor
					5,
					display.COLORS.BROWN,
					display.COLORS.BROWN,
					display.LAYERS.BUILDING
					);
				//TODO: also add elevator doors where shafts are
				if(fb) {
					fb.name = TYPES.BUILDING_FLOORBASE;
					fb.instanceName = "FloorBase #" + f.floorNum;
					f.addChild(fb);
					display.addToDisplayList(fb, display.LAYERS.BUILDING);
					return f;
				}

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
		var i; //counter

		//compute sizes
		//building wall width
		var ww = DIMENSIONS.BUILDING.wallSize * world.width;
		var l = (DIMENSIONS.BUILDING.left * world.width);
		var t = (DIMENSIONS.BUILDING.top * world.height);
		var w = (DIMENSIONS.BUILDING.width * world.width);

		if(w > 1000) {
			w--; //KLUDGE FOR ALIGNMENT!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
		}
		w--;

		//building height
		var h = DIMENSIONS.BUILDING.height * world.height;

		//create building
		var b = factory.ScreenRect(
				l, 
				t, 
				w, 
				h,
				ww, //stroke
				display.COLORS.BROWN, 
				display.COLORS.YELLOW,
				display.LAYERS.WORLD
			);

		if(b) {
			b.shrink((ww/2)-1);
			b.name = TYPES.BUILDING;
			b.instanceName = "GasLight Building";
			world.addChild(b);

			//add to displayList BEFORE floors
			display.addToDisplayList(b, display.LAYERS.BUILDING);

			//add sign at top of Building
			var st = (DIMENSIONS.BUILDING_SIGN.top * b.height); //top of sign
			var sh = b.top - st - ww; //height of sign

			var s = factory.ScreenRect(
				DIMENSIONS.BUILDING_SIGN.left * b.width, 
				st, 
				DIMENSIONS.BUILDING_SIGN.width * b.width, 
				sh, 
				0, 
				null, 
				null, 
				display.LAYERS.BUILDING, 
				display.getHotelSign()
				);

			if(s) {
				s.name = TYPES.BUILDING_SIGN;
				s.instanceName = "GasLight Building Sign";
				b.addChild(s);
				display.addToDisplayList(s, display.LAYERS.BUILDING);
			}

			//add top floor opening on roof
			var floorHeight = DIMENSIONS.BUILDING_FLOOR.height * b.height;
			//var numFloors = b.height/floorHeight;
			var numFloors = Math.ceil(1/DIMENSIONS.BUILDING_FLOOR.height);
			floorHeight = b.height/numFloors;
			var floorDiff = b.height - (numFloors * floorHeight);
			console.log("bldg height:" + b.height + " floor height:" + floorHeight + " numFloors:" + numFloors + " floorDiff:" + floorDiff)

			console.log("NUMFLOORS:" + numFloors);
			for(i = 0; i < numFloors; i++) {
				b.addChild(BuildingFloor(b, i, numFloors));
			}

			//add elevator shafts
			var numShafts = factory.toInt(DIMENSIONS.BUILDING.width/DIMENSIONS.ELEVATOR_SHAFT.width);
			console.log("NUMSHAFTS:" + numShafts);
			for(i = 0; i < numShafts; i++) {
				b.addChild(ElevatorShaft(b, i, numShafts));
			}
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
		var r = DIMENSIONS.SUN.height * world.height * 0.5;
		//create the radial gradient
		var grd = display.getBackgroundTexture(
			display.MATERIALS.GRADIENT_SUN, 
			l+r, //x first circle x
			t+r,   //y first circle y
			2,   //x2 first circle radius
			r    //y2 second circle radius
			);
		if(grd) { 
			//create the Sun
			s = factory.ScreenCircle(
				l, t, r,
				3, display.COLORS.WHITE,
				grd,
				display.LAYERS.WORLD
				);
			if(s) {
				s.name = TYPES.SUN;
				s.instanceName = "Sun";
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
		var w = DIMENSIONS.SKY.width * world.width;
		var h = DIMENSIONS.SKY.height * world.height;
		 if(w > 1000) {
			w -= 2;
		}
		var grd = display.getBackgroundTexture(
			display.MATERIALS.GRADIENT_SKY, 
			l, 
			t, 
			l,
			h);
		if(grd) {
			//create the Sky
			s = factory.ScreenRect(
				l, 
				t, 
				w, 
				h,
				0, display.COLORS.BLACK, //stroke
				grd,                     //fill
				display.LAYERS.WORLD
			);
			if(s) {
				s.name = TYPES.SKY;
				s.instanceName = "Sky";
				///////////////////////////world.addChild(s);
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
		var w = r.right - r.left;
		var h = r.bottom - r.top;

		console.log("World computed width:" + w); ////////////////

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
				w.instanceName = "World of Elefart";
				w.parent = null; //world has not parent
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
		console.log("In buildWorld");

		//kill the old world display list
		display.initDisplayList();

		//(re)set dimensions
		setDimensions(display.getCSSBreakpoint());

		setFloors();

		//reset the world
		w = World();
		console.log("SETTING w AS WORLD IN WINDOW:w");
		if(w) {
			w.addChild(Sky(w));
			w.addChild(Sun(w));
			w.addChild(Building(w));
			//once we're done, start the event loop
		} //end of if w
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
		console.log("in elefart.building.run()");
		if(firstTime) {
			init();
			firstTime = false;
		}

		//create the World
		buildWorld();
	}

	//returned object
	return {
		setDimensions:setDimensions,
		setFloors:setFloors,
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
		buildWorld:buildWorld,
		init:init,
		run:run
	};

})();