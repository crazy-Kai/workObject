import { Component, Input, OnInit, ViewChild } from '@angular/core';
import {InterceptorService } from 'ng2-interceptors';
import { Http, Response } from '@angular/http';
import { UserService } from '../../user.service';
import { PrivilegeService } from './privilege.service';
//引入插件
import { TablePlugin } from '../../common/ug-table/table.module';
import { DialogPlugin } from '../../common/ug-dialog/dialog.plugin';

//TreeNode 
import { TREE_ACTIONS, KEYS, IActionMapping } from 'angular2-tree-component';

class UserInfo {
	age: number;
	email: string;
	officeQualification: string;
	password: string;
	realname: string;
	remark: string;
	sex: number;
	userdesc: string;
	username: string;
	userGroups: any[] = [];
	fkOrgId: string;
	auditTime: string;
	contactNumber: string;
	company: string;
}
class gettedDrug {
	data: {
		id: string;
		name: string;
	}
}

@Component({
	selector: 'management-user',
	template: require('./management_user.component.html'),
	// styleUrls: ['/management_user.component.css'],
	styles: [require('./management_user.component.css') + ""],
	providers: [PrivilegeService]
})
export class UserManagementComponent implements OnInit {
	@Input()
	searchUrl: string;
	stopUserUrl: string;

	//显示添加和编辑框
	showEditForm: boolean = false;
	userInfo: any;
	handleType: string;   //add, edit
	selectedUser: any;
	comfirmPwd: string;
	userGroups: any[] = [];		//角色管理临时变量
	relationalDrugs: string;	//关联药品显示字符串
	oriDrugs: any[] = [];

	constructor(
		private http: InterceptorService,
		private userService: UserService,
		private privilegeSercive: PrivilegeService) { }

	@ViewChild(TablePlugin) tablePlugin: TablePlugin;
	@ViewChild(DialogPlugin) dialogPlugin: DialogPlugin;

	currentPage = 1;//当前页
	userState = 1;
	handleState = 1;
	username: string = "";

	table: any = {
		title:[{
			name: "序号",
			type: 'index',
			width: "4%"
		}, {
			id: 'username',
			name: '用户名',
			width: "8%"			
		}, {
			id: 'realname',
			name: '姓名',
			width: "8%"
		}, {
			id: 'authGroupDtoList',
			name: '角色',
			width: "12%"
		}, {
			id: 'company',
			name: '工作单位',
			width: "13%"
		}, {
			id: 'officeQualification',
			name: '职务',
			width: "10%"
		}, {
			id: 'contactNumber',
			name: '联系电话',
			width: "10%"
		}, {
			id: 'email',
			name: '邮箱',
			width: "15%"
		}, {
			id: 'createTime',
			name: '创建时间',
			width: "15%"
		}, {
			id: 'state',
			name: '状态',
			width: "5%",
			type: 'object',
			object: {
				1: '启用',
				3: '停用'
			}
		}],
		pageSize: 20,
		url: "/api/v1/authUserList?numPerPage={pageSize}&pageNum={currentPage}&userState=" + this.userState + "&username=" + this.username,
		dataListPath: "authUserDtos",
		itemCountPath: "pageBreakerDto/totalCount"
	};

	ngOnInit() {
		this.userInfo = new UserInfo();
	}

	search() {
		this.table.url = "/api/v1/authUserList?numPerPage={pageSize}&pageNum={currentPage}&userState=" + this.userState + "&username=" + this.username;
		this.tablePlugin.loadDataByUrl(this.table.url, true);
		this.selectedUser = null;
		this.handleState = this.userState;
	}

