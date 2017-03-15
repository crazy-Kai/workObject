import { Component, OnInit, ViewChild} from '@angular/core';
import { TablePlugin } from '../../common/ug-table/table.module';
//service
import { KnowledgeImportService } from './knowledge_import.service';


class SearchQuery {
	dateStart: string;
	dateEnd: string;
	drugId: string;
	hospitalName: string;
	applyType: string;
	source: string;
	status: string;
}
@Component({
	selector: 'rule_import_list',
	styleUrls: ['knowledge_import_management.css'.toString()],
	templateUrl:'rule_import_list.component.html',
	providers: [ KnowledgeImportService ]
})
export class RuleImportList implements OnInit{
	constructor(
        private knowledgeImportService: KnowledgeImportService
    ) { }
	@ViewChild(TablePlugin) tablePlugin: TablePlugin;
	/**
	 * 时间控件参数
	 */
	startDate: string;
	endDate: string;
	minStartDate: any;
	maxStartDate:any = {year: new Date().getFullYear(), month: new Date().getMonth() + 1, day: new Date().getDate()};
	minEndDate: any;
	maxEndDate:any = {year: new Date().getFullYear(), month: new Date().getMonth() + 1, day: new Date().getDate()};        //设定药品核准时间的最大值为今天string;

	rule: any;						//当前选中的用户规则

	searchQuery: SearchQuery = new SearchQuery();

    ngOnInit(){

    }

	drugRuleTable: any = {
        title:[
            {
                name: '序号',
            }, {
				id: 'drugId',
				name: '药品名称'
			}, {
				id: 'applyType',
				name: '规则类型',
				type: 'object',
                object: {
                    '1': '药品',
                    '2': '产品'
                } 
			}, {
				id: 'branch',
				name: '分支名称'
			}, {
				id: 'ruleFrom',
				name: '规则来源',
			}, {
				id: 'status',
				name: '状态',
			}, {
				id: 'checkUserName',
				name: '审核人',
			}, {
				id: 'checkTime',
				name: '审核时间'
			}, {
				id: 'checkAgainUserName',
				name: '复核人',
			}, {
				id: 'checkAgainTime',
				name: '复核时间'
			}, {
				id: 'comment',
				name: '备注'
			}, {
				id: 'status',
				name: '操作',
			}
		],
        pageSize: 20,
        url: "/api/v1/drugRuleList?numPerPage={pageSize}&pageNum={currentPage}",
        dataListPath: "recordList",
        itemCountPath: "recordCount"
    }; 
	/**
	 * table 数据处理映射
	 */
	statusTransfromMap = {
		'-2': '已忽略',
		'-1': '可忽略',
		'0': '待处理',
		'1': '可纳入',
		'2': '已纳入'
	}

	/**
	 * 搜索用户规则回收列表以及导出
	 */
	serializeQuery(){
		let paramStr = "";
		//时间格式转换
		this.searchQuery.dateStart = this.objToDate(this.startDate);
		this.searchQuery.dateEnd = this.objToDate(this.endDate);

		for(let attr in this.searchQuery){
			if(this.searchQuery[attr]){
				paramStr += `&${attr}=${this.searchQuery[attr]}`;
			}
		}

		return paramStr;
	}

	search(data: any){
		let tempUrl = `${this.drugRuleTable.url}`;
		
		tempUrl += this.serializeQuery();
		this.tablePlugin.loadDataByUrl(tempUrl, true);
	}
	
	download(){
		let tempUrl = `/api/v1/downloadDrugRule?`;
		
		tempUrl += this.serializeQuery().substr(1);
		window.open(tempUrl, '_blank');
	}

	choose($event: any){
		this.rule = $event;
	}

	goEdit($event: any){
		window.open("/designer/compare.action?id=" + $event.id);
	}
	/**
	 * 时间控件与时间对象的相互转换
	 */
    dateToObj(date: any) {
        // let fullDate = new Date(date);
        
        // this.modifyTime = {}
        // this.modifyTime.year = fullDate.getFullYear();
        // this.modifyTime.month = fullDate.getMonth() + 1;
        // this.modifyTime.day = fullDate.getDate();
    }

    objToDate(oriDate: any) {
		if(!oriDate)
			return "";
			
        let dateStr = oriDate.year + '-' + oriDate.month + '-' + oriDate.day;
        return dateStr;
    }

	setEndInterval($event: any){
		console.log($event)
		if($event){
			this.minEndDate = $event;
		}else{
			this.minEndDate = null;
		}
	}
	setStrartInterval($event: any){
		if($event){
			this.maxStartDate = $event;
		}else{
			this.maxStartDate = {year: new Date().getFullYear(), month: new Date().getMonth() + 1, day: new Date().getDate()};
		}
	}

}