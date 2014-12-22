/** 
 * @namespace elefart.factory
 * @fileoverview factory function for elefart. Makes common objects
 * used on the screen. Objects are scaled via 'mobile first', meaning
 * that constant sizes are defined for small screens, and scaled for 
 * larger ones.
 * @requires elefart
 * @requires elefart.display
 * @version 0.1.1
 * @author Pete Markeiwicz
 * @license MIT
 */
window.elefart.factory = (function () {

	var id = 0, //object Ids
	display,
	firstTime = true;

	/* 
	 * ============================
	 * OBJECT PRIMITIVES
	 * ============================
	 */

	/** 
	 * @readonly
	 * @enum {String}
	 * @typedef TYPES
	 */
	var TYPES = {
		POINT:"POINT",
		LINE:"LINE",
		PADDING:"PADDING",
		RECT:"RECT",
		CIRCLE:"CIRCLE",
		POLYGON:"POLYGON",
		SPRITE:"SPRITE"
	};

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
	 * @description get a unique Id for ScreenObjects
	 */
	function getId() {
		id++;
		return id;
	}

	/** 
	 * @method isNumber
	 * @description confirm an object is a number
	 * @param {Object} obj the object to test
	 * @returns {Boolean} if a number, return true, else false
	 */
	function isNumber (obj) { 
		return !isNaN(parseFloat(obj))
	}

	/** 
	 * @method isString
	 * @description confirm an object is a string
	 * @param {Object} object to test
	 * @returns {Boolean} if a string, return true, else false
	 */
	function isString (obj) {
		return ("String" === Object.prototype.toString.call(obj).slice(8, -1));
	}

	function isFunction (obj) {
		return ("Function" === Object.prototype.toString.call(obj).slice(8, -1));
	}

	/** 
	 * @method isRGB
	 * @description confirm a string is valid rgb or #rrggbb or #rgb color
	 * @link http://www.mkyong.com/regular-expressions/how-to-validate-hex-color-code-with-regular-expression/
	 * @param {String} str the color string
	 * @returns {Boolean} if valid color, return true, else false
	 */
	function isRGB (str) {
		var rgb = str.match(/\d+/g);
		if(rgb && rgb.length && isNumber(rgb[0]) && isNumber(rgb[1]) && isNumber(rgb[2])) {
			return true;
		}
		//check for hex (3 or six digits)
		var hex = str.match(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/);
		if(hex) {
			return true;
		}
		elefart.showError("invalid RGB string:" + str);
		return false;
	}

	/** 
	 * @method clone
	 * @description clone a JS object, requires JSON
	 * @param {Object} incoming object
	 * @returns {Object} the copied object
	 */
	function clone(obj) {
		return (JSON.parse(JSON.stringify(obj)));
	}

	/*
	 * @method mergeRecursive
	 * @description Recursively merge properties of two objects 
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
	 * GEOMETRY PRIMITIVES, ScreenObjects
	 * ============================
	 */

	/**
	 * @constructor Point
	 * @classdesc ScreenObject.type POINT. creates a Point object from x and y coordinates 
	 * (unlike Rect, which uses top, right, bottom, left). Does not 
	 * support child objects.
	 * @returns {Point} a Point object
	 */
	function Point (x, y) {
		if(!isNumber(x) || !isNumber(y)) {
			elefart.showError(this.type + " not defined, x:" + x + " y:" + y);
			return false;
		}
		return {
			type:TYPES.POINT,
			id:getId(), //unique
			x:x,
			y:y,
			valid: function () { 
				if(!isNumber(this.x) || !isNumber(this.y)) 
					return false;
				else 
					return true;
			}
			//points can't have parents or children
		};
	}

	/** 
	 * @constructor Line
	 * @classdesc ScreenObject type LINE. Creates a Line object from two Points. Does not 
	 * support child objects or padding.
	 * @returns {Line} a Line object
	 */
	function Line (pt1, pt2) {
		if(pt1 === undefined || pt2 === undefined || 
			!isNumber(pt1.x) || !isNumber(pt1.y) || 
			!isNumber(pt2.x) || !isNumber(pt2.y)) {
			elefart.showError(this.type + " invalid points, pt1:" + typeof pt1 + " pt2:" + typeof pt2);
			return false;
		}
		return {
			type:TYPES.LINE,
			id:getId(),
			point1:pt1,
			point2:pt2,
			width:0,
			valid: function () {
				if(!pt1 || !pt2 || 
					!isNumber(pt1.x) || !isNumber(pt2.y) || 
					!isNumber(pt2.x) || !isNumber(pt2.y))
						return false;
					else 
						return true;
			}
		};
	}

	/** 
	 * @constructor Padding
	 * @classdesc ScreenObject.type PADDING. Like a Rect, but without width and height. 
	 * Use to set padding on objects which support padding, e.g. Rect. encoded with TRBL
	 */
	function Padding(top, right, bottom, left) {
		if(!isNumber(top) || !isNumber(right) || !isNumber(bottom) || !isNumber(left) || 
			bottom + top > this.height || 
			right + left > this.width) {
			elefart.showError(this.type + " invalid: top:"+ top + " left:" + left + " bottom:" + bottom + " right:" + right);
			return false;
		}
		return {
			type:TYPES.PADDING,
			id:getId(),
			top:top,
			left:left,
			bottom:bottom,
			right:right,
			valid: function () {
				if(!isNumber(this.top) || !isNumber(this.right) || 
					!isNumber(this.bottom) || !isNumber(this.left)) 
						return false;
					else
						return true;
			}
		};
	}

	/** 
	 * @constructor Rect
	 * @classdesc ScreenObject.type RECT. Similar to DOMRect, but only 
	 * containing information needed to draw on 2D Canvas. 
	 * Allows for border, padding and a constant borderRadius. 
	 * the actual Canvas drawing routine uses Rect, or a set of 
	 * arcs (borderRadius > 0)

	 * @returns {Rect} a Rect object
	 */
	function Rect (x, y, width, height) {
		if(!isNumber(x) || !isNumber(y) || !isNumber(width) || 
			!isNumber(height) || width < 0 || y < 0) {
			elefart.showError(this.type + " invalid dimensions x:" + x + " y:" + y + " w:" + width + " h:" + height)
			return false;
		}
		return {
			type:TYPES.RECT,
			id:getId(),
			top:y,
			right: x + width,
			bottom: y + height,
			left:x,
			width:width,
			height:height,
			opacity:1.0,
			borderRadius:0,
			paddingRect:{top:0, left:0, bottom:0, right:0, width:0, height:0},
			img:null, //IMAGE IN OBJECT
			parent:null,
			children:[],
			valid: function () {
				if(!isNumber(this.top) || !isNumber(this.left) || 
					!isNumber(this.bottom) || !isNumber(this.right) || 
					this.width != (this.right - this.left) || 
					this.height != (this.bottom - this.top)) 
						return false;
					else
						return true;
			}

		};
	}

	/** 
	 * @constructor Circle
	 * 
	 * @classdesc ScreenObject.type CIRCLE. Contains an enclosing Rect object, plus 
	 * a radius. Supports child objects.
	 * @returns {Circle} a Circle object
	 */
	function Circle (x, y, radius) {
		if(!isNumber(x) || !isNumber(y) || 
			!isNumber(radius) || radius < 0) {
			elefart.showError(this.type + " invalid dmensions x:" + x + " y:" + y + " radius:" + radius);
			return false;
		}
		var d = 2 * radius;
		return {
			type:TYPES.CIRCLE,
			id:getId(),
			top:y,
			right:x + d,
			bottom:y + d,
			left:x,
			width:d,
			height:d,
			radius:radius,
			opacity:1.0,
			borderRadius:radius,
			paddingRadius:0,
			img:null,
			parent:null,
			children:[],
			valid: function () {
				if(!isNumber(this.x) || !isNumber(this.y) || !isNumber(this.radius) || 
					this.width != radius * 2 || this.height != radius * 2) 
						return true;
					else
						return false;
			}
		};
	}

	/** 
	 * @constructor Polygon
	 * @classdesc ScreenObject.type POLYGON. Polygons contain an enclosing Rect object, plus 
	 * an array of Points defining a shape. Supports child objects. uses the getEnclosingRect 
	 * function in elefart.factory (not used by other objects).
	 * @returns {Polygon} a Polygon object
	 */
	function Polygon (pts) {
		if(pts === undefined || !pts.length) {
			elefart.showError(this.type + " invalid points:" + pts);
			return false;
		}
		for(var i = 0; i < pts.length; i++) {
			if(!pts[i].valid.apply(pts[i],[])) {
				return false;
			}
		}
		var p = {
			type:TYPES.POLYGON,
			id:getId(),
			top:0,
			right:0,
			bottom:0,
			left:0,
			width:0,
			height:0,
			points:clone(pts),
			opacity:1.0,
			img:null,
			parent:null,
			children:[],
			enclosingRect:enclosingRect,
			valid: function () {
				enclosingRect.apply(this,[]);
				var pts = this.points
				for(var i = 0; i < pts.length; i++) {
					if(!isNumber(pts[i].x) || !isNumber(pts[i].y)) {
						return false;
					}
				}
				return true;
			}
		};
		p.enclosingRect();
		return p;
	}

	/** 
	 * @method getEnclosingRect
	 * @description type POLYGON specific. Find the rect which encloses the set of points
	 * @param {Array} pts an array of x, y points
	 * @returns {Rect} 
	 */
	function enclosingRect () {
		if(this.type === TYPES.POINT) {
			console.log("Warning: returning tiny Rect enclosing a Point");
			return Rect(this.x,this.y,1,1);
		}
		else if(this.type === TYPES.LINE) {
			if(this.pt2.y > this.pt1.y) {
				return Rect(this.pt1.x, this.pt1.y, this.pt2.x - this.pt1.x, this.pt2.y - this.pt1.y);
			}
			else {
				return Rect(this.pt2.x, this.pt2.y, this.pt1.x - this.pt2.x, this.pt1.y - this.pt2.y);
			}
		}
		else if(this.type === TYPES.POLYGON) {
			//test and generate the rect at the same time
			var pts = this.points;
			if(pts.length) {
				this.top = this.bottom = pts[0].y;
				this.left = this.right = pts[0].x;
				for (var i = 0; i < pts.length; i++) {
					if(pts[i].x < this.left) this.left = pts[i].x;
					if(pts[i].y < this.top) this.top = pts[i].y;
					if(pts[i].x > this.right) this.right = pts[i].x;
					if(pts[i].y > this.bottom) this.bottom = pts[i].y;
				}
			}
		}
		this.width = this.right - this.left;
		this.height = this.bottom - this.top;
		return Rect(this.left, this.top, this.right, this.bottom);
	}


	/* 
	 * ============================
	 * OBJECT COLLISION TESTS
	 * ============================
	 */

	/** 
	 * @method ptInside
	 * @description non "this" test for Point inside Rect, use when 
	 * "this" would cause problems in scope
	 * @param {Point} pt the Point
	 * @param {Rect} rect the Rect
	 * @returns {Boolean} if Point inside Rect, return true, else false
	 */
	function ptInside(pt, rect) {
		if(pt.x >= this.left && 
			pt.x <= this.right && 
			pt.y >= this.top &&
			pt.y <= this.bottom) {
			return true;
		}
	}

	/** 
	 * @method pointInside
	 * @description determine if a point is inside or outside Rect
	 * @param {Point} pt the point to test
	 * @returns {Boolean} if not in rect, false, else true
	 */
	function pointInside (pt) {
		if(this.type === TYPES.POINT || this.type === TYPES.LINE) {
			elefart.showError("point cannot be inside POINT or LINE objects");
			return false;
		} 
		//everything else has a Rect in it
		if(this.top === undefined) {
			elefart.showError(this.type + " can't determine if Point is inside");
			return false;
		}
		if(pt.x >= this.left && 
			pt.x <= this.right && 
			pt.y >= this.top &&
			pt.y <= this.bottom) {
			return true;
		}
		return false;
	}

	/** 
	 * @method rectInRect
	 * @description determine if this object is completely inside rect2
	 * @param {Rect} rect the outer rect
	 * @returns {Boolean}  if inside, return true, else false
	 */
	function insideRect (rect) {
		if(this.type === TYPES.POINT) {
			return ptInside(this, rect);
		}
		else if(this.type === TYPES.LINE) {
			return (ptInside(this.pt1, rect) && ptInside(this.pt2, rect));
		}
		//everything else has a Rect in it
		if(this.top === undefined) {
			elefart.showError(this.type + " can't determine if it is inside Rect");
			return false;
		}
		if(this.top >= rect.top && 
			this.left >= rect.left && 
			this.bottom <= rect.bottom && 
			this.right <= rect.right) {
			return true;
		}
		return false;
	}

	/** 
	 * @method intersectRect
	 * @description determine if an object intersets a Rect at all
	 * MUCH SIMPLER than generalized collision detection
	 * @link http://gamedevelopment.tutsplus.com/tutorials/collision-detection-using-the-separating-axis-theorem--gamedev-169
	 * @returns {Rect} if intersect, return a Rect with the collision sides 
	 * listed with a 1, non-colliding sides = 0
	 * @returns {Boolean} if collided, return true, else false
	 */
	function intersectRect (rect) {
		if(this.type === TYPES.POINT) {
			return ptInside(this, rect);
		}
		else if(this.type === TYPES.LINE) {
			return (ptInside(this.pt1, rect) && ptInside(this.pt2, rect));
		}
		if(this.top === undefined) {
			elefart.showError(this.type + " can't get its intersect");
			return false;
		}
		return (this.left <= rect.right &&
			rect.left <= this.right &&
			this.top <= rect.bottom &&
			rect.top <= this.bottom);
	}

	/** 
	 * @method getCenter
	 * @description get the center of an ScreenObject
	 * @returns {Point|false} the center point, or false
	 */
	function getCenter () {
		if(this.type === TYPES.POINT) {
			return this;
		}
		else if(this.type === TYPES.LINE) {
			if(pt2.x >= pt1.x) {
				return {
					x: this.pt1.x + Math.floor((this.pt2.x - this.pt1.x)/2),
					y: this.pt1.y + Math.floor((this.pt2.y - this.pt1.y)/2)
				}
			}
			else {
				return {
					x: this.pt2.x + Math.floor((this.pt1.x - this.pt2.x)/2),
					y: this.pt2.y + Math.floor((this.pt1.y - this.pt2.y)/2)
				}
			}
		}
		//everything else has a Rect, so find center x, y for a rect
		if(this.top === undefined) {
			elefart.showError(this.type + " can't get its center");
			return false;
		}
		return {
			x: this.left + Math.floor((this.right - this.left)/2),
			y: this.top + Math.floor((this.bottom - this.top)/2)
		}
	}

	/* 
	 * ============================
	 * OBJECT MOVEMENT AND TRANSFORMS
	 * ============================
	 */

	/** 
	 * @method move
	 * @description move an object, optionally move children
	 * @param {Number} dx change in x position
	 * @param {Number} dy change in y position
	 * @param {Boolean} recurse if true, move children the same distance
	 * @returns {Boolean} if moved, return true, else false
	 */
	function move (dx, dy, recurse) {
		if(dx === undefined || dy === undefined) {
			elefart.showError(this.type + " invalid move, x:" + dx + " y:" + dy);
			return false;
		}
		if(this.type === TYPES.POINT) {
			this.x += dx;
			this.y += dy; 
		}
		else if(this.type === TYPES.LINE) {
			this.pt1.x += dx; this.pt2.x += dx;
			this.pt1.y += dy; this.pt2.y += dy;
		}
		else if(this.type === TYPES.POLYGON) {
			for(var i = 0; i < this.pts.length; i++) {
				this.pts[i].x += dx; this.pts[i].y += dy;
			}
		}
		//Rect and Circle and Polygon
		this.left += dx; this.right  += dx;
		this.top  += dy; this.bottom += dy;
		//update children
		if(recurse && this.children) {
			for(var i = 0; i < this.children.length; i++) {
				var child = this.children[i];
				child.move.apply(this, [dx, dy, recurse]);
			}
		}
		return true;
	}

	/** 
	 * @method moveTo
	 * @description move an object to a specific coordinate
	 * @param {Number} x new x position
	 * @param {Number} y new y position
	 * @param {Boolean} recurse if true, move children the same distance
	 * @returns {Boolean} if moved, return true, else false
	 */ 
	function moveTo(x, y, recurse) {
		var dx, dy;
		if(x === undefined || y === undefined) {
			elefart.showError(this.type + " invalid moveTo, x:" + x + " y:" + y);
			return false;
		}
		if(this.type === TYPES.POINT) {
			dx = x - this.x;
			dy = y - this.y;
		}
		else if(this.type === TYPES.LINE) {
			dx = x - this.pt1.x;
			dy = y = this.pt1.y;
		}
		else { //all others have Rect
			dx = x - this.left;
			dy = y - this.top;
			move.apply(this, [dx, dy, recurse]);
		}
		return true;
	}

	/** 
	 * @method rectCenterOnPoint
	 * @description center a Rect on a Point
	 * @param {Point} centerPt the point to use
	 * @param {Boolean} recurse if true, center children as well, 
	 * otherwise just move the chidren with their newly centered parent
	 * @returns {Boolean} of set. return true, else false
	 */
	function centerOnPoint (centerPt, recurse) {
		var dx, dy;
		if(!centerPt.valid.apply(centerPt,[])) {
			return false;
		}
		if(this.type === TYPES.PADDING) {
			elefart.showError(this.type + " cannot be centered on a TYPES.POINT");
			return false;
		}
		if(this.type === TYPES.POINT) {
			this.x = centerPt.x;
			this.y = centerPt.y;
		}
		else if(this.type === TYPES.LINE) {
			dx = centerPt.x - Math.min((this.pt2.x - this.pt1.x)/2);
			dy = centerPt.y - Math.min((this.pt2.y - this. pt1.y)/2);
			this.pt1.x += dx; this.pt2.x += dx;
			this.pt1.y += dy; this.pt2.y += dy;
		}
		else {
			dx = centerPt.x - Math.min(this.width/2);
			dy = centerPt.y - Math.min(this.height/2);
			moveTo.apply(this, [dx, dy, recurse]);
		}
		return true;
	}

	/** 
	 * @method centerRectInRect
	 * @description center a rect so it is inside, or surrounds an other Rect
	 * @param {Rect} centerRect the Rect to center the first rect onto
	 * @returns {Boolean} if set, return true, else false
	 */
	function centerInRect (centerRect, recurse) {
		if(this.type == TYPES.POINT || this.type === TYPES.LINE || this.type === TYPES.PADDING) {
			elefart.showError(this.type + " cannot be centered in RECT");
			return false;
		}
		var c = getCenter.apply(centerRect);
		var x = c.x - Math.min(this.width/2);
		var y = c.y - Math.min(this.height/2);
		moveTo.apply(this, [x, y, recurse]);
		return true;
	}

	/** 
	 * @method setDimensions
	 * @description set width and height of a ScreenObject. Internal variables are NOT private, 
	 * but should be set using setters attached to ScreenObject
	 * @param {Number} width new width
	 * @param {Number} height new height
	 * @returns {Boolean} if set, return true, else false
	 */
	function setDimensions (width, height) {
		if(this.type === TYPES.POINT || this.type === TYPES.LINE || this.type === TYPES.PADDING) {
			elefart.showError(this.type + " cannot set dimensions");
			return false;
		}
		var dw =  width - this.width;
		var dh =  height - this.height;
		this.width = width;
		this.height = height;
		this.right += dw;
		this.bottom += dh;
		return true;
	}

	/** 
	 * @method setBorderRadius
	 * @description set rounded Rect, in current version all cornder has the 
	 * same rounding
	 * @param {Number} borderRadius the border radious
	 */
	function setRectBorderRadius(borderRadius) {
		if(this.type !== TYPES.RECT) {
			elefart.showError(this.type + " does not have border radius");
		}
		//if borderRadius = width = height we have a Circle
		if(borderRadius > this.width || borderRadius > this.height) {
			elefart.showError("invalid border radius dimensions:" + borderRadius);
			return false;
		}
		this.borderRadius = borderRadius;
	}

	/** 
	 * @method setRectPadding
	 * @description set the padding on a Rect, moving any child objects, but not 
	 * resizing. This means that objects may overhang their container.
	 * @param {Padding} padding the padding object, with padding for 
	 * top, right, bottom, left
	 * @returns {Boolean} if set, return true, else false
	 */
	function setRectPadding (padding) {
		if(this.type === TYPES.POINT || this.type === TYPES.PADDING || this.type === TYPES.LINE) {
			elefart.showError(this.type + " padding not allowed");
			return false;
		}
		//check if valid padding
		if((padding.left + padding.right) > this.width || 
			(padding.top + padding.bottom) > this.height) {
			elefart.showError(this.type + " padding exceeds width and height of its Rect");
		}
		//set padding
		this.paddingRect.top = padding.top;
		this.paddingRect.left = padding.left;
		this.paddingRect.bottom = padding.bottom;
		this.paddingRect.right = padding.right;

		var x, y;
		if(this.type === TYPES.POINT) {
			x = this.x + this.paddingRect.left, y = this.y + this.paddingRect.top;
		}
		else if(this.type === TYPES.LINE) {
			x = this.pt1.x + this.paddingRect.left, y = this.pt1.y + this.paddingRect.top;
		}
		else if(this.type === TYPES.RECT) {
			x = this.top + this.paddingRect.top, y = this.left + this.paddingRect.left;
		}
		else if(this.type === TYPES.CIRCLE) {
			elefart.showError("can't set padding for CIRCLE");
		}
		else if(this.type === TYPES.POLYGON) {
			elefart.showError("can't set padding for POLYGON");
		}

		/* 
		 * We set top and left padding, and then adjust bottom 
		 * and right, which may result in an overhang. If an object
		 * is "floating" inside any padding, we leave it alone
		 */
		if(this.children) {
			for(var i = 0; i < this.children.length; i++) {
				move.apply(this.children[i], [x, y]);
			}
		}
		return true;
	}

	/** 
	 * @method scale
	 * @description scale an ScreenObject's size, while keeping integer values
	 * @param {Number} scale the scale value. 1.0 = no change
	 * @param {Boolean} recurse if true, scale child objects
	 * @returns {Boolean} if set, return true, else false
	 */
	function scale (scale, recurse) {
		if(!isNumber(scale) || scale < 0) {
			elefart.showError(this.type + " invalid scale:" + scale);
			return false;
		}
		if(this.type === TYPES.POINT) {
			//nothing, Points don't scale
		}
		else if(this.type === TYPES.LINE) {
			var dx = scale * (this.pt2.x - this.pt1.x);
			var dy = scale * (this.pt2.y - this.pt1.y);
			this.pt2.x = this.pt1.x + dx;
			this.pt2.y = this.pt1.y + dy;
		}
		else {
			this.right = this.left + Math.min(this.width * scale);
			this.bottom = this.top + Math.min(this.height * scale);
			this.width = this.right - this.left;
			this.height = this.bottom - this.top;
		}
		if(recurse) {
			for(var i = 0; i < this.children.length; i++) {
				var child = obj.children[i];
				child.scale(child, scale, recurse);
			}
		}
		return true;
	}

	/* 
	 * ============================
	 * OBJECT CREATION AND DELETION
	 * ============================
	 */

	/** 
	 * @method addChild
	 * @description add a child ScreenObject to an Object
	 * @param {Object} a child object, either Point, Line, 
	 * Rect, Circle, Polygon
	 */
	function addChild(child) {
		if(this.children) {
			if(child === undefined || !child.type === undefined || 
				child.type === TYPES.PADDING) {
				elefart.showError(child.type + " cannot add as child");
				return false;
			}
			//don't let child be added twice
			for(var i = 0; i < this.children.length; i++) {
				if(child === this.children[i]) {
					elefart.showError("addChild, tried to add child that is already present in this object" + child);
					return false;
				}
			}
			//add to array
			this.children.push(child);
			return true;
		}
		elefart.showError(child.type + " cannot have children");
		return false;
	}

	/** 
	 * @method findChild
	 * @description find a ScreenObject child by its id
	 * @param {Number} childId the id of the object
	 * @returns {Object|false} if OK, return an object, else false
	 */
	function findChild(childId) {
		if(this.children) {
			if(childId === undefined || !isNumber(childId)) {
				elefart.showError("findChild, invalid childId:" + childId);
				return false;
			}
			for(var i = 0; i < this.children.length; i++) {
				if(this.children[i].id === childId) {
					return this.children[i];
				}
			}
		}
		elefart.showError(this.type + " cannot add children");
		return false;
	}

	/** 
	 * @method removeChild
	 * @description remove a child ScreenObject by its id
	 * @param {Number} childId the id of the object
	 * @returns {Object|false} if ok, return the removed child, else false
	 */
	function removeChild(childId) {
		if(this.children) {
			if(childId === undefined || !isNumber(childId)) {
				elefart.showError("removeChild, invalid childId:" + childId);
				return false;
			}
			for(var i = 0; i < this.children.length; i++) {
				var child = this.children[i];
				if(this.children[i].id === childId) {
					return this.children.splice(i, 1)[0]; //return child outside array .splice() array
				}
			}
		}
		elefart.showError(this.type + " cannot add children");
		return false;
	}

	/** 
	 * @method setFilter
	 * @description set a filter on an ScreenObject image, if it exists
	 * @param {Function} filter the filtering function (expects pixel data)
	 */
	function setFilter (filter) {
		if(!this.img) {
			elefart.showError(this.type + " warning, filter added, but no image present");
			return false;
		}
		if(!isFunction(filter)) {
			elefart.showError("supplied filter is not a Function:" + filter);
		}
		this.filter = filter;
	}

	/** 
	 * @method setGradient
	 * @description set an HTML5 canvas gradient object for a ScreenObject
	 * @param {CanvasGradient} grad gradient from canvas.getContext()
	 */
	function setGradient(grad) {
		if(!grad) {
			elefart.showError("null gradient applied to object");
			return false;
		}
		this.gradient = grad;
	}

	/** 
	 * @method setOpacity
	 * @description set the opacity of a ScreenObject
	 * @param {Number} opacity the opacity of the object
	 */
	function setOpacity(opacity) {
		if(!isNumber(opacity || opacity < 0.0 || opacity > 1.0)) {
			elefart.showError("invalid opacity:" + opacity);
		}
		this.opacity = opacity;
	}

	/** 
	 * @method setStroke
	 * @description set the stroke around an ScreenObject
	 * @param {Number} width the width of the stroke in pixels
	 * @param {String} rgb() or #rrggbb or #rgb color string
	 */
	function setStroke(width, color) {
		if(this.type === TYPES.POINT || this.type === TYPES.PADDING) {
			elefart.showError(this.type + " can't apply a width or color");
			return false;
		}
		if(width < 0) {
			elefart.showError(this.type + " invalid stroke");
			return false;
		}
		if(!isRGB(color)) {
			elefart.showError("invalid color string:" + color);
			return false;
		}
		this.borderWidth = width;
		this.borderColor = color;
	}

	/** 
	 * @method setFill
	 * @description set the fill color for a ScreenObject
	 * @param {String} color the rgb() or #rrggbb or #rgb color
	 */
	function setFill(color) {
		if(!isRGB(color)) {
			elefart.showError("invalid RGB color");
			return false;
		}
		this.fillColor = color;
	}

	/* 
	 * ============================
	 * SCREEN OBJECTS WITH IMAGES
	 * ============================
	 */

	/** 
	 * @method setImage
	 * @description replace background fill with image pixels in a Screen Object. 
	 * Includes a callback for images that are dynamically loaded
	 * @param {String} src the file path to the image
	 * @param {Function} callback function after the image is loaded
	 */
	function setImage(src, callback) {
		var that = this;
		that.img = new Image();

		that.img.onload = function () {
			//shrink image to size of object
			this.width = that.width;
			this.height = that.height;
			callback(that); //callback function passed image
		}

		that.img.oneror = function () {
			elefart.showError("image " + src + "failed to load");
		}

		//start loading the image
		that.img.src = src;
	}

	/* 
	 * ============================
	 * LAYERS
	 * ============================
	 */

	/** 
	 * @method setLayer
	 * @description set the layer in which the ScreenObject is 
	 * drawn by elefart.display
	 * @param {Number} layer the layer to draw in. Layers are 
	 * defined in elefart.display.LAYERS
	 */
	function setLayer(layer) {
		//get length of current layers from elefart.display
		var len = 0;
		for(var i in display.LAYERS) {
			len++;
		}
		if(layer < 0 || layer >= len) {
			elefart.showError("invalid layer index:" + layer);
			return false;
		}
		this.layer = layer;
	}

	/** 
	 * @method addFns
	 * @description add common methods to a ScreenObject. 
	 * Methods are typically called as from the object, rather than
	 * globally from this library, which keeps 'this' working correctly. 
	 * Use the JS .apply for methods calling each other in the object context
	 * @param {Object} program object
	 */
	function addFns (obj) {
		obj.pointInside = pointInside,
		obj.insideRect = insideRect,
		obj.intersectRect = intersectRect,
		obj.getCenter = getCenter,
		obj.move = move,
		obj.moveTo = moveTo,
		obj.centerOnPoint = centerOnPoint,
		obj.centerInRect = centerInRect,
		obj.setDimensions = setDimensions,
		obj.setRectBorderRadius = setRectBorderRadius,
		obj.setRectPadding = setRectPadding,
		obj.scale = scale,

		obj.findChild = findChild,
		obj.addChild = addChild,
		obj.removeChild = removeChild,

		obj.setFilter = setFilter,
		obj.setGradient = setGradient,
		obj.setOpacity = setOpacity,
		obj.setStroke = setStroke,
		obj.setFill = setFill,
		obj.setImage = setImage,
		obj.setLayer = setLayer;
		return obj;
	}

	/* 
	 * ============================
	 * CANVAS SHAPES
	 * ============================
	 */

	/** 
	 * @constructor ScreenRect
	 * @implements {Rect}
	 * @classdesc create a ScreenRect object.
	 * @param {Number} x the x coordinate of the object
	 * @param {Number} y the y coordinate of the object
	 * @param {Number} width the width of the Rect
	 * @param {Number} height the height of the Rect
	 * @param {Number} strokeWidth the width of the stroke around the ScreenRect
	 * @param {String} strokeColor the color (rgb or hex) for the stroke, written as 
	 * a string, e.g. 'rgb(4,3,3)' or #ddccdd.
	 * @param {String} fillColor the color (rgb or hex) for the stroke, written as 
	 * a string, e.g. 'rgb(4,3,3)' or #ddccdd.
	 * @param {Number} layer the layer for elefart.display to draw the object into.
	 */
	function ScreenRect (x, y, width, height, strokeWidth, strokeColor, fillColor, layer) {
		var r = Rect(x, y, width, height);
		addFns(r);
		r.setLayer(layer);
		return r;
	}

	/** 
	 * @constructor ScreenCircle
	 * @implements {Circle}
	 * @classdesc create a screen circle.
	 * @param {Number} x the x coordinate of the object
	 * @param {Number} y the y coordinate of the object
	 * @param {Number} width the width of the Rect
	 * @param {Number} height the height of the Rect
	 * @param {Number} strokeWidth the width of the stroke around the ScreenRect
	 * @param {String} strokeColor the color (rgb or hex) for the stroke, written as 
	 * a string, e.g. 'rgb(4,3,3)' or #ddccdd.
	 * @param {String} fillColor the color (rgb or hex) for the stroke, written as 
	 * a string, e.g. 'rgb(4,3,3)' or #ddccdd.
	 * @param {Number} layer the layer for elefart.display to draw the object into.
	 */
	function ScreenCircle (x, y, radius, strokeWidth, strokeColor, fillColor, layer) {
		var c = Circle(x, y, radius);
		addFns(c);
		c.setLayer(layer);
		return c;
	}

	/** 
	 * @method ScreenPoly
	 * @implements {Polygon}
	 * @classdesc create a screen Polygon
	 * @param {Array} a set of Point objects with x and y coordinates for the 
	 * sides of the Polygon.
	 * @param {Number} strokeWidth the width of the stroke around the ScreenRect
	 * @param {String} strokeColor the color (rgb or hex) for the stroke, written as 
	 * a string, e.g. 'rgb(4,3,3)' or #ddccdd.
	 * @param {String} fillColor the color (rgb or hex) for the stroke, written as 
	 * a string, e.g. 'rgb(4,3,3)' or #ddccdd.
	 * @param {Number} layer the layer for elefart.display to draw the object into.
	 */
	function ScreenPoly(pts, layer, strokeWidth, strokeColor, fillColor, layer) {
		var p = Polygon(pts);
		addFns(r);
		p.setLayer(layer);
		return p;
	}

	/** 
	 * @constructor ScreenImage
	 * @implements {Rect}
	 * @classdesc create a ScreenObject that is a 'naked' image, without visible 
	 * border or fill.
	 * @param {Number} x the x coordinate of the object
	 * @param {Number} y the y coordinate of the object
	 * @param {String} src the path to the image file used
	 * @param {Number} layer the layer for elefart.display to draw the object into.
	 */
	function ScreenImage(x, y, src, callback, layer) {
		var r = Rect(x, y, 0, 0); //zero until image loaded
		r.setLayer(layer);
		r.setImage(src, callback);
		return r;
	}

	/** 
	 * @method ScreenSprite
	 * @implements {Rect}
	 * @classdesc create a sprite table from supplied image file
	 * @param {String} src the path to the image file used
	 * @param {Number} the 'type', which is actually the row in 
	 * the SpriteBoard image where the frames of the sprite are stored
	 * @param {Number} the 'frames', where are the individual
	 * columns in the Spriteboard image where frames of animation are 
	 * stored.
	 * @param {Function} callback the callback function to call after 
	 * loading a SpriteBoard image
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
	 * @method init factory
	 * @description initialize the display object used 
	 * by the game to draw to HTML5 canvas.
	 */
	function init () {
		display = elefart.display;
		firstTime = false;
	}

	/** 
	 * @method run factory
	 * @description begin drawing the active game, drawing 
	 * current state into HTML5 canvas
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
		Padding:Padding,
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