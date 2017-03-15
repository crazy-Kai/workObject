/**
 *  @author: anwen
 *  @Description:TODO(通用时间设置模块涉及的接口)     
 */
import { Component, OnInit, ViewChild} from '@angular/core';

import { DictionaryService } from './dictionary.service';
import { PatientUseTimeService } from './general_timeset.service';
//引入插件
import { DialogPlugin } from '../../common/ug-dialog/dialog.plugin';
import { UserService } from '../../user.service';


export class FreqItem {
	categoryCodeFreq: string
	codeFreq: string;
	explainTextArr: string[] = [];
	type: string;
	id: number;
}

@Component({
	selector: 'setting-advanced',
	template: require('./general_timeset.component.html'),
	styles: [require('./patient_guide.component.css') + ""],
	providers: [
		DictionaryService,
		PatientUseTimeService
	]
})
export class GeneralTimeSetComponent implements OnInit {
	//常量
	MEDICATION_OCCASION_CODE = 'sys_dictcate_shij';//给药时机code
	ROUTE_FREQUENCY_CODE = 'sys_route_freq';//给药频率code
	//变量
	@ViewChild(DialogPlugin) dialogPlugin: DialogPlugin;
	dictionaryGroup: any[];
	error: any;
	dictionaryName: string;
	dicOPtions: any[] = [];
	codeShij: string;
	freqs: FreqItem[] = [];
	searchText: string;
	method = "save";

	constructor(private dictionaryService: DictionaryService,
		private patientUseTimeService: PatientUseTimeService,
 		private userService:UserService) { }

	ngOnInit() {
		this.getMedicationOccasion();
	}

	//获取给药时机树
	getMedicationOccasion() {
		return this.dictionaryService.getChildrenByCode(this.MEDICATION_OCCASION_CODE)
			.then(dictionaryGroup => this.dictionaryGroup = dictionaryGroup,
			error => this.error = error
			);
	}

	//点击给药时机树触发事件
	updataDicName($event: any) {
		this.dictionaryName = $event.node.data.name;
		this.codeShij = $event.node.data.code;
		//清空给药频率列表
		this.freqs = [];
		//获取该字典下给药频率的列表
		this.getPatientUseTime();
	}

	//获取该字典下给药频率的列表
	getPatientUseTime() {
		this.patientUseTimeService.getPatientUseTime(this.MEDICATION_OCCASION_CODE, this.codeShij)
			.then(freqs => {
				if (!this.patientUseTimeService.isEmptyObject(freqs)) {
					for (let i in freqs) {
						this.freqs[i] = new FreqItem();
						this.freqs[i].categoryCodeFreq = freqs[i].categoryCodeFreq;
						this.freqs[i].codeFreq = freqs[i].codeFreq;
						this.freqs[i].explainTextArr = freqs[i].explainTextArr;
						this.freqs[i].type = freqs[i].type;
						this.freqs[i].id = freqs[i].id;
					}
					this.method = "update";
				}
				else this.method = "save";
				this.getRouteFrequency();
			},
			error => this.error = error
			);
	}

	//点击添加给药频率，添加新的一行
	addNewRouteFreq() {
		let freqTemp = new FreqItem();
		this.getRouteFrequency();
		freqTemp.categoryCodeFreq = this.ROUTE_FREQUENCY_CODE;
		freqTemp.type = 'text';
		this.freqs.push(freqTemp);
	}

	setDefaultInput(index: number, freqValue: string) {
		this.freqs[index].explainTextArr = [];
		let time = parseInt(freqValue.substring(0, 1));//传入“1次/天”，time=1
		if (time<=4 && time >=1){
			for (let i = 0; i < time; i++) {
				this.freqs[index].explainTextArr.push("");
			}
			this.freqs[index].type = "time";
		}
		else {
			this.freqs[index].type = "text";
		}
		this.initDicOptions();
	}

	//保存time，从html获取
	setTime() {
		for (let i = 0; i < this.freqs.length; i++) {
			for (let j = 0; j < this.freqs[i].explainTextArr.length; j++) {
				if (this.freqs[i].type === "text") {
					continue;
				}
				let inputValue = (<HTMLInputElement>document.getElementById("input" + i + j)).value;
				this.freqs[i].explainTextArr[j] = inputValue;
			}
		}
	}

