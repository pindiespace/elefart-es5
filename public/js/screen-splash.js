/** 
 * @namespace
 * elefart.screens['screen-splash']
 * splash (or loader screen). Actually the second 
 * splash, since iOS will display a bitmap loader screen 
 * during the early phases of the app load
 */
 window.elefart.screens['screen-splash'] = (function () {

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