/** 
 * @namespace elefart.display
 * @fileoverview elefart.display (the View object) for the application. 
 * Contains the HTML5 Canvas drawing routines for game.
 * @requires elefart
 * @requires elefart.dom
 * @requires elefart.controller
 * @version 0.1.1
 * @author Pete Markeiwicz
 * @license MIT
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

	/**
	 * @readonly
	 * @enum {String}
	 * @typedef LAYERS
	 * @description Enum for types of layers, colors, materials in canvas drawing
	 */
	var LAYERS = {
		WORLD: "WORLD",        //environment outside building (Sun, Sky)
		BUILDING:"BUILDING",   //back wall of building
		SHAFTS:"SHAFTS",       //elevator shafts in building
		ELEBACK:"ELEBACK",     //back wall of elevators
		ELESPACE1:"ELESPACE1", //places for People to stand
		ELESPACE2:"ELESPCE2",
		ELESPACE3:"ELESPACE3",
		ELESPACE4:"ELESPCE4",
		WALLS:"WALLS",         //building walls
		DOORS:"DOORS",         //elevator doors
		FLOORS:"FLOORS"        //people and objects in the room floors
	};

	/** 
	 * @readonly
	 * @enum {String}
	 * @typedef COLORS
	 * @description basic HTML5 Canvas rgb() colors for default objects
	 */
	var COLORS = { //flat colors
		BLACK:"rgb(0,0,0)",
		WHITE:"rgb(255,255,255)",
		LIGHT_GREY:"rgb(128,128,128)",
		DARK_GREY:"rgb(40,40,40)"
	};

	/** 
	 * @readonly
	 * @enum {String}
	 * @typefef MATERIALS
	 * @description gradients simple to complex (some may create a patterned texture)
	 */
	var MATERIALS = { //gradients
		SMOOTH:0,
		ROUGH:1
	};

	/**
	 * =========================================
	 * SPECIAL PRELOADS AND UTILITIES
	 * =========================================
	 */

	/** 
	 * @method getGameRect
	 * @description get the current dimensions of the game
	 * NOTE: have to fire it when the screen size changes!
	 * @returns {DOMRect} a DOMRect 
	 * DOMRect {left:0, top:0, right:0, bottom:0, width:0, height:0}
	 */
	function getGameRect() {
		return (rect = panel.getBoundingClientRect());
	}

	/**
	 * @method setGameRect
	 * @description set the size of the overall game via the enclosng 
	 * DOM element the HTML5 Canvas object is attached to.
	 */
	function setGameRect () {
		rect = panel.getBoundingClientRect();
	}

	/** 
	 * @method preload
	 * @description start game images loading before other JS libraries and 
	 * initialization. Ensures that images are immediately available when the 
	 * game starts.
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
	 * CANVAS FILTERS
	 * =========================================
	 */

	/** 
	 * function getPixels 
	 * @description get the pixel RGB(A) data from an image 
	 * @param {HTMLImageElement} img image to return pixel data from 
	 * @param {HTMLCanvasElement} c offscreen <canvas> object to filter in
	 * @return {Array}  array with RGB or RGBA image data 
	 */
	function getPixels (img, c) { 
		c.width = img.width; 
		c.height = img.height; 
		var ctx = c.getContext('2d'); //temporary canvas context
		ctx.drawImage(img);
		return ctx.getImageData(0, 0, c.width, c.height);
	}

	/** 
	 * function filterImageData
	 * @description HTML5 canvas filters applied to image 
	 * put image as first array member, then arguments, then  
	 * call filter function, applying arguments 
	 * @link http://www.html5rocks.com/en/tutorials/canvas/imagefilters/ 
	 * @param {Function} filter the filtering function we apply our image and arguments to 
	 * @param {HTMLImageElement} img the image object 
	 * @param {Array} varArgs additional arguments 
	 * @return {ImageData} image data object returned by  
	 * HTML5CanvasContext.getImageData() 
	 */ 
	function filterImageData (filter, img, varArgs) { 
		var c = document.createElement('canvas'); 
		var args = [getPixels(img, c)]; 
		for (var i = 2; i < arguments.length; i++) { 
			args.push(arguments[i]); 
		}
		return filter.apply(null, args);
	}

	/** 
	 * @method getFilteredImage 
	 * @description get a filtered image as a new JS image object 
	 * @param {HTMLImageElement} img the image object
	 * @param {Function} the filtering function
	 * @param {Array} varArgs additional arguments for the filter, if needed
	 * @returns {HTMLImageElement} image with its pixel data filtered
	 */
	function getFilteredImage (img, filter, varArgs) { 
		var c = document.createElement('canvas'); 
		var args = [getPixels(img, c)]; 
		for (var i = 2; i < arguments.length; i++) { 
			args.push(arguments[i]); 
		}
		var pixels = filter.apply(null, args);
		return (new Image().src = c.toDataURL()); 
	}




	/**
	 * =========================================
	 * DISPLAY LIST
	 * =========================================
	 */

	/** 
	 * @method DisplayList
	 * @description create a new DisplayList
	 */
	function initDisplayList () {
		displayList = {};
		for(var i in LAYERS) {
			displayList[i] = [];
		}
	}

	/** 
	 * @method checkIfInLayer
	 * @description check if an object is in a specific layer in the display list
	 * @param {Object} obj the object to check
	 * @param {LAYERS} layer the LAYERS enum to check
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
	 * @description check if an object is already in the drawing list
	 * if present, return its position in the array
	 * @param {Object} obj the object to draw
	 * @returns {Object|false} if found, return its layer and index in layer
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
	 * @description add an object to the visual display list
	 * @param {Point|Line|Rect|Circle|Polygon|Sprite} obj the object to draw
	 * @param {LAYERS} layer the layer to draw in
	 */
	function addToDisplayList (obj, layer) {
		displayList[layer].push(obj);
	}

	/** 
	 * @method removeFromDisplayList
	 * @description remove an object from drawing display list
	 * @param {Point|Line|Rect|Circle|Polygon|SpriteBoard} obj the object to draw
	 * @param {LAYERS} layer the layer to draw in (optional)
	 */
	function removeFromDisplayList (obj, layer) {
		var pos;
		if(layer) {
			pos = checkIfInLayer(obj);
			if(pos) {
				displayList[layer].splice(pos, 1); //remove element
			}
		}
		else {
			pos = checkIfInList(obj);
			if(pos) {
				displayList[pos.layer].splice(pos, 1);
			}
		}
	}

	/**
	 * =========================================
	 * DRAW BACKGROUND CANVAS
	 * =========================================
	 */

	/** 
	 * @method getForegroundCanvas
	 * @description get a reference to the foreground canvas
	 */
	function getBackgroundCanvas () {
		if(firstTime) return false;
		return background;
	}

	/** 
	 * @method drawBackground
	 * @description draw the background for a game in an underlying canvas layer
	 * - some building layers including the Sky and Walls
	 * - additional background objects
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
	 * @description get a reference to the foreground canvas
	 */
	function getForegroundCanvas () {
		if(firstTime) return false;
		return foreground;
	}


	/** 
	 * @method drawForeground
	 * @description draw the foreground for the display
	 */
	function drawForeground () {

		fctx.save();

		//clear the foreground
		fctx.clearRect(0, 0, foreground.width, foreground.height);

		//draw user interface

		//restore
		fctx.restore();
	}

	/**
	 * =========================================
	 * DRAW DISPLAY
	 * =========================================
	 */

	/** 
	 * @method drawDisplay
	 * @description draw the entire game, (background, foreground, 
	 * user controls) as necessary
	 */
	function drawDisplay () {

		drawForeground();

	}

	/**
	 * =========================================
	 * DRAW FAIL SCREEN
	 * =========================================
	 */

	/** 
	 * @method drawFail
	 * @description if we can't run HTML5 canvas, put up an 
	 * error and exit screen for the user
	 */
	function drawFail () {
		//TODO: need to draw a fail screen with 
		//DOM methods
		console.log("elefart:" + elefart);
		console.log("elefart features:" + elefart.features);
		console.log("elefart createelement:" + elefart.features.createelement);
		console.log("elefart features ok:" + elefart.features.ok);
		elefart.showError("can't load canvas, draw fail screen here");
	}

	/**
	 * =========================================
	 * INIT AND RUN
	 * =========================================
	 */


	/** 
	 * @method init display
	 * @description initialize the HTML5 canvas display.
	 */
	function init () {

		//if we can't run canvas, fallback to DOM error message
		if(!elefart.features || !elefart.features.ok) {
			drawFail();
			return;
		}

		//assign shared objects
		building = elefart.building,
		controller = elefart.controller;

		//start images loading
		preload();

		//initialize our display list
		initDisplayList();

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
	 * @method run display
	 * @description turn on the game canvas so it can be drawn to.
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
		LAYERS:LAYERS,
		COLORS:COLORS,
		MATERIALS:MATERIALS,
		getGameRect:getGameRect,
		setGameRect:setGameRect,
		getBackgroundCanvas:getBackgroundCanvas,
		getForegroundCanvas:getForegroundCanvas,
		addToDisplayList:addToDisplayList,
		removeFromDisplayList:removeFromDisplayList,
		drawDisplay:drawDisplay,
		init:init,
		run:run
	};

})();