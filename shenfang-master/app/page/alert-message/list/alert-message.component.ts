import { Component, ViewChild, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { TablePlugin } from '../../../plugin/ug-table/table.module';
import { TimeIntervalComponent } from '../../common/time-interval/time-interval.component';
import { ZoneDeptWrapComponent } from '../../common/zone-dept/zone-dept-wrap/zone-dept-wrap.component';
import { Router, ActivatedRoute } from '@angular/router';
import { Headers, Http } from '@angular/http';

@Component({
	selector: 'alert-message',
	templateUrl: 'alert-message.component.html',
	styleUrls: [ 'alert-message.component.css', '../../common/popup-add.css' ]
})

export class AlertMessageComponent implements OnInit{
    private headers = new Headers({'Content-Type': 'application/json'});
    private drugCategoryResultList: any[];
    //展开收起全部条件
    private fullMode: boolean = true;
    //控制具体哪个页面
    private pathNum: number;
    // 自动填充－医生
    // private doctorOption: any = {
    //     placeholder: '请输入医生名称',
    //     api: '/api/v1/doctorInZone'
    // };
    // 自动填充－药品名称
    // private drugOption: any = {
    //     placeholder: '请输入药品名称',
    //     api: '/api/v1/drugList'
    // };
    // 科室院区
    private activeZone: any[] = [];
    private activeDept: any[] = [];
    // 分析类型，提示类型－提示类型从分析类型children取
    private analysisTypeOption: any = {
        width: '80%',
        api: '/api/v1/analysisType'
    };
    // 提示类型
    private analysisResultTypeList: any[] = [];
    // 查询条件封装对象
    private searchParams: any = {
        startDate: '',               //开始时间
        endDate: '',                 //结束时间
        auditObject: '1',            //审核对象
        recipeSource: '',           //来源
        drugIds:'',                  //药品分类
        productName:'',              //药品名称
        zoneId:'',                   //院区
        deptId:'',                   //科室
        analysisType: '',            //分析类型
        analysisResultType: '',      //提示类型
        doctorId:'',                 //医生
        severitySymbol:'',          //警示信息类型
        severity:'',                //警示等级
        messageStatus:'',           //警示状态
        userAppliedStatus:''        //申请状态
    };
    // 分页相关
    private pageSize: number = 20;
    private currentPage: number = 0;
    private downloadWin: boolean = false;
    private downloadList: any[] = [];
    private dataListUrl: string = "/api/v1/medicationinfo?numPerPage={pageSize}&pageNum=0";
    // 科室组件初始化属性
    private deptOptions: any = {
        isShow: false,
        inputType: 3,
        deviationWidth: 200,
        type: this.searchParams.auditObject == 3 ? 2 : 1
    };
    private deptList: any[] = [];
    private docName: string = '';

    @ViewChild(TablePlugin) tablePlugin: TablePlugin;

    constructor(
        private router: Router,
        private route: ActivatedRoute,
        private http: Http
    ){}

    // 根据url中hash值去控制警示信息管理三个界面
    ngOnInit(){
        let path = this.route.url['value'][0].path;
        switch(path){
        	case 'alert-message':
        		this.pathNum = 0;
        		break;
        	case 'alert-message-person':
        		this.pathNum = 1;
        		break;
        	case 'alert-message-master':
        		this.pathNum = 2;
        		break;
        	default:
        		break;
        }
    }

    // 搜索
    search(){
        let query: string = this.dataListUrl;

        for(let attr in this.searchParams){
            if (this.searchParams[attr]) {
				query += `&${attr}=${this.searchParams[attr]}`;
			}
        }

        this.tablePlugin.loadDataByUrl(query, true);
    }

    // 列表信息
    AMListTable: any = {
        title:[{
                id: 'hisDrugName',
                name: '药品名称'
            },
            {
                id: 'analysisResultType',
                name: '提示类型'
            },
            {
                id: 'severity',
                name: '警示等级'
            },
            {
                id: 'type',
                name: '警示内容'
            },
            {
                id: 'messageStatus',
                name: '警示状态'
            },
            {
                id: 'userAppliedStatus',
                name: '申请状态'
            },
            {
                id: 'count',
                name: '数量'
            },
            {
                name: '操作',
            }],
        pageSize: 20,
        url: this.dataListUrl + '&auditObject=1',
        dataListPath: "recordList",
        itemCountPath: "recordCount"
    };


    // 更新日期
	updateSearchTime($event){
        this.searchParams.startDate = $event.startDate || '';
        this.searchParams.endDate = $event.endDate || '';
	}

    // 获取药品分类弹窗
    drugCategoryDialogOptions: any;
    @ViewChild('drugCategoryDialog') dialog: any;
    chooseDrug() {
        this.drugCategoryDialogOptions = {
            mutipleChoose: true
        }
        this.dialog.show();
    }
    chooseNewCategoryConfirm($event: any) {
        this.drugCategoryResultList = $event;
        this.collectType();
    }
    // 药品删除事件
    drugCategoryResultDelete($event,id){
        this.drugCategoryResultList = this.drugCategoryResultList.filter(function(item){
            return item.id != id;
        });

        this.collectType();
        $event.stopPropagation();
    }
    collectType(){
        let result = [];
        for( let drug of this.drugCategoryResultList){
            result.push(drug.id);
        }
        this.searchParams.drugIds = result.join(',');
    }

    // 科室选择事件
    // fnDeptSelect($event){
    //     this.activeZone = $event.activeZone;
    //     this.activeDept = $event.activeDept;

    //     this.coloctZoneDept();
    // }

    // // 科室删除事件
    // fnZoneDeptDelete(zoneDept,$event){
    //     for(var i=0,len=this.activeZone.length; i<len; i++){
    //         if(this.activeZone[i].id == zoneDept.id){
    //             this.activeZone.splice(i,1);
    //         }
    //     }
    //     for(var i=0,len=this.activeDept.length; i<len; i++){
    //         if(this.activeDept[i].id == zoneDept.id){
    //             this.activeDept.splice(i,1);
    //         }
    //     }

    //     $event.stopPropagation();

    //     this.coloctZoneDept();
    // }

    /* 科室选择事件 */
    fnDeptSelect($event){
        this.deptList = $event;
    }

    fnZoneDeptDelete(type,zoneDept,$event){
        for(let zone of this.deptList){
            if(type == 'zone'){
                if(zone.zoneId == zoneDept.zoneId){
                    this.deptList.splice(this.deptList.indexOf(zone)-1,1);
                }
            }else{
                for(let deptId in zone.idNamePairs){
                    if(deptId == zoneDept.id){
                        delete zone.idNamePairs[deptId];
                    }
                }
            }
        }

        $event.cancelBubble = true;
    }

    trans2Arr(dept){
        let keys = Object.keys(dept),
            result = [];
        for(let key of keys){
            result.push({
                id: key,
                name: dept[key]
            });
        }
        return result;
    }

    private coloctZoneDept(){
        let zoneList = [],
            deptList = [];
        for(let zone of this.activeZone){
            zoneList.push(zone.id);
        }
        for(let dept of this.activeDept){
            deptList.push(dept.id);
        }

        this.searchParams.zoneId = zoneList.join(',');
        this.searchParams.deptId = deptList.join(',');
    }

    // 分析类型选择事件
    private analysisTypeSelect($event){
        this.analysisResultTypeList = $event.children || [];

        this.searchParams.analysisType = $event.id;
    }

    // 药品名称选择事件
    private drugNameSelect($event){
        this.searchParams.productName = $event.name;
    }

    // 医生选择事件
    private doctorSelect($event){
        this.searchParams.doctorId = $event.id;

        this.docName = $event.name;
    }

    goAlertMsgDetail(trow: any) {
        this.router.navigate(['/alert-message-details', trow.messageId, this.searchParams.auditObject]);
    }

    private export(){
        let query: string = this.AMListTable.url;

        for(let attr in this.searchParams){
            if (this.searchParams[attr]) {
                query += `&${attr}=${this.searchParams[attr]}`;
            }
        }

        this.http.get('/api/v1/medicationinfo/export?'+query, {headers: this.headers})
           .toPromise()
           .then(res => {
               var _msg = res.json().message;
               if(_msg){
                   alert(_msg);
               }
           })
           .catch(this.handleError);
    }

    private handleError(error: any): Promise<any> {
        console.error('An error occurred', error); // for demo purposes only
        return Promise.reject(error.message || error);
    }

    exportList(){
        this.downloadWin = true;

        this.http.get('/api/v1/exportList')
           .toPromise()
           .then(res => {
               let result = this.extractJson(res);
               this.downloadList = result.data.recordList || [];
           })
           .catch(this.handleError);
    }

    private extractJson(res) {
        if (res.status < 200 || res.status >= 300) {
            throw new Error('Bad response status: ' + res.status);
        }
        let body = res.json();
        return body || {};
    }

    fnDownload(download){
        this.http.get('/api/v1/download?taskId='+download.taskId+'&url='+download.url)
           .toPromise()
           .then(res => {
               let result = this.extractJson(res);
               debugger;
           })
           .catch(this.handleError);
    }

    fnDelete(download){
        this.http.delete('/api/v1/export/'+download.taskId)
           .toPromise()
           .then(res => {
               let result = this.extractJson(res);
               if(result.data){
                   alert('删除成功！');
               }
           })
           .catch(this.handleError);
    }

    deptclick($event){
        this.deptOptions.isShow = !this.deptOptions.isShow
        $event.stopPropagation();
    }

    auditObjChange(){
        this.deptOptions.type = this.searchParams.auditObject == 3 ? 2 : 1;
    }
}
