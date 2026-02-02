import { FileApi } from './base.js';
import type { Data } from './base.js';
import u from '@yanick/updeep';

export class JSONFile<ENTRY = any> extends FileApi<ENTRY> {
	static ext = '.json';

	async parse(content: string) {
		const parsed = JSON.parse(content);

		return parsed as any;
	}

	async serialize(data: Data<ENTRY>) {

		data = u(data, {
			entries: u.map({
				roll: r => {
					if (!Array.isArray(r)) return r;
					return r.join('-');
				}
			})
		});

		return JSON.stringify(data, null, 2);
	}
}
