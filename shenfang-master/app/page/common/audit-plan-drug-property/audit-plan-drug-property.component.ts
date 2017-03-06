import { Component, OnInit, Input, Output, EventEmitter, HostListener} from '@angular/core';

import { AuditPlanDrugProperty } from './audit-plan-drug-property';
import { AuditPlanDrugPropertyService } from './audit-plan-drug-property.service';

@Component({
    selector: 'audit-plan-drug-property',
    templateUrl: 'audit-plan-drug-property.component.html',
    styleUrls: [ 'audit-plan-drug-property.component.css', '../popup-add.css']
})

export class AuditPlanDrugPropertyComponent implements OnInit {
    private drugPropertyList: AuditPlanDrugProperty[] = [];
    private drugPropertyOrginList: AuditPlanDrugProperty[] = [];
    private drugPropertyResult: string[] = [];
    private isPopupShow: boolean = false;

    @Input() drugPropertyStr: string = '';
    @Output() drugPropertyUpdate = new EventEmitter();

    constructor(
        private auditPlanDrugPropertyService: AuditPlanDrugPropertyService
    ) { }

    getDrugPropertyList(): void {
        this.auditPlanDrugPropertyService.getDrugPropertyList().then(drugPropertyList => {
            this.drugPropertyList = drugPropertyList;
            this.initDrugPropertyList();
            this.drugPropertyOrginList = this.drugPropertyList;
        });
    }
    searchDrugProperty(keyWord: string): void {
        if(keyWord.trim()){
            this.auditPlanDrugPropertyService.searchDrugProperty(keyWord).then(drugPropertyList => {
                this.drugPropertyList = drugPropertyList;
                this.initDrugPropertyList();
            });
        }
    }
    initDrugPropertyList(): void {
        for(let drugProperty of this.drugPropertyList){
            if(~this.drugPropertyResult.indexOf(drugProperty.name)){
                drugProperty.checked = true;
            } else {
                drugProperty.checked = false;
            }
        }
    }
    getDrugPropertyResult(): void{
        if(this.drugPropertyStr && this.drugPropertyStr.length > 0){
            this.drugPropertyResult = this.drugPropertyStr.split(';');
        }
    }
    chooseDrugPropertyItem(drugProperty: AuditPlanDrugProperty): void {
        drugProperty.checked = !drugProperty.checked;
        if(drugProperty.checked && !~this.drugPropertyResult.indexOf(drugProperty.name)){
            this.drugPropertyResult.push(drugProperty.name);
        } else {
             this.drugPropertyResult = this.drugPropertyResult.filter(result => result !== drugProperty.name);
        }
        this.drugPropertyUpdate.emit(this.drugPropertyResult.join(';'));
    }
    deleteDrugProperty(event: MouseEvent ,value: string): void {
        event.stopPropagation();
        this.drugPropertyResult = this.drugPropertyResult.filter(result => result != value);
        for(let drugProperty of this.drugPropertyList){
            if(drugProperty.name == value){
                drugProperty.checked = false;
            }
        }
    }
    selectClick(target: any): void {
        //if(target.tagName.toUpperCase() != 'SPAN'){
            this.isPopupShow = !this.isPopupShow;
        //}
        //每次隐藏浮层都重置 list
        if(!this.isPopupShow){
            this.drugPropertyList = this.drugPropertyOrginList;
            this.initDrugPropertyList();
        }
    }
    ngOnInit(){}

    ngOnChanges() {
        this.getDrugPropertyResult();
        this.getDrugPropertyList();
    }

    stopPropagation($event){
        $event.stopPropagation();
    }

    @HostListener('document:click',[])
    onDocumentClick(){
        this.isPopupShow = false;
    }
}
