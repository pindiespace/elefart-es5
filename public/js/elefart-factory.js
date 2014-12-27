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
	 * @description basic geometry shapes used to create screen objects
	 */
	var TYPES = {
		POINT:"POINT",
		LINE:"LINE",
		PADDING:"PADDING",
		RECT:"RECT",
		CIRCLE:"CIRCLE",
		POLYGON:"POLYGON",
		IMAGE:"IMAGE",
		SPRITE:"SPRITE"
	};


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
	 * @method toInt
	 * @description convert a Number to an integer
	 * @link http://stackoverflow.com/questions/596467/how-do-i-convert-a-number-to-an-integer-in-javascript
	 * @param {Number} num
	 * @returns {Integer} number with float removed
	 */
	function toInt(num) {
		num = Math.floor(num);
		return ~~num; 
	}

	/** 
	 * @method isNumber
	 * @description confirm an object is a Mumber
	 * @param {Object} obj the object to test
	 * @returns {Boolean} if a number, return true, else false
	 */
	function isNumber (obj) { 
		return !isNaN(parseFloat(obj))
	}

	/** 
	 * @method isString
	 * @description confirm an object is a String
	 * @param {Object} object to test
	 * @returns {Boolean} if a string, return true, else false
	 */
	function isString (obj) {
		return ("String" === Object.prototype.toString.call(obj).slice(8, -1));
	}

	function isArray (obj) {
		return ("Array" === Object.prototype.toString.call(obj).slice(8, -1));
	}

	/** 
	 * @method isFunction
	 * @description confirm an object is a Function
	 * @param {Object} object to test
	 * @returns {Boolean} if an Function, return true, else false
	 */
	function isFunction (obj) {
		return ("Function" === Object.prototype.toString.call(obj).slice(8, -1));
	}

	/** 
	 * @method isObject
	 * @description confirm an object is an objet, but not a JS primitive object 
	 * like String, Number, Function
	 * @param {Object} object to test
	 * @returns {Boolean} if an Object and not a JS primitive, return true, else false
	 */
	function isCanvasGradient (obj) {
		return ("CanvasGradient" === Object.prototype.toString.call(obj).slice(8, -1));
	}

	/** 
	 * @method getRGB
	 * @description get the RGB values form an RGB or #rrggbb or #rgb color
	 * @param {String} the RGB string
	 * @returns {Array|false} an array with the r = array[0], g = array[1], b = array[2], 
	 * or false if the string can't be parsed
	 */
	function getRGB(str) {
		//RGB string
		var rgb = str.match(/\d+/g);
		if(rgb && rgb.length && isNumber(rgb[0]) && isNumber(rgb[1]) && isNumber(rgb[2])) {
			return rgb;
		} else { //HEX string
			var expand = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
			str = str.replace(expand, function(m, r, g, b) {
				return r + r + g + g + b + b;
 			});
			var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(str);
			if(result) {
				return [
					parseInt(result[1], 16),
					parseInt(result[2], 16),
					parseInt(result[3], 16)
				]
			}
		}
		return false;
	}

	/** 
	 * @method getRGBAFromRGB
	 * @description, create a CSS and HTML5 Canvas-compatible rgba() 
	 * string, using either an array with RGB values, or an existing
	 * rgb() string
	 * @param {String|Array} rgb either an Array with r, g, b values, or 
	 * an rgb()
	 * @param {Number} opacity the opacity to set the string at
	 * @returns {String} an rgba() string with the opacity
	 */
	function getRGBAFromRGB(rgb, opacity) {
		if(rgb === undefined) {
			elefart.showError("missing rgb value to convert to rgba:" + rgb);
		}
		if(opacity === undefined || opacity < 0.0 || opacity > 1.0) {
			elefart.showError("incorrect opacity for creating rgba:" + opacity);
			return false;
		}
		if(!isArray(rgb)) { //not already an array
			rgb = getRGB(rgb);
		}
		return "rgba(" + rgb[0] + "," + rgb[1] + "," + rgb[2] + "," + opacity + ")";
	}

	/** 
	 * @method isRGB
	 * @description confirm a string is valid rgb or #rrggbb or #rgb color, or 
	 * an HTML5 CanvasContext gradient.
	 * @link http://www.mkyong.com/regular-expressions/how-to-validate-hex-color-code-with-regular-expression/
	 * @param {String} str the color string
	 * @returns {Boolean} if valid color, return true, else false
	 */
	function isRGB (str) {
		if(isCanvasGradient(str)) { //CanvasGradient
			return true;
		}
		else if(isString(str)) { //rgb or hex color string
			if(getRGB(str)) return true;
		}
		elefart.showError("invalid RGB string or gradient object:" + str);
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

	/** 
	 * @method readout
	 * @descript read out object properties to the Console. Used fore debugging.
	 * @param {Object} the JS object
	 */
	function readout (obj) {
		var val;
		for(var i in obj) {
			if(typeof obj[i] !== "function") {
				val = obj[i];
			}
			else {
				val = "function";
			}
			console.log("key:" + i + " value:" + val);
		}
	}

	/* 
	 * ============================
	 * GEOMETRY PRIMITIVES
	 * ============================
	 */

	/* 
	 * Factory objects are variable enough that we don't 
	 * inherit a base object for all
	 */

	/**
	 * @constructor Point
	 * @classdesc ScreenObject.type POINT. creates a Point object from x and y coordinates 
	 * (unlike Rect, which uses top, right, bottom, left). Does not 
	 * support child objects.
	 * @param {Number} x the x coordinate of the Point
	 * @param {Number} y the y coordinate of the Point
	 * @returns {Point} a Point object
	 */
	function Point (x, y) {
		if(!isNumber(x) || !isNumber(y)) {
			elefart.showError(this.type + " in Point, not defined, x:" + x + " y:" + y);
			return false;
		}
		return {
			type:TYPES.POINT,
			id:getId(), //unique
			x:toInt(x),
			y:toInt(y),
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
	 * support child objects or padding.{
	 * @param {Point} pt1 a Point object defining the start of the line
	 * @param {Point} pt2 a point object defining the end of the line
	 * @returns {Line} a Line object
	 */
	function Line (pt1, pt2) {
		if(pt1 === undefined || pt2 === undefined || 
			!isNumber(pt1.x) || !isNumber(pt1.y) || 
			!isNumber(pt2.x) || !isNumber(pt2.y)) {
			elefart.showError(this.type + " in Line, invalid points, pt1:" + typeof pt1 + " pt2:" + typeof pt2);
			return false;
		}
		pt1.x = toInt(pt1.x);pt2.x = toInt(pt2.x);
		pt1.y = toInt(pt1.y);pt2.y = toInt(pt2.y);
		return {
			type:TYPES.LINE,
			id:getId(),
			pt1:pt1,
			pt2:pt2,
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
	 * @param {Number} top the top padding
	 * @param {Number} right the right-hand padding
	 * @param {Number} bottom the bottom padding
	 * @param {Number} left the left-hand padding
	 * @returns {Padding} a Padding object
	 */
	function Padding(top, right, bottom, left) {
		if(!isNumber(top) || !isNumber(right) || !isNumber(bottom) || !isNumber(left) || 
			bottom + top > this.height || 
			right + left > this.width) {
			elefart.showError(this.type + " in Padding, invalid: top:"+ top + " left:" + left + " bottom:" + bottom + " right:" + right);
			return false;
		}
		return {
			type:TYPES.PADDING,
			id:getId(),
			top:toInt(top),
			left:toInt(left),
			bottom:toInt(bottom),
			right:toInt(right),
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
	 * @param {Number} x the x coordinate onscreen (Integer)
	 * @param {Number} y the y coordinate onscreen (Integer)
	 * @param {Number} width the horizontal size of the Rect
	 * @param {Number} height the vertical size of the number
	 * @returns {Rect} a Rect object
	 */
	function Rect (x, y, width, height) {
		if(!isNumber(x) || !isNumber(y) || !isNumber(width) || 
			!isNumber(height) || width < 0 || y < 0) {
			elefart.showError(this.type + " in Rect, invalid dimensions x:" + x + " y:" + y + " w:" + width + " h:" + height)
			return false;
		}
		return {
			type:TYPES.RECT,
			id:getId(),
			top:toInt(y),
			right:toInt(x + width),
			bottom:toInt(y + height),
			left:toInt(x),
			width:toInt(width),
			height:toInt(height),
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
	 * @classdesc ScreenObject.type CIRCLE. Contains an enclosing Rect object, plus 
	 * a radius. Supports child objects.
	 * @param {Number} x the x coordinate of the Circle (top side of enclosing Rect)
	 * @param {Number} y the y coordinate of the circle (left side of enclosing Rect)
	 * @returns {Circle} a Circle object
	 */
	function Circle (x, y, radius) {
		if(!isNumber(x) || !isNumber(y) || 
			!isNumber(radius) || radius < 0) {
			elefart.showError(this.type + " in Circle, invalid dmensions x:" + x + " y:" + y + " radius:" + radius);
			return false;
		}
		var d = 2 * radius;
		return {
			type:TYPES.CIRCLE,
			id:getId(),
			top:toInt(y),
			right:toInt(x + d),
			bottom:toInt(y + d),
			left:toInt(x),
			width:toInt(d),
			height:toInt(d),
			radius:toInt(radius),
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
			elefart.showError(this.type + " in Polygon, invalid points:" + pts);
			return false;
		}
		//check for valid points, make integers
		for(var i = 0; i < pts.length; i++) {
			if(!pts[i].valid.apply(pts[i],[])) {
				return false;
			}
			else {
				pts[i].x = toInt(pts[i].x);
				pts[i].y = toInt(pts[i].y);
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
	 * GETTERS AND OBJECT COLLISION TESTS
	 * ============================
	 */

	/** 
	 * @method getX
	 * @description get the x coordinate of any ScreenObject
	 * @returns {Number} the x coordinate of the top-left of the 
	 * ScreenObject's enclosing Rect
	 */
	function getX () {
		if(this.x !== undefined) {
			return this.x; 
		} //POINT
		else if(this.top !== undefined) {
			return this.top;
		} //RECT
		else if(this.pt1 !== undefined && 
			this.pt1.x !== undefined) {
			return this.pt1.x; 
		} //LINE
		else {
			elefart.showError(this.TYPE + " doesn't have an X position");
		}
	}

	/** 
	 * @method getY
	 * @description get the y coordinate of any ScreenObject
	 * @returns {Number} the y coordinate of the top-left of the 
	 * ScreenObject's enclosing Rect
	 */
	function getY () {
		if(this.y !== undefined) {
			return this.y; 
		} //POINT
		else if(this.left !== undefined) {
			return this.left; 
		} //RECT
		else if(this.pt1 && this.pt1.y !== undefined) {
			return this.pt1.y; 
		} //LINE
		else { 
			elefart.showError(this.TYPE + " doesn't have a Y position");
		}
	}

	/** 
	 * @method getWidth
	 * @description get the width of the object's enclosing Rect
	 * @returns {Number} the width of the enclosng Rect
	 */
	function getWidth () {
		if(this.type === TYPES.POINT) {
			console.log("warning: took width of type POINT");
			return 0;
		}
		else if(this.type === TYPES.LINE) {
			return (this.pt2.x - this.pt1.x); //Line width is extension in x direction
		}
		else if(this.width !== undefined) { //Rect
			return this.width;
		}
		else {
			elefart.showError(this.TYPE + " doesn't have a width");
		}
	}

	/** 
	 * @method getHeight
	 * @description get the height of the object's enclosing Rect
	 * @returns {Number} the height of the enclosing Rect
	 */
	function getHeight () {
		if(this.type === TYPES.POINT) {
			return 0;
		}
		else if(this.type === TYPES.LINE) {
			return (this.pt2.y - this.pt1.y); //line height is extension in y direction
		}
		else if(this.width !== undefined) { //Rect
			return this.height;
		}
		else {
			elefart.showError(this.type + " doesn't have a height");
		}
	}

	function getTop () {
		if(this.type === TYPES.POINT) {
			console.log("warning: took top of type POINT");
			return this.y;
		}
		else if(this.type === TYPES.LINE) {
			console.log("warning: took top of type LINE");
			return this.pt1.y;
		}
		else if(this.width !== undefined) {
			return this.top;
		}
		else {
			elefart.showError(this.type + " doesn't have a top");
		}
	}

	function getLeft () {
		if(this.type === TYPES.POINT) {
			console.log("warning: took left of type POINT");
			return this.x;
		}
		else if(this.type === TYPES.LINE) {
			console.log("warning: took left of type LINE");
			return this.pt1.x;
		}
		else if(this.width !== undefined) {
			return this.left;
		}
		else {
			elefart.showError(this.type + " doesn't have a top");
		}
	}

	function getBottom () {
		if(this.type === TYPES.POINT) {
			console.log("warning: took bottom of type POINT");
			return this.y;
		}
		else if(this.type === TYPES.LINE) {
			console.log("warning: took bottom of type LINE");
			return this.pt2.y;
		}
		else if(this.width !== undefined) {
			return this.bottom;
		}
		else {
			elefart.showError(this.type + " doesn't have a top");
		}
	}

	function getRight () {
		if(this.type === TYPES.POINT) {
			console.log("warning: took right of type POINT");
			return this.x;
		}
		else if(this.type === TYPES.LINE) {
			console.log("warning: took right of type LINE");
			return this.pt2.x;
		}
		else if(this.width !== undefined) {
			return this.right;
		}
		else {
			elefart.showError(this.type + " doesn't have a top");
		}
	}

	/** 
	 * @method getCenter
	 * @description get the center of an ScreenObject
	 * @returns {Point|false} the center point, or false
	 */
	function getCenter () {
		if(this.type === TYPES.POINT) {
			console.log("warning: took center of type POINT");
			return this;
		}
		else if(this.type === TYPES.LINE) {
			if(pt2.x >= pt1.x) {
				return {
					x: this.pt1.x + toInt((this.pt2.x - this.pt1.x)/2),
					y: this.pt1.y + toInt((this.pt2.y - this.pt1.y)/2)
				}
			}
			else {
				return {
					x: this.pt2.x + toInt((this.pt1.x - this.pt2.x)/2),
					y: this.pt2.y + toInt((this.pt1.y - this.pt2.y)/2)
				}
			}
		}
		//everything else has a Rect, so find center x, y for a rect
		if(this.top === undefined) {
			elefart.showError(this.type + " can't get its center");
			return false;
		}
		return {
			x: this.left + toInt((this.right - this.left)/2),
			y: this.top + toInt((this.bottom - this.top)/2)
		}
	}

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
			elefart.showError("Point object cannot be inside POINT or LINE objects");
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
			elefart.showError(this.type + " undefined internal Rect, can't determine if it is inside Rect");
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
			elefart.showError(this.type + " undefined internal Rect, can't get its intersect");
			return false;
		}
		return (this.left <= rect.right &&
			rect.left <= this.right &&
			this.top <= rect.bottom &&
			rect.top <= this.bottom);
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
	 * @method shrink
	 * @descripion integer-based centered shrinking of an object. The pixel 
	 * value is applied on ALL SIDES of the object. This allows objects with 
	 * a border to have their overall size shrunk so it does not include the border.
	 * @param {Number} pixels the number of pixels to take off each side of the 
	 * Rect.
	 */
	function shrink (pixels) {
		if(!isNumber(pixels) || pixels < 0) {
			elefart.showError(this.type + " invalid shrink:" + pixels);
			return false;
		}
		if(this.width) { //enclosing Rect
			this.left += pixels; this.right -= pixels;
			this.top += pixels;this.bottom -= pixels;
			this.width -= (2 * pixels);
			this.height -= (2 * pixels);
		}
		//switch through types
		if(this.type === TYPES.LINE) {
			if(this.pt2.x > this.pt1.x) {
				this.pt1.x += pixels; this.pt2.x -= pixels;
			}
			else {
				this.pt2.x += pixels; this.pt1.x -= pixels;
			}
			if(this.pt2.y > this.pt1.y) {
				this.pt1.y += pixels; this.pt2.y -= pixels;
			}
			else {
				this.pt2.y += pixels; this.pt1.y -= pixels;
			}
		}
		else if(this.type === TYPES.RECT) {
			//nothing to do
		}
		else if(this.type === TYPES.CIRCLE) {
			this.radius -= pixels;
		}
		else if(this.type === TYPES.IMAGE) {
			this.img.width -= (2 * pixels);
			this.img.height += (2 * pixels);
		}
		else {
			elefart.showError(this.type + " shrinkRect doesn't support this type");
			return false;
		}

		return true;
	}

	/** 
	 * @method scale
	 * @description floating-point scale an ScreenObject's size, while 
	 * while returnng integer values
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
	 * @method setParent
	 * @description add a parent object
	 * @param {Object|null} parent the parent object, or JS null if the 
	 * object has no parent (elefart.building.World)
	 * @returns {Boolean} if ok, return true, else false
	 */
	function setParent(parent) {
		if(parent || parent === null) {
			this.parent = parent;
		}
		else {
			elefart.showError("tried to add non-object parent");
		}
		return false;
	}

	function clearParent() {
		if(this.parent) {
			this.parent = null;
		}
		else {
			elefart.showError("tried to remove nonexistend parent");
		}
	}

	/** 
	 * @method addChild
	 * @description add a child ScreenObject to an Object
	 * @param {Object} a child object, either Point, Line, 
	 * Rect, Circle, Polygon
	 */
	function addChild(child) {
		if(this.children) {
			if(child === undefined || child.id === undefined || 
				child.type === undefined || child.type === TYPES.PADDING) {
				elefart.showError(child.type + "(" + typeof child + ") cannot add as child");
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
	function setGradient (grad) {
		if(this.type === TYPES.PADDING) {
			elefart.showError(this.type + " can't apply a width or color");
			return false;
		}
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
	function setOpacity (opacity) {
		if(this.type === TYPES.PADDING) {
			elefart.showError(this.type + " can't apply a width or color");
			return false;
		}
		if(!isNumber(opacity) || opacity < 0.0 || opacity > 1.0) {
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
	function setStroke (width, color) {
		if(this.type === TYPES.PADDING) {
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
		this.lineWidth = width;
		this.strokeStyle = color;
	}

	/** 
	 * @method setFill
	 * @description set the fill color for a ScreenObject
	 * @param {String} color the rgb() or #rrggbb or #rgb color
	 */
	function setFill(color) {
		if(this.type === TYPES.PADDING) {
			elefart.showError(this.type + " can't apply a width or color");
			return false;
		}
		if(!isRGB(color)) {
			elefart.showError("invalid RGB color");
			return false;
		}
		this.fillStyle = color;
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
	 * @param {Boolean} scaleToRect if true, scale the image to the defined 
	 * Rect object inside this object
	 */
	function setImage(src, callback, scaleToRect) {
		var that = this;
		that.img = new Image();

		that.img.onload = function () {
			//shrink image to size of object
			if(scaleToRect) {
				this.width = that.width;
				this.height = that.height;
			}

			if(callback) callback(that); //callback function passed image
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
	 * @param {LAYERS} layer the layer to draw in. Layers are 
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
	 * @description add common methods to convert a geometry primitive , 
	 * (Point, Line, Rect, Circle) into a ScreenObject (ScreenPoint, ScreenLine, 
	 * ScreenCircle, ScreenPoly, ScreenImage, ScreenSprite). 
	 * Methods are typically called as from the object, rather than
	 * globally from this library, which keeps 'this' working correctly. 
	 * Use the JS .apply for methods calling each other in the object context
	 * @param {Object} program object
	 */
	function addFns (obj) {
		//getters
		obj.getX = getX,
		obj.getY = getY,
		obj.getWidth = getWidth,
		obj.getHeight = getHeight,
		obj.getTop = getTop,
		obj.getLeft = getLeft,
		obj.getBottom = getBottom,
		obj.getRight = getRight,
		obj.getCenter = getCenter,
		obj.pointInside = pointInside,
		obj.insideRect = insideRect,
		obj.intersectRect = intersectRect,
		//setters
		obj.move = move,
		obj.moveTo = moveTo,
		obj.centerOnPoint = centerOnPoint,
		obj.centerInRect = centerInRect,
		obj.setDimensions = setDimensions,
		obj.setRectBorderRadius = setRectBorderRadius,
		obj.setRectPadding = setRectPadding,
		obj.shrink = shrink,
		obj.scale = scale,
		//parents and childen
		obj.setParent = setParent,
		obj.clearParent = clearParent,
		obj.findChild = findChild,
		obj.addChild = addChild,
		obj.removeChild = removeChild,
		//visual styles
		obj.setFilter = setFilter,
		obj.setGradient = setGradient,
		obj.setOpacity = setOpacity,
		obj.setStroke = setStroke,
		obj.setFill = setFill,
		obj.setImage = setImage,
		//drawing layer
		obj.setLayer = setLayer;
		return obj;
	}

	/* 
	 * ============================
	 * CANVAS SHAPES
	 * ============================
	 */

	/** 
	 * @constructor ScreenPoint
	 * @implements {Point}
	 * @classdesc create a ScreenPoint object
	 * @param {Number} x the x position of the Point
	 * @param {Number} y the y position of the Point
	 * @param {Number} strokeWidth the width of the stroke
	 * @param {COLORS|CanvasGradient} fillStyle the color (rgb or hex) for the stroke, written as 
	 * a string, e.g. 'rgb(4,3,3)' or #ddccdd, or an HTML5 Canvas gradient object
	 * @param {LAYERS} the drawing layer for elefart.display to draw the object into
	 * @returns {ScreenPoint|false} if ok, return ScreenPoint, else false
	 */
	function ScreenPoint (x, y, strokeWidth, strokeStyle, layer) {
		var pt = Point(x, y);
		addFns(pt); //convert to ScreenObject
		if(pt) {
			if(!strokeWidth) strokeWidth = 0;
			if(!strokeStyle) strokeStyle = display.COLORS.BLACK;
			if(!layer) layer = display.LAYERS.FLOORS;
			pt.setStroke(strokeWidth, strokeStyle);
			pt.setFill(strokeStyle); //stroke == fill for a ScreenPoint
			pt.setLayer(layer);
		}
		return pt;
	}

	/** 
	 * @constructor ScreenLine
	 * @implements {Line}
	 * @param {Point} pt1 the first point in the ScreenLine
	 * @param {Point} pt2 the second point in the ScreenLine
	 * @param {Number} strokeWidth the width of the line stroke
	 * @param {COLORS|CanvasGradient} strokeStyle the color (rgb or hex) for the stroke, written as 
	 * a string, e.g. 'rgb(4,3,3)' or #ddccdd, or an HTML5 Canvas gradient object
	 * @returns {ScreenLine|false} if OK, return ScreenLine object, else false
	 */
	function ScreenLine (pt1, pt2, strokeWidth, strokeStyle, layer) {
		var ln = Line(pt1, pt2);
		if(ln) {
			addFns(ln); //convert to ScreenObject
			if(!strokeWidth) strokeWidth = 1; //default for line since no fill
			if(!strokeStyle) strokeStyle = display.COLORS.BLACK;
			if(!layer) layer = display.LAYERS.FLOORS; //top layer
			ln.setStroke(strokeWidth, strokeStyle);
			ln.setLayer(layer);
		}
		return ln;
	}

	/** 
	 * @constructor ScreenRect
	 * @implements {Rect}
	 * @classdesc create a ScreenRect object.
	 * @param {Number} x the x coordinate of the object
	 * @param {Number} y the y coordinate of the object
	 * @param {Number} width the width of the Rect
	 * @param {Number} height the height of the Rect
	 * @param {Number} strokeWidth the width of the stroke around the ScreenRect
	 * @param {COLORS|CanvasGradient} strokeStyle the color (rgb or hex) for the stroke, written as 
	 * a string, e.g. 'rgb(4,3,3)' or #ddccdd, or an HTML5 Canvas gradient object
	 * @param {COLORS|CanvasGradient} fillStyle the color (rgb or hex) for the stroke, written as 
	 * a string, e.g. 'rgb(4,3,3)' or #ddccdd, or an HTML5 Canvas gradient object
	 * @param {Number} layer the layer for elefart.display to draw the object into.
	 * @returns {ScreenRect|false} if OK, return ScreenLine object, else false
	 */
	function ScreenRect (x, y, width, height, strokeWidth, strokeStyle, fillStyle, layer) {
		var r = Rect(x, y, width, height);
		if(r) {
			addFns(r); //convert to ScreenObject
			if(!strokeWidth) strokeWidth = 0;
			if(!strokeStyle) strokeStyle = display.COLORS.BLACK;
			if(!fillStyle) fillStyle = display.COLORS.WHITE;
			if(!layer) layer = display.LAYERS.FLOORS; //top layer
			r.setStroke(strokeWidth, strokeStyle);
			r.setFill(fillStyle);
			r.setLayer(layer);
		}
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
	 * @param {COLORS|CanvasGradient} strokeStyle the color (rgb or hex) for the stroke, written as 
	 * a string, e.g. 'rgb(4,3,3)' or #ddccdd, or an HTML5 Canvas gradient object
	 * @param {COLORS|CanvasGradient} fillStyle the color (rgb or hex) for the stroke, written as 
	 * a string, e.g. 'rgb(4,3,3)' or #ddccdd, or an HTML5 Canvas gradient object
	 * @param {Number} layer the layer for elefart.display to draw the object into.
	 * @returns {ScreenCircle|false} if ok, return ScreenLine object, else false
	 */
	function ScreenCircle (x, y, radius, strokeWidth, strokeStyle, fillStyle, layer) {
		var c = Circle(x, y, radius);
		if(c) {
			addFns(c); //convert to ScreenObject
			if(!strokeWidth) strokeWidth = 0;
			if(!strokeStyle) strokeStyle = display.COLORS.BLACK;
			if(!fillStyle) fillStyle = display.COLORS.WHITE;
			if(!layer) layer = display.LAYERS.FLOORS; //top layer
			c.setStroke(strokeWidth, strokeStyle);
			c.setFill(fillStyle);
			c.setLayer(layer);
		}
		return c;
	}

	/** 
	 * @method ScreenPoly
	 * @implements {Polygon}
	 * @classdesc create a screen Polygon
	 * @param {Array} a set of Point objects with x and y coordinates for the 
	 * sides of the Polygon.
	 * @param {Number} strokeWidth the width of the stroke around the ScreenRect
	 * @param {COLORS|CanvasGradient} strokeStyle the color (rgb or hex) for the stroke, written as 
	 * a string, e.g. 'rgb(4,3,3)' or #ddccdd, or an HTML5 Canvas gradient object
	 * @param {COLORS|CanvasGradient} fillStyle the color (rgb or hex) for the stroke, written as 
	 * a string, e.g. 'rgb(4,3,3)' or #ddccdd, or an HTML5 Canvas gradient object
	 * @param {Number} layer the layer for elefart.display to draw the object into.
	 * @returns {ScreenPoly|false} if ok, return ScreenLine object, else false
	 */
	function ScreenPoly(pts, strokeWidth, strokeStyle, fillStyle, layer) {
		var p = Polygon(pts);
		if(p) {
			addFns(r); //convert to ScreenObject
			if(!strokeWidth) strokeWidth = 0;
			if(!strokeStyle) strokeStyle = display.COLORS.BLACK;
			if(!fillStyle) fillStyle = display.COLORS.WHITE;
			if(!layer) this.layer = display.LAYERS.FLOORS; //top layer
			p.setStroke(strokeWidth, strokeStyle);
			p.setFill(fillStyle);
			p.setLayer(layer);
		}
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
	 * @returns {ScreenImage|false} if ok, return ScreenLine object, else false
	 */
	function ScreenImage(x, y, src, strokeWidth, strokeStyle, callback, layer) {
		var r = Rect(x, y, 0, 0); //zero until image loaded
		if(r && src) {
			addFns(r); //convert to ScreenObject
			if(!strokeWidth) strokeWidth = 0;
			if(!strokeStyle) strokeStyle = display.COLORS.BLACK;
			if(!layer) layer = display.LAYERS.FLOORS; //top layer
			r.type = TYPES.IMAGE; //modified from type RECT
			r.setLayer(layer);
			//don't set fill
			r.setImage(src, callback);
		}
		else {
			elefart.showError("ScreenImage invalid parameters, src:");
		}
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
	 * @param {LAYERS} layer the layer to draw the sprite into
	 * @returns {ScreenSprite|false} if ok, return ScreenLine object, else false
	 */
	function ScreenSprite (src, types, frames, callback, layer) {
		var r = Rect(0, 0, 0, 0); //always starts at 0, 0

		if(r) {
			addFns(r); //convert to ScreenObject
			//no stroke or fill
			if(!layer) layer = display.LAYERS.FLOORS; //top layer
			r.setImage(src, callback, false); //load, but don't scale
			r.setLayer(layer);
			r.type = TYPES.SPRITE; //modified from type RECT
			r.width = r.left = r.img.width; //adjust based on image size
			r.height = r.bottom = r.img.height;
			r.types = types;
			r.frames = frames;
			r.currentFrame = 0;
			r.interval = 0;
			r.loop = false;
			r.frameWidth = 0;
			r.frameHeight = 0;
		}
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
		TYPES:TYPES,
		toInt:toInt, //convert to integer floor
		getRGBAfromRGB:getRGBAFromRGB, //make rgb() strings with opacity
		Point:Point, //Shape Primitive Constructors
		Line:Line,
		Padding:Padding,
		Rect:Rect,
		Circle:Circle,
		Polygon:Polygon,
		setFilter:setFilter, //Member functions
		setGradient:setGradient,
		setOpacity:setOpacity,
		setStroke:setStroke,
		setFill:setFill,
		setLayer:setLayer,
		ScreenPoint:ScreenPoint, //ScreenObjects
		ScreenLine:ScreenLine,
		ScreenRect:ScreenRect,
		ScreenCircle:ScreenCircle,
		ScreenSprite:ScreenSprite,
		init:init,
		run:run
	};

})();