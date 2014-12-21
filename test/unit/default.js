/** 
 * karma unit tests for Elefart
 * @link http://osintegrators.com/node/322
 * 
 * Command list
 * @link http://evanhahn.com/how-do-i-jasmine/
 */

"use strict";

describe("Counter tests", function () {

	it("Add gives the correct result", function () {
	// Arrange
		var num1 = 1;
		var num2 = 3;
		var expected = 4;

		// Act
		var result = num1 + num2;

		// Assert
		expect(result).toBe(expected);
	});

});


//base object tests

describe('Elefart base', function() {
	it('should have core objects attached', function () {

		//nonscreen objects
		expect(typeof elefart).toBe('object');
		expect(typeof elefart.dom).toBe('object');
		expect(typeof elefart.building).toBe('object');
		expect(typeof elefart.display).toBe('object'); 
		expect(typeof elefart.controller).toBe('object');
		expect(typeof elefart.dashboard).toBe('object');
		expect(typeof elefart.factory).toBe('object'); 

		//screen objects
		expect(typeof elefart.screens['screen-about']).toBe('object');
		expect(typeof elefart.screens['screen-splash']).toBe('object');
		expect(typeof elefart.screens['screen-install']).toBe('object');
		expect(typeof elefart.screens['screen-menu']).toBe('object');
		expect(typeof elefart.screens['screen-game']).toBe('object');
		expect(typeof elefart.screens['screen-join']).toBe('object'); 
		expect(typeof elefart.screens['screen-scores']).toBe('object');
		expect(typeof elefart.screens['screen-exit']).toBe('object');
	});

});
 

