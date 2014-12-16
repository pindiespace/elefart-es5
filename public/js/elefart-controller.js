/** 
 * @namespace
 * window.elefart.controller (Controller)
 * trap user input, also route in-game events to
 * supports:
 * - standard mouse desktop events
 * - mouse events on touch devices
 * - keyboard events
 * - virtual keyboard events
 * Model (elefart.building) or Views (elefart.display, elefart.dashboard)
 */
window.elefart.controller = (function () {

	var building,
	display,
	dashboard, 
	firstTime = true;


	/** 
	 * @method handleKeypress
	 */
	function handleKeypress(keyCode) {
		console.log("key pressed:" + keyCode);
	}

	/** 
	 * @method handleTouchPoint
	 */
	function handleTouchPoint(touchPoint) {
		console.log("touch:" + touchPoint.x + "," + touchPoint.y);
	}

	/** 
	 * @method setGameHandlers
	 * set the event handlers for the active game HTML5 canvas
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
	 * remove the game event handlers (memory efficient)
	 */
	function removeGameHandlers(gameCanvas) {
		dom.remove();
	}

	/** 
	 * @method init
	 */
	function init () {
		board = elefart.building,
		display = elefart.display,
		dashboard = elefart.dashboard;
		firstTime = false;
	}

	/** 
	 * @method run
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