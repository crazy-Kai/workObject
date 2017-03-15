// 产品相关指导页

import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { GuideListService } from './guide_list.service';
//引入插件
import { DialogPlugin } from '../../common/ug-dialog/dialog.plugin';
import { TablePlugin } from '../../common/ug-table/table.module';
import { UserService } from '../../user.service';

class ProductGuideList {
	id: string;
	productName: string;
	createdBy: string;
	createdTime: string;
	status: number;
	auditBy: string;
	auditTime: string;
	productId: string;	// 增加属性，解决产品指导单中传递参数需要
}
export class ProductGuideListDto {
	patientDrugGuideDtoList: any[];
	query: any[];
	totalPage: number;
}

@Component({
	selector: 'product_guide',
	template: require('./product_guide.component.html'),
	styles: [require('./patient_guide.component.css') + ""]
})
export class ProductGuideComponent implements OnInit {
	drugGroup: {};
	applyType = 2;//1为药品指导，2为产品指导
	error: any;
	selectedProductList: ProductGuideList;
	@ViewChild(DialogPlugin) dialogPlugin: DialogPlugin;
	@ViewChild(TablePlugin) tablePlugin: TablePlugin;

	searchParams: any = {};

	productSuggestionAPI: string = this.guideListService.getProductSuggestionAPI();

	currentPage = 1;//当前页
	isShowDialog: boolean = false;
	drugGuideListUrl = '/api/v1/drugGuideList.json?applyType=2&pageNum={currentPage}&numPerPage={pageSize}';
	table: any = {
		title: [{
			id: 'id',
			name: 'id',
			width: "15%"
		}, {
			id: 'productName',
			name: '产品名称',
			width: "12%"
		}, {
			id: 'createdName',
			name: '添加人',
			width: "5%"
		}, {
			id: 'createdTime',
			name: '添加时间',
			type: 'date',
			width: "12%"
		}, {
			id: 'status',
			name: '审核状态',
			width: "8%"
		}, {
			id: 'auditName',
			name: '审核人',
			width: "5%"
		}, {
			id: 'auditTime',
			name: '审核时间',
			type: 'date',
			width: "10%"
		}, {
			id: 'formulation',
			name: '剂型',
			width: "10%"
		}, {
			id: 'chinesespecification',
			name: '规格',
			width: "10%"
		}, {
			id: 'chinesemanufacturename',
			name: '生产企业',
			width: "13%"
		}],
		pageSize: 10,
		url: "/api/v1/drugGuideList.json?applyType=2&pageNum={currentPage}&numPerPage={pageSize}",
		dataListPath: "recordList",
		itemCountPath: "recordCount"
	};

	constructor(
		private router: Router,
		private guideListService: GuideListService,
		private userService: UserService
	) { }

	ngOnInit() {
		this.reloadHistory();
	}

	reloadHistory(){
		if(!sessionStorage.getItem('product_guide_pagination') && !sessionStorage.getItem('product_guide_searchParams')){
			this.search();
			return;
		};

		let pagination:any = sessionStorage.getItem('product_guide_pagination');
		this.searchParams = sessionStorage.getItem('product_guide_searchParams');
	
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

	addProductGuide() {
		// let link = ['data_management/patient_guide/product_guide/add_product_guide'];
		// this.router.navigate(link);
		this.isShowDialog = true;
	}

	// getProductGuideList() {
	// 	this.guideListService.getGuideList(this.applyType, this.currentPage, this.table.pageSize)
	// 		.then(productGuideLists => {
	// 			this.table.totalPage = productGuideLists.totalPage;
	// 			this.table.tbody = productGuideLists.patientDrugGuideDtoList;
	// 		},
	// 		error => this.error = error
	// 		);
	// }

	// onClick($event: any) {
	// 	this.selectedProductList = $event;
	// }

	clearSelect() {
		this.selectedProductList = null;
	}
	delete() {
		this.dialogPlugin.confirm("确定要删除吗？", () => {
			this.deleteFromProductGuideList();
		}, () => { });
	}

	//删除表中数据
	deleteFromProductGuideList() {
		this.guideListService.deleteFromGuideList(this.selectedProductList, this.applyType)
			.then(ProductGuideLists => {
				this.tablePlugin.loadDataByUrl();
				this.dialogPlugin.tip("删除成功");
				this.selectedProductList = null;
			},
			error => this.error = error
			);
	}

	//点击修改，跳转页面
	gotoDetail(isStatus: boolean) {
		let link = ['data_management/patient_guide/product_guide/product_list_detail',
			this.selectedProductList.productName,
			this.selectedProductList.productId,
			isStatus];
			
		this.router.navigate(link);
	}

	// 双击数据行 - 修改：产品相关指导列表
	editProductGuide(trow: any) {
		let link = ['data_management/patient_guide/product_guide/product_list_detail',
			trow.productName,
			trow.productId,	
			false];
		
		this.router.navigate(link);
	}

	search(isSearch?: boolean) {
		let tempUrl = this.drugGuideListUrl;
		// if ((!this.guideListService.productName) && (!this.guideListService.createdByProduct) && (!this.guideListService.auditByProduct) && (!this.guideListService.statusProduct)) {
		// 	this.table.url = this.drugGuideListUrl;
		// 	this.guideListService.searchProductStatus = 0;
		// 	this.tablePlugin.loadDataByUrl(this.table.url, true);
		// 	return;
		// }
		// if (this.guideListService.productName) {
		// 	tempUrl = tempUrl + "&name=" + this.guideListService.productName;
		// 	this.guideListService.searchProductStatus = 1;
		// }
		// if (this.guideListService.createdByProduct) {
		// 	tempUrl = tempUrl + "&createdBy=" + this.guideListService.createdByProduct;
		// 	this.guideListService.searchProductStatus = 1;
		// }
		// if (this.guideListService.auditByProduct) {
		// 	tempUrl = tempUrl + "&auditBy=" + this.guideListService.auditByProduct;
		// 	this.guideListService.searchProductStatus = 1;
		// }
		// if (this.guideListService.statusProduct) {
		// 	tempUrl = tempUrl + "&status=" + this.guideListService.statusProduct;
		// 	this.guideListService.searchProductStatus = 1;
		// }
		// this.table.url = tempUrl;

		for(let attr in this.searchParams){
            if (this.searchParams[attr]) {
				tempUrl += `&${attr}=${this.searchParams[attr]}`;
			}
        }
		//每次搜索后更新sessionStorage中保存搜索条件对象
		sessionStorage.setItem('product_guide_searchParams', JSON.stringify(this.searchParams));
				
		this.tablePlugin.loadDataByUrl(tempUrl, isSearch);
	}
	
	getPagination($event: any){
		sessionStorage.setItem('product_guide_pagination', JSON.stringify($event));
	}

	/**
	 * 接收子组件的双击事件：产品列表中，选择产品后，点击确认 || 选择时双击
	 * 	来源：add_product_guide.component.html
	 *  触发：确定按钮 || 行双击事件
	 */
	onDblActivate($event: any) {
		//console.log($event);
		this.gotoProductDetail($event.chineseproductname, $event.id);
	}

	/** 
	 * 跳转至：显示产品用药相关指导的详情页面
	 */
	gotoProductDetail(nodeName: string, nodeId: string) {
		let link = ['data_management/patient_guide/product_guide/product_list_detail', nodeName, nodeId, "false"];
		this.router.navigate(link);
	}
}

