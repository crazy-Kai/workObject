import { Component, OnInit, ViewChild } from '@angular/core';
import { DataSortService } from './data_sort.service';
import { DialogPlugin, DialogModel } from '../../common/ug-dialog/dialog';
import { UserService } from '../../user.service';
import { TreeComponent, TreeNode } from 'angular2-tree-component';

export class DatePicker {
	year: number;
	month: number;
	day: number;
}

@Component({
	selector: 'data-sort-management',
	templateUrl: './data_sort_management.component.html',
	styleUrls: ['./data_sort_management.component.css'],
	providers: [
		DataSortService
	]
})
export class DataSortManagementComponent implements OnInit {
	@ViewChild(DialogPlugin) dialogPlugin: DialogPlugin;
	@ViewChild(TreeComponent)
	private tree: TreeComponent;
	constructor(
		private dataSortService: DataSortService,
		private userService: UserService) { }

	booksSuggestionAPI: string = this.dataSortService.booksSuggestionAPI;
	publicationTime: any;
	maxEndDate: any = { year: new Date().getFullYear(), month: new Date().getMonth() + 1, day: new Date().getDate() };        //设定药品核准时间的最大值为今天string;

	bookTreeData: any;
	isAdd: boolean;						//是否为添加操作
	searchWord: string;					//搜索条件
	/**
	 * @handlerType => 操作类型
	 * addData => 添加资料, addCate => 添加分类 
	 */
	handlerType: string;
	/**
	 * @docType => 资料类型
	 * data_pharmacy => 书籍, data_periodical => 期刊, data_elec_doc => 电子文献, data_elec_bull => 电子公告, data_others => 其他资料; 
	 */
	docType: string;					//当前顶级分类
	curDocType: string;					//当前上级分类

	curNode: any;						//当前节点。  pCode 判断是否为根节点
	curTreeNode: TreeNode;
	cateType: any = {};						//当前节点的数据类型
	/**
	 * 
	 */
	pharmacy: any = {};					//书籍
	periodical: any = {};				//期刊
	elecDoc: any = {};					//电子文献
	elecBulletin: any = {};				//电子公告
	others: any = {};					//其他

	impactFactors: any[] = [['', '']];	//期刊影响因子
	years: any[] = [];					//影响因子可选年份，暂定最近30年

	category: any = {
		"categoryCode": "data_classification_mana",
		"code": '',
		"pcode": '',
		"dictValue": '',
		"systemReserved": 0
	}

	ngOnInit() {
		this.getDataTree();
		this.crateYears();
	}

	/**
	 * 分类树
	 */
	getDataTree(dictValue?: string) {
		console.log(this.tree)
		this.dataSortService.getBooksTree(dictValue)
			.then(res => {
				if (res != null) {
					if (dictValue)
						this.setExpanded(res);
					this.bookTreeData = res;
				}
				else this.bookTreeData = [];
			});
	}
	getChildren(node: any): any {
		return this.dataSortService.getChildrenByNode(node.data);
	}
	options = {
		getChildren: this.getChildren.bind(this),
		idField: 'id'
	}
	search() {
		if (this.searchWord)
			this.getDataTree(this.searchWord);
	}

	/**
	 * 激活资料分类树节点
	 * @param: $event	点击节点的事件
	 * @param: confirm	确认
	 */
	private chooseNode($event: any) {
		this.curTreeNode = $event.node;
		this.curNode = this.curTreeNode.data;
		this.impactFactors = [['', '']];	//选择新的节点时,清空影响因子

		//this.cateType.id = this.curNode.id ? this.curNode.id : this.curNode.code;
		//this.cateType.name = this.curNode.name;
		if (this.curTreeNode.data.type == 0) {
			this.curDocType = this.curTreeNode.data.id || this.curTreeNode.data.code;
			this.recursiveDocType(this.curTreeNode);
			this.getCate(this.curDocType)
		} else {
			switch (this.curTreeNode.data.type) {
				case 1:
					this.docType = 'data_pharmacy';
					this.getData(this.docType, this.curTreeNode.data.id);
					break;
				case 2:
					this.docType = 'data_periodical';
					this.getData(this.docType, this.curTreeNode.data.id);
					break;
				case 3:
					this.docType = 'data_elec_doc';
					this.getData(this.docType, this.curTreeNode.data.id);
					break;
				case 4:
					this.docType = 'data_elec_bull';
					this.getData(this.docType, this.curTreeNode.data.id);
					break;
				case 5:
					this.docType = 'data_others';
					this.getData(this.docType, this.curTreeNode.data.id);
					break;
				default:
					break;
			}
		}

		this.isAdd = false;				//切换节点后，取消添加的操作状态
		if (this.curTreeNode.data.type == 0 && this.curTreeNode.data.pid != null) {
			this.handlerType = 'addCate';
		} else {
			this.handlerType = "";
		}

		console.log(this.curTreeNode)
	}

