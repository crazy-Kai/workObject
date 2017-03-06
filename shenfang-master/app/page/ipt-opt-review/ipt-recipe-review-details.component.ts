import { Component, OnInit, Directive, HostListener }      from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { Router } from '@angular/router';
import { Subject } from 'rxjs/Subject';

import { IptDetailsService } from './ipt-details.service';

import { PatientInfo } from '../ipt-opt-auditing/ipt-order-details/patient-info';
import { PatientAllergy } from '../ipt-opt-auditing/ipt-order-details/patient-allergy';
import { PatientDiagnose } from '../ipt-opt-auditing/ipt-order-details/patient-diagnose';
import { PatientProgress } from '../ipt-opt-auditing/ipt-order-details/patient-progress';
import { PatientIptRecord } from '../ipt-opt-auditing/ipt-order-details/patient-ipt-record';
import { PatientExam } from '../ipt-opt-auditing/ipt-order-details/patient-exam';
import { PatientSpecialExam } from '../ipt-opt-auditing/ipt-order-details/patient-special-exam';
import { PatientImage } from '../ipt-opt-auditing/ipt-order-details/patient-image';
import { PatientOperation } from '../ipt-opt-auditing/ipt-order-details/patient-operation';
import { PatientVitalSign } from '../ipt-opt-auditing/ipt-order-details/patient-vital-sign';
import { PatientNonOrder } from '../ipt-opt-auditing/ipt-order-details/patient-non-order';
import { PatientEngineMap } from '../ipt-opt-auditing/ipt-order-details/patient-engine-map';
import { PatientEngineMessage } from '../ipt-opt-auditing/ipt-order-details/patient-engine-message';
import { AuditResult } from '../ipt-opt-auditing/ipt-order-details/audit-result';
import { IptOrder } from '../ipt-opt-auditing/ipt-order-details/ipt-order';

import { getFirstElePipe } from '../common/get-first-ele.pipe';
@Component({
    selector: 'ipt-recipe-review-details',
    templateUrl: 'ipt-recipe-review-details.component.html',
    styleUrls: [ 'ipt-recipe-review-details.component.css', '../common/popup-add.css', '../common/popup.css', '../common/reset.css' ],
    providers: [ IptDetailsService ]
})

export class IptRecipeReviewDetailsComponent implements OnInit {
    private iptOrderInput: any;
    //生命体征浮层相关参数 - svg的高度需固定
    private vitalSignWidth: number = 0;
    private vitalSignHeight: number = 0;
    private vitalSignDate: any[] = [];
    private vitalSignOptionList: any[] = [{series:{name:"体温",data:[],},color:"#2BB5F5",unit:"°C",maxDataY:0,minDataY:0,maxDataX:0,minDataX:0,leftPos:0,rightPos:0,positionArr:[],positionStr:"",dialog:{show:false,x:0,y:0,msg1:"",msg2:""}},{series:{name:"收缩压",data:[],},color:"#FF6C8A",unit:"",maxDataY:0,minDataY:0,maxDataX:0,minDataX:0,leftPos:0,rightPos:0,positionArr:[],positionStr:"",dialog:{show:false,x:0,y:0,msg1:"",msg2:""}},{series:{name:"舒张压",data:[],},color:"#F9A735",unit:"",maxDataY:0,minDataY:0,maxDataX:0,minDataX:0,leftPos:0,rightPos:0,positionArr:[],positionStr:"",dialog:{show:false,x:0,y:0,msg1:"",msg2:""}},{series:{name:"脉率",data:[],},color:"#93B6FF",unit:"次/min",maxDataY:0,minDataY:0,maxDataX:0,minDataX:0,leftPos:0,rightPos:0,positionArr:[],positionStr:"",dialog:{show:false,x:0,y:0,msg1:"",msg2:""}},{series:{name:"心率",data:[],},color:"#FF4800",unit:"次/min",maxDataY:0,minDataY:0,maxDataX:0,minDataX:0,leftPos:0,rightPos:0,positionArr:[],positionStr:"",dialog:{show:false,x:0,y:0,msg1:"",msg2:""}},{series:{name:"呼吸频率",data:[],},color:"#2BB5F5",unit:"次/min",maxDataY:0,minDataY:0,maxDataX:0,minDataX:0,leftPos:0,rightPos:0,positionArr:[],positionStr:"",dialog:{show:false,x:0,y:0,msg1:"",msg2:""}},{series:{name:"24小时入量",data:[],},color:"#53BF0F",unit:"ml",maxDataY:0,minDataY:0,maxDataX:0,minDataX:0,leftPos:0,rightPos:0,positionArr:[],positionStr:"",dialog:{show:false,x:0,y:0,msg1:"",msg2:""}},{series:{name:"24小时出量",data:[],},color:"#11DA9D",unit:"ml",maxDataY:0,minDataY:0,maxDataX:0,minDataX:0,leftPos:0,rightPos:0,positionArr:[],positionStr:"",dialog:{show:false,x:0,y:0,msg1:"",msg2:""}}];
    
    private dialog: any = {
        show: false
    };

