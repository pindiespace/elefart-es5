/** 
 * @namespace
 * elefart.display (View)
 * HTML5 Canvas drawing for game
 */
window.elefart.display = (function () {

	var building,
	dom,
	controller,
	panel,       //game DOM panel
	rect,        //game Rect
	fctx,        //foreground context
	bctx,        //background context
	foreground,  //foreground canvas
	background,  //background canvas
	displayList = {}, //multi-dimensional array with drawing objects
	hotelWalls,  //hotel walls
	hotelSign,   //hotel sign
	spriteBoard, //images of users for animation
	firstTime = true;

	var LAYERS = {
		BUILDING:"BUILDING",
		SHAFTS:"SHAFTS",
		ELEBACK:"ELEBACK", //back wall of elevators
		ELESPACE1:"ELESPACE1", //places for People to stand
		ELESPACE2:"ELESPCE2",
		ELESPACE3:"ELESPACE3",
		ELESPACE4:"ELESPCE4",
		WALLS:"WALLS", //building walls
		DOORS:"DOORS", //elevator doors
		FLOORS:"FLOORS"  //people and objects in the room floors
	}; //d"isplay list layers. Layers are drawn from 0 outwards


	/**
	 * =========================================
	 * SPECIAL PRELOADS AND UTILITIES
	 * =========================================
	 */

	/** 
	 * @method getGameRect
	 * get the current dimensions of the game
	 * NOTE: have to fire it when the screen size changes!
	 * @returns {DOMRect} a DOMRect 
	 * DOMRect {left:0, top:0, right:0, bottom:0, width:0, height:0}
	 */
	 function setGameRect () {
	 	rect = panel.getBoundingClientRect();
	 }

	 /** 
	  * @method setGameSize
	  * (re)set the size of the game drawing at 
	  * start, or if user changes window size
	  */
	 function setGameSize () {
	 	rect = panel.getBoundingClientRect();
	 	//TODO: recalculate
	 }

	/** 
	 * @method preload
	 * start game images loading early!
	 */
	function preload () {

		//hotel wallpaper
		hotelWalls = new Image();
			hotelWalls.onload = function() {
			console.log("display::preload(), loaded background patterns");
		};
		hotelWalls.src = "img/game/wallpaper.png";

		//hotel sign
		hotelSign = new Image();
		hotelSign.onload = function () {
			console.log("display::preload(), loaded hotel sign");
		}
		hotelSign.src = "img/game/hotel_sign.png";

		//character sprites
		spriteBoard = new Image();
		spriteBoard.onload = function () {
			console.log("display::preload(), loaded character sprites");
		}
		spriteBoard.src = "img/game/spriteboard.png";
	}

	/**
	 * =========================================
	 * DISPLAY LIST
	 * =========================================
	 */

	/** 
	 * @method DisplayList
	 * create a new DisplayList
	 */
	function initDisplayList () {
		displayList = {};
		for(var i in LAYERS) {
			displayList[i] = [];
		}
	}

	/** 
	 * @method checkIfInLayer
	 * check if an object is in a specific layer in the display list
	 * @param {} obj the object to check
	 * @param {enum LAYERS} layer the layer to check
	 * @returns {Number|false} if found, return the index, else false
	 */
	function checkIfInLayer(obj, layer) {
		var len = displayList[layer].length;
		for(var j = 0; j < len; j++) {
			if(obj === displayList[layer][j]) {
				return j;
			}
		}
		return false;
	}
	/** 
	 * @method checkIfInList 
	 * check if an object is already in the drawing list
	 * if present, return its position in the array
	 * @param {} obj the object to draw
	 * @returns {Object}false} if found, return its layer and index in layer
	 * otherwise return false
	 */
	function checkIfInList(obj) {
		var numLayers = displayList.length;
		for(var i in LAYERS) {
			var index = checkIfInLayer(obj, i);
			if(index !== false) {
				return {layer:i, index:index};
			}
		}
		return false;
	}

	/** 
	 * @method addToDisplayList
	 * add an object to the visual display list
	 * @param {Point|Line|Rect|Circle|Polygon|Sprite} obj the object to draw
	 * @param {Number} layer the layer to draw in
	 */
	function addToDisplayList (obj, layer) {
		displayList[layer].push(obj);
	}

	/** 
	 * @method removeFromDisplayList
	 * remove an object from drawing (make invisible)
	 * @param {Point|Line|Rect|Circle|Polygon|Sprite} obj the object to draw
	 * @param {Number} layer the layer to draw in
	 */
	function removeFromDisplayList (obj, layer) {

	}

	/** 
	 * @method changeDisplayLayer
	 * change the layer that the object is drawn in
	 */
	function changeDisplayLayer (obj, newLayer) {

	}


	/**
	 * =========================================
	 * DRAW BACKGROUND CANVAS
	 * =========================================
	 */

	/** 
	 * @method getForegroundCanvas
	 * get a reference to the foreground canvas
	 */
	function getBackgroundCanvas () {
		if(firstTime) return false;
		return background;
	}

	/** 
	 * @method drawBackground
	 * draw the background for a game in an 
	 * underlying canvas layer
	 * - sky
	 * - Ui bottom panel
	 * - Ui left panel
	 */
	function drawBackground () {

		bctx.save();
		//yellow background
		bctx.fillStyle = "rgba(248, 237, 29, 1.0)";
		bctx.rect(0, 0, rect.width, rect.height);
		bctx.fill();
		bctx.restore();

	}

	/**
	 * =========================================
	 * DRAW FOREGROUND CANVAS
	 * =========================================
	 */

	/** 
	 * @method getForegroundCanvas
	 * get a reference to the foreground canvas
	 */
	function getForegroundCanvas () {
		if(firstTime) return false;
		return foreground;
	}

	function drawUi () {

	}

	function drawElevators () {

	}

	function drawShafts () {

	}

	function drawDoors () {

	}

	function drawPeople () {

	}

	function drawForeground () {

		//clear the foreground
		fctx.clearRect(0, 0, foreground.width, foreground.height);

		//draw user interface
		drawUi();
		drawElevators();
		drawShafts();
		drawPeople();
		drawDoors();
	}


	/**
	 * =========================================
	 * DRAW DISPLAY
	 * =========================================
	 */

	function drawDisplay () {

		drawForeground();

	}

	/**
	 * =========================================
	 * INIT AND RUN
	 * =========================================
	 */


	/** 
	 * @method init
	 */
	function init () {

		console.log("in display.init")
		building = elefart.building,
		controller = elefart.controller;

		//start images loading
		preload();

		//initialize canvas for foreground
		foreground = document.createElement('canvas');
		fctx = foreground.getContext("2d");
		foreground.id = 'game-foreground';

		//initialize canvas for background
		background = document.createElement('canvas');
		bctx = background.getContext("2d");
		background.id = 'game-background';

		//set init flag to false
		firstTime = false;
	}

	/** 
	 * @method run
	 */
	function run (gamePanel) {
		if(firstTime) {
			init();
		}
		console.log("in display.run");

		//the panel is assigned by elefart.screens['screen-game']
		panel = gamePanel;

		//set the dimensions of our game from the panel (also called on resize event)
		setGameRect();

		if(foreground && background && panel) {

			background.width = rect.width;
			background.height = rect.height;
			foreground.width = rect.width;
			foreground.height = rect.height;

			panel.appendChild(background);
			panel.appendChild(foreground);

			//we draw once here, before letting elefart.controller take over
			drawBackground();
			drawDisplay();
		}
		else {
			console.log("ERROR: failed to make canvas objects, foreground:" + 
				foreground + " background:" + 
				background + " panel:" + panel
				);
		}
	}

	//returned object
	return {
		setGameRect:setGameRect,
		getBackgroundCanvas:getBackgroundCanvas,
		getForegroundCanvas:getForegroundCanvas,
		drawDisplay:drawDisplay,
		init:init,
		run:run
	};

})();