import { Component, OnInit, Input, ViewChild, ElementRef } from '@angular/core';
import { Router } from '@angular/router';
import { DialogPlugin, DialogModel} from '../../common/ug-dialog/dialog';
import { PathLocationStrategy } from '@angular/common';

import { KnowledgeLibReleaseRequest } from './knowledge_lib_release_request';
import { KnowledgeLibService } from './knowledge_lib_service';
import { UserService } from '../../user.service';

@Component({
	selector: 'knowledge-lib-release',
	templateUrl:'knowledge_lib_release.component.html',
	styleUrls: ["knowledge_lib_release.css"],
	providers: [
		KnowledgeLibService
	]
})
export class KnowledgeLibReleaseComponent implements OnInit {
	@ViewChild(DialogPlugin) 
	private dialogPlugin: DialogPlugin;
	
	@Input("releaseRequest")
	private releaseRequestDto: KnowledgeLibReleaseRequest;		//知识库发布信息子


	/**
	 * 构造函数: 依赖注入
	 */
	constructor(
		private router: Router, 
		private knowledgeLibService : KnowledgeLibService,
		private userService: UserService
	) {	}

	/** 属性区 */
	private publishedStatusMap = KnowledgeLibReleaseRequest.getPublishedStatusMap();

	processNameList:string[] = [
		"提交发布",
		"审核发布"
	];

	processName:string;

	publisherRolePrivilegeString: string = "perms[knowledgePublishes:post]";
	auditorRolePrivilegeString: string = "perms[status:put]";
	isPublisher: boolean;		//当前角色是否是发布人
	isAuditor:   boolean;		//当前角色是否是审核人


	isShowReleaseForm: boolean = false;	//当前用户是否显示提交发布请求表单
	isShowReleaseDetail: boolean = false;	//当前用户是否显示发布请求结果
	isShowTestForm: boolean = false;		//当前用户是否显示提交测试结果表单
	isShowTestDetail: boolean = false;		//当前用户是否显示查看提交测试结果
	isShowAuditButtons: boolean = false;		//当前用户是否显示审核操作按钮
	isShowAuditAreaDetail: boolean = false;	//当前用户是否显示审核
	isAuditConfirmYes: boolean = false;		//当前用户显示审核确认/不通过窗口

	/** 进度条信息 */
	progressQueryGap: number = 2000;		//进度条轮询时间间隔: 2s = 2000ms
	progressWidth: any = "0%";				//进度条初始化长度: 0%
	isShowPublishProgress: boolean = false;	//当前用户是否显示审核提交进度条
	isPublishFailed = false;

	/** 审核相关 */
	private auditStatusTips: string = '';	//审核页面的状态提示
	private auditStatusTipsMap: any = {
		"unfinished": "当前正在提交知识发布请求，尚未进入待审核状态",
		"need-test": "当前等待发布人提交测试情况，尚未进入待审核状态",
		"no-log": "当前无知识发布请求"
	}

	/** mock方法区 */
	private mockDataObject(status: number) {
		this.releaseRequestDto = KnowledgeLibReleaseRequest.mockNewInstance(status);
		return this.releaseRequestDto;
	}

	private mockProgressMoving(progress?: number) {
		let width = progress ? progress : 0;

		console.log("progress:" + width);
		this.progressWidth = width + "%";

		setTimeout(() => {
				this.mockProgressMoving(width+10);
			}, 
			this.progressQueryGap
		);
	}

	/** mock提交发布请求+进度条展示 */
	private mockPostReleaseRequest(releaseReqDes: string, status: number) {
		let dataJson = {
			"publishContent": releaseReqDes
		};
		
		let targetObj = this.mockDataObject(status);
		let res = {"code": 200, "message": "OK", "data": targetObj};
		
		if (res.code != 200) {
			this.dialogPlugin.tip( res.message );
			return;
		}
		this.releaseRequestDto = res.data;

		if( res.data.status >= 100){
			//提交发布,系统处理完毕,显示发布请求详情
			this.publishFinished();
		} else  {
			//提交发布后,没有处理完毕,展示进度,定时轮询
			this.togglePublishProgress(true);
			this.mockQueryPublishProgress(status);
		}
	}

