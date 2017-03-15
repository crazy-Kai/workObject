/***疾病分类管理
 * @Auther anwen
 */
import { Component, OnInit, ViewChild } from '@angular/core';

import { UserService } from '../../user.service';
import { SearchService } from '../../search.service';
import { DictionaryService } from '../../data_management/patient_guide/dictionary.service';

import { TreeComponent, TreeNode } from 'angular2-tree-component';
import { DialogPlugin } from '../../common/ug-dialog/dialog';

@Component({
	selector: 'disease-sort-management',
	template: require('./disease_sort_management.component.html'),
	providers: [
		DictionaryService
	]
})
export class DiseaseSortManagementComponent implements OnInit {
	diseaseNodes: any[] = [
		// {
		// 	id: -3,
		// 	name: '疾病分类',
		// 	isExpanded: true,
		// 	children: [
		{
			id: -2,
			isExpanded: true,
			code: "sys_diagnose",
			pid: null,
			name: "诊断(ICD10)",
			dictValue: "诊断(ICD10)",
			remark: "诊断(ICD10)",
			hasChildren: true
		},
		{
			id: -1,
			isExpanded: true,
			code: "sys_dictcate_zybz",
			pid: null,
			name: "中医病证",
			dictValue: "中医病证",
			modifyUser: "保娇",
			remark: "中医病证",
			hasChildren: true
		}
		// 	]
		// }
	]; //字典节点，存放完整的节点
	searchNodes: any[];//搜索节点
	nodes: any[] = this.diseaseNodes;//显示节点
	error: any;
	diseaseData: any = {};
	isAddCategory: boolean = false; //是否是添加子分类
	// isReadonly:boolean = false; //控制编号可修改
	currentNode: TreeNode;
	private CODE_ICD10 = 'sys_diagnose';//西医诊断分类代码
	private CODE_DISEASE_OF_TCM = 'sys_dictcate_zybz';//中医病症分类代码，TCM=Traditional Chinese Medicine

	@ViewChild(TreeComponent)
	private tree: TreeComponent;
	@ViewChild(DialogPlugin) dialogPlugin: DialogPlugin

	constructor(
		private userService: UserService,
		private dictionaryService: DictionaryService,
		private searchService: SearchService) { }

	ngOnInit() {
		this.getDictionaryByCategory(this.CODE_ICD10, -2);
		this.getDictionaryByCategory(this.CODE_DISEASE_OF_TCM, -1);
	}

	getDictionaryByCategory(category: string, parentNodeId: number) {
		this.dictionaryService.getChildrenByCode(category)
			.then(result => {
				// this.diseaseNodes[0].children[parentNodeId + 2].children = result;
				this.diseaseNodes[parentNodeId + 2].children = result;
				this.nodes = this.diseaseNodes;
				this.tree.treeModel.update();
			}, error => this.error = <any>error);
	}

	getChildren(node: any) {
		return this.dictionaryService.getChildrenByNode(node.data);
	}

	options = {
		getChildren: this.getChildren.bind(this),
		idField:'uuid',
		isExpandedField: 'isExpanded'
	}

	onClickDictionaryData($event: any) {
		let node = $event.node.data;
		this.isAddCategory = false;
		this.diseaseData = node;
		this.currentNode = $event.node;
	}

	//添加子分类
	addChildCategory() {
		// if (this.diseaseData.id == -3) {
		// 	//表示为“疾病分类”节点
		// 	this.dialogPlugin.tip('不支持该层级添加子分类');
		// 	return;
		// }
		if (this.dictionaryService.isEmptyObject(this.diseaseData)) {
			this.dialogPlugin.tip('请选择父分类');
			return;
		}
		this.isAddCategory = true; //是否是添加子分类
		let code = this.diseaseData.code;
		let id = this.diseaseData.id;
		let categoryCode = this.diseaseData.categoryCode;
		let pcode = this.diseaseData.pcode;
		this.diseaseData = {};
		this.diseaseData.id = id;
		if (categoryCode) {
			this.diseaseData.pcode = pcode;
			this.diseaseData.categoryCode = categoryCode;
			this.diseaseData.oldCode = code;
		}
		else {
			//categoryCode不存在，表示是字典分类节点
			this.diseaseData.categoryCode = code;
			this.diseaseData.pcode = '';
			this.diseaseData.oldCold = '';
		}
		this.diseaseData.addChildren = true;
	}

