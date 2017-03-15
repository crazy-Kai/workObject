import { Component, OnInit, ViewChildren, QueryList, ViewChild } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { HospitalService } from './hospital.service';
import { TablePlugin } from '../common/ug-table/table.module';
import { DialogPlugin } from '../common/ug-dialog/dialog';
@Component({
    selector: 'authorization-code',
    template: require('./authorization_code.component.html'),
    providers: [
        HospitalService
    ]
})
export class AuthorizationCodeComponent implements OnInit {
    sysActivationCodesTable: any = {
        title: [
            {
                name: '序号'
            }, {
                name: '机器码'
            }, {
                name: '授权类型'
            }, {
                name: '到期时间'
            }, {
                name: '激活码'
            }, {
                name: '状态'
            }, {
                name: '委托人'
            }, {
                name: '操作人'
            }, {
                name: '创建时间'
            }, {
                name: '操作'
            }
        ],
        pageSize: 20,
        dataListPath: 'recordList',
        // itemCountPath: 'recordCount'
    };
    zoneActivationCodesTable: any = {
        title: [
            {
                name: '序号'
            }, {
                name: '系统激活码'
            }, {
                name: '院区编码'
            }, {
                name: '院区名称'
            }, {
                name: '院区激活码'
            }, {
                name: '状态'
            }, {
                name: '委托人'
            }, {
                name: '操作人'
            }, {
                name: '创建时间'
            }, {
                name: '操作'
            }
        ],
        pageSize: 20,
        dataListPath: 'recordList',
        // itemCountPath: 'recordCount'
    };
    lisenceTypeArr = {
        'U': '无限期授权',
        'L': '日期受限授权'
    }
    hospitalId: number;
    hospitalInfo: any = {};
    sysActivationInfo: any;
    zoneActivationInfo: any = {};
    error: any;
    isHideDialog: boolean = true;
    isSubmit: boolean = true;
    dialogType: string;
    title: string = "添加";
    deadTime: any = null;
    @ViewChild(DialogPlugin) dialogPlugin: DialogPlugin;
    @ViewChildren(TablePlugin) tablePlugins: QueryList<TablePlugin>;
    constructor(
        private router: ActivatedRoute,
        private hospitalService: HospitalService
    ) { }

    ngOnInit() {
        this.getParamFromRouter();
    }

    ngAfterViewInit() {
        this.tablePlugins.first.loadDataByUrl();
    }

    /** *从Url中获取hospitalId
     *   根据获取的hospitalId获取医院信息以及联系人列表
     *   如果没有hosptialId则为新增
    */
    getParamFromRouter() {
        this.router.params.forEach((params: Params) => {
            this.hospitalId = +params['id'];
            if (this.hospitalId) {
                this.getHosp();
                //获取系统激活码列表
                this.sysActivationCodesTable.url = '/api/v1/hospitalLicenseList?numPerPage={pageSize}&pageNum={currentPage}&hospitalId=' + this.hospitalId;
            }
        })
    }

    /** *获取医院信息*/
    getHosp() {
        this.hospitalService.getHosp(this.hospitalId)
            .then(res => {
                this.hospitalInfo = res.data;
            }, error => this.error = <any>error);
    }

    /*** Begin 系统激活码操作 */

    /**  添加激活码
     *   @parameter dialogType -system 系统激活码 -zone 院区激活码
    */
    addActivationCode(dialogType: string) {
        this.dialogType = dialogType;
        this.isHideDialog = false;
        if (this.dialogType == 'system') {
            this.sysActivationInfo = {};
            this.deadTime = null;
        }
        if (this.dialogType == 'zone') {
            if (!this.sysActivationInfo || this.hospitalService.isEmptyObject(this.sysActivationInfo)) {
                this.dialogPlugin.tip("未选择系统激活码！");
                return;
            }
            this.zoneActivationInfo = {};
            this.zoneActivationInfo.licenseCode = this.sysActivationInfo.licenseCode;
        }
    }

    /***** 删除系统激活码 */
    deleteSysActivationCode(id: number) {
        this.dialogPlugin.confirm("确认要删除该系统激活码吗？", () => {
            this.hospitalService.deleteSysActivationCode(id)
                .then(res => {
                    this.dialogPlugin.tip(res.message);
                    if (res.code == 200) {
                        this.tablePlugins.first.loadDataByUrl();
                        this.sysActivationInfo = {};
                    }
                }, error => this.error = <any>error);
        }, () => { });
    }

