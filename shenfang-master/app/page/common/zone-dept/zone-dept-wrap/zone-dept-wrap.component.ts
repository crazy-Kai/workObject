import { Component, OnInit, Input, Output, EventEmitter, HostListener, Renderer } from '@angular/core';
import { Position, layout } from '../../../../util/position';

@Component({
	selector: 'zone-dept-wrap-component',
	templateUrl: './zone-dept-wrap.component.html',
	styleUrls: [ './zone-dept-wrap.component.css', '../../popup-add.css' ]
})

export class ZoneDeptWrapComponent {
	@Input() options: any;
	@Input() relydom: any;
	@Input() deptList: any[];
	@Output() output = new EventEmitter();
	private position: Object = {
		left: 0,
		top: 0,
		width: 0
	};
	private timeout: any;

	constructor(renderer: Renderer){
		// renderer.listenGlobal('document','click',($event)=>{
		// 	if($event.target.className != 'audit-plan-dept-select'){
		// 		this.options.isShow = false;
		// 	}
		// });
	}
	
	ngOnChanges(){
		// this.getPosition();
		if(!this.deptList) this.deptList = [];

		this.position = layout(this.relydom);

		this.position['width'] = Math.floor(this.position['width']) + 100 + 'px';
	}

	getPosition(){
		console.log('relydom:'+this.relydom);
		if(this.relydom){
			let dom = this.relydom.getBoundingClientRect();
			console.log(dom);
			this.position = {
				left: dom.left + 'px',
				top: dom.top + dom.height + 'px',
				width: dom.width + (this.options.deviationWidth || 0) + 'px'
			}
		}	
	}

	emit(deptList){
		this.deptList = deptList;

		this.output.emit(deptList);
	}

	hide(){
		this.timeout = setTimeout(() => this.options.isShow = false,500);
	}

	clearTimeout(){
		clearTimeout(this.timeout);
	}

	stopPropagation($event){
		$event.stopPropagation();
	}

	@HostListener('document:click',[])
	onDocumnentClick(){
		this.options.isShow = false;
	}
}
