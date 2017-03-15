import { Component, OnInit, ViewChild, Input, OnChanges, EventEmitter, Output} from '@angular/core';

import { DataDetailService } from './data_detail.service';
import { GradeDetailService } from './grade_detail.service';
import { DrugService } from '../patient_guide/drug_tree.service';
import {Http, Response} from '@angular/http';
import {Headers, RequestOptions} from '@angular/http';
import { UserService } from '../../user.service';
import { DialogPlugin, DialogModel} from '../../common/ug-dialog/dialog';
import { ScoreService } from './score.service';
export class Score {
    dataId: string;
    scoringRuleId: string;
    score: number;
    scoringType: number;
    dataType: string;
    id:number;
}
export class RctScore {
    tbOneScore: number;                //如果有两张表，这次存放表一的分数    
    LeanDegree: string;                //整体偏倚程度
    ScoreLevel: string;
}

@Component({
    selector: 'data-grade-audit-content',
    template: require('./data_grade_audit_content.component.html')
})
export class DataGradeAuditContentComponent implements OnInit, OnChanges {
    docInfo: any = {};
    ID: string;
    itemInfo: any[];
    @Input() isShowMessage: boolean;  //是否显示评分框
    @Input() handler: string;        //true为审核，false评分
    @Input() isAudited: boolean;      //审核状态 
    @Input() literatureType: number;  //文献类型：0-meta，1-rct,2-nrcs,3-cs,4-ccs,5-qhes,6-chec
    
    scoringSettingArray: any[] = [];  //存放评分选项二维数组
    // 表格
    ScoreArray: any[] = [];           //存放评分/审核结果(即本操作人的结果)
    // ScoreArray_0: any[] = [];
    ScoreArray_1: any[] = [];         //1号评分人的评分结果
    ScoreArray_2: any[] = [];         //2号评分人的评分结果
    Score: any[] = [];
    Score_1: any[] = [];              //1号审核人的评分结果信息，包含分值，graders-姓名
    Score_2: any[] = [];              //2号审核人的评分信息
    ScoreLevel: string;               //存放证据质量

    Grader_1: string;
    Grader_2: string;
    rctScore = new RctScore();
    rctScore_1 = new RctScore();
    rctScore_2 = new RctScore();

    method: boolean = true;//true为修改，false新增
    error: string;
    username: string;
    @ViewChild(DialogPlugin) dialogPlugin: DialogPlugin;
    returnBody: Score[] = [];

    constructor(
        // @Host() @Inject(forwardRef(() => AppComponent)) app: AppComponent,
        private gradeDetailService: GradeDetailService,
        private userService: UserService,
        private scoreService: ScoreService
    ) {
        // this.username = app.user.realname;
    }

    ngOnInit() {
        if (this.literatureType != undefined) {
            this.getInfoById();
            this.docInfo = this.gradeDetailService.docInfo;
            
            this.getScoreById();
            this.username = this.userService.user.realname;
        }
    }

    ngOnChanges(changes: any) {
        this.literatureType = changes.literatureType ? changes.literatureType.currentValue : this.literatureType;
        this.isShowMessage = changes.isShowMessage ? changes.isShowMessage.currentValue : this.literatureType;
        if (changes.literatureType) {
            this.ngOnInit();
        }
    }

    getInfoById() {
        // console.log(this.literatureType);
        if (this.literatureType == 0)
            this.ID = 'meta';
        else if (this.literatureType == 1)
            this.ID = 'rct';
        else if (this.literatureType == 2)
            this.ID = 'nrcs';
        else if (this.literatureType == 3)
            this.ID = 'cs';
        else if (this.literatureType == 4)
            this.ID = 'ccs';
        else if (this.literatureType == 5)
            this.ID = 'qhes';
        else if (this.literatureType == 6)
            this.ID = 'chec';
            
        this.scoreService.getItemInfo(this.ID)
            .then(itemInfo => {
                this.itemInfo = itemInfo;
                for (let j = 1; j < itemInfo.length; j++) {
                    let tempScoreArray: any[] = itemInfo[j].scoringSetting.split("；");
                    if (this.literatureType != 1) {
                        for (let k = 0; k < tempScoreArray.length; k++) {
                            tempScoreArray[k] = parseInt(tempScoreArray[k]);
                        }
                    }
                    this.scoringSettingArray.push(tempScoreArray);
                }
            },
            error => this.error = <any>error);
    }

