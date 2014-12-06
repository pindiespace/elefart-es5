/** 
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
		board.init(display.getFloorCols(), display.getFloorCount());

		//create additional users
		board.makeUser("bobo", board.userTypes.MALE_SQUATTING, 2, true);
		board.makeUser("skanky", board.userTypes.MALE_RUNNING, 4, true);

		elefart.state = elefart.gameStates.RUN;

		//start the display
		display.run();

		//start trapping user events
		controller.run(panel);
		
		//create users
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
