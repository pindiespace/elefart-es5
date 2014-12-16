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

	var id = 0, //object Ids
	firstTime = true;

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
	 * @method getId
	 * get a unique Id
	 */
	function getId() {
		id++;
		return id;
	}

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
	 * @method mergeRecursive
	 * Recursively merge properties of two objects 
	 * @link http://stackoverflow.com/questions/171251/how-can-i-merge-properties-of-two-javascript-objects-dynamically
	 */
	function mergeRecursive(obj1, obj2) {

		for (var p in obj2) {
			try {
				// Property in destination object set; update its value.
				if (obj2[p].constructor==Object) {
					obj1[p] = MergeRecursive(obj1[p], obj2[p]);
				} 
				else {
					obj1[p] = obj2[p];
				}
			} catch(e) {
				// Property in destination object not set; create it and set its value.
				obj1[p] = obj2[p];
				}
		}
		return obj1;
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
		if(!borderRadius === undefined) borderRadius = 0;
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
	 * @param {Rect} rect1 the inner rect
	 * @param {Rect} rect2 the outer rect
	 * @returns {Boolean}  if inside, return true, else false
	 */
	function rectInRect (rect1, rect2) {
		
	}

	/** 
	 * @method rectHitTest
	 * determine if two rects intersect at all
	 * @returns {Rect} if intersect, return a Rect with the collision sides 
	 * listed with a 1, non-colliding sides = 0
	 */
	function rectHitTest (rect1, rect2) {

	}

	function centerRectInRect(rect, centerRect) {

	}

	function centerRectOnPoint (rect, centerPoint, recurse) {

	}

	function moveRect (rect, x, y, recurse) {
		rect.left += x; rect.right += x;
		rect.top += y; rect.bottom += y;
		if(recurse) {
			for(var i = 0; i < this.children.length; i++) {
				var child = obj.children[i];
				child.move(child, x, y, recurse);
			}
		}	
	}

	function scaleRect (rect, scale, recurse) {
		rect.right *= scale;
		rect.bottom *= scale;
		rect.width = rect.right - rect.left;
		rect.height = rect.bottom - rect.top;
		if(recurse) {
			for(var i = 0; i < this.children.length; i++) {
				var child = obj.children[i];
				child.scale(child, scale, recurse);
			}
		}
	}

	function removeChild(rect, childId) {
		for(var i = 0; i < rect.children.length; i++) {
			var child = rect.children[i];
			if(child.id === id) {
				array.splice(i, 1);
			}
		}
	}

	function changePadding (rect, paddingRect) {
		rect.paddingRect.top = paddingRect.top;
		rect.paddingRect.left = paddingRect.left;
		rect.paddingRect.bottom = paddingRect.bottom;
		rect.paddingRect.right = paddingRect.right;
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
		obj.id = getId(); //unique
		obj.padding = Rect(0,0,0,0,0);
		obj.borderWidth = 0;
		obj.borderColor = '';
		obj.fillColor = '';
		obj.opacity = 1.0;
		obj.grad  = null; //canvas gradient stops
		obj.parent = null;
		obj.children = [];
		obj.layer = 0; //layers start at 0
		return obj;
	}

	/** 
	 * @method ScreenRect
	 * create a ScreenRect object
	 */
	function ScreenRect () {
		var r = addGraphicParams(Rect());

		//add functions with wrapper to pass objects

		//tester functions
		r.pointInRect = function (point) {return pointInRect(r, point)},
		r.rectInRect = function (outerRect) {return rectInRect(r, outerRect);},
		r.hitRect = function (outerRect) {return hitRect(r, outerRect);},
		r.move = function (x, y) { moveRect(r, x, y);},
		r.scale = function (scale) {scaleRect(r, scale);},
		r.hitTest = function (collisionRect) {hitTest(r, collisionRect);},
		r.centerRectInRect = function (centerRect) {centerRectInRect(r, centerRect);},
		r.centerRectOnPoint = function (centerPoint) {centerRectOnPoint(r, centerPoint)},
		r.addChild = function (childRect) {r.children.push(childRect)},
		r.removeChild = function (id) {removeChild(id);},
		r.changePadding = function (paddingRect) {changePadding(r, paddingRect)};
		return r;
	}

	/** 
	 * @method ScreenCircle
	 * create a screen circle
	 */
	function ScreenCircle () {
		var r = addGraphicParams(Circle());
		r.move = function (x, y) {};
		r.scale = function (scale) {};
		r.center = function (centerRect) {};
		//add functions
	}

	/** 
	 * @method ScreenImg
	 * create a screen object from supplied image file
	 */
	function ScreenImg (imageRect, src, filter, callback) {
		var r = addGraphicParams(Img(src, 
			imageRect.left, imageRect.top, 
			imageRect.width,imageRect.height));
		r.filter = filter || null; //filtering function
		r.callback = callback || function () {} //callback function
	}

	/** 
	 * @method ScreenSprite
	 * create a sprite table from supplied image file
	 */
	function ScreenSprite (spriteRect, src, callback) {

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