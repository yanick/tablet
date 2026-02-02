#!/usr/bin/env node

import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import DataTable from '../DataTable.js';

const argv = yargs(hideBin(process.argv))
	.scriptName('tablet')
	.command({
		command: 'roll <file>',
		describe: 'roll to select an entry of the table',
		handler: async (argv) => {
			const table = new DataTable(argv.file);

			const Printer = table.findApi('md');
			const printer = new Printer();

			console.log(
				await printer.serialize({
					entries: [await table.roll()]
				})
			);
		}
	})
	.command({
		command: 'print <file>',
		describe: 'print the table to stdout',
		handler: async (argv) => {
			const table = new DataTable(argv.file);

			const Printer = table.findApi('md');
			const printer = new Printer();

			console.log(
				await printer.serialize({
					metadata: await table.metadata,
					entries: await table.entries,
				})
			);
		}
	})
	.help()
	.parse();

