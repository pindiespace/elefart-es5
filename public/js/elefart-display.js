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
	factory,
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
	 * @description Enum giving specific names to the list of drawing layers used by displayList.
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
		DARK_GREY:"rgb(64,64,64)",
		YELLOW:"rgb(248, 237, 29)",
		BROWN:"rgb(139,69,19)"
	};

	/** 
	 * @readonly
	 * @enum {String}
	 * @typefef MATERIALS
	 * @description HTML5 Canvas gradients simple to complex (some may create a patterned texture)
	 */
	var MATERIALS = { //gradients
		GRADIENT_SKY:"GRADIENT_SKY",
		GRADIENT_SUN:"GRADIENT_SUN"
	};

	/*
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
		return setGameRect(); //might have resized;
	}

	/**
	 * @method setGameRect
	 * @description set the size of the overall game via the enclosng 
	 * DOM element the HTML5 Canvas object is attached to.
	 */
	function setGameRect () {
		rect = panel.getBoundingClientRect();
		return rect;
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

	/*
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

	/*
	 * =========================================
	 * TEXTURES (CANVAS GRADIENTS)
	 * =========================================
	 */

	/** 
	 * @method getBackgroundTexture 
	 * @description create and/or get a specific background 
	 * gradient. Gradients are identified by ther MATERIALS 
	 * naming.
	 * @param {MATERIALS} material the gradient to use
	 * @returns {CanvasGradient} the CanvasGradient reference
	 */
	function getBackgroundTexture (material, x, y, x2, y2) {
		var grd = null;
		//create the linear gradient
		switch(material) {
			case MATERIALS.GRADIENT_SKY:
				//add color stops
				grd = bctx.createLinearGradient(
					x, y,  //starting coordinates of gradient
					x2, y2 //ending coordinates of gradient
					);
				grd.addColorStop(0.000, 'rgba(34,133,232,1)');
				grd.addColorStop(0.180, 'rgba(71,151,211,1)');
				grd.addColorStop(0.400, 'rgba(102,164,214,1)');
				grd.addColorStop(1.000, 'rgba(227,238,247,1)');
				break;
			case MATERIALS.GRADIENT_SUN:

				grd = bctx.createRadialGradient(
					x, y,   //starting circle x and y coordinate
					5.000,  //starting circle radius
					x2, y2, //ending circle x and y coordinate
					(y2 - y)/2 //ending circle radius
					);
				grd.addColorStop(0.000, 'rgba(255, 255, 255, 1.000)');
				grd.addColorStop(0.050, 'rgba(255, 255, 0, 1.000)');
				grd.addColorStop(0.390, 'rgba(255, 212, 170, 1.000)');
				grd.addColorStop(1.000, 'rgba(255, 127, 0, 1.000)');
				break;
			default:
				elefart.showError("setBackGroundGradient received invalid CanvasGradient index");
				break;
			}
		return grd;
	}

	/*
	 * =========================================
	 * SHAPES
	 * =========================================
	 */

	/** 
	 * @method drawPoint
	 */
	function drawPoint (ctx, obj) {
		ctx.save();
		ctx.beginPath();
		ctx.arc(obj.x, obj.y, 1, 0, 2 * Math.PI, true);
		ctx.fill();
		ctx.restore();
		//TODO: complete
		elefart.showError("drawPoint not implemented");
	}

	/** 
	 * @method drawLine
	 */
	function drawLine (ctx, obj) {
		ctx.save();
		ctx.lineWidth = obj.lineWidth;
		ctx.strokeStyle = obj.strokeStyle;
		ctx.globalAlpha = obj.opacity;
		ctx.moveTo(obj.pt1.x, obj.pt1.y);
		ctx.lineTo(obj.pt2.x, obj.pt2.y);
		ctx.stroke();
		ctx.restore();
		//TODO: complete
		elefart.showError("drawLine not implemented");
	}

	/** 
	 * @method drawRect
	 * @description draw a square rectangle
	 * @param {CanvasContext} ctx the current drawing context
	 * @param {Number} x topleft x position
	 * @param {Number} y topleft y position
	 * @param {Number} w the width of the Rect
	 * @param {Number} h the height of the Rect
	 * @param {CanvasStyle} fillStyle style for fill (color or gradient)
	 * @param {CanvasStyle} strokeStyle style for stroke (color)
	 * @param {Number} opacity the opacity of the object
	 */
	function drawRect(ctx, obj) {
		ctx.save();
		ctx.lineWidth = obj.lineWidth;
		ctx.strokeStyle = obj.strokeStyle;
		ctx.fillStyle = obj.fillStyle;
		ctx.globalAlpha = obj.opacity;
		if(obj.fillStyle) ctx.fillRect(obj.left, obj.top, obj.width, obj.height);
		if(obj.strokeStyle) ctx.strokeRect(obj.left, obj.top, obj.width, obj.height);
		ctx.restore();
	}

	/** 
	 * @method drawRoundedRect
	 * @description since rounded rects aren't part of the HTML5 spec, create with arcs
	 * @link https://sites.google.com/a/rdaemon.com/rdaemon/home/html5-canvas-rounded-rectangle
	 * @param {CanvasContext} ctx current drawing context
	 * @param {Number} x topleft x position
	 * @param {Number} y topleft y position
	 * @param {Number} w width of Rect
	 * @param {Number} h height of Rect
	 * @param {Number} r the radius of the rounding
	 * @param {CanvasStyle} fillStyle style for fill (color or gradient)
	 * @param {CanvasStyle} strokeStyle the style (width) for stroke (color)
	 * @param {Number} opacity opacity of the Rect
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
		ctx.moveTo(obj.left + r, y);
		ctx.lineTo(obj.left + w - r, y);
		ctx.quadraticCurveTo(obj.x + w, y, x + w, y+r);
		ctx.lineTo(obj.left+w, y+h-r);
		ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
		ctx.lineTo(obj.left+r, y+h);
		ctx.quadraticCurveTo(x, y+h, x, y+h-r);
		ctx.lineTo(obj.left, y+r);
		ctx.quadraticCurveTo(obj.left, y, x+r, y);
		if(obj.fillStyle) ctx.fill();
		if(obj.strokeStyle) ctx.stroke();
		ctx.closePath();
		ctx.restore();
	}

	/** 
	 * @method drawCircle
	 * @description draw a circle with a specific stroke and fill
	 * @param {CanvasContext} ctx current drawing context
	 * @param {Number} x position of circle
	 * @param {Number} y position of circle
	 * @param {Number} radius size of circle
	 * @param {Number} lineWidth the width of the stroke around circle
	 * @param {CanvasStyle} fillStyle fill style, which may be a gradient object
	 * @param {CanvasStyle} stroke style
	 */
	function drawCircle (ctx, obj) {
		ctx.save();
		ctx.lineWidth = obj.lineWidth;
		ctx.strokeStyle = obj.strokeStyle;
		ctx.fillStyle = obj.fillstyle;
		ctx.globalAlpha = obj.opacity;
		ctx.beginPath();
		ctx.arc(obj.left, obj.top, obj.radius, 0, 2 * Math.PI);
		if(obj.fillStyle) ctx.fill();
		if(obj.strokeStyle) ctx.stroke();
		ctx.restore();
	}

	/** 
	 * @method drawPolygon
	 * @description draw a closed Polygon
	 * @linkhttp://www.arungudelli.com/html5/html5-canvas-polygon/
	 * @param {CanvasContext} ctx the canvas context to use
	 * @param {Array} pts an array of Point objects
	 */
	function drawPolygon (ctx, obj) {
		ctx.save();
		ctx.lineWidth = obj.lineWidth;
		ctx.strokeStyle = obj.strokeStyle;
		ctx.fillStyle = obj.fillstyle;
		ctx.globalAlpha = obj.opacity;
		if (pts.length < 3) return;
		ctx.beginPath();
		var pts = obj.pts;
		ctx.moveTo(pts[0].x, pts[0].y);
		for(var i = 1; i < pts.length; i++) {
			ctx.lineTo(pts[i].x, pts[i].y);
		}
		ctx.closePath();
		if(obj.fillStyle) ctx.fill();
		if(obj.strokeStyle) ctx.stroke();
		ctx.restore();
		elefart.showError("drawPolygon not implemented yet");
	}

	/** 
	 * @method drawImage
	 * @description draw an image at a specific location in the canvas
	 * @param {CanvasContext} ctx the current drawing context
	 * @param {img} a standard JS Image object
	 * @param {Rect} destRect the coordinates to draw the image at
	 * @param {Number} opacity the opacity of the drawn image
	 */
	function drawImage (ctx, obj) {
		//TODO: complete
		ctx.save();
		ctx.globalAlpha = opacity;
		ctx.drawImage(
			0, 0,
			obj.img.width, obj.img,height,
			obj.left,
			obj.top,
			obj.width,
			obj.height
			);
		ctx.restore();
	}

	/** 
	 * @method drawSpriteFrame
	 * @description grab an image from a larger sprite image, part of animation sequence
	 * more specific functions grab specific images from specific sprites.
	 * @param {CanvasContext} ctx current drawing context
	 * @param {Image} img a standard JS Image object
	 * @param {Rect} captRect the Rect to capture from the SpriteBoard
	 * @param {Rect} destRect the Rect to draw into on the game canvas
	 * @param {Number} opacity the opacity of the drawn image
	 */
	function drawSpriteFrame (ctx, obj) {
		var captRect = {
			top:obj.type * obj.top,
			left:obj.frame * obj.left,
			bottom:obj.height,
			right:obj.width,
			width:obj.width,
			height:obj.height
		}
		ctx.save();
		ctx.globalAlpha = opacity;
		ctx.drawImage(
			img, 
			captRect.left, 
			captRect.top,  
			captRect.width, 
			captRect.height, 
			obj.left, 
			obj.top, //destRect.top, 
			obj.width, 
			obj.height
			);
		ctx.restore();
	}

	/** 
	 * @method getForegroundTexture
	 * @description create and/or get a specific background 
	 * gradient. Gradients are identified by ther MATERIALS 
	 * naming.
	 * @param {MATERIALS} material the gradient to use
	 * @returns {CanvasGradient} the CanvasGradient reference
	 */
	function getForegroundTexture (material, x, y, x2, y2) {
		var grd;
			var grd = null;
		switch(material) {
			//TODO: foreground textures
			default:
				elefart.showError("no foreground textures exist!");
				break;
		}
		return grd;
	}

	/* 
	 * =========================================
	 * DRAW A LAYER
	 * =========================================
	 */
	function drawLayer(ctx, layer) {
		console.log("Layer is:" + layer + " and length:" + layer.length);
		var len = layer.length;
		for(var i = 0; i < len; i++) {
			var obj = layer[i];
			console.log("obj is:" + obj);
			console.log("obj.type is:" + obj.type);
			switch(obj.type) {
				case factory.TYPES.POINT:
					break;
				case factory.TYPES.LINE:
					break;
				case factory.TYPES.RECT:
				console.log("drawing ScrenRect");
					if(obj.borderRadius === 0) {
						drawRect(ctx, obj);
					}
					else {
						drawRoundedRect(ctx, obj);
					}
					break;
				case factory.TYPES.CIRCLE:
					break;
				case factory.TYPES.POLYGON:
					break;
				case factory.TYPES.IMAGE:
					break;
				case factory.TYPES.SPRITE:
					break;
				default:
					console.log("drawLayer unknown type:" + obj.type);
					break;
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
		//yellow background
		bctx.fillStyle = "rgba(248, 237, 29, 1.0)";
		bctx.rect(0, 0, rect.width, rect.height);
		bctx.fill();

		//TODO: EXECUTE THE DISPLAY LIST
		drawLayer(bctx, displayList[LAYERS.WORLD]);
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

		/*
		drawLayer(fctx, displayList[LAYERS.SHAFTS]);
		drawLayer(fctx, displayList[LAYERS.ELEBACK]);
		drawLayer(fctx, displayList[LAYERS.ELESPACE1]);
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

		/* 
		 * the panel is assigned by elefart.screens['screen-game'], which is 
		 * called before we run() this module
		 */
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
			//drawBackground();
			//drawDisplay();
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
		addToDisplayList:addToDisplayList,
		removeFromDisplayList:removeFromDisplayList,
		getBackgroundCanvas:getBackgroundCanvas,
		getBackgroundTexture:getBackgroundTexture, //needed by elefart.display
		getForegroundCanvas:getForegroundCanvas,
		getForegroundTexture:getForegroundTexture, //needed by elefart.display
		drawPoint:drawPoint,
		drawLine:drawLine,
		drawRect:drawRect,
		drawRoundedRect:drawRoundedRect,
		drawCircle:drawCircle,
		drawPolygon:drawPolygon,
		drawImage:drawImage,
		drawSpriteFrame:drawSpriteFrame,
		drawBackground:drawBackground,
		drawForeground:drawForeground,
		init:init,
		run:run
	};

})();