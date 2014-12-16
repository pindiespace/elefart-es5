/** 
 * @namespace
 * elefart.screens['screen-splash']
 * splash (or loader screen). Actually the second 
 * splash, since iOS will display a bitmap loader screen 
 * during the early phases of the app load
 */
 window.elefart.screens['screen-splash'] = (function () {

	var dom = elefart.dom,
	id = 'screen-splash',
	panel,
	firstTime = true;

	/** 
	 * @method init
	 * bind mouseclick to this screen
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

		//a mouseclick takes you to the game menu options

		dom.bind(panel, "click", function (e) { //needs the closure
			e.stopPropagation();
			e.preventDefault();
			dom.showScreenById("screen-menu");
			elefart.screens["screen-menu"].run();
		});
	}

	//returned object
	return {
		init:init,
		run:run
	};
	
})();