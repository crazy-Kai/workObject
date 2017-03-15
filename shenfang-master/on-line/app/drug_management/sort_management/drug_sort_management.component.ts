import { Component, OnInit, IterableDiffers, DoCheck, Input, ViewChild, ViewChildren, Output, EventEmitter } from '@angular/core';
import { TreeNode, TreeComponent } from 'angular2-tree-component';

import { Router } from '@angular/router';
import { DrugService } from '../../data_management/patient_guide/drug_tree.service';
import { DictionaryService } from '../../data_management/patient_guide/dictionary.service';
import { DrugTreeDetailComponent } from '../../data_management/patient_guide/drug_tree_detail.component';
import { Pharmacokinetics } from '../drug_data/product_detail';
import { PharmacokineticsDto } from '../drug_data/product_detail';
import { AddProductComponent } from './add_product.component';
import { AddDrugComponent } from './add_drug.component';
//引入插件
import { DialogPlugin, DialogModel } from '../../common/ug-dialog/dialog';
import { TablePlugin } from '../../common/ug-table/table.module';
import { UserService } from '../../user.service';



class FormDto {
	chooseDrugPropertyDictCodes: string;
	chooseDrugPropertyDictName: string;
	oldId: string;
	multiDrugParentId: string;
	drugDto: any;
}

class DrugInfo {
	ypmc: string;
	flmc: string;
	flmcId: string;
	ddd: number;
	dddUnit: string;
	status: string;
	userId: string;
	confirmUserId: string;
}

@Component({
	selector: 'drug-sort-management',
	template: require('./drug_sort_management.component.html'),
	providers: [
		DrugService,
		DictionaryService
	]

})
export class DrugSortComponent implements OnInit {
	drugGroup: any;
	tmpDrugGroup: any;
	error: any;
	searchText: string;
	searchDrugText: string;
	searchDrugName: string; //弹框中搜索用的
	drugForm: any;
	drugRoot = new DrugInfo();
	drugFromChild: any;
	isShow = false;
	oldId: string;
	formDto = new FormDto();
	checkArr: any[] = [];//功能分类中选中的列表
	isAddProductDialog: boolean = false;//false未不弹出弹出框
	isAddDrugDialog: boolean = false;//false未不弹出弹出框
	productName: string;
	checkedCodes: any[] = [];
	drugSuggestionAPI: string = "/api/v1/drugSuggestion"; //产品规则检索的自动建议

	@ViewChild(DialogPlugin) dialogPlugin: DialogPlugin;
	@ViewChild(TablePlugin) tablePlugin: TablePlugin;
	titleProduct = '产品映射-添加产品';
	options: any = {
		options: {
			getChildren: this.getTreeChildren.bind(this),

		},
		title: '药品分类信息-分类属性'
	};
	DRUG_ID = "0013921000";
	drugId: string;
	flmc: string;
	flmcId: string;
	isCopy = false;//true-拷贝添加，false-选择分类名称
	selectedTab = 1;
	propertyGroup: any;//分类属性树
	propertyCode = 'sys_dictcate_shux';
	drugNodes: any[] = [];
	selectedDrug: any;
	table: any = {
		title: [{
			type: 'checkbox'
		}, {
			id: 'id',
			name: '产品Id'
		}, {
			id: 'chineseproductname',
			name: '通用名称'
		}, {
			id: 'dictformulation',
			name: '字典剂型'
		}, {
			id: 'formulation',
			name: '产品剂型'
		}, {
			id: 'chinesemanufacturename',
			name: '生产厂家'
		}, {
			id: 'chinesespecification',
			name: '规格'
		}],
		pageSize: 20,
		dataListPath: "products/recordList",
		itemCountPath: 'products/recordCount'
	};
	@ViewChild('tree')
	private tree: TreeComponent;

	@ViewChild('treeInDialog')
	private treeInDialog: TreeComponent;
	
	@ViewChildren(TreeComponent) elements:any;
	@ViewChild('dialogTemplate')
	private test: any;
	
	ngAfterViewInit() {
		console.log(this.tree);
		console.log(this.treeInDialog);
		console.log(this.elements);
	}

	currentNode: TreeNode;

	constructor(private drugService: DrugService,
		private dictionaryService: DictionaryService,
		private userService: UserService) { }

	ngOnInit() {
		this.getDrugCategory();
		this.getPropertyTree();
		// document.addEventListener('mousedown', this.onMouseDown);
		// document.addEventListener('mouseup', this.onMouseUp);
		// document.addEventListener('mousemove', this.onMouseMove);
	}

	getChildren(node: any): any {
		return this.drugService.getChildren(node.data.id)
	}

	customTemplateStringOptions = {
		getChildren: this.getChildren.bind(this),
		idField:'id'
	}

	getDrugCategory() {
		this.drugService.getDrugCategory()
			.then(drugs => {
				this.drugGroup = drugs;
			},
			error => this.error = <any>error);
	}

