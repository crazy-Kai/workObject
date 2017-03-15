import { Component, Input, Output, ViewChild, EventEmitter, OnChanges } from '@angular/core';
import { DrugCategoryTree } from './drug_category_tree.component';
import { Http, Response, Headers, RequestOptions } from '@angular/http';
import { InterceptorService } from 'ng2-interceptors';

export class Options {
    chooseControl: Function;
    showControl: Function;
    mutipleChoose: boolean;
    showDialog: boolean;
}
export class choosedDrug {
    id: string;
    name: string;
}

@Component({
    selector: 'drug-category-dialog',
    template: `
        <div class="container" *ngIf="showDialog">
            <div class="modal" style="display:block;" [class.fade]="!showDialog">
                <div class="modal-dialog" style="z-index: 1050;">
                    <div class="modal-content">
                        <div class="modal-header">选择新分类
                            <button class="close" data-dismiss="modal">
                            <span (click)="showDialog = false">x</span>
                            <span class="sr-only" (click)="showDialog = false">关闭</span>
                        </button>
                        </div>
                        <div class="modal-body" style="max-height: 500px;">
                            <div style="position:fixed;">
                                <input [(ngModel)]="searchDrugText">
                                <button class="btn btn-default" (click)="searchDrugName = searchDrugText">搜索</button>
                            </div>
                            <div style="margin-top: 30px;overflow-y: auto;max-height:450px;">
                                <drug-category-tree #tree [keyword]="searchDrugName" (onActivate)="chooseDrugs($event)"></drug-category-tree>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button class="btn btn-default" (click)="cancel()">关闭</button>
                            <button class="btn btn-primary" (click)="submit()">提交</button>
                        </div>
                    </div>
                </div>
                <div class="in modal-backdrop fade" *ngIf="showDialog"></div>
            </div>
        </div>
    `
    // styles: []
})
export class DrugCategoryDialog implements OnChanges {
    private choosedDrugs: choosedDrug[] = [];
    private showDialog: boolean = false;
    @ViewChild('tree')
	private tree: DrugCategoryTree;
    ngAfterViewInit() {

    }

    @Input() options: any;
    @Output() onChooseDrugs: EventEmitter<any> = new EventEmitter();

    constructor() { }
    
    ngOnInit() {
  
	}

    private chooseDrugs($event: any) {
		var id = $event.node.data.id;
		var name = $event.node.data.name;
        //如果配置了选择控制
        if(this.options.chooseControl) {
            //如果没通过选择控制，则不产生选择效果
            if( ! this.options.chooseControl({id: id, name: name})) {
                return;
            }
        }
        //如果是多选，加入列表，如果是单选，覆盖列表
        if(this.options.mutipleChoose) {
            this.choosedDrugs.push({id: id, name: name});
        } else {
            this.choosedDrugs = [{id: id, name: name}];
        }
	}

    show() {
        this.showDialog = true;
    }

    private submit() {
        this.showDialog = false;
        //如果一个都没选中，不做处理
        if(this.choosedDrugs.length == 0) {
            return;
        }
        this.onChooseDrugs.emit(this.choosedDrugs.slice(0));
        this.choosedDrugs = [];
    }
    
    private cancel() {
        this.showDialog = false;
        this.choosedDrugs = [];
    }

    ngOnChanges(changes : any) {
        // if(changes.options.showDialog.currentValue)
        //     console.log(changes.options.showDialog.currentValue);
    }
}