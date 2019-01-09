import {
    Component,
    ElementRef,
    EventEmitter,
    forwardRef,
    Input,
    OnInit,
    Output,
    ViewChild
    } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, Validators } from '@angular/forms';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatButton } from '@angular/material/button';

import { InputFileRejectedReason } from '../../enums/input-file-rejected-reason';
import { InputFile } from '../../interfaces/input-file';
import { InputFileRejected } from '../../interfaces/input-file-rejected';
import { InputFileService } from '../../services/input-file.service';
import { defaultSettings } from '../../settings/default.settings';
import { urlValidator } from '../../validators/url.validator';

@Component({
    selector: 'input-file',
    templateUrl: './input-file.component.html',
    styleUrls: ['./input-file.scss'],
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => InputFileComponent),
            multi: true
        }
    ]
})
export class InputFileComponent implements ControlValueAccessor, OnInit {

    @Input() set fileAccept(fileAccept: string) {
        this._fileAccept = fileAccept;
    }

    get fileAccept() {
        return this._fileAccept || this.inputFileService.config.fileAccept || defaultSettings.fileAccept;
    }

    @Input() set fileLimit(fileLimit: number) {
        this._fileLimit = fileLimit;
    }

    get fileLimit() {
        return this._fileLimit || this.inputFileService.config.fileLimit || defaultSettings.fileLimit;
    }

    @Input() set iconAdd(iconAdd: string) {
        this._iconAdd = iconAdd;
    }

    get iconAdd() {
        return this._iconAdd || this.inputFileService.config.iconAdd || defaultSettings.iconAdd;
    }

    @Input() set iconDelete(iconDelete: string) {
        this._iconDelete = iconDelete;
    }

    get iconDelete() {
        return this._iconDelete || this.inputFileService.config.iconDelete || defaultSettings.iconDelete;
    }

    @Input() set iconFile(iconFile: string) {
        this._iconFile = iconFile;
    }

    get iconFile() {
        return this._iconFile || this.inputFileService.config.iconFile || defaultSettings.iconFile;
    }

    @Input() set iconLink(iconLink: string) {
        this._iconLink = iconLink;
    }

    get iconLink() {
        return this._iconLink || this.inputFileService.config.iconLink || defaultSettings.iconLink;
    }

    @Input() set linkEnabled(linkEnabled: boolean) {
        this._linkEnabled = linkEnabled;
    }

    get linkEnabled() {
        return this._linkEnabled || this.inputFileService.config.linkEnabled || defaultSettings.linkEnabled;
    }

    @Input() set placeholderLink(placeholderLink: string) {
        this._placeholderLink = placeholderLink;
    }

    get placeholderLink() {
        return this._placeholderLink || this.inputFileService.config.placeholderLink || defaultSettings.placeholderLink;
    }

    @Input() set sizeLimit(sizeLimit: number) {
        this._sizeLimit = sizeLimit;
    }

    get sizeLimit() {
        return this._sizeLimit || this.inputFileService.config.sizeLimit || defaultSettings.sizeLimit;
    }

    get canAddFile(): boolean {
        return this.files && this.files.length < this.fileLimit;
    }
    static nextId = 0;

    @Input() disabled: boolean;
    @Input() placeholder: string;

    @Output() acceptedFile = new EventEmitter<InputFile>();
    @Output() deletedFile = new EventEmitter<InputFile>();
    @Output() rejectedFile = new EventEmitter<InputFileRejected>();
    @ViewChild('fileInput') fileInput: ElementRef;

    addLink: boolean;
    files = new Array<InputFile>();
    form: FormGroup;
    id = `ngx-input-file-${InputFileComponent.nextId++}`;
    private _fileAccept: string;
    private _fileLimit: number;
    private _iconAdd: string;
    private _iconDelete: string;
    private _iconFile: string;
    private _iconLink: string;
    private _linkEnabled: boolean;
    private _placeholderLink: string;
    private _sizeLimit: number;
    onChange = (files: Array<InputFile>) => { };
    onTouched = () => { };

    constructor(
        private readonly formBuilder: FormBuilder,
        private readonly inputFileService: InputFileService
    ) { }

    /**
     * Angular lifecyle OnInit implementation.
     */
    ngOnInit(): void {
        this.setForm();
    }

    /**
     * On delete a file event handler.
     * @param index
     */
    onDeleteFile(index: number): void {
        if (!this.disabled) {
            const files = this.files.slice();
            this.deletedFile.emit(files[index]);
            files.splice(index, 1);
            this.writeValue(files);
        }
    }

