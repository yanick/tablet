import fs from 'fs/promises';
import { extname } from 'path';
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



type ParseFile = <ENTRY = any>(content: string) => Promise<{ entries: ENTRY[], metadata?: Metadata }>
type SerializeFile = <ENTRY = any>(table: DataTable<ENTRY>) => Promise<string>

async function readMarkdown(content: string) {
	const parsed = frontmatter(content);

	const metadata = parsed.data;
	const entries = [...createMarkdownObjectTableSync(parsed.content)];

	return { metadata, entries };
}

async function readYAML(content: string) {
	const parsed: any = yaml.parseAllDocuments(
		content
	).map(x => x.toJSON());

	if (parsed.length < 2) parsed.unshift({});

	const [metadata, entries] = parsed;

	return { metadata, entries };
}


function groomEntries(entries) {
	for (const e of entries) {
		if (e.roll?.includes('-')) {
			e.roll = e.roll.split('-').map(x => Number(x))
		}
		if (e.roll?.includes(',')) {
			e.roll = e.roll.split(',').map(x => Number(x))
		}
	}

	return entries;
}


export default class DataTable<ENTRY = Record<string, any>, META extends Metadata = Metadata> {
	path: string;
	metadata: Promise<META>;
	entries: Promise<ENTRY[]>;
	fileType: 'md';

	fileApis = [
		{ ext: '.md', read: readMarkdown, },//serialize: writeMarkdown },
		{ ext: ['.yaml', '.yml'], read: readYAML },//, serialize: writeYAML },
	];

	constructor(path: string) {
		this.path = path;

		const ext = extname(path);

		const fileApi = findApi(ext);
		if (!fileApi) {
			throw new Error(`extension '${ext}' not recognized`);
		}

		const file = fs.readFile(path, { encoding: 'utf8' }).then(
			fileApi.read
		);
		this.entries = file.then(R.prop('entries')).then(
			groomEntries
		) as Promise<ENTRY[]>;
		this.metadata = file.then(R.prop('metadata'));
	}

	findApi(ext: string) {
		return this.fileApis.find(
			api => Array.isArray(api.ext) ? api.ext.includes(ext) : ext === api.ext
		);
	}

	async roll(value?: number): Promise<ENTRY> {
		const metadata: any = await this.metadata;
		if (!value) {
			if (!metadata?.roll)
				throw new Error('roll metadata not defined for table');

			value = roll.roll(metadata.roll).result;
		}

		// @ts-ignore
		const entry = (await this.entries).find(({ roll }: { roll: number | [number, number] }) => {
			if (Array.isArray(roll))
				return roll[0] <= value && roll[1] >= value;
			return roll == value;
		}) ?? await this.populateTableFor(value);

		const { subtable } = await this.metadata;
		if (subtable) {
			const file = entry[subtable];
			if (file)
				return new DataTable<ENTRY>(file).roll();
		}

		return entry;

	}

	async populateTableFor(value: number): Promise<ENTRY> {
		process.stdout.write(`${this.path}: rolled a ${value}, need to define a new entry\n\n`);

		let entry = {} as ENTRY;

		const [sample] = await this.entries;

		for (const key in sample) {
			const result = await prompt.input({ message: key });
			// @ts-ignore
			entry[key] = result;
		}

		await this.entries.then(e => e.push(entry)).then(() => this.save());

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

		return fs.writeFile(this.path, content);
	}


}
