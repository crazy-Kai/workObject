import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { DialogPlugin, DialogModel } from '../../common/ug-dialog/dialog';
import { TablePlugin } from '../../common/ug-table/table.module';
import { UserService } from '../../user.service';
import { DrugMatchService } from './drug_match.service';

@Component({
	selector: 'drug-match-management',
	template: require('./drug_match_management.component.html'),
	styles: [require('./content_manegement.component.css') + ""],
	providers: [DrugMatchService]
})
export class DrugMatchManagementComponent implements OnInit {
	constructor(
		private router: Router,
		private userService: UserService,
		private drugMatchService: DrugMatchService) { }

	@ViewChild(DialogPlugin) dialogPlugin: DialogPlugin;
	@ViewChild(TablePlugin) tablePlugin: TablePlugin;
	/**
	 * 搜索条件字段
	 */
	pwList: any[];				//系统默认的配伍字典列表
	pwFlag: any;				//配伍标识
	drugA: string;
	drugB: string;
	urlParam: string = "";		//搜索条件参数
	currentPage = 1;			//当前页
	selectedDataList: any;

	table: any = {
        title:[{
                id: 'drug1',
                name: '药品A',
				width: "20%"
            }, {
				id: 'drug2',
				name: '药品B',
				width: "20%"				
			}, {
				id: 'pwMessageDto.flag',
				name: '配伍标识',
				width: "10%"
			}, {
				id: 'pwMessageDto.message',
				name: '配伍警示信息',
				width: "25%"
			}, {
				id: 'pwMessageDto.level',
				name: '警示等级',
				width: "10%"
			}, {
				id: '',
				name: '操作',
				width: "15%"
			}],
        pageSize: 20,
		url: "/api/v1//pwDrugMatchList?numPerPage={pageSize}&pageNum={currentPage}",
        dataListPath: "recordList",
        itemCountPath: "recordCount"
    };

	ngOnInit() {
		this.getPwList();
	}

	onClick(trow: any){
		this.selectedDataList = trow;
	}
	getPwList(){
		this.drugMatchService.getPwList()
			.then(res => {
				console.log(res)
				this.pwList = res.data.recordList;
			});
	}
	/**
	 * 配伍增加、修改和删除
	 */
	pwAdd(){
		this.router.navigate(["rule_management/content_management/drug_match_management/drug_match_edit"]);
	}
	pwModify(trow: any){
		this.router.navigate(["rule_management/content_management/drug_match_management/drug_match_edit", trow.pwDrugMatchId]);
	}
	pwDel(trow: any){
		this.dialogPlugin.confirm("删除后数据无法恢复，是否确认删除？", () => {
			this.drugMatchService.delDrugMatch(trow.pwDrugMatchId)
			.then(res => {
				this.dialogPlugin.tip(res.message);
				if(res.code != 200)
					return;
				
				this.tablePlugin.loadDataByUrl();
			});
		}, () => {})
		
	}

	setUrlParam(){
		this.urlParam = this.table.url;
		if(this.pwFlag && this.pwFlag != "default")
			this.urlParam += "&pwFlag=" + this.pwFlag;
		if(this.drugA)	
			this.urlParam += "&drugA=" + this.drugA;
		if(this.drugB)
			this.urlParam += "&drugB=" + this.drugB;
	}

	search(){
		this.setUrlParam();
		this.tablePlugin.loadDataByUrl(this.urlParam, true);
	}

	/**
	 * 检索表头的回车事件
	 */
	private searchInputEntered() : void {
		this.search();
	}
}



