/** 
<<<<<<< HEAD
 * @namespace
 * @fileoverview create the game object, which is created entirely in HTML5 canvas embedded 
 * in the default HTML file.
 * @requires elefart
 * @requires elefart.dom
 * @requires elefart.factory
 * @requires elefart.display
 * @version 0.1.1
 * @author Pete Markeiwicz
 * @license MIT
 */
window.elefart.screens['screen-game'] = (function () {

	var dom,
	factory,
	display,
	id ='screen-game',
	panel,
	firstTime = true;

	/** 
	 * @method init game-screen
	 * @description initialize the game screen
	 */
	function init () {
		dom = elefart.dom,
		factory = elefart.factory,
		display = elefart.display;
		panel = document.getElementById(id);
		firstTime = false;
	}

	/** 
	 * @method run game-screen
	 * @description show the correct screen in the active game.
	 */
	function run () {
		if(firstTime) {
			init();
		}

		if(!panel) elefart.showError("game panel (from elefart.screens['screen-game']) didn't initialize");


		//show the screen
		dom.showScreenById(id);

		//start the game!
		elefart.display.run(panel); //have to determine bounding Rect for elefart.building
		elefart.building.run(); //elefart.building calls display for dimensions
		elefart.display.drawBackground();
		elefart.controller.run(); //don't activate until prelim draw
	}

	//returned object
	return {
		init:init,
		run:run
	};

})();
=======
 * screen-game.js
 * main game functions, along with game Ui
 * 
 */
 
elefart.screens['screen-game'] = (function () {
	
	var dom = elefart.dom,
		$ = dom.$,
		board = elefart.board,
		display = elefart.display,
		controller = elefart.controller,
		panel = document.getElementById('screen-game'),
		elevatorWidth,
		floorHeight,
		firstRun = true;

	/** 
	 * @method init
	 * initialize the game
	 */
	function init () {

		console.log(".game::init(), running display.run()");

		//pass a reference to ourselves to the screen object
		var gameObj = elefart.screens['screen-game'];
		
		//ask the display for the final row and column count
		display.preInit(panel, gameObj);
		
		//initialize the board. Ask the "view" for the number of rows and colums to present
		//also creates a default user
		board.init(display.getShaftCount(), display.getFloorCount());


console.log("dimensions:" + board.dimensions.x + "," + board.dimensions.y);

		//create additional users
		board.makeUser("bobo", board.userStates.MALE_SQUATTING, 2, true);
		board.makeUser("skanky", board.userStates.MALE_RUNNING, 4, true);

		elefart.state = elefart.gameStates.RUN;

		//start the display
		display.run();

		//start trapping user events
		controller.run(panel);
		
		//print debug output
		if(elefart.DEBUG) elefart.board.printUsers();
		if(elefart.DEBUG) elefart.board.printBuilding();
		if(elefart.DEBUG) elefart.display.gridReadout();

		firstRun = false;
	}

	/** 
	 * @method run
	 * runs every time sreen becomes visible
	 */
	function run () {
		console.log("elefart.screens['screen-game']::run()");
		if(firstRun) {
			init();
		}
	}
	
	return {
		run:run
	};
	
})();
>>>>>>> 2728073dd04a850e35b61685d582a8bf409ef5a7
