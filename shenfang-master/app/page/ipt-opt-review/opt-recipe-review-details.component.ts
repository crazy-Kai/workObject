import 'rxjs/add/operator/switchMap';
import { Component, OnInit, ViewChild }      from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { Router } from '@angular/router';
import { Subject } from 'rxjs/Subject';

import { OptDetailsService } from './opt-details.service';

import { OptRecipePatient } from '../ipt-opt-auditing/opt-recipe-patient';
import { OptRecipeDetails } from '../ipt-opt-auditing/opt-recipe-details';
import { OptRecipeDrugs } from '../ipt-opt-auditing/opt-recipe-drugs';
import { OptRecipeMap } from '../ipt-opt-auditing/opt-recipe-map';
import { OptRecipeRecordMap } from '../ipt-opt-auditing/opt-recipe-record-map';
import { OptRecipeRecordMessage } from '../ipt-opt-auditing/opt-recipe-record-message';
import { OptRecipeAuditResult } from '../ipt-opt-auditing/opt-recipe-audit-result';
import { OptRecipeExam } from '../ipt-opt-auditing/opt-recipe-exam';
import { OptRecipeExamIndicator } from '../ipt-opt-auditing/opt-recipe-exam-indicator';
import { OptRecipeSpecialExam } from '../ipt-opt-auditing/opt-recipe-special-exam';
import { OptRecipeImage } from '../ipt-opt-auditing/opt-recipe-image';
import { OptRecipeOperation } from '../ipt-opt-auditing/opt-recipe-operation';

import { OptRecipeDetailsExamPipe } from '../ipt-opt-auditing/opt-recipe-details-exam.pipe';

@Component({
    selector: 'opt-recipe-review-details',
    templateUrl: 'opt-recipe-review-details.component.html',
    styleUrls: [ 'opt-recipe-review-details.component.css', '../common/popup-add.css', '../common/popup.css' ],
    providers: [ OptDetailsService ]
})

export class OptRecipeReviewDetailsComponent implements OnInit {
    private optRecipenput: any = {};
    private patientInfo: OptRecipePatient = new OptRecipePatient();
    private patientAllergy: string = '';
    private patientAllergyList: any[] = [];
    private optRecipeList: OptRecipeMap[] = [];
    private checkedRecipe: OptRecipeMap;                //选中的处方
    private recordMap: OptRecipeRecordMap[] = [];
    private recordCheckedMap: OptRecipeRecordMessage[] = [];
    private optRecipeDetails: OptRecipeDetails = new OptRecipeDetails();
    private optReciptDrugs: OptRecipeDrugs = new OptRecipeDrugs();
    private auditResultList: OptRecipeAuditResult[] = [];
    private examList: OptRecipeExam[] = [];
    private image: OptRecipeImage;
    private specialExam: OptRecipeSpecialExam;
    private operationList: OptRecipeOperation[] = [];
    private auditIndex: number = 0;
    private recordBoxDefaultText = '审核意见...';
    private curRecipeNo: number;        //当前选中的处方号
    //检验单浮层
    private isCheckListShow: boolean = false;
    //手术浮层
    private isOperationListShow: boolean = false;

    history = window.history;
    /**
     * 处方id
     * 用于获取警示信息  电子病历  检验单  手术
     */
    private recipeId: string;
    /**
     * 上一次审核，下一次审核
     */
    private aroundIdx: any = {
        nextId: null,
        previousId: null
    }

    constructor(
        private optDetailsService: OptDetailsService,
        private route: ActivatedRoute,
        private router: Router
    ) {}

    ngOnInit(){
        this.route.params.subscribe(optRecipenput => {
            this.optRecipenput = optRecipenput;
            //TODO - 处方 ID
            this.getOptRecipe(this.optRecipenput.recipeId);
            this.getAroundAuditResult(this.optRecipenput.recipeId);
            this.recipeId = this.optRecipenput.recipeId;
        });
    }

