import { InputFileRejectedReason } from '../enums/input-file-rejected-reason';
import { InputFile } from '../interfaces/input-file';

export interface InputFileRejected {
    reason: InputFileRejectedReason;
    file: InputFile;
}
