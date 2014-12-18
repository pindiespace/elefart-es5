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
window.elefart.factory = (function () {

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
	SPRITE = "SPRITE";

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

	/**
	 * @constructor Point, similar to DOMPoint, but 
	 * only containing information for drawing on 2D Canvas
	 */
	function Point (x, y) {
		return {
			type:POINT,
			id:getId(), //unique
			x:x,
			y:y
			//points can't have parents or children
		};
	}

	/** 
	 * @constructor Line
	 */
	function Line (pt1, pt2, width) {
		return {
			type:LINE,
			id:getId(),
			point1:pt1,
			point2:pt2,
			width:width
		}
	}

	/** 
	 * @constructor Rect, similar to DOMRect, but only 
	 * containing information needed to draw on 2D Canvas
	 */
	function Rect (x, y, width, height) {
		return {
			type:RECT,
			id:getId(),
			top:x,
			left:y,
			bottom: y + width,
			right: x + height,
			width:width,
			height:height,
			opacity:1.0,
			borderRadius:0,
			paddingRect:{top:0, left:0, bottom:0, right:0, width:0, height:0},
			img:null, //IMAGE IN OBJECT
			parent:null,
			children:[]

		};
	}

	/** 
	 * @constructor Circle
	 */
	function Circle (x, y, radius) {
		var d = 2 * radius;
		return {
			type:CIRCLE,
			id:getId(),
			top:x,
			left:y,
			bottom:y + d,
			right:x + d,
			width:d,
			height:d,
			radius:radius,
			opacity:1.0,
			borderRadius:radius,
			paddingRadius:0,
			img:null,
			parent:null,
			children:[],

		};
	}

	/** 
	 * @constructor Polygon
	 */
	function Polygon (pts) {
		var e = getEnclosingRect(pts);
		return {
			type:POLYGON,
			id:getId(),
			top:e.top,
			left:e.left,
			bottom:e.bottom,
			right:e.right,
			width:e.width,
			height:e.height,
			points:clone(pts),
			opacity:1.0,
			img:null,
			parent:null,
			children:null

		}
	}

	/* 
	 * ============================
	 * OBJECT COLLISION TESTS
	 * ============================
	 */

	/** 
	 * @method getEnclosingRect
	 * find the rect which encloses the set of points
	 * @param {Array} pts an array of x, y points
	 * @returns {Rect} 
	 */
	function getEnclosingRect (pts) {
		var r = {top:pts[0].y, left:pts[0].x, bottom:pts[0].y, right:pts[0].x, width:0, height:0};
		for (var i = 0; i < pts.length; i++) {
			if(pts[i].x < r.left) r.left = pts[i].x;
			if(pts[i].y < r.top) r.top = pts[i].y;
			if(pts[i].x > r.right) r.right = pts[i].x;
			if(pts[i].y > r.bottom) r.bottom = pts[i].y;
		}
		r.width = r.right - r.left;
		r.height = r.bottom - r.top;
		return r;
	}

	/** 
	 * @method pointInRect
	 * determine if a point is inside or outside Rect
	 * @param {Point} pt the point to test
	 * @param {Rect} rect the rect to test
	 * @returns {Boolean} if not in rect, false, else true
	 */
	function pointInRect (pt, rect) {
		if(pt.x > rect.left && 
			pt.x < rect.right && 
			pt.y > rect.top &&
			pt.y < rect.bottom) {
			return true;
		}
		return false;
	}

	/** 
	 * @method rectInRect
	 * determine if rect1 is completely inside rect2
	 * @param {Rect} rect1 the inner rect
	 * @param {Rect} rect2 the outer rect
	 * @returns {Boolean}  if inside, return true, else false
	 */
	function rectInRect (rect1, rect2) {
		if(pointInRect({x:rect1.left, y:rect1.top}, rect2) && 
			pontInRect({x:rect1.right, y:rect1.bottom}, rect2)) {
			return true;
		}
		return false;
	}

	/** 
	 * @method rectHitTest
	 * determine if two rects intersect at all
	 * MUCH SIMPLER than generalized collision detection
	 * @link http://gamedevelopment.tutsplus.com/tutorials/collision-detection-using-the-separating-axis-theorem--gamedev-169
	 * @returns {Rect} if intersect, return a Rect with the collision sides 
	 * listed with a 1, non-colliding sides = 0
	 * @returns {Object} we return a partial Rect object with the collision sides marked
	 */
	function rectCollideTest (rect1, rect2) {
		return !(((rect1.left + rect1.width - 1) < rect1.right) ||
			((rect1.right + rect2.width - 1) < rect1.left) ||
			((rect1.top + rect1.height - 1) < rect1.bottom) ||
			((rect1.bottom + rect2.height - 1) < rect1.top)) 
	}


	/* 
	 * ============================
	 * OBJECT MOVEMENT AND TRANSFORMS
	 * ============================
	 */

	/** 
	 * @method rectGetCenter
	 * center a Rect on a Point
	 * @param {Rect} rect the rect to center
	 */
	function rectGetCenter (rect) {
		//find center x, y for a rect
		return {
			x: rect.right - rect.left,
			y: rect.bottom - rect.top
		}
	}

	/** 
	 * @method centerRectOnPoint
	 * center a Rect on a Point
	 * @param {Rect} rect the rect to center
	 * @param {Point} centerPt the point to use
	 * @param {Boolean} recurse if true, center children as well, 
	 * otherwise just move the chidren with their newly centered parent
	 */
	function centerRectOnPoint (rect, centerPt, recurse) {
		var oldx = rect.left, 
		oldy = rect.top;
		rect.left = centerPt.x - min(rect.right - rect.left/2);
		rect.right = rect.left + rect.width;
		rect.top = centerPt.y - min(rect.bottom - rect.top/2);
		rect.bottom = rect.top + rect.height;
		dx = oldX - rect.left;
		dy = oldY = rect.top;
		if(recurse) {
			for(var i = 0; i < children.length; i++) {
				moveRect(children[i], dx, dy, recurse);
			}
		}
		return rect;
	}

	/** 
	 * @method centerRectInRect
	 * center a rect so it is inside, or surrounds an other Rect
	 * @param {Rect} rect the Rect to center
	 * @param {Rect} centerRect the Rect to center the first rect onto
	 */
	function centerRectInRect (rect, centerRect, recurse) {
		var p = rectGetCenter(rect);

		return centerRectOnPoint(centerRect, p, recurse);
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
		for(var i = 0; i < obj.children.length; i++) {
			var child = obj.children[i];
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

	function setImage(obj, src, callback) {
		obj.img = new Image().onload = function (callback) {
			this.width = obj.width;
			this.height = obj.height;
			callback(this); //callback function passed image
		}
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
	function ScreenRect (x, y, width, height, strokeWidth, strokeColor, fillColor, paddingRect, layer) {
		var r = Rect(x, y, width, height);
		setStroke(r, strokeWidth, strokeColor);
		setFill(r, fillColor);
		setRectPadding(r, paddingRect);
		setLayer(r, layer);
		r.move = moveRect;
		r.scale = scaleRect;
		r.setPadding = setRectPadding;
		r.setOpacity = setOpacity;
		r.setStroke = setStroke;
		r.setFill = setFill;
		return r;
	}

	/** 
	 * @method ScreenCircle
	 * create a screen circle
	 */
	function ScreenCircle (x, y, radius, strokeWidth, strokeColor, fillColor, layer) {
		var r = Circle(x, y, radius);
		setOpacity(r, 1.0);
		setStroke(r, strokeWidth, strokeColor);
		setFill(r, fillColor);
		setLayer(r, layer);
		return r;
	}

	function ScreenImage(x, y, src, callback, layer) {
		var r = Rect(x, y, 0, 0); //zero until image loaded
		setLayer(r, layer);
		setImage(r, src, callback);
		return r;
	}

	/** 
	 * @method ScreenSprite
	 * create a sprite table from supplied image file
	 */
	function ScreenSprite (src, types, frames, callback) {
		r.types = types;
		r.frames = frames;
		var r = screenImage(0, 0, src, callback, 0);
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
		Line:Line,
		Rect:Rect,
		Circle:Circle,
		Polygon:Polygon,
		setFilter:setFilter,
		setGradient:setGradient,
		setOpacity:setOpacity,
		setStroke:setStroke,
		setFill:setFill,
		setLayer:setLayer,
		ScreenRect:ScreenRect,
		ScreenCircle:ScreenCircle,
		ScreenSprite:ScreenSprite,
		init:init,
		run:run
	};

})();