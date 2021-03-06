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
		board = elefart.board, //so view (this) can communicate with model (.board)
		displayPanel,          //display panel = gamePanel
		foreground,            //game foreground
		fctx,                  //context
		bkgnd,                 //game underlying background
		bctx,                  //context
		OPAQUE = 1.0,          //opaque objects
		DIMMED = 0.5,          //opacity of elevator door rect
		DOUBLE_DIMMED = 0.2,   //opacity of elevator door midline
		walls,                 //image with background pattern (hotel walls)
		hotelSign,             //image with hotel sign
		dimBldg,               //building dimensions
		width,
		height,

		elevatorWidth,
		elevatorHeight,
		elevatorTopMargin,
		elevatorLeftMargin,
		elevatorMoveInterval = 2, //how many pixels to increment an elevator

		personWidth,
		personHeight,
		personTopMargin,
		personLeftMargin,
		personMoveInterval = 4, //how many pixels to increment a person

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
	 * =========================================
	 * IMAGE PRELOADER
	 * =========================================
	 */

	
	/** 
	 * @method preload
	 * start game images loading before game screen appears
	 * in index.html after head.load(), called before other
	 * game modules load
	 */
	function preload () {
		
		console.log("elefart.display::preload(), image loading");
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
	 * =========================================
	 * PRELIMINARY DISPLAY CALCULATIONS
	 * DONE BEFORE DISPLAY INITIALIZATION SO 
	 * THEY CAN BE USED BY elefart.board
	 * =========================================
	 */

	/** 
	 * @method getFloorCount
	 */
	function getFloorCount () {
		floorCount = Math.ceil((height - floorOffsetHeight - gameUiHeight)/floorHeight);
		return floorCount;
	}

	/** 
	 * @method getFloorCols
	 * return the number of columns (a.k.a. elevator shafts)
	 * for the given screen
	 */
	function getShaftCount () {
		floorCols = Math.floor((width - floorOffsetWidth)/floorColWidth);        
		return floorCols;
	}
	
	/** 
	 * @method getFloor
	 * for a given {x, y} return the floor
	 * @param {Point} pt the {x, y}
	 * @returns {Number|-1} ZERO-BASED. If the floor is 
	 * found, return true, else -1 (first floor is 0, but 1 in the display)
	 */
	function getFloor(pt) {
		var f = floorCount - 1 - Math.ceil(0.5 + (pt.y - floorOffsetHeight - gameUiHeight)/floorHeight);
		if(f >= floorCount || f < 0) return -1;
		else return f;
	}
	
	/** 
	 * @method getShaft
	 * for a given {x, y} return the elevator shaft, if selection
	 * was in a legal region of the elevator shaft
	 * @param {Point} pt the {x, y}
	 * @returns {Number|-1} ZERO-BASED. If the shaft is found, return 
	 * true, else -1 (first shaft is 0, but 1 in the display)
	 */
	function getShaft(pt) {
		var s = Math.floor(0.5 + (pt.x - floorOffsetWidth)/floorColWidth) - 1;  
		if(s >= floorCols || s < 0) return -1;
		else return s;
	}
	
	/** 
	 * @method preInit
	 * called by elefart.game to pre-initialize and determine the number of floors 
	 * and elevators needed to compute board logic
	 * @param {HTMLDOMObject} panel the game screen
	 */
	function preInit (panel) {
	
		console.log("elefart.display::preload(), floors and floorCol calculations, panel:" + panel);

		displayPanel = panel; //DOM element with <canvas> inside
		
		//calculations before standard initialization
		var rect = displayPanel.getBoundingClientRect();
		
		//width and height of entire game
		width = rect.width;
		height = rect.height;
		
		//number of visible floors and elevator shafts
		getFloorCount();
		getShaftCount();
	
		//initialize canvas for foreground
		foreground = document.createElement('canvas');
		fctx = foreground.getContext("2d");
	
		//initialize canvas for background
		bkgnd = document.createElement('canvas');
		bctx = bkgnd.getContext("2d");
	}
	
	
	/** 
	 * @method init
	 * initialize the display
	 */	
	function init () {
		
		console.log("in display::init()");
		
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
		bkgnd.width = width;
		bkgnd.height = height;
		bkgnd.id = 'game-background';
		
		//make the foreground layer
		foreground.width = width;
		foreground.height = height;
		foreground.id = 'game-foreground';	
		
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
		ctx.save();
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
		ctx.restore();
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

		//draw the shaft end at the top floor
		drawShaftTop(floorCols - 1);

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

		//draw the top elevator exit
		bctx.lineWidth = 5;
		var s = column * floorColWidth;

		bctx.save();

		var grd = bctx.createLinearGradient(
			0, 
			0, 
			0, 
			2 + floorHeight/1.5 //floorHeight
			);

		grd.addColorStop(0, 'rgb(60, 40, 0)');
		grd.addColorStop(0.3, 'rgb(129,107,0)')
		grd.addColorStop(1, 'rgb(218, 207, 89)');

		//elevator top
		roundedRect(bctx, 
			s, 
			10, 
			floorColWidth, 
			floorHeight * 0.9, 3, 
			grd, //'rgba(218, 207, 59, 1.0)', //fill
			'rgba(0, 0, 0, 1.0)');     //stroke

		//wipe out bottom stroke
		bctx.fillStyle = "rgba(218, 207, 89, 1.0)";
		bctx.fillRect(s+3, 
			floorHeight,
			floorColWidth-6,
			14);

		//repaint bottom stroke
		bctx.fillStyle = 'rgba(64, 64, 64, 0.5)';
		bctx.fillRect(s, 
			floorHeight,
			floorColWidth,
			10)

		bctx.restore();

	}
	
	
	/** 
	 * =========================================
	 * FOREGROUND
	 * =========================================
	 */
	
	/** 
	 * @method drawElevatorBands
	 * draw bands defining elevator shaft
	 * @param {Boolean} dimFlag if true, double-dim
	 */
	function drawElevatorBands (dimFlag) {
		var bandMargin = 13,
		opaque;
		if(dimFlag) {
			opaque = DOUBLE_DIMMED;
		}
		fctx.save();
		var halfMargin =  floorColWidth + elevatorLeftMargin + bandMargin/2;
		var bandWidth = floorColWidth - bandMargin * 2;
		var bandHeight = floorCount * floorHeight;
		fctx.fillStyle = 'rgba(190, 30, 45, '+ opaque +')';

		for(var shaft = 0; shaft < floorCols; shaft++) {
			fctx.fillRect(
				(shaft * floorColWidth) + halfMargin, 
				floorOffsetHeight, 
				bandWidth, 
				bandHeight
			);
		}
		fctx.restore();
	}

	/** 
	 * @method drawElevators
	 * make elevators
	 * @param {Boolean} dimFlag if true, reduce opacity
	 */
	function drawElevators (dimFlag) {
		var elevators = board.elevators;
		var numFloors = board.dimensions.floors;
		fctx.lineWidth = 6;

		//draw each elevator
		for(var shaft = 0; shaft < elevators.length; shaft++) {
			var elev = elevators[shaft];
			fctx.lineWidth = 6;
			var startx = ((elev.shaft+1) * floorColWidth) + elevatorLeftMargin;
			var starty = ((numFloors - elev.floor) * floorHeight) + elevatorTopMargin;

			//animate movement
			if(elev.getState() === board.elevatorStates.MOVING) {
				var destFloor = elev.destinations[0];
				var inc = (elev.floor - destFloor) * floorHeight * (elev.increments/elev.maxIncrements);
				starty += inc;
			}

			//draw the elevator
			roundedRect(fctx, 
				startx, 
				starty, 
				elevatorWidth, 
				elevatorHeight, 
				6, 
				'rgba(255, 255, 255, '+ elev.opaque +')', 
				'rgba(0, 0, 0, ' + elev.opaque + ')'
			);

			//draw an elevator door
			for(var floor = 0; floor < numFloors; floor++) {
				if(floor !== elev.floor) {
					fctx.lineWidth = 2;
					starty = ((numFloors - floor) * floorHeight) + elevatorTopMargin;
					roundedRect(fctx, 
						startx, 
						starty, 
						elevatorWidth, 
						elevatorHeight, 
						2, 
						'rgba(218, 207, 59, '+DIMMED+')',
						'rgba(128, 128, 128, ' + DIMMED + ')'
					);

					//elevator door
					//TODO: THIS NEEDS TO BE WRITTEN FOR INDIVIDUAL DOOR PANELS
					//TODO: DOORS NEED TO BE OPEN OR CLOSED
					//draw horizontal line across top of elevator door
					fctx.globalAlpha = DOUBLE_DIMMED;
					fctx.beginPath();
						fctx.moveTo(startx, starty + fctx.lineWidth);
						fctx.lineTo(startx + elevatorWidth, starty + fctx.lineWidth);
					fctx.stroke();

					//draw central door divider
					var midx = startx + elevatorWidth/2;
					var midy = starty + elevatorHeight/2;
					fctx.beginPath();
						fctx.moveTo(midx, starty);
						fctx.lineTo(midx, starty + elevatorHeight);
					fctx.stroke();
					fctx.globalAlpha = 1.0;

					//DEBUG draw row, col
					fctx.font = '9pt Calibri';
					fctx.fillText(shaft + "," + floor, midx-9, midy);
				}
			}
		}
	}

	/** 
	 * @method drawElevatorDoor
	 * draw an elevator door at various stages of openness
	 */
	function drawElevatorDoor () {

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
		
		if(elefart.DEBUG) console.log("drawing user:" + board.users[i].uname);

		var personType = user.state,
		frameNum = user.frame+1,
		floorNum = user.floor+1,
		floorCol = user.shaft+1;

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

		var elev = board.getPersonElevator(user)
		if(elev) {
				if(elev.state === board.elevatorStates.MOVING) {
				var destFloor = elev.destinations[0];
				var inc = (elev.floor - destFloor) * floorHeight * (elev.increments/elev.maxIncrements);
				dRect.top += inc;
			}

		}
		
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
	 * @method drawForeground
	 * make the active layer of the display. Includes 
	 * People, Goodies (Perfume and Food), Elevators
	 * @param {Number} w width of game screen
	 * @param {Number} h height of game screen
	 */
	function drawForeground () {

		if(elefart.DEBUG) console.log("in display::drawForeground()");

		//clear the foreground
		fctx.clearRect(0, 0, foreground.width, foreground.height);

		drawElevators();

		//draw in the elevator bands and shaft top
		/*
		for(var x = 0; x < floorCols; x++) {
			drawElevatorBand(x+1, true);
		}
		*/
		drawElevatorBands(true);
		
		//draw in the default user
		//drawPerson(board.users[0]);
		for (var i = 0; i < board.users.length; i++) {
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
	 * @method drawDisplay
	 * NOTE: uses requestAnimationFrame()
	 * run the gameloop. the loop runs constantly, but 
	 * pauses and resumes based on state. User input is 
	 * handled separately
	 * the Model (elefart.controller) runs a separate 
	 * update loop for animation increments
	 */
	function drawDisplay () {

		if(elefart.DEBUG) console.log("gameState:" + game.state);

		var gameState = elefart.gameStates;
		//branch on game state
		switch(elefart.state) {
			case gameState.LOAD:
				break;
			case gameState.INTRO:
				break;
			case gameState.RUN:
				drawForeground();
				break;
			case gameState.HIGH_SCORES:
				break;
			case gameState.HELP:
				break;
			case gameState.EXIT:
				break;
			default:
				break;
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
	function run () {
		console.log("elefart.display::run() (canvas version)");
		if(firstRun) {
			init();
			
		}
		
		//background to game
		drawBackground();
		
		//game foreground objects
		//drawForeground();

		console.log("game:" +game);
				
		//add to display
		if(foreground && bkgnd) {
			displayPanel.appendChild(bkgnd);
			displayPanel.appendChild(foreground);
			drawDisplay(); //NOTE: redundant, make sure drawn before possible requestAnimationFrame lags
		}
		else {
			console.log("ERROR: failed to make canvas objects");
		}

	}
	
	return {
		preload:preload,
		preInit:preInit,
		init:init,
		foreground:foreground,
		//drawDisplay:drawDisplay,
		getShaftCount:getShaftCount,
		getFloorCount:getFloorCount,
		getFloor:getFloor,
		getShaft:getShaft,
		drawDisplay:drawDisplay,
		gridReadout:gridReadout,
		run:run
	};
	
})();
