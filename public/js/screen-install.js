/** 
 * @namespace elefarts.screens['screen-install']
 * @fileoverview option to install to desktop
 * @requires elefart
 * @requires elefart.dom
 * @version 0.1.1
 * @author Pete Markeiwicz
 * @license MIT
 */
window.elefart.screens['screen-install'] = (function () {

	var dom,
	id = 'screen-install',
	panel,
	firstTime = true;

	/** 
	 * @method init install-screen
	 * @description initialize the installation screen for iOS and other 
	 * platforms so that an icon can be copied to a desktop.
	 */
	function init () {
		dom = elefart.dom;
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