/** 
 * @namespace
 * @fileoverview elefart.building (Model) creates the game objects (building, shafts, elevators, 
 * users, goodies, gas) used during gameplay.
 * @requires elefart
 * @requires elefart.factory
 * @requires elefart.dashboardf
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
	 * @description constant used for top BuildingFloor.
	 */
	var ROOF = -1;

	/** 
	 * @readonly
	 * @description constant for no BuildingFloor, e.g. when searching for a BuildingFloor
	 * yields no result
	 */
	var NO_FLOOR = -2;

	/** 
	 * @readonly
	 * @description constant for no ElevatorShaft, e.g. when searching for a ElevatorShaft
	 * yields no result
	 */
	var NO_SHAFT = -3;

	/** 
	 * @readonly
	 * @description constant for no Elevator, e.g. Person walking on a BuildingFloor
	 */
	var NO_ELEVATOR = -4;

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
		GAS:"GAS",
		HEALTH: "HEALTH",
        LABELS: "LABELS",
		CONTROL_FPS: "CONTROL_FPS",
        CONTROL_LOGO: "CONTROL_LOGO",
        CONTROL_GOODIE_LIST: "CONTROL_GOODIE_LIST",
        CONTROL_GAS_LIST: "CONTROL_GAS_LIST",
		CONTROLS:"CONTROLS"
	};

	/** 
	 * @readonly
	 * @typedef {PERSON_TYPES}
	 * @enum {String}
	 * @description local refrence to the PERSON_TYPES list allowing
	 * correct player types to be chosen locally or via the network.
	 */
	var PERSON_TYPES;

	/** 
	 * @readonly
	 * @typedef {USER_TYPES}
	 * @enum {String}
	 * @description local refrence to the USER_TYPES determining if a 
	 * Person is controlled locall, remotely, or by 'bot' code.
	 */
	var USER_TYPES;

	/** 
	 * @readonly
	 * @typedef {GOODIE_TYPES}
	 * @enum {String}
	 * @description local refrence to the USER_TYPES list for "goodies" 
	 * added to help or hinder Persons in the game (gas masks, perfume).
	 */
	var GOODIE_TYPES;

	/** 
	 * @readonly
	 * @typedef {GAS_TYPES}
	 * @enum {String}
	 * @description local refrence to the GAS_TYPES list for the power 
	 * and reach of a gas eruption in the elevator (shutterblas, sputterblast, 
	 * trill blow).
	 */
	var GAS_TYPES;

	/** 
	 * @readonly
	 * @typedef {DIMENSIONS}
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

	DIMENSIONS[BUILDING_TYPES.ELEVATOR] = {
		width:0.65, //width increase RELATIVE to ElevatorShaft width
		speed:2, //pixel movement on each update
		adjust:1.8 //braking on overshooting a floor
	},

	DIMENSIONS[BUILDING_TYPES.ELEVATOR_DOORS] = {
		width:1.0, //RELATIVE TO ElevatorShaft
		height:0.8 //RELATIVE to BuildingFloor
	},

	DIMENSIONS[BUILDING_TYPES.PERSON] = {
		STANDING:0, //for the spriteboard
		WALKING:1,
		RUNNING:2,
		SQUATTING:3,
		TRAVELING:4,
		FALLING:5,
		speed:2,
		adjust:1.8,
		frameInterval:4 //4 updates before changing sprite frame
	},

	DIMENSIONS[BUILDING_TYPES.GOODIE] = {
		maxGoodie:5,
		height: 0.5 //RELATIVE to BuildingFloor
	},

	DIMENSIONS[BUILDING_TYPES.GAS] = {
		width:0.5, //RELATIVE to Person
		height:0.5, //RELATIVE to person
		maxGas:6,
        gasLoops:4 //number of animation loops
	},

	DIMENSIONS[BUILDING_TYPES.CONTROL_FPS] = {
		width: 0.2, //RELATIVE to Controls
		height:0.25
	},
        
    DIMENSIONS[BUILDING_TYPES.CONTROL_LOGO] = {
        width:0.35,
        height:0.5
    },
        
    DIMENSIONS[BUILDING_TYPES.CONTROL_GAS_LIST] = {
        width: 0.5, //RELATIVE to Controls
        height:0.3
    },
    DIMENSIONS[BUILDING_TYPES.CONTROL_GOODIE_LIST] = {
        width: 0.5, //RELATIVE to Controls
        height:0.3
    },
	DIMENSIONS[BUILDING_TYPES.CONTROLS] = {
		top: 0.8,
		left:0.0,
		bottom:1.0,
		right:1.0,
		margin:0.025,   //RELATIVE to Controls.width
		signTop:0.2,    //RELATIVE to Controls.height
		signLeft:0.2,   //RELATIVE to Controls.width
		signWidth:0.3,  //RELATIVE to Controls.width
		signHeight:0.3  //RELATIVE to Controls.height
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
			console.log("LESS THAN 100");
			DIMENSIONS.BUILDING.top = 0.33;
			DIMENSIONS.BUILDING.height = 0.33;
			DIMENSIONS.BUILDING_FLOOR.height = 1.0;
			DIMENSIONS.BUILDING_SIGN.height = 1.0;
		}
		else if(gh < 240) {
			console.log("LESS THAN 240");
			DIMENSIONS.BUILDING.top = 0.25;
			DIMENSIONS.BUILDING.height = 0.5
			DIMENSIONS.BUILDING_FLOOR.height = 0.5;
			DIMENSIONS.BUILDING_SIGN.height = 0.85;
		}
		else if(gh < 320) {
			console.log("LESS THAN 320");
			DIMENSIONS.BUILDING.top = 0.20;
			DIMENSIONS.BUILDING.height = 0.6;
			DIMENSIONS.BUILDING_FLOOR.height = 0.4;
			DIMENSIONS.BUILDING_SIGN.height = 0.75;
		}
		else if(gh < 480) {
			console.log("LESS THAN 480");
			DIMENSIONS.BUILDING.top = 0.16;
			DIMENSIONS.BUILDING.height = 0.64;
			DIMENSIONS.BUILDING_FLOOR.height = 0.25;
			DIMENSIONS.BUILDING_SIGN.height = 0.65;
		}
		else if(gh < 550) {
			console.log("LESS THAN 550");
			DIMENSIONS.BUILDING.top = 0.14;
			DIMENSIONS.BUILDING.height = 0.72;
			DIMENSIONS.BUILDING_FLOOR.height = 0.20;
			DIMENSIONS.BUILDING_SIGN.height = 0.6;
		}
		else if(gh < 760) {
			console.log("LESS THAN 760");
			DIMENSIONS.BUILDING.top = 0.14;
			DIMENSIONS.BUILDING.height = 0.72;
			DIMENSIONS.BUILDING_FLOOR.height = 0.18;
			DIMENSIONS.BUILDING_SIGN.height = 0.55;
		}
		else if(gh < 960) {
			console.log("LESS THAN 960");
			DIMENSIONS.BUILDING.top = 0.10;
			DIMENSIONS.BUILDING.height = 0.80;
			DIMENSIONS.BUILDING_FLOOR.height = 0.15;
			DIMENSIONS.BUILDING_SIGN.height = 0.5;
		}
		else if(gh < 1100) {
			console.log("LESS THAN 1100");
			DIMENSIONS.BUILDING.top = 0.10;
			DIMENSIONS.BUILDING.height = 0.80;
			DIMENSIONS.BUILDING_FLOOR.height = 0.12;
			DIMENSIONS.BUILDING_SIGN.height = 0.45;
		}
		else if(gh < 1400) {
			console.log("LESS THAN 1400");
			DIMENSIONS.BUILDING.top = 0.10;
			DIMENSIONS.BUILDING.height = 0.80;
			DIMENSIONS.BUILDING_FLOOR.height = 0.11;
			DIMENSIONS.BUILDING_SIGN.height = 0.45;
		}
		else {
			console.log("Huge dimensions");
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
	 * PEOPLE COMPONENTS
	 * ============================
	 */

	 /** 
	  * @constructor Health
	  * @classdesc object controlling and reporting health of a Person
	  */
	function Health (person) {

		var l = 0;
		var t = 0;

		var h = factory.ScreenPoint(
			l, 
			t,
			0,
			display.COLORS.CLEAR,
			display.LAYERS.BACKGROUND
			);
		if(h) {

			h.name = BUILDING_TYPES.HEALTH;
			h.parent = person;
			h.instanceName = person.instanceName + "'s health";
            h.getBuilding = world.getBuilding;
			h.getChildByType = getChildByType; //generic child getter function
			h.value = 100; //perfect health
			return h;
		}

		elefart.showError("failed to create Health for Person:" + person.instanceName);
		return false;
	}
    
	/* 
	 * ============================
	 * FLOOR GOODIES
	 * ============================
	 */

	/** 
	 * @constructor Goodie
	 * @classdesc an item which helps a Person withstand a Gas attack. Note that 
	 * Goodies can only be create AFTER the rest of the Building is constructed.
	 * - parent: BuildingFloor or Person
	 * - grandparent: Building or Elevator
	 * - children: none
	 * @param {Building} the entire building, since we need to add 
	 * AFTER the rest of the Building is constructed.
	 * @returns {Goodie|false} a Goodie object, or false
	 */
	function Goodie (building) {
		var i = 0;

		//get the Goodie spriteboard
		var goodieBoard = display.getGoodieBoard();

		//randomly compute a GoodieType number
		var goodieType = factory.getRandomInt(0, (goodieBoard.cols-1));


		//randomly compute an ElevatorShaft to place the Goodie nearby
		var floors = building.getFloors();
		var goodieShaft = factory.getRandomArrVal(building.getShafts());

		/* 
		 * Goodies are positioned on BuildingFloors where the corresponding ElevatorShaft
		 * des not reach the floor. Check if a point in the BuildingFloor is contained within the 
		 * ElevatorShaft at that position.
		 */
		var floorList = [];
		for(i = 0; i < floors.length; i++) {
			var floor = floors[i]
			if(!goodieShaft.floorInShaft(floor)) {
				floorList.push(floor);
			}
		}

		if(floorList.length === 0) {
			console.log("no available floors found for shaft:" +  goodieShaft.instanceName);
			return false;
		}

		var goodieFloor = floorList[0];
		var yCenter = factory.toInt(goodieFloor.bottom - (goodieFloor.height/2));

		//scale size of Goodie
		var h = factory.toInt(DIMENSIONS.GOODIE.height * building.height/building.getNumFloors());
		var w = h;

		//compute Goodie position (to one side of the ElevatorShaft)
		var t = factory.toInt(yCenter - (h/2));

		/* 
		 * if the goodieShaft is the first or last, center above or below
		 * the shaft. Otherwise, randomly shift the position of the Goodie
		 * with respect to the goodieShaft center
		 */
		var numShafts = building.getNumShafts();
		var goodieCenter = goodieShaft.getCenter();
		var l = factory.toInt(goodieCenter.x - w/2);
		if(goodieShaft.shaftNum !== numShafts && goodieShaft.shaftNum !== 1) {
			var test = factory.getRandomInt(0, 2);
			switch(test) {
				case 0:
					l -= factory.toInt(w/2);
					break;
				case 1:
					break;
				case 2:
					l += factory.toInt(w/2);
					break;
			}
		}
		
		//compute goodie x center
		var xCenter = factory.toInt(l + (w/2));

		//overlap tests
		var pt = factory.Point(xCenter, yCenter);

		//don't overlap People
		var ge = building.getPeople();
		var len = ge.length;
		for(i = 0; i < len; i++) {
			if(ge[i].pointInside(pt)) {
				console.log("would have overlapped a Person");
				return false;
			}
		}

		//don't overlap other Goodies
		ge = building.getGoodies();
		len = ge.length;
		for(i = 0; i < len; i++) {
			if(ge[i].pointInside(pt)) {
				console.log("would have overlapped an existing Goodie");
				return false;
			}
		}
		var g = factory.ScreenRect(
			l,
			t,
			w,
			h,
			0,
			display.COLORS.CLEAR,
			display.COLORS.CLEAR, 
			display.LAYERS.GOODIES,
			goodieBoard
			);
		if(g) {
				g.name = BUILDING_TYPES.GOODIE;
				//g.instanceName = "Goodie type:" + goodieType;
				//g.parent = building; //do before adding to displayList
				g.parent = goodieFloor;
                g.getBuilding = world.getBuilding;
				g.getChildByType = getChildByType;
			
				//goodies are immobile, even if in recursive drawing
				g.immobile = true;

				g.setSpriteCoords({
					rows:goodieBoard.rows, //0-9
					cols:goodieBoard.cols, //0-1
					currRow:0,
					currCol:goodieType
				}); //this adds .getCellRect() and .nextCellRect
            
				//set additional information about the goodieType
				for(i in GOODIE_TYPES) {
					if(GOODIE_TYPES[i].col === goodieType) {
                        g.instanceName = GOODIE_TYPES[i].name;
						g.goodieType = GOODIE_TYPES[i];
						g.goodieScore = GOODIE_TYPES[i].score;
					}
				}

				g.customDraw = function (ctx) {
					//ctx.fillRect(g.left, g.top, g.width, g.height);
				}

			display.addToDisplayList(g, display.LAYERS.GOODIES);

			return g;
		}
		//fallthrough
		elefart.showError("failed to create Goodie:" + shaftNum);
		return false;

	}

	/** 
	 * @constructor Gas
	 * @classdesc the gas used as a weapon in the game
	 * - parent: Person(s) or Elevators (can transfer)
	 * - grandparent: ElevatorFloor or Building
	 * - children: none
     * When Gas is created, it is added to the ControlList, but remains a 
     * child of the Person. Then, when activated, it runs animation, then is deleted.
	 * @returns {Gas|false} a Gas object, or false
	 */
	function Gas (person, gasType) {
   
        console.log("adding Gas type " + gasType.name + "...");
        
        //get the Goodie spriteboard
		var gasBoard = display.getGasBoard();
        
        var l = 0;
        var t = 0;
		var h = person.height;
		var w = h;
        
        var g = factory.ScreenRect(
			l,
			t,
			w,
			h,
			0,
			display.COLORS.CLEAR,
			display.COLORS.CLEAR, 
			display.LAYERS.PEOPLE,
			gasBoard
			);
		if(g) {
				g.name = BUILDING_TYPES.GAS;
				g.parent = person;
                g.getBuilding = world.getBuilding;
				g.getChildByType = getChildByType;
            
                //set additional information about the gasType
                g.instanceName = "Gas type:" + gasType.name;
				g.gasScore = gasType.score;
                g.gasLoop = 0; //current animation loop for Gas

                /* 
                 * failed to draw due to the rows and columns 
                 * being undefined
                 * NOTE: to find the right spriteBoard, we had to count (unlike Goodies)
                 */
                var ct = 0;
                for(var i in GAS_TYPES) {
                    if(GAS_TYPES[i] === gasType) {
                        g.setSpriteCoords({
                            rows:gasBoard.rows, //0-14
                            cols:gasBoard.cols, //0- 7
                            currRow:ct,
                            currCol:0
                        }); //this adds .getCellRect() and other functions
                        ct++;
                    }
                }
	
				//goodies are immobile, even if in recursive drawing
				g.immobile = true;
            
                g.max = DIMENSIONS[BUILDING_TYPES.GAS].gasLoops; //shorthand

                g.updateByTime = function () {
                    //add time-dependent updates
                    console.log("Gas::updateByTime()");
                    g.spriteCoords.setNextFrame();
                    var f = g.spriteCoords.getFrame();
                    if(f === 0) {
                        g.gasLoop++;
                    }
                    if(g.gasLoop > g.max) {
                        console.log("Gas::updateByTime(), removing Gas from World");
                        //if person was squatting, stand them up
                        var pType = PERSON_TYPES.MALE_STANDING;
                        g.parent.spriteCoords.setTimeline(pType.row, pType.left);
                        g.parent.removeGas(g); //remove gas from parent
                    }
                }

                //custom Gas drawing, e.g. stretching drawing, opacity as Gas expands
				g.customDraw = function (ctx) {
                    //customize the Gas
                    if(g.gasLoop > g.max) {
                        display.eraseObject(ctx, g);
                    }
				}

			display.addToDisplayList(g, display.LAYERS.GOODIES);

			return g;
		}
		//fallthrough
		elefart.showError("failed to create Goodie:" + shaftNum);
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
	 * @param {String} characterName the name of the character
	 * @param {CharacterType} characterType the kind of character to use from the character from 
	 * PERSON_TYPES object. This value determines which row to access. Each row has a different 
	 * type of person, with columns various animations of the Person.
	 * @param {UserType} userType the type of user, either REAL, BOT, NETWORK. Found in the 
	 * common.xxx object shared between NodeJS and browser.
	 * @param {BuildingFloor} floor the default BuildingFloor the Person starts on. Persons 
	 * "attach" to both BuildingFloors (includng the BuildingRoof) and Elevators.
	 * @returns {Person|false} a Person object, or false
	 */
	function Person (characterName, characterType, userType, floor, 
                      elevatorHeight, shaftStart) {

		//var l = floor.left; //Person must start on a BuildingFloor
		var l = shaftStart;

		//get the Person bitmaps for animation
		var characterBoard = display.getCharacterBoard();

		/* 
		 * to create the Person, we must pre-compute the dimensions of the SpriteBoard 
		 * and then scale the Person so they fit inside Elevator
		 */

		//TODO: THIS COULD BE ANIMATED IN....

		var scale = 0.9 * (elevatorHeight * characterBoard.rows/characterBoard.height);
		var h = factory.toInt(scale * characterBoard.height/characterBoard.rows);
		var w = factory.toInt(scale * characterBoard.width/characterBoard.cols);
		var dfloor = floor.bottom  - floor.getWalkLine(); //walkLine;
		var t = floor.bottom - h;

		//create the Person
		var p = factory.ScreenRect(
			l,
			t,
			w,
			h,
			0,
			display.COLORS.CLEAR,
			display.COLORS.CLEAR, 
			display.LAYERS.PEOPLE,
			characterBoard
			);

		//set additional Person properties and add child objects
		if(p) {
			p.name = BUILDING_TYPES.PERSON;
			p.instanceName = characterName;
            
			p.setSpriteCoords({
				rows:characterBoard.rows, //0-14
				cols:characterBoard.cols, //0- 7
				currRow:characterType,
				currCol:0
			}); //this adds .getCellRect() and other functions

			//convert user instanceName to bitmap, add to drawing list
			p.nameImg = display.textToPNG(p.instanceName, "black", "Georgia", 12, 20);

			///specify character (visual) type
			p.characterType = characterType;

			//specify user type (bot, local, network)
			p.userType = userType;			

			//add health object
			p.health = new Health(p);
            
            p.getBuilding = world.getBuilding; //Building
            p.getControls = world.getControls; //Controls
			p.getChildByType = getChildByType;
            
            p.immobile = true; //DONT MOVE PERSON CHILD OBJECT (usually displayed in Controls)

			//walking queues
			p.shaft = NO_SHAFT;
			p.destPt = false;

			//set up the 'engine' (also indicates the Person can't respond to new events)
			p.engine = {
				is:OFF,
				speed:DIMENSIONS.PERSON.speed, //may be positive or negative
				adjust:DIMENSIONS.PERSON.adjust, //slow engine speed back on overshoot, lower bound 1.0, higher values reduce slow bounce
				teleport:false, //move immediately to next destination in elevatorQueue,
				destObj:NO_SHAFT,
				getDest:function (xPos) {
					return p.getBuilding().getShaftByCoord(
                        factory.Point(
                            factory.toInt(xPos),
                            p.getBuilding().top + 1
                        )
                    );
				},
				getDist:function () {
					if(this.destObj !== NO_SHAFT) {
						//console.log("this.destObj:" + typeof this.destObj.getCenter);
						var center = p.getCenter();
						return factory.toInt(center.x - this.destObj.getCenter().x);
					}
					return NO_SHAFT;
				}
			};

			/* 
			 * STATE ENGINE for person. 
			 * GETTERS
			 */
			p.getFloor = function () {
				var floors = p.getBuilding().getFloors();
				var len = floors.length;
                var center = p.getCenter();
				for(var i = 0; i < len; i++) {
					var floor = floors[i];
                    if(floor.pointInside(center)) {
						return floor;
					}
				}
				floor = p.getBuilding().getRoof(); //ROOF is a floor
				if(floor.pointInside(center)) {
					return floor;
				}
				return false;
			}
            
            p.getShaft = function () {
                var shafts = p.getBuilding().getShafts();
                var len = shafts.length;
                var center = p.getCenter();
                for(var i = 0; i < len; i++) {
                    var shaft = shafts[i];
                    if(shaft.pointInside(center)) {
                        return shaft;
                    }
                }
                return false;
            }

			//Elevator Person is in front of
			p.getElevator = function () {
				var elevators = p.getBuilding().getElevators();
				var len = elevators.length;
                var center = p.getCenter();
				for(var i = 0; i < len; i++) {
                    var e = elevators[i];
                    if(e.pointInside(center)) {
                        return e;
                    }
				}
				return false;
			}

			/* 
			 * CONTROLLER EVENT SETTERS
			 */
			
            /** 
             * @method goodieToGas
             * @description convert a Goodie to Gas
             */
            p.goodieToGas = function (goodie) {
                var gType = false;
                console.log("goodie.goodieType.name:" + goodie.goodieType.name);
                switch(goodie.goodieType.name) {
                    case GOODIE_TYPES.BEAN_CAN.name:
                        gType = GAS_TYPES.SHUTTERBLAST;
                        break;
                    case GOODIE_TYPES.DAISY.name:
                        break;
                    case GOODIE_TYPES.FAN.name:
                        break;
                     case GOODIE_TYPES.GAS_MASK.name:
                        break;
                    case GOODIE_TYPES.ROSE_BLUE.name:
                        break;
                    case GOODIE_TYPES.ROSE_BROWN.name:
                        break;
                    case GOODIE_TYPES.ROSE_RED.name:
                        break;
                    case GOODIE_TYPES.TULIP.name:
                        break;
                    default:
                        break;
                }
                return gType;
            }
			
			/** 
			 * @method addGoodie
			 * @description add a Goodie to a Person when they 
			 * walk past it. The Controller determines if they 
			 * overlap, and calls this function as necessary
			 * @param {Goodie} goodie the intersected Goodie. It is 
			 * necesssary to decouple the Goodie from the Building as 
			 * well.
			 */
			p.addGoodie = function (goodie) {
				console.log("add a goodie:" + goodie.instanceName);
				p.getBuilding().removeChild(goodie);
				p.addChild(goodie);
                
				//captured Goodies are show in the displayList in Controls
				p.getControls().getGoodieList().addToGoodieList(goodie);

                //some Goodies supply more Gas. Add the Gas. Gas is initially displayed in controls
                var gtg = p.goodieToGas(goodie);
                console.log("gtg:" + gtg);
                if(gtg) {
                    console.log("ADD GOODIE GAS.......");
                    var g = Gas(p, gtg);
                    p.addGas(g);
                }
			}

            /** 
             * @method getGoodies
             * @description get the Goodies currently assigned to the Person
             * @return {Array|false} an array of Goodies
             */
			p.getGoodies = function () {
				return s.getChildByType(BUILDING_TYPES.GOODIES, false);
			};

			/** 
			 * @method removeGoodie
			 * @description remove a Goodie when it is used by the Person, 
			 * e.g. used to combat enemy Gas. The Goode never returns to 
			 * the Building, instead it is deleted
			 */
			p.removeGoodie = function (goodie) {
				p.removeChild(goodie);
				p.getControls().getGoodieList().removeFromGoodieList(goodie);
			}

			//tell the Gas to display itself in the Controls area
			//done on startup
			p.addGas = function (gas) {
                console.log("Person::add gas():" + gas.instanceName);
				p.addChild(gas);
				p.getControls().getGasList().addToGasList(gas);
			}

			p.getGas = function () {
				return p.getChildByType(BUILDING_TYPES.GAS, false);
			};
            
            p.positionGas = function (gas) {
                gas.moveTo(p.right, p.bottom - gas.height);
            }

			//tell the Gas to remove itself from the Controls, add to the Building 
			//animate, then disappear. When the Gas is attached to the Building, it 
			//can affect other players
			p.doGas = function () {
				console.log("Player " + p.instanceName + " breaking wind...");
                var g = p.getGas()[0];
                p.getControls().getGasList().removeFromGasList(g);
                //position Gas next to Player
                p.positionGas(g);
                
                //update Animation
                controller.addToUpdateList(g);   
			}

			p.removeGas = function (gas) {
               // controller.removeFromUpdateList(gas);
               // display.removeFromDisplayList(gas);
                console.log("in p.removeGas");
				p.removeChild(gas, true);
                console.log("removed Gas as a child");
			}

			/** 
			 * @method doSquat
			 * @description make Player squat in Left or Right direction
			 */
			p.doSquat = function (left) {
				console.log("character " + p.instanceName + " squatting");
				var pType = PERSON_TYPES.MALE_SQUATTING;
				var engine = p.engine;
				if(engine.is === ON) {
					return; //can only do when motionless
				}
				engine.is = ON;
				engine.speed = pType.speed;
				engine.max = pType.left[1]; //max amount to squat
				engine.squat = true;
				console.log("in p.doSquat");
				if(left) {
					p.spriteCoords.setTimeline(pType.row, pType.left);
				}
				else {

				}
			}

			/** 
			 * @method p.addMoveToShaft
			 * @description add a new destination for a Player, triggered
			 * by clicking on an ElevatorShaft on the same floor as the 
			 * Player.
			 * @param {Point} gameLoc the x and y coordinates clicked on
			 */
			p.addMoveToShaft = function (gameLoc) {
				//determine destination
				console.log("in addMoveToShaft")
				var engine = p.engine;
				var dest = p.engine.getDest(gameLoc.x);
				console.log("parent::addMoveToShaft(), dest is:" + dest);
				if(dest) {
					engine.destObj = dest;
					var d = engine.getDist();

					if(d !== NO_SHAFT) {

						var pType = PERSON_TYPES.MALE_RUNNING;
						var destCenter = dest.getCenter();
						engine.speed = pType.speed;
						if(Math.abs(d) < pType.speed) {
							p.removeMoveFromShaft();
							console.log("addMoveToShaft(): close enough to complete move (" + d + ")");
							return false;
						}

						//sufficiently far away that we have to add a move
						if(d > 0) {
							engine.is = ON;
							p.spriteCoords.setTimeline(pType.row, pType.left);
                            //TODO: if we're attached to an Elevator, disconnect us
							console.log("addMoveToShaft(): move LEFT, engine.is:" + engine.is);
							console.log("person::addMoveToShaft()," + controller.inUpdateList(p));
						}
						else if(d < 0) {
							engine.is = ON;
							p.spriteCoords.setTimeline(pType.row, pType.right);
                            //TODO: if we're attached to an Elevator, disconnect us
							console.log("addMoveToShaft(): move RIGHT, engine.is:" + engine.is);
							console.log("person::addMoveToShaft()," + controller.inUpdateList(p));
						}
					}
					else {
						console.log("addMoveToShaft(): assigned dest, invalid distance");
                        return false;
					}
				}
				else {
					console("addMoveToShaft(): click outside any coordinate");
					return false;

				}
				console.log("added move to shaft");
				return true;
			};

			p.removeMoveFromShaft = function () {
				console.log("removeMoveFromShaft(): removing");
				var pType = PERSON_TYPES.MALE_STANDING;
				p.spriteCoords.setTimeline(pType.row, pType.left);
				var engine = p.engine;
				engine.is = OFF;
				engine.destObj.centerX(p);           
				engine.destObj = NO_SHAFT;   //shaft Person is moving to
				engine.destFloor = NO_FLOOR; //destination floor of person in Elevator
				engine.speed = pType.speed;
				
				//adjust Person so their feet match the Elevator
				var elev = p.getElevator();
				if(elev) {
					var d = elev.bottom - factory.toInt(elev.getLineWidth()/2) - p.bottom;
					p.move(0, d);
				}
				
				return true;
			};

			/** 
			 * @method p.isMovingOnFloor
			 * @description check if the Player is currently moving
			 */
			p.isMovingOnFloor = function () {
				 if(p.engine.is === ON) {
				 	return true;
				 }
				 return false;
			}

			/** 
			 * @method p.inMovingElevator
			 * @description determine if Person is in moving elevator, and can't run. Works 
			 * because Person is added to Elevator in elefart.factory as a child object 
			 * during Elevator motion
			 */
			p.inMovingElevator = function () {
				console.log("Person.parent:" + p.parent);
				window.pparent = p.parent;
				if(p.parent) console.log("p.parent.instanceName:" + p.parent.instanceName);

				if(p.parent.name === BUILDING_TYPES.ELEVATOR) {
					if(p.parent.engine.is === ON) {
						return true;
					}
				}
				return false;
			}

			/* 
			 * time-dependent animation, triggered by addToUpdateList
			 */
			p.updateByTime = function () {

				var engine = p.engine;

				//if(p.userType === USER_TYPES.LOCAL) {
				//	console.log("person::updateByTime(), local user")
				//}

				if(engine.is === ON) {

					//console.log("updating");

					if(engine.destObj === NO_SHAFT) {
						//we might be squatting
						if(engine.squat) {
							var frame = p.spriteCoords.getFrame();
							console.log("COLS:" + p.spriteCoords.cols);
							if(frame < engine.max) {
								p.spriteCoords.setNextFrame();
								console.log("FFFFFFFRAME:" + frame);
							}
							else {
								engine.squat = false;
								engine.is = OFF;
								engine.speed = 0;
								engine.max = 0;
							}
						}
						return;
					}

					//we are running to a ElevatorShaft
					var goodies = p.getBuilding().getGoodies();
					if(goodies.length > 0) {
						var center = p.getCenter();
						for(var i = 0; i < goodies.length; i++) {
							if(goodies[i].pointInside(center)) {
								p.addGoodie(goodies[i]);
							}
						}
					}


					var d = engine.getDist();
					var speed = engine.speed;
                    
					if(d === NO_SHAFT) {
						//console.log("Person.updateByTime(): no destination shaft, removing");
						p.removeMoveFromShaft();
						return;
					}

					if(Math.abs(d) <= speed) {
						//console.log("Person.updateByTime(): arrived");
						p.removeMoveFromShaft();
						return;
					}

					else if(d > speed) {
						//console.log("> move")
						p.move(-speed, 0);
						p.spriteCoords.setNextFrame();
					}
					else if(d <= speed) {
						//console.log("< move")
						p.move(speed, 0);
						p.spriteCoords.setNextFrame();
					}
				}
				else {
					//if(p.instanceName === "Bob Bottoms") {
					//	console.log("engine is OFF");
					//}
				}
			}


			/*
			 * draw a custom image of the user's instanceName
			 * TODO: ONLY SHOW WHEN WE HOVER OVER IT??????
			 */
			p.customDraw = function (ctx) {
				var yCenter = p.top + (p.height/2);
				ctx.drawImage(
					p.nameImg,  
					p.right, yCenter, 
					p.nameImg.width, p.nameImg.height);
			};

			/* 
			 * erase the user's instanceName
			 */
			p.customErase = function (ctx) {
				//console.log("erasing name")
				var yCenter = p.top + (p.height/2);
				ctx.clearRect(p.right, yCenter, p.nameImg.width, p.nameImg.height+ 1);
			};

			floor.parent.addChild(p); //defaults to
			display.addToDisplayList(p, display.LAYERS.PEOPLE);
			controller.addToUpdateList(p);
			return p;
			}

			//fallthrough
		elefart.showError("failed to create Person type:" + characterType + " on floor:" + floor.floorNum);
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
	function Elevator (building, shaft, subShaft) {
		var numFloors = Math.ceil(1/DIMENSIONS.BUILDING_FLOOR.height);
		var h = factory.toInt(building.getFloorHeight() - building.getFloor(1).getBaseHeight());
		var w = factory.toInt(shaft.width * DIMENSIONS.ELEVATOR.width);
		var margin = factory.toInt((shaft.width - w)/2);
		var l = shaft.left + margin;

		/** 
		 * correction for some screen sizes that make Elevator too narrow
		 * NOTE: this calculation matches the independent calculation 
		 * in ElevatorShaft
		 */
		if(h > w) {
			h = w;
		}
		var t = shaft.bottom - h;

		//TODO: get floor, based on position of bottom of shaft

		//create the Elevator
		var e = factory.ScreenRect(
				l, 
				t,
				w, 
				h, 
				8,  //stroke width
				display.COLORS.BLACK,  //stroke color
				display.COLORS.WHITE,  //fill color
				display.LAYERS.ELESPACE1  //bottom layer
			);
			if(e) {
				e.name = BUILDING_TYPES.ELEVATOR;
				e.instanceName = "Elevator #:" + shaft.shaftNum;
                e.getBuilding = world.getBuilding;
                e.getChildByType = getChildByType; //generic child getter function
				e.parent = shaft;      //set parent early, before addChild
				e.setRectBorderRadius(3);
				e.floor = building.getFloorByCoord(
                    factory.Point(building.top+1, 
                    e.top + factory.toInt(e.height/2)
                    )
                ); //get the default assigned BuildingFloor
				e.floorQueue = [];
				e.peopleList = []; //persons on the elevator

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
					var eTop = e.top - ctx.lineWidth;
					var epTop = e.parent.top;
					var engine = e.engine;
					//var oldWidth = ctx.lineWidth;
					if(e.top > e.parent.top + 10) {
						ctx.lineWidth = 1.0;
						//Elevator cables
						ctx.moveTo(center - 2, epTop);
						ctx.lineTo(center - 2, eTop);
						ctx.moveTo(center + 2, epTop);
						ctx.lineTo(center + 2, eTop);
						ctx.stroke();
						//on top of Elevator
						ctx.fillStyle = ctx.strokeStyle;
						ctx.fillRect(center-8, eTop - 10, 16, 8); //TODO MAKE PERCENTS
						engine.turn++; if(engine.turn > 30) engine.turn = 0;
						ctx.moveTo(center -4, e.top -8);
						//moving part on Elevator.engine
						if(engine.is === ON && engine.turn > 10 && engine.turn < 20) {
							ctx.fillStyle = 'rgba(255,0,0,0.5)';
							ctx.fillRect(center -4, e.top - 8, 8, 6);
						}
					}
				}

				/** 
				 * @method Elevator.customErase()
				 * @description define erase for Elevator
				 * custom drawing
				 */
				e.customErase = function (ctx) {
					var eTop = e.top - ctx.lineWidth;
					var epTop = e.parent.top;
					var center = e.parent.left + (e.parent.width/2);
					ctx.clearRect(center-9, epTop, 18, e.top - epTop);
				}

				/** 
				 * @method Elevator.updateByTime()
				 * @description update Elevator position, along with any Persons inside 
                 * elevator. NOTE: this doesn't affect the update or draw listing of the 
                 * Persons, just changes their position.
				 * @returns {Boolean} if object changed in any way, return true, else false
				 */
				e.updateByTime = function () {
					if(e.engine.is === ON) {
						if(e.floorQueue.length > 0) {
						var engine = e.engine,
						dest = e.floorQueue[0], 
						speed = engine.speed,
						slow,
						inc;

							if(engine.teleport === true) {
								console.log("teleport")
								var diff = dest.bottom - e.bottom;
								e.move(0, diff, true);
								engine.teleport = false;
							}
							else if(e.bottom === dest.bottom) {
								console.log("removing dest")
								engine.teleport = false; //never teleport by default
								e.floor = dest; //local copy of BuildingFloor
								e.removeFloorFromQueue(dest);
								console.log("floorQueue length now:" + e.floorQueue.length)
							}
							else if(e.floor.bottom > dest.bottom) {
								//going up, check for overshoot
								if(e.bottom < dest.bottom) { //overshoot!
									inc = (dest.bottom - e.bottom);///engine.adjust;
									if(inc < 1) {
										e.floor = dest;
										e.removeFloorFromQueue(dest);
										e.moveTo(e.left, dest.bottom - e.height, false); //don't adjust passengers
									}
									else {
										inc /= engine.adjust; //slow the return
										e.move(0, inc, true); //bounce
									}
								}
								else {
									if(slow < 1.0) speed *= slow;
									if(speed < 2.0) speed = 1.0;
									e.move(0, -speed, true); //default speed
								}
							}
							else if(e.floor.bottom < dest.bottom) {
								//going down, check for overshoot
								if(e.bottom > dest.bottom) { //overshoot!
									inc = (dest.bottom - e.bottom);///engine.adjust;
									if(inc > -1) {
										e.floor = dest;
										e.removeFloorFromQueue(dest);
										e.moveTo(e.left, dest.bottom - e.height);
									}
									else {
										inc /= engine.adjust; //slow the return
										e.move(0, inc, true); //bounce
									}
								}
								else {
									e.move(0, speed, true); //default speed
								}
							}
						} //floorQueue > 0

						return true;
					} //Elevator engine is ON
					return false;
				}

				//add getters and setters

				e.getShaft = function () {
					return e.parent;
				}

				e.getFloor = function () {
					return e.getBuilding().getFloorByCoord(
                        factory.Point(e.getShaft().top+1, 
                            e.top + factory.toInt(e.height/2)
                        )
                    );
				}

				/** 
				 * @method Elevator.getFloors
				 * @description get floors the Elevator can visit
				 */
				e.getFloors = function () {
					return e.getShaft().getFloors();
				}

				//get the number of floors our ElevatorShaft goes to
				e.getNumFloors = function () {
					return e.getShaft().getFloors().length;
				}


				//a Person requests getting on the Elevator to go to a specific floor
				e.addPerson = function (person, floor) {
					console.log("ELEVATOR IS adding person:" + person.instanceName);
					
					if(person.getFloor() === floor) {
						console.log("Person already on floor:" + floor.floorNum);
							return false;
					}
					
                    //Person must be in front of Elevator
                    if(e.pointInside(person.getCenter())) {
						
                        console.log("Person is in front of elevator");
						
						if(!e.floorInQueue(floor)) {
							console.log("Person wants floor NOT in queue");
							e.addFloorToQueue(floor);
						}
                        //add the dest floor to the Person
						person.destFloorNum = floor.floorNum;
						console.log("Person's dest floor:" + person.destFloorNum);

                        e.getBuilding().removeChild(person, false); //remove Person from BuildingFloor
						
                        if(!e.personInside(person)) {
                            console.log("Person in front, but not inside elevator, add them to Elevator:" + e.instanceName);
							var l = person.left;
							var t = e.bottom - person.height - 4;
							person.moveTo(l, t);
                            e.addChild(person); //add Person to Elevator, Elevator becomes parent
                        }
                    }
                    console.log("elevator::addPerson()," + controller.inUpdateList(person));
					return true;
				}

				//A Person requests to leave the Elevator on a specified floor
				e.removePerson = function (person) {
					console.log("ELEVATOR IS removing person");
					e.removeChild(person, false);
					e.getBuilding().addChild(person);
					
					//reset Person's walkline  to BuildingFloor if they are out of position
					var f = person.getFloor();
					var lw = f.getFloorBase().getLineWidth();
					person.positionOn(f, factory.SIDES.BOTTOMIN, true);
					person.move(0, -lw);
					console.log("elevator::removePerson()," + controller.inUpdateList(person));
				}
                
                //check to see if Person currently in Elevator
                e.personInside = function (person) {
                    if(person.parentNode === e) {
                        return true;
                    }
                    return false;
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
					e.dirty = true;
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
					
					if(floor === e.getFloor()) {
						console.log("Elevator::addFloorToQueue()::already on floor:" + floor.floorNum);
						return false;
					}
					
					var floorNum, i, len;
					if(!factory.isNumber(floor)) {
						floorNum = floor.floorNum;
					}
					else {
						floorNum = floor;
						if(floorNum === ROOF && e.parent.hasShaftTop) {
							floor = e.getBuilding().getRoof();
						}
						else {
							var floors = e.getFloors();
							len = floors.length;
							for(i = 0; i < len; i++) {
								if(floors[i].floorNum === floorNum) {
									//only respond to floor within reach of Elevator Shaft
									floor = floors[i];
								}
							}
						}
					}
					if(!floor.floorNum) {
						console.log("Elevator:couldn't find floor:" + floor + " in shaft:" + e.getShaft().instanceName);
						return false;
					}
					console.log("Elevator:getting floor with floorNum:" + floorNum)
					//make sure floor isn't alredy in queue
					len = e.floorQueue.length;
					for(i = 0; i < len; i++) {
						if(floorNum === e.floorQueue[i].floorNum) {
							console.log("floor:" + floorNum + " already in queue");
							return false;
						}
					}
					//include the BuildingRoof as a floor, if ElevatorShaft goes there
					if(floorNum === ROOF && e.parent.hasShaftTop) {
						console.log("add ROOF:" + floor + " to Elevator:" + e.id + " queue")
						e.engine.is = ON;
						e.floorQueue.push(e.getBuilding().getRoof());
						return floor;
					}
					var fl = e.parent.floorInShaft(floor); //some shafts don't go to all floors
					if (floor === e.getFloor()) {
						console.log("Elevator already at requested BuildingFloor:" + floor.floorNum);
						return;
					}
					if(fl) {
						console.log("add BuildingFloor:" + floor + " to Elevator:" + e.id + " queue")
						e.engine.is = ON;
						e.floorQueue.push(floor);
						//TODO: if a Person is standing in front of the Elevator
						//TODO: add them to the Elevator as a child, and use the 
						//DESTINATION IN THE QUEUE as their queue.
						//TODO: make their Parent the Elevator
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
					//check if People need to get out of Elevator
					e.peopleList = e.getChildByType(BUILDING_TYPES.PERSON, false);
					var len = e.peopleList.length;
					console.log("Elevator::removeFloorFromQueue()::checking if any of the " + len + " People need to get out");
					for(var i = 0; i < len; i++) {
						var p = e.peopleList[i];
						
						if(p.destFloorNum === floorNum) {
							console.log("Person:"+ p.instanceName + " leaving Elevator:" + e.instanceName);
							e.removePerson(p);
						}
					}
					//otherwise, remove the BuildingFloor from floorQueue
					console.log("removing floor with floorNum:"+ floor.floorNum);
					var len = e.floorQueue.length;
					for(var i = 0; i < len; i++) {
						if(e.floorQueue[i].floorNum === floorNum) {
							floor = e.floorQueue.splice(i, 1);
							//TODO: if some Person has this floor as their exit, 
							//TODO: eject them from the Elevator, and reset their
							//TODO: parent back to the floor
							if(e.floorQueue.length < 1) {
								e.engine.is = OFF; //no more BuildingFloors to go to
							}
							return floor;
						}
					}
					return NO_FLOOR;
				}

				//set default floor
				//var startFloor = factory.getRandomInt(); ////////
				//e.moveToFloor(shaft.getEndFloor());
				display.addToDisplayList(e, display.LAYERS.ELESPACE1);
				controller.addToUpdateList(e);
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
                d.getBuilding = world.getBuilding;
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
	function ElevatorShaft (building, shaftNum, hasShaftTop) {
		if(building) {
			var shaftWidth = factory.toInt(DIMENSIONS.ELEVATOR_SHAFT.width * building.width);
			var shaftSubWidth = factory.toInt(DIMENSIONS.ELEVATOR_SHAFT.subWidth * shaftWidth);

			/* 
			 * ElevatorShafts don't necessarily go to all floors, and no ElevatorShaft
			 * ever goes to all BuildingFloors
			 */
			var numFloors = building.getNumFloors();
			var minFloors = 2;
			var maxFloors = numFloors-1; 
			if(maxFloors < minFloors) maxFloors = minFloors;
			var shaftFloors = factory.getRandomInt(minFloors, maxFloors); //number of BuildingFloors (at least 2)
			var shaftTop = factory.getRandomInt(0, numFloors - shaftFloors);
			var t = building.top + (shaftTop * building.getFloorHeight());
			var h = shaftFloors * building.getFloorHeight();

			//calculate ElevatorShaft position
			//t = building.top; //offset so overlaps roof, doesn't overlap bottom floor
			//NOTE: adjust shaftNum from one-based to zero-based
			var l = building.left + Math.floor(shaftWidth * (shaftNum-1));// + shaftMargin;
			var w = shaftWidth;
			//var h = building.height;

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
				t = building.top; //force to top of Building
				if(hh > ww) hh = ww; //add height of RoofCupola
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
                s.getBuilding = world.getBuilding;
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

				s.getNumFloorsVisited = function () {
					return factory.toInt((s.bottom - s.top)/h);
				}

				s.getStartFloor = function () {
					return factory.toInt((s.top - s.parent.top)/h);
				};

				s.getEndFloor = function () {
					return factory.toInt((s.parent.bottom - s.bottom)/h);
				};

				/* 
				 * ask Building for the floors, so we can see which ones the 
				 * ElevatorShaft goes to
				 */
				s.floors = [];
				var fls = building.getFloors();
					var len = fls.length;
					for(var i = 0; i < len; i++) {
						var fl = fls[i];
						//avoid alignment errors between floor and shaft top and bottom
						var center = factory.toInt(fl.bottom - (fl.height/2));
						if(center < s.bottom && center > s.top) {
							//add only BuildingFloors that ElevatorShaft goes to
							var ed = ElevatorDoors(s, fl); //added as child to ElevatorShaft
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
					elefart.showError("Invalid floor for this shaft:" + s.instanceName + " floorNum:" + floorNum);
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
		//get reference to wallpaper bitmap
		var wallPaper = display.getHotelWalls();
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
			wallPaper //NOTE: ADDING AN IMAGE
			//function () {console.log("loading hotel walls in floor");}
			);

		if(f) {
			f.name = BUILDING_TYPES.BUILDING_FLOOR;
			f.floorNum = (numFloors - floorNum);
			f.instanceName = "Floor #" + f.floorNum;
			f.walkLine = f.bottom; //where Players should put the .bottom of their enclosing Rect
			f.setOpacity(1.0, 0.5); //object opaque, image faded
			f.setSpriteCoords({ //where to sample when drawing image
				rows:wallPaper.rows, //13,
				cols:wallPaper.cols, //1,
				currRow:floorNum,
				currCol:0
			});
			//assign generic getter function
            f.getBuilding = world.getBuilding;
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
			
			f.getWalkLine = function () {
				var fb = f.getFloorBase();
				return fb.top + f.height - fb.getLineWidth();
			}

			/** 
			 * @method BuildingFloor.getFloorBase
			 * @description get the visible floor base for a BuildingFloor
			 * @returns {ScreenRect} the ScreenRect creating the visible floor.
			 */
			f.getFloorBase = function () {
				return f.getChildByType(BUILDING_TYPES.BUILDING_FLOORBASE)[0];
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

	/* 
	 * ============================
	 * BUILDING SIGN
	 * ============================
	 */

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
            s.getBuilding = world.getBuilding;
			s.getChildByType = getChildByType; //generic child getter function
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
				c.getShaft = function () {
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
                
                c.getShaft = function () {
                    return roofShaft;
                }
                
                c.getShaftByCoord = function (pt) {
                    if(c.pointInside(pt)) {
                        return roofShaft;
                    }
                    return false;
                }

				//get wallpaper bitmap
				var wallPaper = display.getHotelWalls();

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
					wallPaper//, //NOTE: ADDING AN IMAGE
					);
				cb.setOpacity(0.5);
				cb.setSpriteCoords({ //where to sample when drawing image
					rows:wallPaper.rows,
					cols:wallPaper.rows, //NOTE: only want some of wallPaper column
					currRow:0,
					currCol:0
				});

				cb.instanceName = "Roof Cupola Back";
				cb.getBuilding = world.getBuilding;
                cb.getChildByType = getChildByType; //generic child getter function
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
            r.getBuilding = world.getBuilding;
			r.getChildByType = getChildByType; //generic child getter function
			r.floorNum = ROOF;
			r.walkLine = building.top-roofWidth;
			r.roofShaft = roofShaft; //store local reference to the ElevatorShaft

			//getters
			r.getRoofSides = function () {
				return r.getChildByType(BUILDING_TYPES.BUILDING_ROOF_SIDE, false);
			}

			r.getShaft = function () {
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

			r.getWalkLine = function () {
				return r.bottom - r.getLineWidth() - r.getBuilding().getLineWidth();
			}


			r.getFloorBase = function () {
				return r;
			}
			
			//getter for RoofCupola
			r.getRoofCupola = function () {
				return r.getChildByType(BUILDING_TYPES.BUILDING_ROOF_CUPOLA, false)[0];
			}
            
            r.getShaftByCoord = function (pt) {
                return r.getRoofCupola().getShaftByCoord(pt);
            }
            
            //shafts don't extend to BuildingRoof, but we need their coords to move a Person
            r.getShaftUnderneath = function (pt) {
                return r.getBuilding().getShaftByCoord(
                    factory.Point(
                        r.getBuilding().top,
                        pt.y)
                );                 
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
            b.getBuilding = world.getBuilding;
			b.getChildByType = getChildByType; //generic child getter function

			//add to Building's outline to displayList BEFORE creating BuildingFloors
			display.addToDisplayList(b, display.LAYERS.BUILDING);

			//getter for BuildingSign
			b.getSign = function () {
				return b.getChildByType(BUILDING_TYPES.BUILDING_SIGN, false)[0];
			}

			//add the BuildingSign on Roof of Building BEFORE BuildingFloors
			b.addChild(BuildingSign(b));

			/** 
			 * @method b.getFloor
			 * @description get a BuildingFloor by its number
			 * @param {Number} floorNum the floor number (as see onscreen)
			 * @returns {ScreenObject|false} the BuildingFloor, or false
			 */
			b.getFloor = function (floorNum) {
				if(floorNum < 1) {
					elefart.showError("building.getFloor() invalid floor number:" + floorNum);
					return false;
				}
				return b.getChildByType(BUILDING_TYPES.BUILDING_FLOOR, false, "floorNum", floorNum)[0];
			}

			/** 
			 * @method b.getFloorByCoord
			 * @description get the BuildingFloor for a specific y coordinate
			 * typically from another onscreen object
			 * @param {Number} y the y coordinate, absolute for entire game
			 * @returns {Number} the floor number, or false
			 */
			b.getFloorByCoord = function (pt) {
                var y = pt.y;
				var floors = b.getFloors();
				var len = floors.length;
				for(var i = 0; i < len; i++) {
					var floor = floors[i];
					if(y > floor.top && y <= floor.bottom) {
						return floor;
					}
				}
                return b.getRoofByCoord(pt);
				//return false;
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

			b.getElevatorsOnFloor = function (floor) {
				var onFloor = [];
				var elevs = b.getElevators();
				var len = elevs.length;
				for(i = 0; i < len; i++) {
					var elev = elevs[i];
					if(elev.floorQueue.length === 0) {
						//check coordinates
						if(elev.bottom >= floor.bottom && 
							elev.top <= floor.top) {
							onFloor.push(elev);
						}
					}
				}
				if(onFloor.length > 0) {
					return onFloor;
				}
				return false;
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

			/** 
			 * @method getShaftByCoord
			 * @description get an elevator shaft by its x coordinate
			 * @param {Number } x the x coordinate, absolute
			 * @returns {ScreenObject|false}
			 */
			b.getShaftByCoord = function (pt) {
                var x = pt.x;
				var shafts = b.getShafts();
				var len = shafts.length;
				for(var i = 0; i < len; i++) {
					var shaft = shafts[i];
					if(x > shaft.left && x <= shaft.right) {
						return shaft;
					}
				}
				return false;
			}
            
            b.getElevatorByCoord = function (pt) {
                var elevs = b.getElevators();
                for(var i = 0; i < elevs.length; i++) {
                    var e = elevs[i];
                    if(e.pointInside(pt)) {
                        return e;
                    }
                }
                return false;
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
			//create all ElevatorShafts, each with an Elevator
			for(i = 1; i <= numShafts; i++) {
				b.addChild(ElevatorShaft(b, i, numRoofShaft));
			}

			//getter for BuildingRoof
			b.getRoof = function () {
				return b.getChildByType(BUILDING_TYPES.BUILDING_ROOF, false)[0];
			}
            
            b.getRoofByCoord = function (pt) {
                var r = b.getRoof();
                if(r.pointInside(pt)) {
                    return r;
                }
                return false;
            }

			//create and add BuildingRoof, Floor# -1, and with a opening for the roofShaft
			var roofShaft = b.getShaft(numRoofShaft);
			b.addChild(BuildingRoof(b, roofShaft));

			b.getElevators = function () {
				var shafts = b.getChildByType(BUILDING_TYPES.ELEVATOR_SHAFT, false);
				var len = shafts.length;
				var elevs = []; 
				for(var i = 0; i < len; i++) {
					elevs.push(shafts[i].getChildByType(BUILDING_TYPES.ELEVATOR, false)[0]);
				}
				
				return elevs;
			}

			b.getPeople = function () {
				return b.getChildByType(BUILDING_TYPES.PERSON, false);
			}

			b.getPersonByCoord = function (pt) {
				var people = b.getPeople(),
				len = people.length;
				for(var i = 0; i < len; i++) {
					if(people[i].pointInside(pt)) {
						return people[i];
					}
				}
				return false;
			}

			b.getLocalPlayer = function (pt) {
				return b.getChildByType(BUILDING_TYPES.PERSON, false, "userType", USER_TYPES.LOCAL)[0];
			}

			b.getGoodies = function () {
				return b.getChildByType(BUILDING_TYPES.GOODIE, false);
			}

			b.getGoodieByCoord = function (pt) {
				var goodies = b.getGoodies(),
				len = goodies.length;
				for(var i = 0; i < len; i++) {
					if(goodies[i].pointInside(pt)) {
						return goodies[i];
					}
				}
				return false;
			}

			/* 
			 * add Person corresponding to local user to the building 
			 * (bot, local, network), scaling for 
			 * size of BuildingFloors and Elevators
			 */
			var elevatorHeight = b.getShaft(1).getElevator().height;
			var shaftStart = b.getShaft(factory.getRandomInt(1, numShafts-1)).left;
			var p = Person (
					"Bob Bottoms", 
					PERSON_TYPES.MALE_STANDING.row, 
					USER_TYPES.LOCAL, 
					b.getFloor(1), //Floor dimensions
					elevatorHeight, //Elevator dimensions,
					shaftStart //which ElevatorShaft to start at
				);


			/* 
			 * add a 'bot' competitor
			 */
			shaftStart = b.getShaft(factory.getRandomInt(1, numShafts-1)).left;
			p = Person (
					"Botboy", 
					PERSON_TYPES.MALE_STANDING.row, 
					USER_TYPES.BOT, 
					b.getFloor(factory.getRandomInt(1, numFloors-1)), //Floor dimensions
					elevatorHeight, //Elevator dimensions
					shaftStart //which ElevatorShaft to start at
				);
			//b.addChild(p);

			/* 
			 * add Goodies, about as many as there are ElevatorShafts
			 * if Goodies would overlap themselves or people, the constructor 
			 * function might return false, so test for this. 
			 */
			for(var i = 0; i < numShafts; i++) {
				var g = Goodie(b);
				if(g) {
					b.addChild(g);
				}
			}

			//return the completed Building
			return b;
		}

		//fallthrough
		elefart.showError("failed to create Building");
		return false;
	}

	/* 
	 * ============================
	 * SKY AND CLOUDS
	 * ============================
	 */

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
            c.getBuilding = world.getBuilding;
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
                s.getBuilding = world.getBuilding;
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
                c.getBuilding = world.getBuilding;
				c.getChildByType = getChildByType; //generic child getter function
				display.addToDisplayList(c, display.LAYERS.WORLD);
				return c;
			}
		}
		//fallthrough
		elefart.showError("failed to create Corona");
		return false;
	}

	/* 
	 * ============================
	 * SKY CREATURES
	 * ============================
	 */

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
				s.getBuilding = world.getBuilding;
                s.getChildByType = getChildByType; //generic child getter function
				display.addToDisplayList(s, display.LAYERS.WORLD); //visible
                
                s.getSkyByCoord = function (y) {
                    if(y >= s.bottom && y <= s.top) {
                        return s;
                    }
                    return false;
                }

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

	/* 
	 * ============================
	 * CONTROL PANEL AND INDIVIDUAL CONTROLS
	 * ============================
	 */
    
    
    /** 
     * @constructor ControlGoodieList
     * @classdesc a display of Goodies picked up by Player
     */
    function ControlGoodieList (controls) {
        
        var w = factory.toInt(DIMENSIONS.CONTROL_GOODIE_LIST.width * controls.width);
        var h = factory.toInt(DIMENSIONS.CONTROL_GOODIE_LIST.height * controls.height);
        var textSize = controls.fontSize;
        var t = controls.top + controls.margin;
        var l = controls.right - controls.margin - w;
        
        var g = factory.ScreenRect (
            l,
            t,
            w,
            h,
            1,
            display.COLORS.BLACK,
            display.COLORS.WHITE,
            display.LAYERS.CONTROLS,
            false,
            false,
            6
        );
        
        if(g) {
            g.name = BUILDING_TYPES.CONTROL_GOODIE_LIST;
            g.instanceName = "Goodie Scorecard";
            g.getBuilding = world.getBuilding;
            g.getChildByType = getChildByType;
            
            g.goodieList = [];
            
            //custom drawing for the list of Goodies
            g.customDraw = function (ctx) {
                //TODO: ask the Goodies to Redraw themselves here
            }
            
            //update animation function
            g.updateByTime = function () {
                //TODO: add to update list
				//TODO: List current Goodie List here
			}
            
			/** 
			 * @method calcGoodieLayout
			 * @description (re)calcuate Goodie layout when a Goodie 
			 * is added or removed
			 */
            g.calcGoodieLayout  = function () {
                var len = g.goodieList.length;
				if(len) {
					var gList = g.goodieList;
					var w = gList[0].width;
					var max = factory.toInt(g.width/w);
					if(len > max) {
						console.log("error: too many goodies");
						return;
					}
					//position the goodies
					var t = g.top;
					var l = g.left; //list (not its label)
					for(var i = 0; i < len; i++) {
						gList[i].moveTo(l + factory.toInt(i * w), t );
					}
				}
            }
            
            
			/** 
			 * @method initGoodieList
			 * @description initialize the update list for the application
			 */
			g.initGoodieList = function () {
				g.goodieList = [];
			}

			/** 
			 * @method addToUpdateList
			 * @description add an object to the visual display list
			 * @param {Point|Line|Rect|Circle|Polygon|ScreenSprite} obj the object to draw
			 * @param {PANELS} panel (optional) the panel where the object is drawn by display
			 * @returns {Boolean} if added, return true, else false
			 */
			g.addToGoodieList = function (goodie) {
				var gList = g.goodieList;
				var len = gList.length;
				for(var i = 0; i < len; i++) {
					if(gList[i] === goodie) {
						return false; //already there
					}
				}
				gList.push(goodie);
				
				//we have to erase a static image, and redraw it elsewhere
				var c = display.getBackgroundCanvas();
				var ctx = c.getContext("2d");
				ctx.save();
				display.removeFromDisplayList(goodie);
				display.eraseObject(ctx, goodie);
				console.log("draw controlList Goodie at top:" + g.top + " left:" + g.left + " width:" + goodie.width + " height:" + goodie.height)
				//ctx.rect(goodie.left, goodie.top, goodie.width, goodie.height);
				//ctx.clip();
				ctx.restore();
				g.calcGoodieLayout();
				display.addToDisplayList(goodie, display.LAYERS.CONTROLS);
				display.drawBackground();
				return true;
			}

			/** 
			 * @method removeFromUpdateList
			 * @description remove an object from drawing display list. By default, it is non-recursive.
			 * @param {Point|Line|Rect|Circle|Polygon|ScreenSprite} obj the object to draw
			 * @param {PANELS} panel (optional) the display list panel to draw in (optional)
			 * @returns {Boolean} if removed, else false;
			 */
			g.removeFromGoodieList = function (goodie) {
				var gList = g.goodieList;
				var len = gList.length;
				for(var i = 0; i < len; i++) {
					if(gList[i] === goodie) {
						gList.splice(i, 1); //remove element reference
						calcGoodieLayout(); //recalculate goodie display
						var parent = goodie.parent; //remove goodie reference from parent
						parent.removeChild(goodie); //removes from all lists
						return true;
					}
				}
				return false;
			}
  
            var labelText = "Goodies:";
            var labelWidth = display.textPixelWidth (labelText, textSize + " pt " + controls.controlFont) + h + h; 
            var fl = factory.ScreenText(
                l - labelWidth,
                t,
                labelWidth,
                h,
                controls.controlFont,
                h,
                labelText,
                display.COLORS.BLACK, 
                "top",
                0,
				display.COLORS.NONE, //Rect stroke color
				display.COLORS.NONE, //Rect fill color
				display.LAYERS.CONTROLS //dynamic
            );

            if(fl) {
            fl.name = BUILDING_TYPES.LABELS;
            fl.instanceName = "Goodies Scorecard Label";
            fl.getBuilding = world.getBuilding;
            fl.getChildByType = getChildByType;
            display.addToDisplayList(fl, display.LAYERS.CONTROLS);
            }
            else {
                elefart.showError("failed to create Goodie Scorecard label");
            }

            //add to displayList (update list later)
            g.addChild(fl);
            display.addToDisplayList(g, display.LAYERS.CONTROLS);
            return g;
        }
		//fallthrough
		elefart.showError("failed to create Goodie Scorecard");
		return false;       
    }

    /** 
     * @constructor ControlGasList
     * @classdesc a display of Gas (Farts) remaining in the Player
     * @param {Controls} controls the parent Controls container
     * @returns {ControlLogo|false} the ControlLogo object     */
    function ControlGasList (controls) {
        
        var w = factory.toInt(DIMENSIONS.CONTROL_GAS_LIST.width * controls.width);
        var h = factory.toInt(DIMENSIONS.CONTROL_GAS_LIST.height * controls.height);
        var textSize = controls.fontSize;
        var t = controls.top + controls.margin + h;
        var l = controls.right - controls.margin - w;
        
        //create the Gas list
        var g = factory.ScreenRect (
            l,
            t,
            w,
            h,
            1,
            display.COLORS.BLACK,
            display.COLORS.WHITE,
            display.LAYERS.CONTROLS,
            false,
            false,
            6
        );
        
        if(g) {
            g.name = BUILDING_TYPES.CONTROL_GAS_LIST;
            g.instanceName = "Gas Scorecard";
            g.getBuilding = world.getBuilding;
            g.getChildByType = getChildByType;

            g.gasList = [];
            
            //custom drawing for the list of Farts
            g.customDraw = function (ctx) {
                //any special drawing of Gas while in the controlList
            }
            
            //update animation function (standard will just redraw the Rect)
            g.updateByTime = function () {
                //TODO: add to update list
				//TODO: List current Goodie List here
			}
            

            g.initGasList = function () {
            	g.gasList = [];
            }

            g.calcGasLayout = function () {
                var len = g.gasList.length;
				if(len) {
					var gList = g.gasList;
					var w = gList[0].width;
					var max = factory.toInt(g.width/w);
					if(len > max) {
						console.log("error: too much gas, len:" + len + " max:" + max);
						return;
					}
					//position the gas
					var t = g.top;
					var l = g.left; //list (not its label)
					for(var i = 0; i < len; i++) {
						gList[i].moveTo(l + factory.toInt(i * w), t );
					}
				}
            }

            g.addToGasList = function (gas) {
                var gList = g.gasList;
                var len = gList.length;
				for(var i = 0; i < len; i++) {
					if(gList[i] === gas) {
                        console.log("addToGasList()::Gas object already present, not adding");
						return false; //already there
					}
				}
                //add to the list
				gList.push(gas);
				g.calcGasLayout();
                display.addToDisplayList(gas, display.LAYERS.CONTROLS);
				return true;
            }

            //Gas is unusual in that it appears both next to Person, and in the gasList
            g.removeFromGasList = function (gas) {
                var gList = g.gasList;
				var len = gList.length;
				for(var i = 0; i < len; i++) {
					if(gList[i] === gas) {
                        console.log("gasList::removeFromGasList(), found the Gas");
						gList.splice(i, 1); //remove element reference
				        var c = display.getForegroundCanvas();
				        var ctx = c.getContext("2d");
				        ctx.save();
				        display.eraseObject(ctx, gas);
				        ctx.rect(gas.left, gas.top, gas.width + 50, gas.height + 500);
				        ctx.clip();
                        display.drawForeground();
				        ctx.restore();
                        //TODO: ERASE NOT WORKING, ONLY WORKS FOR OBJECT INSIDE OF LIST OBJECT
                        //TODO: NOT CLEAR WHY ERASE DOESN't WORK!!!!
                        //TODO:
                        g.calcGasLayout(); //recalculate goodie display

				        return true;
					}
				}
				return false;
            }

            //label for Gas List
            var labelText = "Farts:";
            var labelWidth = display.textPixelWidth (labelText, textSize + " pt " + controls.controlFont) + h + h; 
            var fl = factory.ScreenText(
                l - labelWidth,
                t,
                labelWidth,
                h,
                controls.controlFont,
                h,
                labelText,
                display.COLORS.BLACK, 
                "top",
                0,
				display.COLORS.NONE, //Rect stroke color
				display.COLORS.NONE, //Rect fill color
				display.LAYERS.CONTROLS //dynamic
            );

            if(fl) {
                fl.name = BUILDING_TYPES.LABELS;
                fl.instanceName = "Fart Scorecard Label";
                fl.getBuilding = world.getBuilding;
                fl.getChildByType = getChildByType;
                g.addChild(fl);
                display.addToDisplayList(fl, display.LAYERS.CONTROLS);
            }
            else {
                elefart.showError("failed to create Fart Scorecard label");
            }
            
            //add to displayList (update list later)
            display.addToDisplayList(g, display.LAYERS.CONTROLS);
            return g;
        }
		//fallthrough
		elefart.showError("failed to create Fart Scorecard");
		return false;         
    }

	/** 
	 * @constructor ControlFPS
	 * @classdesc an FPS display
     * @param {Controls} controls the parent Controls container
     * @returns {ControlLogo|false} the ControlLogo object     
	 */
	function ControlFPS (controls) {

		var w = factory.toInt(DIMENSIONS.CONTROL_FPS.width * controls.width);
		var h = factory.toInt(DIMENSIONS.CONTROL_FPS.height * controls.height); 
		var textSize = h;
		var t = controls.bottom - controls.margin - h;
        
        var labelText = "FPS:";
        var labelWidth = display.textPixelWidth (labelText, textSize + " px " + controls.controlFont) + h; 

		var l = controls.left + controls.margin + labelWidth;

		var f = factory.ScreenText(
				l, 
				t, 
				w, 
				h, 
				controls.controlFont,
				textSize,
				"0000", //text
				display.COLORS.BLACK, //text color
				"top", //text alignment relative to baseline
				1, //stroke width
				display.COLORS.BLACK, //Rect stroke color
				display.COLORS.WHITE, //Rect fill color
				display.LAYERS.CONTROLS //dynamic
			);
		if(f) {
			f.name = BUILDING_TYPES.CONTROL_FPS;
			f.instanceName = "FPS";
            f.getBuilding = world.getBuilding;
			f.getChildByType = getChildByType; //generic child getter function
            
            /* 
             * add Label (note correction for too small measure of 
             * the pixel width of the text)
             */
            var labelText = "FPS:";
            var labelWidth = display.textPixelWidth (labelText, textSize + " px " + controls.controlFont) + h; 
            
            var fl = factory.ScreenText(
                l - labelWidth,
                t,
                labelWidth,
                h,
                controls.controlFont,
                textSize,
                labelText,
                display.COLORS.BLACK, 
                "top",
                0,
				display.COLORS.NONE, //Rect stroke color
				display.COLORS.NONE, //Rect fill color
				display.LAYERS.CONTROLS //dynamic
            );

            if(fl) {
                fl.name = BUILDING_TYPES.LABELS;
                fl.instanceName = "FPS Label";
                fl.getBuilding = world.getBuilding;
                fl.getChildByType = getChildByType;
                f.addChild(fl);
                display.addToDisplayList(fl, display.LAYERS.CONTROLS);
            }
            else {
                elefart.showError("failed to create ControlFPS Label");
            }

			/* 
			 * update frames per second ByTime
			 */
			f.updateByTime = function () {
				f.text = controller.getFPS();
			}

			display.addToDisplayList(f, display.LAYERS.CONTROLS);
			controller.addToUpdateList(f);

			return f;
		}
		//fallthrough
		elefart.showError("failed to create ControlFPS");
		return false;
	}
    
    
    /** 
     * @constructor ControlLogo
     * @classdesc logo for the game appearin in the Controls area. Making it an 
     * Screen Object allows it to animate and be manipulated by the user.
     * @param {Controls} controls the parent Controls container
     * @returns {ControlLogo|false} the ControlLogo object
     */
    function ControlLogo (controls) {
        
        //TODO: MAKE THIS MORE SOPHISTICATED
 		var w = factory.toInt(DIMENSIONS.CONTROL_LOGO.width * controls.width);
		var h = factory.toInt(DIMENSIONS.CONTROL_LOGO.height * controls.height); 
		var textSize = h;
		var t = controls.bottom - controls.margin - h;
        var l = 0;
        var t = controls.top + controls.margin;
       
        var labelText = "ELEFART:";
        var labelWidth = display.textPixelWidth (labelText, textSize + " px " + controls.controlFont) + h; 
            
        var cl = factory.ScreenText(
                l,
                t,
                labelWidth,
                h,
                controls.controlFont,
                textSize,
                labelText,
                display.COLORS.BLACK, 
                "top",
                0,
				display.COLORS.NONE, //Rect stroke color
				display.COLORS.NONE, //Rect fill color
				display.LAYERS.CONTROLS //dynamic
        );

        if(cl) {
            cl.name = BUILDING_TYPES.LABELS;
            cl.instanceName = "Elefart Logo";
            cl.getBuilding = world.getBuilding;
            cl.getChildByType = getChildByType;
            display.addToDisplayList(cl, display.LAYERS.CONTROLS);
            return cl;
        }
        
    }

	/** 
	 * @constructor Controls
	 * @classdesc the container for the user controls below the building
     * @param {World} world the world object for the game (includes everything)
	 * - parent: world
	 * - grandparent: none
	 * - children: individual control types
	 * @returns {Controls|false} the user controls for the game
	 */
	function Controls (world) {

		var t = world.getBuilding().bottom; //buildingBottom;
		var l = world.left;
		var w = world.width;
		var h = world.bottom - t;
		var c = factory.ScreenRect(
				l, 
				t, 
				w, 
				h,
				world.getBuilding().lineWidth, //stroke
				display.COLORS.BROWN, 
				display.COLORS.YELLOW,
				display.LAYERS.BUILDING //static
			);

		//TODO: BUILDINGBOTTOM ISN'T RIGHT, TRY BOTTOM OF BOTTOM FLOOR

		//set additional Building properties and add child objects
		if(c) {
			c.name = BUILDING_TYPES.CONTROLS;
			c.instanceName = "Control Panel";
			c.margin = factory.toInt(DIMENSIONS.CONTROLS.margin * h); //relative to Width
            c.getBuilding = world.getBuilding;
			c.getChildByType = getChildByType; //generic child getter function
            c.controlFont = "Georgia";  //default font for Controls
            c.controlFontSize = 10; //default font size (in pixels) for Controls
            
            c.getControlsByCoord = function (pt) {
                if(pt.y >= c.bottom && pt.y <= c.top) {
                    return c;
                }
                return false;
            }
            
            //logo control
            c.addChild(ControlLogo(c));
			
			c.getControlLogo = function () {
				return c.getChildByType(BUILDING_TYPES.CONTROL_LOGO, false)[0];
			}

			//fps control
			c.addChild(ControlFPS(c));
			
			c.getControlFPS = function () {
				return c.getChildByType(BUILDING_TYPES.CONTROL_FPS, false)[0];
			}
            
            //goodie list control
            c.addChild(ControlGoodieList(c));
			
			c.getGoodieList = function () {
				return c.getChildByType(BUILDING_TYPES.CONTROL_GOODIE_LIST, false)[0];
			}
            
            //fart list control
            c.addChild(ControlGasList(c));
			
			c.getGasList = function () {
				return c.getChildByType(BUILDING_TYPES.CONTROL_GAS_LIST, false)[0];
			}
            
			//add control Panel to display list
			display.addToDisplayList(c, display.LAYERS.WORLD); //visible

			return c;
		}
		//fallthrough
		elefart.showError("failed to create Controls");
		return false;
	}

	/* 
	 * ============================
	 * ELEFART WORLD
	 * ============================
	 */

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

				wo.getControls = function () {
					return wo.getChildByType(BUILDING_TYPES.CONTROLS, false)[0];
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
					var building = wo.getBuilding();
					if(pt.y > building.top && pt.y < building.bottom) {
						if(pt.x > building.left && pt.x < building.right) {
							return building;
						}
					}
					return false;
				};
                
                /* 
                 * return a object with all objects under a Point coordinate
                 * used by Controller to route mouseclicks and touch events
                 */
                wo.selected = function (pt) {
                    
				    if(!pt || !factory.isNumber(pt.x) || !factory.isNumber(pt.y)) {
					   elefart.showError("World.selected() invalid Point coords supplied, x:" + x + " y:" + y);
				    }

				    var result = {};
                
                    result.building = wo.buildingSelected(pt);
                    if(result.building) {
                        var b = result.building;
				        result.person   = b.getPersonByCoord(pt);
				        result.goodie   = b.getGoodieByCoord(pt);
				        result.shaft    = b.getShaftByCoord(pt);
				        result.floor    = b.getFloorByCoord(pt);
                        result.elev     = b.getElevatorByCoord(pt);
                    }
                    else {
                        result.sky      = wo.getSky().getSkyByCoord(pt);
                        result.controls = wo.getControls().getControlsByCoord(pt);
                        result.floor    = wo.getBuilding().getFloorByCoord(pt);
                        result.shaft    = result.floor.getShaftByCoord(pt);
                    }
                    
				    return result;
                } //end of .selected

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
		controller.initUpdateList();

		//(re)set dimensions
		setDimensions(display.getCSSBreakpoint());

		setFloors(); //adjust the number of floors and shafts for extreme screens
		//reset the world
		world = World();
		if(world) {
			//this has to be re-set in Controller
			world.addChild(Sky(world));
			world.addChild(Building(world));

            //give the Controller fast access to the local (human) Player
			controller.setLocalPlayer(getLocalPlayer());

			var ctls = Controls(world);
            			
			//add some starting Gas to players
			//b.addChild(p); 
			//add additional Player elements
			//TODO: REFINE!!!!!!!!!!!!!!!!!!!!!!!

			world.addChild(ctls);
            
            getLocalPlayer().addGas(Gas(getLocalPlayer(), GAS_TYPES.SHUTTERBLAST));

			//TODO: WHY MUST PLAYER BE ADDED AFTER CONTROLS??????????

		

		} //end of if w
	}
    
    /** 
     * @method getLocalPlayer 
     * @description returns the local (human) player
     * @returns {Player|false}
     */
    function getLocalPlayer () {
        return world.getBuilding().getLocalPlayer();
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

		//local copies of network shared isomorphic code
		PERSON_TYPES = common.PERSON_TYPES,
		USER_TYPES = common.USER_TYPES,
		GOODIE_TYPES = common.GOODIE_TYPES,
		GAS_TYPES = common.GAS_TYPES;

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