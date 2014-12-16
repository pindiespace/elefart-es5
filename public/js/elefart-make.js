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




	/* 
	 * ============================
	 * BASIC SCREEN OBJECT FACTORY FUNCTIONS
	 * ============================
	 */

	/** 
	 * Objects are defined using the new Geometry interface
	 * for conversion with CSS transform utilities
	 * @link https://hacks-dev.allizom.org/2014/04/coordinate-conversion-made-easy/
	 */

	/** 
	 * @method DOMPoint
	 * make a point object following DOMPoint specification
	 * @link http://www.w3.org/TR/2014/WD-geometry-1-20140522/#DOMPoint
	 * @param {Number} x the left coordinate on screen
	 * @param {Number} y the top coordinate on screen
	 * @returns {Point} returns object with top and left defined
	 */
	function DOMPoint (x, y, z, w) {
		return {
			x:x,
			y:y,
			z:z,
			w:w
		};
	}

	/** 
	 * @method DOMRect
	 * make a point object following DOMRect specification
	 * @link http://www.w3.org/TR/2014/WD-geometry-1-20140522/#DOMRect
	 * @param {Number} x the left coordinate on screen
	 * @param {Number} y the top coordinate on screen
	 * @returns {Point} returns object with top and left defined
	 */
	function DOMRect (point, width, height) {
		return {
			x:point.x,
			y:point.y,
			top: point.y,
			left:point.x,
			bottom:(point.y + height),
			right:(point.x + width),
			width:width,
			height:height,
		};
	}

	/** 
	 * @method DOMQuad
	 * @link http://dev.w3.org/fxtf/geometry/#DOMQuad
	 */
	function DOMQuad (rect) {
		return {
			pt1:new DOMPoint(x, y, 0, 1),
			pt2:new DOMPint(x+rect.width, y, 0, 1),
			pt3:new DOMPoint(x+rect.width, y+rect.height, 0, 1),
			pt4:new DOMPoint(x, y+rect.height, 0, 1)
		}
	}

	/** 
	 * @method createScreenBox
	 * create a shape with padding. Model is a simplified form of the CSS 'box model' 
	 * but used for canvas (two overlapping DOMRect objects)
	 * - define parent
	 * - read parent padding
	 * - position based on padding
	 * @param {Rect} boxRect DOMRect
	 * @param {Rect} paddingRect DOMRect
	 * @param {Number} layer integer z-position for stacking objects in display list
	 */
	function createScreenBox (parent, boxRect, paddingRect, layer) {
		if(paddingRect.width > boxRect.width || 
			paddingRect.height > boxRect.height) {
			elefart.showError("invalid screenBox dimensions");
			return;
		}
		return {
			parent:parent,
			children: [],
			box:boxRect,
			padding:paddingRect,
			innerBox:boxRect,
			layer:layer
		};
	}

	function centerChildBox (parentBox, recurse) {

	}

	function moveScreenBox (x, y, recurse) {

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
		init:init,
		run:run,
		createPoint:DOMPoint,
		createRect:DOMRect
	};


})();