import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Router } from '@angular/router';
import { DialogPlugin, DialogModel } from '../../common/ug-dialog/dialog';
import { UserService } from '../../user.service';
import { DrugMatchService } from './drug_match.service';

@Component({
	selector: 'drug-match-dictedit',
	template: require('./drug_match_dictedit.component.html'),
	styles: [require('./content_manegement.component.css') + ""],
	providers: [DrugMatchService]
})
export class DrugMatchDiceditComponent implements OnInit {
	constructor(
		private router: Router,
		private userService: UserService,
		private route: ActivatedRoute,
		private drugMatchService: DrugMatchService) { }

	@ViewChild(DialogPlugin) dialogPlugin: DialogPlugin;
	/**
	 * 搜索条件字段
	 */
	currentPage = 1;			//当前页
	selectedDataList: any;
	pwInfoId: string;
	pwInfo: any = {};
	oriPwInfo: any = {};

	ngOnInit() {
		this.getRouteParam();
		this.getPwById(this.pwInfoId);
	}

	getPwById(id: string){
		if(!id) return;
		
		this.drugMatchService.getPwDicById(id)
			.then(res => {
				console.log(res)
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
			}
        });
    }

	onClick(trow: any){
		this.selectedDataList = trow;
	}
	/**
	 * 配伍字典修改
	 */
	savePwDic(){
		this.drugMatchService.modifyPwDic(this.pwInfo)
			.then(res => {
				console.log(res)
				if(res.code != 200) {
					this.dialogPlugin.tip(res.message);
					return;
				}
				history.back();
			});
	}
	cancel(){
		history.back()
	}
}