	recursiveDocType(node: any) {
		if (!node.data.pid) {
			this.docType = node.data.id;
		} else {
			this.recursiveDocType(node.parent)
		}
	}

	/**
	 * 资料内容增删改查
	 */
	getData(type: string, id: any) {
		this.dataSortService.getData(type, id)
			.then(res => {
				if (res.code != '200') {
					this.dialogPlugin.tip(res.message);
					return;
				}
				switch (type) {
					case 'data_pharmacy':
						this.pharmacy = res.data;
						if (this.pharmacy.publicationTime) {
							this.dateToObj(this.pharmacy, this.pharmacy.publicationTime);
						}
						break;
					case 'data_periodical':
						this.periodical = res.data;
						/**
						 * 这里还要加一个影响因子的逻辑
						 */
						this.transformImpacts();
						break;
					case 'data_elec_doc':
						this.elecDoc = res.data;
						break;
					case 'data_elec_bull':
						this.elecBulletin = res.data;
						break;
					case 'data_others':
						this.others = res.data;
						break;
					default:
						break;
				}
			}).catch()
	}

	/**
	 * 添加数据?
	 */
	private addData(): void {
		let newData: any;
		switch (this.docType) {
			case 'data_pharmacy':
				if (this.pharmacy.calcTime) {
					this.pharmacy.publicationTime = this.objToDate(this.pharmacy.calcTime)
				}
				newData = this.pharmacy;
				break;
			case 'data_periodical':
				newData = this.periodical;
				break;
			case 'data_elec_doc':
				newData = this.elecDoc;
				break;
			case 'data_elec_bull':
				newData = this.elecBulletin;
				break;
			case 'data_others':
				newData = this.others;
				break;
			default:
				break;
		}
		newData.pcode = this.curDocType;
		this.dataSortService.addData(this.docType, newData)
			.then(res => {
				this.dialogPlugin.tip(res.message);
				if (res.code == 200) {
					res.data.pid = res.data.pcode;
					switch (this.docType) {
						case 'data_pharmacy':
							this.pharmacy = {}
							res.data.type = 1;
							break;
						case 'data_periodical':
							this.periodical = {};
							res.data.type = 2;
							break;
						case 'data_elec_doc':
							this.elecDoc = {};
							res.data.type = 3;
							break;
						case 'data_elec_bull':
							this.elecBulletin = {};
							res.data.type = 4;
							break;
						case 'data_others':
							this.others = {};
							res.data.type = 5;
							break;
						default:
							break;
					}
					this.addNode(res.data);
				}
			})
	}

	/**
	 * 更新资料内容
	 */
	private updateData(): void {
		let modifyData: any;
		switch (this.docType) {
			case 'data_pharmacy':
				if (this.pharmacy.calcTime) {
					this.pharmacy.publicationTime = this.objToDate(this.pharmacy.calcTime)
				}
				modifyData = this.pharmacy;
				break;
			case 'data_periodical':
				this.periodical.impactFactor = this.parseImpactFactors();
				modifyData = this.periodical;
				break;
			case 'data_elec_doc':
				modifyData = this.elecDoc;
				break;
			case 'data_elec_bull':
				modifyData = this.elecBulletin;
				break;
			case 'data_others':
				modifyData = this.others;
				break;
			default:
				break;
		}
		this.dataSortService.updateData(this.docType, modifyData).then(res => {
			this.dialogPlugin.tip(res.message);

			if (res.code == 200) {
				this.fixNodeDataFromResource(res);
				res.data.type = this.curNode.type;
				this.updateNode(res.data);


				//更新节点后，更新当前缓存节点数据
				this.curTreeNode.data = res.data;
				this.curNode = res.data;
			}
		})
	}

