// 添加产品相关指导获得产品列表

import { Component, OnInit, IterableDiffers, DoCheck, ViewChild, Output, EventEmitter, Input } from '@angular/core';
import { Router } from '@angular/router';
import { ProductService } from './product_list.service';
import { ProductListDetailComponent } from './product_list_detail.component';
//引入插件
import { DialogPlugin } from '../../common/ug-dialog/dialog.plugin';
import { TablePlugin } from '../../common/ug-table/table.module';
import { UserService } from '../../user.service';

@Component({
	selector: 'add_product_guide',
	template: require('./add_product_guide.component.html'),
	styles: [require('./patient_guide.component.css') + ""],
	providers: [
		ProductService
	]
})
export class AddProductGuideComponent {
	error: any;
	children: any[];
	differ: any;
	productName: string = "";
	producerName: string = "";
	selectedProduct: any;
	currentPage: number;
	@Input() isGuideList: boolean;
	@ViewChild(DialogPlugin) dialogPlugin: DialogPlugin;
	@ViewChild(TablePlugin) tablePlugin: TablePlugin;
	productInfoUrl = "/api/v1/productList.json?numPerPage={pageSize}&pageNum={currentPage}";
	table: any = {
		title: [{
			id: 'chineseproductname',
			name: '通用名称'
		},
		{
			id: 'goodsname',
			name: '产品名称'
		}, {
			id: 'chinesemanufacturename',
			name: '生产厂家'
		}, {
			id: 'chinesespecification',
			name: '规格'
		}],
		pageSize: 20,
		url: "/api/v1/productList.json?numPerPage={pageSize}&pageNum={currentPage}",
		dataListPath: "recordList",
		itemCountPath: "recordCount",
		totalPagePath: "pageCount"
	};
	tableGuideList: any = {
		title: [{
			id: 'productName',
			name: '产品名称'
		}, {
			id: 'drugId',
			name: '药品ID'
		}, {
			id: 'createdName',
			name: '添加人'
		}, {
			id: 'createdTime',
			name: '添加时间',
			type: 'dateY'
		}, {
			id: 'status',
			name: '审核状态'
		}, {
			id: 'auditName',
			name: '审核人'
		}, {
			id: 'auditTime',
			name: '审核时间',
			type: 'dateY'
		}, {
			id: 'formulation',
			name: '剂型'
		}, {
			id: 'chinesemanufacturename',
			name: '生产企业'
		}],
		pageSize: 20,
		url: "/api/v1/drugGuideList.json?numPerPage={pageSize}&pageNum={currentPage}&applyType=0",
		dataListPath: "recordList",
		itemCountPath: "recordCount",
		totalPagePath: "pageCount"
	};
	constructor(
		private productService: ProductService,
		private router: Router,
		private userService: UserService) {
	}

	/**
	 * 初始化：加载药品列表
	 * @invoked When: 产品相关指导 -> 添加
	 */
	ngOnInit() {
		if (this.isGuideList) {
			this.productInfoUrl = "/api/v1/drugGuideList.json?numPerPage={pageSize}&pageNum={currentPage}&applyType=0"
			this.table = this.tableGuideList;
		}
	}

	@Output() onDblActivate: EventEmitter<any> = new EventEmitter();
	@Output() onClose: EventEmitter<any> = new EventEmitter();

	search() {
		let tempUrl = this.productInfoUrl;
		if ((!this.productName) && (!this.producerName)) {
			this.table.url = this.productInfoUrl;
			this.tablePlugin.loadDataByUrl(this.table.url, true);
			return;
		}
		if (this.productName) {
			if (this.isGuideList) tempUrl = tempUrl + "&name=" + this.productName;
			else tempUrl = tempUrl + "&productName=" + this.productName;
		}
		if (this.producerName) {
			tempUrl = tempUrl + "&producerName=" + this.producerName;
		}
		this.table.url = tempUrl;
		this.tablePlugin.loadDataByUrl(this.table.url, true);
	}

	onDblClick($event: any) {
		this.selectedProduct = $event;
		this.onDblActivate.emit($event);
	}

	/**
	 * 添加产品相关指导时，产品列表中，选择产品后，点击确认，触发双击事件，发送给父组件去接收
	 */
	addProduct() {
		this.onDblActivate.emit(this.selectedProduct);
	}

	getCurrentPage($event: any) {
		this.currentPage = $event;
	}

	onClick($event: any) {
		this.selectedProduct = $event;
	}

	close() {
		this.onClose.emit(null);
	}

}