	initDicOptions() {
		for (let i = 0; i < this.dicOPtions.length; i++) {
			this.dicOPtions[i].isDisabled = false;
			freqLoop:
			for (let j = 0; j < this.freqs.length; j++) {
				if (this.freqs[j].codeFreq === this.dicOPtions[i].code) {
					this.dicOPtions[i].isDisabled = true;
					break freqLoop;
				}
			}
		}
	}

	//获取给药频率树(select中的选项)
	getRouteFrequency() {
		this.dictionaryService.getChildrenByCode(this.ROUTE_FREQUENCY_CODE)
			.then(dicOPtions => {
				this.dicOPtions = dicOPtions;
				this.initDicOptions();
			},
			error => this.error = error
			);
	}

	//保存给药频率
	savePatientUseTime() {
		this.patientUseTimeService.savePatientUseTime(this.MEDICATION_OCCASION_CODE, this.codeShij, this.freqs)
			.then(freqs => {
				for (let i in freqs) {
					this.freqs[i].categoryCodeFreq = freqs[i].categoryCodeFreq;
					this.freqs[i].codeFreq = freqs[i].codeFreq;
					this.freqs[i].explainTextArr = freqs[i].explainTextArr;
					this.freqs[i].id = freqs[i].id;
				}
				this.dialogPlugin.tip("保存成功");
			},
			error => this.error = error
			);
	}

	//删除给药频率接口
	deletePatientUseTime(id: number) {
		this.patientUseTimeService.deletePatientUseTime(id)
			.then(e => this.dialogPlugin.tip("删除成功"),
			error => this.error = error
			);
	}

	//删除给药频率
	delelteRouteFreqRow(index: number) {
		let ONE_LENGTH = 1;
		if (this.freqs[index].id)
			this.deletePatientUseTime(this.freqs[index].id);
		this.freqs.splice(index, ONE_LENGTH);
		if (this.freqs.length == 0) {
			this.method = "save";
		}
		this.initDicOptions();
	}

	//修改给药频率
	updatePatientUseTime() {
		this.patientUseTimeService.updatePatientUseTime(this.MEDICATION_OCCASION_CODE, this.codeShij, this.freqs)
			.then(freqs => {
				for (let i in freqs) {
					this.freqs[i].categoryCodeFreq = freqs[i].categoryCodeFreq;
					this.freqs[i].codeFreq = freqs[i].codeFreq;
					this.freqs[i].explainText = freqs[i].explainText;
					this.freqs[i].id = freqs[i].id;
				}
				this.dialogPlugin.tip("保存成功");
			},
			error => this.error = error
			);
	}

	//点击保存按钮
	onSubmit() {
		this.setTime();
		this.checkUpdateMethod();
		if (!this.codeShij) {
			this.dialogPlugin.tip("请选择给药时机");
			return;
		}
		if (this.hasEmptyString()) {
			return;
		}
		if (this.method === "save") {
			this.savePatientUseTime();
		} else if (this.method === "update") {
			this.updatePatientUseTime();
		}
	}

	checkUpdateMethod() {
		for (let i = 0; i < this.freqs.length; i++) {
			if (this.freqs[i].id) {
				this.method = "update";
			}
		}
	}

	hasEmptyString(): boolean {
		if (this.patientUseTimeService.isEmptyObject(this.freqs)) {
			this.dialogPlugin.tip("请选择给药频率");
			return true;
		}
		for (let i = 0; i < this.freqs.length; i++) {
			if(this.freqs[i].explainTextArr.length === 0){
				this.dialogPlugin.tip("存在空字符串，保存失败");
				return true;
			}
			for (let j = 0; j < this.freqs[i].explainTextArr.length; j++) {
				if ((this.freqs[i].explainTextArr[j] === "")) {
					this.dialogPlugin.tip("存在空字符串，保存失败");
					return true;
				}
			}
		}
		return false;
	}

	//根据字典值查找
	searchByValue() {
		if (!this.searchText) {
			this.ngOnInit();
			return;
		}
		return this.dictionaryService.searchByValue(this.MEDICATION_OCCASION_CODE, this.searchText)
			.then(dictionaries => {
				if (!this.dictionaryService.isEmptyObject(dictionaries))
					this.dictionaryGroup = dictionaries;
				else this.dictionaryGroup = [];
			},
			error => this.error = <any>error);
	}


}
