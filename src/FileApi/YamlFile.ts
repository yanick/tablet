import { FileApi } from './base.js';
import frontmatter from 'frontmatter';
import { createMarkdownObjectTableSync } from 'parse-markdown-table';
import type { Metadata } from '../types.js';
import * as yaml from 'yaml';
import u from '@yanick/updeep';
import { markdownTable } from 'markdown-table';
import * as R from 'remeda';
import type { Data } from './base.js';

export class YamlFile<ENTRY = any> extends FileApi<ENTRY> {
	static ext = ['yml', 'yaml'];

	async parse(content: string) {
		const parsed: any = yaml.parseAllDocuments(
			content
		).map(x => x.toJSON());

		if (parsed.length < 2) parsed.unshift({});

		const [metadata, entries] = parsed;

		return { metadata, entries };
	}

	async serialize(data: Data<ENTRY>) {

		let entries = data.entries;
		entries = u.map(entries, {
			roll: r => {
				if (!Array.isArray(r)) return r;
				return r.join('-');
			}
		});

		let content = yaml.stringify(entries);

		if (data.metadata) {
			content = `---\n${yaml.stringify(data.metadata)}\n---\n${content}\n`;
		}

		return content;
	}
}
