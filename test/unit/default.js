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
	it('should have child objects attached', function () {
		expect(typeof elefart.screens['screen-about']).toBe('object');
	});

});


//screen object tests

describe('Elefart Make ScreenRect', function () {

	it('should have consistent params', function () {
		var sr = new elefart.make.ScreenRect(0, 0, 100, 200);
		expect(sr.x).toBe(0);
		expect(sr.y).toBe(0);
		expect(sr.width).toBe(100);
		expect(sr.height).toBe(200);
	});

});

