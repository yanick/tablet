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
import { MarkdownFile } from './FileApi/Markdown.js';
import { YamlFile } from './FileApi/YamlFile.js';
import type { FileApi } from './FileApi/base.js';

const roll = new Roll();

type Metadata = {
	roll?: string,
	subtable?: string
};

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
    fileApi: FileApi;

	fileApis = [
        MarkdownFile, YamlFile
	];

	constructor(path: string) {
		this.path = path;

		const ext = extname(path);

		const fileApi = this.findApi(ext);
		if (!fileApi) {
			throw new Error(`extension '${ext}' not recognized`);
		}

        this.fileApi = new fileApi<ENTRY>(path);
		const data:any = this.fileApi.readFile();
		this.entries = data.then(R.prop('entries')).then(
			groomEntries
		) as Promise<ENTRY[]>;
		this.metadata = data.then(R.prop('metadata'));
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
        return this.fileApi.writeFile({
            entries: await this.entries,
            metadata: await this.metadata,
        })
	}


}
