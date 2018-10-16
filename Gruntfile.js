// Gruntfile for [capataz-inveniemus.js](repo).

module.exports = function (grunt) {
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
	});

	require('@creatartis/creatartis-grunt').config(grunt, {
		sourceNames: ['__prologue__',
				'distributedEvaluation',
			'__epilogue__'],
		deps: [
			{ id: 'creatartis-base', name: 'base' },
			{ id: 'sermat', name: 'Sermat',
				path: 'node_modules/sermat/build/sermat-umd.js' },
			{ id: 'capataz' },
			{ id: 'inveniemus' }
		],
		karma: false, // No testing with Karma.
		docs: false
	});

	grunt.registerTask('build', ['compile']);//FIXME
	grunt.registerTask('default', ['build']);
};
