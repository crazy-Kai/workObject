import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { TablePlugin } from '../common/ug-table/table.module';
import { DialogPlugin } from '../common/ug-dialog/dialog';
import { HospitalService } from './hospital.service';
import { SearchService } from '../search.service';

@Component({
    selector: 'hospital-management',
    template: require('./hospital_management.component.html'),
    styles:[ require('./guest_management.css') + "" ],
    providers: [
        HospitalService
    ]
})
export class HospitalManagementComponent implements OnInit {
    table = {
        title:[
            {
                name: '序号',
                type: 'index',
                width: "4%"
            }, {
                name: '机构名称',
                width: "8%"
            }, {
                name: '级别',
                width: "6%"     //20
            }, {
                name: '区域',
                width: "8%"
            }, {
                name: '医院状态',
                width: "6%"     //36
            }, {
                name: '实施时间',
                width: "9%"
            }, {
                name: '上线时间',
                width: "9%"
            }, {
                name: '验收时间',
                width: "9%"    //60
            }, {
                name: '技术负责人',
                width: "8%"     //
            }, {
                name: '业务负责人',
                width: "8%"     //76
            }, {
                name: '最后更新时间',
                width: "9%"     //84
            }, {
                name: '操作',
                width: "6%"
            }, {
                name: '授权码管理',
                width: "6%"
            }
        ],
        pageSize: 20,
        url: '/api/v1/hospitalList?numPerPage={pageSize}&pageNum={currentPage}',
        dataListPath: 'recordList',
        itemCountPath: 'recordCount'
    };
    currentPage: number = 1;
    selectHosp: any;
    error: any;
    hospitalStatusArr = new Array<any>();
    isHideDialog: boolean = true;
    regionGroup: any[];
    checkedArea: any;
    hosName: string;
    hospitalSuggestionURL: string = this.hospitalService.getHospitalSuggestionURL();

    @ViewChild(DialogPlugin) dialogPlugin: DialogPlugin;
    @ViewChild(TablePlugin) tablePlugin: TablePlugin;

    constructor(
        private router: Router,
        private hospitalService: HospitalService,
        private searchService: SearchService
    ) { }

    ngOnInit() {
        this.getHospitalStatusList();
        this.getRegionTree();
    }

    getCurrentPage($event: any) {
        this.currentPage = $event;
    }

    /** *获取医院状态列表*/
    getHospitalStatusList() {
        this.hospitalService.getHospitalStatusList()
            .then(res => {
                if (res.code == 200)
                    this.hospitalStatusArr = res.data;
            }, error => this.error = <any>error);
    }

    /*** Begin 列表操作*/

    /***
    * -修改医院操作 goToEditPage  @parameter id：该机构的id
    */
    goToEditPage(id?: number) {
        let link: any[] = ["guest_management/hospital_management/hospital_edit"];
        if (id)
            link.push(id);
        this.router.navigate(link);
    }

    /***
    * -修改医院操作 goToEditPage  @parameter id：该机构的id
    */
    goToAuthCodePage(id: number) {
        let link = ["guest_management/hospital_management/authorization_code", id];
        this.router.navigate(link);
    }

    /**
     *  -删除操作 deleteHosp    @parameter id：该机构的id
     */
    deleteHosp(id: number) {
        this.dialogPlugin.confirm("确认要删除该机构吗？", () => {
            this.hospitalService.deleteHosp(id)
                .then(res => {
                    this.dialogPlugin.tip(res.message);
                    if (res.code == 200) this.tablePlugin.loadDataByUrl();
                }, error => this.error = <any>error);
        }, () => { });
    }
    /***End 列表操作 */

    onSelect($event: any) {
        this.selectHosp = $event;
    }

    onSearch() {
        let tempUrl = '/api/v1/hospitalList?numPerPage={pageSize}&pageNum={currentPage}';
        if ((!this.searchService.hospName) && (!this.searchService.hospCurrentStatus)
            && (!this.searchService.hospRegionId) && (!this.searchService.hospTechPerson)
            && (!this.searchService.hospBusinessPerson)) {
            this.table.url = tempUrl;
            this.tablePlugin.loadDataByUrl(this.table.url, true);
            return;
        }
        if (this.searchService.hospName) {
            tempUrl = tempUrl + "&name=" + this.searchService.hospName;
        }
        if (this.searchService.hospCurrentStatus) {
            tempUrl = tempUrl + "&currentStatus=" + this.searchService.hospCurrentStatus;
        }
        if (this.searchService.hospRegionId) {
            tempUrl = tempUrl + "&regionId=" + this.searchService.hospRegionId;
        }
        if (this.searchService.hospTechPerson) {
            tempUrl = tempUrl + "&techPerson=" + this.searchService.hospTechPerson;
        }
        if (this.searchService.hospBusinessPerson) {
            tempUrl = tempUrl + "&businessPerson=" + this.searchService.hospBusinessPerson;
        }
        this.table.url = tempUrl;
        this.tablePlugin.loadDataByUrl(this.table.url, true);
    }

    /**
     * 检索表头的回车事件
     */
    private searchInputEntered() : void {
        this.onSearch();
    }

    /****Begin 区域树相关操作 */
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
        this.checkedArea = $event.node.data;
    }
    resetRegion(){
        this.searchService.hospRegionId = "";
        this.hosName = "";
    }
    onSubmit() {
        if(this.checkedArea){
            this.searchService.hospRegionId = this.checkedArea.id;
            this.hosName = this.checkedArea.name;
        }else{
            this.searchService.hospRegionId = "";
            this.hosName = "";
        }
        
        this.isHideDialog = true;
    }
    /****End 区域树相关操作 */

}