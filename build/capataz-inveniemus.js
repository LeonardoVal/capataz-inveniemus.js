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

	Sermat.modifiers.mode = Sermat.CIRCULAR_MODE;

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
	/**
	*/
	function _defaultJobFunction(imports) {
		return (''+ function ($imports, element) {
			sermat.include(base);
			element = sermat.mat(element);
			return element.evaluate();
		}).replace('$imports', imports.join(', '));
	}

	/** Checks arguments and calculates default values.
	*/
	function _checkArgs(args) {
		args = Object.assign({
			keepRunning: false
		}, args);
		args.jobPrototype = Object.assign({
			imports: ['sermat', 'inveniemus']
		}, args.jobPrototype);
		args.jobPrototype.fun = args.jobPrototype.fun ||
			_defaultJobFunction(args.jobPrototype.imports);
		//TODO raiseIf(args.server instanceof capataz.Capataz, 'Invalid server!');
		//TODO raiseIf(args.mh instanceof inveniemus.Metaheuristic, 'Invalid metaheuristics!');
		raiseIf(typeof args.jobPrototype !== 'object', 'Invalid `jobPrototype`!');
		raiseIf(!Array.isArray(args.jobPrototype.imports), 'Invalid `jobPrototype.imports`!');
		var fun = args.jobPrototype.fun;
		raiseIf(typeof fun !== 'function' && typeof fun !== 'string',
			'Invalid `jobPrototype.fun`!');
		return args;
	}

	/** Builds a new `evaluate` method for the problem's `Element` class, which schedules the
	job function in the capataz server.
	*/
	function evaluateFunction(server, imports, fun) {
		return function scheduledEvaluate() {
			var element = this;
			return server.schedule({
				info: this.emblem(),
				fun: fun,
				imports: imports,
				args: [Sermat.ser(this)]
			}).then(function (evaluation) {
				element.evaluation = evaluation;
				return evaluation;
			});
		};
	}

	/**
	*/
	return function distributedEvaluation(args) {
		args = _checkArgs(args);
		var server = args.server,
			mh = args.mh;

		/** Change the element's `evaluate` method to schedule tasks in the Capataz server.
		*/
		mh.problem.Element.prototype.evaluate = evaluateFunction(args.server,
			args.jobPrototype.imports, args.jobPrototype.fun);

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