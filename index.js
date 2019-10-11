const Parser = require('tap-parser');
const through = require('through2');
const duplexer = require('duplexer');

const getStatus = (status) => status ? 'Pass' : 'Fail';

const beautifyTest = (testInput) => {
	const { ok, id, name, todo } = testInput;
	const status = getStatus(ok); 
	const output = {
		status,
		id,
		name
	};

	// Skip todos for now
	if (todo) {
		return output;
	}

	if (!ok) {
		// For now we're using fast-fail so this will appear at times
		// Let's just skip this for now
		if (name.includes(' test remaining in ')) {
			return output;
		}

		const { diag } = testInput;

		output.stackTrace = {
			errorType: diag.name,
			errorMessage: diag.message,
			stackTrace: diag.values
		}

		const parts = diag.at.split('\n');
		const result = parts[parts.length - 1];
		const [path, startLine, endLine] = result.match(/\((.*)\)/)[1].split(':');

		output.path = path;
		output.startLine = startLine;
		output.endLine = endLine;

		output.assertion = diag.assertion;

		output.raw = testInput;
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
		const jsonReport = Object.assign({}, { start: new Date() }, summary, { tests });
		transform.push(`${JSON.stringify(jsonReport)}\n`);
		transform.emit('end');
		out.exitCode = results.ok ? 0 : 1;
	});
	tapParser.on('assert', testcase => tests.push(beautifyTest(testcase)));
	return out;
};

module.exports = jsonParser;