import { FileApi } from './base.js';
import frontmatter from 'frontmatter';
import { createMarkdownObjectTableSync } from 'parse-markdown-table';
import type { Metadata } from '../types.js';
import * as yaml from 'yaml';
import u from '@yanick/updeep';
import { markdownTable } from 'markdown-table';
import * as R from 'remeda';
import { parse } from 'csv-parse/sync';
import { stringify } from 'csv-stringify/sync';

import type { Data } from './base.js';

export class CSVFile<ENTRY = any> extends FileApi<ENTRY> {
	static ext = 'csv';

	async parse(content: string) {
		const entries = parse(content, {
			columns: true,
			comment: "#",
			comment_no_infix: true
		});

		const metadata = yaml.parse(content.split("\n").filter(x => x.startsWith('#')).map(x => x.replace(/^#\s*/, '')).join("\n"));

		return { metadata, entries };
	}

	async serialize(data: Data<ENTRY>) {

		const entries = u.map(data.entries, {
			roll: r => {
				if (!Array.isArray(r)) return r;
				return r.join('-');
			}
		});

		const metadata = yaml.stringify(data.metadata).split("\n").map(x => '# ' + x).join("\n");

		return [metadata, stringify(entries, { header: true })].join("\n");
	}
}
