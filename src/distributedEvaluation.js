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

	+ `problemBuilder`: A function that builds the `Problem` instance to solve with the
	Metaheuristic. May require modules as arguments.

	+ `problemDependencies`: Modules required by the `problemBuilder`, that will be loaded with
	RequireJS. By default is `[]`.

	+ `args`: Extra arguments to consider for the evaluation. The element is always included, in
	the last argument. By default is `[]`.

	+ `fun`: The job function that performs the evaluation. By default is
	`problem.evaluation(element)`.

	+ `keepRunning`: If `true` leaves the server running after finishing. By default is `false`.
	*/
	function _checkArgs(args) {
		args = Object.assign({
			problemDependencies: [],
			fun: 'function (problem, element) {\n\treturn problem.evaluation(element);\n}',
			keepRunning: false
		}, args);
		//TODO Check if it is a Capataz instance.
		raiseIf(typeof args.server !== 'object', 'Invalid `server`!');
		//TODO Check if it is a Metaheuristic instance.
		raiseIf(typeof args.mh !== 'object', 'Invalid `metaheuristics`!');
		raiseIf(typeof args.problemBuilder !== 'function', 'Invalid `problemBuilder`!');
		raiseIf(!Array.isArray(args.problemDependencies), 'Invalid `problemDependencies`!');
		raiseIf(typeof args.fun !== 'function' && typeof args.fun !== 'string',
			'Invalid `jobPrototype.fun`!');
		return args;
	}

	/** Builds a new `evaluate` method for the problem's `Element` class, which schedules the job
	function in the capataz server.
	*/
	function evaluateFunction(args) {
		var server = args.server,
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
			return server.schedule({
				info: this.emblem(),
				imports: ['sermat', 'inveniemus', 'problem'],
				args: [Sermat.ser(this, { mode: Sermat.CIRCULAR_MODE })],
				fun: fun,
			}).then(function (evaluation) {
				element.evaluation = Array.isArray(evaluation) ? evaluation :
					isNaN(evaluation) ? null : [+evaluation];
				return evaluation;
			});
		};
	}

	/** The actual function.
	*/
	return function distributeEvaluation(args) {
		args = _checkArgs(args);
		var server = args.server,
			mh = args.mh,
			problem = mh.problem;
		/** If the metaheuristic has not been initialized with the problem, do so.
		*/
		if (!problem) {
			problem = args.problemBuilder.apply(null, args.problemDependencies.map(require));
			mh.problem = problem;
		}

		/** The `problemBuilder` is wrapped in a RequireJS definition and the server is configured
		to serve it as `problem.js`.
		*/
		server.expressApp.get(server.config.staticRoute +'/problem.js', function (request, response) {
			response.send("define("+ JSON.stringify(args.problemDependencies) +", "+
				args.problemBuilder +');'
			);
		});

		/** Change the element's `evaluate` method to schedule tasks in the Capataz server.
		*/
		problem.Element.prototype.evaluate = evaluateFunction(args);

		/** Log when every step finishes.
		*/
		mh.events.on('advanced', function () {
			var evalStat = mh.statistics.stat({ key:'evaluation', step: mh.step }),
				best = mh.state[0];
			server.logger.info("Advanced to step #"+ mh.step +". Evaluations "+ evalStat.minimum() +
				" < "+ evalStat.average() +" < "+ evalStat.maximum() +" (stddev: "+
				evalStat.standardDeviation() +").");
			server.logger.info("\tBest so far: "+ best.emblem() +".");
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
