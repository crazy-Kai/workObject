import { Component, OnInit, Input, Output, Injectable, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { SearchService } from '../../search.service';
// 引入插件
import { UserService } from '../../user.service';
import { TablePlugin } from '../../common/ug-table/table.module';
import { DialogPlugin, DialogModel } from '../../common/ug-dialog/dialog';
class DataList {
		docName: string;
		docType: string;
		orgName: string;
		userCreate: string;
		timeCreate: string;
		stateAudit: string;
		userAudit: string;
		timeAudit: string;
	}
@Injectable()
export class MyTableService {
	selectedRow: any;
	docType: number;
	userCreate: string;
	userAudit: string;
	stateAudit: number;
}

@Component({
	selector: 'data-grade',
	template: require('./data_grade.component.html'),
	providers: [MyTableService, DialogPlugin]
})
export class DataGradeComponent {

	dataInfoUrl = '/api/v1/collectScoreList?numPerPage={pageSize}&pageNum={currentPage}&docType=1';
	table: any = {
		title: [
			{
				id: 'docName',
				name: '资料名称',
				width: '200px'
			}, {
				id: 'dpds',
				name: '药品/产品/诊断',
				width: '200px'
			}, {
				id: 'docType',
				name: '资料类型',
				width: '100px'
			}, {
				id: 'nameBook',
				name: '资料来源',
				width: '100px'
			}, {
				id: '',
				name: '文献类型',
				width: '100px'
			}, {
				id: 'scoreStatus',
				name: '状态',
				width: '200px'
			}, {
				id: '',
				name: '1号评分人/时间',
				width: '140px'
			}, {
				id: '',
				name: '2号评分人/时间',
				width: '140px'
			}, {
				id: 'auditTime',
				name: '审核人/时间',
				width: '120px'
			}, {
				id: 'userCreate',
				name: '添加人/时间',
				width: '120px'
			}],
		pageSize: 20,
		url: "/api/v1/collectScoreList?pageNum={currentPage}&numPerPage={pageSize}&docType=1",
		dataListPath: "recordList",
		itemCountPath: "recordCount"
	};

	dpdTypeList = ["药品", "产品", "诊断"];
	docTypeList = ["书籍资料", "期刊杂志", "临床指南", "临床路径", "报纸", "药品安全警示", "医药法规", "其他资料"];
	stateAuditList = ["待评分", "待审核", "自动审核", "已审核", "人工审核"];
	scoreTypeList = { "meta": "Meta分析", "rct": "RCT研究", "nrcs": "非随机临床研究", "cs": "病例对照研究", "ccs": "队列研究", "qhes": "模型法药物经济学研究", "chec": "试验型药物经济学研究" };
	selectedDataList: DataList;
	@ViewChild(TablePlugin) tablePlugin: TablePlugin;
	@ViewChild(DialogPlugin) dialogPlugin: DialogPlugin;
	constructor(
		private router: Router,
		private myTableService: MyTableService,
		private searchService: SearchService,
		private userService: UserService) { }

	canAudit: boolean = false;
	canScore: boolean = false;

	ngOnInit() {
		
	}

	gotoEvaluation(handler: string) {
		if(!this.selectedDataList){
			this.dialogPlugin.tip('请选择一条数据！');
			return;
		}
		let link = ["data_management/content_management/data_grade/data_grade_audit",
			this.myTableService.selectedRow.docType,
			this.myTableService.selectedRow.id,
			this.myTableService.selectedRow.scoreStatus,
			handler];
		this.router.navigate(link);
	}

	onClick(trow: any) {
		this.selectedDataList = trow;
		this.myTableService.selectedRow = trow;
		this.hasAuditRight();
		this.hasScoreRight();
	}
	//检索资料
	search() {
		let tempUrl = this.dataInfoUrl;
		if ((!this.searchService.dataGradeDocName) && (!this.searchService.dataGradeScoreType)
			&& (!this.searchService.dataGradeUserCreate) && (!this.searchService.dataGradeGraders1)
			&& (!this.searchService.dataGradeGraders2) && (!this.searchService.dataGradeGraders0)
			&& (!this.searchService.dataScoreStatus)) {
			this.table.url = this.dataInfoUrl;
			this.tablePlugin.loadDataByUrl(this.table.url, true);
			return;
		}
		if (this.searchService.dataGradeDocName) {
			tempUrl = tempUrl + "&docName=" + this.searchService.dataGradeDocName;
		}
		if (this.searchService.dataGradeScoreType) {
			tempUrl = tempUrl + "&scoreType=" + this.searchService.dataGradeScoreType;
		}
		if (this.searchService.dataGradeUserCreate) {
			tempUrl = tempUrl + "&userCreate=" + this.searchService.dataGradeUserCreate;
		}
		if (this.searchService.dataScoreStatus) {
			tempUrl = tempUrl + "&scoreStatus=" + this.searchService.dataScoreStatus;
		}
		if (this.searchService.dataGradeGraders1) {
			tempUrl = tempUrl + "&graders1=" + this.searchService.dataGradeGraders1;
		}
		if (this.searchService.dataGradeGraders2) {
			tempUrl = tempUrl + "&graders2=" + this.searchService.dataGradeGraders2;
		}
		if (this.searchService.dataGradeGraders0) {
			tempUrl = tempUrl + "&graders0=" + this.searchService.dataGradeGraders0;
		}
		this.table.url = tempUrl;
		this.tablePlugin.loadDataByUrl(this.table.url, true);
	}

	//判断是否有审核权限
	hasAuditRight() {
		if(!this.myTableService.selectedRow){
			alert("请先选择一条数据");
		}

		//不是待审核状态的说明书不能审核
		if(this.myTableService.selectedRow.scoreStatus != 2) {
			this.canAudit = false;
			return;
		}
		if ((this.myTableService.selectedRow.graders1 == this.userService.user.username) || (this.myTableService.selectedRow.graders2 == this.userService.user.username)) {
			this.canAudit = false;
		}else{
			this.canAudit = true;
		}
	}
	hasScoreRight(){
		if(!this.myTableService.selectedRow){
			alert("请先选择一条数据");
		}

		if(this.myTableService.selectedRow.scoreStatus > 2) {
			this.canScore = false;
		}else if(this.myTableService.selectedRow.scoreStatus == 2){
			if ((this.myTableService.selectedRow.graders1 == this.userService.user.username) || (this.myTableService.selectedRow.graders2 == this.userService.user.username)){
				this.canScore = true;
			}
		}else{
			this.canScore = true;
		}
	}
}



