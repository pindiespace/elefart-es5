/** 
 * @namespace
 * Major departures from book logic
 */
elefart.controller = (function () {
	
	var 
	foreground = null, //reference to HTML5 canvas foreground
	firstRun = true;
	
	function init () {
		console.log("initializing elefart controller");

		//get the canvas
		foreground = elefart.display.foreground;
		console.log("in elefart.controller, elefart.display.foreground is a:" + foreground);

		//setup event handler for canvas. it just returns the 
		//place that the user clicked, or put their finger on



	}
	
	
	function run () {
		if(firstRun) {
			init();
			firstRun = false;
		}
		console.log("running elefart controller");
	}
	
	
	return {
		init:init,
		run:run
	};
	
})();