    @Output() setScore: EventEmitter<any> = new EventEmitter();
    emitScore(score: any) {
        this.setScore.emit(score);
    }
    getScoreById() {
        if (this.handler == 'score') {
            this.scoreService.getScore(this.docInfo.businessId)
                .then(Score => {
                    if(this.scoreService.isEmptyObject(Score)){
                        this.emitScore("");
                        this.method = false;
                        return;
                    } 
                    
                    this.Score = Score;
                    this.emitScore(this.Score[0].score);
                    for (let j = 0; j < this.Score.length; j++) {
                        let temp = this.Score[j].score;
                        this.ScoreArray.push(temp);
                    }
                    this.updateScore(this.ScoreArray);
                    if (!this.scoreService.isEmptyObject(this.Score)) this.method = true;
                    else this.method = false;
                },
                error => this.error = <any>error);
        } else {
            // 审核人的分数
            this.scoreService.getScore(this.docInfo.businessId, 0)
                .then(Score => {
                    if (!this.scoreService.isEmptyObject(Score)) {
                        this.Score = Score;
                        this.emitScore(this.Score[0].score);
                        for (let j = 0; j < this.Score.length; j++) {
                            let temp = this.Score[j].score;
                            this.ScoreArray.push(temp);
                        }
                        // 求审核人的总评分
                        // this.updateAuditScore();
                        this.updateScore(this.ScoreArray);
                        this.scoreService.ScoreLevel = this.ScoreLevel;
                    }
                },
                error => this.error = <any>error);
            // 评分人1的分数            
            this.scoreService.getScore(this.docInfo.businessId, 1)
                .then(Score => {
                    if (!this.scoreService.isEmptyObject(Score)){
                        this.Score_1 = Score;
                        this.Grader_1 = Score[0].graders;
                        //  console.log(this.Score);
                        for (let j = 0; j < this.Score_1.length; j++) {
                            let temp = this.Score_1[j].score;
                            this.ScoreArray_1.push(temp);
                        }
                        // 求评分人1的总评分
                        this.updateScore(this.ScoreArray_1, 1);
                    }
                },
                error => this.error = <any>error);
            // 评分人2的分数            
            this.scoreService.getScore(this.docInfo.businessId, 2)
                .then(Score => {
                    if (!this.scoreService.isEmptyObject(Score)){
                        this.Score_2 = Score;
                        this.Grader_2 = Score[0].graders;
                        for (let j = 0; j < this.Score_2.length; j++) {
                            let temp = this.Score_2[j].score;
                            this.ScoreArray_2.push(temp);
                        }
                        // 求评分人2的总评分
                        // if (this.literatureType == 2) {
                        //     //如果是rct的话，总分算法不一样
                        //     // this.updateRctScore(this.ScoreArray_2);
                        // }
                        this.updateScore(this.ScoreArray_2, 2);
                    }
                },
                error => this.error = <any>error);
        }
    }
    /*****
     * @function 修改总分
     * @param    -arr 需要求总分的列表，总分存放在第0位
     *           -graderNo 默认：表示本操作人，1-表示1号评分人，2-表示2号评分人
     */
    updateScore(arr: any[], graderNo?: number) {
        if (!graderNo) graderNo = 0;
        switch (this.literatureType) {
            case 0:
                this.updateMateScore();
                this.updateDefaultScore(arr, graderNo);
                break;
            case 1:
                if (graderNo == 1)
                    this.updateRctScore(this.rctScore_1, arr, 1);
                else if (graderNo == 2)
                    this.updateRctScore(this.rctScore_2, arr, 2);
                else
                    this.updateRctScore(this.rctScore, arr);
                break;
            default:
                this.updateDefaultScore(arr, graderNo);
                break;
        }
    }
    updateDefaultScore(arr: any[], graderNo: number) {
        arr[0] = parseInt('0');
        for (let i = 1; i < arr.length; i++) {
            if (arr[i])
                arr[0] += parseInt(arr[i]);
        }
        this.getScoreLevel(arr[0], graderNo);
    }
    updateMateScore() {
        if (this.ScoreArray[1] == 4) {
            for (let i = 7; i <= 9; i++) {
                this.ScoreArray[i] = 0;
            }
        }

    }
    updateRctScore(rct: RctScore, scoreArr: any[], graderNo?: number) {
        rct.tbOneScore = 0;
        rct.LeanDegree = null;
        for (let i = 1; i < 5; i++) {
            if (scoreArr[i])
                rct.tbOneScore += parseInt(scoreArr[i]);
        }
        if (graderNo == undefined) graderNo = 0;
        this.getLeanDegree(rct, scoreArr);
        this.getScoreLevel(rct.tbOneScore, graderNo);
    }
    // updateAuditScore() {
    //     this.ScoreArray_2[0] = 0;
    //     for (let i = 1; i < this.ScoreArray_2.length; i++) {
    //         if (this.ScoreArray_2[i])
    //             this.ScoreArray_2[0] += parseInt(this.ScoreArray_2[i]);
    //     }
    //     this.getScoreLevel(this.ScoreArray_2[0]);
    // }
    getScoreLevel(totalScore: number, graderNo: number) {
        switch (this.literatureType) {
            case 0:
                this.getMateScoreLevel(totalScore, graderNo);
                break;
            case 1:
                this.getRctScoreLevel(totalScore, graderNo);
                break;
            case 2:
                this.getNrcsScoreLevel(totalScore, graderNo);
                break;
            case 3:
                this.getCcsOrCsScoreLevel(totalScore, graderNo);
                break;
            case 4:
                this.getCcsOrCsScoreLevel(totalScore, graderNo);
                break;
            case 5:
                this.getQhesScoreLevel(totalScore, graderNo);
                break;
            case 6:
                this.getChecScoreLevel(totalScore, graderNo);
                break;

        }
    }
    getMateScoreLevel(totalScore: number, graderNo: number) {
        let level: string;
        if (totalScore >= 4) level = "高级";
        else if (totalScore == 3) level = "中级";
        else if (totalScore == 2) level = "低级";
        else level = "极低";
        this.setScoreLevel(level, graderNo);
    }

