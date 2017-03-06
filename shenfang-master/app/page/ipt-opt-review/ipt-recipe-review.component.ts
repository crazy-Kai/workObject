import { Component, OnInit, ViewChild }      from '@angular/core';

import { RecipeListService } from './recipe-list.service';
import { TablePlugin } from '../../plugin/ug-table/table.module';
import { MusetipsComponent } from '../common/mousetips/mousetips.component';
import { TimeIntervalComponent } from '../common/time-interval/time-interval.component';
import { RecipeSearchParams } from './recipe-search-param';
@Component({
    selector: 'ipt-recipe-review',
    templateUrl: 'ipt-recipe-review.component.html',
    styleUrls: [ 'recipe-review.component.css' ],
    providers: [ RecipeListService ]
})
export class IptRecipeReviewComponent implements OnInit {
    //搜索参数变量
    private searchParams: RecipeSearchParams = new RecipeSearchParams();
    //参数列表对象
    private deptList: any[] = [];
    private doctorList: any[] = [];
    private drugCategoryList: any[] = [];
    private drugList: any[] = [];
    private auditDoctorList: any[] = [];
    //展开收起全部条件
    fullMode: boolean = true;

    drugClassifyName: string = '';
    //科室组件参数
    deptId: string;         //机构ID
    deptType: string = '3';       //机构平台类型
    //药品名称
    private drugOption: any = {
        placeholder: '请输入药品名称',
        api: '/api/v1/drugList',
        width: '140px',
    };
    // 科室院区
    private activeZone: any[] = [];
    private activeDept: any[] = [];
    zoneIds: string;
    deptIds: string;
    zoneIdspure: string;        //用于加载选中院区的医生列表
    // 科室组件初始化属性
    private deptOptions: any = {
        isShow: false,
        inputType: 3,
        deviationWidth: 350,
    };
    //医生组件
    private doctorOption: any = {
        placeholder: '请输入药品名称',
        api: '/api/v1/doctorInZone',
        width: '140px',
        variable: {
            key: 'zoneIds',
            value: this.zoneIds
        }
    }

    touchedTrow: any;

    @ViewChild(TablePlugin) tablePlugin: TablePlugin;

    constructor(
        private recipeListService: RecipeListService
    ) {}


    
    ngOnInit(){
        console.log(this.searchParams)
        this.initSearchParam();
    }
    
    initSearchParam(){
        //加载审方药师
        this.recipeListService.getAuditDoctorList('1')
            .then(res => {
                if(typeof(res)!='array') return;
                this.auditDoctorList = res;
            })
    }
    updateSearchTime($event: any){
        this.searchParams.startTime = $event.startTime;
        this.searchParams.endTime = $event.endTime;
    }
    updateDept($event: any){
        console.log($event)
    }
    //搜索
    search(){
        let query: string = this.recipeListTable.url;

        for(let attr in this.searchParams){
            if (this.searchParams[attr]) {
				query += `&${attr}=${this.searchParams[attr]}`;
			}
        }

        this.tablePlugin.loadDataByUrl(query, true);
    }

    recipeListTable: any = {
        title:[{
                name: '',
            },
            {
                id: 'zoneName',
                name: '医院'
            },
            {
                id: 'deptName',
                name: '科室'
            },
            {
                id: 'auditTime',
                name: '审核时间'
            },
            {
                id: 'checkTime',
                name: '复核时间'
            },
            {
                id: 'eventNo',
                name: '住院号'
            },
            {
                id: 'patientId',
                name: '患者号'
            },
            {
                name: '操作',
            }],
        pageSize: 20,
        url: "/api/v1/ipt/all/iptList?numPerPage={pageSize}&pageNum={currentPage}",
        dataListPath: "recordList",
        itemCountPath: "recordCount"
    };

    /************************ 获取药品分类弹窗 ************************/
    drugCategoryResultList: any[];
    drugCategoryDialogOptions: any;
    @ViewChild('drugCategoryDialog') dialog: any;
    chooseDrug() {
        let choosedDrugsArr = [];
        if(this.drugCategoryResultList){
            this.drugCategoryResultList.map(item => {
                choosedDrugsArr.push(item);
            });
        }

        this.drugCategoryDialogOptions = {
            mutipleChoose: true,
            choosedDrugs: choosedDrugsArr
        }
        this.dialog.show();
    }
    chooseNewCategoryConfirm($event: any) {
        this.drugCategoryResultList = $event;
        
        let drugClassifyNames = [], drugClassifyIds = [];
        $event.map(item => {
            drugClassifyNames.push(item.name);
            drugClassifyIds.push(item.id);
        });
        this.drugClassifyName = drugClassifyNames.join(',');
        this.searchParams.drugClassifyCode = drugClassifyIds.join(',');
    }
    /************************ 获取药品分类弹窗结束 ************************/

    drugNameSelect($event){
        this.searchParams.drugId = $event.id;
        this.searchParams.drugName = $event.name;
    }

    /* 科室选择事件 */
    fnDeptSelect($event){
        this.deptList = $event;
        this.transZoneDeptParam();
    }

    fnZoneDeptDelete(zoneDept, $event){
        if(zoneDept.zoneId){
            this.deptList = this.deptList.filter(item => item.zoneId != zoneDept.zoneId);
        }
        if(zoneDept.id){
            this.deptList.map(zone => {
                for(let attr in zone.idNamePairs){
                    if(zoneDept.id == attr){
                        delete zone.idNamePairs[attr];
                    }
                }
            })
        }
        this.transZoneDeptParam();
        $event.cancelBubble = true;
    }

    transZoneDeptParam(){
        let zoneArr = [],
            deptArr = [],
            zoneArrPure = [];
        this.deptList.map(zone => {
            zoneArrPure.push(zone.zoneId)
            zoneArr.push('zoneId=' + zone.zoneId);
            for(let attr in zone.idNamePairs){
                deptArr.push('deptId=' + attr);
            }
        })

        this.zoneIds = zoneArr.join('&');
        this.deptIds = deptArr.join('&');
        this.doctorOption.variable.value = zoneArrPure.join(',');
    }

    trans2Arr(dept){
        let result = [];
        for(let key in dept){
            result.push({
                id: key,
                name: dept[key]
            });
        }
        return result;
    }
    
    doctorSelect($event: any){
        this.searchParams.doctorId = $event.id;
    }
}