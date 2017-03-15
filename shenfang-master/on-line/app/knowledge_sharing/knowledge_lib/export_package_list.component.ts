import { Component, OnInit, Input, ViewChild, ElementRef } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { DialogPlugin, DialogModel} from '../../common/ug-dialog/dialog';

import { TablePlugin } from '../../common/ug-table/table.module';
import { HospitalService } from '../../guest_management/hospital.service';
import { KnowledgeLibService } from './knowledge_lib_service';
@Component({
	selector: 'export-package-list',
	templateUrl:'export_package_list.component.html',
	styles: [require('./knowledge_lib_export.css') + ""],
	providers: [ HospitalService, KnowledgeLibService ]
})
export class ExportPackageListComponent implements OnInit{
	@ViewChild(TablePlugin) tablePlugin: TablePlugin;
	constructor(
		private router: Router,
		private route: ActivatedRoute,
       	private hospitalService: HospitalService,
		private knowledgeLibService: KnowledgeLibService
    ) { }
	hospitalId: string;
	viewDefault: boolean = true;
	viewDefaultData: any = [];
	ngOnInit() {
		this.getRouteParam()
	}

	getRouteParam() {
        this.route.params.subscribe(params => {
            if(params['id'] !== undefined) {
                this.hospitalId = params['id'];
				this.table.url = "/api/v1/knowledgePackages?hospitalId="+ this.hospitalId +"&currentPage={currentPage}&pageSize={pageSize}";
				//this.tablePlugin.loadDataByUrl(this.table.url);
				this.getLatestsData(this.hospitalId, 2);
            }
        });
    }
	getLatestsData(hospitalId: string, items?: number){
		this.knowledgeLibService.getLatestsData(hospitalId, items)
			.then(res => {
				if(res.data){
					this.viewDefaultData = res.data.recordList;
				}
			})
	}
	allHistory(){
		this.viewDefault = !this.viewDefault;
		if(!this.viewDefault)
			this.tablePlugin.loadDataByUrl(this.table.url);
	}
	objToArr(obj: any){

	}
	//要导出更新包的资料列表
	table: any = {
		title:[
			{	
				id: 'exportedTime',
				name:"更新包生成时间",
			},
			{
				id: 'exportedName',
				name: '导出人'
			},
			{
				id: 'hospitalName',
				name: '机构名称'
			},
			{
				id: 'systemVersion',
				name: '适应系统',
			},
			{
				id: 'patientRule',
				name: '是否含患教'
			},
			{
				id: 'packageContent',
				name: '更新包内容',
			},
			{
				id: 'updateMode',
				name: '更新方式',
			},
			{
				id: 'dataFromTime',
				name: '数据开始时间'
			},
			{
				id: 'dataToTime',
				name: '数据截止时间'
			},
			{
				id: 'exportedName',
				name: '更新包文件名'
			},
			{
				id: 'operateRecord',
				name: '操作记录'
			},
			{
				name: '操作'
			}
		],
		needIdx: true,
		pageSize: 20,
		url: "/api/v1/knowledgePackages?hospitalId="+ this.hospitalId +"&currentPage={currentPage}&pageSize={pageSize}",
		dataListPath: "recordList",
		itemCountPath:"recordCount"
	}
	/**
	 * 下载
	 */
	downloadFile(trow: any){
		let url = "/api/v1/knowledgePackages/file?exportId=" + trow.id;
        window.open(url, '_blank');
	}

	/**
	 * 返回
	 */
	goback(){
		let link = ['knowledge_sharing/knowledge_lib/knowledge_lib_export'];
		this.router.navigate(link);
	}
}