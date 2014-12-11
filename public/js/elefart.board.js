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
		IDLE:1,             //on floor, doors open
		CALLED_BY_USER:2,   //user just clicked a request button
		ARRIVED_FLOOR:3,
		USER_OPEN_DOOR:4,   //user at an elevator requested doors to be opened
		USER_CLOSE_DOOR:5,  //user inside elevator requested doors to be closed
		DOORS_OPEN_IDLE:6,  //doors open with users, wait, then close
		DOORS_OPENING:7,    //elevator doors are opening
		DOORS_OPENED:8,     //elevator doors just opened on floor
		DOORS_CLOSING:9,    //elevator doors are closing
		DOORS_CLOSED_IDLE:10,
		DOORS_CLOSED_IDLEDONE:11,
		DOORS_CLOSED:12,    //elevator doors just closed
		MOVING:13           //doors closed, moving
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
	
	var users = [],        //array of users
	elevators = [],        //array grid of elevators for each floor
	floors = [],           //floors with elevators
	goodies = [],          //perfume and food
	dimensions={shafts:0, floors:0},
	UPDATE_INCREMENT = 1,  //use to calculate progress to goal. each object has different total
	numElefartTypes = 10;  //types refer to specific fart animations
	
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
	Array.prototype.shuffle = function () {
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
	 * @param {Number} height the number of numFloors
	 */
	function init (numShafts, numFloors) {
		console.log("elefart.board::init(), re-initializing board logic with numFloors:" + numFloors + ", shafts:" + numShafts);
		//create the default building

		dimensions.shafts = numShafts;
		dimensions.floors = numFloors;

		console.log("elefart.board::init(), now we have numFloors:" + dimensions.floors + ", shafts:" + dimensions.shafts);
		console.log("elefart.board::init(), outside we have numFloors:" + elefart.board.dimensions.floors + ", shafts:" + elefart.board.dimensions.shafts);

		fillBuilding();

		//make the default user, and 2 machine users
		makeUser("default", userTypes.MALE_STANDING, 0);
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
	 * @param {Boolean} machine OPTIONAL if true, operate user using game Ai
	 * @return {false|String} if user created, return the new user, else false
	 */
	function makeUser (uName, type, floor, machine) {

		console.log("elefart.board::makeUser(), username:" + uName);

		//default row
		if(!floor) floor = 0;

		//default user state
		if(!machine) machine = "false";
		
		//flag user name invalid
		//occupied spaces
		for(var i = 0; i < users.length; i++) {
			if(users[i].uname === uName) {
				console.log("user name " + uName + " already taken at position:" + i);
				return false;
			}
		}

		//if we are the first user, we are the default (local) user
		//otherwise, we are a remote user, or a machine-generated user
		var loc = true;
		if(users.length) {
			//console.log("setting loc to false for user:" + uName + ", users.length:" + users.length);
			loc = false;
		}
		var shaft = getRandomInt(0, elevators.length -1);

		//create a new user
		var id = randomUserId(settings.uidLength);
		var u = {
			uname:uName,           //public user name
			uid:id,                //unique identifier (independent of name)
			local:loc,             //are we the first (local) user?
			machine:machine,       //human, or machine player?
			state:type,            //what kind of animated character to show
			frame:0,               //frame in animation of animated character (zero-based here)
			floor:floor,           //floor of hotel where user is created (zero-based here)
			shaft:shaft,
			gas:0,                 //amount of gas available to attack
			gasMask:0,             //amount of protection left in gas mask
			perfume:perfumeTypes.NONE,             //perfume amounts to the score for the quest
			health:healthVals.PERFECT, //current user health
			score:0,               //score for quests
			path:[],               //last path taken
			lastWayPoint:{
				floor:floor,
				shaft:shaft
			},                     //position at end of last turn
			skill:skillTypes.BASIC
		};

		//see if we need to be assigned to an idle elevator on the floor
		if(getElevatorOnFloor(floor, shaft)) {
			addUserToElevator(floor, shaft, u);
		}

		users.push(u);
		
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
	 * @param {String} uName the user's screen name
	 * @returns {Boolean} if found and cleared, return true, else false
	 */
	function clearUserByName (uName) {
		for(var i = 0; i < users.length; i++) {
			if(uName === users[i].uid) {
				users.splice(i, 1)[0];
				return true;
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
	 * @param {Number} shaft the elevator shaft the user will be in, or start from
	 */
	function userChangePosition(floor, shaft, user) {
	
		if(shaft >= elevators.length || shaft < 0) {
			console.log("ERROR: elefart.board::userChangePosition(), invalid shaft:" + shaft);
			return;
		}
		if(floor >= dimensions.shafts || floor < 0) {
			console.log("ERROR: elefart.board::userChangePosition(), invalid floor:" + floor);
			//return;
		}

		//save last position
		user.lastWayPoint.floor = user.floor;
		user.lastWayPoint.shaft = user.shaft;
		//new position
		user.shaft = shaft;
		user.floor = floor;
	}

	/** 
	 * @method getUsersAtShaft
	 * given a shaft and floor, find if users are waiting
	 * @param {Number} floor floor to check
	 * @param {Number} shaft shaft to check
	 * @returns {Array|false} if users, return array of them else false
	 */
	function getUsersAtShaft (floor, shaft) {
		var shaftUsers = [];
		for(var i = 0; i < users.length; i++) {
			if(users[i].floor === floor && 
				users[i].shaft === shaft) {
				shaftUsers.push(users[i]);
			}
		}
		if(shaftUsers.length) {
			return shaftUsers;
		}
		return false;
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
		var u = getUser(id);
		if(u) {
			u.perfume += perfume[perfumeType];
			return true;
		}
		return false;
	}
		
	/** 
	 * @method clearUserPerfume
	 * zero out user Perfume
	 * @param {String} id user unique id (not name)
	 */
	function clearUserPerfume (id) {
		var u = getUser(id);
		if(u) {
			u.perfume = perfumeTypes.NONE;
			return true;
		}
		return false;
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
		var u = getUser(id);
		if(u) {
			u.gas += food[foodType];
			return true;
		}
		return false;
	}
	
	/** 
	 * @method clearUserFood
	 * @param {String} id user unique id (not name)
	 * delete food value value of food
	 */	
	function clearUserFood(id) {
		var u = getUser(id);
		if(u) {
			u.gas = foodTypes.NONE;
			return true;
		}
		return false;
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
		var u = getUser(id);
		if(u) {
			u.gasMask += charcoal;
			return true;
		}
		return false;
	}
	
	/** 
	 * @method clearUserGasMask
	 * @param {String} id user unique id (not name)
	 */
	function clearUserGasMask (id) {
		var u = getUser(id);
		if(u) {
			u.gasMask = 0;
			return true;
		}
		return false;
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
		if(u) {
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
		return false;
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
	 * @param {Number} shaft the x coordinate of the floor (shaft number)
	 * @returns {Object} object with fart type and an 
	 */
	function makeElevator (shaft, floor) {
		//randomly choose one of the defined fart types
		return {
			busy:false,     //elevator available
			doorsOpen:true, //elevator doors open
			state:elevatorStates.IDLE,
			setState:function (state) {
				this.state = state;
				console.log("ELEVATOR STATE CHANGE: floor:"+ this.floor + ","+ this.shaft + " state:" + this.state);
			},
			opaque:1.0,
			increments:0,     //number of steps currently in state
			maxIncrements:0,  //number of steps needed to complete current state
			floor:floor,
			shaft: shaft,
			destinations:[],  //queue for floors to go to
			users:[],         //users currently in the elevator
			deposits:[]      //farts left behing in the elevator
		};
	}
	
	/** 
	 * @method clearElevator
	 * delete an elevator
	 * @param {Object} elev an existing elevator 
	 * (cleared by reference to original)
	 */
	function clearElevator (shaft) {
		if(elevators[shaft]) {
			elevators.splice(shaft, 1)[0];
			return true;
		}
		return false;
	}

	/** 
	 * @method getElevator
	 * get the elevator, regardless of what floor it is on
	 * @param {Number} shaft the elevator shaft
	 * @returns {Elevator|false} if shaft is valid, return elevator, else false
	 */
	function getElevator (shaft) {
		if(elevators[shaft]) {
			return elevators[shaft];
		}
		else {
			console.log("ERROR: elefart.board::getElevator(), invalid shaft:" + shaft);
		}
		return false;
	}

	/** 
	 * @method getElevatorOnFloor
	 * gets the elevator only if it is on the specified floor
	 * BOOK: Listing 4-9, p. 92
	 * @param {Number} floor the elevator floor (y)
	 * @param {Number} shaft the elevator shaft
	 * @returns {Elevator|false} if on floor, return elevator, else false
	 */
	function getElevatorOnFloor (floor, shaft) {
		if(elevators[shaft]) {
			if(elevators[shaft].floor == floor) {
					return elevators[shaft]; //elevator in shaft is on floor
			}
			//NOTE: normal for an elevator NOT to be on the requested floor, not an error
		} 
		else {
			if(elefart.DEBUG) 
			console.log("ERROR: elefart.board::getElevatorOnFloor(), floor:" + floor + " shaft:" + shaft);
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
	function getElevatorFarts (floor, shaft) {
		var elev = getElevator(shaft);
		var stink = 0;
		for(var i = 0; i < elev.farts.length; i++) {
			stink += elev.farts[i].smell;
		}
		return stink;
	}

	/** 
	 * @move getBusy
	 * indicate if the elevator is in an idle state
	 */
	function elevatorBusy(shaft) {
		var elev = getElevator(shaft);
		if(elev) {
			return elev.busy;
		}
		else {
			console.log("ERROR:elefart.board::getBusy() invalid elevator for shaft:" + shaft);
		}
	}

	/** 
	 * @method openElevatorDoor
	 * open closed or closing door
	 */
	function openElevatorDoor(shaft) {
		var elev = elevators[shaft];
		if(elev) {
			if(elev.state !== elevatorStates.DOOR_OPEN) {
				elev.state = elevatorStates.DOORS_OPENING;
			}
		}
	}

	/** 
	 * @method closeElevatorDoor
	 * close open or opening elevator door
	 */
	function closeElevatorDoor(shaft) {
		var elev = elevators[shaft];
		if(elev) {
			if(elev.state !== elevatorStates.DOORS_CLOSED) {
				elev.state = elevatorStates.DOORS_CLOSING;
			}
		}
	}

	/** 
	 * @method addElevatorDest
	 * add a floor the elevator needs to go to
	 * the elevator logic figures out which is the 
	 * closest floor to go to next
	 */
	function addElevatorDest(floor, shaft) {
		if(elevators[shaft] && elevators[shaft].floor) {
			//check the queue
			var dests = elevators[shaft].destinations;
			for(var i = 0; i < dests.length; i++) {
				if(dests[i] === floor) return;
			}
			dests.push(floor);
		}
	}
	
	/** 
	 * @method clearElevatorDest
	 * clear a destination (e.g. when the elevator reaches that floor)
	 */
	function clearElevatorDest(floor, shaft) {
		//elevator is at the specified floor
		if(elevators[shaft] && elevators[shaft].destinations[floor]) {
				elevators[shaft].destinations.splice(floor, 1)[0];
				return true;
		}
		return false;
	}


	/* 
	 * =========================================
	 * USER-ELEVATOR INTERACTIONS
	 * =========================================
	 */


	/** 
	 * @method userChangeShaft
	 * user jumps to new shaft position
	 */
	function userChangeShaft (shaft, user) {
		console.log("elefart.board::userChangeShaft(), shaft:" + shaft + " user:" + user);
		var elev = elevators[shaft];
		//if the user landed on a non-busy elevator, add it
		if(elev) {
			if(elev.floor === user.floor) {
				switch(elev.state) {
					case elevatorStates.IDLE:
					case elevatorStates.DOORS_OPENED:
						addUserToElevator(user.floor, shaft, user);
						break;
					case elevatorStates.DOORS_CLOSING:
					case elevatorStates.DOORS_CLOSED:
						openElevatorDoor(shaft);
						break;
					default:
						break;
				}
			}
			else { //elevator not on user floor
				addElevatorDest(user.floor, shaft);
			}
		}

		//user position changes in both cases
		userChangePosition(user.floor, shaft, user);
	}

	/** 
	 * @method addUserToElevator
	 * add a user to an elevator 
	 * (can only happen when it is idle at a floor)
	 */
	function addUserToElevator (floor, shaft, user) {

		if(elevators[shaft] && !elevatorBusy(shaft)) { //elevator exists and is idle
			if(elevators[shaft].floor == floor) { //elevator on user's floor
				clearUserFromElevator(user);
				var elev = elevators[shaft];
				console.log("elefart.board.addUserToElevator(), adding user to elevator:" + shaft);
				elev.users.push(user); //add user to elevator

				//change the state if doors are closeing (user can re-open door to get in)
				if(elev.state === elevatorStates.DOORS_CLOSED_IDLE || 
					elev.state === elevatorStates.DOORS_CLOSING) {
					elev.state = elevatorStates.USER_OPEN_DOOR;
				}

			}
			else {
				console.log("elefart.board.addUserToElevator(), elevator not busy, but on wrong floor to add user, floor:" + floor + " shaft:" + shaft);
			
			}
		}
		else {
			console.log("elefart.board.addUserToElevator(), elevator busy, shaft:" + shaft);
		}
	}

	/** 
	 * @method clearUserFromElevator
	 * remove a user from an elevator 
	 * @param {Number} floor the floor of the elevator (only can remove is)
	 */
	function clearUserFromElevator (user) {
		for(var i = 0; i < elevators.length; i++) {
			for(var j = 0; j < elevators[i].users.length; j++) {
				if(elevators[i].users[j] === user) {
					elevators[i].users.splice(i, 1)[0];
					return true;
				}
			}
		}
		console.log("elefart.board.clearUserFromElevator(), couldn't find user:" + user);
		return false;
	}



	/** 
	 * @method userRequestElevator
	 * user requests a new floor when inside an elevator
	 */
	function userRequestElevator(floor, shaft, user) {
		var elev = elevators[shaft]; //elevator in shaft, user superimposed
		if(user.floor !== elev.floor ) {
			addElevatorDest(floor, shaft) 
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
		
		//NOTE: just emptying the elevator creates a new variable(!)
		if(elevators.length) elevators = [];

		for(var shaft = 0; shaft < dimensions.shafts; shaft++) {
			console.log("adding elevator:" + shaft + " to elevators");
				var floor = getRandomInt(0, dimensions.floors-1);
				elevators[shaft] = makeElevator(shaft, floor);
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
		for(var floor = 0; floor < dimensions.floors; floor++) {
			var str = "";
			for(var shaft = 0; shaft < dimensions.shafts; shaft++) {
				var elev = getElevator(floor);
				str += "("+floor+","+shaft+")";
				if(elev.busy) str += " busy:"; else str += "open";
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
			console.log(" - floor:" + u.floor + ", elevator:" + u.shaft);
			console.log(" - last floor:" + u.lastWayPoint.shaft + ", last elevator:" + u.lastWayPoint.floor + ", gas:" + u.gas);
			console.log("--------------------------------");
		}
	}
	
	//return public methods
	return {
		init:init,
		goodies:goodies,
		dimensions:dimensions,
		elevatorStates:elevatorStates,
		userTypes:userTypes,
		fartTypes:fartTypes,
		foodTypes:foodTypes,
		perfumeTypes:perfumeTypes,
		skillTypes:skillTypes,
		//users
		users:users,
		makeUser:makeUser,
		getUser:getUser,
		getUsersAtShaft:getUsersAtShaft,
		clearUserByName:clearUserByName,
		userChangePosition:userChangePosition,
		//elevators
		elevators:elevators,
		getElevator:getElevator,
		getElevatorOnFloor:getElevatorOnFloor,
		clearElevator:clearElevator,
		elevatorBusy:elevatorBusy,
		addElevatorDest:addElevatorDest,
		clearElevatorDest:clearElevatorDest,
		addUserToElevator:addUserToElevator,
		clearUserFromElevator:clearUserFromElevator,
		userChangeShaft:userChangeShaft,
		userRequestElevator:userRequestElevator,
		//floors
		//building
		fillBuilding:fillBuilding,
		//debug
		printUsers:printUsers,
		printBuilding:printBuilding,
		users:users
	};
})();

