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
	 * @description number used for first floor. Actual storage internally 
	 * may be zero-based
	 */
	var ROOF = -1;

	/**
	 * @readonly
	 * @enum {String}
	 * @typedef {TYPES}
	 * @description Enum for types of objects in the Building in the game
	 */
	var BUILDING_TYPES = {
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
		CLOUD:"CLOUD",
		CORONA:"CORONA",
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
	DIMENSIONS[BUILDING_TYPES.SUN] = {
		top:0.03,
		left:0.85,
		width:0.045,
		height:0.045
	},
	DIMENSIONS[BUILDING_TYPES.SKY] = {
		top:0.0,
		left:0.0,
		width:1.0,
		height:0.1,
	},
	DIMENSIONS[BUILDING_TYPES.CLOUD] = {
		width:0.2,
		height:0.4,
		minWidth:100,
		minHeight:10,
		horizon:0.02, //lower horizon (no Clouds below that)
		minArcs:3,
		maxArcs:7,
		minClouds:2,
		maxClouds:20
	},
	DIMENSIONS[BUILDING_TYPES.BUILDING] = {
		top:0.1,
		left:0.0,
		width:1.0,
		height:0.8,
		wallSize:0.01, //size of walls (related to height)
		MIN_WALL:6
	},
	DIMENSIONS[BUILDING_TYPES.BUILDING_SIGN] = {
		top:0.04,
		left:0.07,
		width:0.3,
		//height:0.05 //determined by Building top
	},
	DIMENSIONS[BUILDING_TYPES.BUILDING_FLOOR] = {
		height:0.1, //height of entire floor
	},
	DIMENSIONS[BUILDING_TYPES.BUILDING_FLOORBASE] = {
		height:0.01 //height of walking surface at bottom BuildingFloor
	},
	DIMENSIONS[BUILDING_TYPES.ELEVATOR_SHAFT] = {
		width:0.1, //the entire shaft
		subWidth:0.06, //the visible shaft rect
		subOpacity:0.3 //opacity of central colored region of shaft
	},
	DIMENSIONS[BUILDING_TYPES.ELEVATOR_SUBSHAFT] = {
		//nothing inherited at this point
	},
	DIMENSIONS[BUILDING_TYPES.ELEVATOR] = {
		elevatorWidth:0.1,
		elevatorHeight:0.1
	},
	DIMENSIONS[BUILDING_TYPES.CONTROL_PANEL] = {
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
			breakPt = breakPt.replace(/(^['"])|(['"]$)|([\\])/g,'');
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
	 * - DIMENSIONS[BUILDING_TYPES.ELEVATOR_SHAFT] 
	 * - DIMENSIONS[BUILDING_TYPES.BUILDING_FLOOR] 
	 * NOTE: dimensions are set for min-width and max-width CSS 
	 * breakpoints. The setFloors() function adjusts for very elongated 
	 * portrait displays (e.g. Kindle Fire).
	 * @param {String|false} breakPt a string matching a string 
	 * added to the body:before element in the CSS file, e.g.
	 * body:before { content: 'iphone'; display: none; }
	 */
	function setDimensions (breakPt) {

		if(breakPt !== false) console.log("New CSS breakpoint:" + breakPt);

		var dim = getCSSValues(breakPt);

		//compute ratios
		if(dim) {
			DIMENSIONS.ELEVATOR_SHAFT.width = 1/dim.shafts;
			DIMENSIONS.ELEVATOR_SHAFT.subWidth = DIMENSIONS.ELEVATOR_SHAFT.width * 0.6;
			DIMENSIONS.BUILDING_FLOOR.height = 1/dim.floors;
			DIMENSIONS.BUILDING_SIGN.width = dim.signx;
			DIMENSIONS.BUILDING_SIGN.top = dim.signy;
		}
		else {
			///////////////////////console.log("ERROR: elefart.building, invalid dimensions from CSS");
		}
	}


	/** 
	 * @method setFloors
	 * @description adjusts for portraits with narrow width and big height (e.g. Kindle). CSS sets a standard 
	 * width and height in the setDimensions() function, but if the display is very long, 
	 * this routine adds a few floors
	 */
	function setFloors () {
		var gr = display.getGameRect();
		var gh = gr.height;
		var ar = gr.width/gr.height;

		//change some dimensions at extreme aspect ratios
		if(ar < 0.45) {
			DIMENSIONS.BUILDING.top = 0.1 + (ar - 0.5)/5;
			DIMENSIONS.SKY.height = DIMENSIONS.BUILDING.top
		}

		//compute height of building floors
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
		else if(gh < 550) {
			DIMENSIONS.BUILDING_FLOOR.height = 0.17;
		}
		else if(gh < 760) {
			DIMENSIONS.BUILDING_FLOOR.height = 0.15;
		}
		else {
			DIMENSIONS.BUILDING_FLOOR.height = 0.10;
		}
		/////////////////console.log("DIMENSIONS.BUILDING_FLOOR.height set to:"+DIMENSIONS.BUILDING_FLOOR.height)
	}

	/** 
	 * @method getChildByType
	 * @description given a type, find objects in the building, with optional recursive
	 * action.
	 * @param {String} type the type 
	 * @param {Boolean} recurse (optional) if true, recurse through all children
	 * @param {Number|String} index (optional) object property name
	 * @param {Number|String} val (optional) value in property of Building object
	 * @returns {Array<ScreenObject>} if found, get the object(s) in an array
	 */
	function getChildByType (type, recurse, index, val, r) {
		if(!r) r = [];
		var len = this.children.length;
		for(var i = 0; i < len; i++) {
			var o = this.children[i];
			//console.log("name:" + o.name);
			//console.log("index:" + index + " val:" + val);
			if(o.name === type) {
				if(index !== undefined && val !== undefined) {
					if(o[index] === val) {
						r.push(o);
					}
				}
				else {
					r.push(o);
				}
			}
			if(recurse) {
				r = o.getChildByType(type, recurse, index, val, r); //add additional to list
			}
		}
		return r;
	}


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
	function Elevator (building, shaft, subShaft, floor) {
		var numFloors = Math.ceil(1/DIMENSIONS.BUILDING_FLOOR.height);
		var t = building.top;
		var l = subShaft.left;
		var w = subShaft.width;
		var h = subShaft.width;

		//var sssss = building.getShaftSubWidth(); ////////////////////DOES NOT WORK

		//TODO: use getters attached to Building

		var e = factory.ScreenRect(
				l, 
				t,
				w, 
				h, 
				8,                //stroke width
				display.COLORS.BLACK,  //stroke color
				display.COLORS.WHITE,  //fill color
				display.LAYERS.ELEBACK //bottom layer
			);
			if(e) {
				e.name = BUILDING_TYPES.ELEVATOR;
				e.instanceName = "Shaft #:" + shaft.shaftNum;
				e.borderRadius = 3;
				e.shaftNum = shaft.shaftNum;
				display.addToDisplayList(e, display.LAYERS.ELEBACK);
				return e;
			}
		return false;
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
		if(parent && parent.buildingType === BUILDING_TYPES.BUILDING_FLOOR) {
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

			//if the shaft is the one that goes to the Roof, change top (y height)
			if(shaftNum === hasShaftTop) {
				var diff = building.top - DIMENSIONS.BUILDING.MIN_WALL;
				t = DIMENSIONS.BUILDING.MIN_WALL;
				h += diff;
			}
			//create the ElevatorShaft
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
				s.name = BUILDING_TYPES.ELEVATOR_SHAFT;
				s.instanceName = "Shaft #:" + shaftNum;
				s.shaftNum = shaftNum;
				//assign generic getter function
				s.getChildByType = getChildByType;

				s.getSubShaft = function () {
					return s.getChildByType(BUILDING_TYPES.ELEVATOR_SHAFT, false)[0];
				}

				//draw the visible SubShaft as another Rect, partly transparent
				var rgbaColor = factory.getRGBAfromRGB(
					display.COLORS.PINK, 
					DIMENSIONS.ELEVATOR_SHAFT.subOpacity
					);

				//create the visible sub-shaft
				var sb = factory.ScreenRect(
						l + shaftOffset,
						t,
						shaftSubWidth,
						h,
						0,
						display.COLORS.CLEAR,
						rgbaColor,
						display.LAYERS.SHAFTS
					);
				if(sb) {
					//add the shaft rect
					sb.name = BUILDING_TYPES.ELEVATOR.SUBSHAFT;
					sb.openSide = 3; //0, 1, 2, 3;
					sb.instanceName = "Elevator SubShaft for #:" + shaftNum;
					s.addChild(sb);

					display.addToDisplayList(sb, display.LAYERS.SHAFTS);

					////////////////////////
					//CREATE ELEVATOR
					////////////////////////
					s.addChild(Elevator(building, s, sb, 1)); //building, shaft, subshaft, floor

					//getter for Elevator
					s.getElevator = function () {
						return s.getChildByType(BUILDING_TYPES.ELEVATOR, false)[0];
					}
					return s;
				}
			}
		}
		//fallthrough
		elefart.showError("failed to create Elevator Shaft:" + shaftNum);
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

		//compute BuildingFloor based on dimensions
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
				f.name = BUILDING_TYPES.BUILDING_FLOOR;
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
				//assign generic getter function
				f.getChildByType = getChildByType;
				display.addToDisplayList(f, display.LAYERS.BUILDING);

				//floorbase
				//always add a floorbase (the walking layer at the bottom of the BuildingFloor)
				var fb = factory.ScreenRect(
					l,
					t,
					w,
					baseHeight, //Rect drawn downwards into lower floor
					5,
					display.COLORS.BROWN,
					display.COLORS.BROWN,
					display.LAYERS.BUILDING
					);
				//TODO: also add elevator doors where shafts are
				if(fb) {
					fb.name = BUILDING_TYPES.BUILDING_FLOORBASE;
					fb.instanceName = "FloorBase #" + f.floorNum;
					f.addChild(fb);
					display.addToDisplayList(fb, display.LAYERS.BUILDING);

					//get a shadow gradient
					var grd = display.getBackgroundTexture(
						display.MATERIALS.GRADIENT_SHADOW, 
						l, 
						t+baseHeight, 
						l,
						t+(baseHeight*4)
						);
					//make the shadow under the FLoor
					var fg = factory.ScreenRect(
						l,
						t+baseHeight,
						w,
						baseHeight*4,
						0,
						display.COLORS.CLEAR,
						grd,
						display.LAYERS.BUILDING
						);
					if(fg) {
						fg.name = BUILDING_TYPES.BUILDING_FLOORBASE;
						fg.instanceName = "FloorBase shadow #" + f.floorNum;
						fg.setOpacity(0.5);
						fb.addChild(fg);
						display.addToDisplayList(fg, display.LAYERS.BUILDING);
						return f;
					}

				}
			}

		//fallthrough
		elefart.showError("Failed to create BuildingFloor:" + floorNum);
		return false;
	}

	/** 
	 * @constructor BuildingRoof
	 * @classdesc special BuildingFloor, actually the roof of the Building. Draw a roof 
	 * pattern on the base, extending into the next lower BuildingFloor
	 * @param {Building} building the Building object, linked as parent to this class
	 * @returns {BuildingRoof|false} a BuildingRoof, or false
	 */
	function BuildingRoof (building, shaftTop) {

		//compute BuildingRoof based on dimensions
		var t = world.top;
		var l = building.left;
		var w = building.right - l;
		var h = building.top;
		var r = factory.ScreenRect(
				l, 
				t, 
				w, 
				h,
				0, //stroke
				display.COLORS.CLEAR, 
				display.COLORS.CLEAR,
				display.LAYERS.BUILDING
			);

		//create the visible elements of the BuildingRoof and set additional properties
		if(r) {
			r.name = BUILDING_TYPES.BUILDING_FLOOR;
			r.floorNum = ROOF; //SPECIAL NUMBER
			r.instanceName = "ROOF";

			//add the visible rooftop to the LEFT of the ElevatorShaft punching through it
			var shaftSubWidth = factory.toInt(DIMENSIONS.ELEVATOR_SHAFT.subWidth * building.width/2);
			var lw = shaftSubWidth - building.lineWidth + (
				shaftTop * factory.toInt(DIMENSIONS.ELEVATOR_SHAFT.width * building.width));
			var lt = factory.ScreenRect(
				world.left,
				building.top - building.lineWidth,
				lw,
				4,
				0,
				display.COLORS.CLEAR,
				display.COLORS.BLACK,
				display.LAYERS.BUILDING
				);
			lt.instanceName = "Roof Left";
			r.addChild(lt);
			display.addToDisplayList(lt, display.LAYERS.BUILDING);
		
			//add the visible rooftop to the RIGHT of the ElevatorShaft punching through it
			var rw = lw + (shaftSubWidth*2) + building.lineWidth/2;
			var rt = factory.ScreenRect(
				rw,
				building.top - building.lineWidth,
				building.right+building.lineWidth,
				4,
				0,
				display.COLORS.CLEAR,
				display.COLORS.BLACK,
				display.LAYERS.BUILDING
				);

			rt.instanceName = "Roof right";
			r.addChild(rt);
			display.addToDisplayList(rt, display.LAYERS.BUILDING);

			//draw an outline around the top shaft for the ElevatorShaft that goes to the Roof
			//TODO: black thin, then brown thicker
			//TODO: match height available to us
			//TODO: elevator needs to be a bit smaller
			//TODO: LEFT AND RIGHT RECT ABOVE NOT BEING REMOVED BY REMOVECHILD
			w = rt.left - lt.right;
			h = DIMENSIONS.BUILDING_FLOOR.height * building.height;
			var wallSize = DIMENSIONS.BUILDING.wallSize * building.height;
			//external wall on Roof
			var sp = factory.ScreenRect(
				factory.toInt(lt.right - wallSize/2),
				wallSize,
				w,
				h,
				building.lineWidth,
				display.COLORS.BROWN,
				display.COLORS.CLEAR,
				display.LAYERS.ELEBACK
				);
			sp.borderRadius = 6;
			r.addChild(sp);
			display.addToDisplayList(sp, display.LAYERS.ELEBACK); //put behind BuildingFloor Rect
			return r;
		}

		//fallthrough
		elefart.showError("Failed to create BuildingRoof");
		return false;
	}

	/** 
	 * @constructor BuildingSign
	 * @classdesc the sign on Building's BuildingRoof
	 * - parent: Building
	 * - grandparent: World
	 * - children: none
	 * @param {Building} building the Building object, linked as parent to this class
	 * @returns {BuildingSign|false} a BuildingSign object, or false
	 */
	function BuildingSign (building) {

		//compute BuildingSign based on dimensions
		var ww = DIMENSIONS.BUILDING.wallSize * world.height;
		var st = (DIMENSIONS.BUILDING_SIGN.top * building.height); //top of sign
		var sh = building.top - st-ww/2; //height of sign
		var sw = DIMENSIONS.BUILDING_SIGN.width * building.width;

		//create the BuildingSign
		var s = factory.ScreenRect(
			DIMENSIONS.BUILDING_SIGN.left * building.width, 
			st, 
			sw,
			sh, 
			0, 
			display.COLORS.CLEAR, 
			display.COLORS.CLEAR, 
			display.LAYERS.BUILDINGBACK, 
			display.getHotelSign()
			);

		//set additional BuildingSign properties and add child objects
		if(s) {
			s.name = BUILDING_TYPES.BUILDING_SIGN;
			s.instanceName = "GasLight Building Sign";
			display.addToDisplayList(s, display.LAYERS.BUILDING);
			return s;
			}

		//fallthrough
		elefart.showError("Failed to create BuildingSigh");
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
	 * @param {World} world the World object, linked as parent to this class
	 * @returns {Building|false} a Building object, or false
	 */
	function Building (world, shaftTop) {
		var i; //counter

		//compute Building sizes based on dimensions
		var ww = DIMENSIONS.BUILDING.wallSize * world.height;
		var l = (DIMENSIONS.BUILDING.left * world.width);
		var t = (DIMENSIONS.BUILDING.top * world.height);
		var w = (DIMENSIONS.BUILDING.width * world.width) +1;// +1 fixes width at some dimensions
		var h = DIMENSIONS.BUILDING.height * world.height;

		//create Building
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

		//set additional Building properties and add child objects
		if(b) {
			b.shrink((ww/2)-1); //shrink so stroke shows on left and right of window
			b.name = BUILDING_TYPES.BUILDING;
			b.instanceName = "GasLight Building";
			b.getChildByType = getChildByType; //generic child getter function

			//add to Building outline to displayList BEFORE BuildingFloors
			display.addToDisplayList(b, display.LAYERS.BUILDING);

			//getter for BuildingSign
			b.getSign = function () {
				return b.getChildByType (BUILDING_TYPES.BUILDING_SIGN, false)[0];
			}

			//add the BuildingSign on Roof of Building BEFORE BuildingFloors
			b.addChild(BuildingSign(b));

			//getters for BuildingFloors
			b.getFloor = function (floorNum, useDisplay) {
				return b.getChildByType (BUILDING_TYPES.BUILDING_FLOOR, false, "floorNum", floorNum)[0];
			}
			b.getFloors = function () {
				return b.getChildByType (BUILDING_TYPES.BUILDING_FLOOR);
			}

			//add BuildingFloors
			var floorHeight = DIMENSIONS.BUILDING_FLOOR.height * b.height;
			var numFloors = Math.ceil(1/DIMENSIONS.BUILDING_FLOOR.height);
			floorHeight = b.height/numFloors;
			var floorDiff = b.height - (numFloors * floorHeight);
			for(i = 0; i < numFloors; i++) {
				b.addChild(BuildingFloor(b, i, numFloors));
			}

			//compute which ElevatorShaft goes to the BuildingRoof (one extra floor, number -1)
			var numShafts = factory.toInt(DIMENSIONS.BUILDING.width/DIMENSIONS.ELEVATOR_SHAFT.width);
			var shaftTop = 0;
			var min = Math.floor(numShafts/2);
			var ceil = numShafts - 1;
			if(ceil <= min) {
				shaftTop = ceil;
			}
			else {
				shaftTop = factory.getRandomInt(Math.ceil(numShafts/2), numShafts-1);
			}

			//getter for BuildingRoof
			b.getBuildingRoof = function () {
				return b.getChildByType(BUILDING_TYPES.BUILDING_FLOOR, false, "floorNum", ROOF)[0];
			}

			//create and add BuildingRoof, with adds as a BuildingFloor -1
			b.addChild(BuildingRoof(b, shaftTop));

			//getters for ElevatorShafts
			b.getShaft = function (shaftNum) {
				return b.getChildByType (BUILDING_TYPES.ELEVATOR_SHAFT, false, "shaftNum", shaftNum)[0];
			}

			b.getShafts = function () {
				return b.getChildByType (BUILDING_TYPES.ELEVATOR_SHAFT);
			}

			//create all ElevatorShafts
			for(i = 0; i < numShafts; i++) {
				b.addChild(ElevatorShaft(b, i, numShafts, shaftTop));
			}
			//return the completed Building

			window.b = b; ////////////////////////////////////////////////////////////////////////////////////////////////////
			return b;
		}

		//fallthrough
		elefart.showError("failed to create Building");
		return false;
	}

	/** 
	 * @constructor Cloud
	 * @classdesc the clouds in the Sky, Cloud object
	 * - parent: Sky
	 * - grandparent: World
	 * - children: none
	 * @param {Sky} sky the Sky 
	 * @returns {Cloud|false} a Cloud object, or false
	 */
	function Cloud (sky, distance, width, height, blendColor) {
		/* 
		 * compute Cloud based on Sky dimensions. Clouds near the 
		 * bottom of the Sky are smaller and move more slowly than those 
		 * near the top of the Sky. Clouds are placed in a semi-random fashion, 
		 * and have the arcs in their shapes set randomly as well
		 */
		var minWidth = DIMENSIONS[BUILDING_TYPES.CLOUD].minWidth;
		var minHeight = DIMENSIONS[BUILDING_TYPES.CLOUD].minHeight;

		//Cloud x position
		var cloudX = factory.getRandomInt(
			sky.left, 
			sky.right - minWidth
			);
		//random biases to the right, so skew x values to the left
		cloudX -= sky.width * 0.2;
		var cloudY = sky.height * distance * (height/sky.height);

		var l = cloudX;
		var t = cloudY;
		var w = l + width*distance;
		var h = t + height*distance;

		//make the cloudRect
		var cloudRect = factory.Rect(
			l,
			t,
			w,
			h
			);

		//compute the central point of the Cloud
		var cc = factory.Point(
				(cloudRect.left + cloudRect.width/2), 
				(cloudRect.top + cloudRect.height/2)
			);
		//console.log("cloudRect:" + cloudRect.top + "," + cloudRect.right + "," + cloudRect.bottom + "," + cloudRect.left);

		var sFactor = ((1.0 - distance) * (sky.height - t));
		pts = factory.createFlowerShape(
				cc, //central Point
				//cloudRect.height/3, //outerRadius
				//cloudRect.height/4, //inner radius
				sFactor/3,
				sFactor/4,
				factory.getRandomInt(0.95, 1.0), //y distortion to oval
				factory.getRandomInt(7, 8), //x distortion to oval
				10
			);

		//create the Cloud
		var c = factory.ScreenCloud(
			pts, 
			2, 
			display.COLORS.PALE_GREY, 
			display.COLORS.WHITE, 
			display.LAYERS.CLOUDS, 
			null, 
			null, 
			true
			);

		/* 
		 * skew Cloud points with a linear approximation. For small 
		 * Clouds, this is enough to make them fluffier on the top 
		 * and flattened on the bottom.
		 */
		if(c) {
			var xSkew = 0.2 * c.width;
			var ySkew = (c.height/c.width) * c.height;
			//adjust points so more Cloud-like
			factory.skewShape(c, cc, 8, xSkew, 0, xSkew);
			//flatten the Cloud bottom
			var len = c.points.length;
			var dist = c.bottom - cc.y;
			for(var i = 0; i < len; i++) {
				var pt = c.points[i];
				if(pt.y > cc.y) {
					var cdist = pt.y - cc.y;
					var scale = cdist/dist;
					pt.y -= (scale * ySkew);
				}
			}
			//shadow for Cloud
			var grd = display.getBackgroundTexture(
				display.MATERIALS.GRADIENT_CLOUD, 
				0, 
				c.top, 
				0, 
				c.bottom
			);
			c.setFill(grd, blendColor); //Cloud fill, plus Sky gradient
			//TODO: clouds "blue with distance, so set a bluing value"

			c.distance = distance; //used to animate Cloud layers
			c.name = BUILDING_TYPES.CLOUD;
			c.instanceName = "Cloud";
			c.getChildByType = getChildByType; //generic child getter function
			display.addToDisplayList(c);
			controller.addToUpdateList(c);
			return c;
		}

		//fallthrough
		elefart.showError("failed to create Cloud");
		return false;
	}

	/** 
	 * @constructor Sun
	 * @classdesc the sun over the Building, a circle with a color gradient.
	 * - parent: World
	 * - grandparent: none
	 * - children: light gradient around Sun's edge in Sky
	 * @param {World} world the World object, linked as parent to this class
	 * @returns {Sun|false} a Sun object, or false
	 */
	function Sun (world) {

		//compute Sun sizes based on relative World dimensions
		var l = DIMENSIONS.SUN.left * world.width;
		var t = DIMENSIONS.SUN.top * world.height;
		var r = DIMENSIONS.SUN.height * world.height * 0.5;

		//create the radial gradient
		var grd = display.getBackgroundTexture(
			display.MATERIALS.GRADIENT_SUN, 
			l+r,  //x first circle x
			t+r,  //y first circle y
			2,    //x2 first circle radius
			r     //y2 second circle radius
			);

		//create the Sun
		if(grd) { 
			var s = factory.ScreenCircle(
				l, 
				t, 
				r,
				3, 
				display.COLORS.WHITE,
				grd,
				display.LAYERS.WORLD
				);

			//set additional Sun properties (Corona added separately)
			if(s) {
				s.name = BUILDING_TYPES.SUN;
				s.instanceName = "Sun";
				s.getChildByType = getChildByType; //generic child getter function

				display.addToDisplayList(s, display.LAYERS.WORLD); //visible
				return s;
			}
		}

		//fallthrough
		elefart.showError("failed to create Sun");
		return false;
	}

	/** 
	 * @constructor Corona
	 * @classdesc the Corona surrounding the Sun, a circular gradient blended over 
	 * Sky and Clouds. The parent Sun is blended UNDER the Clouds.
	 * - parent: Sun
	 * - grandparent: Sky
	 * @param {Sun} sun the Sun object, linked as parent to this class
	 * @returns {Corona} a Corona gradient matched to Sun and Sky.
	 */
	function Corona (sun, sky) {

		var center = sun.getCenter();
		var r = sky.height * 0.5; //most of Sky height
		l = center.x - r;
		t = center.y - r;
		var grd = display.getBackgroundTexture(
			display.MATERIALS.GRADIENT_CORONA, 
			center.x,  //x first circle x
			center.y,  //y first circle y
			sun.radius-(sun.lineWidth*2), //blends with white border around Sun
			r     //y2 second circle radius
			);

		//create the Corona to lighten Sky and Clouds around Sun
		if(grd) { 
			var c = factory.ScreenCircle(
			l, 
			t, 
			r,
			0, 
			display.COLORS.CLEAR,
			grd,
			display.LAYERS.CLOUDS
			);

			//set additional Corona properties, and make it a child of Sun
			if(c) {
				c.name = BUILDING_TYPES.CORONA;
				c.instanceName = "Corona";
				c.getChildByType = getChildByType; //generic child getter function
				console.log("adding Corona to display list")
				display.addToDisplayList(c, display.LAYERS.CLOUDS); //blend over clouds
				return c;
			}
		}
		//fallthrough
		elefart.showError("failed to create Corona");
		return false;
	}

	/** 
	 * @constructor Sky
	 * @classdesc the sky over the Building, a rect with a color gradient.
	 * - parent: World
	 * - grandparent: none
	 * - children: Clouds in Sky
	 * @param {World} world the World object, linked as parent to this class
	 * @returns {Sky|false} the Sky object, or false
	 */
	function Sky (world) {

		//compute Sky sizes based on World relative dimensions
		var l = DIMENSIONS.SKY.left * world.width;
		var t = DIMENSIONS.SKY.top * world.height;
		var w = DIMENSIONS.SKY.width * world.width;
		var h = DIMENSIONS.SKY.height * world.height;
		 if(w > 1000) {
			w -= 2; //kludge fixing some dimensions
		}

		//Sky gradient
		var grd = display.getBackgroundTexture(
			display.MATERIALS.GRADIENT_SKY, 
			l, 
			t, 
			l,
			h);

		//create the Sky
		if(grd) {
			var s = factory.ScreenRect(
				l, 
				t, 
				w, 
				h,
				0, display.COLORS.BLACK, //stroke
				grd,                     //fill
				display.LAYERS.WORLD
			);

			//set additional Sky properties
			if(s) {
				s.name = BUILDING_TYPES.SKY;
				s.instanceName = "Sky";
				s.getChildByType = getChildByType; //generic child getter function

				display.addToDisplayList(s, display.LAYERS.WORLD); //visible

				//getter for the Sun
				s.getSun = function () {
					return s.getChildByType(BUILDING_TYPES.SUN, false)[0];
				}

				//create the Sun, keeping a reference to calculate its corona later
				var sun = Sun(world);
				s.addChild(sun);

				//getters for Clouds
				s.getClouds = function () {
					return s.getChildByType(BUILDING_TYPES.CLOUDS);
				}

				//create Clouds and add to Sky
				var numClouds = factory.getRandomInt(DIMENSIONS[BUILDING_TYPES.CLOUD].minClouds, 
					DIMENSIONS[BUILDING_TYPES.CLOUD].maxClouds);
				var i;
				var numClouds = factory.toInt(s.width/250);
				for(i = 0; i < numClouds; i++) {
					s.addChild(Cloud(s, 0.7, 0.9*s.width, 0.5*s.height, grd));
				}
				for(i = 0; i < numClouds; i++) {
					s.addChild(Cloud(s, 0.65, 0.9*s.width, 0.5*s.height, grd));
				}
				for(i = 0; i < numClouds; i++) {
					s.addChild(Cloud(s, 0.6, 0.9*s.width, 0.5*s.height, grd));
				}
				numClouds -= 1; if(numClouds < 1) numClouds = 1;
				for(i = 0; i < numClouds; i++) {
					s.addChild(Cloud(s, 0.55, 0.9*s.width, 0.5*s.height, grd));
				}
				numClouds -= 1;
				for(i = 0; i < numClouds; i++) {
					s.addChild(Cloud(s, 0.5, 0.9*s.width, 0.5*s.height, grd));
				}
				numClouds -= 1; if(numClouds < 1) numClouds = 1;
				for(i = 0; i < numClouds; i++) {
					s.addChild(Cloud(s, 0.4, 0.9*s.width, 0.5*s.height, grd));
				}
				numClouds -= 1;
				for(i = 0; i < numClouds; i++) {
					s.addChild(Cloud(s, 0.3, 0.9*s.width, 0.5*s.height, grd));
				}
				if(numClouds < 1) numClouds = 1;
				for(i = 0; i < numClouds; i++) {
					s.addChild(Cloud(s, 0.3, 1.0*s.width, 0.5*s.height, grd));
				}

				//getter for the Sun
				sun.getCorona = function () {
					return sun.getChildByType (BUILDING_TYPES.CORONA, false)[0];
				}
				//add the Coron as a child of the Sun (but draw OVER Clouds)
				s.addChild(Corona(sun,s));
				
				return s;
			}
		}

		//fallthrough
		elefart.showError("failed to create Sky");
		return false;
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

		//game dimensions set by browser viewport
		var r = display.getGameRect();
		var w = r.right - r.left;
		var h = r.bottom - r.top;

		//create the World
		if(r) {
			var w = factory.ScreenRect(
			0, 
			0, 
			w, 
			h,
			0, 
			display.COLORS.WHITE, 
			display.COLORS.BLACK,
			display.LAYERS.WORLD
			);

			//set additional World propeties
			if(w) {
				w.name = BUILDING_TYPES.WORLD;
				w.instanceName = "World of Elefart";
				w.getChildByType = getChildByType; //generic child getter function
				w.parent = null; //World has no parent
				w.setRectBorderRadius(0); //no border
				w.setOpacity(0.0); //World is invisible

				//getters
				w.getBuilding = function () {
					return w.getChildByType (BUILDING_TYPES.BUILDING, false)[0];
				}
				w.getSky = function () {
					return w.getChildByType (BUILDING_TYPES.SKY, false)[0];
				}
				//we don't add World to display list

				return w;
			}
		}

		//fallthrough
		elefart.showError("Failed to create World");
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

		//kill the old world display list
		display.initDisplayList();

		//(re)set dimensions
		setDimensions(display.getCSSBreakpoint());

		setFloors();

		//reset the world
		world = World();
		if(world) {
			world.addChild(Sky(world));
			//world.addChild(Sun(world));
			world.addChild(Building(world));
			window.w = world; /////////////////////////////////////////////////////////////////////////
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