    setScoreLevel(level: string, graderNo: number) {
        switch (graderNo) {
            case 1:
                this.scoreService.ScoreLevel_1 = level;
                break;
            case 2:
                this.scoreService.ScoreLevel_2 = level;
                break;
            default:
                this.ScoreLevel = level;
        }
    }
    getLeanDegree(rct: RctScore, scoreArr: any[]) {
        if (this.isAllZero(scoreArr) == 0) {
            rct.LeanDegree = "低偏倚";
        } else if (this.isAllZero(scoreArr) == 1) {
            rct.LeanDegree = "不清楚";
        } else if (this.isAllZero(scoreArr) == 2) {
            rct.LeanDegree = "高偏倚";
        }
    }
    isAllZero(arr: any[]) {
        let isZero = 0;
        for (let index = 5; index < arr.length; index++) {
            if (arr[index] == "高偏倚") {
                return isZero = 2;//有2存在即高偏倚；
            }
            else if (arr[index] == "不清楚") {
                isZero = 1;//只有1和0为不清楚
            }
        }
        return isZero;
    }
    getRctScoreLevel(totalScore: number, graderNo: number) {
        let level: string;
        if (totalScore >= 4) {
            level = "高质量";
        } else {
            level = "低质量";
        }
        switch (graderNo) {
            case 1:
                this.rctScore_1.ScoreLevel = level;
                this.scoreService.ScoreLevel_1 = level + ',' + this.rctScore_1.LeanDegree;
                break;
            case 2:
                this.rctScore_2.ScoreLevel = level;
                this.scoreService.ScoreLevel_2 = level + ',' + this.rctScore_2.LeanDegree;
                break;
            default:
                this.rctScore.ScoreLevel = level;
                this.scoreService.ScoreLevel = level + ',' + this.rctScore.LeanDegree;
        }
    }

