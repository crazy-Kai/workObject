import 'rxjs/add/operator/switchMap';
import { Component, OnInit }      from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { Router } from '@angular/router';
import { Subject } from 'rxjs/Subject';

import { OptRecipeDetailsService } from './opt-recipe-details.service';
import { OptRecipePatient } from './opt-recipe-patient';
import { OptRecipeDetails } from './opt-recipe-details';
import { OptRecipeDrugs } from './opt-recipe-drugs';
import { OptRecipeMap } from './opt-recipe-map';
import { OptRecipeRecordMap } from './opt-recipe-record-map';
import { OptRecipeRecordMessage } from './opt-recipe-record-message';
import { OptRecipeAuditResult } from './opt-recipe-audit-result';
import { OptRecipeExam } from './opt-recipe-exam';
import { OptRecipeExamIndicator } from './opt-recipe-exam-indicator';
import { OptRecipeSpecialExam } from './opt-recipe-special-exam';
import { OptRecipeImage } from './opt-recipe-image';
import { OptRecipeOperation } from './opt-recipe-operation';
import { OptRecipeMedical } from './opt-recipe-medical';

import { OptRecipeDetailsExamPipe } from './opt-recipe-details-exam.pipe';

@Component({
    selector: 'opt-recipe-details',
    templateUrl: 'opt-recipe-details.component.html',
    styleUrls: [ 'opt-recipe-details.component.css', '../common/popup-add.css', '../common/popup.css' ]
})

export class OptRecipeDetailsComponent implements OnInit {
    private OptRecipeDetailsComponent: any;
    private optReciptInput: any;
    private patientInfo: OptRecipePatient = new OptRecipePatient();
    private patientAllergyList: any[] = [];
    private optRecipeList: OptRecipeMap[] = [];
    private checkedRecipe: OptRecipeMap;
    private recordMap: OptRecipeRecordMap[] = [];
    private recordCheckedMap: OptRecipeRecordMessage[] = [];
    private optRecipeDetails: OptRecipeDetails = new OptRecipeDetails();
    private optReciptDrugs: OptRecipeDrugs = new OptRecipeDrugs();
    private auditResultList: OptRecipeAuditResult[] = [];
    private examList: OptRecipeExam[] = [];
    private image: OptRecipeImage = new OptRecipeImage();
    private specialExam: OptRecipeSpecialExam = new OptRecipeSpecialExam();
    private operationList: OptRecipeOperation[] = [];
    private electronicMedical: OptRecipeMedical = new OptRecipeMedical();
    private auditIndex: number = 0;
    //检验单浮层
    private isCheckListShow: boolean = false;
    //手术浮层
    private isOperationListShow: boolean = false;
    //过敏列表浮层
    private isAllergyListShow: boolean = false;
    //电子病历浮层
    private isElectronicMedicalShow: boolean = false;
    //重点关注浮层
    private isFocusShow: boolean = false;
    //是否全部审核完毕
    private isAllRecipeChecked: boolean = false;
    //通过状态
    private throughStatus: number = 0;
    //打回状态
    private backStatus: number = 1;