	/** mock进度条展示 */
	private mockQueryPublishProgress(status:number, timer?: any) {
		let progress = status + 10;

		let targetObj = this.mockDataObject(progress);
		let res = {"code": 200, "message": "OK", "data": targetObj};

		console.dir(res.data.status);

		//后台报错
		if (res.code != 200) {
			this.dialogPlugin.tip( res.message );
			this.togglePublishProgress(false);
			return;
		}

		//查询到进度已经完成
		if( res.data && res.data.status >= 100) {
			//提交发布,系统处理完毕
			this.publishFinished();
			this.togglePublishProgress(false);
			return;
		}
	
		//没有处理完毕,更新任务进度条展示状态
		this.progressWidth = res.data.status + "%";

		setTimeout( () => {
				this.mockQueryPublishProgress(progress);
			}, 
			this.progressQueryGap
		);
	}
	//mock方法结束

	/** 组件生命周期-方法区 */
	public ngOnInit() {
		// 首次加载时，去后台查询版本发布情况,是否存在未审核通过的发布申请
		let url = "/api/v1/knowledgePublishes/current";
/*		
		//@fixme:以下代码是mock数据来测试进度展示情况
		//START: mock代码开始
		this.knowledgeLibService.loadInitPage(url).then( res => {
			let targetObjec = this.mockDataObject(1);
			console.dir( targetObjec);

			this.processName = this.processNameList[0];
			this.isShowPublishProgress = true;
			this.isPublishFailed = false;
			this.progressWidth = 1 + "%";

			this.mockProgressMoving();
		});
		//END: mock代码结束,当后台测试通过后，注释所夹代码
*/
		
		//TODO: 根据角色权限,显示不同的内容,现阶段未有后台
		this.isPublisher = this.hasPublisherRole();
		this.isAuditor = this.hasAuditorRole();
		
		//进度展示:mock测试通过后打开
		this.knowledgeLibService.loadInitPage(url).then( res => {
			let status: number = 0;
			if ( res && res.data ) {
				this.releaseRequestDto = res.data;
				status = res.data.status;
			}
			this.initPageElementStatus( status, true );
		});
		
	}

	/** 组件通信-方法区 */
	/**
	 * 权限检查: 是否为提交发布人;
	 */
	private hasPublisherRole(debug?: boolean) : boolean {
		return this.userService.hasJurisdiction( this.publisherRolePrivilegeString, debug );
	}

	/**
	 * 权限检查: 是否为发布审核人
	 */
	private hasAuditorRole(debug?: boolean) : boolean {
		return this.userService.hasJurisdiction( this.auditorRolePrivilegeString, debug );
	}

	/**
	 * 初始化页面各种元素的显示
	 */
	private isPublishFormVisible() : boolean {
		if ( !this.releaseRequestDto || this.releaseRequestDto.status == 104) {
			//1)无发布请求; 2)发布请求审核不通过;
			return true;
		}

		return false;
	}

	/** 发布详情 */
	private isPublishDetailVisible() : boolean {
		//当角色是发布人时,与发布请求表单互斥显示
		if ( this.isPublisher ) {
			return !this.isPublishFormVisible() && this.releaseRequestDto.status >= 100;
		}

		//当角色是审核人时,永远都显示
		if ( this.isAuditor ) {
			return true;
		}
	}

	private isTestFormVisible() : boolean {
		if ( this.releaseRequestDto && this.releaseRequestDto.status == 100) {
			//发布请求执行完毕
			return true;
		}

		return false;
	}

	private isTestDetailVisible() : boolean {
		//当角色是发布人时,与提交测试表单互斥显示
		if ( this.isPublisher ) {
			return !this.isTestFormVisible();
		}

		//当角色是审核人时,存在发布请求,且提交测试结果
		if ( this.isAuditor ) {
			return this.releaseRequestDto && this.releaseRequestDto.status > 100;
		}
	}

	private isAuditButtonVisible() : boolean {
		return this.releaseRequestDto && this.releaseRequestDto.status == 101;
	}

	private fixViewIfAdminUse() : void {
		//同时具有审核人和发布人权限的用户，在本模块中，是具有类管理员的权限
		if ( !this.isAuditor || !this.isPublisher )  return;

		//当前是管理员登陆
		if ( !this.releaseRequestDto || this.releaseRequestDto.status <= 100) {
			//把管理员的权限拆成发布人
			this.isAuditor = false;
			return;
		}

		if ( this.releaseRequestDto.status == 101 || this.releaseRequestDto.status >= 103) {
			//把管理员的权限拆成审核人
			this.isPublisher = false;
			return;
		}
	}

