import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { DialogPlugin, DialogModel } from '../../common/ug-dialog/dialog';
import { TablePlugin } from '../../common/ug-table/table.module';
import { UserService } from '../../user.service';
import { DrugMatchService } from './drug_match.service';

@Component({
	selector: 'drug-match-dictlist',
	template: require('./drug_match_dictlist.component.html'),
	styles: [require('./content_manegement.component.css') + ""],
	providers: [DrugMatchService]
})
export class DrugMatchDiclistComponent implements OnInit {
	constructor(
		private router: Router,
		private userService: UserService,
		private drugMatchService: DrugMatchService) { }

	@ViewChild(DialogPlugin) dialogPlugin: DialogPlugin;
	@ViewChild(TablePlugin) tablePlugin: TablePlugin;
	/**
	 * 搜索条件字段
	 */
	currentPage = 1;			//当前页
	selectedDataList: any;

	table: any = {
        title:[{
                id: 'flag',
                name: '警示标志'
            }, {
				id: 'message',
				name: '配伍警示信息'
			}, {
				id: 'level',
				name: '警示级别',
			}, {
				id: '',
				name: '操作'
			}],
        pageSize: 20,
		url: "/api/v1//pwMessageList?numPerPage={pageSize}&pageNum={currentPage}",
        dataListPath: "recordList",
        itemCountPath: "recordCount"
    };

	ngOnInit() {
		
	}

	onClick(trow: any){
		this.selectedDataList = trow;
	}
	/**
	 * 配伍字典修改
	 */
	pwDicModify(trow: any){
		console.log(trow)
		this.router.navigate(["rule_management/content_management/drug_match_management/drug_match_dictlist/drug_match_dictedit", trow.messageId]);
	}
	
}



