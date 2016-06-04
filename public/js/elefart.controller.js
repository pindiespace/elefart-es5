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
	updateInterval = 1, //how many animation loops to wait before drawing model
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
			console.log("elefart.controller.handleTouchPoint(), CLICK floor:" + clickFloor + " shaft:" + clickShaft + " user floor:" + defaultUser.floor + " shaft:" + defaultUser.shaft);


			if(defaultUser.floor == clickFloor) { //click is on same floor as user

				if(defaultUser.shaft !== clickShaft) { //move to new elevator shaft (elevator may not be there)

					console.log("elefart.controller::handleTouchPoint(), move to new shaft");
					board.userChangeShaft(clickShaft, defaultUser);

				} //end of user moving to new shaft
				else { //user is on same floor, AND same shaft. Set to waiting, and elevator will grab them
					defaultUser.waiting = true; //user wants in elevator they are at
				}
			}
			else if(defaultUser.shaft === clickShaft) {  //user is next to elevator, send message to elevator to move to new floor
					if(!defaultUser.waiting) { //user(s) waiting at elevator door
						console.log("elefart.controller::handleTouchPoint(), user " + defaultUser.uname + " added elevator destination");
						if(board.elevators[clickShaft].busy) console.log("elev "+clickShaft+"busy")
						if(!board.userInElevator(clickShaft)) {
							board.addUserToElevator(defaultUser.floor, defaultUser.shaft, defaultUser);
						}
						board.addElevatorDest(clickFloor, clickShaft);
						var elev = board.elevators[clickShaft];
						elev.setState(board.elevatorStates.IDLE); //should trigger a move
					}
					else {
						console.log("elefart.controller::handleTouchPoint(), user " + defaultUser.uname + " specified new floor, elevator on other floor");
						board.userRequestElevator(clickFloor, clickShaft, defaultUser);
					}
			}
			else if(defaultUser.floor == clickFloor && defaultUser.shaft === clickShaft) {
					if(board.elevators[clickShaft].busy) console.log("elev "+clickShaft+"busy")
						if(!board.userInElevator(clickShaft)) {
							board.addUserToElevator(defaultUser.floor, defaultUser.shaft, defaultUser);
						}
			}
			else {
				//user clicked on a floor and shaft outside their realm
				//no action
			}
		} //end of valid default user
		
		//console.log("elefart.controller::handleTouchPoint(), USER SELECTED floor:" +clickFloor + " shaft:" + clickShaft);

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
					elev.busy = false;
					if(elev.destinations.length) {
						elev.maxIncrements = 5;
						elev.increments = 0;
						elev.setState(board.elevatorStates.DOORS_CLOSING);
					}
					else {
						//no destinations, just hang
					}
					break;
				case board.elevatorStates.DOORS_CLOSING:
					if(elev.increments >= elev.maxIncrements) { //new state
						elev.busy = true;
						elev.increments = 0;
						elev.maxIncrements = 7;
						elev.setState(board.elevatorStates.DOORS_CLOSED_IDLE);
					}
					else {
						elev.increments++;
					}
					break;
				case board.elevatorStates.DOORS_CLOSED_IDLE:
					elev.busy = false;
					if(elev.increments >= elev.maxIncrements) {
						elev.increments = 0
						elev.maxIncrements = 2;
						elev.setState(board.elevatorStates.DOORS_CLOSED_IDLEDONE);
					}
					else {
						elev.increments++;
					}
					break;
				case board.elevatorStates.DOORS_CLOSED_IDLEDONE:
					elev.busy = false;
					if(elev.destinations.length) {
						elev.maxIncrements = 10 * Math.abs(elev.destinations[0] - elev.floor); //compute length of task
						elev.increments = 0;
						elev.setState(board.elevatorStates.MOVING); //switch to moving state
					}
					else {
						elev.setState(board.elevatorStates.DOORS_CLOSED_IDLE);
					}
					break;
				case board.elevatorStates.MOVING:
					elev.busy = true;
					if(elev.increments >= elev.maxIncrements) { //we're done, jump immediately
						elev.increments = 0;
						elev.maxIncrements = 0;
						elev.setState(board.elevatorStates.ARRIVED_FLOOR); //change state to arrival
					}
					else { //keep moving
						elev.increments++; //increment task completion
					}
					break;
				case board.elevatorStates.ARRIVED_FLOOR:
					elev.floor = elev.destinations[0]; //assign arrived floor as current floor
					board.clearElevatorDest(elev.destinations[0], elev.shaft); //clear arrived destination
					board.updateUsersInElevator(elev.shaft);
					var waiting = board.getUsersAtShaft(elev.floor, elev.shaft); //see if users waiting
					if(waiting) {
						console.log("PEOPLE WAITING:" + waiting.length)
						elev.increments = 0;
						elev.maxIncrements = 5;
						elev.setState(board.elevatorStates.DOORS_OPENING); //open doors
					}
					else if(elev.destinations.length) {
						//elev.setState(board.elevatorStates.MOVING); //nobody waiting, have more destinations

					}
					else {
						elev.setState(board.elevatorStates.DOORS_OPENING);
					}
					break;
				case board.elevatorStates.DOORS_OPENING:
					elev.busy = true;
					if(elev.increments >= elev.maxIncrements) {
						elev.increments = 0;
						elev.maxIncrements = 0;
						elev.setState(board.elevatorStates.DOORS_OPENED);
					}
					else {
						elev.increments++;
					}
					break;
				case board.elevatorStates.DOORS_OPENED:
					console.log("IN DOORS OPEN")
					elev.busy = false;
					elev.increment = 0;
					elev.maxIncrement = 5;
					elev.busy = false;
					var waiting = board.getUsersAtShaft(elev.floor, elev.shaft); //see if users waiting
					window.waiting = waiting;
					if(waiting) {
						console.log("adding " + waiting.length + " users to elevator")
						for(var i = 0; i < waiting.length; i++) {
							board.addUserToElevator(elev.floor, elev.shaft, waiting[i]);
						}
					}
					else {
						//nothing to do
					}
					elev.setState(board.elevatorStates.DOORS_OPEN_IDLE);
					break;
				case board.elevatorStates.DOORS_OPEN_IDLE:
					elev.busy = false;
					///////////////console.log("in " + board.elevatorStates.DOORS_OPEN_IDLE)
					if(elev.increment >= elev.maxIncrement) {
						if(elev.users.length) {
							elev.maxIncrements = 5;
							elev.increments = 0;
							/////////////////console.log("setting to:" + board.elevatorStates.DOORS_CLOSING)
							elev.setState(board.elevatorStates.DOORS_CLOSING);
						}
						else {
							console.log("setting to:" + board.elevatorStates.IDLE)
							///////////////elev.setState(board.elevatorStates.IDLE);
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