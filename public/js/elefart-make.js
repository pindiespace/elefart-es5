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
	var POINT = "POINT",
	LINE = "LINE",
	RECT = "RECT",
	CIRCLE = "CIRCLE",
	POLYGON = "POLYGON",
	IMAGE = "IMAGE";

	var BLACK = "rgb(0,0,0)",
	WHITE = "rgb(255,255,255)";

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

	function Point (x, y) {
		return {
			x:x,
			y:y,
			type:POINT,
			id = getId() //unique
			//points can't have parents or children
		};
	}

	function Line (pt1, pt2) {
		return {
			type:LINE,
			id = getId()
		}
	}

	function Rect (x, y, width, height) {
		return {
			top:x,
			left:y,
			bottom: y + width,
			right: x + height,
			width:width,
			height:height,
			scaleX:1.0,
			scaleY:1.0,
			borderRadius:0,
			picture:null, //IMAGE IN OBJECT
			parent:null,
			children:[],
			type:RECT,
			id = getId() 
		};
	}

	function Circle (x, y, radius) {
		var d = 2 * radius;
		return {
			top:x,
			left:y,
			radius:radius,
			scaleR:1.0,
			borderRadius:r,
			parent:null,
			children:[],
			type:CIRCLE,
			id = getId()
		};
	}

	function Polygon (pts) {
		return {
			type = POLYGON,
			id = getId()
		}
	}

	/* 
	 * ============================
	 * OBJECT COLLISION TESTS
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

	/* 
	 * ============================
	 * OBJECT MOVEMENT AND TRANSFORMS
	 * ============================
	 */

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

	function setRectPadding (rect, paddingRect) {
		rect.paddingRect.top = paddingRect.top;
		rect.paddingRect.left = paddingRect.left;
		rect.paddingRect.bottom = paddingRect.bottom;
		rect.paddingRect.right = paddingRect.right;
	}

	function addChild(obj, child) {
		obj.children.push(child);
	}

	function removeChild(obj, childId) {
		for(var i = 0; i < rect.children.length; i++) {
			var child = rect.children[i];
			if(child.id === id) {
				array.splice(i, 1);
			}
		}
	}

	function setFilter (obj, filter) {
		obj.filter = filter;
	}

	function setGradient(obj, grad) {
		obj.gradient = grad;
	}

	function setOpacity(obj, opacity) {
		obj.opacity = opacity;
	}

	function setStroke(obj, width, color) {
		obj.borderWidth = width;
		obj.borderColor = color;
	}

	function setFill(obj, color) {
		obj.fillColor = color;
	}

	function setLayer(obj, layer) {
		obj.layer = layer;
	}

	/* 
	 * ============================
	 * CANVAS SHAPES
	 * ============================
	 */

	/** 
	 * @method ScreenRect
	 * create a ScreenRect object
	 */
	function ScreenRect (x, y, width, height, strokeWidth, strokeColor, fillColor) {
		var r = Rect(x, y, width, height);
		setRectPadding(r, paddingRect);
		setOpacity(r, 1.0);
		setStroke(r, strokeWidth, strokeColor);
		setFill(r, fillColor);
		setLayer(r, 0);
		return r;
	}

	/** 
	 * @method ScreenCircle
	 * create a screen circle
	 */
	function ScreenCircle (x, y, radius, strokeWidth, strokeColor, fillColor) {
		var r = Circle();
		setOpacity(r, 1.0);
		setStroke(r, strokeWidth, strokeColor);
		setFill(r, strokeWidth, strokeColor);
		setLayer(r, 0);
		return r;
	}

	/** 
	 * @method ScreenImg
	 * create a screen object from supplied image file
	 */
	function ScreenImage (x, y, width, height, strokeWidth, strokeColor, FillColor) {
		var r;
		r = ScreenRect(--------------)
		return r;
	}

	/** 
	 * @method ScreenSprite
	 * create a sprite table from supplied image file
	 */
	function ScreenSprite (spriteRect, src, types, frames) {
		var r = screenImg(spriteRect, src, filter, function () {
			r.types = types;
			r.frames = frames;
			r.spriteRect = Rect(0,0,)
		});
		
		return r;
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