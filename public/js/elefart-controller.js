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
	display,    //display object
	panels,
	dashboard, 
	updateList = {},
	now, then, elapsed, fps = 0, //framerate (fps) calculations
	us, //reference to local player
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
		//redraw the static elements of the View
		display.drawBackground();
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

		//check if we've selected the Building or Controls
		//the left coordinate must be adjusted if the GameRect is smaller than window's viewport
		var gr = display.getGameRect();
		//get shaft, floor for mouse or touch
		var tp = building.getBuilding().selected({x:touchPoint.x-gr.left, y:touchPoint.y-gr.top});

		//see if we clicked on a Person, not currently moving
		if(tp.person) {
			//TODO: connect to modal window with Person features
		}
		//see if we clicked on a Goodie, not currently movint
		if(tp.goodie) {
			//TODO: connect to a modal window displaying the goodie value
		}

		//if the click is on the same BuildingFloor as our Person, add move to queue
		if(tp.floor) {
			if(us.parent == tp.floor) {
				console.log("move character to:" + tp.shaft.shaftNum);
			}
		}

		//if building, use mouseclick to move elevator
		if(tp.shaft && tp.floor) {
			var e = tp.shaft.getElevator();
			e.addFloorToQueue(tp.floor.floorNum);
		}

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
	 * UPDATE UTILITIES
	 * ========================================= 
	 */

	/** 
	 * @method initUpdateList
	 * @description initialize the update list for the application
	 */
	function initUpdateList () {
		updateList = {};
		for(var i in display.PANELS) {
			updateList[i] = [];
		}
	}

	/** 
	 * @method addToUpdateList
	 * @description add an object to the visual display list
	 * @param {Point|Line|Rect|Circle|Polygon|ScreenSprite} obj the object to draw
	 * @param {PANELS} panel (optional) the panel where the object is drawn by display
	 * @returns {Boolean} if added, return true, else false
	 */
	function addToUpdateList (obj) {
		if(obj && obj.type) {
			if(!obj.panel) {
				elefart.showError("controller.addToUpdateList(), MUST add ScreenObject:" + obj.instanceName + " to display list first!");
				return false;
			}
			if(!obj.updateByTime) {
				elefart.showError("controller.addToUpdateList() " + obj.instanceName + " missing updateByTime() function");
				return false;
			}
			var panel = updateList[obj.panel];
			var len = panel.length;
			for(var i = 0; i < len; i++) {
				if(panel[i] === obj) {
					return true; //already there
				}
			}

			panel.push(obj); 
			return true;
		}
		elefart.showError("addToUpdateList invalid params obj:" + typeof obj + " panel:" + panel);
		return false;
	}

	/** 
	 * @method removeFromUpdateList
	 * @description remove an object from drawing display list. By default, it is non-recursive.
	 * @param {Point|Line|Rect|Circle|Polygon|ScreenSprite} obj the object to draw
	 * @param {PANELS} panel (optional) the display list panel to draw in (optional)
	 * @returns {Boolean} if removed, else false;
	 */
	function removeFromUpdateList (obj) {
		if(obj && obj.type) {
			if(!obj.panel) {
				elefart.showError("controller.removeFromUpdateList(), MUST add ScreenObject:" + obj.type + " to display list first!");
				return false;
			}
			var panel = updateList[obj.panel];
			var len = panel.length;
			for(var i = 0; i < len; i++) {
				if(panel[i] === obj) {
					panel[i].panel = false; //no panel when removed
					panel.splice(i, 1); //remove element reference
					return true;
				}
			}
		}
		elefart.showError("removeFromUpdateList invalid object:" + typeof obj);
		return false;
	}

	/**  
	 * ========================================= 
	 * GAME LOOP 
	 * ========================================= 
	 */

	/** 
	 * @method getFPS
	 * @description get the smoothed (10 values) framerate of the application
	 * NOTE: for speed, uses 'hack' rounding instead of Math.round
	 * @returns {Number} frames per second, measured in last gameLoop
	 */
	function getFPS () {
		if(elapsed) {
			var n = 1000/elapsed;
			fps = (fps * 0.9) + (n * 0.1); //smoothed
			return(~~ (fps + (fps > 0 ? .5 : -.5)));
		}
		return 1000;
	}

	/** 
	 * @method gameLoop
	 * @description regular updates (e.g. screen redraws)
	 */
	function gameLoop () {
		var panel, ticks, count, ul, len;
		now = Date.now();
		elapsed = now - then;
		////////////////////////var mini = now;

		for(var i in panels) {
			panel = panels[i],
			ticks = panel.ticks,
			panel.count += elapsed;
			if(ticks) {
				count = panel.count;
				if(count > elapsed) {
					//if we are going to update, erase
					if(panel.erase) {
						panel.erase();
					}
					ul = updateList[i],
					len = ul.length;
					for(var j = 0; j < len; j++) {
						var u = ul[j];
						if(u.updateByTime) {
							u.dirty = u.updateByTime(); //if updated, we need to be re-drawn
						}
					}
					//panel.draw(); //draw the panel
					panel.count = 0;
				}
				else {
					//console.log("too short")
				}
				panel.draw();
			}
		}
			//////////////////mini = Date.now() - mini;
			/////////////////mini = 100* mini/elapsed
			/////////////////mini = (~~ (mini + (mini > 0 ? .5 : -.5)));
			///////////////////console.log("Mini:" + mini + "%");

			//reset interval
			then = elapsed = now;



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
		panels = display.PANELDRAW; //attach to draw object, with canvas and its ticks

		dashboard = elefart.dashboard;
		then = now = Date.now(); //fps

		initUpdateList(); //initialize the update list
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

		//make reference to local Player
		us = building.getBuilding().getUs();
		window.us = us;

		//TODO: probaby need a switch here for other screens
		//set handlers associate with an active game
		setGameHandlers(display.getControlCanvas()); //Topmost Canvas Object
		//initialize FPS variables

		//objects that initially have their 'dirty' bit set should be drawn


		//start the loop
		gameLoop();

	}

	//returned object
	return {
		addToUpdateList:addToUpdateList,
		removeFromUpdateList:removeFromUpdateList,
		getFPS:getFPS,
		init:init,
		run:run
	};

})();