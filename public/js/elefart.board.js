/** 
 * @namespace
 * BOOK: listing 4-1, p. 86
 * Major departures from book logic
 */
elefart.board = (function () {
	var settings = {
		uidLength: 5,
		maxUsers: 10000
	};
	
	//user states
	var userTypes = {
		MALE_SQUATTING: 0,
		MALE_STANDING: 1,
		MALE_RUNNING: 2,
		MALE_FALLING: 3,
		FEMALE_SQUATTING: 4,
		FEMALE_STANDING: 5,
		FEMALE_RUNNING: 6,
		FEMALE_FALLING: 7
	};
	
	var elevatorStates = {
		STATIONARY:1,
		MOVING_UP:2,
		MOVING_DOWN:3
	};
	
	//value is power of the fart to destroy, times the food type
	var fartTypes = {
		NONE: 0,
		BRIEF: 1,
		ZEEPER: 3,
		BLEEPER: 5,
		GRUTTYFART: 6,
		TRILLBLOW: 7,
		SHUTTERBLAST: 5,
		SPUTTERBLAST: 15,
		ELONGATED_SPUTTERBLAST: 25	
	};
	
	//value is power of food to create farts
	var foodTypes = {
        NONE:0,
		BEANS: 50,
		BROCCOLI: 40,
		CABBAGE: 60,
		BURRITO: 80,
		FRENCHFRIES: 20,
		ICECREAM: 20,
		FRIEDCHICKEN: 40
	};
	
	//floral perfume can overcome farts
	var perfumeTypes = {
        NONE:0,
		ROSE:60,
		DAISY:10,
		IRIS:10,
		HONEYSUCKLE:50,
		ORANGEBLOSSOM:50
	};
		
	//user skill levels
	var skillTypes = {
		BASIC: "basic",
		INTERMEDIATE: "intermediate",
		ADVANCED: "advanced"
	};
	
	/* 
	 * health values are computed for the start value below to the next
	 * one. So you are REPULSED with a score betwee 
	 */
	var healthVals = {
		PERFECT: 100,    //full health
		ALERTED: 80,     //nose twitchs
		REPULSED: 70,    //holding nose, but ok
		STAGGERED: 50,   //wobbly walk
		CRAWLING: 25,    //crawling
		DEAD: 0	         //dead
	};
	
	var users = [],  //array of users
	elevators = [],  //array grid of elevators for each floor
	floors = [],     //floors with elevators
	goodies = [],    //perfume and food
	cols = 6,        //default
	rows = 6,        //default
	numElefartTypes = 10; //types refer to specific fart animations
    
	/** 
	 * =========================================
     * UTILITIES 
     * =========================================
     */
	
	/** 
	 * polyfill Date.now
	 */
	if (!Date.now) {
		Date.now = function() { return new Date().getTime(); };
	}
	
	/** 
	 * polyfill JS Math.random to make it a bit more random 
	 * by including mousemove data
	 */
	Math.random=(function(rand) {
		var salt=0;
		document.addEventListener('mousemove',function(event) {
			salt=event.pageX*event.pageY;
		});
		return function() { return (rand()+(1/(1+salt)))%1; };
	})(Math.random);
	
	
	/** 
	 * @method getRandomInt
	 * bounded random number
	 * @link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/random
	 */
	function getRandomInt (min, max) {
		return Math.floor(Math.random() * (max - min + 1)) + min;
	}
	
	function coinFlip () {
		var rnd = Math.random();
		if(rnd < 0.5) return true; else return false;
	}

    /** 
     * polyfill Array.prototype with a shuffle algorithm
     * shuffle and array
     * @link http://en.wikipedia.org/wiki/Fisher%E2%80%93Yates_shuffle#The_modern_algorithm
     * @link http://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array
     */
    Array.prototype.shuffle = function() {
        var i = this.length, j, temp;
        if ( i == 0 ) return this;
        while ( --i ) {
            j = Math.floor( Math.random() * ( i + 1 ) );
            temp = this[i];
            this[i] = this[j];
            this[j] = temp;
        }
        return this;
    }
    
	/** 
	 * @method makeTimestamp
	 * return a Unix-style timestamp
	 * @return {Number} unix seconds since last epoch
	 * added mousemove to make things more random
	 */
	function getTimeStamp () {
		return (Math.floor(+new Date()/1000));
	}
	
    
    /* 
     * =========================================
     * initialize the board
     * =========================================
     */

	/** 
	 * @method initialize
	 * Creates the default building array
	 * the width and height come from display-canvas.js (View)
	 * @param {Number} width the number of columns
	 * @param {Number} height the number of rows
	 */
	function init (c, f) {
		console.log("elefart.board::init(), re-initializing board logic with rows:" + f + ", cols:" + c);
		//create the default building
        rows = f;
        cols = c;
		fillBuilding();

		//make the default user, and 2 machine users
		makeUser("default", userTypes.MALE_STANDING, 0);
		makeUser("bobo", userTypes.MALE_SQUATTING, 2);
		makeUser("skanky", userTypes.MALE_RUNNING, 4);

	}

    
    /* 
     * =========================================
     * USERS
     * =========================================
     */
	
    
	/** 
	 * @method randomUserId
	 * generate a random user number of a specified length
	 * @param {Number} N the number of characters in the user Id
	 * @link http://stackoverflow.com/questions/1349404/generate-a-string-of-5-random-characters-in-javascript
	 */
	function randomUserId (N) {
		var id = new Array(N+1)
		.join((Math.random()
		.toString(36)+'00000000000000000')
		.slice(2, 18)).slice(0, N);
		for(var i = 0; i < users.length; i++) {
			if(users[i].uid === id) {
				users[i].uid = randomId(N);
			}
		}
		return id;
	}
		
	/** 
	 * @method makeUser
	 * make a new user
	 * @param {String} uName the user name
	 * @param {userTypes} type what kind of user to show
	 * @param {Number} r OPTIONAL user row (floor) predefined
	 * @return {false|String} if user created, return the new user, else false
	 */
	function makeUser (uName, type, r) {
		
		console.log("elefart.board::makeUser(), username:" + uName);
		var availCols = [];
		for(var i = 0; i < cols; i++) {
			availCols[i] = true;	
		}
		
		//default row
		if(!r) {
			r = 0;
		}
		
		//flag user name invalid
		//occupied spaces
		for(var i = 0; i < users.length; i++) {
			if(users[i].uname === uName) {
				console.log("user name " + uName + " already taken at position:" + i);
				return false;
			}
			if(users[i].row == r) {
				availCols[users[i].col] = false;
			}
		}
		
		//randomize secondary user position
		var availCol = -1;
		for(var i = 0; i < cols; i++) {
			if(availCols[i] == true) {
				if(coinFlip()) {
					availCol = i;
					break;
				}
			}
		}
		//if the user wasn't assigned, force-assign them
		if(availCol < 0) {
			for(var i = 0; i < cols; i++) {
				if(availCols[i] == true) {
					availCol = i;
					break;
				}
			}
		}
		
		if(availCol < 0) {
			console.log("ERROR: too many users created on same floor");
			return false;
		}
		
		//if we are the first user, we are the default (local) user
		//otherwise, we are a remote user, or a machine-generated user
		var loc = true;
		if(users.length) {
			//console.log("setting loc to false for user:" + uName + ", users.length:" + users.length);
			loc = false;
		}
		else {
			//console.log("loc is true for user:" + uName);
		}
				
		//create a new user
		var id = randomUserId(settings.uidLength);
		users.push( {
			uname:uName,           //public user name
			uid:id,                //unique identifier (independent of name)
			local:loc,             //are we the first (local) user?
			state:type,            //what kind of animated character to show
			frame:0,               //frame in animation of animated character (zero-based here)
			floor:r,               //floor of hotel where user is created (zero-based here)
			floorCol:availCol,     //empty column (elevator shaft) to position user in
			gas:0,                 //amount of gas available to attack
			gasMask:0,             //amount of protection left in gas mask
			perfume:perfumeTypes.NONE,             //perfume amounts to the score for the quest
			health:healthVals.PERFECT, //current user health
			score:0,               //score for quests
			path:[],               //last path taken
			lastWayPoint:{
				floor:0,
				floorCol:0
			},                     //position at end of last turn
			skill:skillTypes.BASIC
		});
		
		//return the new user
		//return users[id];
	}
	
	/** 
	 * @method getUser
	 * @param {String} uid the user Id
	 * @return {Object|false} return user object, or false if not found
	 */
	function getUser (id) {
		if(typeof  id === "string") {
			//console.log("STRING ID:" + id);
			window.users = users;
			return users[id];
		}
		else if(typeof id === "object") {
			return id;
		}
		else {
			return false;
		}
	}
	
	/** 
	 * @method clearUserByName
	 * delete a user
	 */
	function clearUserByName (uName) {
		for(var i = 0; i < users.length; i++) {
			if(uName === users[i].uid) {
				return users.splice(i, 1)[0];		
			}
		}
		return false;
	}
	
	/** 
	 * @method calcUserHealth
	 * given an elevator smell, calculate user health
	 * gas in elevator may be fought by
	 * -gas mask
	 * -user's own gas, if they elect to fart
	 */
	function calcUserHealth(user, elev, useGas) {
		user = getUser(user);
		user.health -= (getSmell(elev) - user.gasMask - user.gas);
		return user.health;
	}


    /** 
     * @method changeUserPosition
     * change the position of a user, based on user input, or 
     * machine Ai. 
     * NOTE: we don't call user position because requestAnimationFrame() 
     * in our elefart.display-canvas will read these values during a draw 
     * cycle.
     * @param {ID} uid the user id
     * @param {Number} floor the floor the user will move to
     * @param {Number} floorCol the elevator shaft the user will be in, or start from
     */
    function changeUserPosition(uid, floor, floorCol) {
        for(var i = 0; i < users.length; i++) {
            if(users[i].uid === uid) {
                
                //users can only move laterally, between elevator columns on a user touch
                //the elevator must transport the user between floors
                if(users[i].floor == floor) {
                    //save last position
                    users[i].lastWayPoint.floor = users[i].floor;
                    users[i].lastWayPoint.floorCol = users[i].floorCol;
                    //new position
                    users[i].floorCol = floorCol;
                }
            }
        }
    }
    

    /* 
     * =========================================
     * USER PERFUME
     * =========================================
     */

    
    /** 
	 * @method addUserPerfume
	 * perfume is a 'goodie' in the game, amounting to 
	 * a higher score
	 * @param {String} id user unique id (not name)
	 * @param {String} perfumeType the type of perfume added to user
	 */
	function addUserPerfume (id, perfumeType) {
		getUser(id).perfume += perfume[perfumeType];
	}
		
	/** 
	 * @method clearUserPerfume
	 * zero out user Perfume
	 * @param {String} id user unique id (not name)
	 */
	function clearUserPerfume (id) {
		getUser(id).perfume = perfumeTypes.NONE;
	}
	
	
    /* 
     * =========================================
     * USER FOOD
     * =========================================
     */

    /** 
	 * @method addFood
	 * add value of food, based on lookup table
	 * @param {String} id user unique id (not name)
	 * @param {String} foodType type of food user ate
	 */
	function addUserFood (id, foodType) {
		getUser(id).gas += food[foodType];
	}
	
	/** 
	 * @method clearUserFood
	 * @param {String} id user unique id (not name)
	 * delete food value value of food
	 */	
	function clearUserFood(id) {
		getUser(id).gas = foodTypes.NONE;
	}
	

    
    /* 
     * =========================================
     * USER GAS MASK
     * =========================================
     */

    
    /** 
	 * @method addUserGasMask
	 * add more charcoal to the gas mask
	 * @param {String} id user unique id (not name)
	 */
	function addUserGasMask (id, charcoal) {
		var user = getUser(id);
		user.gasMask += charcoal;
	}
	
	/** 
	 * @method clearUserGasMask
	 * @param {String} id user unique id (not name)
	 */
	function clearUserGasMask (id) {
		var user = getUser(id);
		user.gasMask = 0;
	}


    /* 
     * =========================================
     * USER FARTS
     * =========================================
     */
    

	/** 
	 * @method makeFart
	 * values for each portion of the user's path
	 * @param {String} id user unique id (not name)
	 * @return {Object} Waypoint with position, time created, and type of fart
	 */
	function makeUserFart (id, fartType) {
		var user = getUser(id);
		return {
			uid:id,
			tstamp:getTimeStamp(),
			smell: farts[fartType],
			disperse: function () {
				var tstamp = getTimeStamp();
				return smell *= 0.5;
				if(smell < fartTypes.BRIEF) {
					smell = 0;
				}
				return smell;
			}
		};
	}
	
	
    /* 
     * =========================================
     * ELEVATORS
     * =========================================
     */

    
    /** 
	 * @method makeElevator
	 * BOOK: Listing 4-7, p. 91
	 * define an individual elevator and its properties
	 * @param {Number} floor the y coordinate of the elevator (floor)
	 * @param {Number} floorCol the x coordinate of the floor (shaft number)
	 * @returns {Object} object with fart type and an 
	 */
	function makeElevator (floorCol, floor) {
		//randomly choose one of the defined fart types
		return {
			busy:false, //elevator available
			floor:floor,
			floorCol: floorCol,
			floorList:[],
			deposits:[],    //list of users recently at elevator (and what they left behind)
			moving:elevatorStates.STATIONARY
		};
	}
	
	/** 
	 * @method clearElevator
	 * clear contents of an elevator
	 * @param {Object} elev an existing elevator 
	 * (cleared by reference to original)
	 */
	function clearElevator (elev) {
		for(var i = 0; i < elevators.length; i++) {
			if(elev === elevators[i]) {
				return elevators.splice(i, 1)[0];		
			}
		}
	}

	/** 
	 * @method getElevator
	 * BOOK: Listing 4-9, p. 92
     * @param {Number} floor the elevator floor (y)
     * @param {Number} floorCol the elevator shaft
	 */
	function getElevator (floor, floorCol) {
        if(floor >= 0 && floorCol >= 0) {
            if(elevators[floorCol].floor == floor) {
                    return elevators[floorCol];
                }
        } 
        else {
            if(elefart.DEBUG) 
	    	console.log("ERROR: elefart.board::getElevator(), floor:" + floor + " floorCol:" + floorCol);
        }
		return false;
	}
    
	/** 
	 * @method getElevatorFarts
	 * check an elevator to see if we are safe, or sorry
	 * examine the users array in each elevator to see what has been left behind
	 * this should be called with a time delay corresponding to moving from one floor 
	 * to the other with an elevator
	 */
	function getElevatorFarts (y, x) {
		var elev = getElevator(y, x);
		var stink = 0;
		for(var i = 0; i < elev.farts.length; i++) {
			stink += elev.farts[i].smell;
		}
		return stink;
	}
    
    
    /** 
     * @method addElevatorFloorDest
     * add a floor the elevator needs to go to
     * the elevator logic figures out which is the 
     * closest floor to go to next
     */
    function addElevatorFloorDest(floor, floorCol) {
       for(var i = 0; i < elevators.length; i++) {
            if(elevators[i].floor === floor) {
                elevators[i].floorList.push(floorCol);
            }
        }        
    }
    
    
    
    /* 
     * =========================================
     * BUILDING
     * =========================================
     */

	/** 
	 * @method fillBuilding
	 * reset the building. Elevators are attached to a list of 
     * elevator shafts
	 */
	function fillBuilding () {
		
		elevators = [];
        
        	//x is florCols
        	for(var x = 0; x < cols; x++) {
            		var p = getRandomInt(0, rows-1);
            		elevators[x] = makeElevator(x, p);
        	}
	}
	

    /* 
     * =========================================
     * PRINT BOARD STATE (DEBUG)
     * =========================================
     */

    
	/** 
	 * @method printBuilding
	 * BOOK: Listing 4-4, p. 88
	 * a way of printing out the current game board 
	 * in string format for debugging
	 */
	function printBuilding () {
		console.log("--------------------------------");
		console.log("BUILDING:");		
		for(var y = 0; y < rows; y++) {
			var str = "";
			for(var x = 0; x < cols; x++) {
				var elv = getElevator(y, x);
				str += "("+y+","+x+")";
				if(elv.busy) str += " busy:"; else str += "open";
				str += "  ";
			}
			console.log(str);
		}
		console.log("--------------------------------");		
	}
	
    
	/** 
	 * @method printUsers
	 */
	function printUsers () {
		console.log("--------------------------------");
		console.log("USERS:");		
		for(var i = 0; i < users.length; i++) {
			u = users[i];
			console.log("USER("+u.uname+")");
			console.log(" - uid:" + u.uid + ", skill:" + u.skill);	
            console.log(" - floor:" + u.floor + ", elevator:" + u.floorCol);
			console.log(" - last floor:" + u.lastWayPoint.floorCol + ", last elevator:" + u.lastWayPoint.floor + ", gas:" + u.gas);
			console.log("--------------------------------");
		}
	}
    
	//return public methods
	return {
		init:init,
		goodies:goodies,
		cols:cols,
		rows:rows,
		userTypes:userTypes,
		fartTypes:fartTypes,
		foodTypes:foodTypes,
		perfumeTypes:perfumeTypes,
		skillTypes:skillTypes,
		//users
		users:users,
		makeUser:makeUser,
		getUser:getUser,
		clearUserByName:clearUserByName,
        changeUserPosition:changeUserPosition,
		//elevators
		elevators:elevators,
		getElevator:getElevator,
		clearElevator:clearElevator,
		//floors
		//building
		fillBuilding:fillBuilding,
		//debug
		printUsers:printUsers,
		printBuilding:printBuilding,
		users:users
	};
})();
