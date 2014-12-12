/** 
 * @namespace
 * elefart.screens['screen-menu']
 * at startup, show options for the app (play, info, quit)
 */
 window.elefart.screens['screen-menu'] = (function () {

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