/** 
 * karma unit tests for Elefart
 * @link http://osintegrators.com/node/322
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
		//expect(typeof elefart).toBe('object');
		//expect(typeof elefart.dom).toBe('object');
		//expect(typeof elefart.building).toBe('object');
		//expect(typeof elefart.display).toBe('object'); 
		//expect(typeof elefart.controller).toBe('object');
		//expect(typeof elefart.dashboard).toBe('object');
		expect(typeof elefart.factory).toBe('object'); 
	});

});


describe('Elefart screens', function () {
	it('should have screen objects attached', function () {
		expect(typeof elefart.screens['screen-about']).toBe('object');
		expect(typeof elefart.screens['screen-splash']).toBe('object');
		expect(typeof elefart.screens['screen-install']).toBe('object');
		expect(typeof elefart.screens['screen-menu']).toBe('object');
		expect(typeof elefart.screens['screen-game']).toBe('object');
		expect(typeof elefart.screens['screen-join']).toBe('object'); 
		expect(typeof elefart.screens['screen-about']).toBe('object'); 
		expect(typeof elefart.screens['screen-scores']).toBe('object');
		expect(typeof elefart.screens['screen-exit']).toBe('object');
	});
});


//screen object tests

describe('Make Rect', function () {

	it('should have consistent params', function () {
/*
		var r = new elefart.make.Rect (10, 20, 100, 200);
		expect(r.top).toBe(10);
		expect(r.left).toBe(20);
		expect(r.width).toBe(100);
		expect(r.height).toBe(200);
		expect(r.bottom).toBe(120);
		expect(r.right).toBe(210);
*/
	});

});


describe('Make Circle', function () {

	it('should have consistent params', function () {
/*
		var c = new elefart.make.Circle(10, 20, 50);
		expect(c.top).toBe(10);
		expect(c.left).toBe(20);
		expect(c.bottom).toBe(120);
		expect(c.right).toBe(110);
*/
	});

});
