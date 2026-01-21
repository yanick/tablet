import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

const argv = yargs(hideBin(process.argv))
	.scriptName('tablet')
	.command('roll <file>', 'roll for an entry in the table', (argv) => {
		console.log("we be rolling...")
	})
	.help()
	.parse();

