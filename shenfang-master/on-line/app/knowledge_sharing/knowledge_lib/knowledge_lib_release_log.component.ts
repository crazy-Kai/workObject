import { Component, OnInit, ViewChild } from '@angular/core';
import { TablePlugin } from '../../common/ug-table/table.module';


import { KnowledgeLibReleaseRequest } from './knowledge_lib_release_request';
import { KnowledgeLibService } from './knowledge_lib_service';


@Component({
    selector: "knowledges-lib-log-list",
    templateUrl: "./knowledge_lib_release_log.component.html",
    styles: [ 
        require('./knowledge_lib_release_log.css') + ""
    ],
    providers: [
        KnowledgeLibService
    ]
})
export class KnowledgeLibReleaseLogComponent implements OnInit {

    @ViewChild(TablePlugin) tablePlugin: TablePlugin;

    /** 属性区 */
    private libRCLogQuery: KnowledgeLibReleaseRequest;
    private choosedLogRow: KnowledgeLibReleaseRequest;
    private publishedStatusMap = KnowledgeLibReleaseRequest.getPublishedStatusMap();

    /** 数据列表 */
    public knowledgeLibPublishLogListTable: any = {
		title:[
            {
                name: '序号',
            }, {
				id: 'id',
				name: '知识库发布ID'
			}, {
				id: 'publishedTime',
				name: '提交发布时间'
			}, {
				id: 'publishedBy',
				name: '提交发布人'
			}, {
				id: 'publishContent',
				name: '本次发布更新内容',
			}, {
				id: 'testResultContent',
				name: '提交发布测试结果',
			}, {
				id: 'auditedTime',
				name: '审核发布时间',
			}, {
				id: 'auditedBy',
				name: '审核发布人',
			}, {
				id: 'status',
				name: '审核发布结果'
			}
		],
        pageSize: 20,
        url: this.knowledgeLibService.getBaseUrl() + "?pageSize={pageSize}&currentPage={currentPage}",
        dataListPath: "recordList",
        itemCountPath: "recordCount"
	}

    /** 查询表头的数据 */
    private publishId: string;          //查询发布ID
    private fromPublishedTime: any;  //查询发布时间起点
    private toPublishedTime: any;    //查询发布时间终点
    private auditedByName: string;      //查询发布人
    private auditedBy: string;          //查询发布人的ID
    private fromAuditedTime: any;    //查询审核时间起点
    private toAuditedTime: any;      //查询审核时间终点
    private auditedStatus: number;    //查询审核发布结果

    /** 日期控件 - 属性区 */
    public startPublishedDate: string;
    public endPublishedDate: string;
    public startAuditedDate: string;
    public endAuditedDate: string;

    public constructor(private knowledgeLibService: KnowledgeLibService) {}

    /** 组件方法区 */


    /** 组件生命周期 - 方法区 */
    public ngOnInit() {
     
    }

    /**
     * 页面组件,时间组件,更新值
     */
    private datePickerChange(event: any, element: any) {
        let time: number = new Date( event.year, event.month-1, event.day).getTime();
        let eleName = element._elRef.nativeElement.name;
        
        console.log(eleName + ":" + event.year + "-" + event.month + "-" + event.day);

        switch ( eleName ) {
            case "fromPublishedTime":
                this.fromPublishedTime = time;
                break;
            case "toPublishedTime":
                this.toPublishedTime = time;
                break;
            case "fromAuditedTime":
                this.fromAuditedTime = time;
                break;
            case "toAuditedTime":
                this.toAuditedTime = time;
                break;
            default:
                console.error("参数错误");
        }
    }

    /** 知识库发布日志 - 检索 - 按钮 */
    //publishId=1&fromPublishedTime=1&toPublishedTime=1&publishedBy=admin
    //&fromAuditedTime=1&toAuditedTime=1&auditedBy=admin&status=审核通过&pageNo=1&pageSize=20
    private queryPublishLog() {
        console.log("发布日志检索：");

        let tempUrl = `${this.knowledgeLibPublishLogListTable.url}`;

        // 提交发布时间：fromPublishedTime
        if(this.fromPublishedTime) {
            tempUrl += `&fromPublishedTime=${this.fromPublishedTime}`;
        }
        
        // 提交发布时间：toPublishedTime
        if(this.toPublishedTime) {
            tempUrl += `&toPublishedTime=${this.toPublishedTime}`;
        }

		//审核人 - 联想框数据
		if(this.auditedByName){
            tempUrl += `&auditedBy=${this.auditedByName}`;
		}

        // 审核发布时间：fromAuditedTime
        if(this.fromAuditedTime) {
            tempUrl += `&fromAuditedTime=${this.fromAuditedTime}`;
        }

        // 审核发布时间：toAuditedTime
        if(this.toAuditedTime) {
            tempUrl += `&toAuditedTime=${this.toAuditedTime}`;
        }

        // 审核发布结果：status
        if(this.auditedStatus) {
            tempUrl += `&status=${this.auditedStatus}`;
        }
        console.log(tempUrl);
		this.tablePlugin.loadDataByUrl(tempUrl, true);
    }
}