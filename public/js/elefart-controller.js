/** 
 * @namespace elefart.controller
 * @fileoverview elefart.controller The Controller module for the application. 
 * Traps user input, also routes in-game events to other modules (e.g. elefart.display). 
 * Requires the wrapper event methods in elefart.dom.
 * Supports:
 * - standard mouse desktop events
 * - mouse events on touch devices
 * - keyboard events
 * - virtual keyboard events
 * @requires elefart
 * @requires elefart.display
 * @requires elefart.building
 * @requires elefart.dashboard
 * @version 0.1.1
 * @author Pete Markeiwicz
 * @license MIT
 */
window.elefart.controller = (function () {

	var building,
	display,
	dashboard, 
	firstTime = true;

	/** 
	 * @method handleResize
	 * @description handling a change in the window size. Elefart.display 
	 * has a function that, when the window is resized, checks if it has 
	 * changed the css breakpoint listed in the css file. If so, it returns 
	 * a name for the breakpoint, encoded in the body:before invisible body:before
	 * element set up in the css for each breakpoint as JSON, e.g.,
	 * '{"name":"featurephone1","floors":"3","shafts":"3"}'
	 * NOTE: the listed test strings in the switch() statement below MUST 
	 * match those in the CSS file for this function to work
	 */
	function handleResize () {
		//see if we had a change in breakpoint due to viewport resize
		var breakPt = display.getCSSBreakpoint();
		if(breakPt) {
			//set number of ElevatorShafts (x axis) only if CSS breakpoint changed
			building.setDimensions(breakPt);
		}
		//rebuild the Model
		building.buildWorld();
		//redraw the View
		display.drawBackground();
		display.drawForeground();
	}

	/** 
	 * @method handleKeypress
	 * @description branch program execution based on the key pressed by a user.
	 * @param {Number} keyCode the keycode returned by the event handler.
	 */
	function handleKeypress (keyCode) {
		console.log("key pressed:" + keyCode);
	}

	/** 
	 * @method handleTouchPoint
	 * @description branch program execution based on a user swipe or touch 
	 * on a touch-sensitive screen.
	 * @param {Object} touchPoint a JS objec with the x and y coordinates of the touch.
	 */
	function handleTouchPoint (touchPoint) {
		console.log("touch:" + touchPoint.x + "," + touchPoint.y);
	}

	/** 
	 * @method setGameHandlers
	 * @description set the event handlers for the active game HTML5 canvas
	 * @param {Canvas} gameCanvas the HTML5 Canvas object
	 */
	function setGameHandlers (gameCanvas) {

		//window resizing events (redraw world)
		dom.bind(window, "resize", function (e) {
			//resize at CSS breakpoints for responsive design
			handleResize();
		})

		//key press events
		dom.bind(document, "keypress", function (e) {
			var unicode = e.keyCode? e.keyCode : e.charCode
			handleKeypress(unicode);
		});

		//mouse click events
		dom.bind(gameCanvas, "click", function (e) {
			handleTouchPoint({x:e.clientX, y:e.clientY});
			e.preventDefault();
			e.stopPropagation();
		});

		//touch events
		dom.bind(gameCanvas, "touchmove", function (e) {
			handleTouchPoint({x:e.clientX, y:e.clientY});
			e.preventDefault();
			e.stopPropagation();
		});

		//dom.addEvent(window, "resize", display.setGameSize);
	}

	/**
	 * @method removeGameHandlers
	 * @description remove the game event handlers to improve efficiency
	 * @param {Canvas} gameCanvas the HTML5 Canvas object
	 */
	function removeGameHandlers(gameCanvas) {
		dom.remove();
	}

	/**  
	 * ========================================= 
	 * GAME LOOP 
	 * ========================================= 
	 */

	/** 
	 * @method gameLoop
	 * @description regular updates (e.g. screen redraws)
	 */
	function gameLoop() {

		display.drawForeground();

		requestAnimationFrame(gameLoop); 

	}
	/** 
	 * @method init controller
	 * @description initialize the controller, including event handlers. Requires 
	 * access to elefart.dom.
	 */
	function init () {
		building = elefart.building,
		display = elefart.display,
		dashboard = elefart.dashboard;
		firstTime = false;
	}

	/** 
	 * @method run controller
	 * @description run the controller, starting event handlers for the active game 
	 * canvas.
	 */
	function run () {
		if(firstTime) {
			init();
		}

		//TODO: probaby need a switch here for other screens
		//set handlers associate with an active game
		setGameHandlers(display.getForegroundCanvas());
		gameLoop();

	}

	//returned object
	return {
		init:init,
		run:run
	};

})();