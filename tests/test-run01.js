/** # Test run 01

Distributing the element evaluation of a genetic algorithm solving the sum optimization testbed
problem.
*/
"use strict";
require('source-map-support').install();

var base = require('creatartis-base'),
	capataz = require('capataz'),
	inveniemus = require('inveniemus'),
	capataz_inveniemus = require('../build/capataz-inveniemus.js');

capataz_inveniemus.distributeEvaluation({
	server: capataz.Capataz.run({
		port: 8088,
		workerCount: 2,
		desiredEvaluationTime: 2000, // 2 seconds.
		logFile: base.Text.formatDate(null, '"./tests/logs/test-run01-"yyyymmdd-hhnnss".txt"')
	}),
	mh: new inveniemus.metaheuristics.GeneticAlgorithm({
		mutationRate: 0.4,
		size: 100,
		steps: 50
	}),
	problemBuilder: function (inveniemus) {
		return new inveniemus.problems.testbeds.sumOptimization(10);
	},
	problemDependencies: ['inveniemus']
});
