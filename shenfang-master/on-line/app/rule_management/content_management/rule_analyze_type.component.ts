import { Component, OnInit, ViewChild} from '@angular/core';
import {Http, Response} from '@angular/http';
import {Headers, RequestOptions} from '@angular/http';
import { DialogPlugin, DialogModel } from '../../common/ug-dialog/dialog';
import { UserService } from '../../user.service';
import { DictionaryService } from '../../data_management/patient_guide/dictionary.service'
import {InterceptorService } from 'ng2-interceptors';

@Component({
	selector: 'rule-analyze-type',
	template: require('./rule_analyze_type.component.html'),
	providers: [
		DictionaryService
	]
})
export class RuleAnalyzeTypeComponent implements OnInit {
	CATEGORY_CODE = "engine_rule_type";
	DORDER = 999;
	searchText: string;
	ruleGroup: any = [];
	ruleInfo: any = {};
	savedRule: any = {};
	error: string;
	ruleTreeUrl = '/api/v1/dictionaryData';
	@ViewChild(DialogPlugin) dialogPlugin: DialogPlugin;

	constructor(
		private userService: UserService,
		private dictionaryService: DictionaryService,
		private http: InterceptorService
	) { }

	ngOnInit() {
		this.getRuleTree(this.CATEGORY_CODE);
	}
	delete() {
		if (this.ruleInfo.hasChildren == true) {
			this.dialogPlugin.tip("存在子分类，不允许删除！");
		}
		else {
			this.dialogPlugin.confirm("确定要删除吗？", () => {
				this.deleteRule();
			}, () => { });
		}
	}
	deleteRule() {
		this.dictionaryService.dictionaryDataDelete(this.ruleInfo.code)
			.then(deleteResult => {
				this.dialogPlugin.tip(deleteResult.message);
			},
			error => this.error = <any>error);
	}
	searchRule() {
		if (!this.searchText) {
			this.ngOnInit();
			return;
		}
		this.dictionaryService.searchByValue(this.CATEGORY_CODE, this.searchText)
			.then(ruleGroup =>
				this.ruleGroup = ruleGroup,
			error => this.error = <any>error);
	}
	getRuleTree(categoryCode: string) {
		this.dictionaryService.getChildrenByCode(categoryCode)
			.then(rules => {
				if (!this.dictionaryService.isEmptyObject(rules)) {
					this.ruleGroup = rules;
				}
				else this.ruleGroup = [];
			},
			error => this.error = <any>error);
	}
	getChildren(node: any): any {
		return this.dictionaryService.getChildrenByNode(node.data);
	}

    customTemplateStringOptions = {
		getChildren: this.getChildren.bind(this),
		idField:'uuid'
	}

	getRuleTreeNode($event: any) {
		this.ruleInfo.hasChildren = $event.node.data.hasChildren;
		console.log($event); let nodeData = $event.node.data;
		this.ruleInfo.code = nodeData.code;
		this.ruleInfo.oldCode = nodeData.oldCode ? nodeData.oldCode : nodeData.code;
		this.ruleInfo.dictValue = nodeData.dictValue;
		this.ruleInfo.dorder = nodeData.dorder;
		this.ruleInfo.remark = nodeData.remark;
		this.ruleInfo.systemReserved = nodeData.systemReserved;
		this.ruleInfo.pcode = nodeData.pcode;
	}

	addRule() {
		this.ruleInfo.code = "";
		this.ruleInfo.remark = "";
	}
	onSubmit() {
		if (this.ruleInfo.oldCode != '')
			this.SaveUpdatedRule();
		else
			this.SaveNewRule();
	}

	SaveNewRule() {
		this.newRule(this.CATEGORY_CODE, this.ruleInfo.code, this.ruleInfo.code, this.ruleInfo.remark, this.ruleInfo.systemReserved, this.DORDER, this.ruleInfo.pcode)
			.then(savedRule => {
                this.savedRule = savedRule.data;
				this.dialogPlugin.tip(savedRule.message);
            },
            error => this.error = error);
	}

	SaveUpdatedRule() {
		this.updateRule(this.CATEGORY_CODE, this.ruleInfo.code, this.ruleInfo.dictValue, this.ruleInfo.oldCode, this.ruleInfo.remark, this.ruleInfo.systemReserved, this.ruleInfo.dorder)
			.then(savedRule => {
                this.savedRule = savedRule.data,
					this.dialogPlugin.tip(savedRule.message);
            },
            error => this.error = error);
	}

	newRule(categoryCode: string, code: string, dictValue: string, remark: string, systemReserved: number, dorder: number, pcode: string) {
        let data = {
            "categoryCode": categoryCode,
            "code": code,
            "dictValue": dictValue,
            "remark": remark,
            "systemReserved": systemReserved,
            "dorder": dorder,
            "pcode": pcode
        }
        if (pcode == null) {
            data.pcode = code;
        } else {
            data.pcode = pcode;
        }
        let body = JSON.stringify(data);
        let headers = new Headers({ 'Content-Type': 'application/json' });
        let options = new RequestOptions({ headers: headers });
        return this.http.post(this.ruleTreeUrl, body, options)
            .toPromise()
            .then(this.extractJson)
            .catch(this.handleError);
    }
    updateRule(categoryCode: string, code: string, dictValue: string, oldCode: string, remark: string, systemReserved: number, dorder: number) {
        let data = {
            "categoryCode": categoryCode,
            "code": code,
            "dictValue": dictValue,
            "oldCode": oldCode,
            "remark": remark,
            "systemReserved": systemReserved,
            "dorder": dorder
        }
        let body = JSON.stringify(data);
        let headers = new Headers({ 'Content-Type': 'application/json' });
        let options = new RequestOptions({ headers: headers });
        return this.http.put(this.ruleTreeUrl, body, options)
            .toPromise()
            .then(this.extractJson)
            .catch(this.handleError);
    }
	private extractData(res: Response) {
        if (res.status < 200 || res.status >= 300) {
            throw new Error('Bad response status: ' + res.status);
        }
        let body = res.json();
        return body.data || {};
    }
	private extractJson(res: Response) {
        if (res.status < 200 || res.status >= 300) {
            throw new Error('Bad response status: ' + res.status);
        }
        let body = res.json();
        return body || {};
    }

    private handleError(error: any) {
        console.error('An error occurred', error);
        return Promise.reject(error.message || error);
    }
}



