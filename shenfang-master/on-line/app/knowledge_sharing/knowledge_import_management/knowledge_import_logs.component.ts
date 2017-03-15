import { Component, OnInit, ViewChild } from '@angular/core';
import { TablePlugin } from '../../common/ug-table/table.module';
import { Observable } from 'rxjs/Observable';
//
import { KnowledgeImportService } from './knowledge_import.service';
class SearchQuery {
	startDate: string;
	endDate: string;
	hospitalIds : string;
}

@Component({
	selector: 'knowledge-import-logs',
	templateUrl: 'knowledge_import_logs.component.html',
	styles: [require('./knowledge_import_management.css') + ""],
	providers: [KnowledgeImportService]
})
export class KnowledgeImportLogs implements OnInit {
	@ViewChild(TablePlugin) tablePlugin: TablePlugin;

	constructor(
		private knowledgeImportService: KnowledgeImportService
	) { }

	searchQuery: SearchQuery = new SearchQuery();
	startDate: string;
	endDate: string;
	logLists: any[];
	isHideDialog: boolean = true;
	organizationsList: any[];				//所有机构列表
	filterOrgs: any[];						//筛选过的机构列表
	checkedOrgs: any[] = [];				//选择的机构列表
	orgsStr: string;						//机构选择的显示字段

	minStartDate: any;
	maxStartDate:any = {year: new Date().getFullYear(), month: new Date().getMonth() + 1, day: new Date().getDate()};
	minEndDate: any;
	maxEndDate:any = {year: new Date().getFullYear(), month: new Date().getMonth() + 1, day: new Date().getDate()};        //设定药品核准时间的最大值为今天string;

	ngOnInit() {
		this.search();

		this.knowledgeImportService.getOrgsList()
			.then(res => {
				this.organizationsList = res.data;
				this.mapResult();
			})
	}
	/**
	 * 选择机构分支搜索条件
	 */
	checkOrgs() {
		this.isHideDialog = false;
	}
	mapResult(key?: string) {
		this.filterOrgs = [];
		this.checkedOrgs = [];
		if (!key) {
			this.filterOrgs = this.organizationsList;
			return;
		}
		this.organizationsList.map((item) => {
			if (new RegExp(key, 'gi').test(item.name)) {
				this.filterOrgs.push(item);
			}
		})
	}
	selectOrg(item: any) {
		for (let i = 0; i < this.checkedOrgs.length; i++) {
			if(item.id == this.checkedOrgs[i].id){
				this.checkedOrgs.splice(i, 1);
				return;
			}
		}
		this.checkedOrgs.push(item);
	}
	isChecked(item: any) {
		for (let i = 0; i < this.checkedOrgs.length; i++) {
			if(item.id == this.checkedOrgs[i].id){
				return true;
			}
		}
	}
	submitOrgs() {
		this.orgsStr = "";
		let orgsId: string ="";
		for (let i = 0; i < this.checkedOrgs.length; i++) {
			if(i != 0){
				this.orgsStr += `,${this.checkedOrgs[i].name}`;
				orgsId += `,${this.checkedOrgs[i].id}`;
			}else{
				this.orgsStr += `${this.checkedOrgs[i].name}`;
				orgsId += `${this.checkedOrgs[i].id}`;
			}
		}

		this.searchQuery.hospitalIds = orgsId;
		this.isHideDialog = true;
	}


	search() {
		let paramStr = this.serializeQuery();

		this.knowledgeImportService.getKnowledgeHistoryList(paramStr)
			.then(res => {
				this.logLists = res.recordList;
				this.totalPageCount = res.pageCount;
				this.totalCount = res.recordCount;
			});
	}

	serializeQuery() {
		let paramStr = `numPerPage=${this.pageSize}&pageNum=${this.currentPage}`;
		//时间格式转换
		this.searchQuery.startDate = this.objToDate(this.startDate);
		this.searchQuery.endDate = this.objToDate(this.endDate);

		for (let attr in this.searchQuery) {
			if (this.searchQuery[attr]) {
				paramStr += `&${attr}=${this.searchQuery[attr]}`;
			}
		}

		return paramStr;
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
		if (!oriDate)
			return "";

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
	/**
	 * 分页模块 
	 * # 此处为临时处理, 所以变量夜放在此处 #
	 * # 后期将整合进翻页组件 #
	 */
	pageSize: number = 20;				//单页条数
	currentPage: number = 1; 			//当前页
	totalPageCount: number; 			//总页数
	totalCount: number;					//总条数
	//改变pagesize
	onChangePageSize() {

	}
	firstPage() {
		this.currentPage = 1;
		this.search();
	}
	lastPage() {
		this.currentPage = this.totalPageCount;
		this.search();
	}
	prePage() {
		this.currentPage--;
		this.search();
	}
	nextPage() {
		this.currentPage++;
		this.search();
	}
	/**
	 * 分页模块结束
	 */
}