import { Component, Input, Output, OnInit, EventEmitter } from '@angular/core';
import { AutocompleteService } from './autocomplete.service';
import { AutocompleteWindowInterface } from './autocomplete-directive';
import { layout } from '../../../util/position';

import { Observable } from 'rxjs/Observable';

@Component({
	selector: 'autocomplete-window',
	template: `
		<ul class="acc-list" *ngIf="isShowList" [style.width]="option.position.width" [style.left]="option.position.left" [style.top]="option.position.top">
			<li *ngFor="let result of list" (click)="fnSelect(result)">
				{{result.name}}
			</li>
		</ul>
	`,
	styleUrls: ['autocomplete-window.component.css']
})

export class AutocompleteWindowComponent implements OnInit, AutocompleteWindowInterface {
	@Input() option: any;
	@Input() isShowList: boolean;
	@Output() select = new EventEmitter();

	private timeout: any;
	private list: any[];
	private position: Object;

	constructor(private service: AutocompleteService) { }

	ngOnInit() {
		// this.getList();
	}

	init(input: HTMLInputElement) {
		// 参考: https://fe.ele.me/let-us-learn-rxjs/
		let self = this;
		self.isShowList = false;
		Observable.fromEvent(input, 'input')
			.map((e: KeyboardEvent) => {
				const target = <HTMLInputElement>e.target;
				return target.value;
			})
			.filter(value => value.length >= 2)
			.debounceTime(500)
			.distinctUntilChanged()
			.switchMap(term => {
				return Observable.fromPromise(
					this.service.autoSuggestionSearch(
						input.getAttribute("ng-reflect-url") + '?keyword=' + encodeURIComponent(term || '')
					)
				)
			})
			.subscribe((list: any) => {
				if (list.length > 0) {
					self.isShowList = true;
					self.option.position = layout(input);
					self.list = list;
				} else {
					self.isShowList = false;
				}
			}, err => {
				self.isShowList = false;
				console.error(err)
			})
	}

	fnSelect(result: any) {
		this.select.emit(result);
	}
}