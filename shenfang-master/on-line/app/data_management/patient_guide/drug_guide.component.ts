// 药品相关指导页

import { Component, OnInit, ViewChild} from '@angular/core';
import { Router } from '@angular/router';
import { GuideListService } from './guide_list.service';
import { UrlService } from '../../url.service';
import { DrugTreeDetailComponent } from './drug_tree_detail.component';
//引入插件
import { DialogPlugin } from '../../common/ug-dialog/dialog.plugin';
import { TablePlugin } from '../../common/ug-table/table.module';
import { UserService } from '../../user.service';

class DrugGuideList {
	drugId: string;
    drugName: string;
    createdBy: string;
    createdTime: string;
    status: number;
    auditBy: string;
    auditTime: string;
}
export class DrugGuideListDto {
	patientDrugGuideDtoList: any[];
	query: any[];
	totalPage: number;
}

@Component({
	selector: 'drug_guide',
	template: require('./drug_guide.component.html'),
	styles: [require('./patient_guide.component.css') + ""],
	providers: [
		UrlService
	]
})
export class DrugGuideComponent implements OnInit {
	drugGroup: {};
	applyType = 1;//1为药品指导，2为产品指导
	error: any;
	drugGuideLists: DrugGuideList[] = [];
	selectedDrugList: DrugGuideList;
	@ViewChild(DialogPlugin) dialogPlugin: DialogPlugin;
	@ViewChild(TablePlugin) tablePlugin: TablePlugin;

	searchParams: any = {};

	//分页相关
	currentPage = 1;
	totalPage = 1;
	//检索相关
	
	//自动建议
	drugSuggestionAPI: string = this.guideListService.getDrugSuggestionAPI();

	drugGuideListUrl = '/api/v1/drugGuideList.json?applyType=1&pageNum={currentPage}&numPerPage={pageSize}';
	table: any = {
		title:[{
			id: 'id',
			name: 'ID',
			width: "20%"
		},
			{
				id: 'drugId',
				name: '药品名称',
				width: "20%"
			}, {
				id: 'createdName',
				name: '添加人',
				width: "10%"
			}, {
				id: 'createdTime',
				name: '添加时间',
				type: "date",
				width: "15%"
			}, {
				id: 'status',
				name: '审核状态',
				width: "10%"
			}, {
				id: 'auditName',
				name: '审核人',
				width: "10%"
			}, {
				id: 'auditTime',
				name: '审核时间',
				type: "date",
				width: "15%"
			}],
		pageSize: 20,
		url: this.drugGuideListUrl,
		dataListPath: "recordList",
		itemCountPath: "recordCount"
    };


	constructor(private router: Router,
		private guideListService: GuideListService,
		private urlService: UrlService,
  		private userService:UserService) { }

	ngOnInit() {
		this.reloadHistory();
	}

	reloadHistory(){
		if(!sessionStorage.getItem('drug_guide_pagination') && !sessionStorage.getItem('drug_guide_searchParams')){
			this.search();
			return;
		};

		let pagination:any = sessionStorage.getItem('drug_guide_pagination');
		this.searchParams = sessionStorage.getItem('drug_guide_searchParams');
	
		pagination = pagination ? JSON.parse(pagination) : {};
		//设置table组件的当前分页信息
		if(pagination.currentPage) this.table.currentPage = pagination.currentPage;
		if(pagination.pageSize) this.table.pageSize = pagination.pageSize;

		this.searchParams = this.searchParams ? JSON.parse(this.searchParams) : {};
		
		let tempUrl = this.formatUrl(this.drugGuideListUrl, pagination.currentPage, pagination.pageSize);
		for(let attr in this.searchParams){
            if (this.searchParams[attr]) {
				tempUrl += `&${attr}=${this.searchParams[attr]}`;
			}
        }
		this.tablePlugin.loadDataByUrl(tempUrl);
	}

	formatUrl(url: string, currentPage: number, pageSize: number){
		let patternCurr = /\{currentPage\}/;
  		let patternSize = /\{pageSize\}/;

		if (url) {
			url = url.replace(patternCurr, currentPage + "");
			url = url.replace(patternSize, pageSize + "");
		}

		return url;
	}

