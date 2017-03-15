import { Component, OnInit, ViewChild } from '@angular/core';
import { TablePlugin } from '../../common/ug-table/table.module';
import { Router } from '@angular/router';


@Component({
	selector: 'maintain-logs',
    templateUrl: 'maintain_logs.component.html',
	styles: [require('./product.css') + ""],
})
export class MaintainLogsComponent implements OnInit{
    @ViewChild(TablePlugin) tablePlugin: TablePlugin;
	constructor(
		private router: Router) { }
    //搜索条件时间
    dateStart: string;
    dateEnd: string;
    //控件上的时间
    startDate: any;
    endDate: any;

	minStartDate: any;
	maxStartDate:any = {year: new Date().getFullYear(), month: new Date().getMonth() + 1, day: new Date().getDate()};
	minEndDate: any;
	maxEndDate:any = {year: new Date().getFullYear(), month: new Date().getMonth() + 1, day: new Date().getDate()};        //设定药品核准时间的最大值为今天string;

    ngOnInit(){
		
    }

    logsTable:any = {
        title:[
            {	
				id: 'operation',
                name: '操作'
            }, {
				id: 'details',
				name: '详情'
			}, {
				id: 'operatedName',
				name: '操作人',
			}, {
				id: 'operatedDate',
				name: '操作时间',
                type: 'dateY'
			}
		],
        pageSize: 20,
        url: "/api/v1/productModifyRecordList?numPerPage={pageSize}&pageNum={currentPage}",
        dataListPath: "recordList",
        itemCountPath: "recordCount"
    }
    search(){
        let tempUrl = `${this.logsTable.url}`;
		//时间格式转换
		this.startDate = this.objToDate(this.dateStart);
		this.endDate = this.objToDate(this.dateEnd);

        if(this.startDate)
            tempUrl += `&startDate=${this.startDate}`;
        if(this.endDate)
            tempUrl += `&endDate=${this.endDate}`;
        	
		this.tablePlugin.loadDataByUrl(tempUrl, true);
    }

	showDetail($event: any){
		let link = ['drug_management/drug_data/product_management/product_detail', $event.productId, false];
		this.router.navigate(link);
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
}