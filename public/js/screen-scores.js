/** 
 * @namespace
 * elefart.screens['screen-scores']
 * elefart score screen,shows high scores for users
 */
window.elefart.screens['screen-scores'] = (function () {

	var dom = elefart.dom,
	firstTime = true;

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
		run:run
	};

})();