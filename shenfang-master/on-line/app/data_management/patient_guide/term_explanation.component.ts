/**
 *  @author: anwen
 *  @Description:TODO(专业用语解释模块涉及的接口)     
 */
import { Component, OnInit, ViewChild} from '@angular/core';
//

import { TreeNode, TreeModel, TreeComponent } from 'angular2-tree-component';
import { DictionaryService } from './dictionary.service';
import { TermExplainService } from './term_explanation.service';
//引入插件
import { DialogPlugin } from '../../common/ug-dialog/dialog.plugin';
import { UserService } from '../../user.service';

export class TermExplain {
	constructor(
		public id = 0,
		public name = '',
		public categoryCode = '',
		public code = '',
		public explainText = '',
		public patientOption = 1
	) { }
}

@Component({
	selector: 'term_explanation',
	template:require('./term_explanation.component.html'),
	styles:[require('./patient_guide.component.css')+""],
	providers: [
		DictionaryService,
		TermExplainService
	]
})
export class TermExplanationComponent implements OnInit {
	DRAG_ROUTE_CODE = 'sys_dictcate_gytj'; //给药途径code
	DELIVERY_TIME_CODE = 'sys_dictcate_shij'; //给药时机code
	@ViewChild(DialogPlugin) dialogPlugin: DialogPlugin;
	dicOPtions: any[];
	dictionaryGroup: any[];
	error: string;
	term = new TermExplain();
	dicOptionValue: string;
	searchText: string;
	searchCode: string;
	@ViewChild(TreeComponent) 
	private tree: TreeComponent;
	constructor(private dictionaryService: DictionaryService,
		private termExplainService: TermExplainService,
  		private userService:UserService) { }

	ngOnInit() {
		this.getDicOptions();
	}

	ngAfterViewInit() {
     
    }

	//清空字典树
	clearTree() {
		this.dictionaryGroup = [];
	}

	//返回select中的option列表
	getDicOptions() {
		this.dictionaryService.getDictionaryCategory()
			.then(dictionaries => {
				this.dicOPtions = dictionaries;
			},
			error => this.error = <any>error);
	}

	//返回数据字典树
	getDicTree(categoryCode: string) {
		this.searchCode = categoryCode;
		this.searchText = "";
		this.dicOptionValue = categoryCode;
		this.dictionaryService.getChildrenByCode(categoryCode)
			.then(dictionaries => {
				if (!this.dictionaryService.isEmptyObject(dictionaries))
					this.dictionaryGroup = dictionaries;
				else {
					this.dictionaryGroup = [];
					this.dialogPlugin.tip("暂缺");
				}
			},
			error => this.error = <any>error);
	}

	//获取字典树的子节点
	getChildren(node: any) {
		return this.dictionaryService.getChildrenByNode(node.data);
	};

	//字典树的点击事件，获取专业用语解释表单的数据
	getTermExplain($event: any) {
		this.term.categoryCode = $event.node.data.categoryCode;
		this.term.code = $event.node.data.code;
		this.term.name = $event.node.data.name;
		this.termExplainService.getTermExplain(this.term)
			.then(term => {
				if (!this.termExplainService.isEmptyObject(term)) {
					this.term.id = term.id;
					this.term.explainText = term.explainText;
					this.term.patientOption = term.patientOption;
				} else {
					this.term.id = 0;
					this.term.explainText = '';
					this.term.patientOption = 1;
				}
			},
			error => this.error = <any>error);
	};

	//保存专业用语解释表单
	saveTermExplain() {
		this.termExplainService.saveTermExplain(this.term)
			.then(term => this.dialogPlugin.tip('保存成功'),
			error => this.error = <any>error);
	}

	//修改专业用语解释表单
	updateTermExplain() {
		this.termExplainService.updateTermExplain(this.term)
			.then(term => this.dialogPlugin.tip('保存成功'),
			error => this.error = <any>error);
	}

	//根据字典值查找
	searchByValue() {
		if (!this.searchCode) {
			this.dialogPlugin.tip("请选择分类字典");
		} else {
			if (!this.searchText) {
				this.getDicTree(this.searchCode);
				return;
			}
			this.dictionaryService.searchByValue(this.searchCode, this.searchText)
				.then(dictionaries => {
					if (!this.dictionaryService.isEmptyObject(dictionaries)){
						this.dictionaryGroup = dictionaries;
						this.setExpanded(dictionaries)
					}
					else this.dictionaryGroup = [];
				},
				error => this.error = <any>error);
		}
	}

	//提交专业用语解释表单事件，如果没有id则保存，否则则更新
	onSubmit() {
		if(this.term.categoryCode === ''){
			this.dialogPlugin.tip("请选择字典值");
			return;
		}
		if (this.term.id == 0) {
			this.saveTermExplain();
		}
		else {
			this.updateTermExplain();
		}
	}

	customTemplateStringOptions = {
		//treeNodeTemplate: '{{ node.data.name }}',
		// treeNodeTemplate: MyTreeNodeTemplate,
		getChildren: this.getChildren.bind(this),
		isExpandedField: 'isExpanded',
		idField:'uuid'
	}
	setExpanded(arr: any[]) {
		for (let i = 0; i < arr.length; i++) {
			if (arr[i].isExpanded)
				this.tree.treeModel.expandedNodeIds[arr[i].uuid] = true;
			if (arr[i].hasChildren && (arr[i].children && arr[i].children.length > 0))
				this.setExpanded(arr[i].children);
		}
	}
}
