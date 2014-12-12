/** 
 * karma unit tests for Elefart
 * @link http://osintegrators.com/node/322
 */

"use strict";

describe(['js/elefart-building.js'], function(Elefart) {

	describe('elefart.building Logic', function() {

		it('should have child objects attached', function() {
			expect(typeof elefart.building).toBe('object');
		});

	});

});