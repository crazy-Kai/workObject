import { Component, OnInit, Pipe, PipeTransform, ViewChild, Renderer } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { TreeModule, TreeNode, TreeComponent } from 'angular2-tree-component';
import { Subject } from 'rxjs/Subject';

import { AuditPlanService } from './audit-plan.service';

import { AuditPlan } from './audit-plan';
import { AuditPlanMap } from './audit-plan-map';
import { AuditPlanICD10 } from './audit-plan-icd10/audit-plan-icd10';
import { AuditPlanWarning } from '../common/audit-plan-warning/audit-plan-warning';
import { AuditPlanWarningMap } from '../common/audit-plan-warning/audit-plan-warning-map';
import { AuditPlanAnalysis } from '../common/audit-plan-warning/audit-plan-analysis';
import { AuditPlanAnalysisType } from '../common/audit-plan-warning/audit-plan-analysis-type';

@Component({
    selector: 'audit-plan',
    templateUrl: 'audit-plan.component.html',
    styleUrls: [ 'audit-plan.component.css', '../common/popup-add.css' ]
})
export class AuditPlanComponent implements OnInit {
    auditPlan: AuditPlan = new AuditPlan();
    auditPlanMapOrgin: AuditPlanMap[];
    auditPlanMap: AuditPlanMap[];
    icdResultList: any[] = [];
    //auditPlanDeptList: AuditPlanDept[];
    //auditPlanICD10List: AuditPlanICD10[] = [];
    //auditPlanICD10OrginList: AuditPlanICD10[] = [];
    //auditPlanICD10ResultList: AuditPlanICD10[] = [];
    //auditPlanICD10ChooseList: AuditPlanICD10[] = [];
    //isICD10Show: boolean = false;
    //isICD10AllChecked: boolean = true;
    warningMap: AuditPlanWarningMap[] = [new AuditPlanWarningMap()];
    displayWaringMap: AuditPlanWarningMap[] = [new AuditPlanWarningMap()];
    deptOptions: any = {
        isShow: false,
        inputType: 3,
        deviationWidth: 200,
        type: this.auditPlan.category
    };
    doctorIds: string = '';
    history: any = window.history;

    private payType: string = '';
    private drugProperty: string = '';
    private drugCategory: string = '';
    private doctor: string = '';
    private deptType: string = '3';
    private drugCategoryResultList: any[] = [];
    //科室院区
    private activeZone: any[] = [];
    private activeDept: any[] = [];
    //特殊字符
    private specialPattern = new RegExp("[`~!@#$^&*()=|{}':;',\\[\\].<>/?~！@#￥……&*（）&;|{}【】‘；：”“'。，、？]");

    constructor(
        private auditPlanService: AuditPlanService,
        private router: Router,
        private activeRouter: ActivatedRoute,
        private renderer: Renderer
    ) {
        renderer.listenGlobal('document','click',($event)=>{
            if($event.target.className != 'audit-plan-old'){
                this.isShowAuditPlanOld = false;
            }
        });
    }

