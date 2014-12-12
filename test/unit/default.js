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


describe('Elefart base', function() {
	it('should have child objects attached', function() {
		expect(typeof elefart.screens['screen-about']).toBe('object');
	});

});
