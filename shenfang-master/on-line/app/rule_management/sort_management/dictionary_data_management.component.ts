import { Component, OnInit, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

import { DictionaryService } from '../../data_management/patient_guide/dictionary.service';
import { DictionaryData } from '../../data_management/patient_guide/dictionary.service';
import { Extend } from '../../data_management/patient_guide/dictionary.service';
import { DictionaryExtend } from '../../data_management/patient_guide/dictionary.service';
import { Http, Response } from '@angular/http';
import { Headers, RequestOptions } from '@angular/http';
//引入插件
import { DialogPlugin } from '../../common/ug-dialog/dialog.plugin';
import { UserService } from '../../user.service';

@Component({
	selector: 'dictionary-sort-management',
	template: require('./dictionary_data_management.component.html'),
	providers: [
		DictionaryService,
	]
})
export class DictionaryDataManagementComponent implements OnInit {
	dictionaryGroup: any;
	error: any;
	categoryCode: string;//字典分类代码
	dictValue: string;//字典数据值
	dictionaryData = new DictionaryData();
	currentNode: any; //当前选中的树节点
	dictionaryExtends = new Array<DictionaryExtend>();
	extend = new Extend();
	isShow = false;  //
	SHUXING_CATEGORY_CODE = 'sys_dictcate_shux';
	MANA_CATEGORY_CODE = 'data_classification_mana';
	@ViewChild(DialogPlugin) dialogPlugin: DialogPlugin;

	constructor(
		private router: Router,
		private route: ActivatedRoute,
		private dictionaryService: DictionaryService,
		private userService: UserService) { }


	ngOnInit() {
		this.route.params.subscribe(params => {
			if (params['categoryCode']) {
				this.categoryCode = params['categoryCode'];//从URL中获取字典分类代码
				this.dictionaryData.categoryCode = this.categoryCode;
				this.dictionaryData.addChildren = false;
			}

		});

		if (this.categoryCode) {//字典分类代码必传

			this.dictionaryService.getNodyByCategory(this.categoryCode)
				.then(result => {
					if (!this.dictionaryService.isEmptyObject(result)) {
						this.dictionaryGroup = result;
					} else {
						this.dictionaryGroup = [];
					}
				},
				error => this.error = error);
		}
		if (this.categoryCode == this.SHUXING_CATEGORY_CODE)
			this.isShow = true;
	}

	/**
	 * 获取子节点树
	 * 
	 * @author songjy
	 */
	getChildren(node: any) {

		return this.dictionaryService.getChildrenByNode(node.data);
	}

	options = {
		getChildren: this.getChildren.bind(this),
		idField:'uuid'
	}



	/**
	 * 根据字典分类代码和字典数据值查询字典数据 
	 * 
	 * @author songjy
	 * 
	 * @param categoryCode 字典分类代码
	 * 
	 * @param dictValue 字典数据值
	 */
	searchDictionaryData() {

		this.dictionaryService.searchByValue(this.categoryCode, this.dictValue)
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
	 * 字典名称输入框的回车事件
	 */
	private seachInputEntered() : void {
		this.searchDictionaryData();
	}

    /**
	 * 字典数据树的节点点击（选中）事件，获取节点信息并展示
	 * 
	 * @author songjy
	 * 
	 * @param $event 节点信息
	 */
	onClickDictionaryData($event: any) {
		let nodeData = $event.node.data;
		this.currentNode = $event.node;

		this.dictionaryData = new DictionaryData();
		this.dictionaryData = nodeData;
		this.dictionaryData.categoryCode = nodeData.categoryCode;
		this.dictionaryData.code = nodeData.code;
		this.dictionaryData.oldCode = nodeData.oldCode ? nodeData.oldCode : nodeData.code;
		this.dictionaryData.dictValue = nodeData.dictValue;
		this.dictionaryData.dorder = nodeData.dorder;
		this.dictionaryData.remark = nodeData.remark;
		this.dictionaryData.pcode = nodeData.pcode;
		this.dictionaryData.addChildren = false;
		this.dictionaryData.systemReserved = nodeData.systemReserved;
		if (nodeData.dictionaryExtendDtos != null && nodeData.dictionaryExtendDtos.length > 0) {
			this.dictionaryExtends = nodeData.dictionaryExtendDtos;
			this.getExtendFromDictionaryExtendList();
		}
		else {
			this.dictionaryExtends = new Array<DictionaryExtend>();
			this.extend = new Extend();
		}
	}

	/**
	 * 字典数据添加
	 * 
	 * @author songjy
	 * 
	 */
	dictionaryDataSave() {
		this.saveExtendsToDictionaryExtendList();
		this.dictionaryData.dictionaryExtends = this.dictionaryExtends;
		this.dictionaryService.dictionaryDataAdd(this.dictionaryData)
			.then(dictionaryData => {
				this.dialogPlugin.tip(dictionaryData.message);
				if (dictionaryData.code == 200) this.dictionaryData = dictionaryData.data;
				this.searchDictionaryData();
			},
			error => this.error = <any>error);
	}

	/**
	 * 字典数据修改
	 * 
	 * @author songjy
	 * 
	 */
	dictionaryDataModify() {
		this.saveExtendsToDictionaryExtendList();
		this.dictionaryData.dictionaryExtends = this.dictionaryExtends;
		this.dictionaryService.dictionaryDataModify(this.dictionaryData)
			.then(dictionaryData => {
				this.dialogPlugin.tip(dictionaryData.message);
				if (dictionaryData.code == 200) { this.dictionaryData = dictionaryData.data; }
				this.searchDictionaryData();
			},
			error => this.error = <any>error);
	}

	/**
	 * 表单提交
	 * 
	 * @author songjy
	 */
	onSubmit() {
		if (!this.dictionaryData.code) { this.dialogPlugin.tip("请填写字典编码"); return; }
		if (!this.dictionaryData.dictValue) { this.dialogPlugin.tip("请填写字典名称"); return; }
		if (1 == this.dictionaryData.operationType) {
			this.dictionaryDataSave();
		} else {
			this.dictionaryDataModify();
		}
	}

	/**
	 * 点击【添加字典】
	 * 
	 * @author songjy
	 */
	dictionaryDataAdd() {
		// if (!this.dictionaryData.code) {
		// 	this.dialogPlugin.tip("请选择一个字典");
		// 	return;
		// }
		let code = this.dictionaryData.code;
		let pcode = this.dictionaryData.pcode;
		this.categoryCode = this.dictionaryData.categoryCode;
		this.dictionaryData = new DictionaryData();
		this.dictionaryData.operationType = 1;
		this.dictionaryData.pcode = pcode;
		this.dictionaryData.oldCode = code;
		this.dictionaryData.categoryCode = this.categoryCode;
		this.dictionaryData.addChildren = false;
		this.dictionaryData.showLevel = true;
		this.dictionaryData.dictionaryExtends = new Array<DictionaryExtend>();
		this.extend = new Extend();
	}

	/**
	 * 字典分类删除
	 * 
	 * @author songjy
	 */
	dictionaryDataDelete() {
		if (!this.dictionaryData.code) {
			this.dialogPlugin.tip("请选择要删除的分类");
			return;
		}
		if (this.dictionaryData.hasChildren) {
			this.dialogPlugin.tip("存在子分类，不允许删除！");
			return;
		}
		this.dialogPlugin.confirm("确认要删除吗？", () => {
			if (this.dictionaryData.code) {
				this.dictionaryService.dictionaryDataDelete(this.dictionaryData)
					.then(dictionaryCategory => {
						this.dialogPlugin.tip(dictionaryCategory.message);
						this.dictionaryData = new DictionaryData();
						if (dictionaryCategory.code == "200") {
							this.searchDictionaryData();
						}
					},
					error => this.error = <any>error);
				return;
			}
		}, () => { });
	}
	getExtendFromDictionaryExtendList() {
		if (this.dictionaryExtends != null)
			for (let i = 0; i < this.dictionaryExtends.length; i++) {
				let name = this.dictionaryExtends[i].propertyKey;
				this.extend[name] = this.dictionaryExtends[i].propertyValue;
			}
	}
	saveExtendsToDictionaryExtendList() {
		if (this.extend != null) {
			if (this.extend.endTime < this.extend.startTime) {
				this.dialogPlugin.tip("起始时间不能超过结束时间!");
			}
			for (var name in this.extend) {
				let isExist = false;

				for (let index = 0; index < this.dictionaryExtends.length; index++) {
					if (name === this.dictionaryExtends[index].propertyKey) {
						this.dictionaryExtends[index].propertyValue = this.extend[name];
						this.dictionaryExtends[index].categoryCode = this.categoryCode;
						this.dictionaryExtends[index].code = this.dictionaryData.code;
						isExist = true;
					}

				}
				if (!isExist) {
					let tempdic = new DictionaryExtend();
					tempdic.propertyKey = name;
					tempdic.propertyValue = this.extend[name];
					tempdic.categoryCode = this.categoryCode;
					tempdic.code = this.dictionaryData.code;
					this.dictionaryExtends.push(tempdic);
				}

			}
		}

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
		// this.tree.treeModel.update();
		return true;
	}

}