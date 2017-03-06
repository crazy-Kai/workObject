/*
    codeby DemoXu
    options：封装参数
        chooseControl: 对选择节点进行控制(只能选择特定节点等)
        mutipleChoose: true or false or undefined等  是否可多选
        DRUG_ID: 药品ID
        choosedDrugs: 初始化选中的药品集合
*/
import { Component, Input, Output, ViewChild, EventEmitter, OnChanges } from '@angular/core';
import { DrugCategoryTree } from './drug_category_tree.component';
import { Http, Response, Headers, RequestOptions } from '@angular/http';

export class Options {
    chooseControl: Function;
    showControl: Function;
    mutipleChoose: boolean;
    showDialog: boolean;
}
export class ChoosedDrug {
    id: string;
    name: string;
    py: string;
}

@Component({
    selector: 'drug-category-dialog',
    template: `
        <div class="container" *ngIf="showDialog">
            <div class="modal" style="display:block;" [class.fade]="!showDialog">
                <div class="modal-dialog" style="z-index: 1050;">
                    <div class="modal-content" style="width: 630px;">
                        <div class="modal-header">选择新分类
                            <button class="close" data-dismiss="modal">
                            <span (click)="showDialog = false">x</span>
                            <span class="sr-only" (click)="showDialog = false">关闭</span>
                        </button>
                        </div>
                        <div class="modal-body" style="max-height: 500px;">
                            <div class="search-panel form-inline mb10">
                                <div class="form-group">
                                    <label class="control-label">药品名称：</label>
                                    <div class="input-group">
                                        <div class="input-group-addon"></div>
                                        <input class="form-control form-control-sm" type="text" placeholder="请输入关键字" [(ngModel)]="searchDrugText">
                                    </div>
                                    <button type="submit" class="btn btn-sm btn-primary ml-2" (click)="searchDrugName = searchDrugText">搜索</button>
                                </div>
                            </div>
                            <div class="multitree-container flex1" *ngIf="options.mutipleChoose">
                                <div class="multitree-tree">
                                    <drug-category-tree #tree [keyword]="searchDrugName" [options]="options" (onActivate)="chooseDrugs($event)"></drug-category-tree>
                                </div>
                                <div class="multitree-action-arrow"></div>
                                <div class="multitree-nodes">
                                    <ul>
                                        <li *ngFor="let item of choosedDrugs;let i = index" (click)="choosedDrugs.splice(i, 1);">
                                            <input type="checkbox" checked>{{item.name ? item.name : item.dbdName}}
                                        </li>
                                    </ul>
                                </div>    
                            </div>
                            <div style="max-height:380px;overflow:auto;" *ngIf="!options.mutipleChoose">
                                <drug-category-tree #tree [keyword]="searchDrugName" [options]="options" (onActivate)="chooseDrugs($event)"></drug-category-tree>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button class="btn btn-sm btn-default" (click)="cancel()">关闭</button>
                            <button class="btn btn-sm btn-primary" (click)="submit()">提交</button>
                        </div>
                    </div>
                </div>
                <div class="in modal-backdrop fade" *ngIf="showDialog"></div>
            </div>
        </div>
    `,
    styles: [`
       .multitree{
            width: 600px;
        }
        .multitree-container {
            height: 330px;overflow: hidden;
        }
        .multitree-container:after{
            content: " ";display: block;visibility: hidden;clear: both;
        }
        .multitree-tree{
            float: left;
            width: 270px;height: 330px;overflow: auto;padding: 10px;
            border: 1px solid #e9e9e9;background: #fff;
        }
        .multitree-action-arrow{
            float: left;
            width: 40px;height: 330px;
        }
        .multitree-nodes{
            float: left;
            width: 270px;height: 330px;overflow: auto;padding: 10px;
            border: 1px solid #e9e9e9;background: #fff;
        }
        .multitree-nodes li{
            height: 30px;line-height: 30px;
            cursor: pointer;
        }
        .multitree-nodes li:hover{
            background: #e9e9e9;
        }
        .multitree-nodes li input[type='checkbox']{
            margin: 0 5px;vertical-align: 1px;
        }

        .multitable{
            width: 960px;
        }
        .multitable-container{
            height: 430px;overflow: auto;
        }
    `]
})
export class DrugCategoryDialog implements OnChanges {
    private choosedDrugs: ChoosedDrug[] = [];
    private showDialog: boolean = false;
    // @ViewChild('tree')
	// private tree: DrugCategoryTree;
    ngAfterViewInit() {
        
    }

    @Input() options: any;
    @Output() onChooseDrugs: EventEmitter<any> = new EventEmitter();

    constructor() { }
    
    ngOnInit() {
        console.log(this.choosedDrugs)
	}

    private chooseDrugs($event: any) {
		var id = $event.node.data.id,
            name = $event.node.data.name,
            py = $event.node.data.py;
        
        //如果配置了选择控制
        if(this.options.chooseControl) {
            //如果没通过选择控制，则不产生选择效果
            if( ! this.options.chooseControl({id: id, name: name})) {
                return;
            }
        }
        //如果是多选，加入列表，如果是单选，覆盖列表
        if(this.options.mutipleChoose) {
            var contain = false;
            for(var i=0,len=this.choosedDrugs.length; i<len; i++){
                let _i = this.choosedDrugs.pop();
                if(_i.id == id){
                    contain = true;
                    continue;
                }
                this.choosedDrugs.unshift(_i);
            }
            if(!contain){
                this.choosedDrugs.push({id: id, name: name, py: py});
            }

            console.log(this.choosedDrugs);
        } else {
            this.choosedDrugs = [{id: id, name: name, py: py}];
        }
	}

    show() {
        this.showDialog = true;
    }

    private submit() {
        this.showDialog = false;
        //如果一个都没选中，不做处理
        // if(this.choosedDrugs.length == 0) {
        //     return;
        // }
        this.onChooseDrugs.emit(this.choosedDrugs);
        this.choosedDrugs = [];
    }
    
    private cancel() {
        this.showDialog = false;
        this.choosedDrugs = [];
    }

    ngOnChanges(changes : any) {
        // if(changes.options.showDialog.currentValue)
        //     console.log(changes.options.showDialog.currentValue);
        if(this.options && this.options.choosedDrugs){
            this.choosedDrugs = this.options.choosedDrugs;
        }
    }
}