import { Component, OnInit, Input, ViewChild, ElementRef, Output, EventEmitter, } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { PathLocationStrategy } from '@angular/common';
import { DialogPlugin, DialogModel} from '../../common/ug-dialog/dialog';
import { KnowledgeLibService } from './knowledge_lib_service';
@Component({
	selector: 'export-package',
	templateUrl:'export_package.component.html',
	styles: [require('./knowledge_lib_export.css') + ""],
	providers: [ KnowledgeLibService, PathLocationStrategy ]
})
export class ExportPackageComponent implements OnInit{
	@Input() org: any;			//传入机构名称
	@Input() dateFromTime: number;
	@Input() dateToTime: number;
	@Output() destoryComponent: EventEmitter<any> = new EventEmitter();
	@ViewChild(DialogPlugin) dialogPlugin: DialogPlugin;
	constructor(
		private router: Router,
		private knowledgeLibService: KnowledgeLibService,
		private pathLocationStrategy: PathLocationStrategy
    ) { }
	hospitalName: string;
	Kpackage: any = {};
	exporting: boolean = false;				//导出进行中
	initialing: boolean = true;				//初始化获取进度过程中，先隐藏页面
	maxEndDate: any;		//最大可选时间
	dateEnd: string;		//view 层截止时间
	startDate:string;		//view 层开始时间

	exportingProgress: any = '0%'; 	//进度  
	ngOnInit() {
		this.hospitalName = this.org.name;
		this.Kpackage.hospitalId = this.org.id;
		this.maxEndDate = this.dateToObj(this.dateToTime);
		this.dateEnd = this.dateToString(this.dateToTime);
		this.Kpackage.dataToTime = this.dateToTime;
		this.Kpackage.dataFromTime = "";
		this.Kpackage.updateMode = 'ALL';	//默认全量导出
		this.Kpackage.systemVersionType = "";	//指定为空，使得页面渲染时，选择“---请选择---”来提示用户
		this.Kpackage.patientRule = "";			//指定为空，使得页面渲染时，选择“---请选择---”来提示用户
		
		this.Kpackage.updateModeMap = {
			"PATCH": "增量",
			"ALL": "全量"
		};
		this.Kpackage.updateModeString = "";

		this.Kpackage.patientRuleMap = {
			"ONLY": "只含患教",
			"WITHOUT": "不含患教",
			"ALL": "全部规则保留"
		}
		this.Kpackage.patientRuleString = "";

		this.getExportProgress(true);
	}
	

	transDate($event: any){
		this.Kpackage.dataFromTime = this.objToDate($event);
	}

	/**
	 * 真正开始的导出逻辑
	 */
	private startExport(debug?: boolean): void {
		if ( debug ) {
			console.log("系统类型:" + this.Kpackage.systemVersionType + ", " + this.Kpackage.systemVersion);
		}

		this.knowledgeLibService.startExport(this.Kpackage).then(res => {
			if (debug) console.log(res);

			if(res.code != '200'){
				this.dialogPlugin.tip(res.message);
			}
			this.exporting = true;
			this.checkedProgress();
		});
	}

	/**
	 * 导出按钮事件: 弹出二次确认浮动层
	 */
	private confirmExport(debug?: boolean) : void {
		let sysType: string = this.Kpackage.systemVersionType;
		if(debug) console.log("已选择-适应系统类型:" + sysType);

		if (!sysType || sysType.length < 1 ) {
			this.dialogPlugin.tip("请选择适应系统类型!");
			return;
		}

		if ( !this.Kpackage.patientRule ) {
			this.dialogPlugin.tip("请选择是否包含患教规则!");
			return;
		}
		if (debug) console.log("已选择-患教规则种类:" + this.Kpackage.patientRule);
		if (debug) console.log("已选择-数据开始时间:" + this.startDate );
		if ( this.Kpackage.updateMode == "PATCH"){

			if (!this.startDate) {
				//如果是增量更新，需要选择“数据更新时间”
				this.dialogPlugin.tip("请选择更新数据开始时间！");
				return;
			}
		}

		//设置患教规则种类的显示文字
		this.Kpackage.patientRuleString = this.Kpackage.patientRuleMap[this.Kpackage.patientRule];
		
		//设置更新方式的显示文字
		this.Kpackage.updateModeString = this.Kpackage.updateModeMap[this.Kpackage.updateMode];

		//解析系统类型的显示文字、传参数据
		this.Kpackage.systemVersion = sysType.split("|")[0];
		this.Kpackage.systemVersionString = sysType.split("|")[1];

		this.dialogPlugin.myDialog( "知识管理平台更新包导出信息确认" );
	}

	checkedProgress(){
		let t = setInterval(() => {
			this.getExportProgress(false, t);
		}, 2500);
	}
	getExportProgress(isInit: boolean, t?: any){
		this.knowledgeLibService.getExportProgress(this.Kpackage.hospitalId)
			.then(res => {
				console.log(res)
				if(res.code == '200'){
					this.initialing = false;
					if(res.data){
						//初始化
						if(isInit){
							this.exporting = true;
							this.checkedProgress();
							return;
						}

						this.exportingProgress = res.data.status + '%';
					}else{	//导出完成
						if(isInit){
							this.initialing = false;
							return;
						}

						if(t)
							clearInterval(t);
						this.exportingProgress = '100%';
						setTimeout(() => {
							this.goHistory();
						}, 1000)
					}
				}
			})
	}
	//导出完成后跳转页面
	goHistory(){
		let link = ['knowledge_sharing/knowledge_lib/export_package_list', this.org.id];
		this.router.navigate(link);
	}
	//返回上个组件展示的页面
	goBackList(){
		this.destoryComponent.emit('destory');
		this.pathLocationStrategy.back();
	}
	/**
	 * 时间控件与时间对象的相互转换
	 */
	dateToObj(date: any) {
		let fullDate = new Date(date);
		let dateTo:any = {}
		dateTo.year = fullDate.getFullYear();
		dateTo.month = fullDate.getMonth() + 1;
		dateTo.day = fullDate.getDate();

		return dateTo;
	}
	
	objToDate(oriDate: any): any {
		if (!oriDate)
			return "";
		
		let dateStr = new Date('2000/01/01');
		dateStr.setFullYear(oriDate.year);
		dateStr.setMonth(oriDate.month - 1);
		dateStr.setDate(oriDate.day)
		let datenum = dateStr.getTime();

		return datenum;
	}

	dateToString(date: number){
		let curDate = new Date( date );
		let dateString: string;

		dateString = curDate.getFullYear() + '-' + (curDate.getMonth() + 1) + '-' + curDate.getDate();

		let dateEle = dateString.split("-")

		for(let i = 0; i < dateEle.length; i++){
			if(parseInt(dateEle[i]) < 10){
				dateEle[i] = '0' + dateEle[i];
			}
		}
		dateString = dateEle.join('-');

		return dateString;
	}
}