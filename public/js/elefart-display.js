/** 
 * @namespace
 * elefart.display (View)
 * HTML5 Canvas drawing for game
 */
window.elefart.display = (function () {

	var building,
	dom,
	controller,
	fctx,        //foreground context
	bctx,        //background context
	foreground,  //foreground canvas
	background,  //background canvas
	hotelWalls,  //hotel walls
	hotelSign,   //hotel sign
	spriteBoard, //images of users for animation
	firstTime = true;

	/**
	 * =========================================
	 * SPECIAL PRELOADS
	 * =========================================
	 */

	/** 
	 * @method preload
	 * start game images loading early!
	 */
	function preload () {

		//hotel wallpaper
		walls = new Image();
			walls.onload = function() {
			console.log("display::preload(), loaded background patterns");
		};
		walls.src = 'img/game/wallpaper.png';

		//hotel sign
		hotelSign = new Image();
		hotelSign.onload = function () {
			console.log("display::preload(), loaded hotel sign");
		}
		hotelSign.src = 'img/game/hotel_sign.png';

		//character sprites
		spriteBoard = new Image ();
		spriteBoard.onload = function () {
			console.log("display::preload(), loaded character sprites");
		}
		spriteBoard.src = 'img/game/spriteboard.png';
	}


	/**
	 * =========================================
	 * BASIC SCREEN SHAPES
	 * =========================================
	 */


	/**
	 * =========================================
	 * DRAW BACKGROUND CANVAS
	 * =========================================
	 */


	/**
	 * =========================================
	 * DRAW FOREGROUND CANVAS
	 * =========================================
	 */


	/**
	 * =========================================
	 * DRAW DISPLAY
	 * =========================================
	 */

	/**
	 * =========================================
	 * INIT AND RUN
	 * =========================================
	 */


	/** 
	 * @method init
	 */
	function init () {
		board = elefart.building,
		controller = elefart.controller;
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
		run:run
	};

})();