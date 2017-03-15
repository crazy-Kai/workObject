import {
	Directive,
	Input,
	HostListener,
	ElementRef,
	ComponentFactoryResolver,
	ComponentRef,
	ViewContainerRef,
	ComponentFactory,
	Output,
	EventEmitter
} from '@angular/core';

import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/distinctUntilChanged';
import 'rxjs/add/operator/switchMap';
import { Subject } from 'rxjs/Subject';

import { AutocompleteWindowComponent } from './autocomplete-window.component';
import { layout } from '../../../util/position';

@Directive({
	selector: 'input[autoSuggestion]'
})

export class AutocompleteDirective {
	private componentFactory: ComponentFactory<AutocompleteWindowComponent>;
	private componentRef: ComponentRef<AutocompleteWindowComponent>;
	private positionInfo: Object;
	private isShowList: boolean = false;
	private searchTermStream = new Subject<string>();

	@Input('autoSuggestion') autoSuggestion: string;
	@Output() select = new EventEmitter();
	@Input() url: string;

	constructor(
		private el: ElementRef,
		componentFactoryResolver: ComponentFactoryResolver,
		private viewContainerRef: ViewContainerRef,
	) {
		this.componentFactory = componentFactoryResolver.resolveComponentFactory(AutocompleteWindowComponent);
	}

	ngAfterContentInit() {
		this.componentRef = this.viewContainerRef.createComponent(this.componentFactory);
		this.positionInfo = layout(this.el.nativeElement);

		this.componentRef.instance.option = {
			position: this.positionInfo
		};

		this.componentRef.instance.isShowList = false;
		this.componentRef.instance.select.subscribe((result: any) => {
			this.select.emit(result);
		});
		this.componentRef.instance.init(this.el.nativeElement);
	}

	@HostListener('document:click', [])
	onDocumentClick() {
		if (this.componentRef) {
			this.componentRef.instance.isShowList = false;
		}
	}
}

export interface AutocompleteWindowInterface {
	option: any,
	isShowList: boolean,
	select: EventEmitter<any>,
	init: Function
}