module.exports = function(grunt) {

	//npm install -g grunt-cli
	/** 
	 * grunt-jsdoc
	 * @link https://www.npmjs.com/package/jsdoc
	 * @link http://gruntjs.com/getting-started
	 * @link http://sixrevisions.com/javascript/grunt-tutorial-01/
	 * grunt-contrib-copy
	 * @link https://www.npmjs.com/package/grunt-contrib-copy
	 * @link http://gruntjs.com/plugins
	 * @link https://github.com/krampstudio/grunt-jsdoc
	 */

	//configure tasks
	grunt.initConfig({

		pkg: grunt.file.readJSON('package.json'),
		jsdoc : {
			dist : {
				src: ['public/js/*.js', 'test/*.js'], 
				options: {
					destination: 'doc',
					template : "node_modules/grunt-jsdoc/node_modules/ink-docstrap/template/",
					configure : "node_modules/grunt-jsdoc/node_modules/ink-docstrap/template/jsdoc.conf.json"
				}
			}
		},
		copy : {
			plyo: {
				expand: true,
				cwd: 'public/',
				src: '**',
				dest: '../games/elefart'
			}
		}
	});

	//load the plugin that provides the jsdoc task
	grunt.loadNpmTasks('grunt-jsdoc');
	grunt.loadNpmTasks('grunt-contrib-copy');


	// Default task(s).
	grunt.registerTask('default', ['jsdoc', 'copy']);

};
