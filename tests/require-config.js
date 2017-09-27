// Generated code, please do NOT modify.
(function () { "use strict";
	define([], function () {
		var config = {
			"paths": {
				"capataz-inveniemus": "../build/capataz-inveniemus",
				"creatartis-base": "../node_modules/creatartis-base/build/creatartis-base.min",
				"sermat": "../node_modules/sermat/build/sermat-umd",
				"capataz": "../node_modules/capataz/build/capataz_node.min",
				"inveniemus": "../node_modules/inveniemus/build/inveniemus.min",
				"express": "../node_modules/express/index"
			}
		};
		if (window.__karma__) {
			config.baseUrl = '/base';
			for (var p in config.paths) {
				config.paths[p] = config.paths[p].replace(/^\.\.\//, '/base/');
			}
			config.deps = Object.keys(window.__karma__.files) // Dynamically load all test files
				.filter(function (file) { // Filter test modules.
					return /\.test\.js$/.test(file);
				}).map(function (file) { // Normalize paths to RequireJS module names.
					return file.replace(/^\/base\/(.*?)\.js$/, '$1');
				});
		}
		require.config(config);
		console.log("RequireJS configuration: "+ JSON.stringify(config, null, '  '));
	});
})();