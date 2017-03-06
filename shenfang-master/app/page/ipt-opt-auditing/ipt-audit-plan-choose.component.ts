import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { IptAuditPlanChooseService } from './ipt-audit-plan-choose.service';
import { IptAuditPlanChoose } from './ipt-audit-plan-choose';
import { AuditPlanChooseMap } from './audit-plan-choose-map';
 
@Component({
    selector: 'audit-plan-choose',
    templateUrl: 'ipt-audit-plan-choose.component.html',
    styleUrls: ['ipt-audit-plan-choose.component.css'],
    providers: [ 
                IptAuditPlanChoose, 
                IptAuditPlanChooseService,
                AuditPlanChooseMap  
                ]
})
export class IptAuditPlanChooseComponent implements OnInit {
    auditPlanMap: IptAuditPlanChoose[];
    //参数列表
    private auditPlan: any = {};
    private auditPlanTypeId: number;
    private icd10: string = '';
    private depts: string = '';
    private doctors: string = '';
    private drugCategorys: string = '';

    constructor(
        private iptAuditPlanChooseService: IptAuditPlanChooseService,
        private router: Router
    )   { }



    ngOnInit() {
        this.changeAuditPlanMap();
    }

    getAuditPlan(){
        this.iptAuditPlanChooseService.getAuditPlan(this.auditPlanTypeId)
            .then(res => {
                this.auditPlan = res.data;
                // console.log(this.auditPlan)


                let icd10Arr = [];
                try{
                    let _icds = JSON.parse(this.auditPlan['icd10']);
                    for(let _icd of _icds){
                        icd10Arr.push(_icd.name);
                    }
                }catch(e){}
                this.icd10 = icd10Arr.join(',');

                let deptList = this.auditPlan['deptList'],
                    deptResult = [];
                for(let zone of deptList){
                    for(let deptId in zone.idNamePairs){
                        deptResult.push(zone.idNamePairs[deptId]);
                    }
                }
                this.depts = deptResult.join(',');

                let doctorList = this.auditPlan.category == 1 ? this.auditPlan['doctorList'] : this.auditPlan['groupList'],
                    doctorResult = [];
                for(let zone of doctorList){
                    for(let doctorId in zone.idNamePairs){
                        doctorResult.push(zone.idNamePairs[doctorId]);
                    }
                }
                this.doctors = doctorResult.join(',');

                let drugResult = [];
                try{
                    let _drugs = JSON.parse(this.auditPlan['drugCategorys']);
                    for(let _drug of _drugs){
                        drugResult.push(_drug.name);
                    }
                }catch(e){}
                this.drugCategorys = drugResult.join(',');
            })
    }

    changeAuditPlanMap(){
        this.iptAuditPlanChooseService.getAuditPlanMap()
            .then(auditPlanMap => {
                this.auditPlanMap = auditPlanMap;
                if(auditPlanMap && auditPlanMap.length){
                    this.auditPlanTypeId = auditPlanMap[0].id;

                    this.getAuditPlan();
                }
            })
    }

    //开始审方
    getAuditPlanSetting(id: string, category: number) {
        this.iptAuditPlanChooseService.getAuditPlanSetting(id)
            .then(data => {
                if (data.data === true) {
                    console.log()
                    this.router.navigate(['/ipt-order-audit'])
                } else {
                    return false;
                }
            })
    }
}