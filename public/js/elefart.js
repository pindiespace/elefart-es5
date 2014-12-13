/** 
 * @namespace elefart
 * main game object
 */
window.elefart = (function () {

	var screens = []
	TRUE = "true",
	FALSE = "false",
	UNKNOWN = -1,
	firstTime = true;

	/** 
	 * @method isStandalone
	 * @param {Enum} os
	 * @return {Boolean|UNKNOWN} if true or false, return, else return UNKNOWN (-1)
	 */
	function isStandalone (type) {
		if(window.navigator.standalone === undefined) {
			return true; //we don't want desktop bringing up an install screen!
		}
		else {
			if(type) {
				switch(type) {
					case 'ios':
						return !!(window.navigator.standalone);
						break;
					default:
						break;
				}
			}

		}
		return UNKNOWN;
	}

	/** 
	 * @method init
	 */
	function init () {

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
		screens:screens,
		init:init,
		run:run
	};

})();