	searchByDrugName() {
		if (!this.searchText) {
			this.ngOnInit();
			return;
		}
		this.drugService.searchByDrugName(this.searchText)
			.then(drugGroup => {
				this.setExpanded(drugGroup);
				this.drugGroup = drugGroup;
			},
			error => this.error = <any>error);
	}

	/** 搜索输入框的回车事件 */
	private searchInputEntered() : void {
		this.searchByDrugName();
	}

	getDrugDetail($event: any) {
		this.selectedTab = 1;
		this.currentNode = $event.node;
		this.drugService.flmc = $event.node.parent.data.name || '规则';
		this.drugService.flmcId = typeof ($event.node.parent.data.id) == 'string' ? $event.node.parent.data.id : null;
		this.drugService.targetId = $event.node.data.id;
		this.drugService.ypmc = $event.node.data.name;
		this.drugService.getDrugFormInfo($event.node.data.id)
			.then(drugform => {
				this.drugForm = drugform;
				this.isShow = true;
				this.oldId = $event.node.data.id;
				this.table.url = "/api/v1/drugForm.json?id=" + this.drugForm.drug.id + '&pageNum={currentPage}&numPerPage={pageSize}';
				this.drugForm.drugPropertyDictValues = drugform.drugPropertyDictValues;
					//drugform.drug.property;	//修复UI:显示属性字典值,而非code
				if (this.drugForm.drugPropertyDictCodes)
					this.checkedCodes = this.drugForm.drugPropertyDictCodes.split("@@@");
			},
			error => this.error = <any>error);

	}


	saveDrugInfo() {
		this.formDto.drugDto = this.drugForm.drug;
		this.formDto.drugDto.flmc = this.drugService.flmc;
		this.formDto.drugDto.flmcId = this.drugService.flmcId;
		this.formDto.chooseDrugPropertyDictCodes = this.drugForm.drugPropertyDictCodes;
		this.formDto.chooseDrugPropertyDictName = this.drugForm.drugPropertyDictValues;
		this.formDto.oldId = this.oldId;
		if (this.formDto.drugDto.id) {
			this.putDrugInfo();
		} else {
			this.postDrugInfo();
		}
	}

	postDrugInfo() {
		this.drugService.postDrugInfo(this.formDto).then(result => {
			this.dialogPlugin.tip(result.message);
		},
			error => this.error = <any>error);
	}

	putDrugInfo() {
		this.drugService.putDrugInfo(this.formDto).then(result => {
			this.dialogPlugin.tip(result.message);
		},
			error => this.error = <any>error);
	}
	goToTab(tab: number) {
		if (tab === 2) {
			if (!this.drugForm) return;
			this.tablePlugin.loadDataByUrl(this.table.url);
		}
		if (tab === 3) {
			if (!this.drugForm) {
				this.dialogPlugin.tip("请选择一个药品分类");
				return false;
			}
			this.drugRoot.flmc = this.drugForm.drugName;
			this.drugRoot.flmcId = this.drugForm.drug.id;
			this.drugService.flmc = '';
			this.drugForm.drugPropertyDictCodes = '';
			this.drugForm.drugPropertyDictValues = '';
			this.drugService.flmcId = '';
		}
		this.selectedTab = tab;
	}

	deleteDrug() {
		let msg = '是否确认删除该子分类？';
		if (this.currentNode.data.hasChildren) {
			this.dialogPlugin.tip("该分类下有子分类，不允许删除");
			return;
		}
		this.dialogPlugin.confirm(msg, () => {
			this.drugService.deleteDrug()
				.then(res => {
					this.dialogPlugin.tip(res.message);
					if (res.code == 200) {
						this.deleteNode();

					}
				}, error => this.error = <any>error);
		}, () => { });

	}
	onclick($event: any) {
		// console.log($event);
		this.selectedDrug = $event;
	}

	/*****
	 * 选择父分类名称
	 * 
	 */
	// 选择药品
	chooseDrug() {
		this.isCopy = false;
		this.flmc = this.drugService.flmc;
		this.flmcId = this.drugService.flmcId;
		this.dialogPlugin.myDialog();
		this.getDrugCategoryById();
	}
	getDrugChildren(node: any): any {
		return this.drugService.getChildren(node.data.id);
	}
	drugTemplateStringOptions = {
		getChildren: this.getDrugChildren.bind(this),
        idField: 'id'
		// treeNodeTemplate:MyTreeNodeTemplate
	}
	getDrugCategoryById() {
		this.drugService.getChildren(this.DRUG_ID)
			.then(drug => {
				this.drugNodes = drug;
			},
			error => this.error = <any>error);
	}
	searchDrug() {
		this.searchDrugName = this.searchDrugText;
	}
	getDrugTreeNode($event: any, dialogModel: any) {
		console.dirxml($event);
		if (this.isCopy) {
			//如果是拷贝添加
			this.drugService.copyId = $event.node.data.id;
			this.drugService.copyCategory();
			dialogModel.isTemplate = false;
		} else {
			this.flmc = this.drugService.flmc;
			this.flmcId = this.drugService.flmcId;
			this.drugService.flmcId = $event.node.data.id;
			this.drugService.flmc = $event.node.data.name;
		}
	}
	onClose() {
		this.drugService.flmcId = this.flmcId;
		this.drugService.flmc = this.flmc;
		// this.dialogModel.isTemplate = false;
	}
	//选择分类属性
	addFlArtt() {
		this.isAddDrugDialog = true;

	}
	onDrugClose() {
		this.isAddDrugDialog = false;
	}
	/*****
	 * 拷贝添加
	 */
	copy() {
		this.isCopy = true;
		this.getDrugCategoryById();
		this.dialogPlugin.myDialog();
	}
	/****** 产品映射
	 * - deleteDrugProduct() 
	 *    删除药品相关映射
	 * - onCheck()
	 *    勾选checkbox触发事件
	 *    $event返回勾选中的所有行信息
	 * - addDrug()
	 *    弹出添加药品弹出框
	 * - onClose()
	 *    关闭弹框
	 */
	onCheck($event: any) {
		this.checkArr = $event;
	}

