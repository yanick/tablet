import fs from 'fs';
import frontmatter from 'frontmatter';
import { createMarkdownObjectTableSync } from 'parse-markdown-table';
import u from '@yanick/updeep';
import Roll from 'roll';
import * as prompt from '@inquirer/prompts';
import * as yaml from 'yaml';
import { markdownTable } from 'markdown-table';
import * as R from 'remeda';

const roll = new Roll();

type Metadata = {
	roll?: string,
	subtable?: string
};

export default class DataTable<ENTRY = Record<string, any>, META extends Metadata = Metadata> {
	path: string;
	metadata: META;
	entries: ENTRY[];

	constructor(path: string) {
		this.path = path;

		const parsed = frontmatter(
			fs.readFileSync(path, { encoding: 'utf8' })
		);

		this.metadata = parsed.data;
		this.entries = [...createMarkdownObjectTableSync(parsed.content)] as any as ENTRY[];

		for (const e of (this.entries as any[])) {
			if (e.roll?.includes('-')) {
				e.roll = e.roll.split('-').map(x => Number(x))
			}
			if (e.roll?.includes(',')) {
				e.roll = e.roll.split(',').map(x => Number(x))
			}
		}

	}

	async roll(value?: number): Promise<ENTRY> {
		if (!value) {
			if (!(this.metadata as any)?.roll)
				throw new Error('roll metadata not defined for table');

			value = roll.roll((this.metadata as any).roll).result;
		}

		// @ts-ignore
		const entry = this.entries.find(({ roll }: { roll: number | [number, number] }) => {
			if (Array.isArray(roll))
				return roll[0] <= value && roll[1] >= value;
			return roll == value;
		}) ?? await this.populateTableFor(value);

		if (this.metadata.subtable) {
			const subtable = entry[this.metadata.subtable];
			if (subtable)
				return new DataTable<ENTRY>(subtable).roll();
		}

		return entry;

	}

	async populateTableFor(value: number): Promise<ENTRY> {
		process.stdout.write(`${this.path}: rolled a ${value}, need to define a new entry\n\n`);

		let entry = {} as ENTRY;

		const [sample] = this.entries;

		for (const key in sample) {
			const result = await prompt.input({ message: key });
			// @ts-ignore
			entry[key] = result;
		}

		this.entries.push(entry);
		this.save();

		return entry;
	}

	async save() {
		const meta = yaml.stringify(this.metadata);

		const headers = Object.keys(this.entries[0]);
		let entries = u.map(this.entries, {
			roll: r => {
				if (!Array.isArray(r)) return r;
				return r.join('-');
			}
		});
		entries = R.sortBy(entries, (a) => a[headers[0]]);

		const table = markdownTable([
			headers, ...entries.map(e => headers.map(h => e[h]))
		]);

		const content = `---\n${meta}\n---\n${table}\n`;

		return fs.writeFileSync(this.path, content);
	}
}
