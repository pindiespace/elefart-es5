/** 
 * @namespace
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
	factory,        //builds basic display objects
	panel,          //game DOM panel (all Canvas objects attached inside)
	rect,           //game Rect
	bctx,           //background context
	fctx,           //foreground context
	cctx,           //controls context
	background,     //background canvas
	foreground,     //foreground canvas
	controls,       //controls canvas
	displayList = {}, //multi-dimensional array with drawing objects
	hotelWalls,     //hotel walls
	hotelSign,      //hotel sign
	characterBoard, //images of users for animation
	cssBreakpoint,  //keep track of current CSS breakpoint in getCSSBreakpoint
	firstTime = true;

	/** 
	 * @readonly
	 * @enum {String}
	 * @typedef PANELS
	 * @description Enum giving which canvas (foreground, background, controls) we draw to
	 */
	var PANELS = {
		BACKGROUND: "BACKGROUND", //stuff that never changes (e.g. Building layout)
		FOREGROUND: "FOREGROUND", //stuff that changes quickly (e.g. game characters)
		CONTROLS: "CONTROLS"      //stuff that changes on user action (e.g. control panel)
	};

	/** 
	 * An object used by Controller to manage updates and redraws for each Canvas panel. 
	 * layers may be swapped manually between these panels as necessary.
	 * ticks can be 1-1000 (millisecs)
	 */
	var PANELDRAW  = {};
	PANELDRAW[PANELS.BACKGROUND] = {
		draw:drawBackground,
		ticks:0,
		count:0
	};
	PANELDRAW[PANELS.FOREGROUND] = {
		draw:drawForeground,
		ticks:20,
		count:0

	};
	PANELDRAW[PANELS.CONTROLS] = {
		draw:drawControls,
		ticks:0,
		count:0
	};

	/**
	 * @readonly
	 * @enum {String}
	 * @typedef LAYERS
	 * @description Enum giving specific names to the list of drawing layers used by displayList.
	 */
	var LAYERS = {
		//background panel
		WORLD: "WORLD",        //environment outside building (Sun, Sky)
		//foreground
		CLOUDS: "CLOUDS",      //Clouds in the Sky
		BUILDINGBACK:"BUILDINGBACK", //extreme back of building (includes ElevatorShafts)
		BUILDING:"BUILDING",   //main Building
		ELEBACK:"ELEBACK",     //back wall of elevators
		SHAFTS:"SHAFTS",       //elevator shafts in building
		ELESPACE1:"ELESPACE1", //back of elevator proper
		ELESPACE2:"ELESPCE2",  //a layer above the back for people
		ELESPACE3:"ELESPACE3", //a layer above the back for people
		ELESPACE4:"ELESPACE4", //a layer above the back for people
		WALLS:"WALLS",         //building walls
		DOORS:"DOORS",         //elevator doors
		FLOORS:"FLOORS",       //objects in the room floors
		PEOPLE:"PEOPLE",
		BUILDINGFRONT:"BUILDINGFRONT", //anything in front of People
		//controls
		CONTROLS:"CONTROLS",   //user controls
		MODAL:"MODAL",         //modal windows above game panel
		ANIMATION:"ANIMATION"  //animation above game panel
	};

	/** 
	 * @readonly
	 * @enum {String}
	 * @typedef COLORS
	 * @description basic HTML5 Canvas rgb() colors for default objects
	 */
	var COLORS = { //flat colors
		CLEAR:"rgba(0,0,0,0.0)",
		BLACK:"rgb(0,0,0)",
		WHITE:"rgb(255,255,255)",
		PALE_GREY:"rgb(220, 220, 220)",
		LIGHT_GREY:"rgb(128,128,128)",
		DARK_GREY:"rgb(64,64,64)",
		YELLOW:"rgb(248, 237, 29)",
		LIGHT_YELLOW:"rgb(255,249,225)",
		RED:"rgb(0,255,0)",
		BROWN:"rgb(139,69,19)",
		PINK: "rgb(190,30,45)" //TODO: convert to RGBA (e.g. rgba from rgb)
	};

	/** 
	 * @readonly
	 * @enum {String}
	 * @typefef MATERIALS
	 * @description HTML5 Canvas gradients simple to complex (some may create a patterned texture)
	 */
	var MATERIALS = { //gradients
		GRADIENT_SKY:"GRADIENT_SKY",
		GRADIENT_SUN:"GRADIENT_SUN",
		GRADIENT_CORONA:"GRADIENT_CORONA",
		GRADIENT_SHADOW:"GRADIENT_SHADOW",
		GRADIENT_CLOUD:"GRADIENT_CLOUD"
	};

	/*
	 * =========================================
	 * SPECIAL PRELOADS AND UTILITIES
	 * =========================================
	 */

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
		hotelWalls.src = "img/bkgnd/wallpaper.png";

		//hotel sign
		hotelSign = new Image();
		hotelSign.onload = function () {
			console.log("display::preload(), loaded hotel sign");
		}
		hotelSign.src = "img/game/hotel_sign.png";

		//character sprites
		characterBoard = new Image();
		characterBoard.onload = function () {
			console.log("display::preload(), loaded character sprites");
		}
		characterBoard.src = "img/game/characterboard.png";
	}

	/*
	 * =========================================
	 * CSS BREAKPOINT READER
	 * =========================================
	 */

	/** 
	 * @method getCSSBreakpoint
	 * @description read the current CSS breakpoint from 
	 * the CSS. Allows JS to respond to events in CSS 
	 * (e.g., responsive design changes). The function returns the 
	 * value inserted in the before: pseudo-query in the CSS file, typically 
	 * named screen or device breakpoints ('cellphone', 'tablet', 'desktop')
	 * CSS code:
	 * body:before { content: 'iphone'; display: none; }
	 * this should be added to each breakpoint. this function will read 
	 * the content: value
	 * @link http://demosthenes.info/blog/948/Triggering-JavaScript-Actions-With-CSS-Media-Queries
	 * @returns {String|false} if there is a new breakpoint, return its name as 
	 * defined in the body:before element (invisible), otherwise return false if 
	 * we are in the same CSS breakpoint.
	 */
	function getCSSBreakpoint () {
		state = window.getComputedStyle(document.body,':before').content;
		state = state || false;
		if (state !== cssBreakpoint) {
			// do something when viewport moves out of its last breakpoint
			cssBreakpoint = state;
			return cssBreakpoint;
		}
		else {
			return false;
		}
	}

	/** 
	 * @method getGameRect
	 * @description get the current dimensions of the game
	 * NOTE: have to fire it when the screen size changes!
	 * @returns {DOMRect} a DOMRect {left:0, top:0, right:0, bottom:0, width:0, height:0}
	 */
	function getGameRect () {
		rect = panel.getBoundingClientRect();
		if(background.width !== factory.toInt(rect.width)) {
			//console.log("GAME RECT CHANGED, rect.width:" + rect.width + " background.width:" + background.width)
			setGameRect();
		}
		return rect;
	}

	/**
	 * @method setGameRect
	 * @description set the size of the overall game via the enclosng 
	 * DOM element the HTML5 Canvas object is attached to.
	 */
	function setGameRect () {
		rect = panel.getBoundingClientRect();
		if(background) {
			background.width = rect.width;
			background.height = rect.height;
		}
		if(foreground) {
			foreground.width = rect.width;
			foreground.height = rect.height;
		}
		if(controls) {
			controls.width = rect.width;
			controls.height = rect.height;
		}
		return rect;
	}

	/*
	 * =========================================
	 * GETTERS FOR IMAGES, TEXTURES (CANVAS GRADIENTS)
	 * =========================================
	 */

	/** 
	 * @method getBackgroundTexture 
	 * @description create and/or get a specific background 
	 * gradient. Gradients are identified by their MATERIALS 
	 * naming.
	 * @param {MATERIALS} material the gradient to use
	 * @returns {CanvasGradient} the CanvasGradient reference
	 */
	function getBackgroundTexture (material, x, y, x2, y2) {
		var grd = null;
		//create the linear gradient

		switch(material) {
			case MATERIALS.GRADIENT_SKY:
				grd = bctx.createLinearGradient(
					x, y,  //starting coordinates of gradient
					x2, y2 //ending coordinates of gradient
					);
				grd.addColorStop(0.000, 'rgba(34,133,232,1.0)');
				grd.addColorStop(0.180, 'rgba(71,151,211,1.0)');
				grd.addColorStop(0.400, 'rgba(102,164,214,1.0)');
				grd.addColorStop(0.900, 'rgba(227,238,247,1.0)');
				grd.addColorStop(1.000, 'rgba(240,255,250,1.0)');
				break;
			case MATERIALS.GRADIENT_SUN:
				grd = bctx.createRadialGradient(
					x, y, //starting circle x and y coordinate
					x2,   //starting circle radius
					x, y, //ending circle x and y coordinate
					y2    //ending circle radius
					);
				grd.addColorStop(0.050, 'rgba(255,255,0,1.0)');
				grd.addColorStop(0.390, 'rgba(255,222,180,1.0)');
				grd.addColorStop(1.000, 'rgba(255,137,0,1.0)');
				break;
			case MATERIALS.GRADIENT_CORONA:
				grd = bctx.createRadialGradient(
					x, y, //starting circle x and y coordinate
					x2,   //starting circle radius
					x, y, //ending circle x and y coordinate
					y2    //ending circle radius
					);
				grd.addColorStop(0.000, 'rgba(255,255,255,0.0)');
				grd.addColorStop(x2/y2, 'rgba(255,255,255,0.4)');
				grd.addColorStop(1.000, 'rgba(255,255,255,0.0)');
				break;
			case MATERIALS.GRADIENT_SHADOW:
				grd = bctx.createLinearGradient(
					x, y,  //starting coordinates of gradient
					x2, y2 //ending coordinates of gradient
					);
				grd.addColorStop(0.000, 'rgba(32,32,32,1.0)');
				grd.addColorStop(0.450, 'rgba(96,96,96,0.9)');
				grd.addColorStop(1.000, 'rgba(200,200,200,0.4)');
				break;
			default:
				elefart.showError("getBackgroundTexture received invalid CanvasGradient index:" + material);
				break;
			}
		return grd;
	}

	/** 
	 * @method getForegroundTexture
	 * @description create and/or get a specific background 
	 * gradient. Gradients are identified by their MATERIALS 
	 * naming.
	 * @param {MATERIALS} material the gradient to use
	 * @returns {CanvasGradient} the CanvasGradient reference
	 */
	function getForegroundTexture (material, x, y, x2, y2) {
		var grd = null;
		switch(material) {
			case MATERIALS.GRADIENT_CLOUD:
				grd = bctx.createLinearGradient(
					x, y,  //starting coordinates of gradient
					x2, y2 //ending coordinates of gradient
					);
				grd.addColorStop(0.000, 'rgba(255,255,255,1.0)');
				grd.addColorStop(0.400, 'rgba(250,250,250,1.0)');
				grd.addColorStop(0.500, 'rgba(240,240,240,1.0)');
				grd.addColorStop(0.600, 'rgba(220,220,220,1.0)');
				break;
			default:
				elefart.showError("getForegroundgroundTexture received invalid CanvasGradient index:" + material);
				break;
		}
		return grd;
	}

	/** 
	 * @method getControlTexture
	 * @description create and/or get a specific background 
	 * gradient. Gradients are identified by their MATERIALS 
	 * naming.
	 * @param {MATERIALS} material the gradient to use
	 * @returns {CanvasGradient} the CanvasGradient reference
	 */
	function getControlTexture (material, x, y, x2, y2) {
		var grd = null;
		switch(material) {
			//TODO: foreground textures
			default:
				elefart.showError("getForegroundgroundTexture received invalid CanvasGradient index:" + material);
				break;
		}
		return grd;
	}

	function getHotelWalls () {
		if(hotelWalls) {
			return hotelWalls;
		}
		console.log("ERROR: getHotelWalls() image not loaded");
		return false;
	}

	function getHotelSign () {
		if(hotelSign) {
			return hotelSign;
		}
		console.log("ERROR: getHotelSign() image not loaded");
		return false;
	}

	function getCharacterBoard () {
		if(characterBoard) {
			return characterBoard;
		}
		console.log("ERROR: getCharacterBoard() image not loaded");
		return false;
	}

	/*
	 * =========================================
	 * CANVAS FILTERS
	 * =========================================
	 */

	/** 
	 * function getPixels 
	 * @description get the pixel RGB(A) data from an image 
	 * @param {HTMLImageElement} img image to return pixel data from 
	 * @param {HTMLCanvasElement} c offscreen <canvas> object to filter in
	 * @return {Array<Number>} an array with RGB or RGBA image data 
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

	/*
	 * =========================================
	 * DISPLAY LIST
	 * =========================================
	 */

	/** 
	 * @method getPanel
	 * get the panel a particular DisplayList is assigned to
	 */
	function getPanel(layer) {
		switch(layer) {
			case LAYERS.WORLD:  //environment outside building (Sun, Sky)
				return PANELS.BACKGROUND;
				break;
			case LAYERS.CLOUDS:      //Clouds in the Sky
			case LAYERS.BUILDINGBACK:  //extreme back of building (includes ElevatorShafts)
			case LAYERS.BUILDING:      //main Building
			case LAYERS.SHAFTS:        //elevator shafts in building
			case LAYERS.ELEBACK:       //back wall of elevators
			case LAYERS.ELESPACE1:     //places for People to stand
			case LAYERS.ELESPACE2: 
			case LAYERS.ELESPACE3: 
			case LAYERS.ELESPACE4: 
			case LAYERS.WALLS:         //building walls
			case LAYERS.DOORS:         //elevator doors
			case LAYERS.FLOORS:        //objects in the room floors
			case LAYERS.PEOPLE: 
			case LAYERS.BUILDINGFRONT: //anything in front of People
				return PANELS.FOREGROUND;
				break;
			case LAYERS.CONTROLS:      //user controls
			case LAYERS.MODAL:         //modal windows above game panel
			case LAYERS.ANIMATION:     //animation above game panel
				return PANELS.CONTROLS;
				break;
			default:
				elefart.showError("in getPanel(), Invalid layer:" + layer);
				break;
		}
	}

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
	 * @param {Point|Line|Rect|Circle|Polygon|ScreenSprite} obj the object to draw
	 * @param {LAYERS} layer (optional) the layer to draw in
	 */
	function addToDisplayList (obj, layer) {
		if(obj && obj.type) {
			if(layer) { //change layer
				removeFromDisplayList(obj, layer);
				obj.layer = layer; //reset the layer the object is part of
				displayList[layer].push(obj); 
			}
			else {
				layer = obj.layer;
			}
			obj.panel = getPanel(layer);
			displayList[layer].push(obj);
		}
		else {
			elefart.showError("addToDisplayList invalid params obj:" + typeof obj + " layer:" + layer);
		}
		return false;
	}

	/** 
	 * @method removeFromDisplayList
	 * @description remove an object from drawing display list
	 * @param {Point|Line|Rect|Circle|Polygon|ScreenSprite} obj the object to draw
	 * @param {LAYERS} layer (optional) the display list layer to draw in (optional)
	 */
	function removeFromDisplayList (obj, layer) {
		var pos;
		if(!obj) {
			elefart.showError("removeFromDisplayList invalid object:" + typeof obj);
		}
		else if(layer) {
			pos = checkIfInLayer(obj, layer);
			if(pos) {
				obj.panel = false; //no panel when removed
				displayList[layer].splice(pos, 1); //remove element reference
			}
		}
		else {
			pos = checkIfInList(obj);
			if(pos) {
				displayList[pos.layer].splice(pos, 1); //remove element
			}
		}
	}

	/** 
	 * @method changeDisplayList
	 * @description move an object from oneDisplayList to another
	 */
	function changeDisplayList (obj, layer1, layer2) {

	}

	/*
	 * =========================================
	 * SHAPES
	 * =========================================
	 */

	/** 
	 * @method drawPoint
	 * @description draw a Point as a tiny Circle
	 * @param {CanvasContext} ctx the current drawing context
	 * @param {ScreenObject} the ScreenObject (type ScreenPoint) to draw
	 */
	function drawPoint (ctx, obj) {
		ctx.save();
		ctx.beginPath();
		ctx.fillStyle = obj.fillStyle;
		ctx.globalAlpha = obj.opacity;
		ctx.arc(obj.x, obj.y, 1, 0, 2 * Math.PI, true); //stroke a tiny Circle
		ctx.fill();
		ctx.restore();
	}

	/** 
	 * @method drawLine
	 * @description draw a line with a stroke (no fill)
	 * @param {CanvasContext} ctx the current drawing context
	 * @param {ScreenObject} obj the ScreenObject (type ScreenLine) to draw
	 */
	function drawLine (ctx, obj) {
		ctx.save();
		ctx.lineWidth = obj.lineWidth;
		ctx.strokeStyle = obj.strokeStyle;
		ctx.globalAlpha = obj.opacity;
		ctx.beginPath();
		ctx.moveTo(obj.pt1.x, obj.pt1.y);
		ctx.lineTo(obj.pt2.x, obj.pt2.y);
		if(obj.lineWidth && obj.strokeStyle) ctx.stroke();
		ctx.restore();
	}

	/** 
	 * @method drawRect
	 * @description draw a square rectangle with stroke and fill. ScreenRects 
	 * are drawn with this method if their borderRadius == 0.
	 * @param {CanvasContext} ctx the current drawing context
	 * @param {ScreenObject} the ScreenObject (ScreenRect) to draw
	 */
	function drawRect(ctx, obj) {
		ctx.save();
		ctx.lineWidth = obj.lineWidth;
		ctx.strokeStyle = obj.strokeStyle;
		ctx.fillStyle = obj.fillStyle;
		ctx.globalAlpha = obj.opacity;
		if(obj.fillStyle) ctx.fillRect(obj.left, obj.top, obj.width, obj.height);
		if(obj.img) {
			drawImage(ctx, obj);
		}
		if(obj.lineWidth && obj.strokeStyle) ctx.strokeRect(obj.left, obj.top, obj.width, obj.height);
		ctx.restore();
	}
 
	/** 
	 * @method drawRoundedRect
	 * @description since rounded rects aren't part of the HTML5 spec, create one 
	 * as a polygon with arcs forming the rounded corners. ScreenRect is drawn with 
	 * this method if obj.borderRadius > 0.
	 * @link https://sites.google.com/a/rdaemon.com/rdaemon/home/html5-canvas-rounded-rectangle
	 * @param {CanvasContext} ctx current drawing context
	 * @param {ScreenObject} the ScreenObject (type ScreenRect) to draw
	 */
	function drawRoundedRect(ctx, obj) {
		ctx.save();
		ctx.lineWidth = obj.lineWidth;
		ctx.strokeStyle = obj.strokeStyle;
		ctx.fillStyle = obj.fillStyle;
		ctx.globalAlpha = obj.opacity;
		var r = obj.borderRadius,
		x = obj.left,
		y = obj.top,
		w = obj.width,
		h = obj.height;
		//rounded Rect shape from arcs
		ctx.beginPath();
			ctx.moveTo(x+r, y);
			ctx.lineTo(x+w-r, y);
			ctx.quadraticCurveTo(x+w, y, x+w, y+r);
			ctx.lineTo(x+w, y+h-r);
			ctx.quadraticCurveTo(x+w, y+h, x+w-r, y+h);
			ctx.lineTo(x+r, y+h);
			ctx.quadraticCurveTo(x, y+h, x, y+h-r);
			ctx.lineTo(x, y+r);
			ctx.quadraticCurveTo(x, y, x+r, y);
		ctx.closePath();
		//fill the Rect
		if(obj.fillStyle) ctx.fill();
		//draw clipped image if present
		if(obj.img) {
			ctx.clip();
			drawImage(ctx, obj);
		}
		//overlay stroke on top of fill and any images
		if(obj.lineWidth && obj.strokeStyle) {
			ctx.stroke();
		}
		ctx.restore();
	}

	/** 
	 * @method drawBox
	 * @description draw a rounded-corner Rect with one side missing.
	 * @param {CanvasContext} ctx current drawing context
	 * @param {ScreenObject} the ScreenObject (type ScreenRect) to draw
	 */
	function drawRoundedBox(ctx, obj) {
		ctx.save();
		ctx.lineWidth = obj.lineWidth;
		ctx.strokeStyle = obj.strokeStyle;
		ctx.fillStyle = obj.fillStyle;
		ctx.globalAlpha = obj.opacity;
		var r = obj.borderRadius,
		x = obj.left,
		y = obj.top,
		w = obj.width,
		h = obj.height;
		//rounded Rect shape from arcs
		ctx.beginPath();

			//draw the straight lines
			ctx.moveTo(x, y+h-r);
			if(obj.missingSide !== 4) ctx.lineTo(x, y+r);
			ctx.moveTo(x+r, y);
			if(obj.missingSide !== 1) ctx.lineTo(x+w-r, y);
			ctx.moveTo(x+w, y+r);
			if(obj.missingSide !== 2) ctx.lineTo(x+w, y+h-r);
			ctx.moveTo(x+w-r, y+h);
			if(obj.missingSide !==3) ctx.lineTo(x+r, y+h);

			//draw in corners
			//top
			if(obj.missingSide === 1) {
				ctx.moveTo(x, y+r);
				ctx.lineTo(x,y);
				ctx.moveTo(x+w, y);
				ctx.lineTo(x+w, y+r);
				//draw quad curves
				ctx.moveTo(x+w, y+h-r);
				ctx.quadraticCurveTo(x+w, y+h, x+w-r, y+h);
				ctx.moveTo(x+r, y+h);
				ctx.quadraticCurveTo(x, y+h, x, y+h-r);
			}
			//right
			else if(obj.missingSide === 2) {
				ctx.moveTo(x+w-r, y);
				ctx.lineTo(x+w, y);
				ctx.moveTo(x+w, y+h);
				ctx.lineTo(x+w-r, y+h);
				//draw quad curves
				ctx.moveTo(x+r, y+h);
				ctx.quadraticCurveTo(x, y+h, x, y+h-r);
				ctx.moveTo(x, y+r);
				ctx.quadraticCurveTo(x, y, x+r, y);
			}
			//bottom
			else if(obj.missingSide === 3) {
				ctx.moveTo(x+w, y+h-r);
				ctx.lineTo(x+w, y+h);
				ctx.moveTo(x, y+h);
				ctx.lineTo(x, y+h-r);
				//draw quad curves
				ctx.moveTo(x, y+r);
				ctx.quadraticCurveTo(x, y, x+r, y);
				ctx.moveTo(x+w-r, y);
				ctx.quadraticCurveTo(x+w, y, x+w, y+r);
			}
			//left
			else if(obj.missingSide === 4) {
				ctx.moveTo(x+r, y+h);
				ctx.lineTo(x, y+h);
				ctx.moveTo(x,y);
				ctx.lineTo(x+r, y);
				//draw quad curves
				ctx.moveTo(x+w-r, y);
				ctx.quadraticCurveTo(x+w, y, x+w, y+r);
				ctx.moveTo(x+w, y+h-r);
				ctx.quadraticCurveTo(x+w, y+h, x+w-r, y+h);
			}


		//fill the Rect
		if(obj.fillStyle) {
			ctx.fill();
		}
		//draw clipped image if present
		if(obj.img) {
			ctx.clip();
			drawImage(ctx, obj);
		}
		//overlay stroke on top of fill and any images
		if(obj.lineWidth && obj.strokeStyle) {
			ctx.stroke();
		}
		ctx.restore();
	}

	/** 
	 * @method drawCircle
	 * @description draw a circle with a specific stroke and fill
	 * @param {CanvasContext} ctx current drawing context
	 * @param {ScreenObject} the ScreenObject (type ScreenCircle) to draw
	 */
	function drawCircle (ctx, obj) {
		ctx.save();
		ctx.lineWidth = obj.lineWidth;
		ctx.strokeStyle = obj.strokeStyle;
		ctx.fillStyle = obj.fillStyle;
		ctx.globalAlpha = obj.opacity;
		ctx.beginPath();
		//circle starts at topLeft, so add radius when drawing from center Point
		ctx.arc(obj.left+obj.radius, obj.top+obj.radius, obj.radius, 0, 2 * Math.PI);
		//ctx.rect(obj.left, obj.top, obj.width, obj.height); //enclosing Rect
		ctx.closePath();
		if(obj.fillStyle) ctx.fill();
		if(obj.img) {
			ctx.clip();
			drawImage(ctx, obj);
		}
		if(obj.lineWidth && obj.strokeStyle) ctx.stroke();
		ctx.restore();
	}

	/** 
	 * @method movePointAlongLine
	 * @description use this to "back points" down or up 
	 * a line so a rounded connector can be drawn
	 * @param {Point} pt1 start of line
	 * @param {Point} pt2 end of line
	 * @param {Number} radius how far to move back down line
	 * @returns {Point} new Point, backed down line
	 */
	function movePointAlongLine (pt2, pt1, radius) {
		var angle = Math.atan2(pt2.y - pt1.y, pt2.x - pt1.x);
		//if(angle) angle = -angle;
		var sin = Math.sin(angle) * -radius;
		var cos = Math.cos(angle) * radius;
		return {
			x:pt1.x + cos,
			y:pt2.y + sin
		}
	}

	function lineAngle (p1, p2) {
		var xDiff = p2.x - p1.x;
		var yDiff = p2.y - p1.y;
		return Math.atan2(yDiff, xDiff); // * (180 / Math.PI);
	}

	function lineLength (pt2, pt1) {
		var dx   = pt2.x - pt1.x;         //horizontal difference 
		var dy   = pt2.y - pt1.y;         //vertical difference 
		var dist = Math.sqrt( dx*dx + dy*dy ); //distance using Pythagoras theorem
		return dist;
	}

	/** 
	 * @method getCircleLineIntersectionPoint
	 * @description given a line an a circle, return intersections. Used to compute
	 * rounding of corners in polygon by finding the 'shrink' point the line needs to 
	 * go to to accomodate the arc
	 * @link http://stackoverflow.com/questions/13053061/circle-line-intersection-points
	 * @param {Point} pointA starting Point of line
	 * @param {Point} pointB ending point of line
	 * @param {Point} circle center
	 * @param {Number} circle radius
	 * @returns {Array<Point>} returns one or two Points for the intersection of a Line with 
	 * the circle. 
	 */
	function getCircleLineIntersectionPoint(
		pointA,
		pointB, 
		center, 
		radius) {
		var baX = pointB.x - pointA.x;
		var baY = pointB.y - pointA.y;
		var caX = center.x - pointA.x;
		var caY = center.y - pointA.y;

		var a = baX * baX + baY * baY;
		var bBy2 = baX * caX + baY * caY;
		var c = caX * caX + caY * caY - radius * radius;

		var pBy2 = bBy2 / a;
		var q = c / a;

		var disc = pBy2 * pBy2 - q;
		if (disc < 0) {
			return []; //NO INTERSECTION
		}
		// if disc == 0 ... dealt with later
		var tmpSqrt = Math.sqrt(disc);
		var abScalingFactor1 = -pBy2 + tmpSqrt;
		var abScalingFactor2 = -pBy2 - tmpSqrt;

		var p1 = {
				x: pointA.x - baX * abScalingFactor1, 
				y: pointA.y - baY * abScalingFactor1
			};
		if (disc == 0) { // abScalingFactor1 == abScalingFactor2
			return [p1];
		}
		var p2 = {
				x: pointA.x - baX * abScalingFactor2, 
				y: pointA.y - baY * abScalingFactor2
			};
		return [p1, p2];
	}


	function loopVal (val, max) {
		if(val >= max) {
			val = (max - val);
		}
		if(val < 0) {
			val = (max + val);
		}
		return val;
	}

	/** 
	 * @method drawPolygon
	 * @description draw a closed Polygon
	 * @linkhttp://www.arungudelli.com/html5/html5-canvas-polygon/
	 * @param {CanvasContext} ctx the canvas context to use
	 * @param {ScreenObject} obj the ScreenObject (type ScreenPoly} to draw
	 */
	function drawPolygon (ctx, obj) {

		ctx.save();
		ctx.lineWidth = obj.lineWidth;
		ctx.strokeStyle = obj.strokeStyle;
		ctx.fillStyle = obj.fillStyle; 
		var pts = obj.points;
		if (pts.length < 3) {
			return;
		} 
		ctx.beginPath();
		if(obj.borderRadius) { //rounded
			var pt0, pt1, pt2, newPt0, newPt1, newPt2,
				r = obj.borderRadius;
				var len = pts.length,
				roundArr = [];
			for(var i = 0; i < len; i++) {
				//make the rounding close back on the first point in Polygon
				pt0 = pts[loopVal(i-1, len)];
				pt1 = pts[loopVal(i, len)];
				pt2 = pts[loopVal(i+1, len)];

				var intersect0 = getCircleLineIntersectionPoint(
					pt0,
					pt1,
					pt0,
					r); //bottom of line

				var intersect1 = getCircleLineIntersectionPoint(
					pt1,
					pt0, 
					pt1, 
					r); //top of line

				roundArr.push(intersect0[1]);
				roundArr.push(intersect1[1]);

			}
			//use roundArr to draw the rounded-corner Polygon
			var len = roundArr.length;
			for(var i = 0; i < len; i++) {
				//set invisible if we sholdn't draw a stroke
				console.log("globalAlpha:" + ctx.globalAlpha)
				//forward and backward point positions
				ii = loopVal(i+1, len);
				iii = loopVal(i+2, len);
				ctx.moveTo(roundArr[i].x, roundArr[i].y);

				if(i+1 < (roundArr.length-1)) {
					ctx.arcTo(roundArr[i].x, roundArr[i].y, roundArr[ii].x, roundArr[ii].y, r);
				}
				else {
					ctx.lineTo(roundArr[ii].x, roundArr[ii].y);
				}

				if(i+2 < (roundArr.length-1)) {
					ctx.arcTo(roundArr[ii].x, roundArr[ii].y, roundArr[iii].x, roundArr[iii].y, r);
					}
				else {
					ctx.arcTo(roundArr[ii].x, roundArr[ii].y, roundArr[iii].x, roundArr[iii].y, r);
				}

			} //end of loop

			//close the polygon
			ctx.lineTo(roundArr[1].x, roundArr[1].y)
		}
		else { //square edges
			ctx.moveTo(pts[0].x, pts[0].y);
			for(var i = 1; i < pts.length; i++) {
				ctx.lineTo(pts[i].x, pts[i].y);
			}
		}

		if(obj.closed) {
			ctx.closePath(); //closed shape, optional
		}
		if(obj.fillStyle) {
			ctx.fill();
		} 
		if(obj.img) {
			ctx.clip();
			drawImage(ctx, obj); //TODO: NEED TO CLIP IMAGE TO POLYGON DIMENSIONS
		}
		if(obj.lineWidth && obj.strokeStyle) {
			ctx.stroke();
		} 
		ctx.restore();
	}

	/** 
	 * @method drawCloud
	 * @description draw a ScreenCloud object
	 * @param {CanvasContext} ctx the current drawing context
	 * @param {ScreenObject} the ScreenObject to draw
	 */
	function drawCloud (ctx, obj) {
		ctx.save();
		ctx.lineWidth = obj.lineWidth;
		ctx.strokeStyle = obj.strokeStyle;
		ctx.fillStyle = obj.fillStyle; 
		var pts = obj.points;
		var radius = obj.radius;
		if (pts.length < 3) {
			return;
		} 
		ctx.globalAlpha = obj.opacity;
		ctx.beginPath();

		//draw the bubbly parts of the cloud as curves
		var len = pts.length;
		ctx.moveTo(pts[0].x, pts[0].y);

		for(var i = 1; i < len; i+=3) {
			var ii = loopVal(i+1, len);
			var iii = loopVal(i+2, len);
			ctx.bezierCurveTo(pts[i].x, pts[i].y, pts[ii].x, pts[ii].y, pts[iii].x, pts[iii].y);
		}
		if(obj.closed) {
			ctx.closePath(); //closed shape, optional
		}
		if(obj.fillStyle) { //fill with primary color
			ctx.fill();
		} 
		if(obj.blendColor) { //optional blending with background
			var dist = Math.pow(obj.distance, 3.5); 
			if(dist < 0.1) dist = 0;
			ctx.fillStyle = obj.blendColor;
			ctx.globalAlpha = dist;
			ctx.fill();
			ctx.globalAlpha = obj.opacity;
		}
		if(obj.img) { //internal image
			if(obj.imageOpacity) ctx.globalAlpha = obj.imageOpacity;
			ctx.clip();
			drawImage(ctx, obj);
			ctx.globalAlpha = obj.opacity;
		}

		if(obj.lineWidth && obj.strokeStyle) { //shrink stroke with distance
			var l = 1.2 - obj.distance; 
			if(l > 1.0) l = 1.0;
			ctx.globalAlpha = l;
			ctx.stroke();
		} 
		ctx.restore();
	}

	/** 
	 * @method drawImage
	 * @description draw an image at a specific location in the canvas
	 * @param {CanvasContext} ctx the current drawing context
	 * @param {ScreenObject} the ScreenObject (type ScreenImage) to draw
	 */
	function drawImage (ctx, obj) {
		ctx.save();
		if(obj.imageOpacity) {
			ctx.globalAlpha = obj.imageOpacity*obj.opacity;
		}
		else {
			ctx.globalAlpha = obj.opacity;
		}
		if(obj.spriteCoords) {

			var r = obj.spriteCoords.getCellRect();
			ctx.drawImage(
				obj.img,
				r.left,
				r.top, 
				r.width, 
				r.height,
				obj.left,
				obj.top,
				obj.width,
				obj.height
			);
		}
		else {
			ctx.drawImage(
				obj.img,
				0, 
				0,
				obj.img.width, 
				obj.img.height,
				obj.left,
				obj.top,
				obj.width,
				obj.height
			);
		}
		
		ctx.restore();
	}

	/** 
	 * @method drawSpriteFrame
	 * @description grab an image from a larger sprite image, part of animation sequence
	 * more specific functions grab specific images from specific sprites.
	 * @param {CanvasContext} ctx current drawing context
	 * @param {ScreenObject} the ScreenObject (type ScreenSprite) to draw
	 */
	function drawSpriteFrame (ctx, obj) {
		ctx.save();
		var captRect = {
			top:obj.type * obj.top,
			left:obj.frame * obj.left,
			bottom:obj.height,
			right:obj.width,
			width:obj.width,
			height:obj.height
		}
		ctx.globalAlpha = opacity;
		ctx.drawImage(
			obj.img, 
			captRect.left, 
			captRect.top,  
			captRect.width, 
			captRect.height, 
			obj.left, //sprite coordinates onscreen
			obj.top, //destRect.top, 
			obj.width, 
			obj.height
			);
		ctx.restore();
	}


	/* 
	 * =========================================
	 * DRAW A LAYER
	 * =========================================
	 */
	function drawLayer(ctx, layer) {
		var len = layer.length;
		for(var i = 0; i < len; i++) {
			var obj = layer[i];
			switch(obj.type) {
				case factory.TYPES.POINT:
					drawPoint(ctx, obj);
					break;
				case factory.TYPES.LINE:
					drawLine(ctx, obj);
					break;
				case factory.TYPES.RECT:

					if(obj.missingSide > 0) {
						drawRoundedBox(ctx, obj);
					}
					else if(obj.borderRadius === 0) {
						drawRect(ctx, obj);
					}
					else {
						drawRoundedRect(ctx, obj);
					}
					break;
				case factory.TYPES.CIRCLE:
					drawCircle(ctx, obj);
					break;
				case factory.TYPES.POLYGON:
					drawPolygon(ctx, obj);
					break;
				case factory.TYPES.CLOUD:
					drawCloud(ctx, obj);
					break;
				case factory.TYPES.IMAGE:
					drawImage(ctx, obj);
					break;
				default:
					console.log("drawLayer unknown type:" + obj.type);
					break;
			}
			//if there are special required drawing routines, execute
			if(obj.customDraw) {
				obj.customDraw(ctx);
			}
		}
	}

	/*
	 * =========================================
	 * DRAW BACKGROUND CANVAS
	 * =========================================
	 */

	/** 
	 * @method getBackgroundCanvas
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
		bctx.clearRect(0, 0, background.width, background.height)
		//execute the display list
		drawLayer(bctx, displayList[LAYERS.WORLD]);
		drawLayer(bctx, displayList[LAYERS.BUILDINGBACK]);
		drawLayer(bctx, displayList[LAYERS.BUILDING]);
		bctx.restore();
	}

	/*
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

		//elevator shafts are in the foreground
		drawLayer(fctx, displayList[LAYERS.CLOUDS]);
		drawLayer(fctx, displayList[LAYERS.ELEBACK]);
		drawLayer(fctx, displayList[LAYERS.SHAFTS]);
		drawLayer(fctx, displayList[LAYERS.ELESPACE1]);
		/*
		drawLayer(fctx, displayList[LAYERS.ELESPACE2]);
		drawLayer(fctx, displayList[LAYERS.ELESPACE3]);
		drawLayer(fctx, displayList[LAYERS.ELESPACE4]);
		drawLayer(fctx, displayList[LAYERS.WALLS]);
		drawLayer(fctx, displayList[LAYERS.DOORS]);
		drawLayer(fctx, displayList[LAYERS.FLOORS]);
		*/

		//restore
		fctx.restore();
	}

	/** 
	 * @method getControlCanvas
	 * @description get a reference to the control canvas
	 */
	function getControlCanvas () {
		if(firstTime) return false;
		return controls;
	}

	/** 
	 * @method drawControls
	 * @description draw the controls for the display
	 */
	function drawControls () {
		cctx.save();
		cctx.clearRect(0,0, controls.width, controls.height);
		drawLayer(cctx, displayList[LAYERS.CONTROLS]);
		drawLayer(fctx, displayList[LAYERS.MODAL]);     //modal windows above game panel
		drawLayer(fctx, displayList[LAYERS.ANIMATION]); //animation above game panel
		cctx.restore();
	}

	/*
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
		console.log("elefart.display drawing failed");
		console.log("elefart:" + elefart);
		console.log("elefart features:" + elefart.features);
		console.log("elefart createelement:" + elefart.features.createelement);
		console.log("elefart features ok:" + elefart.features.ok);
		elefart.showError("can't load canvas, draw fail screen here");
	}

	/*
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
		factory = elefart.factory;

		//start images loading
		preload();

		//initialize our display list as a multi-dimensional array
		initDisplayList();

		//initialize canvas for background
		background = document.createElement('canvas');
		bctx = background.getContext("2d");
		background.id = 'game-background';

		//initialize canvas for foreground
		foreground = document.createElement('canvas');
		fctx = foreground.getContext("2d");
		foreground.id = 'game-foreground';

		controls = document.createElement('canvas');
		cctx = controls.getContext("2d");
		controls.id = 'game-controls';

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
		console.log("in elefart.display.run()");

		/* 
		 * the panel is assigned by elefart.screens['screen-game'], which is 
		 * called before we run() this module
		 */
		panel = gamePanel;

		//set the dimensions of our game from the panel (also called on resize event)
		if(foreground && background && panel) {

			//compute the current screen size
			setGameRect();

			//add our canvas layers to the HTML panel
			panel.appendChild(background); //static
			panel.appendChild(foreground); //action in building
			panel.appendChild(controls);   //ui
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
		PANELS:PANELS,
		PANELDRAW:PANELDRAW,
		COLORS:COLORS,
		MATERIALS:MATERIALS,
		getHotelWalls:getHotelWalls,
		getHotelSign:getHotelSign,
		getCharacterBoard:getCharacterBoard,
		getCSSBreakpoint:getCSSBreakpoint,
		getGameRect:getGameRect,
		setGameRect:setGameRect,
		initDisplayList:initDisplayList,
		addToDisplayList:addToDisplayList,
		removeFromDisplayList:removeFromDisplayList,
		getBackgroundCanvas:getBackgroundCanvas,
		getBackgroundTexture:getBackgroundTexture, //needed by elefart.display
		getForegroundCanvas:getForegroundCanvas,
		getForegroundTexture:getForegroundTexture, //needed by elefart.display
		getControlCanvas:getControlCanvas,
		drawPoint:drawPoint,
		drawLine:drawLine,
		drawRect:drawRect,
		drawRoundedRect:drawRoundedRect,
		drawRoundedBox:drawRoundedBox,
		drawCircle:drawCircle,
		drawPolygon:drawPolygon,
		drawImage:drawImage,
		drawSpriteFrame:drawSpriteFrame,
		drawBackground:drawBackground,
		drawForeground:drawForeground,
		drawControls:drawControls,
		init:init,
		run:run
	};

})();