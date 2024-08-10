import { Directive, ElementRef, Renderer2, HostListener, Output, EventEmitter } from '@angular/core';

@Directive({
    standalone: true,
    selector: '[resizable]'
})
export class ResizableDirective {
    @Output() sizeChange = new EventEmitter<{status:string, width?: number; height?: number }>();

    private resizing = false;
    private startWidth = 0;
    private startHeight = 0;
    private startX = 0;
    private startY = 0;

    constructor(private el: ElementRef, private renderer: Renderer2) { }

    @HostListener('mousedown', ['$event'])
    onMouseDown(event: MouseEvent): void {
        if (this.isInResizeZone(event)) {
            this.resizing = true;
            this.startX = event.clientX;
            this.startY = event.clientY;

            const parent = this.el.nativeElement.parentElement;
            this.startWidth = parent.offsetWidth;
            this.startHeight = parent.offsetHeight;

            event.preventDefault();
            event.stopPropagation();
            this.sizeChange.emit({status:'startResizing'});
        }
    }

    @HostListener('document:mousemove', ['$event'])
    onMouseMove(event: MouseEvent): void {
        if (!this.resizing) {
            return;
        }

        const offsetX = event.clientX - this.startX;
        const offsetY = event.clientY - this.startY;

        const newWidth = this.startWidth + offsetX;
        const newHeight = this.startHeight + offsetY;

        const parent = this.el.nativeElement.parentElement;
        this.renderer.setStyle(parent, 'width', `${newWidth}px`);
        this.renderer.setStyle(parent, 'height', `${newHeight}px`);

        // Emit new size during resizing        
        this.sizeChange.emit({status:'resizing', width: newWidth, height: newHeight });
    }

    @HostListener('document:mouseup')
    onMouseUp(): void {
        this.resizing = false;
        this.sizeChange.emit({status:'stopResizing'});

    }

    private isInResizeZone(event: MouseEvent): boolean {
        const rect = this.el.nativeElement.getBoundingClientRect();
        const offsetX = event.clientX - rect.right;
        const offsetY = event.clientY - rect.bottom;
        const cornerSize = 10;
        return offsetX >= -cornerSize && offsetY >= -cornerSize;
    }
}
