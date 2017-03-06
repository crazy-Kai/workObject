import { Component, Input, Output, OnInit, EventEmitter } from '@angular/core';
import { AutocompleteService } from './autocomplete.service';

@Component({
	selector: 'autocomplete-window',
	template: `
		<ul class="acc-list" *ngIf="isShowList" [style.width]="option.position.width" [style.left]="option.position.left" [style.top]="option.position.top">
			<li *ngFor="let result of list" (click)="fnSelect(result)">
				{{result.name}}
			</li>
		</ul>
	`,
	styleUrls:[ 'autocomplete-window.component.css' ]
})

export class AutocompleteWindowComponent implements OnInit{
	@Input() option: any;
	@Input() isShowList: boolean;
	@Output() select = new EventEmitter();

    private timeout: any;
    private list: any[];

    constructor(private service: AutocompleteService){}

    ngOnInit(){
    	this.getList();
    }

	getList(){
		clearTimeout(this.timeout);
        let _this = this;
        this.timeout = setTimeout(function(){
            _this.service[_this.option['method']](_this.option['keycode']).then(list => {
            	_this.list = list;
            });
        },150);
	}

	fnSelect(result){
		this.select.emit(result);
	}
}