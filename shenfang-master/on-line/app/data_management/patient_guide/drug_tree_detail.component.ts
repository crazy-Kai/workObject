// 添加药品detail

import { Host, Component, Inject, OnInit, OnDestroy, Input, ViewChild, Output, EventEmitter, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { DrugService } from './drug_tree.service';
import { ActivatedRoute } from '@angular/router';



import { GuideListService } from './guide_list.service';
import { DictionaryService } from './dictionary.service';
// import { UrlService } from '../../url.service';
import { PatientUseTimeService } from './general_timeset.service';
//引入药品/产品相关指导数据结构
import { PatientDrugGuideDto } from './guide_detail';
import { PatientDrugDescriptionDtoList } from './guide_detail';
import { Des } from './guide_detail';
import { PatientDrugEffectDto } from './guide_detail';
import { PatientDrugInfluenceDto } from './guide_detail';
import { PatientDrugStorageDto } from './guide_detail';
import { FreqItem } from './guide_detail';
import { GuideDetail } from './guide_detail';
import { OccaItem } from './guide_detail';
//引入插件
import { DialogPlugin, DialogModel } from '../../common/ug-dialog/dialog';
import { Observable } from 'rxjs/Observable';
import { UserService } from '../../user.service';

declare var UE: any;

@Component({
    selector: 'base-drug',
    template: `
    <div class="dialog-template" *ngIf="isTemplate">
        <div class="dialog-template-title">{{title}}<span class="icon-close" (click)="close()">x</span></div>
        <div *ngIf="drugGroup" class="bg-white single-padding max-height700 relative dialog-template-content">
            <form class="gray-underline" (ngSubmit)="searchByDrugName()">
                <label>药品名称：</label>
                <input type="text" [(ngModel)]="searchText" name="searchText">
                <button type="submit" >搜索</button>
            </form>
            <div id="dragDiv"></div>
            <div class="basedrug-tree" style="max-height:650px;">
                <Tree #tree [nodes]="drugGroup" [options]="customTemplateStringOptions" (onDeactivate)="chooseBaseDrug($event)"></Tree>
            </div>
            <span>注：双击选择，已填写的字段将被覆盖哟！</span>
       </div>
    </div>
    <div class="mask" *ngIf="isTemplate"></div>`,
    providers: [
        DrugService
    ]
})
export class BaseDrugComponent implements OnInit {
    title = "知识管理平台";
    drugGroup: any;
    error: any;
    searchText: string;
    treeDetailComponent: any;
    @Input() isTemplate: boolean;

    @Output() chooseDrug: EventEmitter<any> = new EventEmitter();
    @Output() onClose: EventEmitter<any> = new EventEmitter();

    constructor(
        private drugService: DrugService,
        private userService: UserService) {
    }

    /**
     * init: BaseDrugComponent
     */
    ngOnInit() {
        this.getDrugCategory();
        document.addEventListener('beforeunload', function () {
            alert(123);
        });
    }

    getChildren(node: any): any {
        return this.drugService.getChildren(node.data.id);
    }

    customTemplateStringOptions = {
        getChildren: this.getChildren.bind(this),
        idField: 'uuid'
    }

    getDrugCategory() {
        this.drugService.getDrugCategory()
            .then(drugs => {
                this.drugGroup = drugs;
            },
            error => this.error = <any>error);
    }

    searchByDrugName() {
        if (!this.searchText) {
            this.ngOnInit();
            return;
        }
        this.drugService.searchByDrugName(this.searchText)
            .then(drugGroup => this.drugGroup = drugGroup,
            error => this.error = <any>error);
    }

    close() {
        this.onClose.emit(null);
    }

    chooseBaseDrug($event: any) {
        this.chooseDrug.emit($event);
        this.close();
        // drugTreeDetailComponent.getDrugDetail($event.node.data.name);
        // this.dialogModel.isTemplate = false;
    }

}

@Component({
    selector: 'drug-guide-detail',
    template: require('./drug_tree_detail.component.html'),
    styles: [require('./patient_guide.component.css') + ""],
    providers: [
        DrugService,
        GuideListService,
        DictionaryService,
        PatientUseTimeService
    ]
})
export class DrugTreeDetailComponent implements OnInit, OnDestroy {
    DRAG_ROUTE_CODE = 'sys_dictcate_gytj'; //给药途径code
    DICTIONARY_DOSE_UNIT_CODE = 'sys_pre_dose_unit'; //剂量单位code
    MEDICATION_OCCASION_CODE = 'sys_dictcate_shij';//给药时机code
    ROUTE_FREQUENCY_CODE = 'sys_route_freq';//给药频率code
    DIGESTIVE_TRACT = "消化道全身给药";//消化道全身给药code
    selectedTab = 1;
    sub: any;
    misstake = "漏用处理";
    navigated = false;
    params: string;
    status: string = '未审核';
    nodeName: string;
    error: any;
    proDtoList: any[];
    goodsname: string[] = [];
    dictionaryGroup: any[];
    dicOPtionsDose: any[] = [];
    dicOPtionsTime: any[] = [];
    dicOPtionsFreq: any[] = [];
    @ViewChild(DialogPlugin) dialogPlugin: DialogPlugin;
    dialogTemplate = false;
    //freq:FreqItem[];//给药频率数组
    occas: OccaItem[] = [];//给药时机数组

    auditByModel: any; //指定审核人下拉联想框绑定值
    auditPermissionOwnerList: any[]; //有权限审核的人员列表
    searchAuditBy = (text$: Observable<string>) =>
        text$.debounceTime(200).distinctUntilChanged()
            .map(term => term.length < 1 ? []
                : this.auditPermissionOwnerList.filter(v => new RegExp(term, 'gi').test(v.realname)).splice(0, 10));
    searchAuditByFormatter = (x: any) => x['realname'];
    //药品/产品相关指导表单数据变量

    patientDrugGuideDto: any = {
        'id': '',
        'applyType': 1,
        'drugId': '',
        'takeMethod': '',
    };
    des = new Des();
    patientDrugDescriptionDtoList = new Array<PatientDrugDescriptionDtoList>();
    patientDrugEffectDto = new Array<PatientDrugEffectDto>();
    patientDrugInfluenceDto = new Array<PatientDrugInfluenceDto>();
    patientDrugStorageDto = new PatientDrugStorageDto();
    patientDrugUseTime = new Array<FreqItem>();
    guideDetail: GuideDetail = {
        'patientDrugGuideDto': this.patientDrugGuideDto,
        'patientDrugDescriptionDtoList': this.patientDrugDescriptionDtoList,
        'patientDrugEffectDto': this.patientDrugEffectDto,
        'patientDrugInfluenceDto': this.patientDrugInfluenceDto,
        'patientDrugStorageDto': this.patientDrugStorageDto,
        'patientDrugUseTime': this.patientDrugUseTime
    };

    //存放当select为“其他”的时候自定义的string
    containerOtherText: string;
    lightOtherText: string;
    humidityOtherText: string;
    environmentOtherText: string;

    //下拉框中的option 本地数据
    Container: any[] = [
        { value: "" },
        { value: "密闭容器" },
        { value: "铝塑包装" },
        { value: "其他" }
    ];
    Light: any[] = [
        {
            value: "",
            title: ""
        },
        {
            value: "遮光",
            title: "用不透光的容器包装，例如棕色容器或黑色包装材料包装"
        },
        {
            value: "避光",
            title: "避免日光直射"
        },
        {
            value: "其他",
            title: "自定义"
        }
    ];
    Humidity: any[] = [
        { value: "" },
        { value: "干燥" },
        { value: "其他" }
    ];
    Environment: any[] = [
        {
            value: "",
            title: ""
        },
        {
            value: "密封",
            title: "将容器密封，防止风化、吸潮、挥发或异物进入"
        },
        {
            value: "其他",
            title: "自定义"
        }
    ];

    //富文本相关变量
    ueDrugDes: any;
    ueForbiddenUseDrugDes: any;
    ueRecentSituation: any;
    ueUseMethod: any;
    ueMissTakeDeal: any;
    ueAttention: any;
    ueOtherEffect: any;
    ueCenditionChange: any;
    ueChildrenAttention: any;
    ueGetGestationAttention: any;
    ueGestationAttention: any;
    ueAthleteAttention: any;
    ueLactationAttention: any;
    ueOperationAttention: any;
    ueHeredityAttention: any;
    ueOtherAttention: any;
    ueComment: any;

    isDrugDes = false; //false为未加载富文本
    isForbiddenUseDrugDes = false;
    isRecentSituation = false;
    isUseMethod = false;
    isMissTakeDeal = false;
    isAttention = false;
    isOtherEffect = false;
    isCenditionChange = false;
    isChildrenAttention = false;
    isGetGestationAttention = false;
    isGestationAttention = false;
    isAthleteAttention = false;
    isLactationAttention = false;
    isOperationAttention = false;
    isHeredityAttention = false;
    isOtherAttention = false;
    isComment = false;

    isSave = false;//是否点击了保存按钮
    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private guideListService: GuideListService,
        private dictionaryService: DictionaryService,
        private userService: UserService,
        private patientUseTimeService: PatientUseTimeService) {

    }

    /**
     * init: DrugTreeDetailComponent
     */
    ngOnInit() {
        this.getRouteParam();
        this.initText();
        this.getDrugDetail(true);
        this.userService.getAuditPermissionOwnerList("perms[auditDrugGuide:put]").then(rs => {
            this.auditPermissionOwnerList = rs['users'];
        });
    }

    /*************路由守卫*********
     * 功能：关闭守卫以及跳转守卫
     */
    @HostListener('window:beforeunload', ['$event'])
    onBeforeClose($event: any) {
        return false;
        // return this.dialogPlugin.confirm("确认要离开吗？",()=>{},()=>{});
    }

    @HostListener('window:hashchange', ['$event'])
    onhashchange($event: any) {
        // this.dialogPlugin.confirm("确认要离开吗？",()=>{},()=>{});
        return false;
    }

    canDeactivate(): Observable<boolean> | boolean {
        if (this.isSave) {
            return true;
        }
        return this.dialogPlugin.confirmWin("确认放弃保存并离开吗？");
    }
    /************end 路由守卫********* */

    /***************初始化*************
        * 功能：从url获取药品名称
        *      设置des描述表默认值
        *      获取已保存的数据
        * 参数：nodeName：药品名称
        *      params：是否具有审核功能，true：可以审核
       */
    // 从url获取药品名称
    getRouteParam() {
        let indexOfName: number;
        this.sub = this.route.params.subscribe(params => {
            if (params['drug_id'] !== undefined) {
                this.nodeName = decodeURIComponent(params['drug_id']);
                this.params = params['status'];
                this.navigated = true;
            } else {
                this.navigated = false;
            }
        });
        // indexOfName = this.nodeName.indexOf("?");
        // if (indexOfName != -1) {
        //     this.nodeName = this.nodeName.substring(0, indexOfName);
        // }
        this.patientDrugGuideDto.drugId = this.nodeName;
    }

    ngOnDestroy() {
        this.dialogPlugin.confirm("确认要离开吗？", () => { }, () => { });
        this.sub.unsubscribe();
    }

    //设置des描述表默认值
    initText() {
        this.des.recentSituation = "<p>请给您的医生一份您正在服用的所有药品、草药、非处方药或其他保健品的清单。若您吸烟、喝酒也请告诉医生。</p>"
        this.des.otherEffect = "<p>注：如果您发现本药还引起其他副作用，请告诉医生。</p>";
        this.des.cenditionChange = "<p>在您定期复诊时，医生会检查您的用药情况和药效，请按医生要求做好复诊。</p>";
        this.patientDrugStorageDto.comment = "<p>请将所有药物存放在小孩拿不到的地方。切勿让任何人使用您的药品。</p>";
    }

    //副作用列表，根据选择的严重程度设置默认值
    setDefaultEffectLevelText(index: number, level: string) {
        if (level === "较重") {
            this.patientDrugEffectDto[index].solution = "立即停药，并联系医生或去医院就医。";
        }
        if (level === "较轻") {
            this.patientDrugEffectDto[index].solution = "继续观察，若症状持续数日或症状加重，立即停药并联系医生。";
        }

    }

    /****************获取数据**************
     * 功能：获取已经保存过的数据
     *      转换数据格式
    */
    //根据drugId获取详细数据
    getDrugDetail(isInit:boolean, id?: string) {
        let isDrug: boolean;
        if (!id) {
            isDrug = true;
            id = this.nodeName;
        }

        this.guideListService.getDrugDetail(id,isDrug)
            .then(guideDetail => {
                if(isInit && !this.guideListService.isEmptyObject(guideDetail.productDtoList)){
                    let proDtoList = guideDetail.productDtoList;
                    if(proDtoList && proDtoList.length > 0){
                        for(let i = 0; i < proDtoList.length; i++){
                            var flag = false;
                            if(proDtoList[i].goodsname){
                                for(let j = 0; j < this.goodsname.length; j++){
                                    if(proDtoList[i].goodsname == this.goodsname[j]){
                                        flag = true;
                                    }
                                }
                                if(!flag) this.goodsname.push(proDtoList[i].goodsname);
                            }   
                        }
                    }
                }

                if (!this.guideListService.isEmptyObject(guideDetail.patientDrugGuideInfoDto)) {
                    this.saveToTable();//先转换数据格式
                    //当前指导单产品id
                    //let oldId = this.patientDrugGuideDto.drugId;
                    //获取的指导单产品id
                    //let newId = guideDetail.patientDrugGuideInfoDto.patientDrugGuideDto.drugId;

                    //获取的是本指导单信息，id等信息都应该带上
                    if(isInit) {
                        //复制产品指导单基本信息以及审批人信息
                        this.patientDrugGuideDto = guideDetail.patientDrugGuideInfoDto.patientDrugGuideDto;
                        
                        this.auditByModel = { "id": this.patientDrugGuideDto.auditBy, "realname": this.patientDrugGuideDto.auditName };
                                                
                        this.patientDrugInfluenceDto = guideDetail.patientDrugGuideInfoDto.patientDrugInfluenceDtoList;
                        this.patientDrugEffectDto = guideDetail.patientDrugGuideInfoDto.patientDrugEffectDtoList;

                        this.patientDrugDescriptionDtoList = guideDetail.patientDrugGuideInfoDto.patientDrugDescriptionDtoList;
                        this.patientDrugUseTime = guideDetail.patientDrugGuideInfoDto.patientDrugUsetimeDtoList;

                        this.patientDrugStorageDto = guideDetail.patientDrugGuideInfoDto.patientDrugStorageDto ? guideDetail.patientDrugGuideInfoDto.patientDrugStorageDto : {};

                        
                    } else {  //获取的是其他指导单的信息，复制过来的时候需要去掉id
                        //给药途径和剂量单位是本体属性
                        this.patientDrugGuideDto.takeMethod = guideDetail.patientDrugGuideInfoDto.patientDrugGuideDto.takeMethod;
                        this.patientDrugGuideDto.unitCode = guideDetail.patientDrugGuideInfoDto.patientDrugGuideDto.unitCode;

                        this.patientDrugInfluenceDto = this.copyListWithoutId(this.patientDrugInfluenceDto,
                            guideDetail.patientDrugGuideInfoDto.patientDrugInfluenceDtoList, 'drugCategory');

                        this.patientDrugEffectDto = this.copyListWithoutId(this.patientDrugEffectDto,
                            guideDetail.patientDrugGuideInfoDto.patientDrugEffectDtoList, 'level');

                        this.patientDrugDescriptionDtoList = this.copyListWithoutId(this.patientDrugDescriptionDtoList,
                            guideDetail.patientDrugGuideInfoDto.patientDrugDescriptionDtoList, 'property');
                        
                        //给药时间部分全部替换
                        this.patientDrugUseTime = this.copyListWithoutId_useTime(this.patientDrugUseTime, 
                            guideDetail.patientDrugGuideInfoDto.patientDrugUsetimeDtoList)

                        if(guideDetail.patientDrugGuideInfoDto.patientDrugStorageDto != null) {
                            if(this.patientDrugStorageDto.id != null)
                                guideDetail.patientDrugGuideInfoDto.patientDrugStorageDto.id = this.patientDrugStorageDto.id;
                            else
                                guideDetail.patientDrugGuideInfoDto.patientDrugStorageDto.id = "";
                            this.patientDrugStorageDto = guideDetail.patientDrugGuideInfoDto.patientDrugStorageDto;
                        }
                    }
                    
                    if(this.patientDrugStorageDto == null)
                        this.patientDrugStorageDto = new PatientDrugStorageDto;
                    
                    this.getFromTable();
                    this.getNodeByCode(this.patientDrugGuideDto.takeMethod);
                }
                this.dialogTemplate = false;	// 隐藏药品指导单选择列表

                // 重新设置UEditor中的内容
                this.resetUEditorContent();

            },
            error => this.error = error
            );
    }

    getNodeByCode(code: string) {
        if (!code)
            return;
        this.dictionaryService.getNodeByCode(this.DRAG_ROUTE_CODE, code)
            .then(nodedata => {
                this.updateMisstake(nodedata);
            }, error => this.error = <any>error);
    }

    isExist(array: any[], value: any) {
        for (let index = 0; index < array.length; index++) {
            if (array[index] === value) {
                return true;
            }
        }
        return false;
    }

    //从描述表中取出
    getFromDescriptionTable() {
        console.log(this.patientDrugDescriptionDtoList)
        this.des = new Des();
        for (let i = 0; i < this.patientDrugDescriptionDtoList.length; i++) {
            let name = this.patientDrugDescriptionDtoList[i].property;
            this.des[name] = this.patientDrugDescriptionDtoList[i].value;
        }

    }

    getFromUseTimeTable() {
        this.occas = [];
        for (let index = 0; index < this.patientDrugUseTime.length; index++) {
            if (!this.patientDrugUseTime[index].takeTimes) {
                //如果只保存了给药时机,未保存给药频率
                let newOcca = new OccaItem();
                newOcca.takeTiming = this.patientDrugUseTime[index].takeTiming;
                newOcca.id = this.patientDrugUseTime[index].id;
                this.occas.push(newOcca);
            } else {
                let hasTakeTiming = false;//判断occas里面是否有此给药时机，有的话往将给药频率放入此给药时机中
                occaLoop:
                for (let i = 0; i < this.occas.length; i++) {
                    if (this.occas[i].takeTiming === this.patientDrugUseTime[index].takeTiming) {
                        let newTTime = new FreqItem();
                        newTTime = this.patientDrugUseTime[index];
                        this.occas[i].freqs.push(newTTime);
                        hasTakeTiming = true;
                        break occaLoop;
                    }
                }
                if (!hasTakeTiming) {
                    let newOcca = new OccaItem();
                    let newTTime = new FreqItem();
                    newOcca.takeTiming = this.patientDrugUseTime[index].takeTiming;
                    newTTime = this.patientDrugUseTime[index];
                    newOcca.freqs.push(newTTime);
                    this.occas.push(newOcca);
                }
            }
        }
    }

    //获取时做的所有的数据转换
    getFromTable() {
        this.getFromDescriptionTable();
        this.getFromStorageTable();
        this.getFromUseTimeTable();
    }

    /****************end 获取数据**************/
    /****************end 初始化**************/

    /*******************保存****************
     * 功能：保存/修改列表
     *      保存/修改时所做的数据变化
     *      保存成功后进行页面跳转
    */
    //保存时做的所有的数据转换
    saveToTable() {
        this.setTime();//绑定type=“time”的input框数据
        if (this.hasEmptyString()) {
            return false;
        }
        this.saveToDescriptionTable();//描述表的数据转换
        this.saveToStorageTable();//储藏方法表的数据替换
        this.addTakeTiming();
        return true;
    }

    saveDrugInfo() {
        if (!this.saveToTable()) {
            return;
        }
        this.guideDetail.patientDrugGuideDto = this.patientDrugGuideDto;
        this.guideDetail.patientDrugDescriptionDtoList = this.patientDrugDescriptionDtoList;
        this.guideDetail.patientDrugEffectDto = this.patientDrugEffectDto;
        this.guideDetail.patientDrugInfluenceDto = this.patientDrugInfluenceDto;
        this.guideDetail.patientDrugStorageDto = this.patientDrugStorageDto;
        this.guideDetail.patientDrugUseTime = this.patientDrugUseTime;
        this.guideListService.saveGuideList(this.guideDetail)
            .then(guideDetail => {
                this.dialogPlugin.tip(guideDetail.message);
                if (guideDetail.code == 200) {
                    this.getDrugDetail(true);
                    this.goToTab(this.selectedTab);
                    this.turnToDrugGuidePage();
                }
                // this.turnToDrugGuidePage()
            },
            error => this.error = error
            );
    }

    updateDrugInfo() {
        if (!this.saveToTable()) {
            return;
        }
        this.guideDetail.patientDrugGuideDto = this.patientDrugGuideDto;
        this.guideDetail.patientDrugDescriptionDtoList = this.patientDrugDescriptionDtoList;
        this.guideDetail.patientDrugEffectDto = this.patientDrugEffectDto;
        this.guideDetail.patientDrugInfluenceDto = this.patientDrugInfluenceDto;
        this.guideDetail.patientDrugStorageDto = this.patientDrugStorageDto;
        this.guideDetail.patientDrugUseTime = this.patientDrugUseTime;
        let status = this.patientDrugGuideDto.status;
        this.patientDrugGuideDto.status = "未审核";
        this.guideListService.updateGuideList(this.guideDetail)
            .then(rs => {
                //修复bug: admin既不是添加人，也不是指定审核人，它审核时，页面报错的问题
                if ( !rs.data ) {
                    this.dialogPlugin.tip(rs.message);
                    return;
                }

                if (status == "已审核") {
                    let id = rs.data["patientGuideId"];
                    this.guideListService.auditDrugGuide(id).then(r => {
                        this.dialogPlugin.tip(r.message);
                        this.turnToDrugGuidePage();
                    },
                    error => { 
                        this.dialogPlugin.tip("无权进行此操作"); 
                    });
                } else {
                    this.dialogPlugin.tip(rs.message);
                    if (rs.code == 200) {
                        this.getDrugDetail(true);
                        this.goToTab(this.selectedTab);
                        this.turnToDrugGuidePage();
                    }
                    // this.turnToDrugGuidePage();
                }
            },
            error => {
                console.log("审核保存出错:");
                console.dir(error);

                this.error = error;
            });
    }

    //将表放入描述表中
    saveToDescriptionTable() {
        let i = 0;
        this.getContent();//获取文本框内容
        if (this.des != null) {
            for (var name in this.des) {
                let isExist = false;
                for (let index = 0; index < this.patientDrugDescriptionDtoList.length; index++) {
                    if (name === this.patientDrugDescriptionDtoList[index].property) {
                        this.patientDrugDescriptionDtoList[index].property = name;
                        this.patientDrugDescriptionDtoList[index].value = this.des[name];
                        isExist = true;
                    }

                }
                if (!isExist) {
                    let tempdic = new PatientDrugDescriptionDtoList();
                    tempdic.property = name;
                    tempdic.value = this.des[name];
                    this.patientDrugDescriptionDtoList.push(tempdic);
                }
            }
        }
    }


    //将数据放入储藏方法表
    saveToStorageTable() {
        if (this.containerOtherText != '其他') {
            this.patientDrugStorageDto.container = this.containerOtherText;
        }
        if (this.lightOtherText != '其他') {
            this.patientDrugStorageDto.light = this.lightOtherText;
        }
        if (this.humidityOtherText != '其他') {
            this.patientDrugStorageDto.humidity = this.humidityOtherText;
        }
        if (this.environmentOtherText != '其他') {
            this.patientDrugStorageDto.environment = this.environmentOtherText;
        }
    }

    //为每个freqItem添加给药时机
    addTakeTiming() {
        this.patientDrugUseTime = [];
        for (let i = 0; i < this.occas.length; i++) {
            if (this.occas[i].freqs.length == 0) {
                let tempFreq = new FreqItem();
                tempFreq.takeTiming = this.occas[i].takeTiming;
                tempFreq.id = this.occas[i].id;
                this.patientDrugUseTime.push(tempFreq);
            }
            for (let j = 0; j < this.occas[i].freqs.length; j++) {
                if (!this.occas[i].freqs[j].id) {
                    this.occas[i].freqs[j].takeTiming = this.occas[i].takeTiming;
                }
                this.patientDrugUseTime.push(this.occas[i].freqs[j]);
            }
        }
    }

    /***保存完后进行跳转 */
    turnToDrugGuidePage() {
        // let link = ['data_management/patient_guide/drug_guide'];
        // this.router.navigate(link);
        setTimeout(() => {
            window.history.back();
        }, 1000)
    }

    //判断获取的值是否在列表中，不在则设为其他
    isOther(otherText: string, list: any[], text: string) {
        otherText = "其他";
        if (!text) {
            otherText = "";
            return otherText;
        }
        for (let i = 0; i < list.length; i++) {
            if (list[i].value == text) {
                otherText = text;
                break;
            }
        }
        return otherText;
    }

    //为select赋值
    getFromStorageTable() {
        this.containerOtherText = this.isOther(this.containerOtherText, this.Container, this.patientDrugStorageDto.container);
        this.lightOtherText = this.isOther(this.lightOtherText, this.Light, this.patientDrugStorageDto.light);
        this.humidityOtherText = this.isOther(this.humidityOtherText, this.Humidity, this.patientDrugStorageDto.humidity);
        this.environmentOtherText = this.isOther(this.environmentOtherText, this.Environment, this.patientDrugStorageDto.environment);

    }

    onSubmit() {
        console.log(this.patientDrugGuideDto)
        this.isSave = true;
        if (this.matchEditedUser(this.auditByModel)) {
            //this.patientDrugGuideDto.auditBy = this.auditByModel.id;
            if (this.patientDrugGuideDto.id == '' || !this.patientDrugGuideDto.id) {
                this.saveDrugInfo();
            } else {
                this.patientDrugGuideDto.status = "未审核";
                this.updateDrugInfo();
            }
        } else {
            this.dialogPlugin.tip("您输入的人不在审核人列表中");
        }
    }

    /**
     * 审核保存药品指导单
     */
    auditSubmit() {
        //审核保存前,做必要的权限检查
        let currentUserName: string = this.userService.user.realname;
        //console.log("currentUser name:" + currentUserName);

        if ( !this.checkUserAuditPrivilege( currentUserName ) ) {
            this.dialogPlugin.tip("当前无审核权限，无法进行审核保存操作!");
            return;
        }

        this.isSave = true;
        if (this.matchEditedUser(this.auditByModel)) {
            //this.patientDrugGuideDto.auditBy = this.auditByModel.id;
            this.patientDrugGuideDto.status = "已审核";
            this.updateDrugInfo();
        } else {
            this.dialogPlugin.tip("您输入的人不在审核人列表中");
        }
    }

    /**
     * 检查用户是否具有审核权限，否则无法进行审核保存
     */
    private checkUserAuditPrivilege(username: string): boolean {
        if ( !this.matchEditedUser(username) ) {
            return false;
        }
        return true;
    }

    //匹配输入姓名是否在审核人列表中
    matchEditedUser(auditByModel: any) {
        if (auditByModel == null)
            return true;
        if (typeof (auditByModel) != "string") {
            this.patientDrugGuideDto.auditBy = this.auditByModel.id;
            return true;
        };

        for (let i = 0; i < this.auditPermissionOwnerList.length; i++) {
            //console.log(this.auditPermissionOwnerList[i].realname);
            if (auditByModel == this.auditPermissionOwnerList[i].realname) {
                this.patientDrugGuideDto.auditBy = this.auditPermissionOwnerList[i].id;
                return true;
            }
        }
        return false;
    }


    /*******************end 保存****************/

    /**********前台预设**********
     * 功能：获取数据字典树
     *      获取剂量单位列表
     */
    //返回数据字典树
    getDicTree() {
        this.dictionaryService.getChildrenByCode(this.DRAG_ROUTE_CODE)
            .then(dictionaries => {
                if (!this.dictionaryService.isEmptyObject(dictionaries))
                    this.dictionaryGroup = dictionaries;
                else this.dictionaryGroup = [];
            },
            error => this.error = <any>error);
    }

    //返回剂量单位列表
    getDicOptionsDose() {
        if (this.dicOPtionsDose.length !== 0) {
            return;
        }
        this.dictionaryService.getChildrenByCode(this.DICTIONARY_DOSE_UNIT_CODE)
            .then(dicOPtionsDose => {
                this.dicOPtionsDose = dicOPtionsDose;
            },
            error => this.error = <any>error);
    }

    customTemplateStringOptions = {
        getChildren: this.getChildren.bind(this)
    }

    getChildren(node: any): any {
        return this.dictionaryService.getChildrenByNode(node.data);
    }

    //点击切换给药途径事件
    updateTakeMethod($event: any) {
        this.patientDrugGuideDto.takeMethod = $event.node.data.code;
        this.updateMisstake($event.node.data);
    }

    updateMisstake(node: any) {
        if (this.dictionaryService.isChildren(node, this.DIGESTIVE_TRACT)) {
            this.misstake = "漏服处理";
        } else {
            this.misstake = "漏用处理";
        }
    }

    /**********end 前台预设**********/

    /***********指导信息 列表信息 ******
     * 功能：（哪些药物影响本药）表、（副作用）表
     */
    //点击添加事件（哪些药物影响本药）
    addPatientDrugInfluence() {
        let tempDrugInfluence = new PatientDrugInfluenceDto();
        this.patientDrugInfluenceDto.push(tempDrugInfluence);
    }

    //点击添加事件（副作用）
    addPatientDrugEffectDto() {
        let tempDrugEffectDto = new PatientDrugEffectDto();
        this.patientDrugEffectDto.push(tempDrugEffectDto);
    }

    //从表中删除
    deleteFromTable(type: string, table: any[], index: number, occa?: OccaItem) {
        if (table[index].id) {
            this.guideListService.deleteFromForm(type, table[index].id)
                .then(result => {
                    this.dialogPlugin.tip("删除成功");
                    // if (occa) {
                    //     // this.initDicFreqOptions(occa);
                    // }
                },
                error => this.error = error);
        }
        table.splice(index, 1);
    }
    /************end 指导信息 列表信息 */

    /*********给药时间设置**********
     * 功能：可以添加多次给药时机
     *      可以添加多次给药频率
     *      点击给药时机和给药频率，显示具体的解释
     *      点击给药频率，出现对应数量的输入框
     *      已经设置过的给药时机和给药频率不能再设置
     * 
    */

    //获取给药时机列表
    getDicOptionsTime() {
        this.dictionaryService.getChildrenByCode(this.MEDICATION_OCCASION_CODE)
            .then(dicOPtionsTime => {
                this.dicOPtionsTime = dicOPtionsTime;
                // this.initDicTimeOptions(); //初始化给药时机列表，已经设置过的给药时机不能再设置
            },
            error => this.error = <any>error);
    }

    //获取给药频率表
    getDicOptionsFreq(occa?: OccaItem) {
        this.dictionaryService.getChildrenByCode(this.ROUTE_FREQUENCY_CODE)
            .then(dicOPtionsFreq => {
                this.dicOPtionsFreq = dicOPtionsFreq;
                for (let i = 0; i < this.occas.length; i++) {
                    this.occas[i].options = dicOPtionsFreq;
                    // this.initDicFreqOptions(this.occas[i]);
                }
                if (occa) {
                    occa.options = dicOPtionsFreq;
                    // this.initDicFreqOptions(occa);
                }
            },
            error => this.error = <any>error);
    }

    //已经设置过的给药时机设置为不可选
    // initDicTimeOptions() {
    //     for (let i = 0; i < this.dicOPtionsTime.length; i++) {
    //         this.dicOPtionsTime[i].isDisabled = false;
    //         freqLoop:
    //         for (let j = 0; j < this.occas.length; j++) {
    //             if (this.occas[j].takeTiming === this.dicOPtionsTime[i].code) {
    //                 this.dicOPtionsTime[i].isDisabled = true;
    //                 break freqLoop;
    //             }
    //         }
    //     }
    // }

    //已经设置过的给药时机设置为不可选
    // initDicFreqOptions(occa: OccaItem) {
    //     for (let i = 0; i < occa.options.length; i++) {
    //         occa.options[i].isDisabled = false;
    //         freqLoop:
    //         for (let j = 0; j < occa.freqs.length; j++) {
    //             if (occa.freqs[j].takeTimes === occa.options[i].code) {
    //                 occa.options[i].isDisabled = true;
    //                 break freqLoop;
    //             }
    //         }
    //     }
    // }

    //点击添加给药时机
    addOccasion() {
        let occaItem = new OccaItem();
        this.getDicOptionsFreq(occaItem);
        this.occas.push(occaItem);
    }

    //点击给药时机，更新所有的给药频率对应的字段
    setCodeShij(occa: OccaItem) {
        for (let i = 0; i < occa.freqs.length; i++) {
            this.getPatientUseTimeByFreq(occa, occa.freqs[i]);
        }
    }

    //根据（给药时机，给药频率）获取文本信息
    getPatientUseTimeByFreq(occa: OccaItem, freq: FreqItem) {
        if ((!occa.takeTiming) || (!freq.takeTimes)) {
            return;
        }
        this.patientUseTimeService.getPatientUseTimeByFreq(occa.takeTiming, freq.takeTimes)
            .then(takeTimes => {
                if (!this.patientUseTimeService.isEmptyObject(takeTimes)) {
                    freq.takeFrequencyArr = takeTimes.explainTextArr;
                }
            },
            error => this.error = <any>error);
    }

    //点击添加给药频率
    addFrequency(i: number) {
        let freqItem = new FreqItem();
        freqItem.type = 'text';
        this.occas[i].freqs.push(freqItem);
        this.setCodeShij(this.occas[i]);
    }

    //修改input框的type，并且获取通用时间中的默认值
    setTakeTimes(occaItem: OccaItem, freqItem: FreqItem) {
        this.setDefaultInput(occaItem, freqItem);
        this.getPatientUseTimeByFreq(occaItem, freqItem);
        // this.initDicFreqOptions(occaItem);
    }

    //根据给药频率判断，如果频率在1-4之间，则显示相对应数量的input框（type=time）
    setDefaultInput(occa: OccaItem, freq: FreqItem) {
        if (!freq.takeTimes) {
            return;
        }
        freq.takeFrequencyArr = [];
        let time = parseInt(freq.takeTimes.substring(0, 1));//传入“1次/天”，time=1
        if (time <= 4 && time >= 1) {
            for (let i = 0; i < time; i++) {
                freq.takeFrequencyArr.push("");
            }
            freq.type = "time";
        }
        else {
            freq.type = "text";
        }
        // this.initDicFreqOptions(occa); //设置选择过的option不能再选择
    }

    //保存time，从input获取
    setTime() {
        for (let oci = 0; oci < this.occas.length; oci++) {
            for (let fei = 0; fei < this.occas[oci].freqs.length; fei++) {
                freqLoop:
                for (let exi = 0; exi < this.occas[oci].freqs[fei].takeFrequencyArr.length; exi++) {
                    if (this.occas[oci].freqs[fei].type === "text") {
                        break freqLoop;
                    }
                    let inputValue = (<HTMLInputElement>document.getElementById("input" + oci + fei + exi)).value;
                    this.occas[oci].freqs[fei].takeFrequencyArr[exi] = inputValue;
                }
            }
        }
    }

    //将freqItem分配到occas中,由于修改成一次性展开，此方法失效
    // getFrequency(occa: OccaItem) {
    //     for (let i = 0; i < this.patientDrugUseTime.length; i++) {
    //         if (this.patientDrugUseTime[i].takeTiming == occa.takeTiming) {
    //             occa.freqs.push(this.patientDrugUseTime[i]);
    //         }
    //     }
    // }

    //选择给药时机之后做的设置
    setOccaItemInfo(occa: OccaItem) {
        // this.initDicTimeOptions();
        this.setCodeShij(occa);
    }

    //false:未保存过给药时机，true：保存过
    hasSavedUseTime(occa: OccaItem): boolean {
        if (!this.patientDrugGuideDto.id) {
            return false;
        }
        if (!occa.id) {
            for (let index = 0; index < occa.freqs.length; index++) {
                if (occa.freqs[index].id) {
                    //保存过给药频率
                    return true;
                }
            }
        } else {
            //只保存了给药时机
            return true;
        }
        return false;
    }

    //删除给药时机
    deleteUseTimeByGuideId(occa: OccaItem, index: number) {
        if (this.hasSavedUseTime(occa)) {
            this.patientUseTimeService.deleteUseTimeByGuideId(this.patientDrugGuideDto.id, occa.takeTiming)
                .then(result => {
                    if (result == "成功") {
                        this.dialogPlugin.tip("删除成功");
                        this.occas.splice(index, 1);
                    }
                    else {
                        this.dialogPlugin.tip("删除失败");
                    }
                },
                error => this.error = <any>error);
        } else {
            this.occas.splice(index, 1);
        }
    }

    checkDisabled(occa: OccaItem, code: string) {
        for (let j = 0; j < occa.freqs.length; j++) {
            if (occa.freqs[j].takeTimes === code) {
                return true;
            }
        }
        return false;
    }

    checkDicDisabled(code: string) {
        for (let index = 0; index < this.occas.length; index++) {
            if (this.occas[index].takeTiming == code) {
                return true;
            }
        }
        return false;
    }
    /**********end 给药时机********* */

    /**
     * 获取指导单后，初始化指定的UEditor的内容
     */
    resetUEditorContent() {
        let ueditorName: string;        //ueEditor的变量名
        let content: string;            //ueEditor中需要赋值的内容
        let ueEditorNameArr: string[] = [
            "ueDrugDes",
            "ueForbiddenUseDrugDes",
            "ueRecentSituation",
            "ueUseMethod",
            "ueMissTakeDeal",
            "ueAttention",
            "ueOtherEffect",
            "ueCenditionChange",
            "ueChildrenAttention",
            "ueGetGestationAttention",
            "ueGestationAttention",
            "ueAthleteAttention",
            "ueLactationAttention",
            "ueOperationAttention",
            "ueHeredityAttention",
            "ueOtherAttention",
            "ueComment"
        ];
        
        // 遍历所有UEditor，设置其值
        for (let i = 0, size = ueEditorNameArr.length; i < size; i++) {
            ueditorName = ueEditorNameArr[i];   //形如：ueDrugDes

            if ( !this[ueditorName] ) {
                // 如果 uEditor 还没有渲染，就直接跳过赋值
                continue;
            }
            
            //准备设置编辑器内容
            if ( ueditorName == "ueComment") {
                content =  this.patientDrugStorageDto.comment;
            } else {
                let lowerCase = ueditorName[2].toLowerCase();
                let dataName = lowerCase + ueditorName.substring(3, ueditorName.length);  //形如：drugDes， useMethod
                content = this.des[dataName];
            }

            //console.log("setting UEditor content: ueditorName=" + ueditorName + ", content:" + content);
            this[ueditorName].setContent(content);
        }
    }

    /*************富文本****************
    * 功能：点击获取富文本
    *      设置富文本内容
    *      获取符文本内容
    */
    //获取富文本
    getEditor(id: string) {
        let editorName = this.getEditorName(id);
        this[editorName] = new UE.ui.Editor({initialFrameWidth: 100 + '%'});
        this[editorName].render(id);
        this.setContents(editorName);
    }

    //id='ue-editor' 转换成 ueEditor
    /** 
     * 将类id='ue-drug-des' 转换成 ueEditor's id: ueDrugDes
     */
    getEditorName(id: string) {
        while (id.indexOf("-") !== -1) {
            let index = id.indexOf("-");
            let upperCase = id[index + 1].toUpperCase();
            id = id.substring(0, index) + upperCase + id.substring(index + 2, id.length);
        }
        return id;
    }

    //获取富文本内容
    getContent() {
        if (this.ueDrugDes) {
            this.des.drugDes = this.ueDrugDes.getContent();
        }
        if (this.ueForbiddenUseDrugDes) {
            this.des.forbiddenUseDrugDes = this.ueForbiddenUseDrugDes.getContent();
        }
        if (this.ueRecentSituation) {
            this.des.recentSituation = this.ueRecentSituation.getContent();
        }
        if (this.ueUseMethod) {
            this.des.useMethod = this.ueUseMethod.getContent();
        }
        if (this.ueMissTakeDeal) {
            this.des.missTakeDeal = this.ueMissTakeDeal.getContent();
        }
        if (this.ueAttention) {
            this.des.attention = this.ueAttention.getContent();
        }
        if (this.ueOtherEffect) {
            this.des.otherEffect = this.ueOtherEffect.getContent();
        }
        if (this.ueCenditionChange) {
            this.des.cenditionChange = this.ueCenditionChange.getContent();
        }
        if (this.ueChildrenAttention) {
            this.des.childrenAttention = this.ueChildrenAttention.getContent();
        }
        if (this.ueGetGestationAttention) {
            this.des.getGestationAttention = this.ueGetGestationAttention.getContent();
        }
        if (this.ueGestationAttention) {
            this.des.gestationAttention = this.ueGestationAttention.getContent();
        }
        if (this.ueAthleteAttention) {
            this.des.athleteAttention = this.ueAthleteAttention.getContent();
        }
        if (this.ueLactationAttention) {
            this.des.lactationAttention = this.ueLactationAttention.getContent();
        }
        if (this.ueOperationAttention) {
            this.des.operationAttention = this.ueOperationAttention.getContent();
        }
        if (this.ueHeredityAttention) {
            this.des.heredityAttention = this.ueHeredityAttention.getContent();
        }
        if (this.ueOtherAttention) {
            this.des.otherAttention = this.ueOtherAttention.getContent();
        }
        if (this.ueComment) {
            this.patientDrugStorageDto.comment = this.ueComment.getContent();
        }
    }

    //显示文本框内容
    setContents(editorName: string) {
        if (editorName == "ueComment") {
            this.setContent("ueComment", this.patientDrugStorageDto.comment);
        }
        else {
            let lowerCase = editorName[2].toLowerCase();
            let dataName = lowerCase + editorName.substring(3, editorName.length);
            this.setContent(editorName, this.des[dataName]);
        }

    }

    //显示单个文本框内容并获取焦点
    setContent(editorName: string, content: string) {
        let isEditor: string;
        this[editorName].addListener("ready", () => {
            if (content) {
                this[editorName].setContent(content);
            }
            this[editorName].focus();
        });
        isEditor = this.getEditorStatus(editorName);
        this[isEditor] = true;//将富文本设置为可见
    }

    //editorName="ueEditor" 转换成 isEditor
    getEditorStatus(editorName: string) {
        return editorName.replace(/ue/, "is");
    }

    getText() {
        //当你点击按钮时编辑区域已经失去了焦点，如果直接用getText将不会得到内容，所以要在选回来，然后取得内容
        // 
        // this.ue.addListener("select",function(){
        //     alert(123);
        //     let range = UE.getEditor('editor').selection.getRange();
        //     ​range.select();
        //     let txt = UE.getEditor('editor').selection.getText();
        // })
        alert(123);

    }
    /***********end 富文本 *********/

    onCancel() {
        this.dialogPlugin.confirm("确认要放弃保存并退出吗？", () => {
            this.isSave = true;
            this.turnToDrugGuidePage();
        }, () => { });
    }

    //点击按钮切换tab
    goToTab(tab: number) {
        this.selectedTab = tab;
        if (tab == 2) {
            this.getDicTree();
            this.getDicOptionsDose();
        }
        if (tab == 3) {
            this.getDicOptionsTime();
            this.getDicOptionsFreq();
        }
    }

    hasEmptyString(): boolean {
        for (let oci = 0; oci < this.occas.length; oci++) {
            if ((this.occas[oci].takeTiming === '') || (!this.occas[oci].takeTiming)) {
                this.dialogPlugin.tip("给药时间存在空字符串，保存失败");
                return true;
            }
            for (let fei = 0; fei < this.occas[oci].freqs.length; fei++) {
                if ((this.occas[oci].freqs[fei].takeTimes === '') || (!this.occas[oci].freqs[fei].takeTimes)) {
                    this.dialogPlugin.tip("给药时间存在空字符串，保存失败");
                    return true;
                }
                for (let exi = 0; exi < this.occas[oci].freqs[fei].takeFrequencyArr.length; exi++) {
                    if ((this.occas[oci].freqs[fei].takeFrequencyArr[exi] === "")) {
                        this.dialogPlugin.tip("给药时间存在空字符串，保存失败");
                        return true;
                    }
                }
            }
        }
        return false;
    }

    /*************获取药品分类****************
    * 功能：点击跳出弹出框，选择获取基础药品分类
    */
    //点击跳出弹出框
    chooseBaseDrugDialog() {
        this.dialogTemplate = true;
    }

    chooseDrug($event: any) {
        this.getDrugDetail(false, $event.node.data.name);
    }

    onClose() {
        this.dialogTemplate = false;
    }
    /*************end 获取药品分类****************/

    /**
     * “获取已有指导单”页面的行双击事件
     */
    onDblActivate($event: any) {
        //console.log("“获取已有指导单”页面的行双击事件激活："); console.dir($event);
        if(!$event) return;
        this.getDrugDetail(false, $event.id);
    }

    // thisDto 当前指导单对象
    // getDto 请求到的指导单对象
    // 将请求到的指导单对象信息复制给当前知道单，保留当前知道单的id值
    copyListWithoutId(thisDto: any, getDto: any, keywords: string): any {
        if(getDto == null)
            return thisDto;
        for (let i = 0; i < getDto.length; i++) {
            getDto[i].id = "";
            for (let j = 0; j < thisDto.length; j++) {
                if (thisDto[j][keywords] == getDto[i][keywords]) {
                    getDto[i].id = thisDto[j].id;
                }
            }
        }
        thisDto = getDto;
        return getDto
    }

    copyListWithoutId_useTime(thisDto: any, getDto: any){
        if(getDto == null)
            return thisDto;

        for(let i = 0; i < getDto.length; i++){
            getDto[i].id = "";
        }
        return getDto;
    }
}