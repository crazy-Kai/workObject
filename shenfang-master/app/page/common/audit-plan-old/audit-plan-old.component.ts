import { Component, Input, Output, EventEmitter, Renderer } from '@angular/core';
import { AuditPlanService } from '../../audit-setting/audit-plan.service';
import { AuditPlanMap } from '../../audit-setting/audit-plan-map';
import { Position, layout } from '../../../util/position';

@Component({
	selector:'audit-plan-old',
	template: `
		<div class="wrap" [style.width]="position.width" [style.left]="position.left" [style.top]="position.top" (click)="stopPropagation($event)">
			<div class="input-group search mt-2 mb-2">
	            <div class="input-group-addon" style="height: 30px;font-size: 12px;">@</div>
	            <input type="text" class="form-control form-control-sm" placeholder="请输入内容" #searchBox (keyup)="getVagueAuditPlanMap(searchBox.value)">
	        </div>
			<ul>
				<li *ngFor="let plan of auditPlanMap" (click)="fnSelect(plan)">{{plan.name}}</li>
			</ul>
		</div>
	`,
	styleUrls: [ 'audit-plan-old.component.css' ]
})

export class AuditPlanOldComponent {
    auditPlanMapOrgin: AuditPlanMap[];
    auditPlanMap: AuditPlanMap[];
    position: Object = {
    	left: 0,
    	top: 0,
    	width: 0
    };

    @Input() relydom: any;
    @Output() select = new EventEmitter();

	constructor(private auditPlanService: AuditPlanService){
		this.getAuditPlanMap();
	}

	ngOnChanges(){
		this.position = layout(this.relydom);
	}

	getAuditPlanMap(): void {
        this.auditPlanService.getAuditPlanMap().then(auditPlanMap => {
            this.auditPlanMap = auditPlanMap;
            this.auditPlanMapOrgin = auditPlanMap;
        });
    }

    getVagueAuditPlanMap(keycode): void {
    	this.auditPlanService.getVagueAuditPlanMap(keycode).then(auditPlanMap => {
            this.auditPlanMap = auditPlanMap;
            this.auditPlanMapOrgin = auditPlanMap;
        });
    }

    fnSelect(plan){
    	this.select.emit(plan);
    }

    stopPropagation($event){
    	$event.stopPropagation();
    }
}