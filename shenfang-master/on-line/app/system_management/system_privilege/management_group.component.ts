import { Component, OnInit, ViewChild, ViewChildren, QueryList, Input} from '@angular/core';

import { Http, Response } from '@angular/http';

//引入插件
import { TablePlugin } from '../../common/ug-table/table.module';
import { DialogPlugin } from '../../common/ug-dialog/dialog.plugin';

//引入service
import { UserService } from '../../user.service';

export class Auth {
	name: string;
	state: number;
	remark: string;
	type: string;
	id: string;
}


@Component({
	selector: 'management-group',
	template: require('./management_group.component.html'),
	styles: [require('./management_group.component.css') + ""]
})
export class GroupManagementComponent implements OnInit {
	handleType: number = 0;	//0 => 基本信息, 1 => 功能授权, 2 => 用户授权
	authGroup: any[];//用户组列表
	curAuthGroup: any;
	authResource: any;//用户资源-功能权限
	authInfo = new Auth();//用户资源-基本信息
	error: any;
	title = "从角色拷贝权限";

	checkedNodes: any[] = [];

	isChooseFromOtherAuth: boolean = false;
	isAddUser: boolean = false;

	selectAuth: any;//选中的角色----功能授权
	selectUser: any;//选中的用户----用户授权
	chooseUserInfo: any;//选中的用户-----用户授权之添加用户
	@ViewChildren(TablePlugin) tablePlugins: QueryList<TablePlugin>;
	@ViewChild(DialogPlugin) dialogPlugin: DialogPlugin;
	currentPage = 1;//当前页

	searchName: string;

	table: any = {
		id: "table",
		title:[{
			name: '序号',
			type: 'index'
		}, {
				id: 'username',
				name: '登陆名称'
			}, {
				id: 'realname',
				name: '用户名称'
			}, {
				id: 'createTime',
				name: '创建时间',
				type: 'date'
			}],
		pageSize: 10,
		dataListPath: "recordList",
		itemCountPath: "recordCount"
    };
	userTable: any = {
		id: "userTable",
		title:[{
			name: "序号",
			type: 'index'
		}, {
				id: 'username',
				name: '用户名'
			}, {
				id: 'realname',
				name: '姓名'
			}, {
				id: 'userdesc',
				name: '角色',
			}, {
				id: 'fkOrgId',
				name: '工作单位'
			}, {
				id: 'officeQualification',
				name: '职务'
			}, {
				id: 'auditTime',
				name: '联系电话',
			}, {
				id: 'email',
				name: '邮箱'
			}, {
				id: 'createTime',
				name: '创建时间'
			}, {
				id: 'state',
				name: '状态',
				type: 'object',
				object: {
					1: '启用',
					3: '停用'
				}
			}],
		needIdx: true,
		pageSize: 20,
		url: "/api/v1/authUserList?numPerPage={pageSize}&pageNum={currentPage}&userState=1",
		dataListPath: "authUserDtos",
		itemCountPath: "pageBreakerDto/totalCount"
    };

	constructor(
		private userService: UserService) { }

	ngOnInit() {
		this.getAuthGroup();
	}

	//获取用户组列表
	getAuthGroup() {
		this.userService.getAuthGroupList()
			.then(authGroup => this.authGroup = authGroup.authGroupDtos,
			error => this.error = <any>error);
	}

	//新增用户组列表
	addNewGroup() {
		this.handleType = 0;
		this.authInfo = new Auth();
		this.authInfo.type = '01';
	}

	getAuth(authgroup: any) {
		this.curAuthGroup = authgroup;
		this.getAuthInfo(authgroup.id);
		this.getAuthResource(authgroup.id);
	}

	//删除用户组
	deleteAuthGroup() {
		if(!this.curAuthGroup || !this.curAuthGroup.id){
			this.dialogPlugin.tip("请选择一个要删除的用户组");
			return;
		}
		this.dialogPlugin.confirm("确定要删除用户吗？", () => {
			this.userService.deleteAuthGroup(this.curAuthGroup.id)
				.then(result => {
					this.dialogPlugin.tip(result.message);
					if (result.code == 200) {
						this.curAuthGroup = null;
						this.authInfo = new Auth();
						this.authResource = null;
						this.getAuthGroup();
					}
				},
				error => this.error = <any>error);
		}, () => { });
	}

