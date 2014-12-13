/** 
 * @namespace
 * elefart.screens['screen-game']
 * wrapper for game (entirely in HTML5 canvas)
 */
window.elefart.screens['screen-game'] = (function () {

	var dom = elefart.dom,
	id ='screen-game',
	panel,
	firstTime = true;

	/** 
	 * @method init
	 */
	function init () {
		panel = document.getElementById(id);
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