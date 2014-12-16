/** 
 * @namespace
 * elefart.screens['screen-install']
 * option to install to desktop
 */
window.elefart.screens['screen-install'] = (function () {

	var dom = elefart.dom,
	id = 'screen-install',
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