import { Component, OnInit, ViewChild} from '@angular/core';

import { Http, Response } from '@angular/http';
import {InterceptorService } from 'ng2-interceptors';

//引入插件
import { DialogPlugin } from '../../common/ug-dialog/dialog.plugin';
//引入service
import { UserService } from '../../user.service';

class Func {
	id: string;
    permission: string;
    sort: number;
    name: string;
    type: string;
    resource: string;
    parentId: string;
	resourceList: any;
    icon: string;
    remark: string;
}

@Component({
	selector: 'management-function',
	template:require('./management_function.component.html'),
	styles: [require('./management_function.component.css') + ""],
})

export class FuncManagementComponent implements OnInit {
	funcGroupTree: any;
	saveBtn: boolean;
	disabledSubBtn: boolean;
	addHandle: boolean = false;		//显示添加模块
	updateHandel: boolean = false;	//显示修改模块
	currentFunc: any;				//当前功能

	//
	curFuncId: string;
	curParentId: string;

	@ViewChild(DialogPlugin) dialogPlugin: DialogPlugin;
	constructor(
		private http: InterceptorService,
		private userService: UserService) { }

	ngOnInit(){
		this.currentFunc = new Func();
		this.getFuncTree();
	}

	//返回功能树
	getFuncTree()  : Promise<any>{
		let url = "/api/v1/checkedResource?groups=920bf54e8b4a40dd825f480163673b0c";
		
		return this.http.get(url)
			.toPromise()
			.then(response => {
				if(response.json().code==500) this.userService.isLogin = false;
				this.funcGroupTree = response.json().data;
			})
	}
	//返回当前
	getCurrenFunc(id:string) : Promise<any>{
		let funcId = id ? id : "";
		let url = "/api/v1/resource?id=" + funcId;
		return this.http.get(url)
			.toPromise()
			.then(response => {
				if(response.json().code==500) this.userService.isLogin = false;
				this.currentFunc = response.json().data;
				console.log(this.currentFunc)
			})
			.catch()
	}
	//选中功能树
	getTermExplain($event: any){
		console.log($event);
		this.saveBtn = true;
		this.updateHandel = true;
		this.addHandle = false;
		this.getCurrenFunc($event.node.data.id);
	}

	//添加功能按钮
	// addFuncClick(){
	// 	if(!this.currentFunc.id){
	// 		this.dialogPlugin.confirm("警告：将要新建系统一级功能页，请确认！", () => {
	// 			this.disabledSubBtn = true; //没有上级，不能建立下级功能目录
	// 			this.initAddObj();
	// 			//初始化数据对象
	// 			this.currentFunc.id = "";
	// 			this.currentFunc.name = "";
	// 			this.currentFunc.parentId = "";
	// 			this.currentFunc.permission ="";
	// 			this.currentFunc.remark = "";
	// 			this.currentFunc.resource = "";
	// 			this.currentFunc.resourceList = [];
	// 			this.currentFunc.sort = 0;
	// 			this.currentFunc.type = "";
							
	// 		}, () => {return})
	// 	}else{
	// 		this.disabledSubBtn = false;
	// 		this.initAddObj();
	// 	}
	// }
	//init add obj
	initAddObj(){
		this.updateHandel = false;
		this.addHandle = true;
		this.saveBtn = true;

		this.curFuncId = this.currentFunc.id;	
		this.curParentId = this.currentFunc.parentId;
	}

	//添加修改功能接口
	// saveFunc(){
	// 	let url = "/api/v1/resource";
	// 	console.log(this.currentFunc.parentId)
	// 	//this.currentFunc.id = this.curFuncId;
	// 	if(this.addHandle){
	// 		if(this.currentFunc.parentId == ""){
	// 			this.dialogPlugin.confirm("警告：将要新建系统一级功能页，请确认！", () => {
	// 				this.saveAction(url);
	// 			}, () => {return})
	// 		}else{
	// 			this.saveAction(url);
	// 		}
			
	// 	}else if(this.updateHandel){
	// 		this.updateAction(url);
	// 	}
	// }

	saveAction(url: string)  : Promise<any>{
		 return this.http.post(url, this.currentFunc)
			.toPromise()
			.then(response => {
				if(response.json().code==500) this.userService.isLogin = false;
				if(response.json().code == 200){
					this.dialogPlugin.tip(response.json().message);
					this.getFuncTree();
				}else{
					this.dialogPlugin.tip(response.json().message);
				}
			})
			.catch()
	}
	updateAction(url: string)  : Promise<any>{
		return this.http.put(url, this.currentFunc)
			.toPromise()
			.then(response => {
				if(response.json().code==500) this.userService.isLogin = false;
				if(response.json().code == 200){
					this.dialogPlugin.tip(response.json().message);
					this.getFuncTree();
				}else{
					this.dialogPlugin.tip(response.json().message);
				}
			})
			.catch()
	}
	//删除功能
	// removeFunc(parendId: String){
	// 	if(!this.currentFunc.id) return false;

	// 	this.dialogPlugin.confirm("确定要删除该条功能管理吗？", () => {
	// 		let url = "/api/v1/resource?id=" + this.currentFunc.id;
	// 		this.http.delete(url)
	// 			.toPromise()
	// 			.then(response => {
	// 				if(response.json().code==500) this.userService.isLogin = false;
	// 				this.currentFunc.id = "";
	// 				this.getFuncTree();
	// 			})
	// 			.catch()
	// 	}, () => {return})
		
	// }
}



