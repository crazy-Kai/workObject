import { Component, OnInit, ViewChild} from '@angular/core';
import { Location, PathLocationStrategy, LocationChangeListener } from '@angular/common';
import { Router } from '@angular/router';
import { SpecificationService } from "./specification.service";
import { TablePlugin } from '../../common/ug-table/table.module';
import { DialogPlugin } from '../../common/ug-dialog/dialog.plugin';
import { Http, Response } from '@angular/http';
import { UserService } from '../../user.service';
import { Observable } from 'rxjs/Observable';

class Instruction{
	id:string;
	producer:string;
	genericName:string;
	tradeName:string;
	drugSpec:string;
	drugForm:string;
	approveDate:number;
	createDate:string;
	updateDate:string;
	pinyin:string;
	remark:string;
	isAudit:number;
	auditedUser:string;
	auditTime:string;
	summary:string;
	summaryAutoflag:string;
	knowledge:string;
	patient:number;
	scoreWeight:number;
	smsId:string;
}

@Component({
	selector: 'specification-management',
	styles: [require('./content_management.component.css') + ""],
	template:require('./specification_management.component.html'),
	providers: [
        SpecificationService,
		PathLocationStrategy 
    ]
})

export class SpecificationMangementComponent implements OnInit{
	currentPage = 1;					//当前页
	name:string;						//通用名
	drugForm:string;					//剂型
	producer:string;					//厂家
	auditedBy:string;					//审核人
	createdBy:string;					//添加人
	audit: number = 0;					//审核状态
	
	doExamine: boolean = false;
	curUser: any;						//当前用户
	handler: string;

	drugSuggestionAPI: string = this.specificationService.getDrugSuggestionURL();
	/**
	 * pathLocationStrategy variable
	 */
	isShow: boolean;
	isEdit: boolean;
	isReview: boolean;
	
	instruction: Instruction;
	instructionListURL = '/api/v1/instructionList?pageNum={currentPage}&numPerPage={pageSize}';
	table: any = {
		title:[
			{
				name:"序号",
				type:'index',
				width: '4%'
			},
			{
				id: 'genericName',
				name: '通用名',
				width: '10%'
			},
			{
				id: 'tradeName',
				name: '商品名称',
				width: '10%'
			},
			{
				id: 'drugSpec',
				name: '规格',
				width:'10%',
			},
			{
				id: 'drugForm',
				name: '剂型',
				width: '5%'
			},
			{
				id: 'producer',
				name: '生产企业',
				width:'15%'
			},
			{
				id: 'approveDate',
				name: '最新核准日期',
				type:'dateY',
				width: '8%'
			},
			{
				id: 'createdName',
				name: '添加人',
				width: '5%'
			},
			{
				id: 'createdTime',
				name: '添加时间',
				type:'date',
				width: '10%'
			},
			{
				id: 'isAudit',
				name: '审核状态',
				type:'object',
				object:{
					3:'已审核',
					2:'已审核',
					1:'未审核'
				},
				width: '6%'
			},
			{
				id: 'auditedName',
				name: '审核人',
				width: '6%'
			},
			{
				id: 'auditedTime',
				name: '审核时间',
				type:'date',
				width: '10%'
			}
		],
		needIdx: true,
		pageSize: 20,
		url: "/api/v1/instructionList?pageNum={currentPage}&numPerPage={pageSize}",
		dataListPath: "recordList",
		itemCountPath:"recordCount"
	}
	constructor(
		private specificationService: SpecificationService,
    	private router: Router,
  		private userService:UserService,
		private location: Location,
		private pathLocationStrategy : PathLocationStrategy 
	) { }
	@ViewChild(TablePlugin) tablePlugin: TablePlugin;
	@ViewChild(DialogPlugin) dialogPlugin: DialogPlugin;
	/**
     * 审核人联想框相关
     */
    auditByModel: any; //指定审核人下拉联想框绑定值
    auditPermissionOwnerList: any[]; //有权限审核的人员列表
    searchAuditBy = (text$: Observable<string>) =>
        text$.debounceTime(200).distinctUntilChanged()
        .map(term => term.length < 1 ? []
            : this.auditPermissionOwnerList.filter(v => new RegExp(term, 'gi').test(v.realname)).splice(0, 10));
    searchAuditByFormatter = (x: any) => x['realname'];
	/**
     * 添加人联想框相关
     */
    createByModel: any; //指定审核人下拉联想框绑定值
    createPermissionOwnerList: any[]; //有权限审核的人员列表
    searchCreateBy = (text$: Observable<string>) =>
        text$.debounceTime(200).distinctUntilChanged()
        .map(term => term.length < 1 ? []
            : this.createPermissionOwnerList.filter(v => new RegExp(term, 'gi').test(v.realname)).splice(0, 10));
    searchCreateFormatter = (x: any) => x['realname'];
	
