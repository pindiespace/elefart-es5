/* 
 * building.js - elefart.building unit tests
 */
describe('Elefart building tests', function () {

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
		elefart.building.init();

		/* 
		 * set a timeout so that our first test is called 
		 * with a delay of 500msec, giving image assets time to load
		 */
		setTimeout(function () {
			done();
		}, 500);
	});

	//check elefart.building initialization
	it('should have elefart.building.world objects', function (done) {

		expect(typeof elefart.building).toBe('object');
		elefart.building.run();

		/* 
		 * set a timeout so the world has time to initialize
		 */
		setTimeout(function () {
			done();
		}, 100);

	});

	//check specific Building objects
	it('should have building components', function () {

		var ROOF = -1;
		
		//check if World object is returned
		var w = elefart.building.getWorld();
		expect(typeof w).toBe('object');

		//try to get Sky, Building
		var s = w.getSky();
		expect(typeof s).toBe('object');

		var sun = s.getSun();
		expect(typeof sun).toBe('object');

		var corona = sun.getCorona();
		expect(typeof corona).toBe('object');

		var clouds = s.getClouds();
		expect(typeof clouds).toBe('object');

		//BUILDING
		var b = w.getBuilding();
		expect(typeof b).toBe('object');

		//BuildingSign

		var sign = b.getSign();

		//BuildingFloors

		var floors = b.getFloors();

		var floor = b.getFloor(1);

		var baseHeight = floor.getBaseHeight();

		var floorBase = floor.getFloorBase();

		var floorHeight = b.getFloorHeight();

		var numFloors = b.getNumFloors();

		var numShafts = b.getNumShafts();

		var wallSize = b.getWallSize();


		//ElevatorShafts

		var shafts = b.getShafts();

		var shaft = b.getShaft(1);

		var subShaft = shaft.getSubShaft();


		var newFloors = shaft.getFloors();

		var shaftFloor = shaft.floorInShaft(2);

		//Elevator

		var elevator = shaft.getElevator();

		var shaft = elevator.getShaft();

		var newNumFloors = elevator.getNumFloors();

		var res = elevator.moveToFloor(3);
		var res2 = elevator.moveToFloor(ROOF);

		//FAILED
		var closestFloor = elevator.getClosestFloor();

		//Elevator Floor Queue
		
		elevator.initQueue ();

		elevator.floorInQueue(1);

		elevator.addFloorToQueue(3);

		elevator.removeFloorFromQueue(3);

		//BuildingRoof

		var roof = b.getRoof();

		var roofSides = roof.getRoofSides();

		var roofShaft = roof.getRoofShaft();

		var roofCupola = roof.getRoofCupola();

		var newRoofShaft = roofCupola.getRoofShaft();

	});


	afterEach(function () {

	});

});