/**
 *  @author: anwen
 *  @Description:TODO(剂量单位设置模块涉及的接口)     
 */

import { Component, OnInit,ViewChild } from '@angular/core';


import { PatientDosageService } from './dose_setting.service';
import { DictionaryService } from './dictionary.service';
//引入插件
import { DialogPlugin } from '../../common/ug-dialog/dialog.plugin';
import { UserService } from '../../user.service';


//const CUSTOM_TEMPLATE_STRING = '{{ node.data.name }}';
export class PatientDosage {
	constructor(
		public id = 0,
		public name = '',
		public categoryCodeJix = '',
		public codeJix = '',
		public categoryCodeUnit = '',
		public codeUnit = ''
	) { }
}

@Component({
	selector: 'dose_setting',
	template:require('./dose_setting.component.html'),
	styles:[require('./patient_guide.component.css')+""],
	providers: [
		DictionaryService,
		PatientDosageService
	]
})
export class DoseSettingComponent implements OnInit {
	DICTIONARY_DOSE_UNIT_CODE = 'sys_pre_dose_unit'; //剂量单位code
	DICTIONARY_DOSE_CODE = 'sys_dictcate_jix'; //给药剂量code 分类字典
	@ViewChild(DialogPlugin) dialogPlugin: DialogPlugin;
	dictionaryGroup: any[];
	dicOPtions: any[];
	dosage = new PatientDosage();
	error: string;
	searchText:string;

	constructor(private dictionaryService: DictionaryService,
				private patientDosageService: PatientDosageService,
  				private userService:UserService) { }

	ngOnInit() {
		this.getDicTree(this.DICTIONARY_DOSE_CODE);
		this.getDicOptions();
	}

	//返回剂量单位option
	getDicOptions() {
		this.dictionaryService.getChildrenByCode(this.DICTIONARY_DOSE_UNIT_CODE)
			.then(dicOPtions => this.dicOPtions = dicOPtions,
			error => this.error = <any>error);
	}

	//返回数据字典树
	getDicTree(categoryCode: string) {
		this.dictionaryService.getChildrenByCode(categoryCode)
			.then(dictionaries => {
				if (!this.dictionaryService.isEmptyObject(dictionaries))
					this.dictionaryGroup = dictionaries;
				else this.dictionaryGroup = [];
			},
			error => this.error = <any>error);
	}

	getDictionaries() {
		this.dictionaryService.getDictionaryCategory()
			.then(dictionaries => {
				this.dictionaryGroup = dictionaries;
			},
			error => this.error = <any>error);
	}

	//字典树的点击事件，获取患者剂量单位设置表单的数据
	getPatientDosage($event: any) {
		this.dosage.categoryCodeJix = $event.node.data.categoryCode;
		this.dosage.codeJix = $event.node.data.code;
		this.dosage.name = $event.node.data.name;
		this.dosage.categoryCodeUnit = this.DICTIONARY_DOSE_UNIT_CODE;
		this.patientDosageService.getPatientDosage(this.dosage)
			.then(dosage => {
				if(dosage.id){
					this.dosage.id=dosage.id;
					this.dosage.codeUnit = dosage.codeUnit;
				}else{
					this.dosage.id = 0;
					this.dosage.codeUnit = '';
				}
			},
			error => this.error = <any>error);
	};

	//保存专业用语解释表单
	savepatientDosage() {
		if((this.dosage.categoryCodeJix === '' )||(this.dosage.categoryCodeUnit === '' )||(this.dosage.codeJix === '' )){
			this.dialogPlugin.tip("请选择字典值");
			return;
		}
		if(this.dosage.codeUnit === ''){
			this.dialogPlugin.tip("请选择剂量单位");
			return;
		}
		this.patientDosageService.savePatientDosage(this.dosage)
				.then(dosage =>
					this.dialogPlugin.tip('保存成功'),
			error => this.error = <any>error);
	}

	//修改专业用语解释表单
	updatepatientDosage() {
		this.patientDosageService.updatePatientDosage(this.dosage)
			.then(dosage => this.dialogPlugin.tip('保存成功'),
			error => this.error = <any>error);
	}

	//提交专业用语解释表单事件，如果没有id则保存，否则则更新
	onSubmit() {
		if (this.dosage.id == 0) {
			this.savepatientDosage();
		}
		else {
			this.updatepatientDosage();
		}
	}
	
	//根据字典值查找
	searchByValue(){
		if (!this.searchText) {
			this.ngOnInit();
			return;
		}
		return this.dictionaryService.searchByValue(this.DICTIONARY_DOSE_CODE, this.searchText)
					.then(dictionaries => {
					if (!this.dictionaryService.isEmptyObject(dictionaries))
							this.dictionaryGroup = dictionaries;
						else this.dictionaryGroup = [];
					},
					error => this.error = <any>error);
	}

	getChildren(node: any) {
		return this.dictionaryService.getChildrenByNode(node.data);
	};

	customTemplateStringOptions = {
		//treeNodeTemplate: '{{ node.data.name }}',
		// treeNodeTemplate: MyTreeNodeTemplate,
		// displayField: 'subTitle',
		getChildren: this.getChildren.bind(this),
		idField:'uuid'
	}

}