    categoryChange(category: number):void {
        this.deptOptions.type = this.auditPlan.category = category;

        if(category == 1){
            this.auditPlan.isOuvas = 1;
            this.auditPlan.isPivas = 0;
        } else {
            this.auditPlan.isOuvas = 0;
            this.auditPlan.isPivas = 1;
        }
    }
    // getAuditPlanDeptList(): void {
    //     this.auditPlanService.getAuditPlanDeptList().then(deptList => {
    //         this.auditPlanDeptList = deptList;
    //     });
    // }
    // deptChange(deptId: string):void {
    //     if(deptId != '全部'){
    //         this.auditPlan.deptId = deptId;
    //     }
    // }
    onInputDays(value: any, type: boolean): void{
        if(value && !isNaN(value)){
            if(type){
                this.auditPlan.minStay = value;
            } else {
                this.auditPlan.maxStay = value;
            }
        }
    }
    onInputAge(value: number, type: boolean): void {
        if(value && !isNaN(value)){
            if(type){
                this.auditPlan.minAge = value;
            } else {
                this.auditPlan.maxAge = value;
            }
        }
    }
    onChangeAge(value: any): void {
        this.auditPlan.ageUnit = value;
    }
    // getAuditPlanICD10(): void {
    //     this.auditPlanService.getAuditPlanICD10().then(auditPlanICD10List => {
    //         this.auditPlanICD10OrginList = auditPlanICD10List;
    //         this.icd10Init();
    //     });
    // }
    // icd10Init(): void {
    //     //TODO - 接口中缺少icd10字段，暂时缺少预填充icd10功能
    //     for(let icd10 of this.auditPlanICD10OrginList){
    //         icd10.checked = false;
    //         this.isICD10AllChecked = false;
    //     }
    //     this.auditPlanICD10List = this.auditPlanICD10OrginList;
    // }
    // icd10Search(text: string): void {
    //     if(text.trim()){
    //         this.auditPlanService.searchAuditPlanICD10(text.trim()).then(auditPlanICD10List => {
    //             this.auditPlanICD10List = [];
    //             for(let auditPlanICD10 of auditPlanICD10List){
    //                 //this.auditPlanICD10List.push(Object.assign({checked: false}, auditPlanICD10));
    //                 auditPlanICD10.checked = false;
    //                 this.auditPlanICD10List.push(auditPlanICD10);
    //             }
    //         });
    //     }
    // }
    // icd10Click(icd0CheckBox: any): void {
    //     if(icd0CheckBox){
    //         //check one
    //         icd0CheckBox.checked = !icd0CheckBox.checked;
    //         if(icd0CheckBox.checked && !~this.auditPlanICD10ChooseList.indexOf(icd0CheckBox)){
    //             this.auditPlanICD10ChooseList.push(icd0CheckBox);
    //         } else {
    //             this.auditPlanICD10ChooseList = this.auditPlanICD10ChooseList.filter(item => item.id !== icd0CheckBox.id);
    //         }
    //         this.isICD10AllChecked = true;
    //         for(let icd10 of this.auditPlanICD10List){
    //             if(!icd10.checked){
    //                 this.isICD10AllChecked = false;
    //             }
    //         }
    //     } else {
    //         this.isICD10AllChecked = !this.isICD10AllChecked;
    //         if(this.isICD10AllChecked){
    //             //all checked
    //             for(let icd10 of this.auditPlanICD10List){
    //                 icd10.checked = true;
    //                 if(!~this.auditPlanICD10ChooseList.indexOf(icd10)){
    //                     this.auditPlanICD10ChooseList.push(icd10);
    //                 }
    //             }
    //         } else {
    //             //all unchecked
    //             for(let icd10 of this.auditPlanICD10List){
    //                 icd10.checked = false;
    //             }
    //             this.auditPlanICD10ChooseList = [];
    //         }
    //     }
    // }
    // icd10ResultDelete(icd10Result: AuditPlanICD10): void {
    //     this.auditPlanICD10ChooseList = this.auditPlanICD10ChooseList.filter(item => item.id !== icd10Result.id);
    //     this.auditPlanICD10ResultList = this.auditPlanICD10ResultList.filter(item => item.id !== icd10Result.id);
        
    //     //change checked value in auditPlanICD10List
    //     for(let icd10 of this.auditPlanICD10List){
    //         if(icd10.name == icd10Result.name && icd10.id == icd10Result.id){
    //             icd10.checked = false;
    //         }
    //     }
    //     this.isICD10AllChecked = false;
    //     //get result string
    //     let resultArr = [];
    //     for(let icd10 of this.auditPlanICD10ResultList){
    //         resultArr.push(icd10.name);
    //     }
    //     //TODO - update auditPlan Object
    // }
    // deleteICD10Check(icd10Choose: AuditPlanICD10): void {
    //     icd10Choose.checked = false;
    //     this.isICD10AllChecked = false;
    //     this.auditPlanICD10ChooseList = this.auditPlanICD10ChooseList.filter(item => item.id !== icd10Choose.id);
    // }
    // icd10Cancle(): void{
    //     this.isICD10Show = false;
    //     this.icd10Init(); //reset
    //     this.auditPlanMap = this.auditPlanMapOrgin;
    // }
    // icd10Submit(): void{
    //     this.isICD10Show = false;
    //     this.auditPlanICD10ResultList = [];
    //     let resultArr = [];
    //     for(let icd10 of this.auditPlanICD10ChooseList){
    //         this.auditPlanICD10ResultList.push(icd10);
    //         resultArr.push(icd10.name);
    //     }
    //     //TODO - update auditPlan Object
    // }
    getAuditPlanMap(): void {
        this.auditPlanService.getAuditPlanMap().then(auditPlanMap => {
            this.auditPlanMap = auditPlanMap;
            this.auditPlanMapOrgin = auditPlanMap;
        });
    }
    changeAuditPlanMap(event:Event): void {
        const selectedIndex:number = (<HTMLSelectElement>event.srcElement).selectedIndex;
        if(selectedIndex != 0){
            this.getAuditPlan(selectedIndex);
        }
    }
    