    //住院信息汇总相关参数 - svg的高度需固定
    private summaryList: any = {
        monthList: [],
        dateList: [],
        vitalSignList: {
            vitalSignWidth: 0,
            vitalSignHeight: 0,
            vitalSignOptionList: [{series:{name:"体温",data:[],},color:"#2BB5F5",unit:"°C",maxDataY:0,minDataY:0,maxDataX:0,minDataX:0,leftPos:0,rightPos:0,positionArr:[],positionStr:"",dialog:{show:false,x:0,y:0,msg1:"",msg2:""}},{series:{name:"收缩压",data:[],},color:"#FF6C8A",unit:"",maxDataY:0,minDataY:0,maxDataX:0,minDataX:0,leftPos:0,rightPos:0,positionArr:[],positionStr:"",dialog:{show:false,x:0,y:0,msg1:"",msg2:""}},{series:{name:"舒张压",data:[],},color:"#F9A735",unit:"",maxDataY:0,minDataY:0,maxDataX:0,minDataX:0,leftPos:0,rightPos:0,positionArr:[],positionStr:"",dialog:{show:false,x:0,y:0,msg1:"",msg2:""}},{series:{name:"脉率",data:[],},color:"#93B6FF",unit:"次/min",maxDataY:0,minDataY:0,maxDataX:0,minDataX:0,leftPos:0,rightPos:0,positionArr:[],positionStr:"",dialog:{show:false,x:0,y:0,msg1:"",msg2:""}},{series:{name:"心率",data:[],},color:"#FF4800",unit:"次/min",maxDataY:0,minDataY:0,maxDataX:0,minDataX:0,leftPos:0,rightPos:0,positionArr:[],positionStr:"",dialog:{show:false,x:0,y:0,msg1:"",msg2:""}},{series:{name:"呼吸频率",data:[],},color:"#2BB5F5",unit:"次/min",maxDataY:0,minDataY:0,maxDataX:0,minDataX:0,leftPos:0,rightPos:0,positionArr:[],positionStr:"",dialog:{show:false,x:0,y:0,msg1:"",msg2:""}},{series:{name:"24小时入量",data:[],},color:"#53BF0F",unit:"ml",maxDataY:0,minDataY:0,maxDataX:0,minDataX:0,leftPos:0,rightPos:0,positionArr:[],positionStr:"",dialog:{show:false,x:0,y:0,msg1:"",msg2:""}},{series:{name:"24小时出量",data:[],},color:"#11DA9D",unit:"ml",maxDataY:0,minDataY:0,maxDataX:0,minDataX:0,leftPos:0,rightPos:0,positionArr:[],positionStr:"",dialog:{show:false,x:0,y:0,msg1:"",msg2:""}}]
        },
        orderList: {
            orderWidth: 0,
            orderHeight: 0,
            orderOptionList: []
        },
        diagnoseList: [],
        examList: [],
        inspectList: [],
        drugList: [],
        nonOrderList: [],
        operationList: [],
        progressList: []
    };

    //滑动 bar 相关参数
    positionArr: any[] = [];
    positionStr: string = '';
    barWidth: number;
    handleWidth: number;
    handlePos: string = '0px';
    totalDays = 0;
    disX = 0;
    offsetLeft = 0;
    nowDate = new Date();
    startDate = new Date();

    private patientInfo: PatientInfo = new PatientInfo();
    private allergyList: PatientAllergy[] = [];
    private diagnoseList: PatientDiagnose[] = [];
    private diagnoseStr = '';
    private progressList: PatientProgress[] = [];
    private recordList: PatientIptRecord[] = [];
    private examList: PatientExam[] = [];
    private image: PatientImage = new PatientImage();
    private specialExam: PatientSpecialExam = new PatientSpecialExam();
    private operationList: PatientOperation[] = [];
    private vitalSignList: PatientVitalSign[] = [];
    private nonOrderList: PatientNonOrder[] = [];
    private engineMsgList: any[] = [];
    private auditResultList: AuditResult[] = [];
    private iptOrderList: any[] = [];
    
    private isPopupShow: boolean = false;
    private isAllergyShow: boolean = false;
    private isDiagnoseShow: boolean = false;
    private isProgressShow: boolean = false;
    private isRecordShow: boolean = false;
    private isExamShow: boolean = false;
    private isOperationShow: boolean = false;
    private isVitalSignShow: boolean = false;
    private isNonOrderShow: boolean = false;

    constructor(
        private iptDetailsService: IptDetailsService,
        private activatedRoute: ActivatedRoute,
        private route: ActivatedRoute,
        private router: Router
    ) {}
    
    ngOnInit(){
        this.activatedRoute.params.subscribe(iptOrderInput => {
            this.iptOrderInput = iptOrderInput; //7052 test data
            this.getPatientInfo(this.iptOrderInput.recipeId);
            this.getAllergyList(this.iptOrderInput.recipeId);
            this.getDiagnoseList(this.iptOrderInput.recipeId, '', 0);
            this.getIptOrderList(this.iptOrderInput.recipeId, '', 0);
            this.getProgressList(this.iptOrderInput.recipeId, '', 0);
            this.getRecordList(this.iptOrderInput.recipeId);
            this.getExamList(this.iptOrderInput.recipeId, '', 0);
            this.getImageList(this.iptOrderInput.recipeId, '', 0);
            this.getSpecialExamList(this.iptOrderInput.recipeId, '', 0);
            this.getOpeartionList(this.iptOrderInput.recipeId, '', 0);
            this.getVitalSignList(this.iptOrderInput.recipeId, '', 0);
            this.getNonOrderList(this.iptOrderInput.recipeId, '', 0);
        });
    }

