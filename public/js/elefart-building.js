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
	 * @description constant for no floor, e.g. when a search for a BuildingFloor
	 * yields no result
	 */
	var NO_FLOOR = -2;

	/** 
	 * @readonly
	 * @description constant of movement is "on"
	 */
	var ON = true;

	/** 
	 * @readonly
	 * @description contant of movement is "off"
	 */
	var OFF = false;

	/** 
	 * @readonly
	 * @description constant for upward movement
	 */
	var UP = -1;
	/** 
	 * @readonly
	 * @description constant for downward movement
	 */
	var DOWN = +1;
	/** 
	 * @readonly
	 * @description constant for leftward movement
	 */
	var LEFT = -1;
	/** 
	 * @readonly
	 * @description constant for rightward movement
	 */
	var RIGHT = +1;

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
		BUILDING_ROOF:"BUILDING_ROOF",
		BUILDING_ROOF_SIDE:"BUILDING_ROOF_SIDE",
		BUILDING_ROOF_CUPOLA:"BUILDING_ROOF_CUPOLA",
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
		top:0.0, //RELATIVE to World
		left:0.0,
		width:1.0,
		height:0.1,
	},
	DIMENSIONS[BUILDING_TYPES.CLOUD] = {
		width:0.2, //RELATIVE to Sky
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
		top:0.1, //RELATIVE to World
		left:0.0,
		width:1.0,
		height:0.8, //varies
		wallSize:0.007,
		roofWidth:0.75, //RELATIVE to wallSize
		MIN_WALL:6
	},
	DIMENSIONS[BUILDING_TYPES.BUILDING_SIGN] = {
		top:0.04, //RELATIVE to Sky
		left:0.07, //varies
		width:0.3
	},
	DIMENSIONS[BUILDING_TYPES.BUILDING_FLOOR] = {
		height:0.1 //height of entire BuildingFloor
	},
	DIMENSIONS[BUILDING_TYPES.BUILDING_FLOORBASE] = {
		height:0.01 //height of walking surface at bottom BuildingFloor
	},
	DIMENSIONS[BUILDING_TYPES.ELEVATOR_SHAFT] = {
		width:0.1, //the entire ElevatorShaft
		subWidth:0.5, //RELATIVE the ElevatorShaft (visible band)
		subOpacity:0.2 //opacity of central colored region of shaft
	},
	DIMENSIONS[BUILDING_TYPES.ELEVATOR_DOORS] = {
		width:1.0, //RELATIVE TO ElevatorShaft
		height:0.8 //RELATIVE to BuildingFloor
	},
	DIMENSIONS[BUILDING_TYPES.ELEVATOR] = {
		width:0.65, //width increase RELATIVE to ElevatorShaft width
		speed:6, //pixel movement
		adjust:1.8 //braking on overshooting a floor
	},
	DIMENSIONS[BUILDING_TYPES.CONTROL_PANEL] = {
		top: 0.8,
		left:0.0,
		bottom:1.0,
		right:1.0
	};

	var ELEVATOR_STATES = {
		OPENING_DOORS:"OPENING_DOORS",
		OPEN:"OPEN_DOORS",
		CLOSING_DOORS: "CLOSING_DOORS",
		CLOSED:"CLOSED",
		MOVING:"MOVING"
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
			DIMENSIONS.BUILDING_FLOOR.height = 1/dim.floors;
			DIMENSIONS.BUILDING_SIGN.left = dim.signx; //sign start RELATIVE to Building, Sky width
			DIMENSIONS.BUILDING_SIGN.width = dim.signw;
			DIMENSIONS.ELEVATOR_SHAFT.subWidth = dim.subshaft;
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

		//compute height of building floors
		if(gh < 100) {
			console.log("LESS THAN 100")
			DIMENSIONS.BUILDING.top = 0.33;
			DIMENSIONS.BUILDING.height = 0.33;
			DIMENSIONS.BUILDING_FLOOR.height = 1.0;
			DIMENSIONS.BUILDING_SIGN.height = 1.0;
		}
		else if(gh < 240) {
			console.log("LESS THAN 240")
			DIMENSIONS.BUILDING.top = 0.25;
			DIMENSIONS.BUILDING.height = 0.5
			DIMENSIONS.BUILDING_FLOOR.height = 0.5;
			DIMENSIONS.BUILDING_SIGN.height = 0.85;
		}
		else if(gh < 320) {
			console.log("LESS THAN 320")
			DIMENSIONS.BUILDING.top = 0.20;
			DIMENSIONS.BUILDING.height = 0.6;
			DIMENSIONS.BUILDING_FLOOR.height = 0.4;
			DIMENSIONS.BUILDING_SIGN.height = 0.75;
		}
		else if(gh < 480) {
			console.log("LESS THAN 480")
			DIMENSIONS.BUILDING.top = 0.16;
			DIMENSIONS.BUILDING.height = 0.64;
			DIMENSIONS.BUILDING_FLOOR.height = 0.25;
			DIMENSIONS.BUILDING_SIGN.height = 0.65;
		}
		else if(gh < 550) {
			console.log("LESS THAN 550")
			DIMENSIONS.BUILDING.top = 0.14;
			DIMENSIONS.BUILDING.height = 0.72;
			DIMENSIONS.BUILDING_FLOOR.height = 0.20;
			DIMENSIONS.BUILDING_SIGN.height = 0.6;
		}
		else if(gh < 760) {
			console.log("LESS THAN 760")
			DIMENSIONS.BUILDING.top = 0.14;
			DIMENSIONS.BUILDING.height = 0.72;
			DIMENSIONS.BUILDING_FLOOR.height = 0.18;
			DIMENSIONS.BUILDING_SIGN.height = 0.55;
		}
		else if(gh < 960) {
			console.log("LESS THAN 960")
			DIMENSIONS.BUILDING.top = 0.10;
			DIMENSIONS.BUILDING.height = 0.80;
			DIMENSIONS.BUILDING_FLOOR.height = 0.15;
			DIMENSIONS.BUILDING_SIGN.height = 0.5;
		}
		else if(gh < 1100) {
			console.log("LESS THAN 1100")
			DIMENSIONS.BUILDING.top = 0.10;
			DIMENSIONS.BUILDING.height = 0.80;
			DIMENSIONS.BUILDING_FLOOR.height = 0.12;
			DIMENSIONS.BUILDING_SIGN.height = 0.45;
		}
		else if(gh < 1400) {
			console.log("LESS THAN 1400")
			DIMENSIONS.BUILDING.top = 0.10;
			DIMENSIONS.BUILDING.height = 0.80;
			DIMENSIONS.BUILDING_FLOOR.height = 0.11;
			DIMENSIONS.BUILDING_SIGN.height = 0.45;
		}
		else {
			console.log("Huge dimensions")
			DIMENSIONS.BUILDING.top = 0.07;
			DIMENSIONS.BUILDING.height = 0.82;
			DIMENSIONS.BUILDING_FLOOR.height = 0.10;
			DIMENSIONS.BUILDING_SIGN.height = 0.45;
		}

		//bind Sky and top of Building
		DIMENSIONS.SKY.height = DIMENSIONS.BUILDING.top;
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
		if(type === undefined) {
			console.log("building.getChildByType(), undefined type");
		}
		var len = this.children.length;
		for(var i = 0; i < len; i++) {
			var o = this.children[i];
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
	 * GAS FROM PEOPLE
	 * ============================
	 */

	/** 
	 * @constructor PersonGas
	 * @classdesc the gas used as a weapon in the game
	 * - parent: Person(s) or Elevators (can transfer)
	 * - grandparent: ElevatorFloor or Building
	 * - children: none
	 * @returns {Gas|false} a Gas object, or false
	 */
	function PersonGas () {
		return false;
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
	 * @param {ElevatorFloor} the default BuildingFloor the Person starts on. Persons 
	 * "attach" to both BuildingFloors (includng the BuildingRoof) and Elevators.
	 * @returns {Person|false} a Person object, or false
	 */
	function Person (floor) {
		return false;
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
	 * @param {ScreenObject} building the Building (can be null)
	 * @param {Boolean} display if true, add to displayList
	 * @returns {Elevator|false} an Elevator object, or false
	 */
	function Elevator (building, shaft, subShaft, floorNum) {
		var numFloors = Math.ceil(1/DIMENSIONS.BUILDING_FLOOR.height);
		var t = building.top;
		var w = factory.toInt(shaft.width * DIMENSIONS.ELEVATOR.width);
		var margin = factory.toInt((shaft.width - w)/2);
		var l = shaft.left + margin;
		var h = factory.toInt(building.getFloorHeight() - building.getFloor(1).getBaseHeight());

		/** 
		 * correction for some screen sizes that make Elevator too narrow
		 * NOTE: this calculation matches the independent calculation 
		 * in ElevatorShaft
		 */
		if(h > w) {
			h = w;
		}

		//create the Elevator
		var e = factory.ScreenRect(
				l, 
				t,
				w, 
				h, 
				8,                //stroke width
				display.COLORS.BLACK,  //stroke color
				display.COLORS.WHITE,  //fill color
				display.LAYERS.ELESPACE1 //bottom layer
			);
			if(e) {
				e.name = BUILDING_TYPES.ELEVATOR;
				e.instanceName = "Elevator #:" + shaft.shaftNum;
				e.parent = shaft;      //set parent early, before addChild
				e.setRectBorderRadius(3);
				e.floor = shaft.getFloor(floorNum); //get the default assigned BuildingFloor
				e.floorQueue = [];

				//animation movement params
				e.engine = {
					is:OFF,
					speed:DIMENSIONS.ELEVATOR.speed, //may be positive or negative
					adjust:DIMENSIONS.ELEVATOR.adjust, //slow engine speed back on overshoot, lower bound 1.0, higher values reduce slow bounce
					teleport:false, //move immediately to next destination in elevatorQueue
					turn:0 //animation of elevator cables
				};

				//custom drawing routine
				e.customDraw = function (ctx) {
					//TODO:draw wires for Elevator in Shaft
					var center = e.parent.left + (e.parent.width/2);
					var elevTop = e.top - ctx.lineWidth;
					//var oldWidth = ctx.lineWidth;
					if(e.top > e.parent.top + 10) {
						ctx.lineWidth = 1.0;
						//ctx.strokeStyle = 'rgba(0,0,0,0.2)';
						//Elevator cables
						ctx.moveTo(center - 2, e.parent.top);
						ctx.lineTo(center - 2, elevTop);
						ctx.moveTo(center + 2, e.parent.top);
						ctx.lineTo(center + 2, elevTop);
						ctx.stroke();
						//on top of Elevator
						ctx.fillStyle = ctx.strokeStyle;
						ctx.fillRect(center-8, e.top - 10, 16, 8); //TODO MAKE PERCENTS
						e.engine.turn++; if(e.engine.turn > 30) e.engine.turn = 0;
						ctx.moveTo(center -4, e.top -8);
						if(e.engine.is === ON && e.engine.turn > 10 && e.engine.turn < 20) {
							ctx.fillStyle = 'rgba(255,0,0,0.5)';
							ctx.fillRect(center -4, e.top - 8, 8, 6);
						}
					}
				}

				/** 
				 * @method Elevator.updateByTime()
				 * @description update Elevator position
				 * @returns {Boolean} if object changed in any way, return true, else false
				 */
				e.updateByTime = function () {
					if(e.engine.is === ON) {
						var engine = e.engine,
						dest = e.floorQueue[0], 
						speed = engine.speed,
						slow,
						inc;
						if(e.floorQueue.length > 0) {

							if(engine.teleport === true) {
								console.log("teleport")
								var diff = dest.bottom - e.bottom;
								e.move(0, diff);
								engine.teleport = false;
							}
							else if(e.bottom === dest.bottom) {
								console.log("removing dest")
								engine.teleport = false; //never teleport by default
								//engine.is = OFF;
								e.floor = dest; //local copy of BuildingFloor
								e.removeFloorFromQueue(dest);
								console.log("floorQueue length now:" + e.floorQueue.length)
							}
							else if(e.floor.bottom > dest.bottom) {
								//going up, check for overshoot
								//console.log("up")
								if(e.bottom < dest.bottom) { //overshoot!
									////////console.log("UP inc:"+inc)
									inc = (dest.bottom - e.bottom);///engine.adjust;
									///////console.log("INC:"+inc)
									if(inc < 1) {
										/////////console.log("REMOVING")
										e.floor = dest;
										e.removeFloorFromQueue(dest);
										e.moveTo(e.left, dest.bottom - e.height);
									}
									else {
										inc /= engine.adjust; //slow the return
										e.move(0, inc); //bounce
									}
								}
								else {
									//TODO: ADD SLOW HERE AS A PARAMETER
									//var slow = ((e.bottom - dest.bottom)/e.height);
									if(slow < 1.0) speed *= slow;
									if(speed < 2.0) speed = 1.0;
									e.move(0, -speed); //default speed
								}
							}
							else if(e.floor.bottom < dest.bottom) {
								//going down, check for overshoot
								//console.log("down")
								if(e.bottom > dest.bottom) { //overshoot!
									inc = (dest.bottom - e.bottom);///engine.adjust;
									////////console.log("INC:"+inc)
									if(inc > -1) {
										e.floor = dest;
										e.removeFloorFromQueue(dest);
										e.moveTo(e.left, dest.bottom - e.height);
									}
									else {
										inc /= engine.adjust; //slow the return
										e.move(0, inc); //bounce
									}
								}
								else {
									e.move(0, speed); //default speed
								}
								return true;
							}
						} //floorQueue > 0
					}
					return false;
				}

				//add getters and setters
				e.getShaft = function () {
					return e.parent;
				}

				e.getFloors = function () {
					return e.parent.getFloors();
				}

				//get the number of floors our ElevatorShaft goes to
				e.getNumFloors = function () {
					return e.parent.getFloors().length;
				}

				/** 
				 * @method e.moveToFloor 
				 * @description move Elevator to a given BuildingFloor
				 * @param {Number} num the floor, in building coordinates (opposite actual 
				 * onscren pixel coordinates)
				 * @param {Boolean} animate if false, move instantly to the BuildingFloor. If 
				 * true, start moving and animating the move.
				 * @return {Boolean} if moved, returned true, else false
				 */
				e.moveToFloor = function (num, animate) {
					if(!animate) {
						e.engine.teleport = true;
					}
					return e.addFloorToQueue(num);
				}

				//messages to the ElevatorDoors (children of BuildingFloor)
				e.closeElevatorDoors = function () {

				}
				e.openElevatorDoors = function () {

				}
				//Elevator floor queue

				/** 
				 * @method floorInQueue
				 * @description find a BuildingFloor by its floorNumber or 
				 * with the BuildingFloor object itself
				 * @param {ElevatorFloor|Number} floor the ElevatorFloor, or its 
				 * floorNumber. 
				 * @returns {Number} if the ElevatorFloor is in the elevatorQueue, return 
				 * its index in the queue, else return NO_FLOOR constant.
				 */
				e.floorInQueue = function (floor) {
					var floorNum;
					if(!factory.isNumber(floor)) {
						floorNum = floor.floorNum;
					}
					else {
						floorNum = floor;
					}
					var len = e.floorQueue.length;
					for(var i = 0; i < len; i++) {
						if(e.floorQueue[i].floorNum === floorNum) {
							return true;
						}
					}
					return NO_FLOOR;
				}

				e.initQueue = function () {
					e.floorQueue = [];
				}

				/** 
				 * @method Elevator.addFloorToQueue 
				 * @description add a floor to the Elevator.floorQueue, moving it
				 * at updates
				 */
				e.addFloorToQueue = function (floor) {
					var floorNum, len;
					if(!factory.isNumber(floor)) {
						floorNum = floor.floorNum;
					}
					else {
						floorNum = floor;
						if(floorNum === ROOF && e.parent.hasShaftTop) {
							floor = getBuilding().getRoof();
						}
						else {
							var floors = e.getFloors();
							len = floors.length;
							for(var i = 0; i < len; i++) {
								if(floors[i].floorNum === floorNum) {
									floor = floors[i];
								}
							}
						}
					}
					if(!floor.floorNum) {
						console.log("couldn't find floor:" + floor);
						return false;
					}
					console.log("getting floor with floorNum:" + floorNum)
					//make sure floor isn't alredy in queue
					len = e.floorQueue.length;
					for(var i = 0; i < len; i++) {
						if(floorNum === e.floorQueue[i].floorNum) {
							console.log("floor:" + floorNum + " already in queue");
							return false;
						}
					}
					if(floorNum === ROOF && e.parent.hasShaftTop) {
						console.log("add ROOF:" + floor + " to elevator:" + e.id + " queue")
						e.engine.is = ON;
						e.floorQueue.push(world.getBuilding().getRoof());
						return floor;
					}
					var fl = e.parent.floorInShaft(floor); //some shafts don't go to all floors
					if(fl) {
						console.log("add ElevatorFloor:" + floor + " to Elevator:" + e.id + " queue")
						e.engine.is = ON;
						e.floorQueue.push(floor);
						return floor;
					}
					return false;
				}

				/** 
				 * @method removeFloorFromQueue
				 * @description remove an ElevatorFloor from the Elevator elevatorQueue
				 * @param {BuildingFloor|Number} a BuildingFloor, or its floor number
				 * @returns {BuildingFloor|null} the BuildingFloor number, or nothing
				 */
				e.removeFloorFromQueue = function (floor) {
					var floorNum;
					if(!factory.isNumber(floor)) { //a BuildingFloor object
						floorNum = floor.floorNum;
					}
					else {
						floorNum = floor;
					}
					if(!floor.floorNum) {
						console.log("couldn't find floor:" + floor);
						return false;
					}
					//otherwise, remove the BuildingFloor from floorQueue
					console.log("removing floor with floorNum:"+ floor.floorNum)
					var len = e.floorQueue.length;
					for(var i = 0; i < len; i++) {
						if(e.floorQueue[i].floorNum === floorNum) {
							floor = e.floorQueue.splice(i, 1);
							if(e.floorQueue.length < 1) {
								e.engine.is = OFF; //no more BuildingFloors to go to
							}
							return floor;
						}
					}
					return NO_FLOOR;
				}

				//set default floor
				e.moveToFloor(floorNum);
				display.addToDisplayList(e, display.LAYERS.ELESPACE1);
				controller.addToUpdateList(e);

				window.elev = e; ///////////////////////////////////////

				return e;
			}
				//fallthrough
		elefart.showError("failed to create Elevator at shaft:" + shaft.shaftNum);
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
	 * @param {ElevatorShaft} shaft the ElevatorShaft that the doors open to
	 * @param {BuildingFloor} floor the BuildingFloor that the doors are situated on
	 * @returns {ElevatorDoors|false} an ElevatorDoors object, or false
	 */
	function ElevatorDoors (shaft, floor) {
			//calculate ElevatorShaft position
			var l = shaft.left;
			var w = shaft.width * DIMENSIONS.ELEVATOR_DOORS.width;
			var h = DIMENSIONS.ELEVATOR_DOORS.height * floor.height;
			var t = floor.bottom - h; //offset so overlaps roof, doesn't overlap bottom floor
			var doorMargin = factory.toInt((shaft.width - w)/2);
			var d = factory.ScreenRect(
				l+doorMargin,
				t,
				w,
				h, //we don't include the walking surface
				1,
				display.COLORS.WHITE,
				display.COLORS.CLEAR, //TODO: OVERLAPPING FLOORS, PARTIALLY OPAQUE
				display.LAYERS.DOORS  //display ABOVE Elevators
			);
			if(d) {
				d.name = BUILDING_TYPES.ELEVATOR_DOORS;
				d.instanceName = "ElevatorDoor, floor:"+ floor.floorNum + "shaft:" + shaft.shaftNum; //NOTE: ONE-BASED
				d.parent = shaft; //do before adding to displayList
				d.getChildByType = getChildByType;

				d.setOpacity(0.2); ////////////////////////////////////////////almost transparent for now

				/** 
				 * @method ElevatorDoor.updateByTime()
			 	* @description update ElevatorDoor positions in time
				 * @returns {Boolean} if updated in any way, return true, else false
				 */
				d.updateByTime = function () {
					//TODO: function animating ElevatorDoors
					return false;
				}

				d.close = function () {
					//TODO: function animating ElevatorDoor closing
				}

				d.open = function () {
					//TODO: function animating ElevatorDoor opening
				}

				display.addToDisplayList(d, display.LAYERS.DOORS);

				return d;
			}
		//fallthrough
		elefart.showError("failed to create Elevator Doors at floor:" + floor.floorNum + " shaft:" + shaft.shaftNum);
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
 	 * @param {Number} startFloor (optional) the starting floor of the ElevatorShart, out of all BuildingFloors
 	 * @param {Number} endFloor (optional) the ending floor of the ElevatorShaft. If the hasShaftTop was set to 
 	 * true, it overrides this number.
 	 * @returns {ElevatorShaft|false} an ElevatorShaft object, or false
 	 */
	function ElevatorShaft (building, shaftNum, hasShaftTop, startFloor, endFloor) {
		if(building) {
			var shaftWidth = factory.toInt(DIMENSIONS.ELEVATOR_SHAFT.width * building.width);
			var shaftSubWidth = factory.toInt(DIMENSIONS.ELEVATOR_SHAFT.subWidth * shaftWidth);

			//calculate ElevatorShaft position
			var t = building.top; //offset so overlaps roof, doesn't overlap bottom floor
			//NOTE: adjust shaftNum from one-based to zero-based
			var l = building.left + Math.floor(shaftWidth * (shaftNum-1));// + shaftMargin;
			var w = shaftWidth;
			var h = building.height;

			/** 
			 * to create the shaft "punching through" to the BuildingRoof, we 
			 * have to pre-compute the Elevator size to determine the top of that 
			 * shaft. Elevators aren't elongated, even if the BuildingFloor spacing 
			 * increases. This calculation matches the independent calculation in 
			 * Elevator
			 */
			if(shaftNum === hasShaftTop) {
				var hh = building.getFloorHeight()-building.getWallSize();
				var ww = w * DIMENSIONS.ELEVATOR.width;
				if(hh > ww) hh = ww;
				h += hh;
				t -= hh;
			}

			/** 
			 * not all ElevatorShafts go to all floors
			 */

			//create the ElevatorShaft
			var s = factory.ScreenRect(
				l,
				t,
				w,
				h, //we don't include the walking surface
				1,
				display.COLORS.CLEAR,
				display.COLORS.CLEAR, //TODO: OVERLAPPING FLOORS, PARTIALLY OPAQUE
				display.LAYERS.SHAFTS
				);
			/////////////////display.addToDisplayList(s, display.LAYERS.SHAFTS)

			if(s) {
				s.name = BUILDING_TYPES.ELEVATOR_SHAFT;
				s.shaftNum = shaftNum;                  //NOTE: ZERO-BASED
				s.instanceName = "Shaft #:" + shaftNum; //NOTE: ONE-BASED
				if(shaftNum === hasShaftTop) {
					s.hasShaftTop = true;
				}
				else {
					s.hasShaftTop = false;
				}
				s.parent = building; //need early assignment before addChild
				//assign generic getter function
				s.getChildByType = getChildByType;

				//functions that Elevator can query for its position

				//draw the visible SubShaft

				/** 
				 * @method ElevatorShaft.getSubShaft
				 * @description get the visible subshaft in the ElevatorShaft
				 * @returns {ScreenRect} returns the visible Rect defining the subshaft
				 */
				s.getSubShaft = function () {
					return s.getChildByType(BUILDING_TYPES.ELEVATOR_SUBSHAFT, false)[0];
				};

				/* 
				 * ask Building for the (walkline) start of each BuildingFloor the ElevatorShaft 
				 * goes to, where People and Elevators rest
				 */
				s.floors = [];
				var fls = building.getFloors();
					var len =fls.length;
					for(var i = 0; i < len; i++) {
						var fl = fls[i],
						start = fl.bottom;
						//console.log("start:" + start + " bottom:" + s.bottom + " top:" + s.top)
						if(start <= s.bottom && start >= s.top) {
							//only BuildingFloors that ElevatorShaft goes to
							//add the ElevatorDoor for each BuildingFloor
							var ed = ElevatorDoors(s, fl); //added as child to ElevatorShaft
							//add the floors
							s.floors.push(fl); //only Floors that Shaft goes to
						}
					}

				/** 
				 * @method ElevatorShaft.getFloors
				 * @description get BuildingFloors that ElevatorShaft goes to
				 * @returns {Array<BuildingFloor>} a list of BuildingFloors
				 */
				s.getFloors = function () {
					return s.floors;
				};

				/** 
				 * @method ElevatorShaft.getFloor
				 * @description get a specific BuildingFloor
				 * @returns {BuildingFloor|false} the BuildingFloor. If the shaft doesn't 
				 * go to that floor, return false
				 */
				s.getFloor = function (floorNum) {
					var len = s.floors.length;
					for(var i = 0; i < len; i++) {
						if(s.floors[i].floorNum === floorNum) {
							return s.floors[i];
						}
					}
					elevfart.showError("Invalid floor for this shaft:" + s.instanceName + " floorNum:" + floorNum);
				}

				/** 
				 * @method ElevatorShaft.floorInShaft
				 * @description see if a BuildingFloor intersects our ElevatorShaft, 
				 * @param {BuildingFloor|Number} floor either the floor.floorNum, or 
				 * the BuildingFloor object itself
				 * @returns {BuildingFloor|false} if true, the BuildingFloor, else false
				 */
				s.floorInShaft = function (floor) {
					var whichFloor;
					if(!factory.isNumber(floor)) {
						whichFloor = floor.floorNum;
					}
					else {
						whichFloor = floor;
					}
					var len = s.floors.length;
					for(var i = 0; i < len; i++) {
						var floor = s.floors[i];
						if(floor.floorNum === whichFloor) {
							return floor;
						}
					}
					return false;
				}

				//subShaft color
				var rgbaColor = factory.getRGBAfromRGB(
					display.COLORS.PINK, 
					DIMENSIONS.ELEVATOR_SHAFT.subOpacity
					);

				var shaftMargin = Math.floor((shaftWidth - shaftSubWidth)/2);

				//correction for odd vs even widths
				if(shaftWidth % 2) shaftMargin-=1;

				//create the ElevatorShaft subShaft
				var sb = factory.ScreenRect(
						l + shaftMargin,
						t,
						shaftSubWidth,
						h,
						0,
						display.COLORS.CLEAR,
						rgbaColor,
						display.LAYERS.SHAFTS
					);
				if(sb) {
					//add the ElevatorShaft rect
					sb.name = BUILDING_TYPES.ELEVATOR_SUBSHAFT;
					sb.instanceName = "Elevator SubShaft for #:" + shaftNum;
					s.addChild(sb);
					display.addToDisplayList(sb, display.LAYERS.SHAFTS);

					//Create Elevator

					/**
					 * @method ElevatorShaft.getElevator
					 * @description get the Elevator in the ElevatorShaft
					 * @returns {Elevator} the (single) Elevator in the ElevatorShaft
					 */
					s.getElevator = function () {
						return s.getChildByType(BUILDING_TYPES.ELEVATOR, false)[0];
					}
					//add Elevator
					s.addChild(Elevator(building, s, sb, 1)); //building, shaft, subshaft, floorNum

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
	 * FLOOR GOODIES
	 * ============================
	 */

	/** 
	 * @constructor FloorGoodie
	 * @classdesc an item which helps a Person withstand a Gas attack
	 * - parent: BuildingFloor or Person
	 * - grandparent: Building or Elevator
	 * - children: none
	 * @returns {Goodie|false} a Goodie object, or false
	 */
	function FloorGoodie () {

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
		var h = factory.toInt(building.height/numFloors);
		var t = building.top + (floorNum * h);
		var l = building.left;
		var w = building.width;
		//create the BuildingFloor
		var f = factory.ScreenRect(
			l,
			t,
			w,
			h, //we don't include the walking surface
			0,
			display.COLORS.BROWN,
			display.COLORS.YELLOW, 
			display.LAYERS.BUILDING,
			display.getHotelWalls() //NOTE: ADDING AN IMAGE
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

			//getters

			/** 
			 * @method BuildingFloor.getBaseHeight
			 * @description get the height for the visible walking floor for a BuildingFloor
			 * @returns {Number} the height of the visible floor
			 */
			f.getBaseHeight = function () {
				var baseHeight = factory.toInt(DIMENSIONS.BUILDING.wallSize * building.height);
				if(baseHeight > MAX_WALLS) baseHeight = MAX_WALLS;
				return baseHeight;
			}

			/** 
			 * @method BuildingFloor.getFloorBase
			 * @description get the visible floor base for a BuildingFloor
			 * @returns {ScreenRect} the ScreenRect creating the visible floor.
			 */
			f.getFloorBase = function () {
				return f.getChildByType(BUILDING_TYPES.BUILDING_FLOORBASE);
			}

			var baseHeight = f.getBaseHeight();

			//floorbase
			//always add a floorbase (the walking layer at the bottom of the BuildingFloor)
			var fb = factory.ScreenRect(
				l,
				t,
				w,
				baseHeight, //Rect drawn downwards into lower floor
				5, //stroke
				display.COLORS.BROWN,
				display.COLORS.BROWN,
				display.LAYERS.BUILDING
				);
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
	 * @constructor BuildingSign
	 * @classdesc the sign on Building's BuildingRoof
	 * - parent: Building
	 * - grandparent: World
	 * - children: none
	 * @param {Building} building the Building object, linked as parent to this class
	 * @returns {BuildingSign|false} a BuildingSign object, or false
	 */
	function BuildingSign (building) {
		var signImg = display.getHotelSign();
		var ar = signImg.width/signImg.height;
		var sky = building.parent.getSky();

		//compute BuildingSign based on dimensions
		var l = DIMENSIONS.BUILDING_SIGN.left * building.width;
		var h = DIMENSIONS.BUILDING_SIGN.height * sky.height; //Sky
		var w = ar * signImg.height;
		var ww = DIMENSIONS.BUILDING_SIGN.width * building.width;
		if(ww < w) w = ww;
		var t = sky.height - h;

		//create the BuildingSign
		var s = factory.ScreenRect(
			l, 
			t, 
			w,
			h, 
			0, 
			display.COLORS.CLEAR, 
			display.COLORS.CLEAR, 
			display.LAYERS.BUILDLING, 
			signImg
			);

		//set additional BuildingSign properties and add child objects
		if(s) {
			s.name = BUILDING_TYPES.BUILDING_SIGN;
			s.instanceName = "GasLight Building Sign";
			display.addToDisplayList(s, display.LAYERS.BUILDING);
			return s;
			}

		//fallthrough
		elefart.showError("Failed to create BuildingSign");
		return false;
	}

	/** 
	 * @constructor BuildingCupola
	 * @classdesc surrounding BuildingRoof extension for the Elevator that punches
	 * through to the BuildingRoof.
	 * @param {Building} building the Building object
	 * @param {BuildingRoof} roof the BuildingRoof (for early parent assignment)
	 * @param {Elevator} elevator a sample Elevator object for calculating Cupola dimensions
	 * @returns {BuildingCupola|false} if ok return a BuildingCupola object, else false
	 */
	function BuildingCupola (building, roof, roofShaft, elevator) {
			//draw Cupola as a rounded box, open on bottom, around ElevatorShaft punching through Roof
			var roofWidth = building.lineWidth*DIMENSIONS.BUILDING.roofWidth;
			var elevBuffer = 4, elevBufferWidth = elevBuffer*2;
			var lw2 = roofWidth + roofWidth;
			l = elevator.left-roofWidth - elevBuffer;
			t = roofShaft.top-elevBufferWidth;
			w = elevator.width + lw2 + elevBufferWidth;
			h = building.top - roofShaft.top+elevBufferWidth;
			//cupola outline
			var c = factory.ScreenRect(
				l,
				t,
				w,
				h, //visible BuildingRoof height
				roofWidth*2,
				display.COLORS.BLACK,
				display.COLORS.CLEAR, //openBoxes can't be filled!
				display.LAYERS.BUILDING
				);
			if(c)  {
				c.name = BUILDING_TYPES.BUILDING_ROOF_CUPOLA;
				c.instanceName = "Roof Cupola";
				c.parent = roof; //early assignment
				c.setRectBorderRadius(roofWidth);
				c.missingSide = factory.SIDES.BOTTOM; //NOTE: this makes it an Open Box
				c.roofShaft = roofShaft;

				//getters for ElevatorShaft punching through BuildingRoof
				c.getRoofShaft = function () {
					return c.roofShaft;
				}

				/** 
				 * @method RoofCupola.updateByTime()
				 * @description update RoofCupola appearance
				 * @returns {Boolean} if updated in any way, return true, else false
				 */
				c.updateByTime = function () {
					return false;
				}

				//add an internal Rect with a yellow background
				//that punches through the Roof to the top BuildingFloor
				//l+= roofWidth;
				//t+= roofWidth;
				//w-=(roofWidth*2);
				//h = h + elevBuffer - roofWidth;
				var cb = factory.ScreenRect(
					l,
					t,
					w,
					h+lw2,
					0,
					display.COLORS.CLEAR,
					display.COLORS.YELLOW,
					display.LAYERS.BUILDINGBACK,
					display.getHotelWalls()//, //NOTE: ADDING AN IMAGE
					);
				cb.setOpacity(0.5);
				cb.setSpriteCoords({ //where to sample when drawing image
					rows:13,
					cols:13,
					currRow:0,
					currCol:0
				});

				cb.instanceName = "Roof Cupola Back";
				cb.roofShaft = roofShaft;

				c.addChild(cb);

				//add a shadow
				//get a shadow gradient
				var shadow = building.lineWidth * 5;
				if(shadow < 10) shadow = 10; //for very small screens
				var grd = display.getBackgroundTexture(
					display.MATERIALS.GRADIENT_SHADOW, 
					l, 
					t, 
					l,
					t+shadow
				);
				//add the shadow Rect
				var cs = factory.ScreenRect(
					l,
					t,
					w,
					shadow,
					0,
					display.COLORS.CLEAR,
					grd,
					display.LAYERS.ELEBACK
				);
				cs.setOpacity(0.6);
				//add to displayList in order
				display.addToDisplayList(cb, display.LAYERS.ELEBACK); //back of BuildingCupola
				display.addToDisplayList(cs, display.LAYERS.ELEBACK); //shadow in BuildingCupola
				display.addToDisplayList(c, display.LAYERS.BUILDINGBACK);  //Rounded box defining BuildingCupola

				return c;
			}
		elefart.showError("Failed to create BuildingCupola");
		return false;
	}

	/** 
	 * @constructor BuildingRoof
	 * @classdesc special BuildingFloor, actually the roof of the Building. Draw a roof 
	 * pattern on the base, extending into the next lower BuildingFloor
	 * @param {Building} building the Building object, linked as parent to this class
	 * @param {ElevatorShaft} roofShaft the shaft punching through the BuildingRoof to the 
	 * BuildingCupola.
	 * @returns {BuildingRoof|false} a BuildingRoof, or false
	 */
	function BuildingRoof (building, roofShaft) {
		//BuildingRoof overlaps Sky
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
		//get the subShaft in roofShaft
		var ss = roofShaft.getElevator();
		var roofWidth = building.lineWidth*DIMENSIONS.BUILDING.roofWidth;

		//create the visible roof (to the left and right of the roofShaft)
		if(r) {
			r.name = BUILDING_TYPES.BUILDING_ROOF;
			r.instanceName = "Building Roof";
			r.getChildByType = getChildByType; //generic child getter function
			r.floorNum = ROOF;
			r.walkLine = building.top-roofWidth;
			r.roofShaft = roofShaft; //store local reference to the ElevatorShaft

			//getters
			r.getRoofSides = function () {
				return r.getChildByType(BUILDING_TYPES.BUILDING_ROOF_SIDE, false);
			}

			r.getRoofShaft = function () {
				return r.roofShaft;
			}

			//LEFT side of BuildingRoof, visible Rect
			l = building.left - roofWidth;
			t = r.walkLine,
			w = ss.left;
			h = roofWidth;
			var roofLeft = factory.ScreenRect(
				l,
				t,
				w,
				h, //visible BuildingRoof height
				0,
				display.COLORS.CLEAR,
				display.COLORS.BLACK,
				display.LAYERS.BUILDING
				);
			roofLeft.name = BUILDING_TYPES.BUILDING_ROOF_SIDE;
			roofLeft.instanceName = "Roof Left";
			r.addChild(roofLeft);
			display.addToDisplayList(roofLeft, display.LAYERS.ELEBACK);

			//RIGHT side of BuildingRoof, visible Rect
			l = ss.right;
			t = r.walkLine; //////////////////////building.top - roofWidth;
			w = building.right + roofWidth - ss.right;
			h = roofWidth;
			var roofRight = factory.ScreenRect(
				l,
				t,
				w,
				h, //visible BuildingRoof height
				0,
				display.COLORS.CLEAR,
				display.COLORS.BLACK,
				display.LAYERS.BUILDING
				);
			roofRight.name = BUILDING_TYPES.BUILDING_ROOF_SIDE;
			roofRight.instanceName = "Roof Right";
			r.addChild(roofRight);
			display.addToDisplayList(roofRight, display.LAYERS.ELEBACK);

			//getter for RoofCupola
			r.getRoofCupola = function () {
				return r.getChildByType(BUILDING_TYPES.BUILDING_ROOF_CUPOLA, false)[0];
			}
			//add the Building Cupola on the BuildingRoof
			r.addChild(BuildingCupola(building, r, roofShaft, ss));

			return r;
		}
		//fallthrough
		elefart.showError("Failed to create BuildingRoof");
		return false;
	}

	/* 
	 * ============================
	 * BUILDING
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
		var ww = factory.toInt(DIMENSIONS.BUILDING.wallSize * world.height);
		var l = factory.toInt(DIMENSIONS.BUILDING.left * world.width);
		var t = factory.toInt(DIMENSIONS.BUILDING.top * world.height)-1; //overlap slightly onto Sky
		var w = factory.toInt(DIMENSIONS.BUILDING.width * world.width);// +1 fixes width at some dimensions
		var h = factory.toInt(DIMENSIONS.BUILDING.height * world.height);

		//create Building
		var b = factory.ScreenRect(
				l, 
				t, 
				w, 
				h,
				ww, //stroke
				display.COLORS.BROWN, 
				display.COLORS.YELLOW,
				display.LAYERS.BUILDING
			);

		//set additional Building properties and add child objects
		if(b) {
			if(ww) {
				b.shrink(ww); //shrink so stroke shows on left and right of window
			}
			b.name = BUILDING_TYPES.BUILDING;
			b.instanceName = "GasLight Building";
			b.parent = world; //NOTE: have to do here since addChild hasn't happened
			b.getChildByType = getChildByType; //generic child getter function

			//add to Building outline to displayList BEFORE BuildingFloors
			display.addToDisplayList(b, display.LAYERS.BUILDING);

			//getter for BuildingSign
			b.getSign = function () {
				return b.getChildByType(BUILDING_TYPES.BUILDING_SIGN, false)[0];
			}

			//add the BuildingSign on Roof of Building BEFORE BuildingFloors
			b.addChild(BuildingSign(b));

			//TODO: MAKE THESE MORE EFFICIENT - ONLY GET THE FLOORS AND SHAFT REFERENCE
			//TODO: ONE TIME!!!!!!

			//getters for BuildingFloors
			b.getFloor = function (floorNum) {
				if(floorNum < 1) {
					elefart.showError("building.getFloor() invalid floor number:" + floorNum);
					return false;
				}
				return b.getChildByType(BUILDING_TYPES.BUILDING_FLOOR, false, "floorNum", floorNum)[0];
			}
			//NOTE: these getters return results based on CALCULATED, not actual BuildingFloors and ElevatorShafts
			b.getFloors = function () {
				return b.getChildByType(BUILDING_TYPES.BUILDING_FLOOR);
			}
			b.getFloorHeight = function () {
				return b.height/Math.ceil(1/DIMENSIONS.BUILDING_FLOOR.height);
			}
			b.getNumFloors = function () {
				return Math.ceil(1/DIMENSIONS.BUILDING_FLOOR.height);
			}
			b.getNumShafts = function () {
				return factory.toInt(DIMENSIONS.BUILDING.width/DIMENSIONS.ELEVATOR_SHAFT.width);
			}
			b.getWallSize = function () {
				return DIMENSIONS.BUILDING.wallSize * world.height;
			}

			//add BuildingFloors
			var numFloors = b.getNumFloors();
			for(i = 0; i < numFloors; i++) {
				b.addChild(BuildingFloor(b, i, numFloors));
			}

			/** 
			 * @method shaftFloorSelected 
			 * @description stats for a selected Point (e.g. from a mouseclick)
			 * @param {Point} pt the point of the user selection (mouse, touch)
			 * @returns {Object} object containing shaft and floor selected, or 
			 * false for one or both.
			 */
			b.selected = function (pt) {
				if(!pt || !factory.isNumber(pt.x) || !factory.isNumber(pt.y)) {
					elefart.showError("Building.selected() invalid coords, x:" + x + " y:" + y);
				}
				//correct global pt to game coordinates

				//recover Building objects under this click
				var result = {}, i, sf, br, len, shaft;
				sf = b.getShafts();
				len = sf.length;
				for(var i = 0; i < len; i++) {
					shaft = sf[i];
					if(pt.x > shaft.left && pt.x < shaft.right) {
						if(pt.y > shaft.top && pt.y < shaft.bottom) {
							result.shaft = shaft;
							console.log("Selected ElevatorShaft:"+shaft.instanceName + " shaftNum:" + shaft.shaftNum)
							break;
						}
					}
				}
				sf = b.getFloors();
				//return Roof, as a special kind of floor
				len = sf.length;
				for(var i = 0; i < len; i++) {
					floor = sf[i];
					if(pt.y > floor.top && pt.y < floor.bottom) {
						if(pt.x > floor.left && pt.x < floor.right) {
							result.floor = floor;
							console.log("Selected BuildingFloor:" + floor.instanceName + " floorNum:" + floor.floorNum)
							break;
						}
					}
				}
				//if not found check the BuildingRoof
				if(!result.floor && shaft.top < b.top) {
					console.log("checking for ROOF")
					result.floor = b.getRoof();
				}
				return result;
			}

			//get the number of ElevatorShafts we WILL create (getNumShafts() calcs number needed)
			var numShafts = b.getNumShafts();

			//getters for ElevatorShafts
			b.getShaft = function (shaftNum) {
				if(shaftNum < 1) {
					elefart.showError("building.getShaft(), invalid shaft number:" + shaftNum);
				}
				return b.getChildByType(BUILDING_TYPES.ELEVATOR_SHAFT, false, "shaftNum", shaftNum)[0];
			}

			b.getShafts = function () {
				return b.getChildByType(BUILDING_TYPES.ELEVATOR_SHAFT);
			}

			//compute which shaft will go to the BuildingRoof
			var numRoofShaft = 0;
			var min = Math.floor(numShafts/2);
			var ceil = numShafts - 1;
			if(ceil <= min) {
				shaftTop = ceil;
			}
			else {
				numRoofShaft = factory.getRandomInt(Math.ceil(numShafts/2), numShafts-1);
			}
			//create all ElevatorShafts
			for(i = 1; i <= numShafts; i++) {
				b.addChild(ElevatorShaft(b, i, numRoofShaft));
			}

			//getter for BuildingRoof
			b.getRoof = function () {
				return b.getChildByType(BUILDING_TYPES.BUILDING_ROOF, false)[0];
			}

			//create and add BuildingRoof, Floor# -1, and with a opening for the roofShaft
			var roofShaft = b.getShaft(numRoofShaft);
			b.addChild(BuildingRoof(b, roofShaft));

			//return the completed Building
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

		//Cloud randomly assigned x position
		var cloudX = factory.getRandomInt(
			sky.left, 
			sky.right - minWidth
			);

		//random biases to the right, so skew x values to the left
		cloudX -= sky.width * 0.2;
		var cloudY = sky.height * distance * (height/sky.height);

		var l = cloudX;
		var t = cloudY; if(t < 0) t = 0; //top of screen
		var w = l + width*distance;
		var h = t + height*distance;

		//make the cloudRect
		var cloudRect = factory.Rect(
			l,
			t,
			w,
			h
			);

		//compute the Cloud height
		var sFactor = ((1.0 - distance) * (sky.height - t));

		//compute the central point of the Cloud
		var cc = factory.Point(
				(cloudRect.left + cloudRect.width/2), 
				(cloudRect.top + cloudRect.height/2)
			);
		//console.log("cloudRect:" + cloudRect.top + "," + cloudRect.right + "," + cloudRect.bottom + "," + cloudRect.left);

		var pts = factory.createFlowerShape(
				cc, //central Point
				sFactor/3, //outer radius
				sFactor/4, //inner radius
				factory.getRandomInt(0.95, 1.0), //y distortion to oval
				factory.getRandomInt(7, 8), //x distortion to oval
				10 //number of Points
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
			var grd = display.getForegroundTexture(
				display.MATERIALS.GRADIENT_CLOUD, 
				0, 
				c.top - (distance * distance * c.top)/2.5, 
				0, 
				c.bottom
			);
			c.setFill(grd, blendColor); //Cloud fill, plus Sky gradient
			c.distance = distance; //used to animate Cloud layers
			c.name = BUILDING_TYPES.CLOUD;
			c.instanceName = "Cloud";
			c.getChildByType = getChildByType; //generic child getter function
			display.addToDisplayList(c, display.LAYERS.CLOUDS); //get layer and panel for display

			//update function, affects display variables
			c.moveDist = (1.0 - c.distance);

			/** 
			 * @method Cloud.updateByTime()
			 * @description update Cloud positions in time
			 * @returns {Boolean} if updated in any way, return true, else false
			 */
			c.updateByTime = function () {
				var sky = c.parent;
				if(c.left > sky.right) {
					c.move(-(sky.width + c.width), 0);
				}
				c.move(c.moveDist,0);
				return true; //always update!
			}

			controller.addToUpdateList(c); //note should come AFTER .addToDisplayList
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
		var r = DIMENSIONS.SUN.height * world.height * 0.5; if(r < 0) r = 0;
		var r0 = l+r; if(r0 < 0) r0 = 0;
		var r1 = t+r; if(r1 < 0) r1 = r0;
		//create the radial gradient
		var grd = display.getBackgroundTexture(
			display.MATERIALS.GRADIENT_SUN, 
			r0,  //x first circle x
			r1,  //y first circle y
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
		var r = sky.height * 0.5;
		var r0 = sun.radius-(sun.lineWidth*2); if(r0 < 0) r0 = 0;
		var r1 = r; if(r1 < r0) r1 = r0 + 1;
		l = center.x - r;
		t = center.y - r;
		var grd = display.getBackgroundTexture(
			display.MATERIALS.GRADIENT_CORONA, 
			center.x,  //x first circle x
			center.y,  //y first circle y
			r0,        //blends with white border around Sun
			r1         //y2 second circle radius
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
			display.LAYERS.WORLD
			);

			//set additional Corona properties, and make it a child of Sun
			if(c) {
				c.name = BUILDING_TYPES.CORONA;
				c.instanceName = "Corona";
				c.getChildByType = getChildByType; //generic child getter function
				display.addToDisplayList(c, display.LAYERS.WORLD);
				return c;
			}
		}
		//fallthrough
		elefart.showError("failed to create Corona");
		return false;
	}

	/** 
	 * @constructor BadBird
	 * @classdesc a bird in the Sky that attack People on the BuildingRoof with 
	 * the appropriate bird bombs.
	 * - parent: Sky
	 * - grandparent: World
	 * - children: none
	 * @returns {BadBird|false} a BadBird object, or false
	 */
	function BadBird () {
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
		var l = factory.toInt(DIMENSIONS.SKY.left * world.width);
		var t = factory.toInt(DIMENSIONS.SKY.top * world.height);
		var w = factory.toInt(DIMENSIONS.SKY.width * world.width);
		var h = factory.toInt(DIMENSIONS.SKY.height * world.height);

		//Sky color gradient
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
				0, 
				display.COLORS.BLACK, //stroke
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

				//create a set of Clouds with different sizes, shapes, distances, and add to Sky
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
				numClouds -= 1;if(numClouds < 1) numClouds = 1;
				for(i = 0; i < numClouds; i++) {
					s.addChild(Cloud(s, 0.2, 1.0*s.width, 0.5*s.height, grd));
				}
				if(numClouds < 1) numClouds = 1;
				for(i = 0; i < numClouds; i++) {
					s.addChild(Cloud(s, 0.3, 1.3*s.width, 0.5*s.height, grd));
				}

				//getter for the Sun's corona
				sun.getCorona = function () {
					return sun.getChildByType (BUILDING_TYPES.CORONA, false)[0];
				}
				//add the Coron as a child of the Sun 
				s.addChild(Corona(sun, s));

				//add a faded Sun to blend over Clouds
				var sunFade = factory.ScreenCircle(
					sun.left, 
					sun.top, 
					sun.radius,
					3, 
					display.COLORS.WHITE,
					display.COLORS.LIGHT_GREY,
					display.LAYERS.CLOUDS
				);
				sunFade.name = BUILDING_TYPES.CORONA;
				sunFade.instanceName = "Sun Fade";
				sunFade.setOpacity(0.07);
				sun.addChild(sunFade);
				display.addToDisplayList(sunFade, display.LAYERS.CLOUDS);
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
		var r = display.setGameRect();
		var w = factory.toInt(r.right - r.left);
		var h = factory.toInt(r.bottom - r.top);

		//create the World
		if(r) {
			var wo = factory.ScreenRect(
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
			if(wo) {
				wo.name = BUILDING_TYPES.WORLD;
				wo.instanceName = "World of Elefart";
				wo.getChildByType = getChildByType; //generic child getter function
				wo.parent = null; //World has no parent
				wo.setRectBorderRadius(0); //no border
				wo.setOpacity(0.0); //World is invisible

				//getters
				wo.getBuilding = function () {
					return wo.getChildByType(BUILDING_TYPES.BUILDING, false)[0];
				};
				wo.getSky = function () {
					return wo.getChildByType(BUILDING_TYPES.SKY, false)[0];
				};
				//we don't add World to display list

				/** 
				 * @method buildingSelected 
				 * @description stats for a selected Point (e.g. from a mouseclick)
				 * @param {Point} pt the point of the user selection (mouse, touch)
				 * @returns {Building|false} if selected, return a reference to the 
				 * Building, otherwise false
				 */
				wo.buildingSelected = function (pt) {
					var building = w.getBuilding();
					if(pt.y > building.top && pt.y < building.bottom) {
						if(pt.x > building.left && pt.x < building.right) {
							return true;
						}
					}
					return false;
				};

				return wo;
				}
		}

		//fallthrough
		elefart.showError("Failed to create World");
		return false;
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

		setFloors(); //adjust the number of floors and shafts for extreme screens
		//reset the world
		world = World();
		if(world) {
			world.addChild(Sky(world));
			//world.addChild(Sun(world));
			world.addChild(Building(world));
		} //end of if w
	}

	/** 
	 * @method getBuilding
	 * @description return the Building object
	 * @returns {Building|false}
	 */
	function getBuilding () {
		return world.getBuilding();
	}

	/** 
	 * @method getWorld
	 * @description return the World object
	 * @returns {World|false}
	 */
	function getWorld () {
		return world;
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
		getBuilding:getBuilding, //the Building object
		getWorld:getWorld, //the World which holds Building
		buildWorld:buildWorld, //completely re-create World and Building
		init:init,
		run:run
	};

})();