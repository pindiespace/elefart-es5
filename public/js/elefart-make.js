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
	 * BASIC SCREEN OBJECT FACTORY FUNCTIONS
	 * ============================
	 */

	/** 
	 * @method createPoint
	 * make a point object
	 * @param {Number} x the left coordinate on screen
	 * @param {Number} y the top coordinate on screen
	 * @returns {Point} returns object with top and left defined
	 */
	function createPoint (x, y) {
		return {
			top:0,
			left:0
		};
	}

	function createSize(width, height) {
		return {
			width:width,
			height:height
		};
	}

	function createRect (point, size) {
		return {
			top: point.top,
			left:point.left,
			bottom:(point.top + size.height),
			right:(point.left + size.width),
			getWidth: function () {return this.right - this.left;},
			getHeight: function () {return this.bottom - this.top;}
		};
	}


	/** 
	 * @method createScreenBox
	 * create a shape with padding. Model is a simplified form of the CSS 'box model' but used for canvas
	 * - define parent
	 * - read parent padding
	 * - position based on padding
	 * @param {Rect} boxRect
	 * @param {Rect} paddingRect
	 * @param {Number} layer integer z-position for stacking objects
	 */
	function createScreenBox (parent, boxRect, paddingRect, layer) {
		if(paddingRect.width > boxRect.getWidth()) {
			elefart.showError();
		}
		if(paddingRect.height > boxRect.getHeight()) {

		}
		return {
			parent:parent,
			children: [],
			box:boxRect,
			padding:paddingRect,
			innerBox: createRect ()
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
		createPoint:createPoint,
		createSize:createSize,
		createRect:createRect
	};


})();