    checkOptRecipe(recipeId: string){
        this.getOptRecipe(recipeId);
        this.getAroundAuditResult(recipeId);
    }

    getOptRecipe(id: string): void {
        this.optDetailsService.getOptRecipe(id).then(result => {
            this.patientInfo = result.outpatient as OptRecipePatient;
            this.optRecipeList = [];
            this.checkedRecipe = null;
            if(result.hasOwnProperty('optRecipe')){
                for(let item of result.optRecipe){
                    let optRecipe = new OptRecipeMap();
                    optRecipe.recipeDetails = item.optRecipe as OptRecipeDetails;
                    optRecipe.recipeDrugList = item.dtoSfOptRecipeItems as OptRecipeDrugs[];
                    this.optRecipeList.push(optRecipe);
                }
            }
            this.optRecipeList.map(item => {
                if(item.recipeDetails.id == id){
                    this.checkedRecipe = item;
                }
            })
            if(!this.checkedRecipe) this.checkedRecipe = this.optRecipeList[0];
            
            this.checkRecipe(this.checkedRecipe);
            this.getOptAllergyList(this.patientInfo.patientId);
        });
    }
    getAroundAuditResult(id: string){
        this.optDetailsService.getAroundAuditResult(id)
            .then(res => {
                if(res.code == '200'){
                    this.aroundIdx = res.data;
                }
            })
    }


    getOptAllergyList(recipeId: string){
        this.optDetailsService.getAllergyList(recipeId).then(allergyList => {
            for(let allergy of allergyList){
                this.patientAllergyList.push(allergy.allergyDrug);
            }
            this.patientAllergy = this.patientAllergyList.join(' ');
        });
    }
    getWarningList(recipeId: any): void {
        //this.curRecipeNo = recipe.recipeDetails.id;
        this.optDetailsService.getWarningList(recipeId).then(resultList => {
            this.recordMap = resultList && resultList.length > 0 ? resultList as OptRecipeRecordMap[] : [];
        });
    }
    getAuditResultList(recipeId: string): void {
        this.optDetailsService.getAuditResultList(recipeId).then(auditResultList => {
            this.auditResultList = auditResultList;
        });
    }
    //切换处方的警示信息
    checkRecipe(recipe: any){
        let recipeId = "";
        if(recipe){
            recipeId = recipe.recipeDetails.id;
            this.checkedRecipe = recipe;
            this.curRecipeNo = recipe.recipeDetails.recipeNo;
        }
            
        this.getWarningList(recipeId);
        this.getAroundAuditResult(recipeId);
        this.getAuditResultList(recipeId);
    }

    recordBoxBlur(box: any): void {
        if(!box.value){
            this.recordBoxDefaultText = '审核意见...';
        }
    }


    goback(){
        window.history.back();
    }
    //查看检验单-------------
    sheetOptions: any = {
        APIs: {
            examList: '/api/v1/opt/all/optRecipeExamList',
            imageList: '/api/v1/opt/all/optRecipeImageList',
            specialExamList: '/api/v1/opt/all/optRecipeSpecialExamList',
            operationList: '/api/v1/opt/all/optRecipeOperationList'
        }
    }
    @ViewChild('sheets') laboratorySheets: any;
    showExam(recipeId: string){
        this.laboratorySheets.show();
    }
    //查看手术-------------
    operationOptions: any = {
        APIs: {
            operation: '/api/v1/opt/all/optRecipeOperationList'
        }
    }
    @ViewChild('operation') operlationList: any;
    showOperation(){
        this.operlationList.show();
    }
    //电子病历------------
    elecMedOptions: any = {
        APIs: {
            electronicMedical: '/api/v1/opt/all/optRecipeElectronicMedical'
        }
    }
    @ViewChild('elecMedRecord') elecRecord: any;
    showElecRecord(){
        this.elecRecord.show();
    }
}