	private initPageElementStatus(status: number, debug?: boolean) {
		if (debug) console.log("[INFO] current publisher status:" + status);
		
		//当管理员访问时，修正其权限，使得能走发布审核流程而渲染页面
		this.fixViewIfAdminUse();				

		if (debug) console.log("isPublisher:" + this.isPublisher + ", isAuditor:" + this.isAuditor);

		// 展示发布页面
		if ( this.isPublisher ) {
			this.renderPageForPublisher();

			//当发布人访问时,如果进度状态是未完成，需要显示进度条
			if (status > 0 && status < 100 ) {
				//隐藏提交表单
				this.dialogPlugin.tip("存在知识库正在发布中，请等待其发布完成");
				
				//显示进度条:发布人
				this.togglePublishProgress(true);
				this.queryPublishProgress();
				return ;
			}
		}

		if ( this.isAuditor ) {
			//当前没有提交发布请求，如果是审核人进来，则需要展示上一次审核结果
			if ( !this.releaseRequestDto) {
				//没有提交发布请求，尝试获取上一次发布成功的记录
				this.knowledgeLibService.getLatestSucess().then( res => {
					console.log("2. post request to get the last success request:");
					if ( res && res.data ) {
						this.releaseRequestDto = res.data;
					}
					this.renderPageForAuditor();
				});
			} else {
				//存在发布请求
				this.renderPageForAuditor();
			}
		}
	}

	private renderPageForPublisher() : void {
		this.processName = this.processNameList[0];
				
		this.isShowReleaseForm = this.isPublishFormVisible();
		this.isShowReleaseDetail = this.isPublishDetailVisible();
		this.isShowTestForm = this.isTestFormVisible();
		this.isShowTestDetail = this.isTestDetailVisible();
	}

	private renderPageForAuditor() : void {
		this.processName = this.processNameList[1];

		this.isShowReleaseDetail = true;
		this.isShowTestDetail = this.isTestDetailVisible();
		this.isShowAuditButtons = this.isAuditButtonVisible();
		
		if(this.releaseRequestDto.status < 100 ) {
			this.auditStatusTips = this.auditStatusTipsMap["unfinished"];
			return;
		}

		if(this.releaseRequestDto.status == 100) {
			this.auditStatusTips = this.auditStatusTipsMap["need-test"];
			return;
		}
	}

	/** 页面元素-方法去 */
	/**
	 * 发布日志 - 点击事件 - 查看
	 */
	public viewReleaseLogs() {
		//console.log("路由跳转: 发布日志");
		
		let link = ['knowledge_lib/knowledge_lib_release/view_release_log'];
		this.router.navigate(link);
	}

	/**
	 * 提交发布请求 - 提交发布 - 按钮 - 二次确认
	 */
	public submitReleaseRequest(releaseReqDes: string) {
		if ( !releaseReqDes || releaseReqDes == "" ) {
			this.dialogPlugin.tip("请填写本次发布的更新内容!");
			return;
		}
		//console.log("提交发布请求:" + releaseReqDes);

		this.dialogPlugin.confirm("是否确认“提交发布”知识库？", () => {
			//隐藏发布请求表单
			this.isShowReleaseForm = false;

			//mock方法测试通过、后台修改正确后即可打开真实
			this.postReleaseRequest(releaseReqDes);

			/*//mock方法测试提交和进度展示
			this.mockPostReleaseRequest(releaseReqDes, 0);
			*/
		}, () =>{});
	}

	/**
	 * 提交发布请求 - 提交发布 - post至后台
	 */
	private postReleaseRequest(releaseReqDes: string) {
		let dataJson = {
			"publishContent": releaseReqDes
		};

		this.knowledgeLibService.postLibPublishRequest(dataJson).then( res => {
			//后台报错
			if (res.code != 200) {
				this.dialogPlugin.tip( res.message );
				return;
			}

			this.releaseRequestDto = res.data;
			if( res.data.status >= 100){
				//提交发布,系统处理完毕,显示发布请求详情
				this.publishFinished();
			} else  {
				//提交发布后,没有处理完毕,展示进度,定时轮询
				this.togglePublishProgress(true);

				setTimeout(() => {
						this.queryPublishProgress();
					},
					this.progressQueryGap
				);
			}
		});
	}

