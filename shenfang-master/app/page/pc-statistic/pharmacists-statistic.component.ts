import { Component, OnInit, ViewChild }      from '@angular/core';

import { PharmacistsStatisticService } from './pharmacists-statistic.service'

import { TimeIntervalComponent } from '../common/time-interval/time-interval.component';
import { MusetipsComponent } from '../common/mousetips/mousetips.component';
import { PaginationComponent } from '../common/pagination/pagination.component';
class PharmacistsStatisticSearchParams{
    startTime: string;
    endTime: string;
    pharmacist: string;
    source: string;
    page: number;
    pageSize: number;
    sortBy: string;
    order: string;
}

@Component({
    selector: 'pharmacists-statistic',
    templateUrl: 'pharmacists-statistic.component.html',
    styleUrls: [ 'pharmacists-statistic.component.css' ],
    providers: [ PharmacistsStatisticService ]
})
export class PharmacistsStatisticComponent implements OnInit{
    //搜索参数变量
    private searchParams: PharmacistsStatisticSearchParams = new PharmacistsStatisticSearchParams();
    posInfo: any = {};
    pageInfo: any = {};
    pharmacistStatisticList: any[] = [];
    pharmacistsList: any[];             //药师列表

    titles: any[] = [
        {title: '审查处方数', sortBy: 'pres_number', tips: '药师审查的处方数量，即药师审核通过或打回操作的处方，同一张多次审核算一张'},
        {title: '审查医嘱数', sortBy: 'order_number', tips: '药师审查的医嘱数量，即药师做过通过或打回操作的医嘱，同一份医嘱多次审核算1张'},
        {title: '审查次数', sortBy: 'review_number', tips: '药师通过或打回操作的次数，同一张处方或医嘱多次审核算多张'},
        {title: '干预次数', sortBy: 'gy_number', tips: '药师打回的次数，同一张处方或医嘱多次打回算多次'},
        {title: '医生接纳次数', sortBy: 'doc_take_number', tips: '处方或医嘱被药师打回后，医生修改处方或医嘱的次数，同一张处方或医嘱多次修改算多次'}
    ]

    constructor(
        private pharmacistsStatisticService: PharmacistsStatisticService
    ) {}

    ngOnInit(){
        this.getAuditDoctorList();
        this.getWorkStatistics();
    }

    search(){

    }

    //获取药师列表
    getAuditDoctorList(){
        this.pharmacistsStatisticService.getAuditDoctorList()
            .then(res => {
                if(res.code == '200' && res.data){
                    this.pharmacistsList = res.data;
                }
            })
    }

    //获取药师工作统计列表
    getWorkStatistics(){
        let query: string = "";
        
        for(let attr in this.searchParams){
            if (this.searchParams[attr]) {
				query += query ? `&${attr}=${this.searchParams[attr]}` : `${attr}=${this.searchParams[attr]}`;
			}
        }
        
        this.pharmacistsStatisticService.getWorkStatistics(query)
            .then(res => {
                if(res.code == '200'){
                    this.pageInfo = new Object();
                    this.pageInfo.currentPage = res.data.currentPage;
                    this.pageInfo.totalPageCount = res.data.pageCount;
                    this.pageInfo.pageSize = res.data.pageSize;
                    this.pageInfo.recordCount = res.data.recordCount;

                    this.pharmacistStatisticList = res.data.recordList;
                }
            })
    }

    reloadByOrder(sortByObj: any, order: string){
        this.searchParams.sortBy = sortByObj.sortBy;
        this.searchParams.order = order;
 
        this.getWorkStatistics();
    }

    //时间控件交互
    updateSearchTime($event: any){
        this.searchParams.startTime = $event.startTime;
        this.searchParams.endTime = $event.endTime;
    }
    //分页控件交互
    setPage($event: any){
        this.searchParams.page = $event;
        this.getWorkStatistics();
    }
    setPageSize($event: any){
        this.searchParams.pageSize = $event;
        this.getWorkStatistics();
    }
    //联想框组件交互
    updatePharmacist($event: any){
        this.searchParams.pharmacist = $event;
    }
    //鼠标提示
    showTips($event: any, tar: any){
        tar.show = true;
        this.exportTarPos($event);
    }
    hideTips(tar: any){
        tar.show = false;
    }
    exportTarPos($event: any){
        this.posInfo.left = $event.target.x;
        this.posInfo.top = $event.target.y;
        this.posInfo.offsetWidth = $event.target.width;
    }
}