	/******组基本信息
	 * -getAuthInfo
	 *   获取用户组基本信息
	 * -putAuthInfo
	 *  保存用户组基本信息
	 * -postAuthInfo
	 *  新建用户组
	 */
	getAuthInfo(id: string) {
		this.userService.getAuthInfo(id)
			.then(authInfo => {
				let curTab: any, searchUrl: string;
				this.authInfo = authInfo.authGroupDto;
				searchUrl = "/api/v1/authGroupUser.json?pageNum={currentPage}&numPerPage={pageSize}&authGroupId=" + this.authInfo.id;
				this.tablePlugins.map(tab => {
					if(tab.table.id == this.table.id)
						curTab = tab;
				})
				curTab.loadDataByUrl(searchUrl);
			},
			error => this.error = <any>error
			)

	}
	saveAuthInfo() {
		if (this.userService.isEmptyObject(this.authInfo)) {
			this.dialogPlugin.tip("存在非空字段，不能保存");
			return;
		}
		if (!this.authInfo.name || !this.authInfo.state ) {
			this.dialogPlugin.tip("存在非空字段，不能保存");
			return;
		}

		if (this.authInfo.id) {
			this.putAuthInfo();
		} else {
			this.postAuthInfo();
		}
	}
	
	/** 更新用户组信息 */
	putAuthInfo() {
		if (!this.authInfo) {
			return;
		}
		this.userService.putAuthInfo(this.authInfo)
			.then(result => {
				this.dialogPlugin.tip("更新角色成功");
				this.getAuthGroup();
			},
			error => this.error = <any>error);
	}

	/** 新增保存用户组信息 */
	postAuthInfo() {
		if (!this.authInfo) {
			return;
		}
		this.userService.postAuthInfo(this.authInfo)
			.then(result => {
				if(result.code != 200){
					this.dialogPlugin.tip(result.message);
					return;
				}
				this.dialogPlugin.tip("保存角色成功");
				this.getAuthGroup();
			},
			error => this.error = <any>error);
	}

	/******功能授权
	 * -closeDialog()
	 *   关闭弹窗
	 * -getOtherAuthBase()
	 *   将选中的用户组功能复制给当前组
	 * -saveAuthGroupMenu()
	 *   保存功能权限
	 */
	//获取用户组功能授权
	getAuthResource(id: string) {
		this.userService.getAuthResource(id)
			.then(authResource => {
				this.authResource = authResource;
				this.selectUser = null;
			},
			error => this.error = <any>error
			)

	}

	saveAuthGroupMenu() {
		this.checkedNodes = [];
		this.recursionGetCheckedNodes(this.authResource);

		if(this.checkedNodes.length < 1){
			this.dialogPlugin.tip("功能授权不能为空，请您选择授权的功能！");
			return;
		}

		this.userService.putAuthGroupMenu(this.authInfo.id, this.checkedNodes)
			.then(result => {
				this.dialogPlugin.tip(result.message);
			},
			error => this.error = <any>error
			)
	}

	recursionGetCheckedNodes(nodes: any) {
		for (let i = 0; i < nodes.length; i++) {
			if (nodes[i].checked) {
				this.checkedNodes.push(nodes[i]);
			}
			if (nodes[i].children) {
				this.recursionGetCheckedNodes(nodes[i].children);
			}
		}
	}

	options = {
        // getChildren: this.getChildren.bind(this),
		isExpandedField: 'open'
		// treeNodeTemplate: MyTreeNodeTemplateLink
    }

	//
	showHandleModule() {
		return true;
	}

	closeDialog() {
		this.isChooseFromOtherAuth = false;
	}

	getOtherAuthBase(id: string) {
		this.closeDialog();
		this.getAuthResource(id);
	}

	/*************
	 * 用户授权
	 * - selectUserTr
	 *   选中已经授权的用户，可以进行删除操作
	 * - chooseUser
	 *   添加用户时选择用户
	 * - deleteUser
	 *   删除已经授过权的用户
	 */
	selectUserTr($event: any) {
		this.selectUser = $event;
	}
	closeUserDialog() {
		this.isAddUser = false;
		this.searchName = "";
	}

