/** 
 * display-canvas.js
 * functions mapping game operations to the 
 * canvas ui
 * NOTE: we use 'display' rather than 'display-canvas' since 
 * it allows us to conditionally load other display Ui systems
 * (flash, DOM images)
 */
elefart.display = (function () {
	var dom = elefart.dom,
		$ = dom.$,
		board = elefart.board,
		game = elefart.game,
		foreground,    //game foreground
		fctx,          //context
		bkgnd,         //game underlying background
		bctx,          //context
		walls,         //image with background pattern (hotel walls)
		hotelSign,     //image with hotel sign
		dimBldg,       //building dimensions
		width,
		height,
		elevatorWidth,
		elevatorHeight,
		elevatorTopMargin,
		elevatorLeftMargin,
		personWidth,
		personHeight,
		personTopMargin,
		personLeftMargin,
		floorHeight,
		//offsets for numbers (left) and roof (top)
		floorOffsetWidth = 30,
		floorOffsetHeight = 60,
		gameUiHeight = 100,
		//floor columnWidth and height
		floorColWidth = 50,
		floorHeight = 60,
		floorDivHeight = 10,
		floorCount = 6,
		floorCols = 6,
		//character spriteboard
		spriteWidth = 100,
		spriteHeight = 150,
		spriteBoard,   //image with sprites
		firstRun = true;
	

	/** 
	 * @method getFloorCount
	 */
	function getFloorCount () {
		return floorCount;
	}

	/** 
	 * @method getFloorCols
	 * return the number of columns (a.k.a. elevator shafts)
	 * for the given screen
	 */
	function getFloorCols () {
		return floorCols;
	}
	
	/** 
	 * @method preload
	 * start game images loading before game screen appears
	 * in index.html after head.load()
	 */
	function preload () {
		console.log("elefart.display::preload()");
		//hotel wallpaper
		walls = new Image();
		walls.onload = function() {
			console.log("display::preload(), loaded background patterns");
      		};
      		walls.src = 'img/bkgnd/wallpaper.png';
		
		//hotel sign
		hotelSign = new Image();
		hotelSign.onload = function () {
			console.log("display::preload(), loaded hotel sign");
		}
		hotelSign.src = 'img/game/hotel_sign.png';
		
		//character sprites
		spriteBoard = new Image ();
		spriteBoard.onload = function () {
			console.log("display::preload(), loaded character sprites");
		}
		spriteBoard.src = 'img/game/spriteboard.png';
	}
	
	/** 
	 * @method init
	 * initialize the display
	 */	
	function init (gamePanel) {
		
		console.log("in display::init()");
		var rect = gamePanel.getBoundingClientRect();
		
		//width and height of entire game
		width = rect.width;
		height = rect.height;
		
		//number of visible floors
		floorCount = Math.ceil((height - floorOffsetHeight - gameUiHeight)/floorHeight);

		//scale elevator to floor
		elevatorWidth =  floorColWidth * 0.75; //floorColWidth - 12;
		elevatorLeftMargin = Math.floor((floorColWidth - elevatorWidth)/2);
		elevatorHeight = floorHeight * 0.65; //fractional
		elevatorTopMargin = floorHeight - elevatorHeight;
		
		personWidth = elevatorWidth * 0.75;
		personLeftMargin = Math.floor((elevatorWidth - personWidth)/2);
		personHeight = elevatorHeight * 0.9;
		personTopMargin = elevatorHeight - personHeight;
	
		//make the background layer
		bkgnd = document.createElement('canvas');
		bkgnd.id = 'game-background';
		bctx = bkgnd.getContext("2d");
		bkgnd.width = width;
		bkgnd.height = height;
		
		//make the foreground layer
		foreground = document.createElement('canvas');
		foreground.id = 'game-foreground';
		fctx = foreground.getContext("2d");
		foreground.width = width;
		foreground.height = height;	
		
		//set initialization flag
		firstRun = false;
	}
	
	
	/** 
	 * =========================================
	 * GENERIC OBJECTS
	 * =========================================
	 */
	 
	
	/** 
	 * @method roundRect
	 * since rounded rects aren't part of the HTML5 spec, do one here
	 * @link https://sites.google.com/a/rdaemon.com/rdaemon/home/html5-canvas-rounded-rectangle
	 * @param {Canvas Context} ctx current drawing context
	 * @param {Number} x topleft x position
	 * @param {Number} y topleft y position
	 * @param {Number} w width of rect
	 * @param {Number} h height of rect
	 * @param {Canvas Style} fillstyle style for fill
	 * @param {Canvas Style} strokestyle stle for stroke
	 */
	function roundedRect(ctx, x, y, w, h, r, fillstyle, strokestyle) {
		ctx.beginPath();
		ctx.fillStyle = fillstyle;
		ctx.moveTo(x + r, y);
		ctx.lineTo(x + w - r, y);
		ctx.quadraticCurveTo(x + w, y, x + w, y+r);
		ctx.lineTo(x+w, y+h-r);
		ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
		ctx.lineTo(x+r, y+h);
		ctx.quadraticCurveTo(x, y+h, x, y+h-r);
		ctx.lineTo(x, y+r);
		ctx.quadraticCurveTo(x, y, x+r, y);
		ctx.fill();
		ctx.strokeStyle = strokestyle;
		ctx.stroke();
		ctx.closePath();
	}
	
	/** 
	 * @method circle
	 * draw a circle with a specific stroke and fill
	 * @param {Canvas Context} ctx current drawing context
	 * @param {Number} x position of circle
	 * @param {Number} y position of circle
	 * @param {Number} radius size of circle
	 * @param {Number} linewidth the width of the stroke around circle
	 * @param {Canvas Style} fill style, which may be a gradient object
	 * @param {Canvas Style} stroke style
	 */
	function circle (ctx, x, y, radius, linewidth, fillstyle, strokestyle) {
		bctx.fillStyle = fillstyle;
		bctx.beginPath();
		bctx.arc(x, y, radius, 0, 2 * Math.PI);
		bctx.fill();
		bctx.lineWidth = linewidth;
		bctx.strokeStyle = strokestyle;
		bctx.stroke();
	}
	
	
	/** 
	 * @method spriteFrame
	 * grab an image from a larger sprite image, part of animation sequence
	 * more specific functions grab specific images from specific sprites
	 * @param {Number} row row of frame
	 * @param {Number} col column of frame
	 * frame.width = width of sprite 
	 * frame.height = the height of the sprite
	 * frame.hspace = horizontal space between frames
	 * frame.vspace = vertical space between frames
	 * a rect with the width and height of the frame
	 * destRect.top = where to start drawing in ctx
	 * destRect.left = where to start drawing in ctx
	 * destRect.width = scaled width in ctx
	 * destRect.height - scaled height in ctx
	 */
	function spriteFrame (ctx, img, captRect, destRect, opacity) {

		ctx.save();
		ctx.globalAlpha = opacity;	
		ctx.drawImage(
			img, 
			captRect.left, 
			captRect.top,  
			captRect.width, 
			captRect.height, 
			destRect.left, 
			destRect.top, //destRect.top, 
			destRect.width, 
			destRect.height
			);
		
		ctx.restore();
	}
	

	/** 
	 * =========================================
	 * IMAGE FILTERING VIA CANVAS
	 * =========================================
	 */
	
	/** 
	 * function getPixels
	 * get the pixel RGB(A) data from an image
	 * @param {Image} image to return pixel data from
	 * @return {Array} array with image data
	 */
	function getPixels (img, c) {
		c.width = img.width;
		c.height = img.height;
  		var ctx = c.getContext('2d');
		ctx.drawImage(img);
		return ctx.getImageData(0, 0, c.width, c.height);
	}
	
	/** 
	 * function filterImage
	 * HTML5 canvas filters applied to image
	 * put image as first array member, then arguments, then 
	 * call filter function, applying arguments
	 * @link http://www.html5rocks.com/en/tutorials/canvas/imagefilters/
	 * @param {Function} filter the filtering function we apply our image and arguments to
	 * @param {Image} JS image object
	 * @param {Array} varArgs additional arguments
	 * @return {Canvas ImageData} image data object returned by 
	 * HTML5 CanvasContext.getImageData()
	 */
	function filterImageData (filter, img, varArgs) {
		var c = document.createElement('canvas');
		var args = [getPixels(img, c)];
		for (var i = 2; i < arguments.length; i++) {
			args.push(arguments[i]);
		}
		return filter.apply(null, args);	
	}
	
	/** 
	 * function getFilteredImage
	 * get a filtered image as a new JS image object
	 */
	function getFilteredImage (img, filter, varArgs) {
		var c = document.createElement('canvas');
		var args = [getPixels(img, c)];
		for (var i = 2; i < arguments.length; i++) {
			args.push(arguments[i]);
		}
		var pixels = filter.apply(null, args);	
		return (new Image().src = c.toDataURL());
	}

	
	/** 
	 * @method filterGrayscale
	 * filter function converts image to grayscale
	 * @param {Canvas ImageData} image data object returned by 
	 * HTML5 CanvasContext.getImageData()
	 * @param {Array} args additional arguments needed for the filter
	 */
	function filterGrayscale (pixels, args) {
		var d = pixels.data;
		for(var i = 0; i < d.length; i += 4) {
		var r = d[i];
		var g = d[i+1];
		var b = d[i+2];
		// CIE luminance for the RGB
		// The human eye is bad at seeing red and blue, so we de-emphasize them.
		var v = 0.2126*r + 0.7152*g + 0.0722*b;
		d[i] = d[i+1] = d[i+2] = v
		}
		return pixels;
	}
	
	/** 
	 * @method filterBrighten
	 * brighten the image by a give value
	 */
	function filterBrighten (pixels, adjustment) {
		var d = pixels.data;
		for(var i = 0; i < d.length; i += 4) {
			
			if(d[i] + adjustment > 255) d[i] = 255;
			else d[i] += adjustment;
			
			if(d[i+1] + adjustment > 255) d[i+1] = 255;
			else d[i+1] += adjustment;
			
			if(d[i+2] + adjustment > 255) d[i+2] = 255;
			else d[i+2] += adjustment;
		}
  		return pixels;
	};
	
	/** 
	 * @method filterTint
	 */
	function filterTint (pixels, r, g, b) {
		var d = pixels.data;
		for(var i = 0; i < d.length; i += 4) {
			
			var rr = r + d[i];
			if(rr > 255) rr = 255;
			if(rr < 0) rr = 0;
			d[i] = rr;
			
			var gg = g + d[i+1];
			if(gg > 255) gg = 255;
			if(gg < 0) gg = 0;
			d[i+1] = gg;
			
			var bb = b + d[i+2];
			if(bb > 255) bb = 255;
			if(bb < 0) bb = 0;
			d[i+2] = bb;
		}
		return pixels;
	}
	
	/** 
	 * =========================================
	 * BACKGROUND
	 * =========================================
	 */
	
	
	/** 
	 * @method drawBackground
	 * make the active layer of the display
	 * used canvas gradient maker
	 * @link http://victorblog.com/html5-canvas-gradient-creator/
	 * css gradient maker
	 * @link http://www.colorzilla.com/gradient-editor/
	 * @param {Number} w width of game screen
	 * @param {Number} h height of game screen
	 */
	function drawBackground () {
		//save current state
		bctx.save();
		
		//////////////////////////////////////////////
		//yellow background
		bctx.fillStyle = "rgba(248, 237, 29, 1.0)";
		bctx.rect(0, 0, width, height);
		bctx.fill();
		
		/////////////////////////////////////////////
		//sky above building
		drawSky();
		
		/////////////////////////////////////////////
		//Hotel sign
		drawHotelSign();
		
		/////////////////////////////////////////////
		//floor wallpaper patterns (load images)
		drawWallPaper();
		
		/////////////////////////////////////////////
		//make floor divisions, compute floor count
		var c = floorCount,
		fCols = 0,
		fCount= 0;

		for(var y = floorOffsetHeight; y < height; y += floorHeight) {
			
			//count the number of floor columns and floors (checksum)
			fCols++;
			fCount++;
			
			//floor division (horizontal band)
			bctx.fillStyle = 'rgba(0, 0, 0, 1.0)';
			bctx.fillRect(0, y, width, floorDivHeight);
			
			//floor number (leftmost column)
			if(y > floorHeight) {
				//set up floor number
				bctx.font="32px Times New Roman";
				var leftMargin = 7; var ssMargin = leftMargin + 10;
				bctx.fillText(c--, leftMargin, y - 5);
				var ss = y - 23;
				bctx.font = "14px Times New Roman"; //superScript
				var suffix = "th";
				if(c == 0) {
					suffix = "st";
					bctx.fillText(suffix, ssMargin + 4, ss);
				}
				else if(c < 3) {
					suffix = "nd";
					bctx.fillText(suffix, ssMargin + 6, ss);
				}
				else {
					bctx.fillText(suffix, ssMargin + 6, ss);
				}
			}	
			//floor bottom shadow		
			bctx.fillStyle = 'rgba(96, 56, 19, 0.8)';
			bctx.fillRect(0, y+floorDivHeight, width, floorDivHeight/3);
		}
		
		bctx.restore(); //reset to original
		
	}
	
	/** 
	 * @method drawSky
	 * draw the sky above the building roof
	 */
	function drawSky () {
		
		/////////////////////////////////////////////
		//top of building, sky gradient
		var grd = bctx.createLinearGradient(0, 0, 0, floorOffsetHeight);
		grd.addColorStop(0.000, 'rgba(34,133,232,1)');
		grd.addColorStop(0.180, 'rgba(71,151,211,1)');
		grd.addColorStop(0.400, 'rgba(102,164,214,1)');
		grd.addColorStop(1.000, 'rgba(227,238,247,1)');
		bctx.fillStyle = grd;
		bctx.fillRect(0, 0, width, floorOffsetHeight);
		
		/////////////////////////////////////////////
		//make sun
		var sunX = floorOffsetWidth + (floorColWidth * 5.2);
		var sunY = (floorOffsetHeight/2);
		var radius = (sunY - 2) * 0.70;
		grd = bctx.createRadialGradient(sunX, sunY, 5.000, sunX, sunY, radius+2);
		grd.addColorStop(0.000, 'rgba(255, 255, 255, 1.000)');
		grd.addColorStop(0.050, 'rgba(255, 255, 0, 1.000)');
		grd.addColorStop(0.390, 'rgba(255, 212, 170, 1.000)');
		grd.addColorStop(1.000, 'rgba(255, 127, 0, 1.000)');
		circle(bctx, sunX, sunY, radius, 6, grd, 'white');		
	}
	
	/** 
	 * @method drawWallpaper
	 * draw the wallpaper for each floor (one large image used)
	 */
	function drawWallPaper () {
		bctx.save();
		bctx.globalAlpha = 0.4;
		bctx.drawImage(walls, 0, 0, walls.width/2, walls.height/1.85, 0, floorOffsetHeight, width, height - floorOffsetHeight);
		bctx.restore();		
	}
	
	/** 
	 * @method drawHotelSign
	 * draw the hotel sign on the top of the building
	 */
	function drawHotelSign () {
		bctx.drawImage(hotelSign, 0, 0, hotelSign.width, hotelSign.height, 0, floorOffsetHeight/3, width/2.0, floorOffsetHeight/1.5);		
	}
	
	
	/** 
	 * @method drawShaftTop
	 * make the end of the elevator shaft on the top floor of the building
	 * @param {Number} column which column to position the top shaft above
	 */
	function drawShaftTop (column) {
		bctx.lineWidth = 6;
		roundedRect(bctx, 
		(column * floorColWidth), 
		10, 
		floorColWidth, 
		floorHeight * 0.9, 3, 
		'rgba(96, 56, 19, 1.0)', 
		'rgba(0, 0, 0, 1.0)');		
	}
	
	
	/** 
	 * =========================================
	 * FOREGROUND
	 * =========================================
	 */
	
	
	/** 
	 * @method drawElevatorBand
	 */	
	function drawElevatorBand(column) {
		fctx.fillStyle = 'rgba(190, 30, 45, 0.2)';
		var bandMargin = 13;
		fctx.fillRect(
			(column * floorColWidth) + bandMargin - 1, 
			floorOffsetHeight, 
			1 + floorColWidth - bandMargin * 2, 
			(floorCount * floorHeight)
			);		
		
	}
	
	/** 
	 * @method drawElevator
	 * make elevator
	 */
	function drawElevator (startFloor, column, dimFlag) {
		startFloor = floorCount - startFloor + 2;
		if(dimFlag) {
			opaque = '0.5';
		}
		else {
			opaque = '1.0';
		}
		column--;  //convert from 1-based to zero-based
		startFloor--; //convert from 1-based to zero-based
		fctx.lineWidth = 6;
		roundedRect(fctx, 
			(column * floorColWidth) + elevatorLeftMargin, 
			(startFloor * floorHeight) + elevatorTopMargin, 
			elevatorWidth, 
			elevatorHeight, 
			6, 
			'rgba(255, 255, 255, '+ opaque +')', 
			'rgba(0, 0, 0, ' + opaque + ')'
			);
	}
	
	
	/** 
	 * @method drawElevatorDoors
	 */
	function drawElevatorDoors (startFloor, column) {
		startFloor = floorCount - startFloor + 2;
		column--;  //convert from 1-based to zero-based
		startFloor--; //convert from 1-based to zero-based
		fctx.lineWidth = 2;
		var opaque = 0.2;
		var startx = (column * floorColWidth) + elevatorLeftMargin;
		var starty = (startFloor * floorHeight) + elevatorTopMargin; 
		roundedRect(fctx, 
			startx, 
			starty, 
			elevatorWidth, 
			elevatorHeight, 
			2, 
			//'rgba(0, 0, 0, '+ opaque +')', 
			'rgba(218, 207, 59, 1.0)',
			'rgba(128, 128, 128, ' + opaque + ')'
			);
			
		var midx = startx + elevatorWidth/2;
		fctx.beginPath();
      		fctx.moveTo(midx, starty);
      		fctx.lineTo(midx, starty + elevatorHeight);
      		fctx.stroke();
		
		fctx.beginPath();
		fctx.moveTo(startx, starty + fctx.lineWidth);
		fctx.lineTo(startx + elevatorWidth, starty + fctx.lineWidth);
		fctx.stroke();
	}
	
	/** 
	 * @method drawPerson
	 * make an elevator guy (sprite animation)
	 * @param {board.user} user a game user object (gives user type, which in turn
	 * determines which row of sprites to read)
	 * @param {Number} frameNum which image to take, going horizontally, in the sprite table
	 * @param {Number} floorCol x position on the floor
	 * @param {Number} floorNum y position, which floor in building
	 fame 0, one pixel to left, 1, floor 1
	 */
	function drawPerson (user) {
		
		var personType = user.state,
		frameNum = user.frame+1,
		floorNum = user.row+1,
		floorCol = user.col+1;
		
		floorNum = floorCount - (floorNum - 1); //convert from 1-based to zero-based
		frameNum--; //convert from 1-based to zero-based
		//floorCol--; //convert from 1-based to zero-based
				
		//set up grab rectangle from spriteboard
		var cRect = {
			top: personType * spriteHeight,
			left: frameNum * spriteWidth,
			width:spriteWidth,
			height:spriteHeight
		};
		
		//set up drawing position
		var dRect = {
			top: (floorNum * floorHeight) + floorOffsetHeight - elevatorHeight + personTopMargin, //where to start drawing in ctx
			left: (floorCol * floorColWidth) + floorOffsetWidth - (elevatorWidth/2), 
			width: personWidth,                           //scaled width in ctx
			height: personHeight                              //scaled height in ctx
		};
				
		//create a character at a specified position and size. 
		//Dim if not the default character
		var opacity = 1.0;
		if(!user.local) {
			opacity = 0.5;
		}
		spriteFrame(fctx, spriteBoard, cRect, dRect, opacity);
	}
		 
	/** 
	 * @method makeSelection
	 * make selection layer, shows user's choice of elevator
	 * path to avoid farts
	 */
	function makeSelection () {
		
	}
		
	/** 
	 * @method drawGoodies
	 * make goodies (food and perfume)
	 */
	function drawGoodies () {
		
	}
	
	/** 
	 * @method drawUi
	 * make the default game dashboard at the 
	 * bottom of the screen
	 */
	function drawUi () {
		
	}
	 
	/** 
	 * @method makeForeground
	 * make the active layer of the display. Includes 
	 * People, Goodies (Perfume and Food), Elevators
	 * @param {Number} w width of game screen
	 * @param {Number} h height of game screen
	 */
	function makeForeground () {

		console.log("in display::makeForeground()");
		
		//fill in the elevators
		for(var y = 0; y <= floorCount; y++) {
			for(var x = 2; x <= floorCols; x++) {
				if(board.getElevator(y, x-2)) {
					drawElevator(y+1, x, false);
				}
				else if(y < floorCount) {
					drawElevatorDoors(y+1, x);
				}
			}
		}
		
		var noShaftTop = true;
		
		//draw in the bands and shaft top
		for(var x = 2; x <= floorCols; x++) {
			drawElevatorBand(x-1);			
			for(var y = 0; y <= floorCount; y++) {
				//check if there is an elevator below us
				if(board.getElevator(y, x-2) && board.getElevator(y, x-2)) {
					//drawElevatorBand (y+1, y+2, x-1);
					//draw in the shaft top
					if(noShaftTop && y == floorCount-1) {
						drawShaftTop(x-1);
						noShaftTop = false;
					}
				}
			}
		}
		
		//if shaftTop wasn't drawn (no nearby elevators) put it in (so it doesn't obscure the sign)
		if(noShaftTop) {
			drawShaftTop(floorCols - 3);	
		}
		
		//draw in the default user
		//drawPerson(board.users[0]);
		for (var i = 0; i < board.users.length; i++) {
			console.log("drawing user:" + board.users[i].uname);
			drawPerson(board.users[i]);	
		}

	}
	
	
	/** 
	 * =========================================
	 * CREATE OBJECT COLLECTIONS (driven by 
	 * elefart.board.js logic
	 * =========================================
	 */
	
	/** 
	 * @method make
	 * make the foreground and background of the game display
	 * Grid Dimensions
	 * - Width: 320
	 * - Height: 480
	 * - Rows:
	 * 		* Topmost:40
	 * 		* 6 more rows of 60 = 360
	 * - Columns:
	 * 		* Leftmost: 30
	 * 		* 6 more rows of 50 = 300
	 */
	function makeDisplay (gamePanel) {
		console.log("in display.makeDisplay()");
		
		//background to game
		drawBackground();
		
		//game foreground objects
		makeForeground();
		
		//add to display
		if(foreground && bkgnd) {
			gamePanel.appendChild(bkgnd);
			gamePanel.appendChild(foreground);		
		}
		else {
			console.log("ERROR: failed to make canvas objects");
		}
	}
	
	/** 
	 * @method gridReadout
	 * this function returns an object with the 
	 * final calculations of game sizes and dimensions
	 */
	function gridReadout () {
		console.log("--------------------------------");
		console.log("GAME:");
		console.log(" - game dimensions:" + width + "x" + height);
		console.log(" - ui left ends at:" + floorOffsetWidth);
		console.log(" - building roof starts at:" + floorOffsetHeight);
		console.log(" - floorCount:" + floorCount);
		console.log(" - floorCell:" + floorColWidth + "x" + floorHeight);
		console.log("--------------------------------");
	}
	
	/** 
	 * =========================================
	 * RUN FUNCTIONS
	 * =========================================
	 */
	/** 
	 * @method run
	 * run the routines needed when screen becomes visible
	 * @param {DOMElement} gamePanel the DOM element we are adding the game to
	 */
	function run (gamePanel) {
		console.log("elefart.display::run() (canvas version)");
		if(firstRun) {
			init(gamePanel);
			
		}
		makeDisplay(gamePanel);
	}
	
	return {
		preload:preload,
		init:init,
		foreground:foreground,
		makeDisplay:makeDisplay,
		getFloorCols:getFloorCols,
		getFloorCount:getFloorCount,
		gridReadout:gridReadout,
		run:run
	};
	
})();
