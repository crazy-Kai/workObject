import { Component, OnInit, ViewChild, Host, forwardRef, Inject} from '@angular/core';

import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { DataDetailService } from './data_detail.service';
import { GradeDetailService } from './grade_detail.service';
import { DrugService } from '../patient_guide/drug_tree.service';
import { Http, Response } from '@angular/http';
import { AppComponent} from '../../app.component';
import { UserService } from '../../user.service';
import { DataGradeAuditContentComponent } from './data_grade_audit_content.component';
import { ScoreService } from './score.service';
//引入插件 
import { DialogPlugin} from '../../common/ug-dialog/dialog';

@Component({
    selector: 'data-grade-audit',
    template: require('./data_grade_audit.component.html'),
    providers: [
        DataDetailService,
        GradeDetailService,
        DrugService,
        ScoreService
    ]
})
export class DataGradeAuditComponent implements OnInit {
    sub: any;
    params: string;
    dataType: number;
    id: number;
    navigated = false;
    error: any;
    // auditStatus: boolean;
    // options:Options;
    isAudited: boolean;
    handler: string;    //当前操作
    auditScore: string;
    literatureType: number;
    isShowMessage: boolean;
    // literatureType: number; //0:meta  1:rct  2:非随机临床研究  3:队列研究   4:病例对照研究
    @ViewChild(DialogPlugin) dialogPlugin: DialogPlugin;
    docInfo: any = {};
    backDrugName: string;
    periodicalName: string;
    gradeTitle: string;
    gradeTypes: string[] = ['Meta分析', 'RCT研究', '非随机临床研究', '队列研究', '病例对照研究'];
    literatureTypes: string[] = ['meta', 'rct', 'nrcs', 'cs', 'ccs', 'qhes', 'chec'];
    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private dataDetailService: DataDetailService,
        private gradeDetailService: GradeDetailService,
        private drugService: DrugService,
        private scoreService: ScoreService,
        private userService:UserService
        ) { }

    ngOnInit() {
        this.getRouteParam();
    }
    showGradeTitle() {
        this.gradeTitle = this.gradeTypes[this.docInfo.scoreType] + '-评分表';
    }
    showMessage() {
        // this.gradeDetailService.literatureType = this.literatureType;
        // console.log(this.gradeDetailService.literatureType);
        this.isShowMessage = true;
        this.showGradeTitle();
    }

    getRouteParam() {
        this.sub = this.route.params.subscribe(params => {
            if ((params['dataType'] !== undefined)) {
                this.dataType = params['dataType'];
                this.navigated = true;
            } else {
                if ((params['doc_type'] !== undefined) && (params['id'] !== undefined)) {
                    this.dataType = params['doc_type'];
                    this.id = params['id'];
                    this.getDocInfo(this.id);
                    if (params['status'] == 'audit'){
                        this.handler = 'audit';
                    }else if(params['status'] == 'score'){
                        this.handler = 'score';
                    }else{
                        this.handler = 'view'
                    }
                    this.navigated = true;
                } else {
                    this.navigated = false;
                }
            }

            if(params['isAudited'] != undefined){
                this.isAudited = params['isAudited'] == 4 ? true : false;
            }
        });
    }

    getDocInfo(id: number) {
        this.dataDetailService.getDocInfo(id)
            .then(docInfo => {
                this.docInfo = docInfo;
                this.gradeDetailService.docInfo = this.docInfo;
                this.literatureType = this.literatureTypes.indexOf(this.docInfo.scoreType);
                this.isShowMessage = false;
                // if (docInfo.graders1) {
                //     this.scoreService.scoringType = 2;//一号评分人已存在，则该评分人为2号评分人
                //     if (docInfo.graders2) this.scoreService.scoringType = 0; //如果二号也存在，则为审核人
                // }
            },
            error => this.error = error
            );
    }

    back() {
        this.router.navigate(['data_management/content_management/data_grade']);
    }

    onClose() {
        this.isShowMessage = false;
    }

    getScore($event: any){
        this.auditScore = $event; 
    }
}