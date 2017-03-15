import { Component, OnInit, ViewChild } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { HospitalService } from './hospital.service';
import { DictionaryService } from '../data_management/patient_guide/dictionary.service';
import { DialogPlugin } from '../common/ug-dialog/dialog';
import { TablePlugin } from '../common/ug-table/table.module';
@Component({
    selector: 'hospital-edit',
    template: require('./hospital_edit.component.html'),
    providers: [
        HospitalService,
        DictionaryService
    ]
})
export class HospitalEditComponent implements OnInit {

    contacterTable: any = {
        title:[
            {
                name: '序号'
            }, {
                name: '姓名'
            }, {
                name: '科室'
            }, {
                name: '职务'
            }, {
                name: '负责/使用模块'
            }, {
                name: '联系电话'
            }, {
                name: '邮箱'
            }, {
                name: '其他联系方式'
            }, {
                name: '操作'
            }
        ],
        pageSize: 20,
        dataListPath: 'recordList',
        itemCountPath: 'recordCount'
    };
    hospitalId: number;
    hospitalInfo: any = {};     //医院信息
    contacterInfo: any = {};    //联系人信息
    gyGroup: any[] = [];           //干预字典树
    regionGroup: any[];            //区域节点树
    systemMenuGroup: any[] = [];   //系统菜单树
    title = '知识管理平台';
    gyPhaseArray = new Array<string>(); //干预
    hospitalStatusArr = new Array<string>(); //干预
    error: any;
    isHideDialog: boolean = true;
    dialogType: string;        //弹窗类型 -contacter 联系人 -region所属区域
    area: string; //暂存区域名称
    regionId: string; //暂存区域名称
    purchaseVersion = {
        '1': '2.0',
        '2': '2.0',
        '3': '1.0',
        '4': '3.0',
    };//3:集中平台 1：单元区 2：多院区 4：模块化平台


    @ViewChild(DialogPlugin) dialogPlugin: DialogPlugin;
    @ViewChild(TablePlugin) tablePlugin: TablePlugin;
    constructor(
        private router: Router,
        private route: ActivatedRoute,
        private hospitalService: HospitalService,
        private dictionaryService: DictionaryService
    ) { }

    ngOnInit() {
        this.getHospitalStatusList();
        this.getParamFromRouter();
        this.getRegionTree();
    }

    /*** * Begin 初始化设置 */

    /** *从Url中获取hospitalId
     *   根据获取的hospitalId获取医院信息以及联系人列表
     *   如果没有hosptialId则为新增
    */
    getParamFromRouter() {
        this.route.params.forEach((params: Params) => {
            this.hospitalId = +params['id'];
            if (this.hospitalId) {
                this.getHosp();
                //获取联系人列表
                this.contacterTable.url = '/api/v1/hospitalConnectorList?numPerPage={pageSize}&pageNum={currentPage}&hospitalId=' + this.hospitalId;
            } else {
                this.getGyPhase();
            }
        })
    }

    /** *获取医院状态列表*/
    getHospitalStatusList() {
        this.hospitalService.getHospitalStatusList()
            .then(res => {
                if (res.code == 200)
                    this.hospitalStatusArr = res.data;
            }, error => this.error = <any>error);
    }

    /**** * Begin 医院操作 */

    /** *获取医院信息*/
    getHosp() {
        this.hospitalService.getHosp(this.hospitalId)
            .then(res => {
                this.hospitalInfo = res.data;
                this.hospTimeDate2Obj();
                this.getGyPhase();
                // this.getSystemMenu();
            }, error => this.error = <any>error);
    }

    cancelSubmit() {
        let link: any[] = ["guest_management/hospital_management"];
        this.router.navigate(link);
    }

    hospTimeDate2Obj() {
        if (this.hospitalInfo.implementTime)
            this.hospitalInfo.implementTime = this.transferDate2Obj(this.hospitalInfo.implementTime);
        if (this.hospitalInfo.onlineTime)
            this.hospitalInfo.onlineTime = this.transferDate2Obj(this.hospitalInfo.onlineTime);
        if (this.hospitalInfo.checkTime)
            this.hospitalInfo.checkTime = this.transferDate2Obj(this.hospitalInfo.checkTime);
    }
    hospTimeObj2Date() {
        if (this.hospitalInfo.implementTime)
            this.hospitalInfo.implementTime = this.transferObj2Date(this.hospitalInfo.implementTime);
        if (this.hospitalInfo.onlineTime)
            this.hospitalInfo.onlineTime = this.transferObj2Date(this.hospitalInfo.onlineTime);
        if (this.hospitalInfo.checkTime)
            this.hospitalInfo.checkTime = this.transferObj2Date(this.hospitalInfo.checkTime);
    }

