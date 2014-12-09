/** 
 * @namespace
 * Controller functions
 * Major departures from book logic
 * adapted from Chapter 8, "interacting with the game"
 * supports:
 * - standard mouse desktop events
 * - mouse events on touch devices
 * - keyboard events
 * - virtual keyboard events
 */
elefart.controller = (function () {
	
	var gamePanel,
	board = elefart.board,
	display = elefart.display,
	foreground, //reference to HTML5 canvas foreground
	background,
	loopCount = 0,               //count requestAnimationFrame loops
	updateInterval = 10, //how many animation loops to wait before drawing model
	firstRun = true;

	/** 
	 * @method init
	 * initialize the controller
	 */
	function init (panel) {
		
		console.log("initializing elefart controller");

		//get the dom object with foreground and background
		gamePanel = panel;
		
		//get the canvas objects
		var canvasList = gamePanel.getElementsByTagName('canvas');
		for(var i = 0; i < canvasList.length; i++) {
			switch(canvasList[i].id) {
				case 'game-foreground':
					foreground = canvasList[i];
					break;
				case 'game-background':
					background = canvasList[i];
					break;
				default:
					break;
			}
		}
		
		console.log("in elefart.controller, elefart.display.foreground is a:" + foreground);
		
			//keypress event listener
			document.addEventListener("keypress", function (e) {
			handleKeyPress(e.keyCode);
			}, false);
		
			//mouse click listener
			foreground.addEventListener("click", function (e) {
				handleTouchPoint({x:e.clientX, y:e.clientY});
			}, false);
		
		foreground.addEventListener("touchmove", function (e) {
			handleTouchPoint({x:e.touches[0].clientX, y:e.touches[0].clientY});
		}, false);
	
	}
	
	
	/** 
	 * =========================================
	 * UTILITIES
	 * =========================================
	 */

	/** 
	 * @method between
	 * determines whether a value is between a minmum and maximum
	 * @param {Number} num the number to test
	 * @param {Number} b1 the first value
	 * @param {Number} b2 the second value
	 * @return {Boolean} if between, return true, else false
	 */
	function between(num, b1, b2){
		result = false;
		
		if (b1 < b2){
			if (num > b1 && p < b2) {
				return true;
			}
		}
		else if (b1 > b2) {
			if(num > b2 && p < b1) {
			return true;
			}
		}
		else if(num == b1 || p == b2) {
			return true;
		}
		return false;
	}

	/** 
	 * @method pointInRect
	 * confirms whether a xy coordinate point is in a rectangle
	 * used to make canvas objects "clickable"
	 * @param {Point} pt an {x, y} point
	 * @param {Rect} rt a {top, left, width, height} rectangle object. Rect object
	 * structure matches that used in HTML5 canvas API
	 */
	function pointInRect (pt, rt) {
		if(between(pt.x, rt.left, (rt.left + rt.width)) && between(pt.y, rt.top, (rt.top + rt.height))) {
			return true;
		}
		return false;
	}
	
	


	/** 
	 * =========================================
	 * EVENT LISTENER CALLBACKS
	 * =========================================
	 */
	
	
	/** 
	 * @method handleKeyPress
	 * handle key being pressed
	 * @param {CharCode} k the character code for the key pressed
	 */
	function handleKeyPress(k) {
		console.log("elefart.controller::handleKeyPress(), keypress is:" + k);
	
	}
	
	
	/** 
	 * @method handleTouchPoint
	 * handle mouse clicks and touchmove events
	 * @param {Point} pt and {x, y} coordinate where click or touch happened
	 */
	function handleTouchPoint (pt) {
		
		console.log("elefart.controller::handleTouchPoint(), x:" + pt.x + ", y:" + pt.y);

		//get the row and column of the selection (or none if outside)

		//TODO:
		//TODO: abstract this so any user can do this!

		//if floor is the same floor as default (local, human) user, allow move to proceed
		var defaultUser = board.users[0];
		if(defaultUser) {

			var clickFloor = display.getFloor(pt);
			var clickShaft = display.getShaft(pt);
			console.log("elefart.controller.handleTouchPoint(), CLICK floor:" + clickFloor + " shaft:" + clickShaft + " user:" + defaultUser);

			if(defaultUser.floor == clickFloor) {

				if(defaultUser.shaft !== clickShaft) { //move to new elevator shaft (elevator may not be there)

					console.log("elefart.controller::handleTouchPoint(), move to new shaft");
					board.userChangeShaft(clickShaft, defaultUser);

				} //end of user moving to new shaft
			}
			else {  //in a shaft, elevator differen shaft, send message to elevator to move to new floor
					//user doesn't move
					//elevator queues visit
					console.log("elefart.controller::handleTouchPoint(), specified new floor");
					board.userRequestElevator(clickFloor, clickShaft, defaultUser);
			}
		} //end of valid default user
		
		console.log("elefart.controller::handleTouchPoint(), USER SELECTED floor:" + defaultUser.floor + " shaft:" + defaultUser.shaft);

	}
	
	/** 
	 * @method handleTouchRect
	 * handle cases where a rect, rather than a point is returned for 
	 * a touch or mouse event
	 * @param {Rect} rt the rect where the event happened
	 */
	function handleTouchRect(rt) {
		console.log("elefart.controller::handleTouchRect(), top:" + rt.top + " left:" + rt.left + " width:" + rt.width + " height:" + rt.height);
	}

	/** 
	 * =========================================
	 * GAME LOOP
	 * =========================================
	 */

	/** 
	 * @method updateElevators
	 * update elevators in gameloop
	 */
	function updateElevators () {

		for(var i = 0; i < board.elevators.length; i++) {
			var elev = board.elevators[i];
			
			switch(elev.state) {
				case board.elevatorStates.IDLE:
					if(elev.destinations.length) {
						elev.maxIncrements = 50;
						elev.increments = 0;
						elev.state = board.elevatorStates.DOOR_CLOSING;
					}
					else {
						//no destinations, just hang
					}
					break;
				case board.elevatorStates.DOOR_CLOSING:
					if(elev.increments >= elev.maxIncrements) { //new state
						elev.increments = 0;
						elev.maxIncrements = 75;
						elev.state = board.elevatorStates.DOOR_CLOSED_IDLE;
						elev.stateStack.push("DOOR_CLOSING"); ///////////////////////
					}
					else {
						elev.increments++;
					}
					break;
				case board.elevatorStates.DOOR_CLOSED_IDLE:
					if(elev.increments >= elev.MaxIncrements) {
						elev.increments = 0
						elev.maxIncrements = 25;
						elev.state = board.elevatorStates.DOORS_CLOSED_IDLEDONE;
						elev.stateStack.push("DOOR_CLOSED_IDLE"); /////////////////////
					}
					else {
						elev.increments++;
					}
					break;
				case board.elevatorStates.DOORS_CLOSED_IDLEDONE:
					if(elev.destinations.length) {
						elev.maxIncrements = 100 * Math.abs(elev.destinations[0] - elev.floor); //compute length of task
						elev.increments = 0;
						elev.state = board.elevatorStates.MOVING; //switch to moving state
						elev.stateStack.push("IDLEDONE"); ///////////////////////////
					}
					else {
						//no destinations. Revert to idle
						//TODO:
						//TODO:
					}
					break;
				case board.elevatorStates.MOVING:
					if(elev.increments >= elev.maxIncrements) { //we're done, jump immediately
						elev.increments = 0;
						elev.maxIncrements = 0;
						elev.state = board.elevatorStates.ARRIVED_FLOOR; //change state to arrival
						elev.stateStack.push("MOVING"); ///////////////////////////
					}
					else { //keep moving
						elev.increments++; //increment task completion
					}
					break;
				case board.elevatorStates.ARRIVED_FLOOR:
					elev.floor = elev.destinations[0]; //assign arrived floor as current floor
					board.clearElevatorDest(elev.destinations[0], elev.shaft); //clear arrived destination
					var waiting = getUsersAtShaft(elev.floor, elev.shaft); //see if users waiting
					elev.stateStack.push("ARRIVED"); ///////////////////////////////
					if(waiting) {
						elev.increments = 0;
						elev.maxIncrements = 50;
						elev.state = board.elevatorStates.DOORS_OPENING; //open doors
					}
					else {
						elev.state = board.elevatorStates.MOVING; //keep going
					}
					break;
				case board.elevatorStates.DOORS_OPENING:
					if(elev.increments >= elev.maxIncrements) {
						elev.increments = 0;
						elev.maxIncrements = 0;
						elev.stateStack.push("DOORS_OPENING"); ///////////////////////////////
						elev.state = board.elevatorStates.DOORS_OPEN;
					}
					else {
						elev.increments++;
					}
					break;
				case board.elevatorStates.DOORS_OPEN:
					var waiting = getUsersAtShaft(elev.floor, elev.shaft); //see if users waiting
					elev.increment = 0;
					elev.maxIncrement = 50;
					if(waiting) {
						for(var i = 0; i < waiting.length; i++) {
							addUserToElevator(elev.floor, elev.shaft, waiting[i]);
						}
					}
					else {
						//nothing to do
					}
					elev.stateStack.push("DOORS_OPEN"); ////////////////////////////
					elev.state = board.elevatorStates.DOORS_OPEN_IDLE;
					break;
				case board.elevatorStates.DOORS_OPEN_IDLE:
					if(elev.increment >= elev.maxIncrement) {
						if(elev.users.length) {
							elev.maxIncrements = 50;
							elev.increments = 0;
							elev.stateStack.push("DOORS_OPEN_IDLE"); /////////////////////////
							elev.state = board.elevatorStates.DOORS_CLOSING;
						}
						else {
							elev.state = board.elevatorStates.IDLE;
						}
					}
					else {
						elev.increment++;
					}
					break;
				default:
					console.log("ERROR: elevart.controller::updateElevators(), unknown state");
					break;
			} //end of switch
		}
	}

	/** 
	 * @method updateUsers
	 * update users in gameloop
	 */
	function updateUsers () {

	}

	/** 
	 * @method update
	 * update the model
	 */
	function update () {
		loopCount++;
		if(loopCount > updateInterval) {
			loopCount = 0;
			//begin Model updates
			updateElevators();
			updateUsers();

			//check elevator positions, and update based on their queue

		}
	}
	
	function gameLoop () {

		//update the Model
		update();

		//update the View
		display.drawDisplay();

		//call the loop
		requestAnimationFrame(gameLoop);
	}
		
	function run (panel) {
		if(firstRun) {
			init(panel);
			firstRun = false;
		}
		console.log("elefart.controller::run()");
		gameLoop();

	}
	
	
	return {
		init:init,
		run:run
	};
	
})();