    getAuditPlan(auditPlanId: number): void {
        this.auditPlan.id = this.auditPlanMap[auditPlanId-1].id;
        this.ajaxAuditPlan(this.auditPlan.id);
    }
    ajaxAuditPlan(auditPlanId: number): void {
        this.auditPlanService.getAuditPlan(auditPlanId).then(auditPlan => {
            this.auditPlan = auditPlan;
            //TODO - 
            if(this.auditPlan.infoList && this.auditPlan.infoList.length >= 0){
                this.warningMap = [];
                for(let item of this.auditPlan.infoList){
                    let warning  = new AuditPlanWarningMap();
                    warning.analysis.name = item.analysisType;
                    warning.analysisType.name = item.message;
                    warning.analysisStatus = item.cautionStatus;
                    warning.warningLevelType = item.symbol;
                    warning.warningLevel = item.severity;
                    this.warningMap.push(warning);
                }

                this.displayWaringMap = [];
                for(let item of this.auditPlan.displayInfoList){
                    let warning  = new AuditPlanWarningMap();
                    warning.analysis.name = item.analysisType;
                    warning.analysisType.name = item.message;
                    warning.analysisStatus = item.cautionStatus;
                    warning.warningLevelType = item.symbol;
                    warning.warningLevel = item.severity;
                    this.displayWaringMap.push(warning);
                }
            }

            try{
                this.icdResultList = JSON.parse(this.auditPlan.icd10);
            }catch(e){
                this.icdResultList = [];
            }

            try{
                this.drugCategoryResultList = JSON.parse(this.auditPlan.drugCategorys);
            }catch(e){
                this.drugCategoryResultList = [];
            }

            let _doctorIds = [],
                dataSource = this.auditPlan.category == 1 ? this.auditPlan.doctorList : this.auditPlan.groupList;
            for(let _zone of dataSource){
                for(let id in _zone.idNamePairs){
                    _doctorIds.push(id);
                }
            }
            this.doctorIds = _doctorIds.join(';');

            this.deptOptions.type = this.auditPlan.category;
        });
    }
    clearAuditPlanName(name){ 
        let replaceName = ""; 
        for (let i = 0; i < name.length; i++) { 
            replaceName = replaceName + name.substr(i, 1).replace(this.specialPattern, ''); 
        } 
        return replaceName;  
    } 
    saveAuditPlan(): void {
        //去除特殊字符
        this.auditPlan.name = this.clearAuditPlanName(this.auditPlan.name);

        if(this.auditPlan.name.length > 60){
            alert('方案名称最多60个字符！');
            return;
        }

        console.log(this.auditPlan.name);
        if(this.auditPlan.name.trim()){
            if(this.auditPlan.id){
                this.auditPlanService.updateAuditPlan(this.auditPlan).then(code => {
                    if(code == 200){
                        //save success
                        this.router.navigate(['/audit-setting']);
                    } else {
                        //save error
                        //TODO - 显示保存失败浮层
                    }
                });
            } else {
                this.auditPlanService.addAuditPlan(this.auditPlan).then(code => {
                    if(code == 200){
                        //save success
                        this.router.navigate(['/audit-setting']);
                    } else {
                        //save error
                        //TODO - 显示保存失败浮层
                    }
                });
            }
        }
    }

    handlePayTypeUpdate(value):void {
        console.log('费用类型：' + value);
        this.auditPlan.costTypes = value;
    }

    handleDrugPropertyUpdate(value):void {
        console.log('药品属性：' + value);
        this.auditPlan.drugProperties = value;
    }
    handleDrugCategoryUpdate(value):void {
        console.log('药品分类：' + value);

        var result = [];
        for(let drug of value){
            result.push({
                id: drug.id,
                name: drug.name
            });
        }

        this.auditPlan.drugCategorys = JSON.stringify(result);
    }
    handleDoctorUpdate(value):void {
        this.auditPlan[value.searchType == 1 ? 'doctorList' : 'groupList'] = value.arr;
        this.auditPlan[value.searchType == 2 ? 'doctorList' : 'groupList'] = [];
    }
    // handleDeptUpdate(value): void {
    //     console.log('科室：' + value);
    //     this.auditPlan.deptIds = value;
    // }
    handleICD10Update(value): void {
        console.log('icd10' + value);

        let result = [];

        for(let icd of value){
            result.push({
                id: icd.id,
                name: icd.name
            });
        }

        this.auditPlan.icd10 = JSON.stringify(result);
    }

