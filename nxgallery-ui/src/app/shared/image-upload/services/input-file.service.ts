import { Inject, Injectable } from '@angular/core';

import { InputFile } from '../interfaces/input-file';
import { InputFileConfig } from '../interfaces/input-file-config';

@Injectable({
    providedIn: 'root'
})
export class InputFileService {

    constructor(
        @Inject('config') private readonly _config: InputFileConfig
    ) { }

    get config(): InputFileConfig {
        return this._config;
    }

    /**
     * Whether the limit is not reached.
     */
    limitGuard(files: Array<InputFile>, fileLimit: number): boolean {
        return files.length < fileLimit;
    }

    /**
     * Whether the file size is not bigger than the limit.
     */
    sizeGuard(file: File, sizeLimit: number): boolean {
        return !sizeLimit || file.size < sizeLimit * 1024 * 1024; // TODO : improve
    }

    /**
     * Whether the type of the file is enabled.
     */
    typeGuard(file: File, fileAccept: string): boolean {
        let enabled = !fileAccept;
        if (fileAccept) {
            const accept = fileAccept.replace('*', '');
            const types = accept.split(',');
            for (const type of types) {
                if (file.type.startsWith(type) || (type.charAt(0) === '.' && !!file.name && file.name.endsWith(type))) {
                    enabled = true;
                    break;
                }
            }
        }

        return enabled;
    }
}
