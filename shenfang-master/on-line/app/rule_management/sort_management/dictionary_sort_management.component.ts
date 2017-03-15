import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';

import { DictionaryService } from '../../data_management/patient_guide/dictionary.service';
import { DictionaryCategory } from '../../data_management/patient_guide/dictionary.service';
import { Http, Response } from '@angular/http';
import { Headers, RequestOptions } from '@angular/http';
//引入插件
import { DialogPlugin } from '../../common/ug-dialog/dialog.plugin';
import { UserService } from '../../user.service';
import { TreeComponent, TreeNode } from 'angular2-tree-component';

@Component({
	selector: 'dictionary-sort-management',
	template: require('./dictionary_sort_management.component.html'),
	providers: [
		DictionaryService
	]
})



export class DictionarySortManagementComponent implements OnInit {
	dictionaryGroup: any;
	error: any;
	name: string;
	dictionaryCategory = new DictionaryCategory();
	@ViewChild(DialogPlugin) dialogPlugin: DialogPlugin;
	@ViewChild(TreeComponent) tree: TreeComponent;
	currentNode: TreeNode;

	constructor(
		private router: Router,
		private dictionaryService: DictionaryService,
		private userService: UserService
	) { }


	ngOnInit() {
		this.getDictionaryGroup();
	}

	getDictionaryGroup() {
		this.dictionaryService.findDictionaryCategory()
			.then(result => this.dictionaryGroup = result,
			error => this.error = error);
	}


	getChildren(node: any) {
		return this.dictionaryService.getDictionaryCategoryChildrenByPid(node.data);
	}

	options = {
		getChildren: this.getChildren.bind(this),
		idField: 'uuid'
	}

	search_dictionary_category() {
		return this.dictionaryService.searchDictionaryCategoryByName(this.name)
			.then(result => {
				if (!this.dictionaryService.isEmptyObject(result)) {
					this.dictionaryGroup = result;
				} else {
					this.dictionaryGroup = [];
				}
			},
			error => this.error = error);
	}

	/**
	 * 检索表头的回车事件
	 */
	private searchInputEntered() : void {
		this.search_dictionary_category();
	}	

    /**
	 * 字典分类树的节点点击（选中）事件，获取节点信息并展示
	 * 
	 * @author songjy
	 * 
	 * @param $event 节点信息
	 */
	onClickDictionaryCategory($event: any) {
		this.dictionaryCategory = new DictionaryCategory();
		this.currentNode = $event.node;
		let nodeData = $event.node.data;
		this.dictionaryCategory.id = nodeData.id;
		this.dictionaryCategory.code = nodeData.code;
		this.dictionaryCategory.oldCode = nodeData.oldCode ? nodeData.oldCode : nodeData.code;
		this.dictionaryCategory.name = nodeData.name;
		this.dictionaryCategory.pid = nodeData.pid;
		this.dictionaryCategory.remark = nodeData.remark;
		this.dictionaryCategory.hasChildren = nodeData.hasChildren;
	}

	/**
	 * 字典分类添加
	 * 
	 * @author songjy
	 * 
	 */
	dictionaryCategoryAdd() {
		this.dictionaryService.dictionaryCategoryAdd(this.dictionaryCategory)
			.then(dictionaryCategory => {
				this.dialogPlugin.tip(dictionaryCategory.message);
				this.addNode(dictionaryCategory.data);
				// this.getDictionaryGroup();
			},
			error => this.error = <any>error);
	}

	/**
	 * 字典分类修改
	 * 
	 * @author songjy
	 * 
	 */
	dictionaryCategoryModify() {
		this.dictionaryService.dictionaryCategoryModify(this.dictionaryCategory)
			.then(dictionaryCategory => {
				this.dialogPlugin.tip(dictionaryCategory.message);
				if (dictionaryCategory.code == 200) this.getDictionaryGroup();
			},
			error => this.error = <any>error);
	}

	/**
	 * 表单提交
	 * 
	 * @author songjy
	 */
	onSubmit() {
		if (!this.dictionaryCategory.code) { this.dialogPlugin.tip("请填写字典编码"); return; }
		if (!this.dictionaryCategory.name) { this.dialogPlugin.tip("请填写字典名称"); return; }
		if (this.dictionaryCategory.id && (1 != this.dictionaryCategory.operationType)) {
			this.dictionaryCategoryModify();
		} else {
			this.dictionaryCategoryAdd();
		}
	}

	/**
	 * 点击【添加根分类】按钮清空数据
	 * 
	 * @author songjy
	 */
	dictionaryCategoryAddRoot() {
		this.dictionaryCategory = new DictionaryCategory();
		this.dictionaryCategory.operationType = 1;
	}

	/**
	 * 点击【添加子分类】按钮清空数据，但保留主键及父主键
	 * 
	 * @author songjy
	 */
	dictionaryCategoryAddChildren() {
		if (!this.dictionaryCategory.id) {
			this.dialogPlugin.tip("请选择一个字典分类");
			return;
		}
		let id = this.dictionaryCategory.id;
		let pid = this.dictionaryCategory.pid;
		this.dictionaryCategory = new DictionaryCategory();
		this.dictionaryCategory.id = id;
		this.dictionaryCategory.pid = pid;
		this.dictionaryCategory.addChildren = false;
		this.dictionaryCategory.showLevel = true;
		this.dictionaryCategory.operationType = 1;
	}

	/**
	 * 字典分类删除
	 * 
	 * @author songjy
	 */
	dictionaryCategoryDelete() {
		if (true == this.dictionaryCategory.hasChildren) {
			this.dialogPlugin.tip("存在子分类，不允许删除！");
			return;
		} else if (this.dictionaryCategory.code) {
			this.dictionaryService.dictionaryCategoryDelete(this.dictionaryCategory)
				.then(dictionaryCategory => {
					this.dialogPlugin.tip(dictionaryCategory.message);
					// this.getDictionaryGroup();
					if ( dictionaryCategory.code == "200") {
						//当后台返回成功后,才删除节点
						this.deleteNode();
					}
				},
				error => this.error = <any>error);
			return;
		}
	}

	/**
	 * 跳转至字典数据展示页面
	 * 
	 * @author songjy
	 * 
	 */
	dictionaryDataQuery() {
		if (!this.dictionaryCategory.code) {
			this.dialogPlugin.tip("请先选择一个字典");
			return;
		}
		let link = ['rule_management/sort_management/dictionary_sort_management/dictionary_data_management/prop', this.dictionaryCategory.code];
		this.router.navigate(link);
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
		if (!this.currentNode)//添加根分类
			this.dictionaryGroup.push(node);
		else {
			if (this.dictionaryCategory.addChildren) {
				//true为添加下级
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
				this.currentNode.parent.data.children.push(node);
			}
		}
		this.tree.treeModel.update();
	}

}