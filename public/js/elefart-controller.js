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
	 * @method handleKeypress
	 * @description branch program execution based on the key pressed by a user.
	 * @param {Number} keyCode the keycode returned by the event handler.
	 */
	function handleKeypress(keyCode) {
		console.log("key pressed:" + keyCode);
	}

	/** 
	 * @method handleTouchPoint
	 * @description branch program execution based on a user swipe or touch 
	 * on a touch-sensitive screen.
	 * @param {Object} touchPoint a JS objec with the x and y coordinates of the touch.
	 */
	function handleTouchPoint(touchPoint) {
		console.log("touch:" + touchPoint.x + "," + touchPoint.y);
	}

	/** 
	 * @method setGameHandlers
	 * @description set the event handlers for the active game HTML5 canvas
	 * @param {Canvas} gameCanvas the HTML5 Canvas object
	 */
	function setGameHandlers (gameCanvas) {

		dom.bind(document, "keypress", function (e) {
			var unicode = e.keyCode? e.keyCode : e.charCode
			handleKeypress(unicode);
		});

		dom.bind(gameCanvas, "click", function (e) {
			handleTouchPoint({x:e.clientX, y:e.clientY});
			e.preventDefault();
			e.stopPropagation();
		});

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
	 * @method init controller
	 * @description initialize the controller, including event handlers. Requires 
	 * access to elefart.dom.
	 */
	function init () {
		board = elefart.building,
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

	}

	//returned object
	return {
		init:init,
		run:run
	};

})();