	deleteDrugProduct() {
		if (!this.selectedDrug && this.checkArr.length == 0) {
			this.dialogPlugin.tip('未选中要删除的产品');
			return;
		}

		this.dialogPlugin.confirm('确认要删除此产品吗？', () => {
			if (this.selectedDrug && this.checkArr.length == 0) {
				this.checkArr.push(this.selectedDrug);
			}
			this.drugService.deleteDrugProduct(this.checkArr, this.drugForm.drug.id)
				.then(result => {
					this.dialogPlugin.tip(result.message);
					this.tablePlugin.loadDataByUrl();
					if (result.code == 200) {
						this.selectedDrug = null;
						this.checkArr = [];
						this.tablePlugin.tableModel.checkedRowsArr = [];
					}
				}, error => this.error = <any>error);
		}, () => { });
	}

	addProduct() {
		this.isAddProductDialog = true;
	}
	onProductClose(message?: string) {
		if(message){
			this.dialogPlugin.tip(message);
		}
		this.isAddProductDialog = false;
		if (this.drugForm) {
			this.tablePlugin.loadDataByUrl();
		}
	}

	/***********点击跳出带checkbox的tree框
	 * - getCheckedNode()
	 *   获取已经勾选的数据
	 * - getPropertyTree()
	 *   获取分类属性树
	 */

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

	getCheckedNode($event: any) {
		this.drugForm.drugPropertyDictCodes = "";
		this.drugForm.drugPropertyDictValues = "";
		for (let i = 0; i < $event.length; i++) {
			this.drugForm.drugPropertyDictCodes += $event[i].code + "@@@";
			this.drugForm.drugPropertyDictValues += $event[i].name + "\n";
		}
	}

	/****保存子分类 */
	saveDrugInfoChild() {
		this.formDto.drugDto = this.drugRoot;
		this.formDto.multiDrugParentId = this.drugService.flmcId;
		this.formDto.chooseDrugPropertyDictCodes = this.drugForm.drugPropertyDictCodes;
		this.formDto.chooseDrugPropertyDictName = this.drugForm.drugPropertyDictValues;
		if (this.formDto.drugDto.id) {
			this.putDrugInfo();
		} else {
			this.postDrugInfo();
		}
	}

	deleteNode() {
		let parentNode = this.currentNode.parent;
		if (!parentNode.children) {
			console.error("There is no child in this parentNode");
			return false;
		}
		parentNode.data.children.splice(parentNode.data.children.indexOf(this.currentNode.data), 1);
		if (parentNode.data.children.length == 0)
			parentNode.data.hasChildren = false;
		this.tree.treeModel.update();
		return true;
	}


	addNode(node: any) {
		if (!node.id) node.id = node.code;
		if (!this.currentNode)
			this.drugGroup.push(node);
		else {

			if (this.currentNode.data.children)
				this.currentNode.data.children.push(node);//children已经加载出来
			else {
				if (!this.currentNode.data.hasChildren) {
					this.currentNode.data.hasChildren = true;
					this.currentNode.data.children = new Array<any>();
					this.currentNode.data.children.push(node);
				}
			}
		}
		this.tree.treeModel.update();
	}

	//设置搜索展开
    setExpanded(arr: any[]) {
		for (let i = 0; i < arr.length; i++) {
			if (arr[i].open){
				this.tree.treeModel.expandedNodeIds[arr[i].id] = true;
			}
				
			if (arr[i].hasChildren && arr[i].children)
				this.setExpanded(arr[i].children);
		}
	}
	//针对弹窗中的树
	//无法成功获取到template中的组件，需要跟进处理 http://stackoverflow.com/questions/39961933/angular2-viewchild-in-template
	setExpanded2(arr: any[]) {
		// for (let i = 0; i < arr.length; i++) {
		// 	if (arr[i].open){
		// 		console.dirxml(this.treeInDialog);
		// 		this.treeInDialog.treeModel.expandedNodeIds[arr[i].id] = true;
		// 	}
				
		// 	if (arr[i].hasChildren && arr[i].children)
		// 		this.setExpanded(arr[i].children);
		// }
	}
	
}



