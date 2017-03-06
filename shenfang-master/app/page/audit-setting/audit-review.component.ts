import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router'

import { AuditReviewService } from './audit-review.service';
import { AuditReview } from './audit-review';
import { AuditPlanMap } from './audit-plan-map';


@Component({
    selector: 'audit-review',
    templateUrl: 'audit-review.component.html',
    styleUrls: ['audit-review.component.css'],
    providers: [AuditReview, AuditReviewService]
})

export class AuditReviewComponent implements OnInit {
    //参数列表
    private auditPlan: AuditReview = new AuditReview();
    private auditPlanMap: AuditPlanMap[];
    private auditPlanId: any;
    private drugs: any[] = [];
    private icd10: any[] = [];
    private depts: string = '';
    private doctors: string = '';
    private drugCategorys: string = '';

    constructor(
        private auditReviewService: AuditReviewService,
        private router: Router,
        private activeRouter: ActivatedRoute
    ) { }

    ngOnInit() {
        let id = this.activeRouter.params['value'].id;
        if (id) {
            this.getAuditPlan(id);
        }
    }

    getAuditPlan(auditPlanId: string): void {
        this.auditReviewService.getAuditPlan(auditPlanId)
            .then(auditPlan => {
                this.auditPlan = auditPlan;
                try {
                    this.drugs = JSON.parse(this.auditPlan['drugCategory']);
                } catch (e) {
                    this.drugs = [];
                }

                try {
                    this.icd10 = JSON.parse(this.auditPlan['icd10']);
                } catch (e) {
                    this.icd10 = [];
                }

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
            });
    }
}