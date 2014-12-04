/** 
 * @namespace
 * Major departures from book logic
 */
elefart.controller = (function () {
	
	var firstRun = true;
	
	function init () {
		console.log("initializing elefart controller");
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