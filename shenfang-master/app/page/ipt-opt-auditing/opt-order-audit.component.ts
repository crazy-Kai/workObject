import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

import { OptOrderAuditService } from './opt-order-audit.service';
import { OptOrderAudit } from './opt-order-audit';

@Component({
    selector: 'opt-order-audit',
    templateUrl: 'opt-order-audit.component.html',
    styleUrls: ['opt-order-audit.component.css'],
    providers: [OptOrderAudit, OptOrderAuditService]
})


export class OptOrderAuditComponent implements OnInit {
    //参数列表
    private optRecipeList: any[] = [];
    private checkedRecipes: any[] = [];
    //
    private refreshInterval: any;
    private beatingInterval: any;
    private tipsTimeout: any;
    private receiveRecipe: boolean = true;

    constructor(
        private optOrderAuditService: OptOrderAuditService,
        private router: Router,
        private route: ActivatedRoute
    ) { }

    ngOnInit() {
        this.getOptOrderAudit();
        //每5秒刷新列表
        // this.refreshInterval = setInterval(() => {
        //     this.getOptOrderAudit();
        // }, 5000);
        // this.beatingInterval = setInterval(() => {
        //     this.auditBeatingStatus();
        // }, 2000);
    }

    ngOnDestroy() {
        clearInterval(this.refreshInterval);
        clearInterval(this.beatingInterval);
    }

    getOptOrderAudit() {
        this.optOrderAuditService.getOptRecipeList()
            .then(res => {
                if (res.code == '200' && res.data) {
                    this.optRecipeList = res.data;
                }
            })
    }
    auditBeatingStatus(){
        this.optOrderAuditService.auditBeatingStatus()
            .then(res => {

            });
    }

    /**
     * 选择逻辑
     */
    isAllCheck(){
        if(!this.isAllChecked()){
            this.checkedRecipes = this.optRecipeList;
        } else {
            this.checkedRecipes = [];
        }
    }

    putInCheckList(recipe: any) {
        if(this.isChecked(recipe) >= 0){
            this.checkedRecipes.splice(this.isChecked(recipe), 1);
        }else{
            this.checkedRecipes.push(recipe);
        }
    }
    isChecked(recipe: any): any{
        if(this.checkedRecipes && this.checkedRecipes.length > 0){
            for(let i = 0; i < this.checkedRecipes.length; i++){
                if(this.checkedRecipes[i].optRecipe.id == recipe.optRecipe.id){
                    return i;
                }
            }
            return -1;
        }else{
            return -1;
        }
    }
    isAllChecked() {
        if(this.checkedRecipes && this.optRecipeList.length > 0 && this.checkedRecipes.length == this.optRecipeList.length) return true;

        return false;
    }

    hasChecked($event: any) {
        if(this.checkedRecipes && this.checkedRecipes.length > 0) return true;

        return false;
    }

    goRecipeDetail(trow: any) {
        this.router.navigate(['/opt-recipe-details', trow.optRecipe.id]);
    }

    //通过
    agreeOptOrderAudit(trow: any) {
        this.optOrderAuditService.getAuditAgree(trow.optRecipe.id)
            .then(res => {
                if (res.code == 200){
                    this.constructAuditOpt(res.data);
                }
            })
    }
    //打回
    refuseOptOrderAudit(trow: any, i: number) {
        this.optOrderAuditService.getAuditRefuse(trow.optRecipe.id)
            .then(res => {
                if (res.code == 200) {
                    this.constructAuditOpt(res.data);
                }
            })
    }
    //批量通过
    BatchAgree() {
        let ids = this.serializeParams(this.checkedRecipes);
        this.optOrderAuditService.auditBatchAgree(ids)
            .then(res => {
                if (res.code == 200) {
                    this.getOptOrderAudit();
                    this.constructAuditOpt(res.data);
                    this.checkedRecipes = [];
                }
            })
    }
    //批量打回
    BatchRefuse(trow: any) {
        let ids = this.serializeParams(this.checkedRecipes);
        this.optOrderAuditService.auditBatchRefuse(ids)
            .then(res => {
                if (res.code == 200) {
                    this.getOptOrderAudit();
                    this.constructAuditOpt(res.data);
                    this.checkedRecipes = [];
                }
            })
    }
    //构建一个有时效的tips
    constructAuditOpt(str: string){
        this.auditOptions.show = true;
        this.auditOptions.string = str;
        this.tipsTimeout = setTimeout(() => {
            this.auditOptions.show = false;
            this.auditOptions.string = "";
        }, 3000);
    }

    serializeParams(oArr: any[]){
        let ids: number[] = [];
        this.checkedRecipes.map(recipe => {
            ids.push(recipe.optRecipe.id);
        });
        return ids;
    }

    //结束审方
    endAudit($event: any){
        console.log($event)
        if($event){
            this.optOrderAuditService.endAudit('12')
                .then(res => {
                    if(res.code == '200'){
                        this.receiveRecipe = false;
                        clearInterval(this.refreshInterval);
                    }
                        
                })
        }
    }

    /**
     * 审核结果提示
     */
    auditOptions: any = {};
    

}