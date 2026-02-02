import fs from 'fs/promises';
import type { Metadata } from '../types.js';

export type Data<ENTRY=any> = { entries?: ENTRY[], metadata?: Metadata};

export class FileApi<ENTRY=any> {
    static ext : string | string[] = [];


    constructor(public path?:string) {
    }

    async readFile() {
		return fs.readFile(this.path, { encoding: 'utf8' }).then(
			this.parse
		);
    }

    async writeFile(data: Data<ENTRY>) {
        const content = await this.serialize(data);
		return fs.writeFile(this.path, content);
    }

    async parse(content:string):Promise<Data<ENTRY>>  {
        return content as any;
    }

    async serialize(data:Data<ENTRY>) {
        return JSON.stringify(data,null,2);
    }
}