	addDrugGuide() {
		let link = ['data_management/patient_guide/drug_guide/add_drug_guide'];
		this.router.navigate(link);
	}

	// getDrugGuideList(){
	// 	this.guideListService.getGuideList(this.applyType,this.currentPage,this.table.pageSize)
	// 		.then(drugGuideLists =>{
	// 			this.table.totalPage = drugGuideLists.totalPage;
	// 			this.table.tbody = drugGuideLists.patientDrugGuideDtoList;
	// 		} ,
	// 			error => this.error = error
	// 		);
	// }

	onClick($event: any) {
		this.selectedDrugList = $event;
	}

	delete() {
		this.dialogPlugin.confirm("确定要删除吗？", () => {
			this.deleteFromDrugGuideList();
		}, () => { });
	}

	//删除表中数据
	deleteFromDrugGuideList() {
		this.guideListService.deleteFromGuideList(this.selectedDrugList,this.applyType)
			.then(drugGuideLists => {
				this.tablePlugin.loadDataByUrl();
				this.dialogPlugin.tip("删除成功");
				this.selectedDrugList = null;
			},
			error => this.error = error
			);
	}

	//点击修改，跳转页面
	gotoDetail(isStatus: boolean) {
		let link = ['data_management/patient_guide/drug_guide/drug_tree_detail', this.selectedDrugList.drugId, isStatus];
		// let link = ['data_management/patient_guide/drug_tree_detail/'+ this.selectedDrugList.drugId + '?option='+isStatus];
		// this.urlService.setUrl(link[0]);
		this.router.navigate(link);
	}

	/**
	 * 双击触发： 产品指导单修改
	 */
	editDrugGuide(trow: any) {
		let link = ['data_management/patient_guide/drug_guide/drug_tree_detail', trow.drugId, false];
		//  if (isStatus) {
		// 	let link = ['data_management/patient_guide/product_list_detail/' + this.selectedProductList.productName 
		// 	+ '/' + this.selectedProductList.productId + '?option=' + isStatus];
		//  }
		this.router.navigate(link);
	}

	search(isSearch?: boolean) {
		let tempUrl = this.drugGuideListUrl;
		// if ((!this.guideListService.drugName) && (!this.guideListService.createdByDrug) && (!this.guideListService.auditByDrug) && (!this.guideListService.statusDrug)) {
		// 	this.table.url = this.drugGuideListUrl;
		// 	this.guideListService.searchDrugStatus = 0;
		// 	this.tablePlugin.loadDataByUrl(this.table.url, true);
		// 	return;
		// }
        // if (this.guideListService.drugName) {
        //     tempUrl = tempUrl + "&name=" + this.guideListService.drugName;
		// 	this.guideListService.searchDrugStatus = 1;
        // }
        // if (this.guideListService.createdByDrug) {
        //     tempUrl = tempUrl + "&createdBy=" + this.guideListService.createdByDrug;
		// 	this.guideListService.searchDrugStatus = 1;
        // }
        // if (this.guideListService.auditByDrug) {
        //     tempUrl = tempUrl + "&auditBy=" + this.guideListService.auditByDrug;
		// 	this.guideListService.searchDrugStatus = 1;
        // }
        // if (this.guideListService.statusDrug) {
        //     tempUrl = tempUrl + "&status=" + this.guideListService.statusDrug;
		// 	this.guideListService.searchDrugStatus = 1;
		// }
		// this.table.url = tempUrl;

		for(let attr in this.searchParams){
            if (this.searchParams[attr]) {
				tempUrl += `&${attr}=${this.searchParams[attr]}`;
			}
        }
		//每次搜索后更新sessionStorage中保存搜索条件对象
		sessionStorage.setItem('drug_guide_searchParams', JSON.stringify(this.searchParams));
				
		this.tablePlugin.loadDataByUrl(tempUrl, isSearch);
	}

	getPagination($event: any){
		sessionStorage.setItem('drug_guide_pagination', JSON.stringify($event));
	}

	clearSelect() {
		this.selectedDrugList = null;
	}
}