    /**
     * On drag over event handler.
     * Adds a ripple effect on the button.
     */
    onDragOver(button: MatButton): void {
        button.ripple.launch({ centered: true, persistent: true });
    }

    /**
     * On drag leave event handler.
     * Fades the ripple effect of the button.
     */
    onDragLeave(button: MatButton): void {
        button.ripple.fadeOutAll();
    }

    /**
     * On adds a link.
     */
    onLink(): void {
        this.addLink = !this.addLink;
    }

    /**
     * On replace one file event handler.
     * Writes the value.
     * @param fileList
     * @param index
     * @param fileInput
     */
    onReplaceFile(fileList: FileList, index: number, button: MatButton, fileInput?: HTMLInputElement): void {
        if (!this.disabled) {
            // Copies the array without reference.
            const files = this.files.slice();
            // Assumes that a single file can be replaced by a single file.
            const inputFile: InputFile = { file: fileList.item(0) };
            button.ripple.fadeOutAll();
            if (this.fileGuard(files, inputFile, true)) {
                files[index] = inputFile;
                this.acceptedFile.emit(inputFile);
            }
            this.writeValue(files);
            if (fileInput) {
                fileInput.value = '';
            }
        }
    }

    /**
     * On select one or more files event handler.
     * Writes the value.
     * @param fileList
     */
    onSelectFile(fileList: FileList, button: MatButton): void {
        if (!this.disabled) {
            button.ripple.fadeOutAll();
            // Copies the array without reference.
            const files = this.files.slice();
            Array.from(fileList).forEach(file => {
                const inputFile: InputFile = { file };
                if (this.fileGuard(files, inputFile)) {
                    files.push(inputFile);
                    this.acceptedFile.emit(inputFile);
                }
            });
            this.writeValue(files);
            this.fileInput.nativeElement.value = '';
        }
    }

    /**
     * On submit the link form event handler.
     */
    onSubmitLink(): void {
        if (!this.disabled && this.form.valid) {
            const files = this.files.slice();
            const inputFile: InputFile = { link: this.form.value.link, preview: this.form.value.link };
            files.push(inputFile);
            this.acceptedFile.emit(inputFile);
            this.onLink();
            this.form.reset();
            this.writeValue(files);
        }
    }

    /**
     * Implementation of ControlValueAccessor.
     * @param fn
     */
    registerOnChange(fn: (files: Array<InputFile>) => void): void {
        this.onChange = fn;
    }

    /**
     * Implementation of ControlValueAccessor.
     * @param fn
     */
    registerOnTouched(fn: () => void): void {
        this.onTouched = fn;
    }

    /**
     * Implementation of ControlValueAccessor.
     * @param isDisabled
     */
    setDisabledState(isDisabled: boolean): void {
        this.disabled = isDisabled;
    }

    /**
     * Implementation of ControlValueAccessor.
     * @param files
     */
    writeValue(files: Array<InputFile>): void {
        if (!this.disabled) {
            this.files = files;
            this.setFilePreview();
            this.onChange(this.files);
        }
    }

    /**
     * Whether the file can be added to the model.
     * @param files
     * @param file,
     * @param bypassLimit
     */
    private fileGuard(files: Array<InputFile>, file: InputFile, bypassLimit?: boolean): boolean {
        if (!bypassLimit && !this.inputFileService.limitGuard(files, this.fileLimit)) {
            this.rejectedFile.emit({ reason: InputFileRejectedReason.limitReached, file });
            return false;
        }

        if (!this.inputFileService.sizeGuard(file.file, this.sizeLimit)) {
            this.rejectedFile.emit({ reason: InputFileRejectedReason.sizeReached, file });
            return false;
        }

        if (!this.inputFileService.typeGuard(file.file, this.fileAccept)) {
            this.rejectedFile.emit({ reason: InputFileRejectedReason.badFile, file });
            return false;
        }

        return true;
    }

    /**
     * Sets the file preview with FileReader.
     */
    private setFilePreview(): void {
        for (const index in this.files) {
            if (this.files[index].file != undefined && this.inputFileService.typeGuard(this.files[index].file, 'image/*')) {
                const fr = new FileReader();
                fr.onload = () => {
                    this.files[index].preview = fr.result;
                };
                fr.readAsDataURL(this.files[index].file);
            }
        }
    }

    /**
     * Sets the reactive form to insert a link.
     */
    private setForm(): void {
        this.form = this.formBuilder.group({
            link: ['', [Validators.required, urlValidator]]
        });
    }
}