    /** *保存医院信息
     *   如果hospitalId存在，则为修改，否则为新增
    */
    submitHosp() {

        this.hospTimeObj2Date();

        this.checkPurchaseVersion();

        this.hospitalInfo.purchaseVersion = this.purchaseVersion[this.hospitalInfo.sysType];

        if (!this.checkParamter())
            return;
      
        if (this.hospitalId) {
            this.putHosp();
        } else {
            this.postHosp();
        }
    }

    /*** 检查必传项 */
    checkParamter() {

        if (!this.hospitalInfo.code) {
            this.dialogPlugin.tip("机构代码 不能为空！");
            return false;
        }

        if (!this.hospitalInfo.name) {
            this.dialogPlugin.tip("机构名称 不能为空！");
            return false;
        }

        if (!this.hospitalInfo.category) {
            this.dialogPlugin.tip("机构类别 不能为空！");
            return false;
        }

        if (!this.hospitalInfo.nature) {
            this.dialogPlugin.tip("机构性质 不能为空！");
            return false;
        }

        if (!this.hospitalInfo.legalRepresent) {
            this.dialogPlugin.tip("法定代表人 不能为空！");
            return false;
        }

        if (!this.hospitalInfo.prepareBedsNum) {
            this.dialogPlugin.tip("编制床位数 不能为空！");
            return false;
        }

        if (!this.hospitalInfo.regionId) {
            this.dialogPlugin.tip("所属区域 不能为空！");
            return false;
        }

        if (!this.hospitalInfo.purchaseVersion) {
            this.dialogPlugin.tip("购买系统版本 不能为空！");
            return false;
        }

        if (!this.hospitalInfo.zonesNum) {
            this.dialogPlugin.tip("院区数量 不能为空！");
            return false;
        }

        if (!this.hospitalInfo.currentStatus) {
            this.dialogPlugin.tip("医院状态 不能为空！");
            return false;
        }

        return true;

    }

    /** 检查购买系统类型
     * 如果购买系统类型不为“模块化平台”
     * 则抹除非模块块平台启用信息
     */
    checkPurchaseVersion() {

        if (this.hospitalInfo.sysType != 4) {
            this.hospitalInfo.supportType = null;
            this.hospitalInfo.allDict = null;
            this.hospitalInfo.allProduct = null;
            this.hospitalInfo.labRule = null;
            this.hospitalInfo.gyType = null;
            this.hospitalInfo.gyPhaseName = null;
            this.hospitalInfo.gyPhase = null;
            this.hospitalInfo.resourceName = null;
            this.hospitalInfo.resourceIds = null;
        }
    }

    /** *修改医院信息*/
    putHosp() {

        this.hospitalService.putHosp(this.hospitalInfo)
            .then(res => {
                this.dialogPlugin.tip(res.message);
                if (res.code == 200) {
                    this.hospitalInfo = res.data;
                    this.hospTimeDate2Obj();
                }
            }, error => this.error = <any>error);

    }

    /** *新增医院信息*/
    postHosp() {

        this.hospitalService.postHosp(this.hospitalInfo)
            .then(res => {
                this.dialogPlugin.tip(res.message);
                if (res.code == 200) {
                    this.hospitalId = res.data.hospitalId;
                    this.hospitalInfo = res.data;
                    this.contacterInfo.hospitalId = this.hospitalId;
                    this.hospTimeDate2Obj();
                }
            }, error => this.error = <any>error);

    }
    /***End 医院操作 */

    /***Begin 干预字典树 */
    /** *获取干预列表*/
    getGyPhase() {
        let codes: string = '';

        if (this.hospitalId)
            codes = this.hospitalInfo.gyPhase;

        this.hospitalService.getGyPhase(this.hospitalInfo.gyPhase)
            .then(res => {
                if (!this.dictionaryService.isEmptyObject(res.data)) {
                    this.gyGroup = res.data;
                    console.log(this.gyGroup);
                }

            }, error => this.error = <any>error);
    }