    constructor(
        private optRecipeDetailsService: OptRecipeDetailsService,
        private route: ActivatedRoute,
        private router: Router
    ) {}
    getOptRecipe(id: string): void {
        //if(id.trim()){
            this.optRecipeDetailsService.getOptRecipe(id).then(result => {
                this.patientInfo = result.outpatient as OptRecipePatient;
                if(result.hasOwnProperty('optRecipe')){
                    for(let item of result.optRecipe){
                        let optRecipe = new OptRecipeMap();
                        optRecipe.recipeDetails = item.optRecipe as OptRecipeDetails;
                        optRecipe.recipeDrugList = item.dtoSfOptRecipeItems as OptRecipeDrugs[];
                        this.optRecipeList.push(optRecipe);
                        // console.log(this.optRecipeList);
                        // console.log(optRecipe);
                    }
                }
                this.checkedRecipe = this.optRecipeList[0];
                this.getOptAllergyList(this.patientInfo.patientId);
                this.getOptRecipeExamList(this.patientInfo.patientId);
                this.getOptRecipeImageList(this.patientInfo.patientId);
                this.getOptRecipeSpecialExamList(this.patientInfo.patientId);
                this.getOptOperationList(this.patientInfo.patientId);
                this.getElectronicMedical(this.patientInfo.patientId);

                this.getWarningList(this.checkedRecipe.recipeDetails.id);
            });
        //}
    }
    getOptAllergyList(recipeId: string){
        this.optRecipeDetailsService.getOptAllergyList(recipeId).then(allergyList => {
            if(allergyList && allergyList.length > 0){
                for(let allergy of allergyList){
                    var allergyObj = {
                        'allergyDrug': allergy.allergyDrug,
                        'anaphylaxis': allergy.anaphylaxis
                    };
                    this.patientAllergyList.push(allergyObj);
                }
            }
        });
    }
    getWarningList(id: string): void {
        this.optRecipeDetailsService.getWarningList(id).then(resultList => {
            // if(resultList && resultList.hasOwnProperty('recordList') && resultList.recordList.length > 0){
            //     this.recordMap = resultList.recordList as OptRecipeRecordMap[];
            if(resultList && resultList.length > 0){
                this.recordMap = resultList as OptRecipeRecordMap[];
                for(let record of this.recordMap){
                    this.getAuditResultList(record, id);
                    record.recordCheckedMap = [];
                }
            } else {
                // alert('暂无信息');
            }
        });
    }
    getAuditResultList(record: OptRecipeRecordMap, id: string): void {
        if(record && id){
            this.optRecipeDetailsService.getAuditResultList(id).then(auditResultList => {
                if(auditResultList && auditResultList.length > 0){
                    record.auditResultList = auditResultList;
                }
            });
        }
    }
    recordChecked(isChecked: boolean, message: OptRecipeRecordMessage, record: OptRecipeRecordMap): void {
        if(isChecked) {
            record.recordCheckedMap.push(message);
        } else {
            record.recordCheckedMap = this.recordCheckedMap.filter(item => item.msgId != message.msgId);
        }
    }
    // recordBoxBlur(box: any): void {
    //     if(!box.value){
    //         this.recordBoxDefaultText = '审核意见...';
    //     }
    // }