    getPatientInfo(recipeId: string): void {
        this.iptDetailsService.getIptOrder(recipeId)
            .then(res => {
                this.patientInfo = res;
                //this.patientInfo.hospitalizedTime = new Date('2016-11-13').getTime();
                this.totalDays = Math.ceil(((new Date().getTime()) - this.patientInfo.hospitalizedTime ) / 1000 / 60 / 60 / 24);
                this.getSummaryMonthList();
                this.getSummaryDateList(new Date());
            })
    }
    getSummaryMonthList():void {
        let startTime = this.patientInfo.hospitalizedTime;
        let startYear = new Date(startTime).getFullYear(),
            endYear = new Date().getFullYear(),
            startMonth = new Date(startTime).getMonth() + 1,
            endMonth = (endYear - startYear)*12 + (new Date().getMonth()) + 1;
            // if((startMonth + 1) > 12){
            //     startMonth = 12;
            //     startYear++;
            // } else {
            //     startMonth++;
            // }
            do{
                do{
                    let days = Math.ceil(((new Date(startYear, (startMonth - 1)).getTime()) - this.patientInfo.hospitalizedTime ) / 1000 / 60 / 60 / 24);
                    this.summaryList.monthList.push({
                        'month': startMonth,
                        'width': (days / this.totalDays) * 100
                    });
                    if(startMonth == 12){
                        startMonth = 1;
                        endMonth -= 12;
                        break;
                    }
                }while(endMonth > startMonth++)
            }while(endYear > startYear++)
            this.summaryList.monthList = this.summaryList.monthList.slice(1);
    }
    getSummaryDateList(nowDate: Date):void {
        this.summaryList.dateList = [];
        let startDate = new Date(this.patientInfo.hospitalizedTime),
            endDate = new Date();
        endDate.setDate(endDate.getDate() - 6);
        nowDate.setDate(nowDate.getDate() - 6);
        if(nowDate.getTime() < startDate.getTime()){
            nowDate = startDate;
        } else if(nowDate.getTime() > endDate.getTime()){
            nowDate = endDate;
        }
        this.nowDate = new Date(nowDate.getFullYear(), nowDate.getMonth(), nowDate.getDate());
        let dateTemp = null;
        for (let i = 0; i < 7; i++) {
            dateTemp = (nowDate.getMonth() + 1) + "/" + nowDate.getDate();
            this.summaryList.dateList.push({
                date: dateTemp,
                year: nowDate.getFullYear()
            });
            nowDate.setDate(nowDate.getDate() + 1);
        }
    }
    //获取过敏药物列表
    getAllergyList(orderId: string): void {
        this.iptDetailsService.getAllergyList(orderId).then( result => {
            this.allergyList = result ? result as PatientAllergy[] : [];
        });
    }
    //获取诊断记录
    getDiagnoseList(orderId: number, startDate: string, period: number): void {
        this.iptDetailsService.getDiagnoseList(orderId, startDate, period).then( result => {
            if(startDate != '' && period != 0){
                let diagnoseList = result as PatientDiagnose[];
                this.summaryList.diagnoseList = [];
                for(let dateObj of this.summaryList.dateList){
                    let dateTemp = new Date(dateObj.year + '/' + dateObj.date);
                    let tempDiagnose = new PatientDiagnose();
                    for(let diagnose of this.diagnoseList){
                        let diagnoseDate = new Date(diagnose.diagDate);
                        if(diagnoseDate.getFullYear() == dateTemp.getFullYear() && diagnoseDate.getMonth() == dateTemp.getMonth() && diagnoseDate.getDate() == dateTemp.getDate()){
                            tempDiagnose = diagnose;
                            break;
                        }
                    }
                    this.summaryList.diagnoseList.push(tempDiagnose);
                }
            } else {
                this.diagnoseList = result as PatientDiagnose[];
                let diagnoseArr = [];
                for(let diagnose of this.diagnoseList){
                    diagnoseArr.push(diagnose.diagName);
                }
                this.diagnoseStr = diagnoseArr.join('、');
            }
        });
    }
    //获取病程记录列表
    getProgressList(orderId: number, startDate: string, period: number):void {
        this.iptDetailsService.getProgress(orderId, startDate, period).then(result => {
            if(startDate != '' && period != 0){
                let progressList = result ?  result as PatientProgress[] : [];
                this.summaryList.progressList = [];
                for(let dateObj of this.summaryList.dateList){
                    let dateTemp = new Date(dateObj.year + '/' + dateObj.date);
                    let tempProgress = new PatientProgress();
                    for(let progress of progressList){
                        let progressDate = new Date(progress.recordTime);
                        if(progressDate.getFullYear() == dateTemp.getFullYear() && progressDate.getMonth() == dateTemp.getMonth() && progressDate.getDate() == dateTemp.getDate()){
                            tempProgress = progress;
                            break;
                        }
                    }
                    this.summaryList.progressList.push(tempProgress);
                }
            } else {
                this.progressList = result ? result as PatientProgress[] : [];
            }
        });
    }
    //获取入院记录列表
    getRecordList(patientId: string):void {
        this.iptDetailsService.getIptRecordList(patientId).then(result => {
            this.recordList = result ? result as PatientIptRecord[] : [];
        });
    }
    //获取药嘱列表
    getIptOrderList(orderId: number, startDate: string, period: number):void {
        this.iptDetailsService.getOrderList(orderId, startDate, period).then(resultList => {
            if(startDate != '' && period != 0){
                this.summaryList.orderList.orderOptionList = [];
                let validDate = new Date(this.summaryList.dateList[0].year + '/' + this.summaryList.dateList[0].date);
                let invalidDate = new Date(this.summaryList.dateList[6].year + '/' + this.summaryList.dateList[6].date);
                for(let groupNum in resultList){
                    for(let order of resultList[groupNum]){
                        if(!(order.orderValidTime > (invalidDate.getTime() + 86400000) || order.orderInvalidTime < validDate.getTime())){
                            this.changeOrder(order, validDate, invalidDate);
                        }
                    }
                }
                for(let orderOption of this.summaryList.orderList.orderOptionList){
                    this.getPositionArr(orderOption, this.summaryList.orderList.orderWidth - (orderOption.leftPos + orderOption.rightPos) * 77, this.summaryList.orderList.orderHeight);
                }
            } else {
                for(let groupNum in resultList){
                    let group = {
                        'groupNum': groupNum,
                        'drugOrder': resultList[groupNum],
                        'engineMsgs': [],
                        'isChecked': false,
                        'status': -1,
                        'checkedNum': 0
                    }
                    let orderIdList = [];
                    for(let order of resultList[groupNum]){
                        orderIdList.push(order.id);
                    }
                    this.iptOrderList.push(group);
                    this.getEngineMsgList(this.iptOrderInput.recipeId, groupNum, orderIdList);
                }
            }
        });
    }
    changeOrder(order: IptOrder, validDate: Date, invalidDate: Date): void{
        let minDate, maxDate, leftPos = 0, rightPos = 0;
        if(order.orderValidTime < validDate.getTime()){
            minDate = validDate;
        } else {
            let orderDate = new Date(order.orderValidTime);
            minDate = new Date(orderDate.getFullYear(), orderDate.getMonth(), orderDate.getDate());
            leftPos = Math.ceil((minDate.getTime() - validDate.getTime()) / 1000 / 60 / 60 / 24);
        }
        if(order.orderInvalidTime > invalidDate.getTime()){
            maxDate = invalidDate;
        } else {
            let orderDate = new Date(order.orderInvalidTime);
            maxDate = new Date(orderDate.getFullYear(), orderDate.getMonth(), orderDate.getDate());
            rightPos = Math.ceil((maxDate.getTime() - invalidDate.getTime()) / 1000 / 60 / 60 / 24);
        }
        this.summaryList.orderList.orderOptionList.push({
            series: {
                name: order.drugName,
                data: [[minDate, 1], [maxDate, 1]],
            },
            maxDataY: 0,
            minDataY: 0,
            maxDataX: maxDate,
            minDataX: minDate,
            leftPos: leftPos,
            rightPos: rightPos,
            top: 0,
            positionArr: [],
            positionStr: '',
            dialog: {
                show: false,
                x: 0,
                y: 0,
                msg: ''
            }
        });
    }
    
