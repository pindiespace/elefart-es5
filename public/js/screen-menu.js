/** 
 * @namespace elefart.screens['screen-menu']
 * @fileoverview display menu options at game startup
 * @requres elefart.screens
 */
 window.elefart.screens['screen-menu'] = (function () {

	var dom = elefart.dom,
	id = 'screen-menu',
	panel,
	firstTime = true;

	/** 
	 * @method init menu-screen
	 * @description get elefart.screens['screen-menu']
	 */
	function init () {
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