import { FileApi } from './base.js';
import frontmatter from 'frontmatter';
import { createMarkdownObjectTableSync } from 'parse-markdown-table';
import type { Metadata } from '../types.js';
import * as yaml from 'yaml';
import u from '@yanick/updeep';
import { markdownTable } from 'markdown-table';
import * as R from 'remeda';
import type { Data } from './base.js';

export class MarkdownFile<ENTRY=any> extends FileApi<ENTRY> {
    static ext = '.md';

    async parse(content:string) {
        const parsed = frontmatter(content);

        const metadata = parsed.data;
        const entries = [...createMarkdownObjectTableSync(parsed.content)];

        return { metadata, entries } as any;
    }

    async serialize(data:Data<ENTRY>) {
		const meta = yaml.stringify(data.metadata);

		const headers = Object.keys(data.entries[0]);
		let entries = u.map(data.entries, {
			roll: r => {
				if (!Array.isArray(r)) return r;
				return r.join('-');
			}
		});
		entries = R.sortBy(entries, (a) => a[headers[0]]);

		const table = markdownTable([
			headers, ...entries.map(e => headers.map(h => e[h]))
		]);

		return `---\n${meta}\n---\n${table}\n`;
    }
}