	//停用用户
	disabledUser() {
		if (!this.selectedUser) {
			this.dialogPlugin.tip("请选择一条数据！");
			return;
		}

		let url = "/api/v1/authUserState?userId=" + this.selectedUser.id;

		this.http.put(url, "")
			.toPromise()
			.then(response => {
				if (response.json().code == 500) this.userService.isLogin = false;
				this.dialogPlugin.tip(response.json().message);
				this.tablePlugin.loadDataByUrl();
				this.selectedUser = "";
			})
			.catch()
	}
	//恢复用户
	enabledUser() {
		if (!this.selectedUser) {
			this.dialogPlugin.tip("请选择一条数据！");
			return;
		}

		let url = "/api/v1/authUserState/" + this.selectedUser.id;

		this.http.put(url, "")
			.toPromise()
			.then(response => {
				if (response.json().code == 500) this.userService.isLogin = false;
				this.dialogPlugin.tip(response.json().message);
				this.tablePlugin.loadDataByUrl();
				this.selectedUser = "";
			})
			.catch()
	}
	//添加用户
	addUser() {
		this.handleType = "add";
		this.userInfo = new UserInfo();
		this.comfirmPwd = "";
		this.relationalDrugs = "";
		this.showEditForm = true;
		this.oriDrugs = [];

		this.getRoleMap("")
			.then(res => {
				if (res.json().code == 500) this.userService.isLogin = false;
				this.userGroups = res.json().data.chooseGroups;
			});
	}
	//编辑用户
	editUser() {
		if (!this.selectedUser) {
			this.dialogPlugin.tip("请选择一条数据！");
			return;
		}

		this.handleType = "edit";
		this.userInfo = new UserInfo();
		this.showEditForm = true;
		this.comfirmPwd = "";

		let userId = this.selectedUser ? this.selectedUser.id : "";
		this.getRoleMap(userId)
			.then(res => {
				if (res.json().code == 500) this.userService.isLogin = false;
				this.userInfo = res.json().data.authUser;
				this.userInfo.password = "";
				this.userInfo.userGroups = [];

				this.userGroups = res.json().data.chooseGroups;
			});
		//获取关联药品信息
		this.privilegeSercive.getDrugUser(userId)
			.then(res => {
				this.oriDrugs = res.data;

				this.formatDrugsListOri(this.oriDrugs);
				this.transformDrug(this.oriDrugs);
			})
	}

	/**
	 * 验证提交信息必填项是否完整
	 */
	private checkUserInfoRequired(handleType: string) : boolean {
		if (!this.userInfo.username) {
			this.dialogPlugin.tip("用户名不能为空!");
			return false;
		}

		if (!this.userInfo.realname) {
			this.dialogPlugin.tip("姓名不能为空!");
			return false;
		}

		if (this.handleType == "add") {
			//只有增加用户时需要校验密码;修改时，可以不用管
			if (!this.userInfo.password) {
				this.dialogPlugin.tip("密码不能为空!");
				return false;
			}

			if (!this.comfirmPwd) {
				this.dialogPlugin.tip("确认密码不能为空!");
				return false;
			}
		}

		return true;
	}

	//保存编辑
	saveUserInfo() {
		//检查提交参数
		if ( !this.checkUserInfoRequired(this.handleType) ) {
			return;
		}

		let url = "/api/v1/authUser";
		this.getUserGroup();

		//检查用户角色是否勾选,如果没有弹框提示
		let ugroupLen = this.userInfo.userGroups.length;
		if ( ugroupLen == 0 ) {
			this.dialogPlugin.tip("请选择用户所属角色!");
			return;
		}

		if (this.handleType == "add") {
			this.privilegeSercive.add(this.userInfo)
				.then(res => {
					console.log(res)
					if (res.code == 500) this.userService.isLogin = false;

					if (res.code == 200) {
			 			this.injectDrugs("add", res.data.id);
			 		}
					this.showEditForm = false;
			 		this.tablePlugin.loadDataByUrl();
			 		this.dialogPlugin.tip(res.message);
				});
		} else if (this.handleType == "edit") {
			this.privilegeSercive.update(this.userInfo)
				.then(res => {
					console.log(res);
					if (res.code == 500) this.userService.isLogin = false;

					if (res.code == 200) {
						this.injectDrugs("edit", res.data.id);
					}

					this.showEditForm = false;
					this.tablePlugin.loadDataByUrl();
					this.dialogPlugin.tip(res.message);
				});
		}
	}
	//注入关联药品
	injectDrugs(type: string, id: string) {
		//console.log(this.drugsID)
		let drugs = this.drugsID.join(",");
		let data: any = {};

		data.userId = id;
		data.drugId = drugs;

		this.privilegeSercive.injectDrugs(type, data);
	}
	//获取用户角色
	getUserGroup() {
		let arrGroups = this.userGroups;
		this.userInfo.userGroups = [];
		for (let i = 0; i < arrGroups.length; i++) {
			if (arrGroups[i].checked == true) {
				this.userInfo.userGroups.push(arrGroups[i].id);
			}
		}
	}

