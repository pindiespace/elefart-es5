/** 
 * @namespace 
 * @fileoverview factory function for elefart. Makes common objects
 * used on the screen. Objects are scaled via 'mobile first', meaning
 * that constant sizes are defined for small screens, and scaled for 
 * larger ones.
 * @version 0.1.1
 * @author Pete Markeiwicz
 * @license MIT
 */
window.elefart.make = (function () {

	var firstTime = true;

	/* 
	 * ============================
	 * OBJECT PRIMITIVES
	 * ============================
	 */
	var POINT = 1,
	LINE = 2,
	RECTANGLE = 3,
	CIRCLE = 4,
	POLYGON = 5;

	/* 
	 * ============================
	 * OBJECT SIZE CONSTANTS
	 * ============================
	 */
	var shaftWidth = 100,
	floorHeight = 100
	walls = 10;

	/* 
	 * ============================
	 * UTILITY FUNCTIONS FOR HANDLING SCREEN OBJECTS
	 * ============================
	 */

	/** 
	 * @method clone
	 * clone a JS object (requires JSON)
	 * @param {Object} incoming object
	 * @returns {Object} the copied object
	 */
	function clone(obj) {
		return (JSON.parse(JSON.stringify(obj)));
	}

	/* 
	 * ============================
	 * GEOMETRY PRIMITIVES
	 * ============================
	 */

	function  Point (x, y) {
		return {
			x:x,
			y:y
		};
	}

	function Rect (x, y, width, height, borderRadius) {
		if(!borderRadius) borderRadius = 0;
		return {
			top:x,
			left:y,
			bottom: y + width,
			right: x + height,
			width:width,
			height:height,
			borderRadius:borderRadius
		};
	}

	function Circle (x, y, radius) {
		return {
			top:x,
			left:y,
			radius:radius
		};
	}

	function Img (src, x, y, width, height) {
		return {
			scale:1.0,
			src:src,
			img:null
		};
	}


	function Sprite (x, y, spriteType, img) {
		return {
			x:x,
			y:y,
			type:0,
			frame:0,
			boardRect:Rect(0,0,0,0,0),
			drawRect:Rect(0,0,0,0,0),
			img:Img()
		}
	}


	/* 
	 * ============================
	 * BASIC DRAWING FUNCTIONS
	 * ============================
	 */

	/** 
	 * @method pointInRect
	 * determine if a point is inside or outside rect
	 */
	function pointInRect (pt, rect) {

	}
	 
	/** 
	 * @method rectInRect
	 * determine if rect1 is completely inside rect2
	 */
	function rectInRect (rect1, rect2) {

	}

	function center (centerPoint, recurse) {

	}

	function move (x, y, recurse) {

	}


	/* 
	 * ============================
	 * CANVAS SHAPES
	 * ============================
	 */

	/** 
	 * @method addGraphicParams
	 * add additional graphic features to basic graphic 
	 * shapes (decorator pattern)
	 */
	function addGraphicParams (obj) {
		obj.padding = Rect(0,0,0,0,0);
		obj.borderWidth = 0;
		obj.borderColor = '';
		obj.fillColor = '';
		obj.opacity = 1.0;
		obj.grad  = null; //canvas gradient stops
		obj.parent = null;
		obj.children = [];
		return obj;
	}

	function ScreenRect () {
		var r = addGraphicParams(Rect());
		//add functions
		r.move = function (x, y) {
			this.x += x;
			this.y += y;
			for(var i = 0; i < this.children.length; i++) {
				obj.children.x += x;
				obj.children.y += y;
			}
		}
		r.scale = function () {};
		r.center = function (centerRect) {};
		r.addChild = function () {};
		r.removeChild = function () {};
		r.changePadding = function () {};
		return r;
	}

	function ScreenCircle () {
		var r = addGraphicParams(Circle());
		r.move = function (x, y) {};
		r.scale = function (scale) {};
		r.center = function (centerRect) {};
		//add functions
	}

	function ScreenImg () {

	}

	function ScreenSprite () {

	}

/* 
 * ============================
 * INIT AND RUN
 * ============================
 */

	/** 
	 * @method init
	 */
	function init () {
		firstTime = false;
	}

	/** 
	 * @method run
	 */
	function run () {
		if(firstTime) {
			init();
		}
	}

	//returned object
	return {
		Point:Point,
		Rect:Rect,
		Circle:Circle,
		Img:Img,
		Sprite:Sprite,
		ScreenRect:ScreenRect,
		ScreenCircle:ScreenCircle,
		ScreenImg:ScreenImg,
		ScreenSprite:ScreenSprite,
		init:init,
		run:run
	};


})();