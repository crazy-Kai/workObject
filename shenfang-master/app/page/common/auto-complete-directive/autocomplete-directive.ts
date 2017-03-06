import { Directive, HostListener, ElementRef, ComponentFactoryResolver, ComponentRef, ViewContainerRef, ComponentFactory, Output, EventEmitter } from '@angular/core';
import { AutocompleteWindowComponent } from './autocomplete-window.component';
import { Position, layout } from '../../../util/position';

@Directive({
	selector: '[autocomplete]',
	host: {
		'(keyup)' :'onkeyup($event)'
	}
})

export class AutocompleteDirective {
	private componentFactory: ComponentFactory<AutocompleteWindowComponent>;
	private componentRef: ComponentRef<AutocompleteWindowComponent>;
	private positionInfo: Object;
	private isShowList: boolean = false;

	constructor(
		private el: ElementRef,
		componentFactoryResolver: ComponentFactoryResolver,
		private viewContainerRef: ViewContainerRef
	){
		this.el = el;
		this.componentFactory = componentFactoryResolver.resolveComponentFactory(AutocompleteWindowComponent);
		
	}

	@Output() select = new EventEmitter();

	onkeyup($event: any){
		this.open();
	}

	open() {
		this.destroyComponent().initComponent();

		return this.componentRef;
	}

	initComponent(){
		this.componentRef = this.viewContainerRef.createComponent(this.componentFactory);
		this.positionInfo = layout(this.el.nativeElement);
		this.componentRef.instance.option = {
			method: this.el.nativeElement.getAttribute('method'),
			keycode: this.el.nativeElement.value,
			position: this.positionInfo
		}
		this.componentRef.instance.isShowList = true;
		this.componentRef.instance.select.subscribe((result: any) => {
            this.select.emit(result);
        });

		return this;
	}

	destroyComponent(){
		if(this.componentRef){
			this.viewContainerRef.remove(this.viewContainerRef.indexOf(this.componentRef.hostView));
		}

		return this;
	}

	close(){
		this.isShowList = false;
	}

	@HostListener('document:click',[])
	onDocumentClick(){
		if(this.componentRef){
			this.componentRef.instance.isShowList = false;
		}
	}
}