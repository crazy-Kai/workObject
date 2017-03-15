import { Component, OnInit, ViewChild} from '@angular/core';
import { TablePlugin } from '../../common/ug-table/table.module';

class SearchQuery {
	dateStart: string;
	dateEnd: string;
	drugId: string;
	branch: string;
	applyType: string = "1";
	status: string;
}

@Component({
	selector: 'ipharmacare-rule-list',
	styles: [require('./knowledge_import_management.css') + ""],
	templateUrl:'ipharmacare_rule_list.component.html',
})
export class IpharmacareRuleList implements OnInit{

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

	hospitalSuggestionAPI: string = "/api/v1/hospitalSuggestion";  //医疗机构的自动建议
	searchQuery: SearchQuery = new SearchQuery();

    ngOnInit(){

    }

	ipharmacareTable: any = {
		title:[
            {
                name: '序号',
            }, {
				id: 'drugId',
				name: '药品名称'
			}, /*{
				id: 'productId',
				name: '产品名称'
			},*/ {
				id: 'branchs',
				name: '包含分支'
			}, {
				id: 'applyType',
				name: '规则类型',
				type: 'object',
                object: {
                    '1': '药品',
                    '2': '产品'
                } 
			}, {
				id: 'userRuleStatus',
				name: '审核状态',
				type: 'object',
                object: {
                    '0': '已审核',
                    '2': '未审核'
                } 
			}, {
				id: 'userLastUserid',
				name: '审核人',
			}, {
				id: 'userLastAudtime',
				name: '审核时间'
			}, {
				id: 'status',
				name: '操作',
			}
		],
        pageSize: 20,
        url: "/api/v1/ipharmacareRuleList?numPerPage={pageSize}&pageNum={currentPage}",
        dataListPath: "recordList",
        itemCountPath: "recordCount"
	}

	/**
	 * 搜索用户规则回收列表以及导出
	 */
	serializeQuery(){
		let paramStr = "";
		this.searchQuery.dateStart = "";
		this.searchQuery.dateEnd = "";
		//时间格式转换
		if(this.startDate)
			this.searchQuery.dateStart = this.objToDate(this.startDate);
		if(this.endDate)
			this.searchQuery.dateEnd = this.objToDate(this.endDate);

		for(let attr in this.searchQuery){
			if(this.searchQuery[attr]){
				paramStr += `&${attr}=${this.searchQuery[attr]}`;
			}
		}

		return paramStr;
	}

	search(data: any){
		let tempUrl = `${this.ipharmacareTable.url}`;
		
		tempUrl += this.serializeQuery();
		this.tablePlugin.loadDataByUrl(tempUrl, true);
	}
	
	choose($event: any){
		//this.rule = $event;
	}
	goEdit($event:any){
        window.open("/designer/rule_ipharmacare_view.action?ruleId=" + $event.ruleId);
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
        let dateStr = oriDate.year + '-' + oriDate.month + '-' + oriDate.day;
        return dateStr;
    }

	setEndInterval($event: any){
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