describe('Elefart factory', function () {

	beforeEach(function () {

		//initialize so we can load a 'dummy' HTML screen correctly
		var article = document.createElement('article');
		article.id = 'screen-splash';
		var docBody = document.getElementsByTagName("body")[0];
		docBody.appendChild(article);

		//initializations will work, and allow feature tests in elefart to run
		elefart.init();
		elefart.display.init();
		elefart.factory.init();
	});

	it('should have screen objects attached', function () {

		/**
		 * ============================
		 * FACTORY CONSTRUCTORS
		 * ============================
		 */

		expect(typeof elefart.factory).toBe('object');

		//Point and Line tests
		var p = new elefart.factory.Point(10, 10);
		expect(typeof p).toBe('object');
		expect(p.valid()).toBe(true);
		var l = new elefart.factory.Line(
			elefart.factory.Point(10, 20), 
			elefart.factory.Point(100, 200)
			);

		//Padding tests
		var pd = new elefart.factory.Padding(4,3,2,1);
		expect(typeof pd).toBe('object');
		expect(pd.valid()).toBe(true);

		//Rect tests
		var r = new elefart.factory.Rect(10, 100, 20, 200);
		expect(typeof r).toBe('object');
		expect(r.valid()).toBe(true);
		expect(r.top).toBe(100);
		expect(r.left).toBe(10);
		expect(r.bottom).toBe(300);
		expect(r.right).toBe(30);

		//Circle tests
		var c = new elefart.factory.Circle(20, 10, 200);
		expect(typeof c).toBe('object');
		expect(c.valid()).toBe(true);
		expect(c.top).toBe(10);
		expect(c.left).toBe(20);
		expect(c.bottom).toBe(410);
		expect(c.right).toBe(420);
		expect(c.width).toBe(400);
		expect(c.height).toBe(400);

		//Polygon tests
		var p = new elefart.factory.Polygon([
			elefart.factory.Point(1,2), 
			elefart.factory.Point(3,20),
			elefart.factory.Point(9, 10)]
			);

		expect(typeof p).toBe('object');
		expect(p.valid()).toBe(true);
		var b = p.enclosingRect();
		expect(typeof b).toBe('object');
		expect(b.top).toBe(2);

		/**
		 * ============================
		 * CHECK GETTER METHODS
		 * ============================
		 */

		var inside;

		//check pointInside
		inside = elefart.factory.ScreenRect(4, 5, 20, 20).pointInside(
			elefart.factory.Point(3, 2)
			);
		expect(inside).toBe(false);
		inside = elefart.factory.ScreenRect(1, 0, 20, 20).pointInside(
			elefart.factory.Point(3, 2)
			);
		expect(inside).toBe(true);
		inside = elefart.factory.ScreenRect(1, 0, 20, 20).pointInside(
			elefart.factory.Point(10, 100)
			);
		expect(inside).toBe(false);
		inside = elefart.factory.ScreenRect(1, 0, 20, 20).pointInside(
			elefart.factory.Point(33, 6)
			);
		expect(inside).toBe(false);

		//check insideRect
		inside = elefart.factory.ScreenRect(10, 40, 200, 500).insideRect(
			elefart.factory.Rect(20, 60, 100, 300)
			);
		expect(inside).toBe(false);
		inside = elefart.factory.ScreenRect(10, 40, 100, 300).insideRect(
			elefart.factory.Rect(4, 9, 400, 600)
			);
		expect(inside).toBe(true);

		//check intersectRect
		var collide = elefart.factory.ScreenRect(10, 40, 100, 300).intersectRect(
			elefart.factory.Rect(4, 9, 400, 600)
			);
		expect(collide).toBe(true);

		//check getCenter
		var center = elefart.factory.ScreenRect(20, 100, 16, 9).getCenter();
		expect(center.x).toBe(28);
		expect(center.y).toBe(104);

		//check centerOnPoint
		var mv = elefart.factory.ScreenRect(0, 0, 100, 200);
		mv.centerOnPoint(
			elefart.factory.Point(200, 400)
			);
		expect(mv.left).toBe(150);
		expect(mv.top).toBe(300);

		/**
		 * ============================
		 * CHECK SETTER METHODS
		 * ============================
		 */

		//check move
		mv.move(50, 50);
		expect(mv.left).toBe(200);
		expect(mv.top).toBe(350);

		//check moveTo
		mv.moveTo(200, 300);
		expect(mv.left).toBe(200);
		expect(mv.top).toBe(300);

		//check setDimensions
		mv.setDimensions(100, 100);
		expect(mv.width).toBe(100);
		expect(mv.height).toBe(100);

		//check centerOnPoint
		mv.centerOnPoint(
			elefart.factory.Point(300, 300)
			);
		expect(mv.left).toBe(250);
		expect(mv.top).toBe(250);

		//center centerInRect
		mv.centerInRect(elefart.factory.ScreenRect(200, 200, 400, 400));
		expect(mv.left).toBe(350);
		expect(mv.top).toBe(350);

		//check scale
		mv.scale(2.0);
		expect(mv.width).toBe(200);
		expect(mv.height).toBe(200);

		//check setRectPadding
		mv.setRectPadding(elefart.factory.Padding(4,5,6,7));

		//check setRectBorderRadius
		mv.setRectBorderRadius(4);

		/**
		 * ============================
		 * CHECK ADD/REMOVE CHILD OBJECTS
		 * ============================
		 */

		//check addChild
		mv.addChild(elefart.factory.ScreenRect(33,55,100,300)); //add a child
		var child = elefart.factory.ScreenRect(20, 20, 10, 10); //create our test child
		var childId = child.id;
		mv.addChild(child); //add our test child
		mv.addChild(elefart.factory.ScreenRect(4, 2, 200, 300)); //add another child
		expect(mv.children.length).toBe(3);
		expect(mv.children[1].id).toBe(childId);

		//check findChild
		var foundChild = mv.findChild(childId);
		expect(foundChild.id).toBe(childId);

		//check removeChild
		foundChild = mv.removeChild(childId);
		expect(foundChild.id).toBe(childId);
		expect(mv.children.length).toBe(2);

		/**
		 * ============================
		 * CHECK VISUAL METHODS
		 * ============================
		 */

		//create an ScreenObject
		var vis = elefart.factory.ScreenRect(10, 20, 50, 50);

		//check setGradient
		var canvas = document.createElement('canvas');
		expect(typeof canvas).toBe('object');
		var ctx = canvas.getContext('2d');
		expect(typeof ctx).toBe('object');
		var grad = ctx.createLinearGradient(0, 0, 0, 50); 
		expect(typeof grad).toBe('object');
		vis.setGradient(grad);

		//check setOpacity
		vis.setOpacity(0.5);

		//check setStroke
		vis.setStroke(4, 'rgb(50,59,50');

		//check setFill
		vis.setFill('#ccddcc');

		var path = 'img/icon/apple-touch-icon.png';

		//check setImage
		vis.setImage(path, 
			function (imgObj) {
				console.log("img width:" + imgObj.img.width);
			});

		//check Image features are ok
		expect(vis.img.src.indexOf(path)).toBeGreaterThan(-1);
		expect(typeof vis.img).toBe('object');

		//try adding a filter function
		var filter = function (img) {
			return img;
		}
		vis.setFilter(filter);

		/**
		 * ============================
		 * TESTS COMPLETE
		 * ============================
		 */

		//kill objects
		grad = ctx = canvas = null;

	});

	afterEach(function() {

	});

});

describe('Elefart building', function () {

	beforeEach(function () {
		elefart.building.init();
	});

	it('should have screen objects attached', function () {
		expect(typeof elefart.building).toBe('object');
		//var r = new elefart.building.Elevator();
		
	});

	afterEach(function () {

	});
});


describe('Elefart display', function () {

	beforeEach(function () {
		elefart.display.init();
	});

	it('should have screen objects attached', function () {
		expect(typeof elefart.display).toBe('object');
	});

	afterEach(function () {

	});

});