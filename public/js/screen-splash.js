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
		panel = document.getElementById('screen-splash');
	}

	/** 
	 * @method run
	 */
	function run () {
		if(firstTime) {
			init();
		}
		dom.bind(panel, "click", function (e) {
			e.stopPropagation();
			e.preventDefault();
			dom.showScreenById("screen-menu"); //needs the closure
			elefart.screens["screen-menu"].run();
		});
	}

	//returned object
	return {
		init:init,
		run:run
	};
	
})();