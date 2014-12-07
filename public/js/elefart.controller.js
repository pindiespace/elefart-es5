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

				if(defaultUser.shaft !== clickShaft) { //move to new elevator

					console.log("elefart.controller::handleTouchPoint(), move to new shaft");
					board.userChangeElevator(clickFloor, clickShaft, defaultUser);

				} //end of user moving to new shaft
			}
			else { //move to new floor
				//user has specified a destination floor while in an idle elevator
				//user can only specify one dest before the elevator
				//starts moving
					console.log("elefart.controller::handleTouchPoint(), specified new floor");
					board.userChangeFloor(clickFloor, clickShaft, defaultUser);
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
	 * @method update
	 * update the model
	 */
	function update () {
		loopCount++;
		if(loopCount > updateInterval) {
			loopCount = 0;
			//begin Model updates

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