	/**
	 * 修正更新数据后，左侧分类节点树名称显示为空（只剩下一个图标）的问题
	 * @docType:	data_pharmacy => 书籍, 	  bookName	  
	 * 				data_periodical => 期刊,	  periodicalName
	 * 				data_elec_doc => 电子文献    name
	 * 				data_elec_bull => 电子公告, name
	 * 				data_others => 其他资料; 	name
	 */
	private fixNodeDataFromResource(res: any) {
		res.data.pid = res.data.pcode;
		switch (this.docType) {
			case 'data_pharmacy':
				res.data.name = res.data.bookName;	//bookName
				break;
			case 'data_periodical':
				res.data.name = res.data.periodicalName;	//periodicalName
				break;
			default:
				break;
		}
	}

	delData(node: any) {
		this.dialogPlugin.confirm('您确定要删除吗？', () => {
			console.log(node)
			if (node.data.type == 0) {
				this.dataSortService.deleteCate(node.data.id)
					.then(res => {
						console.log(res)
						this.dialogPlugin.tip(res.message);
						if (res.code == 200) {
							this.deleteNode(node);
							this.curNode = null;
						}
					})
			} else {
				this.dataSortService.delData(this.docType, node.data.id)
					.then(res => {
						this.dialogPlugin.tip(res.message);
						if (res.code == 200) {
							this.deleteNode(node);
							this.curNode = null;
						}
					})
					.catch()
			}
		}, () => { })
	}
	//删除后清楚tree中的数据
	deleteNode(node: any) {
		let parentNode = node.parent;
		if (!parentNode.children) {
			console.error("There is no child in this parentNode");
			return false;
		}
		parentNode.data.children.splice(parentNode.data.children.indexOf(node.data), 1);
		if (parentNode.data.children.length == 0)
			parentNode.data.hasChildren = false;
		this.tree.treeModel.update();
		return true;
	}
	//新增一个数据后添加到tree中
	addNode(node: any) {
		if (this.curNode.children)
			this.curNode.children.unshift(node);//children已经加载出来
		else {
			if (!this.curNode.hasChildren) {
				this.curNode.hasChildren = true;
				this.curNode.children = new Array<any>();
				this.curNode.children.unshift(node);
			}
		}
		this.tree.treeModel.update();
	}
	//修改后更新tree中的数据
	private updateNode(node: any): boolean {
		let parentNode = this.curTreeNode.parent;
		if (!parentNode.children) {
			console.error("There is no child in this parentNode");
			return;
		}
		let activeNode = this.tree.treeModel.getActiveNode();
		//let curIdx = parentNode.children.indexOf(activeNode);
		let curIdx = parentNode.data.children.indexOf(this.curTreeNode.data);
		parentNode.data.children[curIdx] = node;
		this.tree.treeModel.update();
	}

	add(node: any) {
		this.isAdd = true;
		//清除对应分类下上次加载的数据
		this.cateType.modifyUser = null;
		this.cateType.createUser = null;
		this.cateType.modifyDate = null;
		this.cateType.createDate = null;
		//let curDocType = node.data.id;
		switch (this.docType) {
			case 'data_pharmacy':
				this.pharmacy = {};
				break;
			case 'data_periodical':
				this.periodical = {};
				break;
			case 'data_elec_doc':
				this.elecDoc = {};
				break;
			case 'data_elec_bull':
				this.elecBulletin = {};
				break;
			case 'data_others':
				this.others = {};
				break;
			default:
				break;
		}
	}


	getCate(code: string) {
		this.dataSortService.getCate(code)
			.then(res => {
				console.log(res)
				this.cateType = res.data;
			})
	}

	/**
	 * 添加分类?
	 */
	private addCate() {
		this.category.pcode = this.curDocType;
		this.category.code = this.cateType.code;
		this.category.dictValue = this.cateType.name;

		this.dataSortService.addCate(this.category)
			.then(res => {
				this.dialogPlugin.tip(res.message);
				if (res.code == 200) {
					res.data.type = 0;
					res.data.pid = res.data.pcode;
					res.data.id = res.data.code;
					this.addNode(res.data);
				}
			})
	}
	updateCate() {
		console.log(this.docType)
		this.category.pcode = this.curDocType;
		this.category.code = this.cateType.code;
		this.category.dictValue = this.cateType.name;

		this.dataSortService.updateCate(this.category)
			.then(res => {
				console.log(res)
				this.dialogPlugin.tip(res.message);
				/*
				if(res.code == 200){
					res.data.type = 0;
					res.data.pid = res.data.pcode;
					res.data.id = res.data.code;
					this.updateNode(res.data);
					//this.curNode = res.data;
				}*/

			})
	}

