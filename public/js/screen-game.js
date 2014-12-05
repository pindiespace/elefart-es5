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
	var gameStates = {
		LOAD:0,
		INTRO:1,
		SET_PATH:2,
		RUN_PATH:3,
		CALC_SCORE:4,
		INFO:5,
		EXIT:6	
	},
	state = gameStates.LOAD; //set a default state
		
	/** 
	 * @method init
	 * initialize the game
	 */
	function init () {
		console.log(".game::init(), running display.run()");
        
		//ask the display for the final row and column count
        console.log("PANEL:" + panel);
        display.preInit(panel);
        
		board.init(display.getFloorCols(), display.getFloorCount());

		//create the display
		display.run();
        
        //start up the event listners
        controller.run(elefart.display.foreground);

		if(elefart.DEBUG) elefart.board.printUsers();
		if(elefart.DEBUG) elefart.board.printBuilding();
		if(elefart.DEBUG) elefart.display.gridReadout();

		firstRun = false;
	}
	
	/** 
	 * @method gameLoop
	 * NOTE: uses requestAnimationFrame()
	 * run the gameloop. the loop runs constantly, but 
	 * pauses and resumes based on state. User input is 
	 * handled separately
	 */
	function gameLoop () {
		
		//branch on game state
		switch(state) {
			case LOAD:break;
			case INTRO:break;
			case SET_PATH:break;
			case RUN_PATH:break;
			case CALC_SCORE:break;
			case INFO:break;
			case EXIT:break;
			default:
				break;
		}
		requestAnimationFrame(gameLoop);
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
