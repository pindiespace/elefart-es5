/** 
 * @namespace
 * @fileoverview factory function for elefart. Makes common objects
 * used on the screen. Objects are scaled via 'mobile first', meaning
 * that constant sizes are defined for small screens, and scaled for 
 * larger ones.Also utility methods for testing JS object type, and 
 * converting object type.
 * @requires elefart
 * @requires elefart.display
 * @version 0.1.1
 * @author Pete Markeiwicz
 * @license MIT
 */
window.elefart.factory = (function () {

	var id = 0, //object Ids
	display,
	controller,
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
		RECT:"RECT",
		CIRCLE:"CIRCLE",
		POLYGON:"POLYGON",
		CLOUD:"CLOUD",
		IMAGE:"IMAGE"
	};

	/** 
	 * @readonly
	 * @enum {Number}
	 * @typedef SIDES
	 * @description top, right, bottom, left for Rect
	 */
	var SIDES = {
		TOP:1,
		RIGHT:2,
		BOTTOM:3,
		LEFT:4
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
	 * @method getRandomInt
	 * @description returns a random int between min (inclusive) and max 
	 * (inclusive).
	 * @param {Number} min lower bound (included in returned values)
	 * @param {Number} max upper bound (included in returned values)
	 * @returns {Number} a random integer >= min <= max
	 */
	function getRandomInt(min, max) {
		return Math.floor(Math.random() * (max - min + 1)) + min;
	}

	function clampVal(val, min, max) {
		if(val < min) val = min;
		if(val > max) val = max;
		return val;
	}

	/** 
	 * @method getRandomPoints
	 * @description returns one or more random Points within an enclosing 
	 * Rect bounds.
	 * @param {Rect} r the Rect where the Points should be generated
	 * @param {Number} num the number of Points to generate.
	 * @returns {Array<Point>} an array of random Points in the enclosing Rect
	 */
	function getRandomPoints(r, num) {
		var pts = [];
		for(var i = 0; i < num; i++) {
			pts.push(Point(
				getRandomInt(r.left, r.right),
				getRandomInt(r.top, r.bottom)
				)
			);
		}
		return pts;
	}

	/** 
	 * @method isNumber
	 * @description confirm an object is a Mumber
	 * @param {Object} obj the object to test
	 * @returns {Boolean} if a number, return true, else false
	 */
	function isNumber (obj) { 
		if(obj === undefined) return false;
		return !isNaN(parseFloat(obj));
	}

	/** 
	 * @method isString
	 * @description confirm an object is a String
	 * @param {Object} object to test
	 * @returns {Boolean} if a String, return true, else false
	 */
	function isString (obj) {
		return ("String" === Object.prototype.toString.call(obj).slice(8, -1));
	}

	/** 
	 * @method isArray
	 * @description confirm an object is an Array
	 * @param {Object} object to test
	 * @returns {Boolean} if an Array, return true, else false
	 */
	function isArray (obj) {
		return ("Array" === Object.prototype.toString.call(obj).slice(8, -1));
	}

	/** 
	 * @method isImage
	 * @description confirm an object is a JS Image
	 * @param {Object} object to test
	 * @returns {Boolean} if a Image, return true, else false
	 */
	function isImage (obj) {
		return ("HTMLImageElement" === Object.prototype.toString.call(obj).slice(8, -1));
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
	 * @method isCanvasGradient
	 * @description confirm an object is an HTML5 Canvas gradient object 
	 * @param {Object} object to test
	 * @returns {Boolean} if HTML5CanvasGradient return true, else false
	 */
	function isCanvasGradient (obj) {
		return ("CanvasGradient" === Object.prototype.toString.call(obj).slice(8, -1));
	}

	/** 
	 * @method getInitedArray
	 * @description create an array of defined length, and fill with default values
	 * @param {Number} n length of array
	 * @param {*} default the value to put into each element of the array
	 * @returns {Array<defaultValue>} an Array, initialized to the right length and default values
	 */
	function getInitedArray(n, defaultValue) {
		var arr = [];
		for(var i = 0; i < n; i++) {
			if(isNumber(defaultValue)) {
				arr[i] = defaultValue;
			}
			else if(isString(defaultValue)) {
				arr[i] = new String(defaultValue);
			}
			else {
				arr[i] = clone(defaultValue);
			}
		}
		return arr;
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
	 * support child objects.
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
	 * @constructor Rect
	 * @classdesc ScreenObject.type RECT. Similar to DOMRect, but only 
	 * containing information needed to draw on 2D Canvas. 
	 * Allows for border and a constant borderRadius. 
	 * the actual Canvas drawing routine uses Rect, or a set of 
	 * arcs (borderRadius > 0)
	 * @param {Number} x the x coordinate onscreen (Integer)
	 * @param {Number} y the y coordinate onscreen (Integer)
	 * @param {Number} width the horizontal size of the Rect
	 * @param {Number} height the vertical size of the number
	 * @returns {Rect} a Rect object
	 */
	function Rect (x, y, width, height) {
		if(!isNumber(x) || !isNumber(y) || 
			!isNumber(width) || !isNumber(height) || 
			width < 0 || height < 0) {
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
	 * @param {Array<Point>} pts an array of Points defining the Polygon
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
			borderRadius:0,
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
	 * @constructor Cloud
	 * @classdesc ScreenObject.type Cloud. Cloudss are Polygon-like, but are made 
	 * with curves instead of straight lines. Polygons are straight with rounded corners 
	 * if polygon.borderRadius is set. Specific algorithms are needed to organize the 
	 * points in a Cloud into the desired pattern. elefart.building used a proceedural 
	 * "flower" shape to create clouds
	 * @param {Array<Point>} pts an array of Points defining the Cloud
	 * @returns {Cloud} a Cloud object
	 */
	function Cloud (pts) {
		var b = Polygon(pts);
		b.type = TYPES.CLOUD;
		b.radius = getInitedArray(pts.length, 0); //radius of each arch of each sub-Bubble
		return b;
	}

	/* 
	 * ============================
	 * COMPLEX SHAPES AND SHAPE TRANSFORMS
	 * APPLIED TO POLYGONS
	 * ============================
	 */

	/* 
	 * @method createFlowerShape
	 * the Cloud shape is generated by computing 2 circles, one nested in 
	 * each other, and linking the Points between the inner and outer circle to 
	 * form a "flower with petals" structure. When drawn with bezierCurveTo(), 
	 * the outer points are controls for drawing the petal from the inner circle.
	 * @param {Point} center the central point of the circle
	 * @param {Number} radius the OUTER radius for creating the petals
	 * @param {Number} radius2 the INNER radius for creating the petals
	 * @Param {Number} xDistort the distortion of the circle in the x direction
	 * @param {Number} yDistort the distortion of the circle in the y direction
	 * @param {Number} n the number of Points in the circle. The algorithm generates
	 * two more points, acting as control points for drawing the petals of the 
	 * flower shape from the inner radius to the outer radius.
	 * @returns {Array<Point>} an array of Points with a flower shape
	 */
	function createFlowerShape(center, radius, radius2, xDistort, yDistort, n) {
		var nn = n*3; //TODO: USE NN HERE TO INCREMENT ALPHA CORRECTLY
		var points = [], 
		pointOnCircle,
		i = -1, theta;
		var alpha = Math.PI * 2 / nn;
		while(i < nn) {
			i++; 
			theta = alpha * i;
			points[i] = Point(center.x + (Math.cos(theta) * radius2*yDistort), 
				center.y + (Math.sin(theta) * radius2*xDistort)); //SMALLER RING
			i++; 
			theta = alpha * i;
			points[i] = Point(center.x + (Math.cos(theta) * radius*yDistort), 
				center.y + (Math.sin(theta) * radius*xDistort)); //LARGER RING
			i++; 
			theta = alpha * i;
			points[i] = Point(center.x + (Math.cos(theta) * radius*yDistort), 
				center.y + (Math.sin(theta) * radius*xDistort)); //LARGER RING
		}
		points[nn] = points[0];
		return points;
	}

	/** 
	 * @method skewShape
	 * @description skew a shape via an upper or lower bias. A straight line becomes a 
	 * curve, with the peak of the curve at its central Point.
	 * @param {ScreenObject} obj the points (forming a shape) to skew
	 * @param {Point} center the assigned center of the points. Skew happens in a circular
	 * ring around the center point. This allows complex shapes to skew in one area.
	 * @param {Number} topSkew skew, as a percent (0-1.0) of the top quadrant of a circle
	 * @param {Number} rightSkew skew, as a percent (0-1.0) of the top quadrant of a circle
	 * @param {Number} bottomSkew skew, as a percent (0-1.0) of the top quadrant of a circle
	 * @param {Number} leftSkew skew, as a percent (0-1.0) of the top quadrant of a circle
	 * @returns {Array<Point>} returns modified Points
	 */
	function skewShape (obj, center, top, right, bottom, left) {
		var len = obj.points.length, 
		pts = obj.points, 
		dist, cdist, skew, x, y;
		for(var i = 0; i < len; i++) {
			var pt = pts[i];
			//switch through quadrants
			if(pt.x < center.x) {
				cdist = center.x - pt.x;
				dist = center.x - obj.left;
				skew = 1.0 - Math.sin(cdist/dist);
				if(pt.y < center.y) {
					//top left
					pt.y -= (skew * top);
					pt.x += ((1.0 - skew) * left);
				}
				else {
					//bottom left
					pt.y -= (skew * bottom);
					pt.x += ((1.0 - skew) * left);
				}
			}
			else {
				cdist = pt.x - center.x;
				dist = obj.right - center.x;
				skew = 1.0 - Math.sin(cdist/dist);
				if(pt.y < center.y) {
					//top right
					pt.y -= (skew * top);
					pt.x -= ((1.0 - skew) * right);
				}
				else {
					//bottom right
					pt.y -= (skew * bottom);
					pt.x -= ((1.0 - skew) * right);
				}
			}
		}
		return true;
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
		switch(this.type) {
			case TYPES.POINT:
				return this.x; 
				break;
			case TYPES.LINE:
				return this.pt1.x;
				break;
			case TYPES.RECT:
			case TYPES.CIRCLE:
			case TYPES.POLYGON:
				return this.left;
				break;
			default:
				elefart.showError(this.TYPE + " in getX() doesn't have an X position");
				break;
		}
		return false;
	}

	/** 
	 * @method getY
	 * @description get the y coordinate of any ScreenObject
	 * @returns {Number|false} the y coordinate of the top-left of the 
	 * ScreenObject's enclosing Rect
	 */
	function getY () {
		switch(this.type) {
			case TYPES.POINT:
				return this.y; 
				break;
			case TYPES.LINE:
				return this.pt1.y;
				break;
			case TYPES.RECT:
			case TYPES.CIRCLE:
			case TYPES.POLYGON:
				return this.top;
				break;
			default:
				elefart.showError(this.TYPE + " in getY() doesn't have an Y position");
				break;
		}
		return false;
	}

	/** 
	 * @method getWidth
	 * @description get the width of the object's enclosing Rect
	 * @returns {Number|false} the width of the enclosng Rect, else false
	 */
	function getWidth () {
		switch(this.type) {
			case TYPES.POINT:
				console.log("warning: getWidth() for object instanceName:" + this.instanceName + " id:" + this.id + " took width of type POINT");
				return 0;
				break;
			case TYPES.LINE:
				return (this.pt2.x - this.pt1.x); //Line width is extension in x direction
				break;
			case TYPES.RECT:
			case TYPES.CIRCLE:
			case TYPES.POLYGON:
				return this.width;
				break;
			default:
				elefart.showError(this.TYPE + " id:" + this.id + " in getWidth() doesn't have a width");
				break;
		}
		return false;
	}

	/** 
	 * @method getHeight
	 * @description get the height of the object's enclosing Rect
	 * @returns {Number} the height of the enclosing Rect
	 */
	function getHeight () {
		switch(this.type) {
			case TYPES.POINT:
				console.log("warning: getWidth() for object instanceName:" + this.instanceName + " id:" + this.id + " took width of type POINT");
				return 0;
				break;
			case TYPES.LINE:
				return (this.pt2.y - this.pt1.y); //Line width is extension in x direction
				break;
			case TYPES.RECT:
			case TYPES.CIRCLE:
			case TYPES.POLYGON:
				return this.height;
				break;
			default:
				elefart.showError(this.TYPE + " id:" + this.id + " in getHeight() doesn't have a height");
				break;
		}
		return false;
	}

	/** 
	 * @method getTop
	 * @description get the top (y value) of the object's enclosing Rect
	 * @returns {Number} the top of the object's enclosing Rect
	 */
	function getTop () {
		switch(this.type) {
			case TYPES.POINT:
				console.log("warning: getTop() for type:" + this.type);
				return this.y; 
				break;
			case TYPES.LINE:
				return this.pt1.y;
				break;
			case TYPES.RECT:
			case TYPES.CIRCLE:
			case TYPES.POLYGON:
				return this.top;
				break;
			default:
				elefart.showError(this.type + " in getTop() doesn't have an top position");
				break;
		}
		return false;
	}


	/** 
	 * @method getRight
	 * @description get the right (x value) of the object's enclosing Rect
	 * @returns {Number} the right of the enclosing Rect
	 */
	function getRight () {
		switch(this.type) {
			case TYPES.POINT:
				console.log("warning: getRight() for type:" + this.type);
				return this.x; 
				break;
			case TYPES.LINE:
				return this.pt2.x;
				break;
			case TYPES.RECT:
			case TYPES.CIRCLE:
			case TYPES.POLYGON:
				return this.right;
				break;
			default:
				elefart.showError(this.type + " in getRight() doesn't have an right position");
				break;
		}
		return false;
	}

	/** 
	 * @method getBottom
	 * @description get the bottom (y value) of the object's enclosing Rect
	 * @returns {Number} the bottom of the enclosing Rect
	 */
	function getBottom () {
		switch(this.type) {
			case TYPES.POINT:
				console.log("warning getBottom() for type:" + this.type);
				return this.y; 
				break;
			case TYPES.LINE:
				return this.pt2.y;
				break;
			case TYPES.RECT:
			case TYPES.CIRCLE:
			case TYPES.POLYGON:
				return this.bottom;
				break;
			default:
				elefart.showError(this.type + " in getBottom() doesn't have an right position");
				break;
		}
		return false;
	}

	/** 
	 * @method getLeft
	 * @description get the left (s value) of the object's enclosing Rect
	 * @returns {Number} the left of the enclosing Rect
	 */
	function getLeft () {
		switch(this.type) {
			case TYPES.POINT:
				console.log("warning getLeft() took left of type:" + this.type);
				return this.x; 
				break;
			case TYPES.LINE:
				return this.pt1.x;
				break;
			case TYPES.RECT:
			case TYPES.CIRCLE:
			case TYPES.POLYGON:
				return this.left;
				break;
			default:
				elefart.showError(this.type + " in getLeft() doesn't have an right position");
				break;
		}
		return false;
	}


	/** 
	 * @method getEnclosingRect
	 * @description type POLYGON specific. Find the rect which encloses the set of points
	 * @param {Array<Point>} pts an array Points
	 * @returns {Rect} 
	 */
	function enclosingRect () {
		switch(this.type) {
			case TYPES.POINT:
			console.log("warning: enclosingRect returning tiny Rect enclosing a Point for instanceName:" + this.instanceName + " id:" + this.id);
				return Rect(this.x, this.y, 1, 1);
				break;
			case TYPES.LINE:
				if(this.pt2.y > this.pt1.y) {
					return Rect(this.pt1.x, this.pt1.y, this.pt2.x - this.pt1.x, this.pt2.y - this.pt1.y);
				}
				else {
					return Rect(this.pt2.x, this.pt2.y, this.pt1.x - this.pt2.x, this.pt1.y - this.pt2.y);
				}
				break;
			case TYPES.RECT:
			case TYPES.CIRCLE:
				var d = this.radius *2;
				this.width = this.height = d;
				return Rect(this.left, this.top, this.width, this.height); //enclosing Rect same as Rect
				break;
			case TYPES.POLYGON:
				//test and generate the Rect at the same time
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
				if(this.right < this.left) console.log("ERROR right less than left")
				if(this.bottom < this.top) console.log("ERROR bottom less than top")
				this.width = this.right - this.left;
				this.height = this.bottom - this.top;
				return Rect(this.left, this.top, this.width, this.height);
				break;
			default:
				elefart.showError("tried enclosingRect() for instanceName:" + this.instanceName + " id:" + this.id);
				break;
		}
	}

	/** 
	 * @method getCenter
	 * @description get the center of an ScreenObject
	 * @returns {Point|false} the center point, or false
	 */
	function getCenter () {
		switch(this.type) {
			case TYPES.POINT:
				console.log("warning: took center of type POINT (equal to the Point)");
				return this;
				break;
			case TYPES.LINE:
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
				break;
			case TYPES.RECT:
			case TYPES.CIRCLE:
			case TYPES.POLYGON:
				return {
					x: this.left + toInt((this.right - this.left)/2),
					y: this.top + toInt((this.bottom - this.top)/2)
				}
				break;
			default:
				break;
		}
		return false;
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
		return false;
	}

	/** 
	 * @method pointInside
	 * @description determine if a point is inside or outside Rect
	 * @param {Point} pt the point to test
	 * @returns {Boolean} if not in rect, false, else true
	 */
	function pointInside (pt) {
		switch(this.type) {
			case TYPES.POINT:
			case TYPES.LINE:
				elefart.showError("Point object cannot be inside POINT or LINE objects");
				break;
			case TYPES.RECT:
			case TYPES.CIRCLE:
			case TYPES.POLYGON:
				if(pt.x >= this.left && 
					pt.x <= this.right && 
					pt.y >= this.top &&
					pt.y <= this.bottom) {
					return true;
				}
				break;
			default:
				elefart.showError("type Point cannot be inside " + this.type);
				break;
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
		switch(this.type) {
			case TYPES.POINT:
				return ptInside(this, rect);
				break;
			case TYPES.LINE:
				return (ptInside(this.pt1, rect) && ptInside(this.pt2, rect));
				break;
			case TYPES.RECT:
			case TYPES.CIRCLE:
			case TYPES.POLYGON:
				if(this.top >= rect.top && 
					this.left >= rect.left && 
					this.bottom <= rect.bottom && 
					this.right <= rect.right) {
					return true;
				}
				break;
			default:
				elefart.showError(this.type + " undefined internal Rect, can't determine if it is inside Rect");
				break;
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
		switch(this.type) {
			case TYPES.POINT:
				return ptInside(this, rect);
				break;
			case TYPES.LINE:
				return (ptInside(this.pt1, rect) && ptInside(this.pt2, rect));
				break;
			case TYPES.RECT:
			case TYPES.CIRCLE:
			case TYPES.POLYGON:
				return (this.left <= rect.right &&
					rect.left <= this.right &&
					this.top <= rect.bottom &&
					rect.top <= this.bottom);
				break;
			default:
				elefart.showError(this.type + " undefined internal Rect, can't determine if it is inside Rect");
				break;
		}
		return false;
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
		switch(this.type) {
			case TYPES.POINT:
				this.x += dx;
				this.y += dy; 
				break;
			case TYPES.LINE:
				this.pt1.x += dx; this.pt2.x += dx;
				this.pt1.y += dy; this.pt2.y += dy;
				break;
			case TYPES.RECT:
			case TYPES.CIRCLE:
				this.left += dx; this.right  += dx;
				this.top  += dy; this.bottom += dy;
				break;
			case TYPES.POLYGON:
			case TYPES.CLOUD:
				this.left += dx; this.right  += dx;
				this.top  += dy; this.bottom += dy;
				var len = this.points.length;
				for(var i = 0; i < len; i++) {
					this.points[i].x += dx; 
					this.points[i].y += dy;
				}
				break;
			default:
				elefart.showError(this.type + " cannot use move()");
				return false;
				break;
		}
		//update children
		if(recurse && this.children) {
			for(var i = 0; i < this.children.length; i++) {
				var child = this.children[i];
				if(!child.move.apply(this, [dx, dy, recurse])) {
					return false;
				}
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
		if(!isNumber(x) || !isNumber(y)) {
			elefart.showError(".moveTo() invalid, x:" + x + " y:" + y);
			return false;
		}
		switch(this.type) {
			case TYPES.POINT:
				dx = x - this.x;
				dy = y - this.y;
				break;
			case TYPES.LINE:
				dx = x - this.pt1.x;
				dy = y = this.pt1.y;
				break;
			case TYPES.RECT:
			case TYPES.CIRCLE:
			case TYPES.CLOUD:
			case TYPES.POLYGON:
				dx = x - this.left;
				dy = y - this.top;
				move.apply(this, [dx, dy, false]);
				break;
			default:
				elefart.showError(this.type + " cannot use moveTo()");
				return false;
				break;
		}
		//update children
		if(recurse && this.children) {
			for(var i = 0; i < this.children.length; i++) {
				var child = this.children[i];
				if(!child.moveTo.apply(this, [x, y, recurse])) {
					return false;
				}
			}
		}
		return true;
	}

	/** 
	 * @method rectCenterOnPoint
	 * @description center a Rect on a Point
	 * @param {Point} centerPt the point to use
	 * @param {Boolean} recurse if true, center children as well, 
	 * otherwise just move the chidren with their newly centered parent
	 * @returns {Boolean} if centered, return true, else false
	 */
	function centerOnPoint (centerPt, recurse) {
		var dx, dy;
		if(!centerPt.valid.apply(centerPt,[])) {
			return false;
		}
		switch(this.type) {
			case TYPES.POINT:
				this.x = centerPt.x;
				this.y = centerPt.y;
				break;
			case TYPES.LINE:
				dx = centerPt.x - Math.min((this.pt2.x - this.pt1.x)/2);
				dy = centerPt.y - Math.min((this.pt2.y - this. pt1.y)/2);
				this.pt1.x += dx; this.pt2.x += dx;
				this.pt1.y += dy; this.pt2.y += dy;
				break;
			case TYPES.RECT:
			case TYPES.CIRCLE:
				dx = centerPt.x - Math.min(this.left + (this.width/2));
				dy = centerPt.y - Math.min(this.top	+ (this.height/2));
				move.apply(this, [dx, dy, false]);
				break;
			case TYPES.CLOUD:
			case TYPES.POLYGON:
				var len = this.points.length;
				dx = centerPt.x - Math.min(this.left + (this.width/2));
				dy = centerPt.y - Math.min(this.top	+ (this.height/2));
				for(var i = 0; i < this.points.length; i++) {
					this.points[i].x += dx; 
					this.points[i].y += dy;
				}
			default:
				elefart.showError(this.type + " cannot use centerOnPoint()");
				return false;
				break;
		}
		//update children
		if(recurse && this.children) {
			for(var i = 0; i < this.children.length; i++) {
				var child = this.children[i];
				if(!child.centerOnPoint.apply(this, [dx, dy, recurse])) {
					return false;
				}
			}
		}
		return true;
	}

	/** 
	 * @method centerRectInRect
	 * @description center a rect so it is inside, or surrounds an other Rect
	 * @param {Rect} centerRect the Rect to center the first rect onto
	 * @returns {Boolean} if centered, return true, else false
	 */
	function centerInRect (centerRect, recurse) {
		if(!centerRect.valid.apply(centerRect,[])) {
			return false;
		}
		switch(this.type) {
			case TYPES.POINT:
				var c = getCenter.apply(centerRect);
				this.x = c.x;
				this.y = c.y;
				break;
			case TYPES.RECT:
			case TYPES.CIRCLE:
				var c = getCenter.apply(centerRect);
				var x = c.x - Math.min(this.width/2);
				var y = c.y - Math.min(this.height/2);
				moveTo.apply(this, [x, y, recurse]);
				break;
			case TYPES.POLYGON:
				var c = getCenter.apply(centerRect);
				var x = c.x - Math.min(this.width/2);
				var y = c.y - Math.min(this.height/2);
				break;
			default:
				elefart.showError(this.type + " cannot use centerInRect()");
				return false;
				break;
		}
		//update children
		if(recurse && this.children) {
			for(var i = 0; i < this.children.length; i++) {
				var child = this.children[i];
				if(!child.centerInRect.apply(this, [dx, dy, recurse])) {
					return false;
				}
			}
		}
		return true;
	}

	/** 
	 * @method setBorderRadius
	 * @description set rounded Rect, in current version all cornder has the 
	 * same rounding
	 * @param {Number} borderRadius the border radious
	 * @returns {Boolean} if success, return true, else false
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
		var dw, dh, scaleX, scaleY;

		if(this.width) {
			oldWidth = this.width;
			this.width = width;
			this.right = this.left + width;
			scaleX = width/this.width
		}
		if(this.height) {
			oldHeight = this.height;
			dh = height - this.height;
			this.height = height;
			this.bottom = this.top + height;
			scaleY = height/this.height;
		}
		if(this.img) {
			this.img.width = width;
			this.img.height = height;
		}
		switch(this.type) {
			case TYPES.RECT:
				return true;
				break;
			case TYPES.CIRCLE:
				this.radius = Math.floor(this.width/2);
				break;
			case TYPES.POLYGON:
				var len = this.points.length;
				for(var i = 0; i < len; i++) {
					var pt = points[i];
					pt.x = Math.floor(pt.x * scaleX);
					pt.y = Math.floor(pt.y * scaleY);
				}
				break;
			default:
				elefart.showError(this.type + " cannot use setDimension()");
				return false;
				break;
		}
		return true;
	}

	/** 
	 * @method shrink
	 * @descripion integer-based centered shrinking of an object. The pixel 
	 * value is applied on ALL SIDES of the object (object center x and center y 
	 * are unchanged). This allows objects with 
	 * a border to have their overall size shrunk so it does not include the border.
	 * @param {Number} pixels the number of pixels to take off each side of the Rect.
	 * @param {Boolean} recurse if true, shrink children
	 * @returns {Boolean} if shrink ok, return true, else false
	 */
	function shrink (pixels, recurse) {
		var shrink = pixels + pixels, scaleX, scaleY;

		if(!isNumber(pixels) || pixels < 0) {
			elefart.showError(this.type + " invalid shrink:" + pixels);
			return false;
		}
		if(this.width) { //enclosing Rect
			this.left += pixels;this.right -= pixels;
			this.top += pixels;this.bottom -= pixels;
			scaleX = (this.width - shrink)/this.width;
			this.width -= shrink;
		}
		if(this.height) {
			this.bottom = this.top + this.height;
			this.right = this.left + this.width;
			scaleY = (this.height - shrink)/this.height;
			this.height -= shrink;
		}
		if(this.img) {
			this.img.width -= shrink;
			this.img.height += shrink;
		}
		switch(this.type) {
			case TYPES.LINE:
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
				break;
			case TYPES.RECT:
				break;
			case TYPES.CIRCLE:
				this.radius = Math.floor(this.width/2);
				break;
			case TYPES.POLYGON:
				var len = this.points.length;
				for(var i = 0; i < len; i++) {
					var pt = points[i];
					pt.x = Math.floor(pt.x * scaleX);
					pt.y = Math.floor(pt.y * scaleY);
				}
				break;
			default:
				elefart.showError(this.type + " cannot use shrink()");
				return false;
				break;
		}
		//update children
		if(recurse && this.children) {
			for(var i = 0; i < this.children.length; i++) {
				var child = this.children[i];
				if(!child.shrink.apply(this, [pixels, recurse])) {
					return false;
				}
			}
		}
		return true;
	}

	/** 
	 * @method scale
	 * @description floating-point scale an ScreenObject's size, while 
	 * while returnng integer values
	 * @param {Number} scaleX the x scale value. 1.0 = no change
	 * @param {Number} scaleY the y scale value. 1.0 = no change
	 * @param {Boolean} recurse if true, scale child objects
	 * @returns {Boolean} if set, return true, else false
	 */
	function scale (scaleX, scaleY, recurse) {
		if(!isNumber(scaleX) || scale < 0) {
			elefart.showError(this.type + " invalid scale:" + scale);
			return false;
		}
		if(scaleY === undefined) {
			scaleY = 1.0;
		}
		if(this.width) {
			this.right = this.left + Math.min(this.width * scaleX);
				this.width = this.right - this.left;
		}
		if(this.height) {
			this.bottom = this.top + Math.min(this.height * scaleY);
				this.height = this.bottom - this.top;
			}
		switch(this.type) {
			case TYPES.POINT:
				break;
			case TYPES.LINE:
				var dx = scaleX * (this.pt2.x - this.pt1.x);
				var dy = scaleY * (this.pt2.y - this.pt1.y);
				this.pt2.x = this.pt1.x + dx;
				this.pt2.y = this.pt1.y + dy;
				break;
			case TYPES.RECT:
				break;
			case TYPES.CIRCLE:
				this.radius = Math.floor(this.width/2);
				break;
			case TYPES.POLYGON:
				var len = this.points.length;
				for(var i = 0; i < len; i++) {
					var pt = this.points[i];
					pt.x = Math.floor(pt.x * scaleX);
					pt.y = Math.floor(pt.y * scaleY);
				}
				break;
			default:
				elefart.showError(this.type + " cannot use scale()");
				return false;
				break;
		}
		//update children
		if(recurse && this.children) {
			for(var i = 0; i < this.children.length; i++) {
				var child = this.children[i];
				if(!child.scale.apply(this, [scaleX, scaleY, recurse])) {
					return false;
				}
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
	 * @method findChild
	 * @description find a ScreenObject child by its id
	 * @param {Number} childId the id of the object
	 * @param {Boolean} recurse if true, recurse through all descendant child objects, else just 
	 * the local children to this ScreenObject.
	 * @param {Object|undefined} res a carry-through object to handle recursion (internally applied by function)
	 * @returns {Object|false} if OK, return an object, else false
	 */
	function findChild(childId, recurse, res) {
		if(this.children) {
			if(!isNumber(childId)) {
				elefart.showError("findChild, invalid childId:" + childId);
				return false;
			}
			if(res) {
				return res;
			}
			if(this.id === childId) {
				return this;
			}
			else {
				var len = this.children.length;
				for(var i = 0; i < len; i++) {
					var child = this.children[i];
					res = child.findChild(childId, recurse, res);
					if(res) {
						return res;
					}
				}
			}
		}
		else {
			elefart.showError(this.type + "(" + this.instanceName + ") findChild() children array undefined");
		}

		return false;
	}

	/** 
	 * @method addChild
	 * @description add a child ScreenObject to an parent Object
	 * @param {Object} a child object, either Point, Line, 
	 * Rect, Circle, Polygon
	 */
	function addChild(child) {
		if(this.children) {
			if(child === undefined || !isNumber(child.id) || child.type === undefined) {
				elefart.showError(child.type + "(" + child.instanceName + ") cannot add as child");
				return false;
			}
			if(!child || !isNumber(child.id) || !child.type) {
				elefart.showError("Tried to add non-ScreenObject as a child, " + child);
				return false;
			}

			//add to array
			if(this.findChild(child.id)) {
					elefart.showError("addChild, tried to add child that is already present in this object:" + child.id + "(" + child.instanceName + ")");
					return false;
			}
			child.parent = this;
			this.children.push(child);
			return true;
		}
		else {
			elefart.showError(child.type + " addChild() children array undefined");
		}
		
		return false;
	}

	/** 
	 * @method removeFromLists
	 * @description allows a ScreenObject to remove itself from 
	 * all Lists (elefart.display and elefart.controller update lists)
	 */
	function removeFromLists () {
		display.removeFromDisplayList(this);
		controller.removeFromUpdateList(this);
		var children = this.children;
		var len = children.length;
		console.log("removing " + this.type + " from lists, now looping through its children");
		for(var i = 0; i < len; i++) {
			children[i].removeFromLists();
		}
		//TODO: flag the canvas panels we need to update (MAP LAYERS TO PANELS)
		//TODO: ONE SHAFT HAS AN ERROR!!!!!!!!!!!!!!!
		//TODO: DOESN'T REMOVE OBJECT!!!
	}

	/** 
	 * @method removeChild
	 * @description remove a child ScreenObject by its id, also removing it from 
	 * the displayList (elefart-display) and updateList (elefart-controller).
	 * @param {Number|ScreenObject} child the id of the object, or the actual object. If the 
	 * object is passed, the method checks for an Id value and proceeds.
	 * @returns {Object|false} if ok, return the removed child, else false
	 */
	function removeChild(child) {
		if(child && child.id) {
			var children = this.children;
			if(children) {
				var len = children.length;
				for(var i = 0; i < len; i++) {
				if(child === children[i]) {
					child.removeFromLists();
					children.splice(i, 1)[0]; //display and controller references gone, ok to delete all
					return child;
					}
				}
			}
			else {
				elefart.showError(this.type + " removeChild() children array undefined for object:" + this + " id:" + this.id + " instanceName:" + this.instanceName);
				return false;
			}
		}
		elefart.showError(this.type + " removeChild() child not an object");
		return false;
	}

	/* 
	 * ============================
	 * SCREEN OBJECT STYLES
	 * ============================
	 */

	/** 
	 * @method setFilter
	 * @description set a filter on an ScreenObject image, if it exists
	 * @param {Function} filter the filtering function (expects pixel data)
	 * @returns {Boolean} if ok, return true, else false
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
		return true;
	}

	/** 
	 * @method setGradient
	 * @description set an HTML5 canvas gradient object for a ScreenObject
	 * @param {CanvasGradient} grad gradient from canvas.getContext()
	 * @returns {Boolean} if ok, return true, else false
	 */
	function setGradient (grad) {
		if(!grad) {
			elefart.showError("null gradient applied to object");
			return false;
		}
		this.gradient = grad;
		return true;
	}

	/** 
	 * @method setOpacity
	 * @description set the opacity of a ScreenObject
	 * @param {Number} opacity the opacity of the object
	 * @param {Number} (optional) imageOpacity the opacity of an image fill, if present
	 * @returns {Boolean} if ok, return true, else false
	 */
	function setOpacity (opacity, imageOpacity, blendOpacity) {
		if(isNumber(opacity) && 
			opacity >= 0.0 || opacity <= 1.0) {
				this.opacity = opacity;

			//image fill opacity
			if(this.img && this.imageOpacity && isNumber(imageOpacity) && 
				imageOpacity >= 0.0 || imageOpacity <= 1.0) {
					this.imageOpacity = imageOpacity;
					return true;
			}
		}
		else {
			elefart.showError("invalid opacity:" + opacity + " imageOpacity:" + imageOpacity);
		}
		return false;
	}

	/** 
	 * @method setStroke
	 * @description set the stroke around an ScreenObject
	 * @param {Number} width the width of the stroke in pixels
	 * @param {String} color (optional) rgb() or #rrggbb or #rgb color string
	 * @returns {Boolean} if ok, return true, else false
	 */
	function setStroke (width, color) {
		if(width < 0) {
			elefart.showError(this.type + " invalid stroke");
			return false;
		}
		if(color) {
				if(!isRGB(color)) {
			elefart.showError("invalid color string:" + color);
			return false;
			}
			this.strokeStyle = color;
		}

		this.lineWidth = width;
		return true;
	}

	/** 
	 * @method setFill
	 * @description set the fill color for a ScreenObject
	 * @param {String} color the rgb() or #rrggbb or #rgb color or CanvasGradient
	 * @param {String} blendColor (optional) the rgb(), rgba(), #rrggbb or #rgb or CanvasGradient
	 * @returns {Boolean} if ok, return true, else false
	 */
	function setFill(color, blendColor) {
		if(this.type === TYPES.POINT || this.type === TYPES.LINE) {
			elefart.showError("warning: can't apply a fill color to type " + this.type);
			return false;
		}
		if(!isRGB(color) && !isCanvasGradient(color)) {
			elefart.showError("invalid RGB color");
			return false;
		}
		this.fillStyle = color;

		//blend color. Most objects don't need this, but a few (like Clouds) do
		if(blendColor && (isRGB(blendColor) || isCanvasGradient(blendColor))) {
			this.blendColor = blendColor;
		}
		return true;
	}

	/** 
	 * @method setImage
	 * @description replace background fill with image pixels in a Screen Object. 
	 * Includes a callback for images that are dynamically loaded
	 * @param {String} src the file path to the image. If an existing JS Image object 
	 * is passed, it is used as is.
	 * @param {Function} callback function after the image is loaded
	 * @param {Boolean} scaleToRect if true, scale the image to the defined Rect object inside this object
	 * @param {Number} opacity (optional) if present, draw the image at a different 
	 * opacity than its parent object
	 * @returns {Boolean} if ok, return true, else false
	 */
	function setImage(src, callback, scaleToRect, imgOpacity) {
		if(this.type === TYPES.POINT || this.type === TYPES.LINE) {
			elefart.showError(this.type + " can't apply a width or color to this type:" + this.type);
			return false;
		}

		var that = this;

		if(isImage(src)) { //src is a JS Image object
			that.img = src;
			if(callback) callback(that);
		}
		else { //src is a path to an image file
			that.img = new Image();

			if(isNumber(imgOpacity) && imgOpacity >= 0 && imgOpacity <= 1.0) {
				that.imgOpacity = imgOpacity;
			}

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
			return true;
		}
	}

	/** 
	 * @method setSpriteCoords
	 * @description given an image, set coordinates for timelines (rows) and 
	 * individual image subframes to draw (columns) in an JS Image
	 * creates a coordinate object with:
	 * -rows: rows in sprite
	 * -cols: columns in sprite
	 * -currRow: the current row in the sprite being drawn
	 * -currCol: the current column in teh sprite being drawn
	 * -cellWidth: the width of a sprite frame in pixels
	 * -cellHeight: the height of a sprite frame in pixels
	 * -getCellRect: function returning a Rect with coordinates for canvas drawing
	 * -nextCellRect: function returning the next frame in the animation
	 * @param {Object} coordsObj a coordinate object with row and column data 
	 * - { rows:Number, cols:Number }
	 * defining individual frames of a Sprite
	 * @returns {Boolean} if coordinates OK, return true, else false
	 */
	function setSpriteCoords (coordsObj) {
		if(!this.img || !coordsObj || 
			!coordsObj.rows || !coordsObj.cols) {
			elefart.showError("can't set sprite coordinates on a non-image object:" + coordsObj);
			return false;
		}
		this.spriteCoords = {
			rows:coordsObj.rows,
			cols:coordsObj.cols,
			currRow:coordsObj.currRow,
			currCol:coordsObj.currCol,
			cellWidth:toInt(this.img.width/(coordsObj.cols)),
			cellHeight:toInt(this.img.height/(coordsObj.rows)),
			getCellRect:function (row, col) {
				if(!row) {
					row = this.currRow;
					} 
				else {
					if(row < 0 || row > currRow) {
						elefart.showError("Invalid Sprite row:" + row + " rows:" );
						return false;
					}
					currRow = row;
				}
				if(!col) {
					col = this.currCol; 
				}
				else {
					if(col < 0 || col > currCol) {
						elefart.showError("Invalid Sprite column");
						return false
					}
					currCol = col;
				}
				return {
					top:row * this.cellHeight,
					left:col * this.cellWidth,
					bottom:(row) * this.cellHeight,
					right:(col) * this.cellWidth,
					width:this.cellWidth,
					height:this.cellHeight
				}
			},
			nextCellRect:function () {
				currRow += 1;if(currRow > rows) currRow = 0;
				currCol += 1;if(currCol > cols) currCol = 0;
				getCellRect(currRow, currCol);
			}
		};
		return true;
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
	 * @returns {Boolean} if ok, return true, else false
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
		return true;
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
		obj.shrink = shrink,
		obj.scale = scale,
		//parents and childen
		obj.findChild = findChild,
		obj.addChild = addChild,
		obj.removeChild = removeChild,
		obj.removeFromLists = removeFromLists,
		//visual styles
		obj.setFilter = setFilter,
		obj.setGradient = setGradient,
		obj.setOpacity = setOpacity,
		obj.setStroke = setStroke,
		obj.setFill = setFill,
		obj.setImage = setImage,
		obj.setSpriteCoords = setSpriteCoords,
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
		if(pt) {
			addFns(pt); //convert to ScreenObject
			if(!strokeWidth) strokeWidth = 0;
			if(!strokeStyle) strokeStyle = display.COLORS.CLEAR;
			if(!layer) layer = display.LAYERS.FLOORS;
			pt.setStroke(strokeWidth, strokeStyle);
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
			if(!strokeStyle) strokeStyle = display.COLORS.CLEAR;
			if(!layer) layer = display.LAYERS.FLOORS; //top layer
			ln.setStroke(strokeWidth, strokeStyle);
			ln.setLayer(layer);
		}
		return ln;
	}

	/** 
	 * @constructor ScreenRect
	 * @implements {Rect}
	 * @classdesc create a ScreenRect object, optionally rounded corners
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
	 * @param {HTMLImageElement} src (optional) if present, add a reference to a JS image object to 
	 * draw over the ScreenRect fill
	 * @param {Function} callback (optional) function for callback
	 * @param {Number} borderRadius (optional) rounding of Rect, in pixels
	 * @returns {ScreenRect|false} if OK, return ScreenLine object, else false
	 */
	function ScreenRect (x, y, width, height, strokeWidth, strokeStyle, fillStyle, layer, src, callback, borderRadius) {
		var r = Rect(x, y, width, height);
		if(r) {
			addFns(r); //convert to ScreenObject
			if(!strokeWidth) strokeWidth = 0;
			if(!strokeStyle) strokeStyle = display.COLORS.CLEAR;
			if(!fillStyle) fillStyle = display.COLORS.CLEAR;
			if(!layer) layer = display.LAYERS.FLOORS; //top layer
			if(src && !callback) callback = function () {};
			r.setStroke(strokeWidth, strokeStyle);
			r.setFill(fillStyle);
			if(src) r.setImage(src, callback, true);
			r.setLayer(layer);
		}
		return r;
	}

	/** 
	 * @constructor ScreenBox
	 * @implements {Rect}
	 * @classdesc create a ScreenBox object missing one side, optionally rounded corners
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
	 * @param {HTMLImageElement} src (optional) if present, add a reference to a JS image object to 
	 * draw over the ScreenRect fill
	 * @param {Function} callback (optional) function for callback
	 * @returns {ScreenRect|false} if OK, return ScreenLine object, else false
	 */
	function ScreenBox (x, y, width, height, strokeWidth, strokeStyle, fillStyle, layer, src, callback, missingSide) {
		var r = Rect(x, y, width, height);
		if(r) {
			addFns(r); //convert to ScreenObject
			if(!strokeWidth) strokeWidth = 0;
			if(!strokeStyle) strokeStyle = display.COLORS.CLEAR;
			if(!fillStyle) fillStyle = display.COLORS.CLEAR;
			if(!layer) layer = display.LAYERS.FLOORS; //top layer
			if(src && !callback) callback = function () {};
			if(!missingSide) missingSide = 0;
			r.missingSide = missingSide; //number of side NOT to draw
			r.setStroke(strokeWidth, strokeStyle);
			r.setFill(fillStyle);
			
			if(src) r.setImage(src, callback, true);
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
	 * @param {HTMLImageElement} src (optional) if present, add a reference to a JS image object to 
	 * draw over the ScreenRect fill
	 * @param {Function} callback (optional) function for callback
	 * @returns {ScreenCircle|false} if ok, return ScreenLine object, else false
	 */
	function ScreenCircle (x, y, radius, strokeWidth, strokeStyle, fillStyle, layer, src, callback) {
		var c = Circle(x, y, radius);
		if(c) {
			addFns(c); //convert to ScreenObject
			if(!strokeWidth) strokeWidth = 0;
			if(!strokeStyle) strokeStyle = display.COLORS.CLEAR;
			if(!fillStyle) fillStyle = display.COLORS.CLEAR;
			if(!layer) layer = display.LAYERS.FLOORS; //top layer
			if(src && !callback) callback = function () {};
			c.setStroke(strokeWidth, strokeStyle);
			c.setFill(fillStyle);
			if(src) c.setImage(src, callback, true);
			c.setLayer(layer);
		}
		return c;
	}

	/** 
	 * @method ScreenPoly
	 * @implements {Polygon}
	 * @classdesc create a screen Polygon
	 * @param {Array<Point>} a set of Point objects with x and y coordinates for the 
	 * sides of the Polygon.
	 * @param {Number} strokeWidth the width of the stroke around the ScreenRect
	 * @param {COLORS|CanvasGradient} strokeStyle the color (rgb or hex) for the stroke, written as 
	 * a string, e.g. 'rgb(4,3,3)' or #ddccdd, or an HTML5 Canvas gradient object
	 * @param {COLORS|CanvasGradient} fillStyle the color (rgb or hex) for the stroke, written as 
	 * a string, e.g. 'rgb(4,3,3)' or #ddccdd, or an HTML5 Canvas gradient object
	 * @param {Number} layer the layer for elefart.display to draw the object into.
	 * @param {HTMLImageElement} src (optional) if present, add a reference to a JS image object to 
	 * draw over the ScreenRect fill
	 * @param {Function} callback (optional) function for callback
	 * @param {Boolean} closed (optional) if true, close the polygon, else false
	 * @returns {ScreenPoly|false} if ok, return ScreenLine object, else false
	 */
	function ScreenPoly(pts, strokeWidth, strokeStyle, fillStyle, layer, src, callback, closed) {
		var p = Polygon(pts);
		if(p) {
			addFns(p); //convert to ScreenObject
			if(!strokeWidth) strokeWidth = 0;
			if(!strokeStyle) strokeStyle = display.COLORS.CLEAR;
			if(!fillStyle) fillStyle = display.COLORS.CLEAR;
			if(!layer) layer = display.LAYERS.FLOORS; //top layer
			if(src && !callback) callback = function () {};

			p.setStroke(strokeWidth, strokeStyle);
			p.setFill(fillStyle);
			if(src) p.setImage(src, callback, true);
			p.setLayer(layer);
			//special function to make polygon invisible
		}
		return p;
	}

	function ScreenCloud (pts, strokeWidth, strokeStyle, fillStyle, layer, src, callback, closed) {
		var b = Cloud(pts);
		if(b) {
			addFns(b);
			if(!strokeWidth) strokeWidth = 0;
			if(!strokeStyle) strokeStyle = display.COLORS.CLEAR;
			if(!fillStyle) fillStyle = display.COLORS.CLEAR;
			if(!layer) layer = display.LAYERS.FLOORS; //top layer
			if(src && !callback) callback = function () {};

			b.setStroke(strokeWidth, strokeStyle);
			b.setFill(fillStyle);
			if(src) b.setImage(src, callback, true);
			b.setLayer(layer);
		}
		return b;
	}

	/** 
	 * @constructor ScreenImage
	 * @implements {Rect}
	 * @classdesc create a ScreenObject that is a 'naked' image, without visible 
	 * border or fill. Objects like Rect or Circle may have an image added separately.
	 * @param {Number} x the x coordinate of the object
	 * @param {Number} y the y coordinate of the object
	 * @param {String} src the path to the image file used
	 * @param {Number} layer the layer for elefart.display to draw the object into.
	 * @returns {ScreenImage|false} if ok, return ScreenLine object, else false
	 */
	function ScreenImage(x, y, src, callback, layer) {
		var r = Rect(x, y, 0, 0); //zero until image loaded
		if(r && src) {
			addFns(r); //convert to ScreenObject
			strokeWidth = 0;
			strokeStyle = display.COLORS.BLACK;
			layer = display.LAYERS.FLOORS; //top layer
			r.type = TYPES.IMAGE; //modified from type RECT
			//don't set stroke or fill
			r.setLayer(layer);
			r.setImage(src, callback, false);
		}
		else {
			elefart.showError("ScreenImage invalid parameters, src:");
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
		controller = elefart.controller;
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
		TYPES:TYPES, //basic shapes
		SIDES:SIDES, //top, left, bottom,right
		isNumber:isNumber,
		isString:isString,
		isArray:isArray,
		isImage:isImage,
		isFunction:isFunction,
		isCanvasGradient:isCanvasGradient,
		toInt:toInt, //convert to integer floor
		getRandomInt:getRandomInt, //random integers
		clampVal:clampVal, //clamp value in range
		getRandomPoints:getRandomPoints,
		getRGBAfromRGB:getRGBAFromRGB, //make rgb() strings with opacity
		Point:Point, //Shape Primitive Constructors
		Line:Line,
		Rect:Rect,
		Circle:Circle,
		Polygon:Polygon,
		Cloud:Cloud, //cloud-like
		createFlowerShape:createFlowerShape,
		skewShape:skewShape,
		setFilter:setFilter, //Member functions
		setGradient:setGradient,
		setOpacity:setOpacity,
		setStroke:setStroke,
		setFill:setFill,
		setLayer:setLayer,
		ScreenPoint:ScreenPoint, //ScreenObjects
		ScreenLine:ScreenLine,
		ScreenRect:ScreenRect,
		ScreenBox:ScreenBox,
		ScreenCircle:ScreenCircle,
		ScreenPoly:ScreenPoly,
		ScreenCloud:ScreenCloud,
		init:init,
		run:run
	};

})();