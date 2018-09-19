const Parser = require('tap-parser');
const through = require('through2');
const duplexer = require('duplexer');

const getStatus = (status) => status ? 'Pass' : 'Fail';

const beautifyTest = (testInput) => {
	const { ok, id, name, diag } = testInput;
	const status = getStatus(ok); 
	const output = {
		status,
		id,
		name,
	};
	if (!ok) {
		output.stackTrace = {
			errorType: diag.name,
			errorMessage: diag.message,
			stackTrace: diag.values
		}
	}
	return output;
}

const generateSummary = (results) => {
	const { ok, count, pass, fail, failures } = results;
	return {
		testSuiteStatus: getStatus(ok),
		totalTests: count,
		testsPassed: pass,
		testsFailed: fail,
		failedTests: failures.map(beautifyTest)
	}
};

const jsonParser = () => {
	const tapParser = new Parser();
	const transform = through.obj();
	const tests = [];
	const out = duplexer(tapParser, transform);
	tapParser.on('complete', (results) => {
		const summary = generateSummary(results);
		const jsonReport = ({ ...summary, tests });
		transform.push(JSON.stringify(jsonReport));
		transform.emit('end');
		out.exitCode = results.ok ? 0 : 1;
	});
	tapParser.on('assert', testcase => tests.push(beautifyTest(testcase)));
	return out;
};

module.exports = jsonParser;