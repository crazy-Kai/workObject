import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';

import { IptOrderAuditService } from './ipt-order-audit.service';
import { IptOrderAudit } from './ipt-order-audit';

@Component({
    selector: 'ipt-order-audit',
    templateUrl: 'ipt-order-audit.component.html',
    styleUrls: ['ipt-order-audit.component.css'],
    providers: [IptOrderAudit, IptOrderAuditService]
})

export class IptOrderAuditComponent implements OnInit {
    //参数列表
    private waitAuditIptList: any[] = [];
    private checkedRecipes: any[] = [];
    //
    private refreshInterval: any;
    private beatingInterval: any;
    private tipsTimeout: any;
    private receiveOrder: boolean = true;

    constructor(
        private iptOrderAuditService: IptOrderAuditService,
        private router: Router
    ) { }

    ngOnInit() {
        this.getIptOrderAudit();
        
        //每5秒刷新列表 
        // this.refreshInterval = setInterval(() => {
        //     this.getIptOrderAudit();
        // }, 5000);
        // this.beatingInterval = setInterval(() => {
        //     this.auditBeatingStatus();
        // }, 2000);
    }

    ngOnDestroy() {
        clearInterval(this.refreshInterval);
        clearInterval(this.beatingInterval);
    }

    getIptOrderAudit() {
        this.iptOrderAuditService.getWaitAuditIptList()
            .then(res => {
                if (res.code == '200' && res.data) {
                    this.waitAuditIptList = res.data;
                }
            })
    }
    auditBeatingStatus(){
        this.iptOrderAuditService.auditBeatingStatus()
            .then(res => {

            });
    }

    /**
     * 选择逻辑
     */
    isAllCheck(){
        if(!this.isAllChecked()){
            this.checkedRecipes = this.waitAuditIptList;
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
                if(this.checkedRecipes[i].id == recipe.id){
                    return i;
                }
            }
            return -1;
        }else{
            return -1;
        }
    }
    isAllChecked() {
        if(this.checkedRecipes && this.waitAuditIptList.length > 0 && this.checkedRecipes.length == this.waitAuditIptList.length) return true;

        return false;
    }

    hasChecked($event: any) {
        if(this.checkedRecipes && this.checkedRecipes.length > 0) return true;

        return false;
    }

    onDblClick(trow: any){
        this.router.navigate(['/ipt-order-details', trow.id]);
    }

    // 通过
    agreeIptOrderAudit(trow: any) {
        this.iptOrderAuditService.getAuditAgree(trow.id)
            .then(res => {
                if (res.code == 200) {
                    this.constructAuditOpt(res.data);
                }
            })
    }
    // 打回
    refuseIptOrderAudit(trow: any) {
        this.iptOrderAuditService.getAuditRefuse(trow.id)
            .then(res => {
                if(res.code == 200) {
                    this.constructAuditOpt(res.data);
                }
            })
    }
    // 批量通过
    bacthAgree() {
        let ids = this.serializeParams(this.checkedRecipes);
        this.iptOrderAuditService.auditBatchAgree(ids)
            .then(res => {
                if(res.code == 200) {
                    this.getIptOrderAudit();
                    this.constructAuditOpt(res.data);
                    this.checkedRecipes = [];
                }
            })
    }
    // 批量打回
    bacthRefuse() {
        let ids = this.serializeParams(this.checkedRecipes);
        this.iptOrderAuditService.auditBatchRefuse(ids)
            .then(res => {
                if(res.code == 200) {
                    this.getIptOrderAudit();
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
            ids.push(recipe.id);
        });
        return ids;
    }

    //结束审方
    endAudit($event: any){
        console.log($event)
        if($event){
            this.iptOrderAuditService.endAudit('12')
                .then(res => {
                    if(res.code == '200')
                        this.receiveOrder = false;
                        clearInterval(this.refreshInterval);
                })
        }
    }
    
    /**
     * 审核结果提示
     */
    auditOptions: any = {};
}