    rejectRecipe(record: OptRecipeRecordMap){
        // let recipeId = record.recipeId;
        //警示信息操作状态
        let me = this;
        let recordArr = [];
        for(let recordDoc of record.recordCheckedMap) {
            let status, msgId;
            if(recordDoc.operateStatus) {
               status  = '1';
            } else {
                status  = '2';
            };
            msgId = recordDoc.msgId;
            recordArr.push({operateStatus: status, msgId: msgId});
        }
        let optRecipeId = this.optReciptInput.recipeId;
        let auditResult = record.auditResult;
        const params = {optRecipeId:optRecipeId,auditResult:auditResult,operationRecordList:recordArr};
        this.optRecipeDetailsService.refuseRecipe(params).then(res => {
            // console.log(res);
            //通过 打回 打水印状态
            // this.auditResult = res.data;
             let recipeId = this.checkedRecipe.recipeDetails.recipeId;
            if(res.code == 200){
                //success
                me.isAllRecipeChecked = true;
                for(let recipe of me.optRecipeList){
                    if(recipe.recipeDetails.recipeId == recipeId){
                        recipe.recipeDetails.auditStatus = 2; //打回
                    }
                    if(recipe.recipeDetails.auditStatus == 0){
                        this.isAllRecipeChecked = false;
                    }
                }
                if(me.isAllRecipeChecked){
                    // debugger
                    me.getNextRecipe();
                }
                //TODO - 该处方的警示信息折叠
            } else {
                //error
            }
        });
    }
    resolveRecipe(record: OptRecipeRecordMap){
        let me = this;
        // console.dirxml(record);
        // let recipeId = record.recipeId;
        //警示信息操作状态
        let recordArr = [];
        for(let recordDoc of record.recordCheckedMap) {
            let status, msgId;
            if(recordDoc.operateStatus) {
               status  = '1';
            } else {
                status  = '2';
            };
            msgId = recordDoc.msgId;
            recordArr.push({operateStatus: status, msgId: msgId});
        }
        let optRecipeId = this.optReciptInput.recipeId;
        let auditResult = record.auditResult;
        const params = {optRecipeId:optRecipeId,auditResult:auditResult,operationRecordList:recordArr};
        this.optRecipeDetailsService.agreeRecipe(params).then(res => {
            // console.log(res);
            //通过 打回 打水印状态
            // this.auditResult = res.data;
            let recipeId = this.checkedRecipe.recipeDetails.recipeId;
            if(res.code == 200){
                //success
                me.isAllRecipeChecked = true;
                for(let recipe of me.optRecipeList){
                    if(recipe.recipeDetails.recipeId == recipeId){
                        recipe.recipeDetails.auditStatus = 1; //1: 未分配通过,2: 超时通过,3: 人工通过  
                        //更改后的状态 ： 1审核通过 2审核打回 3自动通过 4超时通过 5挂起
                    }
                    if(recipe.recipeDetails.auditStatus == 0){
                        me.isAllRecipeChecked = false;
                    }
                }
        
                if(me.isAllRecipeChecked){
                    // console.log(me);
                    me.getNextRecipe();
                }
                //TODO - 该处方的警示信息折叠
            } else {
                //error
            }
        });
        
    }
    getOptRecipeExamList(recipeId: string): void {
        this.optRecipeDetailsService.getOptRecipeExamList(recipeId).then(resultList => {
            if(resultList && resultList.length > 0){
                for(let record of resultList.recordList){
                    let exam = new OptRecipeExam();
                    exam = record.masterObj as OptRecipeExam;
                    exam.indicatorList = record.followerObj as OptRecipeExamIndicator[];
                    this.examList.push(exam);
                }
            }
        });
    }
    getOptRecipeImageList(recipeId: string): void {
        this.optRecipeDetailsService.getOptRecipeImageList(recipeId).then(resultList => {
            if(resultList && resultList.length > 0){
                this.image = resultList.recordList[0] as OptRecipeImage;
            }
        });
    }
    getOptRecipeSpecialExamList(recipeId: string): void {
        this.optRecipeDetailsService.getOptRecipeSpecialExamList(recipeId).then(resultList => {
            if(resultList && resultList.length > 0){
                this.specialExam = resultList.recordList[0] as OptRecipeSpecialExam;
            }
        });
    }
    getOptOperationList(recipeId: string): void {
        this.optRecipeDetailsService.getOptOperationList(recipeId).then(resultList => {
            if(resultList && resultList.length > 0){
                this.operationList = resultList.recordList as OptRecipeOperation[];
            }
        });
    }
    getElectronicMedical(recipeId: string): void {
        this.optRecipeDetailsService.getElectronicMedical(recipeId).then(resultList => {
            if(resultList && resultList.length > 0){
                this.electronicMedical = resultList as OptRecipeMedical;
            }
        });
    }
    //选中处方
    optRecipeChecked(recipe: OptRecipeMap, index: number): void {
        this.checkedRecipe = recipe;
        this.changeHash('recipe-warning');
        this.getWarningList(this.checkedRecipe.recipeDetails.id);
    }
    changeHash(value: string):void{
        window.location.hash = value;
    }
    //下一张处方
    getNextRecipe(): void {
        console.log(this);
        // console.log(this.optReciptInput.recipeId);
        let type = 1;
        let params = {id:this.optReciptInput.recipeId, type: type}
        this.optRecipeDetailsService.getNextRecipe(params).then(result => {
            if(result){
                this.router.navigate(['/opt-recipe-details/'+result]);
            }
        });
    }
    ngOnInit(){
        this.route.params.subscribe(optReciptInput => {
            this.optReciptInput = optReciptInput;
            //TODO - 患者的处方列表需要与警示信息列表对应
            this.getOptRecipe(this.optReciptInput.recipeId);
            // alert(this.optReciptInput.recipeId);
            // console.log(this);   
        });
    }
    //返回任务清单
    returnTaskList(){
        // this.router.navigate(['/opt-recipe-details'],{relativeTo:this.route});
        // $state.go('/opt-recipe-details');
        //  window.history.back(); 
         window.history.go(-1);
    }
}