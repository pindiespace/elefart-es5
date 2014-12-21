/** 
 * @namespace elefarts.screens['screen-install']
 * @fileoverview option to install to desktop
 * @requires elefart.screens
 */
window.elefart.screens['screen-install'] = (function () {

	var dom = elefart.dom,
	id = 'screen-install',
	panel,
	firstTime = true;

	/** 
	 * @method init install-screen
	 * @description initialize the installation screen for iOS and other 
	 * platforms so that an icon can be copied to a desktop.
	 */
	function init () {
		panel = document.getElementById(id);
		firstTime = false;
	}

	/** 
	 * @method run install-screen
	 * @description show the install screen for adding the game icon to the 
	 * desktop.
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