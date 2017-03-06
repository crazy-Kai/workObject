import { Component, OnInit, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

import { AlertMessageDetailsService } from './alert-message-details.service';
import { AlertMessageDetails } from './alert-message-details';
import { TablePlugin } from '../../plugin/ug-table/table.module';

@Component({
    selector: 'audit-plan-choose',
    templateUrl: 'alert-message-details.component.html',
    styleUrls: ['alert-message-details.component.css'],
    providers: [
                AlertMessageDetails,
                AlertMessageDetailsService
                ]
})

export class AlertMessageDetailsComponent implements OnInit {

    //控制页面序号
    private pathNum: number;
    private msg: Object = {
        drugId: '',    //警示名称
        analysisType: '', //分析类型
        analysisResultType: '',  //提示类型
        severity: '',    //警示等级
        advice: '',    //建议
        message: '',    //警示内容
        messageId: '',
        expertStatus: '',      //警示状态
        applyStatus: '',         //申请状态
        statusIn: '',
        statusOut: '',
        statusRecipe: ''
    };
    //确认按钮
    private isAgree: boolean = true;
    //待查按钮
    private isLook: boolean = true;
    //描述按钮
    private isDescribe: boolean = true;

    private recipeListTable: any;

    private param: any;

    private status: any;

    private remark: any = '';

    //表格组件
    @ViewChild(TablePlugin) tablePlugin: TablePlugin;

    constructor(
        private alertMessageDetailsService: AlertMessageDetailsService,
        private router: Router,
        private activeRouter: ActivatedRoute
    ) { }


    //根据URl中的hash值来控制警示信息详情两个界面
    ngOnInit() {
        let path = this.activeRouter.url['value'][0].path;
        switch(path){
            case 'alert-message-details':
                this.pathNum = 0;
                break;
            case 'alert-message-details-person':
                this.pathNum = 1;
                break;
            default:
                break;
        }

        this.param = this.activeRouter.params['value'];
        this.getAlertMessageDetails(this.param.productId,() => {
            let partApi =  '';
            switch(this.param.auditObject){
                case '1':
                    partApi = 'opt/all/msgOptRecipeList';
                    this.status = this.msg['statusRecipe'];
                    break;
                case '2':
                    partApi = 'opt/all/msgOptPatientList';
                    this.status = this.msg['statusOut'];
                    break;
                case '3':
                    partApi = 'ipt/all/iptMsgPatientList';
                    this.status = this.msg['statusIn'];
                    break;
                default:
                    break;
            }
            
            let titles = [
                [{
                    id:'zoneName',
                    name:'医院名称'
                },{
                    id:'',
                    name:'处方号'
                },{
                    id:'',
                    name:'处方日期'
                },{
                    id:'view',
                    name:'查看'
                }],
                [{
                    id:'zoneName',
                    name:'医院名称'
                },{
                    id:'',
                    name:'患者号'
                },{
                    id:'',
                    name:'就诊日期'
                },{
                    id:'view',
                    name:'查看'
                }],
                [{
                    id:'zoneName',
                    name:'医院名称'
                },{
                    id:'',
                    name:'患者号'
                },{
                    id:'',
                    name:'医嘱日期'
                },{
                    id:'view',
                    name:'查看'
                }]
            ]
            
            this.recipeListTable = {
                title: titles[parseInt(this.param.auditObject)-1],
                pageSize: 20,
                url: '/api/v1/'+ partApi +'?numPerPage={pageSize}&pageNum={currentPage}',
                dataListPath: "recordList",
                itemCountPath: "recordCount"
            };
        });
    }

    getAlertMessageDetails(id: number, success: any) {
        this.alertMessageDetailsService.getIptPatientMsgList(id)
            .then(res => {
                this.msg = res.data;

                success();
            });
    }

    alertMssageStatus(status){
        let param = {
            messageId: new Number(this.msg['messageId']),
            status: status
        };
        this.alertMessageDetailsService.alertMssageStatus(param)
        .then(res => {
            if(res.message){
                alert(res.message);
            }
            if(res.code == 200){
                this.msg['applyStatus'] = status;
            }
        });
    }

    goRecipeDetail(trow){
        this.router.navigate([this.param.auditObject!='3'?'/opt-recipe-review-details':'/ipt-recipe-review-details', trow.optRecipeId]);
    }

    describe(){
        let param = {
            messageId: this.msg['messageId'],
            applyType: this.msg['applyType']
        };
        this.alertMessageDetailsService.openAlertMsgDpRemark(param)
        .then(res => {
            if(res.message){
                alert(res.message);
            }
            if(res.code == 200){
                this.isDescribe = false;
            }
        });
    }

    saveDescribe(textarea){
        let param = {
            messageId: this.msg['messageId'],
            applyType: this.msg['applyType'],
            remark: this.remark
        };
        this.alertMessageDetailsService.alertMsgDpRemark(param)
        .then(res => {
            if(res.message){
                alert(res.message);
            }
            if(res.code == 200){
                this.isDescribe = true
            }
        });
    }
}