    //获取检验单
    getExamList(orderId: number, startDate: string, period: number):void {
        this.iptDetailsService.getIptExamList(orderId, startDate, period).then(result => {
            if(startDate != '' && period != 0){
                let examList = result as PatientExam[];
                let flag = 0;
                for(let dateObj of this.summaryList.dateList){
                    let dateTemp = new Date(dateObj.year + '/' + dateObj.date);
                    let tempExam = new PatientExam();
                    for(let exam of this.examList){
                        let examDate = new Date(exam.reportTime);
                        if(examDate.getFullYear() == dateTemp.getFullYear() && examDate.getMonth() == dateTemp.getMonth() && examDate.getDate() == dateTemp.getDate()){
                            tempExam = exam;
                            this.summaryList.examList[flag].push(tempExam);
                        }
                    }
                    flag++;
                }
            } else {
                this.examList = result as PatientExam[];
            }
        });
    }
    //获取影像
    getImageList(orderId: number, startDate: string, period: number): void {
        this.iptDetailsService.getImageList(orderId, startDate, period).then(resultList => {
            if(resultList && resultList.length > 0){
                if(startDate != '' && period != 0){
                    let image = resultList[0] as PatientImage;
                    let flag = 0;
                    for(let dateObj of this.summaryList.dateList){
                        let dateTemp = new Date(dateObj.year + '/' + dateObj.date);
                        let imageDate = new Date(image.reportTime);
                        if(imageDate.getFullYear() == dateTemp.getFullYear() && imageDate.getMonth() == dateTemp.getMonth() && imageDate.getDate() == dateTemp.getDate()){
                            this.summaryList.examList[flag].push(image);
                        }
                        flag++;
                    }
                } else {
                    this.image = resultList[0] as PatientImage;
                }
            }
        });
    }
    //获取特殊检验
    getSpecialExamList(orderId: number, startDate: string, period: number): void {
        this.iptDetailsService.getSpecialExamList(orderId, startDate, period).then(resultList => {
            if(resultList && resultList.length > 0){
                if(startDate != '' && period != 0){
                    let specialExam = resultList[0] as PatientSpecialExam;
                    let flag = 0;
                    for(let dateObj of this.summaryList.dateList){
                        let dateTemp = new Date(dateObj.year + '/' + dateObj.date);
                        let specialExamDate = new Date(specialExam.reportTime);
                        if(specialExamDate.getFullYear() == dateTemp.getFullYear() && specialExamDate.getMonth() == dateTemp.getMonth() && specialExamDate.getDate() == dateTemp.getDate()){
                            this.summaryList.examList[flag].push(specialExam);
                        }
                        flag++;
                    }
                } else {
                    this.specialExam = resultList[0] as PatientSpecialExam;
                }
            }
        });
    }
    //获取手术列表
    getOpeartionList(orderId: number, startDate: string, period: number):void {
        this.iptDetailsService.getIptOperationList(orderId, startDate, period).then(result => {
            if(startDate != '' && period != 0){
                let operationList = result as PatientOperation[];
                this.summaryList.operationList = [];
                for(let dateObj of this.summaryList.dateList){
                    let dateTemp = new Date(dateObj.year + '/' + dateObj.date);
                    let tempOperation = new PatientOperation();
                    for(let operation of operationList){
                        let operationDate = new Date(operation.operationStartTime);
                        if(operationDate.getFullYear() == dateTemp.getFullYear() && operationDate.getMonth() == dateTemp.getMonth() && operationDate.getDate() == dateTemp.getDate()){
                            tempOperation = operation;
                            break;
                        }
                    }
                    this.summaryList.operationList.push(tempOperation);
                }
            } else {
                this.operationList = result as PatientOperation[];
            }
        });
    }
    //将病程记录数据填充到住院信息汇总中的
    getSummaryProgressList(): void {
        this.summaryList.progressList = [];
        for(let dateObj of this.summaryList.dateList){
            let dateTemp = new Date(dateObj.year + '/' + dateObj.date);
            let tempProgress = new PatientProgress();
            for(let progress of this.progressList){
                let progressDate = new Date(progress.recordTime);
                if(progressDate.getFullYear() == dateTemp.getFullYear() && progressDate.getMonth() == dateTemp.getMonth() && progressDate.getDate() == dateTemp.getDate()){
                    tempProgress = progress;
                    break;
                }
            }
            this.summaryList.progressList.push(tempProgress);
        }
    }
    