	comparePwd() {
		if (this.comfirmPwd != this.userInfo.password && !(this.userInfo.password == undefined || this.userInfo.password == "")) {
			this.dialogPlugin.tip("两次输入的密码必须一致！");
		}
	}
	//取消编辑
	closeEditForm() {
		this.showEditForm = false;
	}
	//获取当前表格选中行的数据
	onSelectedUser($event: any) {
		this.selectedUser = $event;
	}
	//所属角色
	getRoleMap(userId: string) {
		let url: string;
		if (userId) {
			url = "/api/v1/authUserInfo?userId=" + userId;
		} else {
			url = "/api/v1/authUserInfo?userId="
		}

		return this.http.get(url)
			.toPromise()
			.then(res => {
				return res;
			})
	}

	/**
	 * 关联药品数据转换
	 * 因为药品树获得的药品名称字段名和用户信息获得的药品名称字段不同，这部分数据需要经过转换
	 */
	pushUserGroup(checked: boolean, i: number) {
		if (checked) {
			this.userGroups[i].checked = true;
		} else {
			this.userGroups[i].checked = false;
		}
	}
	//药品数据格式化相关
	formatDrugsListAdd(drugs: any) {
		this.relationalDrugs = "";	//重置字符串
		if (!drugs || drugs.length == 0) return;
		this.drugsID = [];
		let drugsName: any[] = [];
		for (var i = 0; i < drugs.length; i++) {
			drugsName.push(drugs[i].data.name);
			this.drugsID.push(drugs[i].data.id);
		}
		this.relationalDrugs = drugsName.join(", ");
	}
	formatDrugsListOri(drugs: any) {
		this.relationalDrugs = "";	//重置字符串
		this.drugsID = [];
		if (!drugs || drugs.length == 0) return;
		let drugsName: any[] = [];
		for (var i = 0; i < drugs.length; i++) {
			drugsName.push(drugs[i].ypmc);
			this.drugsID.push(drugs[i].id);
		}
		this.relationalDrugs = drugsName.join(", ");
	}
	/**
	 * 转换数据格式
	 * 处理角色获取药品关联数据格式和药品树获取药品关联数据格式不一致的问题
	 */
	transformDrug(data: any) {
		this.checkedPros = [];	//清空数组
		if (!data || data.length == 0) return;

		for (var i = 0; i < data.length; i++) {
			var tempObj: gettedDrug = {
				data: {
					id: "",
					name: ""
				}
			};

			tempObj.data.id = data[i].id ? data[i].id : data[i].data.id;
			tempObj.data.name = data[i].ypmc ? data[i].ypmc : data[i].data.name;

			this.checkedPros.push(tempObj);
		}
	}

	/**
	 * 选择药品关联相关功能
	 * 
	 */
	isDialog: boolean = false;	//选择关联药品
	nodes: any;					//药品树数据
	options: any;				//
	searchWord: string;			//搜索字段
	checkedPros: any[] = [];			//暂存的药品列表
	mediumPros: any[] = [];
	drugsID: Array<any> = [];		//要提交的关联药品id


	actionMapping: IActionMapping = {
		mouse: {
			dblClick: (tree, node, $event) => {
				this.putDrug(node)
			}
		}
	};
	//药品分类数options 配置
	drugTemOptions = {
		getChildren: this.getChildrenNode.bind(this),
		actionMapping: this.actionMapping
	}
	//搜索
	getByValue() {
		this.privilegeSercive.getByValue(this.searchWord)
			.then(res => {
				this.nodes = res.data;
			})
	}
	//获取药品分类
	chooseDrug() {
		this.options = this.drugTemOptions;
		this.transformDrug(this.oriDrugs);	//将获取的关联药品数据转化后赋值给checkedPros变量

		this.privilegeSercive.getCategory()
			.then(res => {
				this.nodes = res.data;
			});
		this.searchWord = "";
		this.isDialog = true;
	}
	//获取当前节点下的药品分类
	getChildrenNode(node: any) {
		return this.privilegeSercive.getChildrenCategory(node.data.id);
	}
	//双击添加药品到右边
	putDrug(node: any) {
		for (let i = 0; i < this.checkedPros.length; i++) {
			if(node.data.id == this.checkedPros[i].data.id)
				return;
		}
		this.checkedPros.push(node)
	}
	cancelProduct(node: any) {
		for (var i = 0; i < this.checkedPros.length; i++) {
			if (node == this.checkedPros[i]) {
				this.checkedPros.splice(i, 1);
			}
		}
	}
	//关闭关联药品分类选择
	onClose() {
		this.isDialog = false;
	}
	//完成关联药品设置
	completeChoose() {
		this.oriDrugs = this.mediumPros = this.checkedPros;

		this.formatDrugsListAdd(this.oriDrugs);
		this.onClose();
	}
}