(function (init) { "use strict";
			if (typeof define === 'function' && define.amd) {
				define(["creatartis-base","sermat","capataz","inveniemus"], init); // AMD module.
			} else if (typeof exports === 'object' && module.exports) {
				module.exports = init(require("creatartis-base"),require("sermat"),require("capataz"),require("inveniemus")); // CommonJS module.
			} else {
				this.Sermat = init(this.base,this.Sermat,this.capataz,this.undefined); // Browser.
			}
		}).call(this,/** Library capataz-inveniemus wrapper and layout.
*/
function __init__(base, Sermat, capataz, inveniemus){ "use strict";

// Import synonyms. ////////////////////////////////////////////////////////////////////////////////
	var raiseIf = base.raiseIf;

// Library layout. /////////////////////////////////////////////////////////////////////////////////
	var exports = {
		__package__: 'capataz-inveniemus',
		__name__: 'capataz_inveniemus',
		__init__: __init__,
		__dependencies__: [base, Sermat, capataz, inveniemus]
	};
	exports.capataz = capataz;
	exports.inveniemus = inveniemus;

// See __epilogue__.js


/** # Distributed evaluation.

Usually the vast majority of the processing budget of a metaheuristic is dedicated to the evaluation
of the objective function (e.g. fitness in evolutionary computing). Hence, it makes sence in most
cases to set up a distributed run so that the clients execute the evaluations of candidate
solutions, while the server handles all the rest.
*/

exports.distributeEvaluation = (function () {
	/** The arguments are:

	+ `server`: A configured Capataz server,

	+ `mh`: An Inveniemus' Metaheuristic instance.

	+ `imports`: Extra modules to load for the evaluation. Sermat and Inveniemus are always
	included. By default is `[]`.

	+ `args`: Extra arguments to consider for the evaluation. The element is always included, in
	the last argument. By default is `[]`.

	+ `fun`: The job function that performs the evaluation. By default is `element.evaluate()`.

	+ `keepRunning`: If `true` leaves the server running after finishing. By default is `false`.
	*/
	function _checkArgs(args) {
		args = Object.assign({
			imports: [], // Extra imports.
			args: [], // Extra arguments.
			fun: 'function (element) {\n\treturn element.evaluate();\n}',
			keepRunning: false
		}, args);
		//TODO Check if it is a Capataz instance.
		raiseIf(typeof args.server !== 'object', 'Invalid `server`!');
		//TODO Check if it is a Metaheuristic instance.
		raiseIf(typeof args.mh !== 'object', 'Invalid `metaheuristics`!');
		raiseIf(!Array.isArray(args.imports), 'Invalid `imports`!');
		raiseIf(typeof args.fun !== 'function' && typeof args.fun !== 'string',
			'Invalid `jobPrototype.fun`!');
		return args;
	}

	/** Builds a new `evaluate` method for the problem's `Element` class, which schedules the job
	function in the capataz server.
	*/
	function evaluateFunction(args) {
		var SERVER = args.server,
			IMPORTS = ['sermat', 'inveniemus'].concat(args.imports),
			ARGS = args.args,
			fun = 'function () {\n'+
				'\tvar Sermat = arguments[0],\n'+
				'\t\tinveniemus = arguments[1];\n'+
				'\tSermat.include(base);\n'+
				'\targuments[arguments.length-1] = Sermat.mat(arguments[arguments.length-1]);\n'+
				'\treturn ('+ args.fun +
					').apply(this, Array.prototype.slice.call(arguments, 2));\n'+
				'}';
		return function scheduledEvaluate() {
			var element = this;
			return SERVER.schedule({
				info: this.emblem(),
				fun: fun,
				imports: IMPORTS,
				args: ARGS.concat([Sermat.ser(this, { mode: Sermat.CIRCULAR_MODE })])
			}).then(function (evaluation) {
				element.evaluation = evaluation;
				return evaluation;
			});
		};
	}

	/** The actual function.
	*/
	return function distributeEvaluation(args) {
		args = _checkArgs(args);
		var server = args.server,
			mh = args.mh;

		/** Change the element's `evaluate` method to schedule tasks in the Capataz server.
		*/
		mh.problem.Element.prototype.evaluate = evaluateFunction(args);

		/** Log when every step finishes.
		*/
		mh.events.on('advanced', function () {
			var evalStat = mh.statistics.stat({ key:'evaluation', step: mh.step }),
				best = mh.state[0];
			server.logger.info("Advanced to step #"+ mh.step +". Evaluations "+ evalStat.minimum() +
				" < "+ evalStat.average() +" < "+ evalStat.maximum() +". Best so far: "+
				best.emblem() +".");
		});

		/** Set the server to stop when the run finishes.
		*/
		var keepRunning = !!args.keepRunning;
		function end() {
			if (!keepRunning) {
				server.logger.info("Stopping server.");
				setTimeout(process.exit, 10);
			}
			return mh;
		}
		return mh.run().then(function () {
			server.logger.info("Finished.");
			return end();
		}, function (error) {
			server.logger.error(error +'');
			return end();
		});
	};
})(); // distributeEvaluation()


// See __prologue__.js

	return exports;
});
//# sourceMappingURL=capataz-inveniemus.js.map