    getSummaryExamList(): void {
        this.summaryList.examList = [];
        for(let dateObj of this.summaryList.dateList){
            let dateTemp = new Date(dateObj.year + '/' + dateObj.date);
            let tempExam = new PatientExam();
            for(let exam of this.examList){
                let examDate = new Date(exam.reportTime);
                if(examDate.getFullYear() == dateTemp.getFullYear() && examDate.getMonth() == dateTemp.getMonth() && examDate.getDate() == dateTemp.getDate()){
                    tempExam = exam;
                    break;
                }
            }
            this.summaryList.examList.push(tempExam);
        }
    }
    getVitalSignList(orderId: number, startDate: string, period: number):void {
        this.iptDetailsService.getVitalSignList(orderId, startDate, period).then(result => {
            if(startDate != '' && period != 0){
                let vitalSignList = result as PatientVitalSign[];
                this.summaryList.vitalSignList.vitalSignOptionList = [{series:{name:"体温",data:[],},color:"#2BB5F5",unit:"°C",maxDataY:0,minDataY:0,maxDataX:0,minDataX:0,leftPos:0,rightPos:0,positionArr:[],positionStr:"",dialog:{show:false,x:0,y:0,msg1:"",msg2:""}},{series:{name:"收缩压",data:[],},color:"#FF6C8A",unit:"",maxDataY:0,minDataY:0,maxDataX:0,minDataX:0,leftPos:0,rightPos:0,positionArr:[],positionStr:"",dialog:{show:false,x:0,y:0,msg1:"",msg2:""}},{series:{name:"舒张压",data:[],},color:"#F9A735",unit:"",maxDataY:0,minDataY:0,maxDataX:0,minDataX:0,leftPos:0,rightPos:0,positionArr:[],positionStr:"",dialog:{show:false,x:0,y:0,msg1:"",msg2:""}},{series:{name:"脉率",data:[],},color:"#93B6FF",unit:"次/min",maxDataY:0,minDataY:0,maxDataX:0,minDataX:0,leftPos:0,rightPos:0,positionArr:[],positionStr:"",dialog:{show:false,x:0,y:0,msg1:"",msg2:""}},{series:{name:"心率",data:[],},color:"#FF4800",unit:"次/min",maxDataY:0,minDataY:0,maxDataX:0,minDataX:0,leftPos:0,rightPos:0,positionArr:[],positionStr:"",dialog:{show:false,x:0,y:0,msg1:"",msg2:""}},{series:{name:"呼吸频率",data:[],},color:"#2BB5F5",unit:"次/min",maxDataY:0,minDataY:0,maxDataX:0,minDataX:0,leftPos:0,rightPos:0,positionArr:[],positionStr:"",dialog:{show:false,x:0,y:0,msg1:"",msg2:""}},{series:{name:"24小时入量",data:[],},color:"#53BF0F",unit:"ml",maxDataY:0,minDataY:0,maxDataX:0,minDataX:0,leftPos:0,rightPos:0,positionArr:[],positionStr:"",dialog:{show:false,x:0,y:0,msg1:"",msg2:""}},{series:{name:"24小时出量",data:[],},color:"#11DA9D",unit:"ml",maxDataY:0,minDataY:0,maxDataX:0,minDataX:0,leftPos:0,rightPos:0,positionArr:[],positionStr:"",dialog:{show:false,x:0,y:0,msg1:"",msg2:""}}];
                for(let dateObj of this.summaryList.dateList){
                    let dateTemp = new Date(dateObj.year + '/' + dateObj.date);
                    for(let vitalSign of vitalSignList){
                        let vitalSignDate = new Date(vitalSign.testTime);
                        if(vitalSignDate.getFullYear() == dateTemp.getFullYear() && vitalSignDate.getMonth() == dateTemp.getMonth() && vitalSignDate.getDate() == dateTemp.getDate()){
                            this.changeVitalSign(vitalSign, this.summaryList.vitalSignList.vitalSignOptionList);
                        }
                    }
                }
                let dateNum = this.summaryList.dateList.length;
                this.getSvgPos(this.nowDate.getTime(), new Date(this.summaryList.dateList[dateNum - 1].year + '/' + this.summaryList.dateList[dateNum - 1].date).getTime() ,this.summaryList.vitalSignList.vitalSignOptionList);
                for(let vitalSignOption of this.summaryList.vitalSignList.vitalSignOptionList){
                    this.getPositionArr(vitalSignOption, this.summaryList.vitalSignList.vitalSignWidth - (vitalSignOption.leftPos + vitalSignOption.rightPos) * 77, this.summaryList.vitalSignList.vitalSignHeight);
                }
            } else {
                this.vitalSignList = result as PatientVitalSign[];
                for(let vitalSign of this.vitalSignList){
                    this.vitalSignDate.push(vitalSign.testTime);
                    this.changeVitalSign(vitalSign, this.vitalSignOptionList);
                }
                this.vitalSignDate = this.vitalSignDate.sort();
                let dateNum = this.vitalSignDate.length;
                this.getSvgPos(this.vitalSignDate[0], this.vitalSignDate[dateNum - 1], this.vitalSignOptionList);
            }
        });
    }
    