    /**** 保存系统激活码 */
    postSysActivationCode() {
        if (!this.sysActivationInfo.serverCode) { this.dialogPlugin.tip("请填写机器码"); return; }
        if (!this.sysActivationInfo.licenseType) { this.dialogPlugin.tip("请填写授权类型"); return; }
        if (this.deadTime) {
            this.sysActivationInfo.deadTime = this.transferObj2Date(this.deadTime);
        } else {
            this.dialogPlugin.tip("请选择到期时间");
            return;
        }
        this.hospitalService.postSysActivationCode(this.sysActivationInfo, this.hospitalId)
            .then(res => {
                this.dialogPlugin.tip(res.message);
                if (res.code == 200) {
                    this.sysActivationInfo = res.data;
                    this.isHideDialog = true;
                    this.tablePlugins.first.loadDataByUrl();
                    this.sysActivationInfo = {};
                }
            }, error => this.error = <any>error);
    }

    onSelectSystem(systemItem: any) {
        this.sysActivationInfo = systemItem;
        if((this.hospitalInfo.sysType == 2 && this.hospitalInfo.purchaseVersion == '2.0') || (this.hospitalInfo.sysType == 4 && this.hospitalInfo.purchaseVersion == '3.0' && this.hospitalInfo.supportType == 2)){
            this.zoneActivationCodesTable.url = '/api/v1/hospitalZoneLicenseList?numPerPage={pageSize}&pageNum={currentPage}&hospitalId='
                + this.hospitalId + '&licenseCode=' + systemItem.licenseCode;
            this.tablePlugins.last.loadDataByUrl(this.zoneActivationCodesTable.url);
            this.zoneActivationInfo.licenseCode = this.sysActivationInfo.licenseCode;
        }
    }

    onSubmit() {
        if (this.dialogType == 'system')
            this.postSysActivationCode();
        else {
            if (this.dialogType == 'zone')
                this.submitZoneActivationCode();
        }
    }

    /*** End 系统激活码操作 */

    /*** Begin 院区激活码操作 */

    /** 点击"修改/查看"激活码 */
    showInfo(dialogType: string, item: any, isSubmit?: boolean) {
        if (dialogType == 'system') {
            this.sysActivationInfo = item;
            if (this.sysActivationInfo.deadTime)  //转换日期格式
                this.deadTime = this.transferDate2Obj(this.sysActivationInfo.deadTime);
        }
        if (dialogType == 'zone') this.zoneActivationInfo = item;
        this.dialogType = dialogType;
        if (isSubmit != null) { this.isSubmit = isSubmit; }
        else isSubmit = true;
        this.isHideDialog = false;
    }

    onSelectZone(zoneItem: any) {
        this.zoneActivationInfo = zoneItem;
    }

    submitZoneActivationCode() {
        if (this.zoneActivationInfo.id)
            this.putZoneActivationCode();
        else this.postZoneActivationCode();
    }

    /*** 新增院区激活码 */
    postZoneActivationCode() {
        if (!this.zoneActivationInfo.zoneCode) { this.dialogPlugin.tip("请填写院区编码"); return; }
        if (!this.zoneActivationInfo.zoneName) { this.dialogPlugin.tip("请填写院区名称"); return; }
        this.hospitalService.postZoneActivationCode(this.zoneActivationInfo, this.hospitalId)
            .then(res => {
                this.dialogPlugin.tip(res.message);
                if (res.code == 200) {
                    this.tablePlugins.last.loadDataByUrl();
                    this.isHideDialog = true;
                }
            }, error => this.error = <any>error);
    }

    /*** 修改院区激活码 */
    putZoneActivationCode() {
        this.hospitalService.putZoneActivationCode(this.zoneActivationInfo, this.hospitalId)
            .then(res => {
                this.dialogPlugin.tip(res.message);
                if (res.code == 200) {
                    this.tablePlugins.last.loadDataByUrl();
                    this.isHideDialog = true;
                }
            }, error => this.error = <any>error);
    }

    /*** 修改院区激活码 */
    deleteZoneActivationCode(id: number) {
        this.dialogPlugin.confirm("确认要删除该院区激活码吗？", () => {
            this.hospitalService.deleteZoneActivationCode(id)
                .then(res => {
                    this.dialogPlugin.tip(res.message);
                    if (res.code == 200) {
                        this.tablePlugins.last.loadDataByUrl();
                        this.zoneActivationInfo = {};
                    }
                }, error => this.error = <any>error);
        }, () => { });
    }

    /*** End 院区激活码操作 */

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
}