	/** 知识库发布请求成功,展示响应的信息区 */
	private publishFinished() {
		this.dialogPlugin.tip("提交发布请求成功!");
		this.isShowReleaseForm = false;
		this.isShowReleaseDetail = true;
		this.togglePublishProgress(false);
	}

	/** 切换提交发布进度条的展示  */
	private togglePublishProgress(show?: boolean) {
		this.isShowPublishProgress = show === undefined || show ? true : false;
	}

	private queryPublishProgress() {
		this.knowledgeLibService.getCurrentPublishedStatus().then( res => {
			//console.dir(res);
			//后台报错
			if (res.code != 200) {
				this.dialogPlugin.tip( res.message );
				this.togglePublishProgress(false);
				return;
			}

			//20170110@接口现阶段返回data是null,表示当前没有发布请求存在
			if( !res.data ) {
				//这里处理下null空指针问题
				return;
			} 
			
			this.releaseRequestDto = res.data;

			//查询到进度已经完成
			if( res.data.status >= 100) {
				//提交发布,系统处理完毕
				this.publishFinished();
				this.togglePublishProgress(false);

				//重新渲染页面区域
				this.initPageElementStatus(res.data.status, true);
				return;
			}
		
			//没有处理完毕,更新任务进度条展示状态
			this.progressWidth = res.data.status + "%";

			setTimeout( () => {
					this.queryPublishProgress();
				}, 
				this.progressQueryGap
			);
		});
	}

	/**
	 * 提交测试意见 - 保存 - 按钮
	 */
	private submitTestResult(testResult: number, testResultDes:string) {
		if( testResultDes == "") {
			this.dialogPlugin.tip("请填写本次发布的测试意见内容!");
			return;
		}
		// console.log("提交测试结果:" + testResult + ", 测试意见:" + testResultDes);

		this.knowledgeLibService.postTestResult({"decision": testResult, "comment": testResultDes}).then( res => {
			//如果出错
			if (res.code != 200) {
				this.dialogPlugin.tip( res.message);
				return;
			}
			
			//提交测试意见成功,显示测试意见
			if( res.data && res.data.status == 101) {
				//确认后台反馈信息是自测提交成功
				
			} else {
				//自测不通过
			}

			this.isShowTestDetail = true;
			this.isShowTestForm = false;

			//更新数据源
			this.releaseRequestDto = res.data;
			
			this.dialogPlugin.tip( res.message);
		});
	}

	/** 审核操作 - 按钮 - 通过/不通过 (OK) */
	private auditReleaseRequest( status: boolean ) {
		//console.log("审核操作,状态:" + status);

		if (status) {
			//审核通过
			this.isAuditConfirmYes = true;
		} else {
			//审核不通过
			this.isAuditConfirmYes = false;
		}
		// 弹出二次确认窗口
		this.dialogPlugin.myDialog();
	}

	/** 审核操作 - 按钮 - 二次确认: 通过/不通过 (OK) */
	private postAuditConfirmData( auditDes?: string, debug?: boolean) {
		//decision: 103 - 审核通过，104 - 审核不通过
		let status: string = this.isAuditConfirmYes ? "103" : "104";

		//console.log("审核操作,状态:" + status + ", 审核意见:" + auditDes);
		let dataJson = {
			"decision": status,
			"comment": auditDes
		};

		this.knowledgeLibService.putAuditResult(dataJson).then( res => {
			//如果出错
			if (res.code != 200) {
				this.dialogPlugin.tip( res.message);
				return;
			}
			if(debug) console.dir( res );
			
			//提交审核意见成功,显示审核结构
			//TODO:后台接口返回非标准化格式,暂时不能调试
			if( res.data && res.data.status >= 103) {
				//确认后台反馈信息是自测提交成功
				this.isShowAuditButtons = false;
				this.isShowAuditAreaDetail = true;
				this.isAuditConfirmYes = false;
				this.isShowAuditButtons = false;

				//更新数据源
				this.releaseRequestDto = res.data;
			}
			this.dialogPlugin.tip( res.message);
		});
	}

	/** 下载测试用的知识包 */
	private downloadTestPackage(debug?: boolean) {
		if ( debug ) console.log("开始下载知识包:");

		let url = this.knowledgeLibService.getDownloadTestPackageUrl();
		console.log(url);
		
		window.open(url, '_blank');
	}
}