	ngOnInit(){
		this.userService.getUserInfo().then(
			res => {
				this.curUser = res.realname;
			}
		);
		this.userService.getAuditPermissionOwnerList("perms[auditInstruction:put]").then(rs => {
			this.auditPermissionOwnerList = rs['users'];
        });

		this.userService.getCreatePermissionOwnerList().then(rs => {
			this.createPermissionOwnerList = rs;
        });

		this.pathLocationStrategy.onPopState(() => {
			// this.isShow = false;
			// this.isEdit = false;
			// this.isReview = false;
			this.handler = undefined;
		});
	}
	
	popState(){
		let tempUrl = this.location.path;
		console.log(this.location)
	}
	/**
	 * todo  修改页面组件展示逻辑
	 */
	add(){
		this.handler = "add";
		this.instruction = new Instruction();
		
		this.pathLocationStrategy.pushState({"handle": "add"}, "", "data_management/content_management/specification_management/specification_edit#add", "");
	}

	modify(){	//修改
		if(!this.instruction){
			this.dialogPlugin.tip("请选择一条数据");
			return;
		}
		this.handler = "modify";
		this.pathLocationStrategy.pushState({"handle": "modify"}, "", "data_management/content_management/specification_management/specification_edit#modify", "");
	}
	examine(){	//审核
		if(!this.instruction){
			this.dialogPlugin.tip("请选择一条数据");
			return;
		}
		this.handler = "examine";
		this.pathLocationStrategy.pushState({"handle": "examine"}, "", "data_management/content_management/specification_management/specification_edit#examine", "");
	}
	delete() {	//删除
		if (!this.instruction) {
			this.dialogPlugin.tip("请选择一条数据");
			return;
		}

		this.dialogPlugin.confirm('确定删除？', () => {
			// 确认
			this.specificationService.deleteInstruction(this.instruction.id).then(
				res => {
					this.dialogPlugin.tip(res.message);
					if (res.code == 200) {
						this.search();
					}
				}
			);
		}, () => {
			// 取消
		});
	}

	goReview(){	//查看
		this.handler = "review";
		this.pathLocationStrategy.pushState({"handle": "review"}, "", "data_management/content_management/specification_management/specification_edit#review", "");
	}
	goDetail(){
		if(this.userService.hasJurisdiction('instruction:put')){
			this.modify();
		}else{
			this.goReview();
		}
	}
	//
	complete($event: any, type: string){
		this.handler  = "";

		if(type == "edit"){
			if($event == "done"){
				this.search();
			}
		}
	}

	search(isSearch?: boolean){
		let tempUrl = this.table.url;
		if(this.name){
			tempUrl = tempUrl + "&name=" + this.name;
		}
		if(this.producer){
			tempUrl = tempUrl + "&producer=" + this.producer;
		}
		if(this.drugForm){
			tempUrl = tempUrl + "&drugForm=" + this.drugForm;
		}
		if(this.createByModel){
			tempUrl = tempUrl + "&createdBy=" + (typeof(this.createByModel) == "string" ? this.createByModel : this.createByModel.realname);
		}
		if(this.auditByModel){
			tempUrl = tempUrl + "&auditedBy=" + (typeof(this.auditByModel) == "string" ? this.auditByModel : this.auditByModel.realname);
		}
		if(this.audit){
			tempUrl = tempUrl + "&audit=" + this.audit;
		}
		
		this.tablePlugin.loadDataByUrl(tempUrl, isSearch);
		//搜索后失去焦点
		this.doExamine = false;
	}

	onClick($event: any){
		this.instruction = $event;
		this.doExamine = false;
		
		if(this.curUser == $event.auditedName && $event.isAudit == 1) this.doExamine = true;	
	}

	keyupHandle($event: any){
		this.search(true)
	}

}