    optionsGy: any = {
        options: {
            getChildren: this.getGyChildren.bind(this),
            idField:'uuid'
        },
        title: '选择干预阶段'
    };

    getGyChildren(node: any): any {
        // return this.dictionaryService.getChildrenByNode(node.data);
        return new Promise((resolve, reject) => {
            resolve(this.dictionaryService.getChildrenByNode(node.data)
                .then(result => {
                    // for (let i = 0; i < result.length; i++) {
                    // 	for (let j = 0; j < this.checkedCodes.length; j++) {
                    // 		if (result[i].code == this.checkedCodes[j]) {
                    // 			result[i].checked = true;
                    // 		}
                    // 	}
                    // }
                    return result;
                }));
        });
    }

    /****获取选中的节点 */
    getCheckedNodeGy($event: any) {
        this.hospitalInfo.gyPhase = '';
        this.hospitalInfo.gyPhaseName = '';
        for (let i = 0; i < $event.length; i++) {
            this.hospitalInfo.gyPhase += $event[i].id + ' ';
            this.hospitalInfo.gyPhaseName += $event[i].name + ' ';
        }
    }

    /***End 干预字典树 */
    /***End 初始化设置 */

    /****Begin 联系人操作 */

    /***点击 “添加/修改 联系人” 显示联系人弹框
     *  如果参数 contacter存在，则表示为修改，否则清空contacterInfo的信息
     */
    editContacter(contacter?: any) {
        this.showDialog("新增联系人", "contacter");
        if (contacter)
            this.contacterInfo = contacter;
        else this.contacterInfo = {};
    }

    /** 保存联系人
     *  如果联系人ID存在，则为修改，否则为新增
     */
    submitContacter() {
        //ID存在则为修改
        if (!this.contacterInfo.name) {
            this.dialogPlugin.tip("联系人名称 不能为空！");
            return false;
        }

        if (!this.contacterInfo.depart) {
            this.dialogPlugin.tip("联系人科室 不能为空！");
            return false;
        }

        if (!this.contacterInfo.phone) {
            this.dialogPlugin.tip("联系人电话 不能为空！");
            return false;
        }

        if (this.hospitalId) {
            this.contacterInfo.hospitalId = this.hospitalId;
        } else {
            //hospitalId不存在，先保存医院产生hospitalId
            this.postHosp();
        }
        if (this.contacterInfo.id) {
            this.hospitalService.putContacter(this.contacterInfo)
                .then(res => {
                    this.dialogPlugin.tip(res.message);
                    this.isHideDialog = true;
                    this.tablePlugin.loadDataByUrl();
                }, error => this.error = <any>error)
        } else {
            this.hospitalService.postContacter(this.contacterInfo)
                .then(res => {
                    this.dialogPlugin.tip(res.message);
                    this.isHideDialog = true;
                    this.tablePlugin.loadDataByUrl();
                }, error => this.error = <any>error)
        }
    }

    onSelectContacter(contacter: any) {
        this.contacterInfo = contacter;
    }

    /** 删除联系人*/
    deleteContacter(contacterId: number) {
        this.dialogPlugin.confirm("确认要删除该联系人吗？", () => {
            this.hospitalService.deleteContacter(contacterId)
                .then(res => {
                    this.dialogPlugin.tip(res.message);
                    this.tablePlugin.loadDataByUrl();
                }, error => this.error = <any>error);
        }, () => { });
    }

    /***End 联系人操作 */

    /****
     * Begin 所属区域操作
     */

    getRegionTree() {
        this.hospitalService.getRegionTree()
            .then(res => {
                this.regionGroup = res.data;
            }, error => this.error = <any>error);
    }

    getRegionChildrenNode(node: any) {
        return this.hospitalService.getRegionTreeChildren(node.data.id)
    }

    optionsRegion = {
        getChildren: this.getRegionChildrenNode.bind(this)
    }

    getRegionNodeData($event: any) {
        this.area = $event.node.data.name;
        this.regionId = $event.node.data.id;
    }
    /****End 所属区域操作 */

    /*** Begin 系统菜单操作 */

