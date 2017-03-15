// 添加药品相关指导获得药品树组件

import { Component, OnInit, IterableDiffers, DoCheck ,Input} from '@angular/core';
import { TreeNode } from 'angular2-tree-component';

import { Router } from '@angular/router';
import { DrugService } from './drug_tree.service';
import { DrugTreeDetailComponent } from './drug_tree_detail.component';
import { UserService } from '../../user.service';


@Component({
	selector: 'add_drug_guide',
	template:require('./add_drug_guide.component.html'),
	styles:[require('./patient_guide.component.css')+""]
})
export class AddDrugGuideComponent implements OnInit {
	drugGroup: any;
	tmpDrugGroup: any;
	error: any;
	searchText:string;
	nodeName: string;
	//拖拽相关
	tNODE: any;
	Tree: any;
	tmpNode: any;

	sourceId:any;
	targetId:any;
	

	constructor(private router: Router,
	private drugService: DrugService) { }

	ngOnInit() {
		this.getDrugCategory();
		if(this.drugService.searchStatus){
			this.searchByDrugName();
		}
	}

	getChildren(node: any): any {
		return this.drugService.getChildren(node.data.id);
	}

    customTemplateStringOptions = {
		getChildren: this.getChildren.bind(this),
		idField:'uuid'
	}

	getDrugCategory() {
		this.drugService.getDrugCategory()
			.then(drugs => {
				this.drugGroup = drugs;
			},
			error => this.error = <any>error);
	}

	searchByDrugName(){
		if(!this.drugService.searchText){
			this.drugService.searchStatus = false;
			this.ngOnInit();
			return;
		}
		this.drugService.searchByDrugName(this.drugService.searchText)
			.then(drugGroup => {
				this.drugGroup = drugGroup;
				this.drugService.searchStatus = true;
			},
			error => this.error = <any>error);
	}

	
	//获取药品树接口中的'name'
	gotoDrugDetail(name: string) {
		this.nodeName = name;
		if (this.nodeName) {
			let link = ['data_management/patient_guide/drug_guide/drug_tree_detail', this.nodeName,'false'];
			this.router.navigate(link);
		} else {
			alert("已有该药品相关指导！");
		}

	}
}




