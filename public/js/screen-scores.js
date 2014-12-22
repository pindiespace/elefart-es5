/** 
 * @namespace elefart.screens['screen-scores']
 * @fileoverview elefart score screen, shows high scores for users.
 * @requires elefart
 * @requires elefart.dom
 * @version 0.1.1
 * @author Pete Markeiwicz
 * @license MIT
 */
window.elefart.screens['screen-scores'] = (function () {

	var dom,
	panel,
	id = 'screen-scores',
	firstTime = true;

	/** 
	 * @method init scores-screen
	 * @description initialize elefart.screens['screen-scores']
	 */
	function init () {
		dom = elefart.com;
		panel = document.getElementById(id);
		firstTime = false;
	}

	/** 
	 * @method run scores-screen
	 * @description set up elefart.screens['screen-scores'] for display
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