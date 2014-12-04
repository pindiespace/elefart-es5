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
	state = gameStates.LOAD;
		
	/** 
	 * @method init
	 * initialize the game
	 */
	function init () {
		console.log("in game init, running display.run()");
		display.run(panel);
		firstRun = false;
	}
	
	/** 
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
		
	}
	
	
	function run () {
		console.log("running screen-game");
		if(firstRun) {
			init();
		}
	}
	
	return {
		run:run
	};
	
})();
