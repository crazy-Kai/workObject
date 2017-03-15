/**
 * 产品详情页
 * 
 * @author anwen
 * 
*/
// 添加产品detail

import { Host, Component, Inject, OnInit, OnDestroy, Input, ViewChild, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { ProductService } from './product_list.service';
import { ActivatedRoute } from '@angular/router';


import { GuideListService } from './guide_list.service';
import { DictionaryService } from './dictionary.service';
import { PatientUseTimeService } from './general_timeset.service';
//引入药品/产品相关指导数据结构
import { PatientProductGuideDto } from './guide_detail';
import { PatientDrugDescriptionDtoList } from './guide_detail';
import { Des } from './guide_detail';
import { PatientDrugEffectDto } from './guide_detail';
import { PatientDrugInfluenceDto } from './guide_detail';
import { PatientDrugStorageDto } from './guide_detail';
import { FreqItem } from './guide_detail';
import { GuideDetail } from './guide_detail';
import { OccaItem } from './guide_detail'
//引入插件
import { DialogPlugin } from '../../common/ug-dialog/dialog.plugin';
import { Observable } from 'rxjs/Observable';
import { UserService } from '../../user.service';

declare var UE: any;

@Component({
    selector: 'drug-guide',
    template: require('./product_list_detail.component.html'),
    styles: [require('./patient_guide.component.css') + ""],
    providers: [
        ProductService,
        GuideListService,
        DictionaryService,
        PatientUseTimeService
    ]
})
export class ProductListDetailComponent implements OnInit, OnDestroy {
    DRAG_ROUTE_CODE = 'sys_dictcate_gytj'; //给药途径code
    DICTIONARY_DOSE_UNIT_CODE = 'sys_pre_dose_unit'; //剂量单位code
    MEDICATION_OCCASION_CODE = 'sys_dictcate_shij';//给药时机code
    ROUTE_FREQUENCY_CODE = 'sys_route_freq';//给药频率code
    DIGESTIVE_TRACT = "消化道全身给药";//消化道全身给药code
    misstake = "漏用处理";
    selectedTab = 1;
    sub: any;
    navigated = false;
    error: any;
    status: string = '未审核';
    nodename: string;
    productId: any;
    params: string;
    dictionaryGroup: any[];
    dicOPtionsDose: any[];
    dicOPtionsTime: any[];
    dicOPtionsFreq: any[];
    goodsname: string;
    @ViewChild(DialogPlugin) dialogPlugin: DialogPlugin;
    occas: OccaItem[] = [];//给药时机数组
    isAddProductDialog: boolean = false;

    //药品/产品相关指导表单数据变量

    patientProductGuideDto: any = {
        'id': '',
        'applyType': 2,
        'productId': '',
        'takeMethod': ''
    };
    des = new Des();
    patientProductDescriptionDtoList = new Array<PatientDrugDescriptionDtoList>();
    patientProductEffectDto = new Array<PatientDrugEffectDto>();
    patientProductInfluenceDto = new Array<PatientDrugInfluenceDto>();
    patientProductStorageDto = new PatientDrugStorageDto;
    patientProductUseTime: FreqItem[] = [];
    guideDetail: GuideDetail = {
        'patientDrugGuideDto': this.patientProductGuideDto,
        'patientDrugDescriptionDtoList': this.patientProductDescriptionDtoList,
        'patientDrugEffectDto': this.patientProductEffectDto,
        'patientDrugInfluenceDto': this.patientProductInfluenceDto,
        'patientDrugStorageDto': this.patientProductStorageDto,
        'patientDrugUseTime': this.patientProductUseTime
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

    auditByModel: any; //指定审核人下拉联想框绑定值
    auditPermissionOwnerList: any[]; //有权限审核的人员列表
    searchAuditBy = (text$: Observable<string>) =>
        text$.debounceTime(200).distinctUntilChanged().map( term => 
            term.length < 1 ? [] : this.auditPermissionOwnerList.filter( v => 
                new RegExp(term, 'gi').test(v.realname)
            ).splice(0, 10)
        );
    searchAuditByFormatter = (x: any) => x['realname'];

    isSave = false;//是否点击了保存按钮
    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private guideListService: GuideListService,
        private dictionaryService: DictionaryService,
        private patientUseTimeService: PatientUseTimeService,
        private userService: UserService) {
    }

    ngOnInit() {
        this.getRouteParam();
        this.initText();
        this.getProductDetail(this.patientProductGuideDto.productId, true, true);
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
        this.sub = this.route.params.subscribe(params => {
            if ((params['drug_id'] !== undefined) && (params['drug_name'] !== undefined)) {
                this.patientProductGuideDto.productId = params['drug_id'];
                this.nodename = decodeURIComponent(params['drug_name']);
                this.params = params['status'];
                this.navigated = true;
            } else {
                this.navigated = false;
            }
        });
    }

    ngOnDestroy() {
        this.sub.unsubscribe();
    }

    initText() {
        this.des.recentSituation = "<p>请给您的医生一份您正在服用的所有药品、草药、非处方药或其他保健品的清单。若您吸烟、喝酒也请告诉医生。</p>"
        this.des.otherEffect = "<p>注：如果您发现本药还引起其他副作用，请告诉医生。</p>";
        this.des.cenditionChange = "<p>在您定期复诊时，医生会检查您的用药情况和药效，请按医生要求做好复诊</p>";
        this.patientProductStorageDto.comment = "<p>请将所有药物存放在小孩拿不到的地方。切勿让任何人使用您的药品。</p>";
    }

    //副作用列表，根据选择的严重程度设置默认值
    setDefaultEffectLevelText(index: number, level: string) {
        if (level === "较重") {
            this.patientProductEffectDto[index].solution = "立即停药，并联系医生或去医院就医。";
        }
        if (level === "较轻") {
            this.patientProductEffectDto[index].solution = "继续观察，若症状持续数日或症状加重，立即停药并联系医生。";
        }

    }

    /****************获取数据**************
    * 功能：获取已经保存过的数据
    *      转换数据格式
   */
    //根据productId获取详细数据
    getProductDetail(productId: any, isInit: boolean, isProduct?: boolean) {
        this.guideListService.getProductDetail(productId, isProduct)
            .then(guideDetail => {

                if(isInit && !this.guideListService.isEmptyObject(guideDetail.productDto)){
                    this.goodsname = guideDetail.productDto.goodsname;
                }

                if (!this.guideListService.isEmptyObject(guideDetail.patientDrugGuideInfoDto)) {
                    this.saveToTable();//先转换数据格式
                    //当前指导单产品id
                    //let oldId = this.patientProductGuideDto.productId;
                    //获取的指导单产品id
                    //let newId = guideDetail.patientDrugGuideInfoDto.patientDrugGuideDto.productId;
                    
                    //获取的是本指导单信息，id等信息都应该带上
                    if(isInit) {
                        //复制产品指导单基本信息以及审批人信息
                        this.patientProductGuideDto = guideDetail.patientDrugGuideInfoDto.patientDrugGuideDto;
                        this.auditByModel = { "id": this.patientProductGuideDto.auditBy, "realname": this.patientProductGuideDto.auditName };
                        
                        this.patientProductInfluenceDto = guideDetail.patientDrugGuideInfoDto.patientDrugInfluenceDtoList;
                        this.patientProductEffectDto = guideDetail.patientDrugGuideInfoDto.patientDrugEffectDtoList;

                        this.patientProductDescriptionDtoList = guideDetail.patientDrugGuideInfoDto.patientDrugDescriptionDtoList;
                        this.patientProductUseTime = guideDetail.patientDrugGuideInfoDto.patientDrugUsetimeDtoList;

                        this.patientProductStorageDto = guideDetail.patientDrugGuideInfoDto.patientDrugStorageDto;
                    } else {  //获取的是其他指导单的信息，复制过来的时候需要去掉id
                        //不复制产品指导单基本信息以及审批人信息
                        //给药途径和剂量单位是本体属性
                        this.patientProductGuideDto.takeMethod = guideDetail.patientDrugGuideInfoDto.patientDrugGuideDto.takeMethod;
                        this.patientProductGuideDto.unitCode = guideDetail.patientDrugGuideInfoDto.patientDrugGuideDto.unitCode;

                        this.patientProductInfluenceDto = this.copyListWithoutId(this.patientProductInfluenceDto,
                            guideDetail.patientDrugGuideInfoDto.patientDrugInfluenceDtoList, 'drugCategory');

                        this.patientProductEffectDto = this.copyListWithoutId(this.patientProductEffectDto,
                            guideDetail.patientDrugGuideInfoDto.patientDrugEffectDtoList, 'level');

                        this.patientProductDescriptionDtoList = this.copyListWithoutId(this.patientProductDescriptionDtoList,
                            guideDetail.patientDrugGuideInfoDto.patientDrugDescriptionDtoList, 'property');

                        //给药时间部分全部替换
                        this.patientProductUseTime = this.copyListWithoutId_useTime(this.patientProductUseTime, 
                            guideDetail.patientDrugGuideInfoDto.patientDrugUsetimeDtoList)
                       
                        if(guideDetail.patientDrugGuideInfoDto.patientDrugStorageDto != null) {
                            if(this.patientProductStorageDto.id != null)
                                guideDetail.patientDrugGuideInfoDto.patientDrugStorageDto.id = this.patientProductStorageDto.id;
                            else
                                guideDetail.patientDrugGuideInfoDto.patientDrugStorageDto.id = "";
                            this.patientProductStorageDto = guideDetail.patientDrugGuideInfoDto.patientDrugStorageDto;
                        }
                    }
                    
                    if(this.patientProductStorageDto == null)
                        this.patientProductStorageDto = new PatientDrugStorageDto;

                    this.getFromTable();
                    this.getNodeByCode(this.patientProductGuideDto.takeMethod);
                }
                this.isAddProductDialog = false;

                // 重新设置UEditor中的内容
                this.resetUEditorContent();
            },
            error => this.error = error
            );
    }

    getNodeByCode(code: string) {
        this.dictionaryService.getNodeByCode(this.DRAG_ROUTE_CODE, code)
            .then(nodedata => {
                this.updateMisstake(nodedata);
            }, error => this.error = <any>error);
    }

    //保存完后进行跳转
    turnToProductGuidePage() {
        // let link = ['data_management/patient_guide/product_guide'];
        // this.router.navigate(link);
        setTimeout(() => {
            window.history.back();
        }, 1000)
    }

    //从描述表中取出
    getFromDescriptionTable() {
        for (let i = 0; i < this.patientProductDescriptionDtoList.length; i++) {
            let name = this.patientProductDescriptionDtoList[i].property;
            this.des[name] = this.patientProductDescriptionDtoList[i].value;
        }
    }

    getFromUseTimeTable() {
        this.occas = [];
        for (let index = 0; index < this.patientProductUseTime.length; index++) {
            if (!this.patientProductUseTime[index].takeTimes) {
                //如果只保存了给药时机,未保存给药频率
                let newOcca = new OccaItem();
                newOcca.takeTiming = this.patientProductUseTime[index].takeTiming;
                newOcca.id = this.patientProductUseTime[index].id;
                this.occas.push(newOcca);
            } else {
                let hasTiming = false;
                occaLoop:
                for (let i = 0; i < this.occas.length; i++) {
                    if (this.occas[i].takeTiming === this.patientProductUseTime[index].takeTiming) {
                        let newTTime = new FreqItem();
                        newTTime = this.patientProductUseTime[index];
                        this.occas[i].freqs.push(newTTime);
                        hasTiming = true;
                        break occaLoop;
                    }
                }
                if (!hasTiming) {
                    let newOcca = new OccaItem();
                    let newTTime = new FreqItem();
                    newOcca.takeTiming = this.patientProductUseTime[index].takeTiming;
                    newTTime = this.patientProductUseTime[index];
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
    saveProductInfo() {
        if (!this.saveToTable()) {
            return;
        }
        this.guideDetail.patientDrugGuideDto = this.patientProductGuideDto;
        this.guideDetail.patientDrugDescriptionDtoList = this.patientProductDescriptionDtoList;
        this.guideDetail.patientDrugEffectDto = this.patientProductEffectDto;
        this.guideDetail.patientDrugInfluenceDto = this.patientProductInfluenceDto;
        this.guideDetail.patientDrugStorageDto = this.patientProductStorageDto;
        this.guideDetail.patientDrugUseTime = this.patientProductUseTime;
        this.guideListService.saveGuideList(this.guideDetail)
            .then(guideDetail => {
                this.dialogPlugin.tip(guideDetail.message);
                if (guideDetail.code == 200) {
                    this.getProductDetail(this.patientProductGuideDto.productId,true, true);
                    this.goToTab(this.selectedTab);
                    this.turnToProductGuidePage();
                }
                // this.turnToProductGuidePage();
            },
            error => this.error = error
            );
    }

    updateProductInfo() {
        if (!this.saveToTable()) {
            return;
        }
        this.guideDetail.patientDrugGuideDto = this.patientProductGuideDto;
        this.guideDetail.patientDrugDescriptionDtoList = this.patientProductDescriptionDtoList;
        this.guideDetail.patientDrugEffectDto = this.patientProductEffectDto;
        this.guideDetail.patientDrugInfluenceDto = this.patientProductInfluenceDto;
        this.guideDetail.patientDrugStorageDto = this.patientProductStorageDto;
        this.guideDetail.patientDrugUseTime = this.patientProductUseTime;
        let status = this.patientProductGuideDto.status;
        this.patientProductGuideDto.status = "未审核";
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
                        this.turnToProductGuidePage();
                    },
                    error => {
                        this.dialogPlugin.tip("无权进行此操作") 
                    });
                } else {
                    this.dialogPlugin.tip(rs.message);
                    if (rs.code == 200) {
                        this.getProductDetail(this.patientProductGuideDto.productId, true, true);
                        this.goToTab(this.selectedTab);
                        this.turnToProductGuidePage();
                    }
                    // this.turnToProductGuidePage()
                }
            },
            error => this.error = error
            );
    }

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


    //将表放入描述表中
    saveToDescriptionTable() {
        let i = 0;
        this.getContent();//获取文本框内容
        if (this.des != null) {
            for (var name in this.des) {
                let isExist = false;
                for (let index = 0; index < this.patientProductDescriptionDtoList.length; index++) {
                    if (name === this.patientProductDescriptionDtoList[index].property) {
                        this.patientProductDescriptionDtoList[index].property = name;
                        this.patientProductDescriptionDtoList[index].value = this.des[name];
                        isExist = true;
                    }

                }
                if (!isExist) {
                    let tempdic = new PatientDrugDescriptionDtoList();
                    tempdic.property = name;
                    tempdic.value = this.des[name];
                    this.patientProductDescriptionDtoList.push(tempdic);
                }
            }
        }
    }



    //将数据放入储藏方法表
    saveToStorageTable() {
        if (this.containerOtherText != '其他') {
            this.patientProductStorageDto.container = this.containerOtherText;
        }
        if (this.lightOtherText != '其他') {
            this.patientProductStorageDto.light = this.lightOtherText;
        }
        if (this.humidityOtherText != '其他') {
            this.patientProductStorageDto.humidity = this.humidityOtherText;
        }
        if (this.environmentOtherText != '其他') {
            this.patientProductStorageDto.environment = this.environmentOtherText;
        }
    }
    //为select赋值
    getFromStorageTable() {
        this.containerOtherText = this.isOther(this.containerOtherText, this.Container, this.patientProductStorageDto.container);
        this.lightOtherText = this.isOther(this.lightOtherText, this.Light, this.patientProductStorageDto.light);
        this.humidityOtherText = this.isOther(this.humidityOtherText, this.Humidity, this.patientProductStorageDto.humidity);
        this.environmentOtherText = this.isOther(this.environmentOtherText, this.Environment, this.patientProductStorageDto.environment);

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
    onSubmit() {
        this.isSave = true;
        if (this.matchEditedUser(this.auditByModel)) {
            //this.patientProductGuideDto.auditBy = this.auditByModel.id;
            if (this.patientProductGuideDto.id == '' || !this.patientProductGuideDto.id) {
                this.saveProductInfo();
            } else {
                this.patientProductGuideDto.status = "未审核";
                this.updateProductInfo();
            }
        } else {
            this.dialogPlugin.tip("您输入的人不在审核人列表中");
        }
    }

    /**
     * 审核保存产品指导单
     */
    auditSubmit() {
        //审核保存前,做必要的权限检查:如果
        let currentUserName: string = this.userService.user.realname;
        //console.log("currentUser name:" + currentUserName);

        if ( !this.checkUserAuditPrivilege( currentUserName ) ) {
            this.dialogPlugin.tip("当前无审核权限，无法进行审核保存操作!");
            return;
        }
        

        this.isSave = true;
        if (this.matchEditedUser(this.auditByModel)) {
            //this.patientProductGuideDto.auditBy = this.auditByModel.id;
            this.patientProductGuideDto.status = "已审核";
            this.updateProductInfo();
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
            this.patientProductGuideDto.auditBy = this.auditByModel.id;
            return true;
        };

        for (let i = 0; i < this.auditPermissionOwnerList.length; i++) {
            if (auditByModel == this.auditPermissionOwnerList[i].realname) {
                this.patientProductGuideDto.auditBy = this.auditPermissionOwnerList[i].id;
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
    //获取剂量单位
    getDicOptionsDose() {
        this.dictionaryService.getChildrenByCode(this.DICTIONARY_DOSE_UNIT_CODE)
            .then(dicOPtionsDose => this.dicOPtionsDose = dicOPtionsDose,
            error => this.error = <any>error);
    }

    customTemplateStringOptions = {
        getChildren: this.getChildren.bind(this),
        idField: 'uuid'
    }
    getChildren(node: any): any {
        return this.dictionaryService.getChildrenByNode(node.data);
    }
    updateTakeMethod($event: any) {
        this.patientProductGuideDto.takeMethod = $event.node.data.code;
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
    addPatientProductInfluence() {
        let tempDrugInfluence = new PatientDrugInfluenceDto();
        this.patientProductInfluenceDto.push(tempDrugInfluence);
    }

    //点击添加事件（副作用）
    addPatientProductEffectDto() {
        let tempDrugEffectDto = new PatientDrugEffectDto();
        this.patientProductEffectDto.push(tempDrugEffectDto);
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
    getDicOptionsTime() {
        this.dictionaryService.getChildrenByCode(this.MEDICATION_OCCASION_CODE)
            .then(dicOPtionsTime => {
                this.dicOPtionsTime = dicOPtionsTime;
                // this.initDicTimeOptions();
            },
            error => this.error = <any>error);
    }

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

    //点击添加给药时机
    addOccasion() {
        let occaItem = new OccaItem();
        this.getDicOptionsFreq(occaItem);
        this.occas.push(occaItem);
    }

    //循环判断给药频率是否已经在通用时间中设置过
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

    //为每个freqItem添加给药时机
    addTakeTiming() {
        this.patientProductUseTime = [];
        for (let i = 0; i < this.occas.length; i++) {
            if (this.occas[i].freqs.length == 0) {
                let tempFreq = new FreqItem();
                tempFreq.takeTiming = this.occas[i].takeTiming;
                tempFreq.id = this.occas[i].id;
                this.patientProductUseTime.push(tempFreq);
            }
            for (let j = 0; j < this.occas[i].freqs.length; j++) {
                if (!this.occas[i].freqs[j].id) {
                    this.occas[i].freqs[j].takeTiming = this.occas[i].takeTiming;
                }
                this.patientProductUseTime.push(this.occas[i].freqs[j]);
            }
        }
    }

    //选择给药时机之后做的设置
    setOccaItemInfo(occa: OccaItem) {
        // this.initDicTimeOptions();
        this.setCodeShij(occa);
    }

    //false:未保存过给药时机，true：保存过
    hasSavedUseTime(occa: OccaItem): boolean {
        if (!this.patientProductGuideDto.id) {
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
            this.patientUseTimeService.deleteUseTimeByGuideId(this.patientProductGuideDto.id, occa.takeTiming)
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
                content =  this.patientProductStorageDto.comment;
            } else {
                let lowerCase = ueditorName[2].toLowerCase();
                let dataName = lowerCase + ueditorName.substring(3, ueditorName.length);  //形如：drugDes， useMethod
                content = this.des[dataName];
            }

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
            this.patientProductStorageDto.comment = this.ueComment.getContent();
        }
    }

    //显示文本框内容
    setContents(editorName: string) {
        if (editorName == "ueComment") {
            this.setContent("ueComment", this.patientProductStorageDto.comment);
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

    /***********end 富文本 *********/

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

    onCancel() {
        this.dialogPlugin.confirm("确认要放弃保存并退出吗？", () => {
            this.isSave = true;
            this.turnToProductGuidePage();
        }, () => { });
    }

    hasEmptyString(): boolean {
        for (let oci = 0; oci < this.occas.length; oci++) {
            if ((this.occas[oci].takeTiming === '') || (!this.occas[oci].takeTiming)) {
                this.dialogPlugin.tip("给药时间存在空字符串，保存失败");
                return true;
            }
            for (let fei = 0; fei < this.occas[oci].freqs.length; fei++) {
                if ((this.occas[oci].freqs[fei].takeTimes === '') || (!this.occas[oci].freqs[fei].takeTimes) || (this.occas[oci].freqs[fei].takeFrequencyArr.length == 0)) {
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

    onDblActivate($event: any) {
        if(!$event) return;
        this.getProductDetail($event.id, false, false);
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