    /****获取系统菜单 */
    getSystemMenu() {
        this.hospitalService.getSystemMenu(this.hospitalInfo.supportType, this.hospitalInfo.allDict, this.hospitalInfo.allProduct)
            .then(res => {
                if (!this.dictionaryService.isEmptyObject(res.data)) {
                    // this.systemMenuGroup = res.data;
                    let result = res.data;
                    if (this.hospitalInfo.resourceIds) {
                        let checkedIds: any[] = this.hospitalInfo.resourceIds.split(',');
                        result = this.setCheckedChildren(result, checkedIds);
                    }
                    this.systemMenuGroup = result;
                    this.isHideDialog = false;
                }

            }, error => this.error = <any>error);
    }

    setCheckedChildren(treeNodes: any[], checkedNodes: any[]): any[] {
        for (let i = 0; i < treeNodes.length; i++) {
            for (let j = 0; j < checkedNodes.length; j++) {
                if (treeNodes[i].id == checkedNodes[j]) {
                    treeNodes[i].checked = true;
                }
                if (treeNodes[i].children.length != 0)
                    treeNodes[i].children = this.setCheckedChildren(treeNodes[i].children, checkedNodes);
            }
        }
        return treeNodes;
    }

    optionsSystemMenu: any = {
        options: {
            getChildren: this.getSystemMenuChildren.bind(this),
            idField:'uuid',
            isExpandedField: 'open'
        },
        title: '选择系统阶段',
        isHalfCheckLink: false
    };

    getSystemMenuChildren(node: any): any {
        // return this.dictionaryService.getChildrenByNode(node.data);
        return new Promise((resolve, reject) => {
            resolve(this.dictionaryService.getChildrenByNode(node.data)
                .then(result => {
                    // let checkedIds:any[] = this.hospitalInfo.resourceIds.splice(',');
                    // for (let i = 0; i < result.length; i++) {
                    // 	for (let j = 0; j < checkedIds.length; j++) {
                    // 		if (result[i].id == checkedIds[j]) {
                    // 			result[i].checked = true;
                    // 		}
                    // 	}
                    // }
                    // return result;
                }));
        });
    }

    getCheckedNodeSysMenu($event: any) {
        this.hospitalInfo.resourceIds = '';
        this.hospitalInfo.resourceName = '';
        for (let i = 0; i < $event.length; i++) {
            this.hospitalInfo.resourceIds += $event[i].id + ',';
            this.hospitalInfo.resourceName += $event[i].name + ' ';
        }
    }
    /*** End 系统菜单操作 */

    showDialog(title: string, type: string) {
        this.title = title;
        this.dialogType = type;
        if(type == 'systemMenu') {
            this.getSystemMenu();
        }
        else this.isHideDialog = false;
    }

    onSubmit() {
        if (this.dialogType == 'contacter') this.submitContacter();
        if (this.dialogType == 'region') {
            this.hospitalInfo.area = this.area;
            this.hospitalInfo.regionId = this.regionId;
            this.isHideDialog = true;
        }
    }

    /****Begin 时间控件格式转换 */
    transferObj2Date(obj: any): any {
        if (!obj) return true;
        if (!obj.year || !obj.month || !obj.day) {
            this.dialogPlugin.tip("时间格式不正确");
            return null;
        }
        let dateStr = obj.year + '/' + obj.month + '/' + obj.day;
        let dateTemp = new Date(dateStr);
        let date = dateTemp.getTime().toString();
        return date;
    }

    transferDate2Obj(date: any): any {
        date = new Date(date);
        let obj: any = {};
        obj.year = date.getFullYear();
        obj.month = date.getMonth() + 1;
        obj.day = date.getDate();
        return obj;
    }
    /****End 时间控件格式转换 */

    /****
     * 更改购买系统支持类型
     * 
     * 系统支持类型(supportType) 
     *             - 3：集中平台 字典非共用，产品非共用
     *             - 2：多院区   字典和产品是否共用可选
     *             - 1：单院区   字典共用，产品共用
     * 0:共用  1：非共用
     */
    setRelativeProperty() {
        if (this.hospitalInfo.supportType == 1) {
            this.hospitalInfo.allDict = 0;   //字典
            this.hospitalInfo.allProduct = 0;//产品
        }
        if (this.hospitalInfo.supportType == 3) {
            this.hospitalInfo.allDict = 1;   //字典
            this.hospitalInfo.allProduct = 1;//产品
        }
    }
}