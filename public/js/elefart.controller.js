/** 
 * @namespace
 * Controller functions
 * Major departures from book logic
 * adapted from Chapter 8, "interacting with the game"
 * supports:
 * - standard mouse desktop events
 * - mouse events on touch devices
 * - keyboard events
 * - virtual keyboard events
 */
elefart.controller = (function () {
	
	var 
	foreground = null, //reference to HTML5 canvas foreground
	firstRun = true;
    

    /** 
     * @method init
     * initialize the controller
     */
	function init () {
        
		console.log("initializing elefart controller");

		//get the canvas
		foreground = elefart.display.foreground;
		console.log("in elefart.controller, elefart.display.foreground is a:" + foreground);
        
        //keypress event listener
        document.addEventListener("keypress", function (e) {
            handleKeyPress();
        }, false);
        
        //mouse click listener
        foreground.addEventListener("click", function (e) {
            handleTouchPoint({
                                x:e.clientX,
                                y:e.clientY
                            });
        }, false);
        
        foreground.addEventListener("touchmove", function (e) {
            handleTouchPoint({
                                x:e.touches[0].clientX,
                                y:e.touches[0].clientY
                            });
        }, false);

		//setup event handler for canvas. it just returns the 
		//place that the user clicked, or put their finger on
	}
    

    
    /** 
	 * =========================================
	 * UTILITIES
	 * =========================================
	 */

    /** 
     * @method between
     * determines whether a value is between a minmum and maximum
     * @param {Number} num the number to test
     * @param {Number} b1 the first value
     * @param {Number} b2 the second value
     * @return {Boolean} if between, return true, else false
     */
    function between(num, b1, b2){
        result = false;
        
        if (b1 < b2){
            if (num > b1 && p < b2) {
                return true;
            }
        }
        else if (b1 > b2) {
            if(num > b2 && p < b1) {
            return true;
            }
        }
        else if(num == b1 || p == b2) {
            return true;
        }
        return false;
    }

    /** 
     * @method pointInRect
     * confirms whether a xy coordinate point is in a rectangle
     * used to make canvas objects "clickable"
     * @param {Point} pt an {x, y} point
     * @param {Rect} rt a {top, left, width, height} rectangle object. Rect object
     * structure matches that used in HTML5 canvas API
     */
    function pointInRect (pt, rt) {
        if(between(pt.x, rt.left, (rt.left + rt.width)) && between(pt.y, rt.top, (rt.top + rt.height))) {
            return true;
        }
        return false;
    }
    
    
    /** 
     * @method getClickPoint
     * get a coordinate 
     */
    function getClickPoint () {
        
    }
    
    /** 
     * @method getClickRect
     * get a bounding rectangle
     */
    function getClickRect () {
        
    }
	

	/** 
	 * =========================================
	 * EVENT LISTENER CALLBACKS
	 * =========================================
	 */
    
    
    /** 
     * @method handleKeyPress
     * handle key being pressed
     * @param {CharCode} k the character code for the key pressed
     */
    function handleKeyPress(k) {
        
    }
    
    
    /** 
     * @method handleTouchPoint
     * handle mouse clicks and touchmove events
     * @param {Point} pt and {x, y} coordinate where click or touch happened
     */
    function handleTouchPoint (pt) {
        //switch on game state
        
        //determine if a player, elevator, floor was selected
        
    }
    
    /** 
     * @method handleTouchRect
     * handle cases where a rect, rather than a point is returned for 
     * a touch or mouse event
     * @param {Rect} rt the rect where the event happened
     */
    function handleTouchRect(rt) {
        
    }
    
		
	function run () {
		if(firstRun) {
			init();
			firstRun = false;
		}
		console.log("elefart.controller::run()");
	}
	
	
	return {
		init:init,
		run:run
	};
	
})();