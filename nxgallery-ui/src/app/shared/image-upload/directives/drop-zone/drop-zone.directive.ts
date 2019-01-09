import {
    Directive,
    EventEmitter,
    HostListener,
    Input,
    Output,
    } from '@angular/core';

@Directive({
    selector: '[inputFileDropZone]'
})
export class DropZoneDirective {
    @Input() disabled = false;
    @Output() itemDragOver = new EventEmitter<any>();
    @Output() itemDragLeave = new EventEmitter<any>();
    @Output() itemDrop = new EventEmitter<any>();

    private isOver: boolean;
    // Prevent dragleave on children, could be better but it's cheap for better performance
    private readonly whiteListClasses = ['file-button', 'mat-button-wrapper', 'input-icon'];

    /**
     * Drag Over event handler.
     * @param event
     */
    @HostListener('dragover', ['$event']) onDragOver(event: DragEvent): void {
        this.preventAndStopEventPropagation(event);
        if (!this.isOver && !this.disabled) {
            this.isOver = true;
            this.itemDragOver.emit();
        }
    }

    /**
     * Drag Leave event handler.
     * @param event
     */
    @HostListener('dragleave', ['$event']) onDragLeave(event: DragEvent): void {
        this.preventAndStopEventPropagation(event);
        if (this.isOver && this.isTrueLeave(event) && !this.disabled) {
            this.isOver = false;
            this.itemDragLeave.emit();
        }
    }

    /**
     * Drop event handler.
     * @param event
     */
    @HostListener('drop', ['$event']) onDrop(event: any): void {
        if (!this.disabled && event instanceof DragEvent) {
            this.preventAndStopEventPropagation(event);
            this.isOver = false;
            try {
                this.itemDrop.emit(event.dataTransfer.files);
            } catch (e) {
                console.error(e);
            }
        }
    }

    /**
     * Prevents and stops event propagration.
     * @param event
     */
    private preventAndStopEventPropagation(event: Event): void {
        event.preventDefault();
        event.stopPropagation();
    }

    /**
     * Checks if the leave is not trigger by a children.
     * @param event
     */
    private isTrueLeave(event: DragEvent): boolean {
        for (const c of this.whiteListClasses) {
            if (event.fromElement != undefined && event.fromElement.className.indexOf(c) >= 0) {
                return false;
            }
        }
        return true;
    }
}
