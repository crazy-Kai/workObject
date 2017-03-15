import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Router } from '@angular/router';
import { DialogPlugin, DialogModel } from '../../common/ug-dialog/dialog';
import { UserService } from '../../user.service';
import { DrugMatchService } from './drug_match.service';
//TreeNode 
import { TREE_ACTIONS, KEYS, IActionMapping } from 'angular2-tree-component';

@Component({
	selector: 'drug-match-edit',
	template: require('./drug_match_edit.component.html'),
	styles: [require('./content_manegement.component.css') + ""],
	providers: [DrugMatchService]
})
export class DrugMatchEditComponent implements OnInit {
	constructor(
		private router: Router,
		private userService: UserService,
		private route: ActivatedRoute,
		private drugMatchService: DrugMatchService) { }

	@ViewChild(DialogPlugin) dialogPlugin: DialogPlugin;
	/**
	 * 配伍新增和修改组件
	 */
	handleType: number = 0;			//操作类型   0 => add,  1 => modify
	isShowDrugTree: boolean;
	pwInfoId: string;
	oriPwInfo: any;					//当前id的配伍信息
	pwInfo: any = {
		pwMessageDto: {}
	};
	pwLevel: string;
	/**
     * 点击选择产品params
     */
	searchWord: string;
	nodes: any;						//药品树内容
	curChoosedDrug: any;			//选择药品操作时当前选中的药品，每次进行选择前需要做清空操作防止异常
	tar: number;					//用来保存当前选中药品1还是2的信息   0 => drugA , 1 => drugB
	noResult: boolean = false;		//没有搜索结果的时候显示
	drugA: any = {};
	drugB: any = {};
	/**
	 * 配伍标识
	 */
	pwFlag: string;
	pwList: any[] = [];
	//-------------------------------------------------------------------
	ngOnInit() {
		this.getPwList();
		this.getRouteParam();
		this.getPwById(this.pwInfoId);
	}

	saveDrugMatch() {
		//this.constructorPWInfo();
		console.log(this.pwInfo)
		if(this.handleType == 0){			//add
			this.drugMatchService.addDrugMatch(this.pwInfo)
				.then(res => {
					this.dialogPlugin.tip(res.message);
					if(res.code == 200) history.back();
				});
		}else if(this.handleType == 1){		//modify
			this.drugMatchService.modifyDrugMatch(this.pwInfo)
				.then(res => {
					this.dialogPlugin.tip(res.message);
					if(res.code == 200) history.back();
				});
		}
	}

	cancel() {
		history.back();
	}

	getPwById(id: string){
		if(!id) return;
		
		this.drugMatchService.getPwInfoById(id)
			.then(res => {
				if(res.code != 200){
					this.dialogPlugin.tip(res.message);
					return;
				}
				this.pwInfo = this.oriPwInfo = res.data;
			})
	}
	getRouteParam() {
        this.route.params.subscribe(params => {
			if ((params['id'] !== undefined)) {
				this.pwInfoId = params['id'];
				this.handleType = 1;
            }
        });
    }
	constructorPWInfo(){
		this.pwInfo.pwMessageId = this.pwFlag;
	}
	/**
     * 点击选择产品相关操作
     */
	actionMapping: IActionMapping = {
		mouse: {
			dblClick: (tree, node, $event) => {
				this.chooseDrug(node.data);
			}
		}
	};
	//药品分类数options 配置
	options = {
		getChildren: this.getChildrenNode.bind(this),
		actionMapping: this.actionMapping
	}
	getDrugs(type: number) {
		this.isShowDrugTree = true;
		this.curChoosedDrug = null;

		this.tar = type;

		this.drugMatchService.getCategory("0013921000")
			.then(res => {
				this.nodes = res.data;
			});
	}
	getByValue(){
		this.drugMatchService.getByValue(this.searchWord)
			.then(res => {
				if(res.data &&　res.data.length <= 0) {
					this.nodes = [];
					this.noResult = true;
					return;
				}
				this.noResult = false;
				this.nodes = res.data;
			});
	}
	//获取当前节点下的药品分类
	getChildrenNode(node: any) {
		return this.drugMatchService.getChildrenCategory(node.data.id);
	}
	//选择药品
	chooseDrug($event: any) {
		this.curChoosedDrug = $event.node.data;
		console.log(this.curChoosedDrug)
	}
	
	//保存选择的药品
	saveChoose() {
		if (this.tar == 0) {
			this.drugA = this.curChoosedDrug;
			this.pwInfo.drug1 = this.drugA.name;
			this.pwInfo.code1 = this.drugA.id;
			this.pwInfo.py1 = this.drugA.py;
		} else if (this.tar == 1) {
			this.drugB = this.curChoosedDrug;
			this.pwInfo.drug2 = this.drugB.name;
			this.pwInfo.code2 = this.drugB.id;
			this.pwInfo.py2 = this.drugB.py;
		}
		this.isShowDrugTree = false;
		this.searchWord = "";
	}
	//放弃保存选择的药品
	quitChoose() {
		this.isShowDrugTree = false;
		this.searchWord = "";
	}

	/**
	 * 配伍标识
	 */
	getPwList() {
		this.drugMatchService.getPwList()
			.then(res => {
				if (res.code != 200) {
					this.dialogPlugin.tip(res.message);
					return;
				}
				this.pwList = res.data.recordList;
			})
	}
	setPwLevel(item: any) {
		for (let i = 0; i < this.pwList.length; i++) {
			if(item == this.pwList[i].flag){
				this.pwInfo.pwMessageDto = this.pwList[i];
				this.pwInfo.pwMessageId = this.pwList[i].messageId;
			}
		}
	}
}



