/** 
 * note: for unit tests, we used explict loading to get JS files in correct order, 
 * without using requireJS
 * to see detailed output, press the "DEBUG" button, then open "inspect element" in 
 * the blank page that loads
 */
module.exports = function(config){
	
	config.set({

	basePath : '../',

	files : [

		'test/unit/*.js',
		'test/unit/**/*.js',
		{pattern: 'public/js/elefart-netmessage.js', watched: true, included: true, served: true},
		{pattern: 'public/js/elefart.js', watched: true, included: true, served: true},
		{pattern: 'public/js/elefart-make.js', watched: true, included: true, server: true},
		{pattern: 'public/js/elefart-dom.js', watched: true, included: true, served: true},
		{pattern: 'public/js/screen-splash.js', watched: true, included: true, served: true},
		{pattern: 'public/js/screen-install.js', watched: true, included: true, served: true},
		{pattern: 'public/js/screen-menu.js', watched: true, included: true, served: true},
		{pattern: 'public/js/elefart-dashboard.js', watched: true, included: true, served: true}, 
		{pattern: 'public/js/elefart-building.js', watched: true, included: true, served: true},
		{pattern: 'public/js/elefart-display.js', watched: true, included: true, served: true}, 
		{pattern: 'public/js/elefart-controller.js', watched: true, included: true, served: true},
		{pattern: 'public/js/screen-game.js', watched: true, included: true, served: true}, 
		{pattern: 'public/js/screen-join.js', watched: true, included: true, served: true}, 
		{pattern: 'public/js/screen-about.js', watched: true, included: true, served: true}, 
		{pattern: 'public/js/screen-scores.js', watched: true, included: true, served: true},
		{pattern: 'public/js/screen-exit.js', watched: true, included: true, served: true}
	],

    autoWatch : true,

    //frameworks to use
    frameworks: ['jasmine'],

    //web server port
    port: 9876,

    //enable / disable colors in the output (reporters and logs)
    colors: true,

    //test browser
    browsers : ['Chrome'],

    plugins : [
            'karma-chrome-launcher',
            'karma-firefox-launcher',
            'karma-jasmine'
            ],

	reporters: ['progress', 'junit']

  });
};