    /************************ 获取ICD10弹窗 ************************/
    icd10DialogOptions: any;
    @ViewChild('icd10Dialog') icd10Dialog: any;
    chooseICD10() {
        this.icd10DialogOptions = {
            mutipleChoose: true,
            ICD10_ID: this.auditPlan.icd10,
            choosedICD10s: this.icdResultList
        }
        this.icd10Dialog.show();
    }
    chooseNewICD10Confirm($event: any) {
        this.icdResultList = $event;
        this.handleICD10Update(this.icdResultList);
    }
    icd10ResultDelete(id){
        this.icdResultList = this.icdResultList.filter(function(item){
            return item.id != id;
        });
        this.handleICD10Update(this.icdResultList);
    }
    /************************ 获取ICD10弹窗 ************************/

    /************************ 获取药品分类弹窗 ************************/
    drugCategoryDialogOptions: any;
    @ViewChild('drugCategoryDialog') dialog: any;
    chooseDrug() {
        this.drugCategoryDialogOptions = {
            mutipleChoose: true,
            DRUG_ID: this.auditPlan.category,
            choosedDrugs: this.drugCategoryResultList
        }
        this.dialog.show();
    }
    chooseNewCategoryConfirm($event: any) {
        this.drugCategoryResultList = $event;
        this.handleDrugCategoryUpdate(this.drugCategoryResultList);
        console.log(this.auditPlan.category);
    }
    drugCategoryResultDelete(id){
        this.drugCategoryResultList = this.drugCategoryResultList.filter(function(item){
            return item.id != id;
        });
        this.handleDrugCategoryUpdate(this.drugCategoryResultList);
        console.log(this.auditPlan.category);
    }
    /************************ 获取药品分类弹窗 ************************/

    /* 科室选择事件 */
    fnDeptSelect($event){
        this.auditPlan.deptList = $event;
    }

    fnZoneDeptDelete(type,zoneDept,$event){
        for(let zone of this.auditPlan.deptList){
            if(type == 'zone'){
                if(zone.zoneId == zoneDept.zoneId){
                    this.auditPlan.deptList.splice(this.auditPlan.deptList.indexOf(zone)-1,1);
                }
            }else{
                for(let deptId in zone.idNamePairs){
                    if(deptId == zoneDept.id){
                        delete zone.idNamePairs[deptId];
                    }
                }
            }
        }

        $event.cancelBubble = true;
    }

    ngOnInit() {
        this.getAuditPlanMap();

        let id = this.activeRouter.params['value'].id;

        if(id){
            this.ajaxAuditPlan(id);
        }
    }

    private isShowAuditPlanOld = false;
    selectAuditPlanOld(){
        this.isShowAuditPlanOld = !this.isShowAuditPlanOld;
    }

    private auditPlanOldSelected: Object = {
        id: '',
        name: ''
    };
    //加载已有方案事件
    auditPlanOldSel($event){
        this.auditPlanOldSelected = $event;
        this.ajaxAuditPlan($event['id']);
    }
    //选择警示信息事件
    selectWaringMap($event){
        let result = [];
        for(var info of $event){
            let obj = {
                analysisType: info.analysis.name,
                message: info.analysisType.name,
                cautionStatus: info.analysisStatus,
                symbol: info.warningLevelType,
                severity: info.warningLevel
            };
            result.push(obj);
        }
        this.auditPlan.infoList = result;
    }

    //选择展示警示信息事件
    selectDisplayWaringMap($event){
        let result = [];
        for(var info of $event){
            let obj = {
                analysisType: info.analysis.name,
                message: info.analysisType.name,
                cautionStatus: info.analysisStatus,
                symbol: info.warningLevelType,
                severity: info.warningLevel
            };
            result.push(obj);
        }
        this.auditPlan.displayInfoList = result;
    }

    trans2Arr(dept){
        let keys = Object.keys(dept),
            result = [];
        for(let key of keys){
            result.push({
                id: key,
                name: dept[key]
            });
        }
        return result;
    }

    deptclick($event){
        this.deptOptions.isShow = !this.deptOptions.isShow;
        $event.stopPropagation();
    }
}