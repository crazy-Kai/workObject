import { Component, OnInit, OnChanges, ViewChild, ElementRef } from '@angular/core';
import { Location, PathLocationStrategy, LocationChangeListener } from '@angular/common';
import { Router } from '@angular/router';
import { TablePlugin } from '../../common/ug-table/table.module';
import { UserService } from '../../user.service';
import { DictionaryService } from '../../data_management/patient_guide/dictionary.service';
import { ProductManageService } from './product.service';

class productInfo {
	id: string;
	chineseproductname: string;
	goodsname: string;
	drugcategoryname: string;
	dictformulation: string;
	formulation: string;
	status: number;
	chinesespecification: string;
	transspecification: string;
	enspecunit: string;
	specquantity: number;
	chinesemanufacturename: string;
	prepunit: string;
	packagespec: string;
	packageunit: string;
	convertpercent: number;
	ddd: number;
	dddunit: string;
	createdate: string;
	modifyuser: string;
	modifydate: string;

}
class SearchQuery {
	productName: string;					//id/名称
	manufactureName: string;				//生产厂家
	drugRootCode: string;					//知识分类  001 002 003, etc
	//categoryState = 0;						//是否比对0:全部 1：已比对 2：未比对
	status = 0;								//0:全部 1:启用 2：禁用
	formulation: string;					//剂型
	specification: string;					//规格
	productType = 0;						//产品类别 
	//产品属性
	chooseDrugPropertyDictCodes: string;		//产品属性code，用@@@分隔	用于后端接口
	//chooseDrugPropertyDictName:string;	//产品属性Name，用@@@分隔   用于前端显示
	instructionStatus = 0;					//映射关系   0 =>全部   1 => 有映射  2 => 无映射
}
@Component({
	selector: 'product-management',
	template: require('./product_management.component.html'),
	styles: [require('./product.css') + ""],
	providers: [
		DictionaryService,
		ProductManageService,
		PathLocationStrategy
	]
})

export class ProductManagementComponent implements OnInit {

	searchQuery: SearchQuery = new SearchQuery();
	chooseDrugPropertyDictName: string;

	productSuggestionAPI: string = this.productManageService.productSuggestionAPI;
	producerSuggestionAPI: string = this.productManageService.producerSuggestionAPI;
	
	productList: any[];
	isAddDrugDialog: boolean = false;				//是否显示产品属性选择
	//isInsMapDialog: boolean = false;				//是否显示产品映射说明书
	insMap: any;									//当前选中产品的映射说明书
	propertyCode = 'sys_dictcate_shux';
	propertyGroup: any;//分类属性树
	DRUG_ID = "0013921000";
	checkArr: any[];//产品属性中选中的列表
	checkedCodes: any[] = [];

	error: any;
	selectedProduct: productInfo;

	//要进入详情操作的元素
	handler: string;
	productId: string;
	operate: boolean;

	@ViewChild(TablePlugin) tablePlugin: TablePlugin
	@ViewChild('tableHeader') tableHeader: ElementRef;
	@ViewChild('tableContent') tableContent: ElementRef;
	tableWidth: string;
	options: any = {
		isLink: false,
		options: {
			getChildren: this.getTreeChildren.bind(this),
			idField: 'uuid'
		}
	};
	constructor(
		private router: Router,
		private userService: UserService,
		private dictionaryService: DictionaryService,
		private productManageService: ProductManageService,
		private pathLocationStrategy: PathLocationStrategy
	) { }

	ngOnInit() {
		this.search();
		this.getPropertyTree();

		this.pathLocationStrategy.onPopState(() => {
			this.handler = undefined;
			this.search();
		});
	}

	// ngAfterViewChecked(){
	// 	console.log(this.tableHeader)
	// 	console.log(this.tableHeader.nativeElement.offsetWidth)
	// 	console.log(this.tableContent)
	// 	this.tableWidth = this.tableHeader.nativeElement.offsetWidth + 'px';
	// }

	/**
	 * 检索表头的回车事件
	 */
	private searchInputEntered(): void {
		this.search(true);
	}