	/***
	 * 添加子分类时选择“兄弟”为层级关系
	 */
	clickBrother() {
		if (this.diseaseData.id == -2 || this.diseaseData.id == -1) {
			//表示为"中西医诊断"节点
			this.dialogPlugin.tip("不支持该层级的添加子分类");
			this.diseaseData.addChildren = true;
			return false;
		}
		this.diseaseData.addChildren = false;
		return true;
	}

	//搜索两个字典，并挂在相应的树下
	search() {
		if (!this.searchService.diseaseCategoryName)
		{ this.nodes = this.diseaseNodes; }
		else {
			let keyWord = this.searchService.diseaseCategoryName.replace('+', '%2B');
			this.searchNodes = [];
			this.dictionaryService.searchByValue(this.CODE_DISEASE_OF_TCM, keyWord)
				.then(res => {
					if (!this.dictionaryService.isEmptyObject(res)) {
						for (let j = 0; j < res.length; j++)
							this.searchNodes.push(res[j]);
					}
					this.setExpanded(this.searchNodes);
					this.nodes = this.searchNodes;
					this.tree.treeModel.update();
				}, error => this.error = <any>error);
			this.dictionaryService.searchByValue(this.CODE_ICD10, keyWord)
				.then(res => {
					if (!this.dictionaryService.isEmptyObject(res)) {
						for (let j = 0; j < res.length; j++)
							this.searchNodes.push(res[j]);
					}
					this.setExpanded(this.searchNodes);
					this.nodes = this.searchNodes;
					this.tree.treeModel.update();
				}, error => this.error = <any>error);
		}
	}

	//保存
	saveDisease() {
		if (this.isAddCategory)
			this.saveChildCategory();
		else {
			this.putDiseaseData();
		}
	}

	//保存子分类
	saveChildCategory() {
		this.dictionaryService.dictionaryDataAdd(this.diseaseData)
			.then(dictionaryCategory => {
				this.dialogPlugin.tip(dictionaryCategory.message);
				if (dictionaryCategory.code == '200') this.addNode(dictionaryCategory.data);
			},
			error => this.error = <any>error);
	}

	//修改字典值
	putDiseaseData() {
		this.dictionaryService.dictionaryDataModify(this.diseaseData)
			.then(res => {
				this.dialogPlugin.tip(res.message);
				if(res.code==200) this.ngOnInit();
			}, error => this.error = <any>error);
	}

	delete() {
		let message: string;
		if (this.diseaseData.id < 0) {
			this.dialogPlugin.tip("该节点不允许被删除");
			return;
		}
		if (this.diseaseData.hasChildren) {
			message = '该分类下有子分类，是否确认一并删除？';
		} else {
			message = '是否确认删除该子分类？';


		}
		this.dialogPlugin.confirm(message, () => {
			this.dictionaryService.dictionaryDataDelete(this.diseaseData)
				.then(res => {
					this.dialogPlugin.tip(res.message);
					if (res.code == 200)
						this.deleteNode();
				}, error => this.error = <any>error);
		}, () => { });

	}

	/***
	 * 树节点的动态操作
	 */
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
			this.nodes.push(node);
		else {
			if (this.diseaseData.addChildren) {
				//添加下级
				if (this.currentNode.data.children)
					this.currentNode.data.children.push(node);//children已经加载出来
				else {
					if (!this.currentNode.data.hasChildren) {
						this.currentNode.data.hasChildren = true;
						this.currentNode.data.children = new Array<any>();
						this.currentNode.data.children.push(node);
					}
				}
			} else {
				//添加兄弟
				this.currentNode.parent.data.children.push(node);
			}

		}

		this.tree.treeModel.update();
	}

	//设置搜索展开
	setExpanded(arr: any[]) {
		for (let i = 0; i < arr.length; i++) {
			if (arr[i].isExpanded)
				this.tree.treeModel.expandedNodeIds[arr[i].uuid] = true;
			if (arr[i].hasChildren && (arr[i].children && arr[i].children.length > 0))
				this.setExpanded(arr[i].children);
		}
	}
}




