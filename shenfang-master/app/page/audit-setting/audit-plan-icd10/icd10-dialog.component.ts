import { Component, Input, Output, ViewChild, EventEmitter, OnChanges } from '@angular/core';
import { ICD10Tree } from './icd10-tree.component';
import { Http, Response, Headers, RequestOptions } from '@angular/http';

export class Options {
    chooseControl: Function;
    showControl: Function;
    mutipleChoose: boolean;
    showDialog: boolean;
}
export class ChoosedICD10 {
    id: string;
    name: string;
}

@Component({
    selector: 'icd10-dialog',
    template: `
        <div class="popup-add" id="popupAdd" *ngIf="isICD10Show">
            <div class="popup-add-doctor flex column" id="popupIcd">
                <div class="popup-add-header">选择ICD-10</div>
                <div class="popup-add-body flex1 flex">
                    <div class="flex1 flex column" style="padding: 10px;">
                        <div class="add-program-header" style="margin-bottom: 10px;">选择名称</div>
                        <div class="popup-add-body-left flex1 flex column">
                            <div class="input-group" style="margin-bottom: 10px;min-height: 30px;">
                                <div class="input-group-addon">@</div>
                                <input type="text" class="form-control form-control-sm" id="inlineFormInputGroup" placeholder="请输入名称或代码" #icd10SearchBox (keyup)="searchICD10Text=icd10SearchBox.value">
                            </div>
                            <div class="flex1">
                                <div class="text-left popup-add-margin">
                                    <icd10-tree #tree [keyword]="searchICD10Text" [options]="options" (onActivate)="chooseICD10s($event)"></icd10-tree>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="flex1 flex column" style="padding: 10px;">
                        <div class="add-program-header" style="margin-bottom: 10px;">已经选择</div>
                        <div class="popup-add-body-right flex1">
                            <div *ngFor="let item of choosedICD10s;let i = index" (click)="choosedICD10s.splice(i, 1);">
                                <input type="checkbox" checked>{{item.name ? item.name : item.dbdName}}
                            </div>
                        </div>
                    </div>
                </div>
                <div class="popup-add-footer">
                    <button type="button" class="btn btn-secondary add-program-add-btn" (click)="cancel()">取消</button>
                    <button type="button" class="btn btn-primary add-program-add-btn" (click)="submit()">确定</button>
                </div>
            </div>
        </div>
    `,
    styleUrls: [ 'icd10-dialog.component.css', '../../common/popup-add.css' ]
})
export class ICD10Dialog implements OnChanges {
    private choosedICD10s: ChoosedICD10[] = [];
    private isICD10Show: boolean = false;
    private searchICD10Text: string = '';

    ngAfterViewInit() {
        
    }

    @Input() options: any;
    @Output() onChooseICD10s: EventEmitter<any> = new EventEmitter();

    constructor() { }
    
    ngOnInit() {

	}

    private chooseICD10s($event: any) {
		var id = $event.node.data.id,
            name = $event.node.data.name;
        
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
            for(var i=0,len=this.choosedICD10s.length; i<len; i++){
                let _i = this.choosedICD10s.pop();
                if(_i.id == id){
                    contain = true;
                    continue;
                }
                this.choosedICD10s.unshift(_i);
            }
            if(!contain){
                this.choosedICD10s.push({id: id, name: name});
            }
        } else {
            this.choosedICD10s = [{id: id, name: name}];
        }
	}

    private submit() {
        this.isICD10Show = false;
        //如果一个都没选中，不做处理
        if(this.choosedICD10s.length == 0) {
            return;
        }
        this.onChooseICD10s.emit(this.choosedICD10s);
        this.choosedICD10s = [];
    }
    
    private cancel() {
        this.isICD10Show = false;
        this.choosedICD10s = [];
    }
    show() {
        this.isICD10Show = true;
    }
    ngOnChanges(changes : any) {
        // if(changes.options.showDialog.currentValue)
        //     console.log(changes.options.showDialog.currentValue);
        if(this.options && this.options.choosedICD10s){
            this.choosedICD10s = this.options.choosedICD10s;
        }
    }
}