import { Component, OnInit, ViewChild } from '@angular/core';
import { Router, NavigationExtras } from '@angular/router';
import { Location, PathLocationStrategy, LocationChangeListener } from '@angular/common';
import { TablePlugin } from '../../common/ug-table/table.module';
import { Observable } from 'rxjs/Observable';

import { HospitalService } from '../../guest_management/hospital.service';
import { KnowledgeImportService } from './knowledge_import.service';


class SearchQuery {
	//type : string;
	name: string;
	regionId: string;
	status: boolean;		// 1 => 已回收； 2 => 暂无回收
}
@Component({
	selector: 'knowledge_import_list',
	templateUrl: 'knowledge_import_list.component.html',
	styleUrls: ['./knowledge_import_management.css'],
	providers: [HospitalService, PathLocationStrategy, KnowledgeImportService]
})
export class KnowledgeImportList implements OnInit {
	@ViewChild(TablePlugin) tablePlugin: TablePlugin;

	constructor(
		private router: Router,
		private hospitalService: HospitalService,
		private pathLocationStrategy: PathLocationStrategy,
		private knowledgeImportService: KnowledgeImportService
	) { }

	searchQuery: SearchQuery = new SearchQuery();
	isHidden: boolean;
	isImport: boolean;
	isLogs: boolean;
	/**
	 * 区域树相关
	 */
	regionGroup: any[];			//区域列表
	curRegion: any;				//当前区域
	curRegionName: string;
	isHideDialog: boolean = true;
	/**
	 * 机构名称联想相关
	 */
	organization: any; //指定审核人下拉联想框绑定值
	organizationsList: any[]; //有权限审核的人员列表
	organizationMap = (text$: Observable<string>) =>
		text$.debounceTime(200).distinctUntilChanged()
			.map(term => term.length < 1 ? []
				: this.organizationsList.filter(v => new RegExp(term, 'gi').test(v.name)).splice(0, 10));
	organizationFormatter = (x: any) => x['name'];
	//导入相关
	curOrg: any;

	ngOnInit() {
		this.getRegionTree();
		this.pathLocationStrategy.onPopState(() => {
			this.isHidden = false;
			this.isImport = false;
			this.isLogs = false;
		});

		this.knowledgeImportService.getOrgsList()
			.then(res => {
				this.organizationsList = res.data;
			})
	}

	knowledgeTable: any = {
		title: [{
			id: 'name',
			name: '机构名称'
		}, {
			id: '',
			name: '机构类型'
		}, {
			id: 'level',
			name: '级别',
		}, {
			id: 'area',
			name: '区域'
		}, {
			id: 'status',
			name: '状态',
		}, {
			id: 'countData',
			name: '用户资料',
		}, {
			id: 'countDict',
			name: '用户字典'
		}, {
			id: 'countRule',
			name: '用户规则'
		}, {
			id: 'countApplicationData',
			name: '用户应用数据',
		}, {
			id: 'importedDate',
			name: '最近一次回收时间'
		}, {
			id: '',
			name: '操作'
		}],
		pageSize: 20,
		url: "/api/v1/knowledgeImportList?numPerPage={pageSize}&pageNum={currentPage}",
		dataListPath: "recordList",
		itemCountPath: "recordCount"
	};

	search() {
		let tempUrl = `${this.knowledgeTable.url}`;

		for (let attr in this.searchQuery) {
			if (this.searchQuery[attr]) {
				tempUrl += `&${attr}=${this.searchQuery[attr]}`;
			}
		}
		//处理机构联想框数据
		if (this.organization) {
			if (typeof (this.organization) == "string") {
				tempUrl += `&name=${this.organization}`;
			} else {
				tempUrl += `&name=${this.organization.name}`;
			}
		}

		this.tablePlugin.loadDataByUrl(tempUrl, true);
	}

	/**
	 * 获取机构名称
	 */

	/****Begin 区域树相关操作 */
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
		this.curRegion = $event.node.data;
	}
	onSubmit() {
		if (this.curRegion) {
			this.searchQuery.regionId = this.curRegion.id;
			this.curRegionName = this.curRegion.name;
		} else {
			this.searchQuery.regionId = "";
			this.curRegionName = "";
		}
		this.isHideDialog = true;
	}
	resetRegion() {
		this.searchQuery.regionId = "";
		this.curRegionName = "";
	}
	/****End 区域树相关操作 */

	/**
	 * history state 切换组件
	 */
	importKnowledge($org: any) {
		const navextras: NavigationExtras = {
			queryParams: { "org": encodeURIComponent(JSON.stringify($org)) }
		};
		this.router.navigate(['/knowledge_sharing/knowledge_import_management/knowledge_import_list/knowledeg_import'], navextras);
	}

	checkLogs() {
		this.router.navigate(['/knowledge_sharing/knowledge_import_management/knowledge_import_list/knowledeg_import_logs']);
	}

}