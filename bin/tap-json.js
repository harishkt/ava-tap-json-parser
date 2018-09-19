
const customParser = require('../index.js');

const jsonParser = customParser();


process.stdin
	.pipe(jsonParser)
	.pipe(process.stdout);

process.on('exit', (code) => {
	if (code === 0 && jsonParser.exitCode !== 0) {
		process.exit(jsonParser.exitCode);
	}
});

