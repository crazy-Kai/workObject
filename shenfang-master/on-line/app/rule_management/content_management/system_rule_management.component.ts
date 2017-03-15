import { Component, OnInit, Input, ElementRef, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { TreeNode, TreeModel, TreeComponent } from 'angular2-tree-component';
import { DrugRuleTreeService } from './drug_rule_tree.service';
import { UserService } from '../../user.service';
import { TablePlugin } from '../../common/ug-table/table.module';

export const TREE_EVENTS = {
	onToggle: 'onToggle',
	onActiveChanged: 'onActiveChanged',
	onActivate: 'onActivate',
	onDeactivate: 'onDeactivate',
	onFocus: 'onFocus',
	onBlur: 'onBlur',
	onDoubleClick: 'onDoubleClick',
	onContextMenu: 'onContextMenu',
	onInitialized: 'onInitialized',
}

@Component({
	selector: 'system-rule-management',
	template: require('./system_rule_management.component.html'),
	styles: [require('./content_manegement.component.css') + ""],
	providers: [DrugRuleTreeService]
})
export class SystemRuleManagementComponent implements OnInit {
	nodes: TreeNode;
	drugRuleTree: TreeNode;
	error: any;
	sysRuleUrl = '/designer/editor.action?ruleType=0&name=';
	userRuleUrl = '/designer/editor.action?ruleType=1&isIpharmacareRule=false&name=';
	iphRuleUrl = '/designer/create_ipharmacare_rule.action?ruleType=0&name=';
	drugSuggestionAPI: string = "/api/v1/drugSuggestion"; //药品名称检索输入框的自动提示
	productSuggestionAPI: string = '/api/v1/productSuggestion'; //产品检索输入框的自动提示
	
	name: string;
	status: string = "";

	formulation: string = "";
	sysRuleStatus: string = "";
	drugCode: string = "";
	productName: string = "";
	producerName: string = "";
	@ViewChild(TablePlugin) tablePlugin: TablePlugin;
	@ViewChild(TreeComponent)
	private tree: TreeComponent;
	table: any = {
		title: [
			{
				id:'id',
				name:'产品Id'
			},
			{
				id: 'chineseproductname',
				name: '通用名称'
			},
			{
				id: 'chinesemanufacturename',
				name: '生产厂家'
			}, {
				id: 'dictformulation',
				name: '字典剂型'
			}, {
				id: 'formulation',
				name: '产品剂型'
			}, {
				id: 'chinesespecification',
				name: '规格'
			},{
				id:'sysRuleStatus',
				name:'审核状态'
			}, {
				id: 'rule',
				name: '规则'
			}],
		pageSize: 20,
		url: "/api/v1/productRuleInfo?numPerPage={pageSize}&pageNum={currentPage}",
		dataListPath: "recordList",
		itemCountPath: "recordCount"
	};
	statusList:string[] = ['已审核','未定义','未审核','编辑中']
	clickProduct($event: any) {
		console.dirxml(event);
	}
	searchProduct() {
		let tempUrl = "/api/v1/productRuleInfo?numPerPage={pageSize}&pageNum={currentPage}";
		if (this.producerName != "")
			tempUrl += "&factory=" + this.producerName;
		if (this.productName != "")
			tempUrl += "&chineseProductName=" + this.productName;
		if (this.drugCode != "")
			tempUrl += "&drugCode=" + this.drugCode;
		if (this.formulation != "")
			tempUrl += "&formulation=" + this.formulation;
		if (this.sysRuleStatus != "")
			tempUrl += "&sysRuleStatus=" + this.sysRuleStatus;
		this.table.url = tempUrl;
		this.tablePlugin.loadDataByUrl(this.table.url, true);
	}
	chooseDrug(drugCode: string) {
		let tempUrl = "/api/v1/productRuleInfo?numPerPage={pageSize}&pageNum=1&drugCode=" + drugCode;
		this.drugCode = drugCode;
		this.producerName = "";
		this.productName = "";
		this.formulation = "";
		this.sysRuleStatus = "";
		this.table.url = tempUrl;
		this.tablePlugin.loadDataByUrl(this.table.url);
	}

	constructor(
		private drugRuleTreeService: DrugRuleTreeService,
		private router: Router,
		private elementRef: ElementRef,
		private userService: UserService) { }

	ngOnInit() {
		this.getDrugRuleTree();
	}


	getDrugRuleTree() {
		this.drugRuleTreeService.getDrugRuleTree()
			.then(drugRuleTree => {
				this.drugRuleTree = drugRuleTree;
				this.nodes = this.drugRuleTree;
			},
			error => this.error = <any>error);
	}

	getChildren($event: any): any {
		if (!this.drugRuleTreeService.isEmptyObject($event.node.data.children)) {
			return;
		}
		return new Promise(resolve => {
			this.drugRuleTreeService.getChildrenByCode($event.node.data.code)
				.then(children => {
					$event.node.data.children = children;
					this.tree.treeModel.update();
				},
				error => this.error = <any>error
				)
		});
	};

	nodes2 = [
    {
      id:1,
      expand: true,
      title: 'root expanded',
      subTitle: 'the root',
      children: [
        {
          id: 2,
          title: 'child1',
          subTitle: 'a good child',
          hasChildren: false
        }, {
          id: 3,
          title: 'child2',
          subTitle: 'a bad child',
          hasChildren: false
        }
      ]
    }
  ];

	customTemplateStringOptions = {
		getChildren: this.getChildren.bind(this),
		idField: "uuid",
		isExpandedField: 'expand',
		displayField:'title'
	}

	openSysRuleUrl(url: string, key: string) {
		url += encodeURIComponent(key);
		window.open(url);
	}

	/**
	 * 药品名称检索输入框的回车事件
	 */
	private searchInputEntered() : void {
		this.search();
	}

	search() {
		this.drugRuleTreeService.searchRuleTree(this.name || "", this.status)
			.then(result => {
				if (result != null) {
					this.setExpanded(result);
					this.drugRuleTree = result;
				}

			},
			error => this.error = <any>error
			);
	}

	setExpanded(arr: any[]) {
		for (let i = 0; i < arr.length; i++) {
			if (arr[i].expand){
				// console.log(this.tree.treeModel.expandedNodeIds)
				this.tree.treeModel.expandedNodeIds[arr[i].uuid] = true;
			}
				
			if (arr[i].hasChildren)
				this.setExpanded(arr[i].children);
		}
	}
}



