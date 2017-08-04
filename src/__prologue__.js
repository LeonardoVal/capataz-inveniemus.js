/** Library capataz-inveniemus wrapper and layout.
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
