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
	panel,          //game DOM panel
	rect,           //game Rect
	fctx,           //foreground context
	bctx,           //background context
	foreground,     //foreground canvas
	background,     //background canvas
	displayList = {}, //multi-dimensional array with drawing objects
	hotelWalls,     //hotel walls
	hotelSign,      //hotel sign
	characterBoard, //images of users for animation
	cssBreakpoint,  //keep track of current CSS breakpoint in getCSSBreakpoint
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
		FLOORS:"FLOORS",       //people and objects in the room floors
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
		LIGHT_GREY:"rgb(128,128,128)",
		DARK_GREY:"rgb(64,64,64)",
		YELLOW:"rgb(248, 237, 29)",
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
		GRADIENT_SUN:"GRADIENT_SUN"
	};

	/*
	 * =========================================
	 * SPECIAL PRELOADS AND UTILITIES
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
		console.log("body width:"+ document.getElementsByTagName('body')[0].getBoundingClientRect().width);
		console.log("panel width:"+ panel.getBoundingClientRect().width);
		rect = panel.getBoundingClientRect();
		if(background) {
			background.width = rect.width;
			background.height = rect.height;
		}
		if(foreground) {
			foreground.width = rect.width;
			foreground.height = rect.height;
		}
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
	 * GETTERS FOR ScreenSprit images
	 * =========================================
	 */
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
	 * @param {Point|Line|Rect|Circle|Polygon|ScreenSprite} obj the object to draw
	 * @param {LAYERS} layer the layer to draw in
	 */
	function addToDisplayList (obj, layer) {
		if(obj && obj.type && layer) {
			displayList[layer].push(obj);
		}
		else {
			elefart.showError("addToDisplayList invalid params obj:" + typeof obj + " layer:" + layer);
		}
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
			pos = checkIfInLayer(obj);
			if(pos) {
				displayList[layer].splice(pos, 1); //remove element
			}
		}
		else {
			pos = checkIfInList(obj);
			if(pos) {
				displayList[pos.layer].splice(pos, 1); //remove element
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
				grd = bctx.createLinearGradient(
					x, y,  //starting coordinates of gradient
					x2, y2 //ending coordinates of gradient
					);
				grd.addColorStop(0.000, 'rgba(34,133,232,1.0)');
				grd.addColorStop(0.180, 'rgba(71,151,211,1.0)');
				grd.addColorStop(0.400, 'rgba(102,164,214,1.0)');
				grd.addColorStop(0.900, 'rgba(227,238,247,1.0)');
				grd.addColorStop(1.000, 'rgba(240,255,250,1.0)');
				bctx.fillStyle = grd;
				break;
			case MATERIALS.GRADIENT_SUN:
				grd = bctx.createRadialGradient(
					x, y, //starting circle x and y coordinate
					x2,   //starting circle radius
					x, y, //ending circle x and y coordinate
					y2    //ending circle radius
					);
				grd.addColorStop(0.050, 'rgba(255, 255, 0,1.0)');
				grd.addColorStop(0.390, 'rgba(255, 212, 170,1.0)');
				grd.addColorStop(1.000, 'rgba(255, 127, 0,1.0)');
				bctx.fillStyle = grd;
				break;
			default:
				elefart.showError("setBackGroundGradient received invalid CanvasGradient index");
				break;
			}
		return grd;
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
		ctx.moveTo(obj.left + r, y);
		ctx.lineTo(obj.left + w - r, y);
		ctx.quadraticCurveTo(obj.x + w, y, x + w, y+r);
		ctx.lineTo(obj.left+w, y+h-r);
		ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
		ctx.lineTo(obj.left+r, y+h);
		ctx.quadraticCurveTo(x, y+h, x, y+h-r);
		ctx.lineTo(obj.left, y+r);
		ctx.quadraticCurveTo(obj.left, y, x+r, y);
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
	 * @method drawCircle
	 * @description draw a circle with a specific stroke and fill
	 * @param {CanvasContext} ctx current drawing context
	 * @param {ScreenObject} the ScreenObject (type ScreenCircle) to draw
	 */
	function drawCircle (ctx, obj) {
		ctx.save();
		ctx.lineWidth = obj.lineWidth;
		ctx.strokeStyle = obj.strokeStyle;
		ctx.fillStyle = obj.fillstyle;
		ctx.globalAlpha = obj.opacity;
		ctx.beginPath();
		ctx.arc(obj.left+obj.radius, obj.top+obj.radius, obj.radius, 0, 2 * Math.PI);
		//ctx.rect(obj.left, obj.top, obj.width, obj.height); //enclosing Rect
		ctx.closePath();
		if(obj.fillStyle) ctx.fill();
		if(obj.img) {
			ctx.clip();
			drawImage(ctx, obj); //TODO: clip image to draw in Circle fill
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
	 * @returns {Array} returns one or two points for the intersection of a line with 
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
			//use roundArr to draw the Polygon
			var len = roundArr.length;
			for(var i = 0; i < len; i++) {
				ii = loopVal(i+1, len);
				iii = loopVal(i+2, len);
				ctx.moveTo(roundArr[i].x, roundArr[i].y);
				if(i+1 < (roundArr.length-1)) {
					ctx.arcTo(roundArr[i].x, roundArr[i].y, roundArr[ii].x, roundArr[ii].y, r)////////////////
//ok
				}
				else {
					ctx.lineTo(roundArr[ii].x, roundArr[ii].y); /////////////////////////
					//ctx.arcTo(roundArr[i].x, roundArr[i].y, roundArr[ii].x, roundArr[ii].y, r)///////////////
				}

				if(i+2 < (roundArr.length-1)) {
					ctx.arcTo(roundArr[ii].x, roundArr[ii].y, roundArr[iii].x, roundArr[iii].y, r)
					//ctx.lineTo(roundArr[ii].x, roundArr[ii].y);///////////////////////

				}
				else {
					//ctx.lineTo(roundArr[ii].x, roundArr[ii].y, roundArr[iii].x, roundArr[iii].y, r); //////////////////////
					ctx.arcTo(roundArr[ii].x, roundArr[ii].y, roundArr[iii].x, roundArr[iii].y, r); //////////////////////
//ok
				}

			}
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
		////////////////////console.log("Layer is:" + layer + " and length:" + layer.length);
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
					if(obj.borderRadius === 0) {
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
				case factory.TYPES.IMAGE:
					drawImage(ctx, obj);
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
		bctx.clearRect(0, 0, background.width, background.height)
		//yellow background
		//bctx.fillStyle = "rgba(248, 237, 29, 1.0)";
		//bctx.rect(0, 0, rect.width, rect.height);
		//bctx.fill();

		//execute the display list
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

		//elevator shafts are in the foreground
		drawLayer(fctx, displayList[LAYERS.SHAFTS]);

		/*
		drawLayer(fctx, displayList[LAYERS.ELEBACK]);
		drawLayer(fctx, displayList[LAYERS.ELESPACE1]);
		drawLayer(fctx, displayList[LAYERS.ELESPACE2]);
		drawLayer(fctx, displayList[LAYERS.ELESPACE3]);
		drawLayer(fctx, displayList[LAYERS.ELESPACE4]);
		drawLayer(fctx, displayList[LAYERS.WALLS]);
		drawLayer(fctx, displayList[LAYERS.DOORS]);
		drawLayer(fctx, displayList[LAYERS.FLOORS]);
		drawLayer(fctx, displayList[LAYERS.CONTROLS]);
		drawLayer(fctx, displayList[LAYERS.MODAL]);     //modal windows above game panel
		drawLayer(fctx, displayList[LAYERS.ANIMATION]); //animation above game panel
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

		//initialize our display list as a multi-dimensional array
		initDisplayList();

		//initialize canvas for foreground
		foreground = document.createElement('canvas');
		fctx = foreground.getContext("2d");
		foreground.id = 'game-foreground';

		//initialize canvas for background
		background = document.createElement('canvas');
		bctx = background.getContext("2d");
		background.id = 'game-background';

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
		console.log("in display.run");

		/* 
		 * the panel is assigned by elefart.screens['screen-game'], which is 
		 * called before we run() this module
		 */
		panel = gamePanel;

		//set the dimensions of our game from the panel (also called on resize event)
		if(foreground && background && panel) {

			//compute the current screen size
			setGameRect();

			//add our foreground and background canvas to the HTML panel
			panel.appendChild(background);
			panel.appendChild(foreground);

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