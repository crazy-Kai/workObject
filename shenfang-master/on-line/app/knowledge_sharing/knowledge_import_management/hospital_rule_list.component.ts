import { Component, OnInit, ViewChild} from '@angular/core';
import { TablePlugin } from '../../common/ug-table/table.module';
import { Observable }    from 'rxjs/Observable';
//
import { KnowledgeImportService } from './knowledge_import.service';
@Component({
	selector: 'hospital-rule-list',
	styles: [require('./knowledge_import_management.css') + ""],
	templateUrl:'hospital_rule_list.component.html',
    providers: [ KnowledgeImportService ]
})
export class HospitalRuleList implements OnInit{

    @ViewChild(TablePlugin) tablePlugin: TablePlugin;
    constructor(
        private knowledgeImportService : KnowledgeImportService
    ) { }
	/**
	 * 条件参数
	 */
    hospitalName: string;           //机构名称
    ruleType: string;               //规则类型  1 => 药品  2 => 产品  4 => 其他
    drugId: string;                 //药品名称
    productName: string;            //产品名称
    /**
     * 
     */
    choosedRule: any;
    /**
	 * 机构名称联想相关
	 */
	organization: any; //指定审核人下拉联想框绑定值
    organizationsList: any[]; //有权限审核的人员列表
    organizationMap = (text$: Observable<string>) =>
        text$.debounceTime(200).distinctUntilChanged()
        .map(term => term.length < 1 ? []
            : this.organizationsList.filter(v => new RegExp(term, 'gi').test(v.name)).splice(0, 10));
    organizationFormatter = (x: any) => x['name'];

    ngOnInit(){
        this.knowledgeImportService.getOrgsList()
			.then(res => {
				this.organizationsList = res.data;
			})
    }

	hospitalRuleTable: any = {
		title:[
            {
                name: '序号',
            }, {
				id: 'hospitalName',
				name: '机构名称'
			}, {
				id: 'ruleTypeName',
				name: '规则类型'
			}, {
				id: 'drugId',
				name: '药品名'
			}, {
				id: 'productName',
				name: '产品名',
			}, {
				id: '',
				name: '操作',
			}
		],
        pageSize: 20,
        url: "/api/v1/hospitalDrugRuleList?numPerPage={pageSize}&pageNum={currentPage}",
        dataListPath: "recordList",
        itemCountPath: "recordCount"
	}

	/**
	 * 搜索用户规则回收列表以及导出
	 */
	search(){
        let tempUrl = `${this.hospitalRuleTable.url}`;

		//处理机构联想框数据
		if(this.organization){
			if(typeof(this.organization) == "string"){
				tempUrl += `&hospitalName=${this.organization}`;
			}else{
				tempUrl += `&hospitalName=${this.organization.name}`;
			}
		}
        if(this.ruleType)
            tempUrl += `&ruleType=${this.ruleType}`;
        if(this.drugId)
            tempUrl += `&drugId=${this.drugId}`;
        if(this.productName)
            tempUrl += `&productName=${this.productName}`; 

		this.tablePlugin.loadDataByUrl(tempUrl, true);
    }
	
	clearData(){
        console.log(this.ruleType)
        if(this.ruleType == "2"){
            this.drugId = "";
        }
        if(this.ruleType == "1" || this.ruleType == "3"){
            this.productName = "";
        }
    }

    goEdit($event:any){
        window.open("/designer/viewHospRule.action?id=" + $event.id);
    }

}