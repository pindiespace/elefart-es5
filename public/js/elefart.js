/** 
 * @namespace elefart
 * main game object
 */
window.elefart = (function () {

	var screens = []
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
		screens:screens,
		init:init,
		run:run
	};

})();