	search() {
		let searchUrl: string;
		if (this.searchName)
			searchUrl = "/api/v1/authUserList?numPerPage={pageSize}&pageNum={currentPage}&userState=1&username=" + this.searchName;
		else searchUrl = "/api/v1/authUserList?numPerPage={pageSize}&pageNum={currentPage}&userState=1";
		
		let curTab: any;
		this.tablePlugins.map(tab => {
					if(tab.table.id == this.userTable.id)
						curTab = tab;
				})
		curTab.loadDataByUrl(searchUrl, true);
		
	}
	chooseUser($event: any) {
		this.chooseUserInfo = $event;
	}
	addUser() {
		this.userService.addAuthGroupUser(this.authInfo.id, this.chooseUserInfo.id)
			.then(result => {
				console.log(result)
				this.closeUserDialog();
				let curTab: any;
				this.tablePlugins.map(tab => {
					if(tab.table.id == this.table.id)
						curTab = tab;
				})
				curTab.loadDataByUrl();
			},
			error => this.error = <any>error
			);
	}
	deleteUser() {
		if (!this.selectUser) {
			this.dialogPlugin.tip("请选择要删除的用户");
			return;
		}
		this.dialogPlugin.confirm("确定要删除用户吗？", () => {
			this.userService.deleteAuthGroupUser(this.authInfo.id, this.selectUser.id)
				.then(result => {
					this.tablePlugins.last.loadDataByUrl();
					this.dialogPlugin.tip("删除成功");
					this.selectUser = null;
				},
				error => this.error = <any>error
				);
		}, () => { });
	}

	/*****
	 * 功能树
	 */
	changeChecked(Treenode: any) {
		console.log(Treenode)
        let node = Treenode.data;
        node.checked = !node.checked;
        this.recursionChildrenChecked(node);
        this.recursionParentChecked(Treenode);
    }

    //递归children，使其全选或全不选
    recursionChildrenChecked(node: any) {
        if (!this.isEmptyObject(node.children)) {
            for (let i = 0; i < node.children.length; i++) {
                node.children[i].checked = node.checked;
                this.recursionChildrenChecked(node.children[i]);
            }
        }
    }

    //递归遍历parent，使其
    recursionParentChecked(Treenode: any) {
        if (Treenode.parent) {
            if (Treenode.data.checked) {
                Treenode.parent.data.checked = true;
                this.recursionParentChecked(Treenode.parent);
            }
        }
    }
    //递归遍历parent 子不选时修改父-样式
    recursionParentHalfChecked(Treenode: any) {
        if (Treenode.parent) {
            if (!Treenode.data.checked) {
                // Treenode.parent.data.checked = false;  
                this.recursionParentChecked(Treenode.parent);
            }
        }
    }

	//递归children，使其全选或全不选
    recursionChildrenHalfChecked(node: any): boolean {
        if (!this.isEmptyObject(node.children)) {
            for (let i = 0; i < node.children.length; i++) {
                if (!node.children[i].checked) {
                    return true;//有一个子不是选中状态，则显示半选中状态样式
                }
                if (this.recursionChildrenHalfChecked(node.children[i]))
                    return true;
            }
        }
        return false;
    }

    isEmptyObject(obj: any): boolean {
        for (var name in obj) {
            return false;
        }
        return true;
    }
    isChecked(Treenode: any): boolean {
        let node = Treenode.data;
        // if (!this.isEmptyObject(node.children)) {
        //     //判断如果子全选中时
        //     for (let i = 0; i < node.children.length; i++) {
        //         if (!node.children[i].checked) {
        //             return node.checked;
        //         }
        //     }
        //     node.checked = true;
        // }
        // //判断其父是选中状态
        // if (Treenode.parent && Treenode.parent.data.checked) {
        //     node.checked = true;
        // }
        return node.checked;
    }


    isHalfChecked(Treenode: any) {
        return this.recursionChildrenHalfChecked(Treenode.data);
    }
}
