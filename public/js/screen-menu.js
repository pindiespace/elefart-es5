/** 
 * @namespace elefart.screens['screen-menu']
 * @fileoverview display menu options at game startup. Displays a screen 
 * with buttons for loading the game, help screens, and exiting.
 * @requires elefart
 * @requires elefart.dom
 * @version 0.1.1
 * @author Pete Markeiwicz
 * @license MIT
 */
 window.elefart.screens['screen-menu'] = (function () {

	var dom,
	id = 'screen-menu',
	panel,
	firstTime = true;

	/** 
	 * @method init menu-screen
	 * @description get elefart.screens['screen-menu']
	 */
	function init () {
		dom = elefart.dom;
		panel = document.getElementById(id);
		firstTime = false;
	}

	/** 
	 * @method run menu-screen
	 * @description set up elefart.screens['screen-menu'] to show options in the game.
	 */
	function run () {
		if(firstTime) {
			init();
		}
		//TODO: MESSED UP
		var buttonList = panel.getElementsByTagName("ul");
		dom.bind(buttonList, "click", function (e) {
			var id;
			if(e.srcElement) {
				id = "screen-" + e.srcElement.name;
			} 
			else {
				id = "screen-"+ e.target.name;
			}
			e.preventDefault();
			e.stopPropagation();
			dom.showScreenById(id);
			elefart.screens[id].run(); //run the defined screen object
		});
	}

	//returned object
	return {
		init:init,
		run:run
	};
	
})();