    //将生命体征对象转为 svg 所需数据格式
    changeVitalSign(vitalSign: PatientVitalSign, list: any[]):void {
        let vitalTime = new Date(vitalSign.testTime);
        if(vitalSign.hasOwnProperty('temperature') && vitalSign.temperature){
            this.pushVitalSign(vitalTime, vitalSign.temperature, list[0]);
        }
        if(vitalSign.hasOwnProperty('sbp') && vitalSign.sbp){
            this.pushVitalSign(vitalTime, vitalSign.sbp, list[1]);
        }
        if(vitalSign.hasOwnProperty('dbp') && vitalSign.dbp){
            this.pushVitalSign(vitalTime, vitalSign.dbp, list[2]);
        }
        if(vitalSign.hasOwnProperty('pulseRate') && vitalSign.pulseRate){
            this.pushVitalSign(vitalTime, parseFloat(vitalSign.pulseRate.replace('次/min','')), list[3]);
        }
        if(vitalSign.hasOwnProperty('heartRate') && vitalSign.heartRate){
            this.pushVitalSign(vitalTime, parseFloat(vitalSign.heartRate.replace('次/min','')), list[4]);
        }
        if(vitalSign.hasOwnProperty('breathingRate') && vitalSign.breathingRate){
            this.pushVitalSign(vitalTime, parseFloat(vitalSign.breathingRate.replace('次/min','')), list[5]);
        }
        // if(vitalSign.painScore){
        //     this.pushVitalSign(vitalTime, parseFloat(vitalSign.painScore.replace('次/min','')), list[5]);
        // }
        if(vitalSign.hasOwnProperty('hour24AmountIn') && vitalSign.hour24AmountIn){
            this.pushVitalSign(vitalTime, parseFloat(vitalSign.hour24AmountIn.replace('ml','')), list[6]);
        }
        // if(vitalSign.hasOwnProperty('hour24AmountOut') && vitalSign.hour24AmountOut){
        //     this.pushVitalSign(vitalTime, parseFloat(vitalSign.hour24AmountOut.replace('ml','')), list[7]);
        // }
    }
    pushVitalSign(date: Date, value: number, vitalSignOption: any): void {
        vitalSignOption.series.data.push([date, value]);
        if(vitalSignOption.maxDataX == 0 || date.getTime() > new Date(vitalSignOption.maxDataX).getTime()){
            vitalSignOption.maxDataX = date;
        }
        if (vitalSignOption.minDataX == 0 || date.getTime() < new Date(vitalSignOption.minDataX).getTime()){
            vitalSignOption.minDataX = date;
        }
        if(vitalSignOption.maxDataY == 0 || value > vitalSignOption.maxDataY){
            vitalSignOption.maxDataY = value;
        }
        if(vitalSignOption.minDataY == 0 || value < vitalSignOption.minDataY){
            vitalSignOption.minDataY = value;
        }
    }
    //获取 svg 的起点位置和终点位置
    getSvgPos(startTime: number, endTime: number, vitalSignList: any[]): void {
        for(let vitalSign of vitalSignList){
            let minDate = new Date(vitalSign.minDataX);
            let maxDate = new Date(vitalSign.maxDataX);
            let startDate = new Date(startTime);
            let endDate = new Date(endTime);
            vitalSign.leftPos = Math.round((new Date(minDate.getFullYear(), minDate.getMonth(), minDate.getDate()).getTime() - new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate()).getTime()) / 1000 / 60 / 60 / 24);
            vitalSign.rightPos = Math.round((new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate()).getTime() - new Date(maxDate.getFullYear(), maxDate.getMonth(), maxDate.getDate()).getTime()) / 1000 / 60 / 60 / 24);
        }
    }
    //获取非药医嘱列表
    getNonOrderList(orderId: number, startDate: string, period: number):void {
        this.iptDetailsService.getNonOrderList(orderId, startDate, period).then(result => {
            if(startDate != '' && period != 0){
                let nonOrderList = result as PatientNonOrder[];
                this.summaryList.nonOrderList = [];
                for(let dateObj of this.summaryList.dateList){
                    let dateTemp = new Date(dateObj.year + '/' + dateObj.date);
                    let tempNonOrder = new PatientNonOrder();
                    for(let nonOrder of nonOrderList){
                        let nonOrderDate = new Date(nonOrder.orderTime);
                        if(nonOrderDate.getFullYear() == dateTemp.getFullYear() && nonOrderDate.getMonth() == dateTemp.getMonth() && nonOrderDate.getDate() == dateTemp.getDate()){
                            tempNonOrder = nonOrder;
                            break;
                        }
                    }
                    this.summaryList.nonOrderList.push(tempNonOrder);
                }
            } else {
                this.nonOrderList = result as PatientNonOrder[];
            }
        });
    }
    engineMsgChecked(isChecked: boolean, status: number, engineMsg: any, engineMsgGroup: any): void {
        if(isChecked){
            engineMsg.resultMsg.operateStatus = status;
            if(status == 2){
                engineMsgGroup.checkedNum++;
            }
        } else {
            engineMsg.resultMsg.operateStatus = 3;
            if(status == 2){
                engineMsgGroup.checkedNum--;
            }
        }
    }
    //获取警示信息
    getEngineMsgList(id: string, groupNo: string, orderIdList: any[]):void {
        this.iptDetailsService.getEngineMsgList(id, groupNo, orderIdList).then(result => {
            if(result && result.hasOwnProperty('drugMsgMap')){
                let drugMsgList = [];
                for(let drugName in result.drugMsgMap){
                    let drugMsg = [];
                    for(let msg of result.drugMsgMap[drugName]){
                        drugMsg.push({
                            'msg': msg,
                            'resultMsg': {
                                "engineMsgId": msg.engineMsgId,
                                "orderId": msg.orderId,
                                "orderType": 1,
                                "operateStatus": 3
                            }
                        });
                    }
                    drugMsgList.push({
                        'drugName': drugName,
                        'drugMsg': drugMsg
                    });
                }
                for(let iptOrder of this.iptOrderList){
                    if(iptOrder.groupNum == groupNo){
                        iptOrder.engineMsgs = drugMsgList;
                    }
                }
            }
        });
    }
    // saveEngineMsgList(engineMsgGroup: any, status: number, info: string): void {
    //     if(status == 0 && (info == '' || info == '审核意见...')){
    //         return;
    //     }
    //     let groupOrderList = [];
    //     for(let engineMsgs of engineMsgGroup.engineMsgs){
    //         let auditBoList = [];
    //         if(status == 0){
    //             for(let drugMsg of engineMsgs.drugMsg){
    //                 auditBoList.push(drugMsg.resultMsg);
    //             }
    //         }
    //         groupOrderList.push({
    //             "auditBoList": auditBoList,
    //             "groupNo": engineMsgGroup.groupNum,
    //             "auditInfo": info == '审核意见...' ? '' : info,
    //             "auditStatus": status,
    //             "engineId": 0,
    //         });
    //     }
    //     let postData = {
    //         'groupOrderList':groupOrderList
    //     }
    //     this.iptOrderDetailsService.saveEngineMsgList(postData).then(result => {
    //         if(result){
    //             //save success
    //             engineMsgGroup.status = status;
    //             engineMsgGroup.isChecked = true;
    //             this.isAllRecipeChecked = true;
    //             for(let order of this.iptOrderList){
    //                 if(!order.isChecked){
    //                     this.isAllRecipeChecked = false;
    //                 }
    //             }
    //             if(this.isAllRecipeChecked){
    //                 let that = this;
    //                 setTimeout(function() {
    //                     that.getNextRecipe();
    //                 }, 1500);
    //             }
    //         } else {
    //             //save error
    //         }
    //     });
    // }
    // getAuditResultList(engineMsg: PatientEngineMap, orderId: string):void {
    //     if(engineMsg && orderId){
    //         this.iptDetailsService.getAuditResultList(orderId).then(result => {
    //             if(result.hasOwnProperty('recordList')){
    //                 engineMsg.auditResultList = result.recordList as AuditResult[];
    //             }
    //         });
    //     }
    // }
    closePopup(): void {
        this.isPopupShow = false;
        this.isAllergyShow = false;
        this.isDiagnoseShow = false;
        this.isProgressShow = false;
        this.isRecordShow = false;
        this.isExamShow = false;
        this.isOperationShow = false;
        this.isVitalSignShow = false;
        this.isNonOrderShow = false;
    }
    changeHash(value: string):void{
        window.location.hash = value;
    }
    vitalSignShow(): void {
        document.getElementById("popupVital").style.display = 'block';
        let vitalSignDom = document.getElementById("popupVitalBox");
        if(vitalSignDom){
            this.vitalSignWidth = document.getElementById("vitalSignTR").offsetWidth - document.getElementById("vitalSignTD").offsetWidth * 2;
            this.vitalSignHeight = document.getElementById("vitalSignTR").offsetHeight;
            for(let vitalSignOption of this.vitalSignOptionList){
                this.getPositionArr(vitalSignOption, this.vitalSignWidth-(vitalSignOption.leftPos + vitalSignOption.rightPos) * 134, this.vitalSignHeight);
            }
        }
    }
    vitalSignHide(): void {
        document.getElementById("popupVital").style.display = 'none';
    }
    orderClick(): void {
        document.getElementById("orderBox").style.display = 'block';
        document.getElementById("summaryBox").style.display = 'none';
    }
    summaryClick(): void {
        document.getElementById("orderBox").style.display = 'none';
        document.getElementById("summaryBox").style.display = 'block';
        if(this.summaryList.vitalSignList.vitalSignWidth == 0){
            this.summaryList.vitalSignList.vitalSignWidth = document.getElementById("summaryBoxTR").offsetWidth - document.getElementById("summaryBoxTH").offsetWidth * 2;
            this.summaryList.vitalSignList.vitalSignHeight = document.getElementById("summaryBoxTR").offsetHeight;
            
            this.summaryList.orderList.orderWidth = document.getElementById("summaryBoxTR").offsetWidth - document.getElementById("summaryBoxTH").offsetWidth * 2;
            this.summaryList.orderList.orderHeight = document.getElementById("summaryBoxTR").offsetHeight;

            this.barWidth = document.getElementById('timeline').offsetWidth;
            this.handleWidth = 7 * (this.barWidth - 5) / this.totalDays;
            document.getElementById('handle').style.left = (this.barWidth - (this.handleWidth - 4) - 5) + "px";
            this.disX = document.getElementById('timeline').getBoundingClientRect().left;
            this.getSummaryData(this.nowDate.getTime().toString(), this.summaryList.dateList.length);
        }
    }
    getSummaryData(startDate: string, period: number): void {
        this.getVitalSignList(this.iptOrderInput.recipeId, startDate, period);
        this.getDiagnoseList(this.iptOrderInput.recipeId, startDate, period);
        this.summaryList.examList = [[],[],[],[],[],[],[]];
        this.getExamList(this.iptOrderInput.recipeId, startDate, period);
        this.getImageList(this.iptOrderInput.recipeId, startDate, period);
        this.getSpecialExamList(this.iptOrderInput.recipeId, startDate, period);
        this.getIptOrderList(this.iptOrderInput.recipeId, startDate, period);
        this.getNonOrderList(this.iptOrderInput.recipeId, startDate, period);
        this.getOpeartionList(this.iptOrderInput.recipeId, startDate, period);
        this.getProgressList(this.iptOrderInput.recipeId, startDate, period);
    }
    /**
     * 返回位置数列
     */
    getPositionArr(vitalSignOption: any, vitalSignWidth: number, vitalSignHeight: number) {
        let dataArr = vitalSignOption.series.data;
        vitalSignOption.positionArr = [];
        vitalSignOption.positionStr = '';
        let spacingY: number = (vitalSignOption.maxDataY == vitalSignOption.minDataY) ? 0 : (vitalSignHeight * 1.0 / (vitalSignOption.maxDataY - vitalSignOption.minDataY));
        let spacingX: number = (vitalSignOption.maxDataX - vitalSignOption.minDataX == 0) ? 0 : (vitalSignWidth * 1.0 / (vitalSignOption.maxDataX - vitalSignOption.minDataX));
        for (let i = 0; i < vitalSignOption.series.data.length; i++) {
            let data: any = {};
            data.y = 10+(vitalSignHeight - (vitalSignOption.series.data[i][1] - vitalSignOption.minDataY) * spacingY);
            data.x = 10+((vitalSignOption.series.data[i][0] - vitalSignOption.minDataX) * spacingX);
            if(spacingY == 0){
                data.y = 10 + vitalSignHeight / 2;
            }
            vitalSignOption.positionStr += data.x + ',' + data.y + ' ';
            vitalSignOption.positionArr.push(data);
        }
    }
    showDetail(vitalSign: any, data: any, i: number) {
        vitalSign.dialog.x = data.x + "px";
        vitalSign.dialog.y = data.y - 70 + "px";
        vitalSign.dialog.msg1 = vitalSign.series.data[i][1];
        vitalSign.dialog.msg2 = new Date(vitalSign.series.data[i][0]);
        vitalSign.dialog.show = true;
    }
    orderDetail(vitalSign: any, data: any, i: number){
        vitalSign.dialog.x = data.x + "px";
        vitalSign.dialog.y = data.y + "px";
        vitalSign.dialog.msg = new Date(vitalSign.series.data[i][0]);
        vitalSign.dialog.show = true;
    }
    hideDetail(vitalSign: any) {
        vitalSign.dialog.show = false;
    }
    //拖动切换时间段
    mouseEventFlag = 1;
    mouseDown($event: any):void {
        this.mouseEventFlag = 1;
        this.offsetLeft = $event.clientX - document.getElementById('handle').getBoundingClientRect().left;
    }
    mouseMove($event: any):void{
        if(this.mouseEventFlag != 1){
            return;
        }
        let L = $event.clientX - this.disX - this.offsetLeft;
            if (L < 5) {
                L = 5;  //最短距离
            } else if (L > this.barWidth - (this.handleWidth - 4) - 5) {
                L = this.barWidth - (this.handleWidth - 4) - 5;  //最长距离
            } 
            document.getElementById('handle').style.left = L + "px";
    }
    mouseUp($event: any, handleBlock: any):void{
        this.mouseEventFlag = 2;
        handleBlock.onmousemove = null;
        let L = $event.clientX - this.disX - this.offsetLeft;
        let daysNum = Math.floor(L / (this.barWidth-5) * this.totalDays) + 6;
        if(L < 5){
            daysNum = 0;
        } else if (L > this.barWidth - (this.handleWidth - 4) - 5){
            daysNum = this.totalDays;
        }
        let startDate = new Date(this.patientInfo.hospitalizedTime);
        startDate.setDate(startDate.getDate() + daysNum);
        this.getSummaryDateList(startDate);
        this.getSummaryData(this.nowDate.getTime().toString(), this.summaryList.dateList.length);
    }
    //点击左右切换时间段
    leftDateClick(): void {
        this.nowDate.setDate(this.nowDate.getDate() - 1 + 6);
        this.getSummaryDateList(this.nowDate);
        let L = document.getElementById('handle').offsetLeft - (this.barWidth - 5) / this.totalDays;
        if (L < 5) {
            L = 5;  //最短距离
        } else if (L > this.barWidth - (this.handleWidth - 4) - 5) {
            L = this.barWidth - (this.handleWidth - 4) - 5;  //最长距离
        } 
        document.getElementById('handle').style.left = L + "px";
        this.getSummaryData(this.nowDate.getTime().toString(), this.summaryList.dateList.length);
    }
    rightDateClick(): void {
        this.nowDate.setDate(this.nowDate.getDate() + 1 + 6);
        this.getSummaryDateList(this.nowDate);
        let L = document.getElementById('handle').offsetLeft + (this.barWidth - 5) / this.totalDays;
        if (L < 5) {
            L = 5;  //最短距离
        } else if (L > this.barWidth - (this.handleWidth - 4) - 5) {
            L = this.barWidth - (this.handleWidth - 4) - 5;  //最长距离
        } 
        document.getElementById('handle').style.left = L + "px";
        this.getSummaryData(this.nowDate.getTime().toString(), this.summaryList.dateList.length);
    }
    
    // getNextRecipe(): void {
    //     this.iptOrderDetailsService.getNextRecipe(this.iptOrderInput.recipeId).then(result => {
    //         if(result){
    //             this.router.navigate(['/ipt-order-details/'+result]);
    //         }
    //     });
    // }
    
}