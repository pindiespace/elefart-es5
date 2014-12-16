/** 
 * @namespace
 * elefart.screens['screen-join']
 * login system for joining multi-user elefart
 */
window.elefart.screens['screen-join'] = (function () {

	var com = elefart.dom,
	id = 'screen-join',
	panel,
	firstTime = true;

	/** 
	 * @method init
	 */
	function init () {
		panel = document.getElementById(id);
		firstTime = false;
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