	search(isSearch?: boolean) {
		if (isSearch) this.currentPage = 1;

		let paramStr = this.serializeQuery();

		this.productManageService.getProduct(paramStr)
			.then(res => {
				console.log(res)
				this.productList = res.data.productDtos;
				this.totalPageCount = res.data.pageBreaker.pageCount;
				this.totalCount = res.data.pageBreaker.totalCount;
			});

	}
	//重置搜索条件
	resetAll() {
		this.searchQuery = new SearchQuery();
		this.chooseDrugPropertyDictName = "";
	}
	/**
	 * 产品属性选择
	 */
	addFlArtt() {
		this.isAddDrugDialog = true;
	}
	onDrugClose() {
		this.isAddDrugDialog = false;
		//this.chooseDrugPropertyDictCodes = "";
		//this.chooseDrugPropertyDictName = "";
	}
	getCheckedNode($event: any) {
		this.searchQuery.chooseDrugPropertyDictCodes = "";
		this.chooseDrugPropertyDictName = "";
		for (let i = 0; i < $event.length; i++) {
			if (!$event[i].ignore) {
				this.searchQuery.chooseDrugPropertyDictCodes += $event[i].code + "@@@";
				this.chooseDrugPropertyDictName += $event[i].name + ",";
			}
		}
	}
	//参数序列化
	serializeQuery() {
		let paramStr = `numPerPage=${this.pageSize}&pageNum=${this.currentPage}`;

		for (let attr in this.searchQuery) {
			if (this.searchQuery[attr]) {
				paramStr += `&${attr}=${this.searchQuery[attr]}`;
			}
		}

		return paramStr;
	}

	onClick($event: any) {
		this.selectedProduct = $event;
	}
	//修改
	// gotoDetail(pro:any, isUpdate:boolean) {
	// 	let link = ['drug_management/drug_data/product_management/product_detail', pro.id, isUpdate];
	// 	this.router.navigate(link);
	// }
	//编辑或者查看
	gotoDetail(pro: any, isUpdate: boolean) {	//修改
		// if(!this.instruction){
		// 	this.dialogPlugin.tip("请选择一条数据");
		// 	return;
		// }
		// this.handler = "modify";
		this.handler = isUpdate ? 'modify' : 'review';

		this.productId = pro.id;
		this.operate = isUpdate;
		this.pathLocationStrategy.pushState({ "handle": "modify" }, "", "drug_management/drug_data/product_management/product_detail" + pro.id + "/" + isUpdate, "");
	}
	//编辑或者查看后返回
	complete($event: any) {
		console.log($event)
	}
	//产品导入
	gotoImport() {
		let link = ['drug_management/drug_data/product_management/product_update'];
		this.router.navigate(link);
	}
	//查看维护日志
	gotoMaintainLogs() {
		let link = ['drug_management/drug_data/product_management/maintain_logs'];
		this.router.navigate(link);
	}
	//查看说明书映射
	showInsMap($event: any) {
		if (!$event.instructionId) return;

		this.insMap = $event;
	}
	//展开详情
	getDetail(pro: any) {
		this.productManageService.getProductInfo(pro.id)
			.then(res => {
				console.log(res)
				pro.extraInfo = res;
			})
	}


	getPropertyTree() {
		this.dictionaryService.getChildrenByCode(this.propertyCode)
			.then(propertyGroup => {
				this.propertyGroup = propertyGroup;
				for (let i = 0; i < propertyGroup.length; i++) {
					for (let j = 0; j < this.checkedCodes.length; j++) {
						if (propertyGroup[i].code == this.checkedCodes[j]) {
							propertyGroup[i].checked = true;
						}
					}
				}
			},
			error => this.error = error);
	}

	getTreeChildren(node: any): any {
		// return this.dictionaryService.getChildrenByNode(node.data);
		return new Promise((resolve, reject) => {
			resolve(this.dictionaryService.getChildrenByNode(node.data)
				.then(result => {
					for (let i = 0; i < result.length; i++) {
						for (let j = 0; j < this.checkedCodes.length; j++) {
							if (result[i].code == this.checkedCodes[j]) {
								result[i].checked = true;
							}
						}
					}
					return result;
				}));
		});
	}

	/**
	 * test on select from directive of autocomplete
	 * @param event 
	 */
	private producerSelect(result: any): void {
		this.searchQuery.manufactureName = result.name;
	}

	/**
	 * 分页模块 
	 * # 此处为临时处理, 所以变量夜放在此处 #
	 * # 后期将整合进翻页组件 #
	 */
	pageSize: number = 20;				//单页条数
	currentPage: number = 1; 			//当前页
	totalPageCount: number; 			//总页数
	totalCount: number;					//总条数
	//改变pagesize
	onChangePageSize() {

	}
	firstPage() {
		this.currentPage = 1;
		this.search();
	}
	lastPage() {
		this.currentPage = this.totalPageCount;
		this.search();
	}
	prePage() {
		this.currentPage--;
		this.search();
	}
	nextPage() {
		this.currentPage++;
		this.search();
	}
	/**
	 * 分页模块结束
	 */
}
