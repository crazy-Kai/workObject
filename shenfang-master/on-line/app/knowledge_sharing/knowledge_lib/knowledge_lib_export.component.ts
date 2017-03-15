import { Component, OnInit, Input, ViewChild, ElementRef } from '@angular/core';
import { Location, PathLocationStrategy } from '@angular/common';
import { Router } from '@angular/router';
import { DialogPlugin, DialogModel} from '../../common/ug-dialog/dialog';

import { TablePlugin } from '../../common/ug-table/table.module';
import { HospitalService } from '../../guest_management/hospital.service';
import { KnowledgeLibService } from './knowledge_lib_service';
@Component({
	selector: 'knowledge-lib-export',
	templateUrl:'knowledge_lib_export.component.html',
	styles: [require('./knowledge_lib_export.css') + ""],
	providers: [ HospitalService, KnowledgeLibService, PathLocationStrategy ]
})
export class KnowledgeLibExportComponent implements OnInit{
	@ViewChild(TablePlugin) tablePlugin: TablePlugin;
	constructor(
       	private hospitalService: HospitalService,
		private knowledgeLibService: KnowledgeLibService,
		private pathLocationStrategy: PathLocationStrategy
    ) { }
	latestSucess: any = {};

	searchQuery: any = {};

	regionGroup: any[];
	curOrg: any;
	isExport: boolean;

	ngOnInit() {
		console.log(1)
		this.getLatestSuccess();
		this.getRegionTree();

		this.pathLocationStrategy.onPopState((state) => {
			this.isExport = false;
		});
	}

	getLatestSuccess(){
		this.knowledgeLibService.getLatestSucess()
			.then(res => {
				console.log(res)
				if(res.code == "200")
					this.latestSucess = res.data;
			})
	}

	//要导出更新包的资料列表
	table: any = {
		title:[
			{
				name:"序号",
				type:'index'
			},
			{
				id: 'name',
				name: '机构名称'
			},
			{
				id: 'level',
				name: '级别'
			},
			{
				id: 'area',
				name: '地区',
			},
			{
				id: 'currentStatus',
				name: '医院状态'
			},
			{
				id: 'implementTime',
				name: '实施时间',
			},
			{
				id: 'onlineTime',
				name: '上线时间',
				type:'dateY'
			},
			{
				id: 'checkTime',
				name: '验收时间'
			},
			{
				id: 'updateTime',
				name: '最后更新时间'
			},
			{
				id: '',
				name: '导出更新包'
			}
		],
		needIdx: true,
		pageSize: 20,
		url: "/api/v1/hospitalList?pageNum={currentPage}&numPerPage={pageSize}",
		dataListPath: "recordList",
		itemCountPath:"recordCount"
	}
	onClick($event: any){
		this.curOrg = $event;
	}
	//检索机构
	search(isSearch?: boolean) {
		let tempUrl = this.table.url;
		
		for(let attr in this.searchQuery){
			if(this.searchQuery[attr]){
				tempUrl += `&${attr}=${this.searchQuery[attr]}`;
			}
		}
		this.tablePlugin.loadDataByUrl(tempUrl, isSearch);
	}

	//去导出页面
	goExport(org: any){
		this.curOrg = org;
		this.isExport = true;

		this.pathLocationStrategy.pushState({state: 'exporting'}, "导出更新包", "knowledge_sharing/knowledge_lib/knowledge_lib_export/knowledge_export", "");
	}
	desSubComponent($event: any){
		console.log($event)
	}
	/****Begin 区域树相关操作 */
	checkedArea: any;
	regionId: string;
	hosName: string;
	isHideDialog: boolean = true;
    getRegionTree() {
        this.hospitalService.getRegionTree()
            .then(res => {
                this.regionGroup = res.data;
            });
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
        this.searchQuery.regionId = "";
        this.hosName = "";
    }
    onSubmit() {
        if(this.checkedArea){
            this.searchQuery.regionId = this.checkedArea.id;
            this.hosName = this.checkedArea.name;
        }else{
            this.regionId = "";
            this.hosName = "";
        }
        
        this.isHideDialog = true;
    }
    /****End 区域树相关操作 */
}