    getNrcsScoreLevel(totalScore: number, graderNo: number) {
        let level: string;
        if (totalScore >= 15) {
            level = "高质量";
        }
        else {
            level = "低质量";
        }
        this.setScoreLevel(level, graderNo);
    }

    getCcsOrCsScoreLevel(totalScore: number, graderNo: number) {
        let level: string;
        if (totalScore >= 6) {
            level = "高质量";
        }
        else {
            level = "低质量";
        }
        this.setScoreLevel(level, graderNo);
    }
    /**
     * author by wanggm 
     * @date 2016/11/14
     * 新的资料评分类型
     */
    getQhesScoreLevel(totalScore: number, graderNo: number){
        let level: string;
        
        if(totalScore >= 75){
            level = "高质量";
        }else if(totalScore >= 50 && totalScore < 75){
            level = "一般质量";
        }else if(totalScore >= 25 && totalScore < 50){
            level = "低质量";
        }else{
            level = "极低质量";
        }
        this.setScoreLevel(level, graderNo);
    }
    getChecScoreLevel(totalScore: number, graderNo: number){
        let level: string;
        if(totalScore >= 15){
            level = "高质量";
        }else if(totalScore >= 10 && totalScore < 15){
            level = "一般质量";
        }else if(totalScore >= 5 && totalScore < 10){
            level = "低质量";
        }else{
            level = "极低质量";
        }
        this.setScoreLevel(level, graderNo);
    }

    @Output() onClose: EventEmitter<any> = new EventEmitter();//type


    saveScore() {
        this.returnBody = [];
        if (this.rctScore.tbOneScore) {
            this.ScoreArray[0] = this.rctScore.tbOneScore + "," + this.rctScore.LeanDegree;
        }
        for (let i = 0; i < this.ScoreArray.length; i++) {
            
            if (!this.ScoreArray[i] && this.ScoreArray[i] != 0) {
                this.dialogPlugin.tip("请为所有项目评分");
                return;
            }
            else {
                let tempBody = new Score();
                let j = i;
                if (this.literatureType == 2 && i != 0) {
                    j = j + 2;
                }
                tempBody.scoringRuleId = this.itemInfo[j].scoringRuleId;
                tempBody.dataType = this.itemInfo[0].scoringRuleId;
                tempBody.score = this.ScoreArray[i];
                // tempBody.scoringType = this.scoreService.scoringType;
                tempBody.dataId = this.docInfo.businessId;
                // console.log(this.Score);
                tempBody.id = this.scoreService.isEmptyObject(this.Score)?null:this.Score[j].id;
                this.returnBody.push(tempBody);
            }
        }
        if (this.handler == 'audit') {
            this.scoreAudit(this.returnBody);
        }
        else this.score(this.returnBody);
    }

    score(returnBody: any[]) {
        //method = true为修改，false新增
        if (!this.method) {
            this.scoreService.postScore(this.returnBody)
                .then(result => {
                    this.dialogPlugin.tip(result.message);
                    this.Score = result.data;
                    this.close();
                    this.method = true;

                    this.emitScore(this.Score[0].score);
                },
                error => this.error = <any>error
                );
        }
        else {
            this.scoreService.putScore(this.returnBody)
                .then(result => {
                    this.dialogPlugin.tip(result.message);
                    this.Score = result.data;
                    this.close();
                    this.method = true;

                    this.emitScore(this.Score[0].score);
                },
                error => this.error = <any>error
                );
        }
    }

    scoreAudit(returnBody: any[]) {
        this.scoreService.postScoreAudit(this.returnBody)
            .then(result => {
                this.dialogPlugin.tip(result.message);
                this.scoreService.ScoreLevel = this.ScoreLevel;
                this.close();
            },
            error => this.error = <any>error
            );
    }


    close() {
        this.onClose.emit(null);
    }


}