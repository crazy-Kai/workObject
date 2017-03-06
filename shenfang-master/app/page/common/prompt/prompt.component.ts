import { Component } from '@angular/core';

@Component({
	selector: 'prompt-component',
	template: `
		<div class="prompt" *ngIf="show">
			<div class="dialog">
				<div class="dialog-header">
					<button class="close" (click)="close()">×</button>
					<span class="dialog-title">
						{{title}}
					</span>
				</div>
				<div class="dialog-body">
					<img class="dialog-icon" src="app/images/{{icon}}.gif">
					<div class="dialog-content">
						{{tip}}
					</div>
				</div>
				<div class="dialog-footer">
					<button class="btn btn-sm btn-success" (click)="fnHandle('successCallback')">确认</button>
					<button class="btn btn-sm btn-grey ml10" (click)="fnHandle('closeCallback')">取消</button>
				</div>
			</div>
		</div>
	`,
	styleUrls: [ 'prompt.component.css' ]
})

export class PromptComponent {
	private show: boolean = false;
	private title: string = '提示';
	private tip: string = '提示内容';
	private successCallback: any = function(){};
	private closeCallback: any = function(){};
	private icon: string = 'confirm';

	alert(tip){
		this.show = true;
		this.tip = tip;
	}

	close(){
		this.show = false;
	}

	prompt(param){
		this.show = true;
		for(let prop in param){
			if(param.hasOwnProperty(prop)){
				this[prop] = param[prop];
			}
		}
	}

	fnHandle(method){
		this[method]();

		this.close();

		this.initFn();
	}

	initFn(){
		this.successCallback = function(){};
		this.closeCallback = function(){};
	}
}