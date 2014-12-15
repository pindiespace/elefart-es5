/** 
 * @namespace
 * elefart.screens['screen-menu']
 * at startup, show options for the app (play, info, quit)
 */
 window.elefart.screens['screen-menu'] = (function () {

	var dom = elefart.dom,
	id = 'screen-menu',
	panel,
	firstTime = true;

	/** 
	 * @method init
	 */
	function init () {
		panel = document.getElementById(id);
	}

	/** 
	 * @method run
	 */
	function run () {
		if(firstTime) {
			init();
		}
		//TODO: MESSED UP
		var buttonList = panel.getElementsByTagName("ul");
		dom.bind(buttonList, "click", function (e) {
			var id;
			if(e.srcElement) id = "screen-" + e.srcElement.name;
			else id = "screen-"+ e.target.name;
			console.log("Id:" + id)
			e.preventDefault();
			e.stopPropagation();
			dom.showScreenById(id);
			elefart.screens[id].run();
		});
	}

	//returned object
	return {
		init:init,
		run:run
	};
	
})();