	/**
	 * 资料分类管理的保存
	 */
	private save(): void {
		if (this.isAdd) {
			if (this.handlerType == 'addCate') {
				this.addCate();
			} else {
				this.addData();
			}
		} else {
			if (this.handlerType == 'addCate') {
				this.updateCate();
			} else {
				this.updateData();
			}
		}
	}
	/**
	 * impactFactors 
	 */
	crateYears() {
		let curYear = new Date().getFullYear()
		for (let i = 0; i < 30; i++) {
			this.years.push(curYear--);
		}
		console.log(this.years)
	}

	/**
	 * 切换新的节点后,需要转换影响因子
	 */
	private transformImpacts(): void {
		if (!this.periodical.impactFactor) return;

		let impactFactorStr = this.periodical.impactFactor;
		let impactFactors = impactFactorStr.split("|");

		for (let i = 0; i < impactFactors.length; i++) {
			this.impactFactors.unshift(impactFactors[i].split(":"));
		}
	}

	/**
	 * 提交到后台时，解析影响因子，以便存入后台
	 */
	private parseImpactFactors(): any {
		if (!this.impactFactors || this.impactFactors.length <= 0) {
			return null;
		}
		//console.log( this.impactFactors );
		let impactFactorStr: string = "";
		let size = this.impactFactors.length;
		for (let i = 0; i < size; i++) {
			let item = this.impactFactors[i];

			if (item[0] == "" || item[1] == "") {
				continue; //如果影响因子的年份和因子，有一项为空都不存入后台
			}
			impactFactorStr += item[0] + ':' + item[1] + "|";
		}
		//console.log(impactFactorStr);
		return impactFactorStr.substring(0, impactFactorStr.length - 1);
	}

	/**
	 * 填写影响因子后的的连动事件
	 * @param: impact 	当前选择的selector对象, ['year', 'factor']
	 * @param: idx		当前选择的selector所在的下拉框索引号
	 */
	private impactReact(impact: any, idx: number, debug?: boolean) {
		if (impact[0] != "" || impact[1] != "") {
			//是否还需要新增影响因子选择栏
			if (this.checkImpactFactors()) {
				this.impactFactors.push(['', '']);
			}
		}
	}

	/**
	 * 检查已填影响因子的状态,判断是否还需要新增选择栏
	 */
	private checkImpactFactors() {
		//先判断影响因子长度:最多只能添加5个影响因子
		if (!this.impactFactors || this.impactFactors.length >= 5) {
			return false;
		}
		//检查最后一个影响因子状态
		let lastIF = this.impactFactors[this.impactFactors.length - 1];

		if (lastIF[0] == "" && lastIF[1] == "") {
			return false;
		} else {
			return true;
		}
	}
	spliceImpactFactors(idx: number) {
		if (!this.impactFactors || this.impactFactors.length >= 5) {
			//检查最后一个影响因子状态
			let lastIF = this.impactFactors[this.impactFactors.length - 1];

			if (lastIF[0] == "" && lastIF[1] == "") {
				this.impactFactors.splice(idx, 1);
			} else {
				this.impactFactors.splice(idx, 1);
				this.impactFactors.push(['', '']);
			}
		} else {
			this.impactFactors.splice(idx, 1);
		}

	}
	/**
	 * 时间控件与时间对象的相互转换
	 */
	dateToObj(obj: any, date: any) {
		let fullDate = new Date(date);
		obj.calcTime = {}
		obj.calcTime.year = fullDate.getFullYear();
		obj.calcTime.month = fullDate.getMonth() + 1;
		obj.calcTime.day = fullDate.getDate();
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
	//设置搜索展开
	setExpanded(arr: any[]) {
		for (let i = 0; i < arr.length; i++) {
			if (arr[i].open) {
				console.log(this.tree.treeModel.expandedNodeIds)
				this.tree.treeModel.expandedNodeIds[arr[i].id] = true;
			}

			if (arr[i].hasChildren)
				this.setExpanded(arr[i].children);
		}
	}
}