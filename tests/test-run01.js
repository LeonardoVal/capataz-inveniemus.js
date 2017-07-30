/** # Test run 01

Distributing the element evaluation of a genetic algorithm solving the sum optimization testbed
problem.
*/
var base = require('creatartis-base'),
	capatazInveniemus = require('./lib/capataz-inveniemus.js'),
	capataz = capatazInveniemus.capataz,
	inveniemus = capatazInveniemus.inveniemus;

capatazInveniemus.distributeEvaluation({
	server: capataz.Capataz.run({
		port: 8088,
		workerCount: 2,
		desiredEvaluationTime: 2000, // 2 seconds.
		customFiles: './tests/lib',
		logFile: base.Text.formatDate(null, '"./tests/logs/test-run01-"yyyymmdd-hhnnss".txt"')
	}),
	mh: new inveniemus.metaheuristics.GeneticAlgorithm({
		problem: new inveniemus.problems.testbeds.sumOptimization(10),
		mutationRate: 0.4,
		size: 100,
		steps: 50
	})
});
