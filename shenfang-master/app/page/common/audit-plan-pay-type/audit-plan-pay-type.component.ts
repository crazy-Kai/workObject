import { Component, OnInit, Input, Output, EventEmitter, HostListener} from '@angular/core';

import { AuditPlanPayType } from './audit-plan-pay-type';
import { AuditPlanPayTypeService } from './audit-plan-pay-type.service';

@Component({
    selector: 'audit-plan-pay-type',
    templateUrl: 'audit-plan-pay-type.component.html',
    styleUrls: [ 'audit-plan-pay-type.component.css', '../popup-add.css']
})

export class AuditPlanPayTypeComponent implements OnInit {
    private payTypeList: AuditPlanPayType[] = [];
    private payTypeResult: string[] = [];
    //不可选项
    private payTypeNotOptional: AuditPlanPayType[] = [];
    private isPopupShow: boolean = false;

    @Input() payTypeStr: string = '';
    @Output() payTypeUpdate = new EventEmitter();

    constructor(
        private auditPlanPayTypeService: AuditPlanPayTypeService
    ) { }

    getPayTypeList(): void {
        this.auditPlanPayTypeService.getPayTypeList().then(payTypeList => {
            this.payTypeList = payTypeList;
            for(let payType of this.payTypeList){
                if(~this.payTypeResult.indexOf(payType.name)){
                    payType.checked = true;
                } else {
                    payType.checked = false;
                }
            }
        });
    }
    getPayTypeResult(): void{
        if(this.payTypeStr && this.payTypeStr.length > 0){
            this.payTypeResult = this.payTypeStr.split(';');
        }
    }
    choosePayType(payType: AuditPlanPayType): void {
        payType.checked = !payType.checked;
        if(payType.checked){
            this.payTypeResult.push(payType.name);
        } else {
             this.payTypeResult = this.payTypeResult.filter(result => result !== payType.name);
        }
        this.payTypeUpdate.emit(this.payTypeResult.join(';'));
    }
    deletePayType(event: MouseEvent ,value: string): void {
        event.stopPropagation();
        this.payTypeResult = this.payTypeResult.filter(result => result != value);
        for(let payType of this.payTypeList){
            if(payType.name == value){
                payType.checked = false;
            }
        }
    }
    selectClick($event): void {
        //if(target.tagName.toUpperCase() != 'SPAN'){
            this.isPopupShow = !this.isPopupShow;
        //}
            $event.stopPropagation();
    }
    ngOnChanges() {
        this.getPayTypeResult();
        this.getPayTypeList();
    }

    stopPropagation($event){
        $event.stopPropagation();
    }

    ngOnInit(){}

    @HostListener('document:click',[])
    onDocumentClick(){
        this.isPopupShow = false;
    }
}
