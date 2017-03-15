import { Component, OnInit, Input, ViewChild, Output, Injectable } from '@angular/core';
import { Router } from '@angular/router';
// 引入插件
import { DialogPlugin, DialogModel } from '../../common/ug-dialog/dialog';
import { TablePlugin } from '../../common/ug-table/table.module';
import { UserService } from '../../user.service';
import { DataDetailService } from './data_detail.service';

class DataList {
	docName: string;
	docType: string;
	orgName: string;
	userCreate: string;
	timeCreate: string;
}
class searchWord {
	docName: string;
	createdName: string;
	docType: string;
}
@Injectable()
export class MyTableService {
	selectedRow: any;
}

@Component({
	selector: 'data-content-management',
	styles: [require('./content_management.component.css') + ""],
	template: require('./data_content_management.component.html'),
	providers: [MyTableService, DataDetailService]
})
export class DataContentManagementComponent {
	@ViewChild(DialogPlugin) dialogPlugin: DialogPlugin;
	@ViewChild(TablePlugin) tablePlugin: TablePlugin;
	dataType: number; //0:书籍资料  1:期刊杂志  2:电子文献  3:电子公告  4:其他资料
	selectedRow: any;
	/**
	 * 搜索条件对象
	 * docName => 名称, docType => 资料类型, createdName => 添加人 
	 */
	searchWord: searchWord = new searchWord();

	selectedData: any;  //add by wanggm
	table: any = {
		title:[
			{
				id: 'docName',
				name: '资料名称',
				width: "20%"
			}, {
				id: 'dpds',
				name: '药品/产品/诊断',
				width: "20%"
			}, {
				id: 'docType',
				name: '资料类型',
				width: "10%"
			}, {
				id: 'orgName',
				name: '资料来源',
				width: "20%"
			}, {
				id: 'userCreate',
				name: '添加人',
				width: "10%"
			}, {
				id: 'timeCreate',
				name: '添加时间',
				width: "10%"
			}, {
				id: '',
				name: '操作',
				width: "10%"
			}],
		pageSize: 20,
		url: "/api/v1/collectList?numPerPage={pageSize}&pageNum={currentPage}",
		dataListPath: "recordList",
		itemCountPath:"recordCount"
	};

	dpdTypeList = ["药品", "产品", "诊断"];
	docTypeList = ["书籍资料", "期刊杂志", "临床指南", "临床路径", "报纸", "药品安全警示", "医药法规", "其他资料"];
	stateAuditList = ["未审核", "已审核","已审核"];//1是未审核，2、3是已审核

	constructor(
		private router: Router,
		private myTableService: MyTableService,
		private userService: UserService,
		private dataDetailService: DataDetailService) { }

	//检索资料
	search(isSearch?: boolean) {
		let tempUrl = this.table.url;
		
		for(let attr in this.searchWord){
			if(this.searchWord[attr]){
				tempUrl += `&${attr}=${this.searchWord[attr]}`;
			}
		}
		this.tablePlugin.loadDataByUrl(tempUrl, isSearch);
	}
	//enter 搜索
	keyupHandle(){
        this.search();
    }

	// 添加新资料
	addData() {
		this.dialogPlugin.myModule();
	}

	onClick(trow: any) {
		this.selectedData = trow;
	}
	onDblClick(trow: any) {
		//console.log("onDblClick:");
		this.onClick(trow);
		
		//随后触发查看详情/修改页面
		this.gotoDetail(trow);
	}

	//点击修改，跳转页面
	gotoDetail(trow: any) {
		console.log("修改资料内容:" + "数据行ID[" + trow.id + "], 资料类型:[" + this.docTypeList[trow.docType] + "]" );

		let link = ['data_management/content_management/data_content_management/edit_data_content',
			trow.docType,
			trow.id];
		this.router.navigate(link);
	}

	//删除表中数据
	deleteData(trow: any) {
		this.selectedData = trow;
		this.dialogPlugin.confirm("确定要删除吗？", () => {
			this.deleteFromDataList();
		}, () => { });
	}

	deleteFromDataList() {
		this.dataDetailService.del(this.selectedData.id)
			.then(res => {
				this.dialogPlugin.tip(res.message);
				if(res.code != 200){
					return;
				}
				this.search();
			})
			.catch()
	}

	gotoEditContent(docType: number) {
		let link = ['data_management/content_management/data_content_management/edit_data_content',	docType];
		
		this.router.navigate(link);
	}
}



