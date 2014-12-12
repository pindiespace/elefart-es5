/** 
 * @namespace
 * elefart.display (View)
 * HTML5 Canvas drawing for game
 */
window.elefart.display = (function () {


	var building,
	controller,
	firstTime = true;

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