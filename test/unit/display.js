/* 
 * display.js - elefart.display unit tests
 */

describe('Elefart.display tests', function () {

	/*
	 * we pass in a function (done) {...} to beforeEach
	 * so that we can add a setTimeout() delay which allows elefart.display 
	 * to run the preload() image loading function before starting our tests
	 * @link http://www.htmlgoodies.com/beyond/javascript/stips/using-jasmine-2.0s-new-done-function-to-test-asynchronous-processes.html
	 */
	beforeEach(function (done) {

		var article, docBody;
		//initialize so we can load a 'dummy' HTML screen correctly
		article = document.createElement('article');
		article.id = 'screen-splash';
		article.style.width = "1024px";
		article.style.height = "800px";
		docBody = document.getElementsByTagName("body")[0];
		if(!docBody) {
			docBody = document.createElement('body');
		}
		docBody.style.width = "1024px";
		docBody.style.height = "800px";
		docBody.appendChild(article);

		//initializations will work, and allow feature tests in elefart to run
		elefart.init();
		elefart.controller.init();
		elefart.display.init();
		elefart.display.run(article); //start it loading its media assets
		elefart.factory.init();
		/* 
		 * set a timeout so that our first test is called 
		 * with a delay of 500msec
		 */
		setTimeout(function () {
			done();
		}, 500);
	});



	it('should have elefart.display objects', function () {
		expect(typeof elefart.display).toBe('object');

		var disp = elefart.display;

		var breakPoint = disp.getCSSBreakpoint();

		var gameRect = disp.getGameRect();

		var skyTexture = disp.getBackgroundTexture(disp.MATERIALS.GRADIENT_SKY, 0, 0, 0, 200);

		var cloudTexture = disp.getForegroundTexture (disp.MATERIALS.GRADIENT_CLOUD, 0, 0, 0, 100);

	});

	afterEach(function () {

	});

});