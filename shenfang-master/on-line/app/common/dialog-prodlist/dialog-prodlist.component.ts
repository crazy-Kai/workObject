import { Component, ViewChild, Input, Output, EventEmitter } from '@angular/core';
import { TablePlugin } from '../ug-table/table.module';

@Component({
	selector: 'dialog-prodlist',
	templateUrl: 'dialog-prodlist.component.html',
	styleUrls: [ 'dialog-prodlist.component.css' ]
})

export class DialogProdlistComponent {
	private productSearchQuery: any = {
		productName: '',
		producerName: ''
	};
    curNodes: any[] = [];


    @ViewChild(TablePlugin) tablePlugin: TablePlugin;

    private isShow: boolean = false;
    @Input() selected: any[];
    @Output() close = new EventEmitter();
    @Output() confirm = new EventEmitter();

	search(){
        let query: string = this.prodtable.url;

        for(let attr in this.productSearchQuery){
            if (this.productSearchQuery[attr]) {
				query += `&${attr}=${this.productSearchQuery[attr]}`;
			}
        }

        let ids: any[] = [];
        for(let prod of this.selected){
            ids.push(prod.id);
        }
        query += `&selected=${ids.join(",")}`;
        
        this.tablePlugin.loadDataByUrl(query, true);
	}

	onCheck($event: any) {
		// this.curNodes = $event;
    }

    show(){
        this.isShow = true;

        setTimeout(()=>{
            this.search();
        },0);
    }

    fnClose(){
    	this.isShow = false;
    	// this.close.emit(null);
    }

    fnConfirm(){
        this.isShow = false;
        this.confirm.emit(this.curNodes);
    }

	prodtable: any = {
        title: [
            {
                name: '选择框',
                type: 'checkbox',
                width: '4%'
            }, {
                type: 'index',
                name: '序号',
                width: '4%'
            }, {
                id: 'id',
                name: '产品ID',
                width: '12%'
            }, {
                id: 'chineseproductname',
                name: '通用名称',
                width: '15%'
            }, {
                id: 'goodsname',
                name: '商品名称',
                width: '15%'
            }, {
                id: 'chinesemanufacturename',
                name: '生产厂家',
                width: '25%'
            }, {
                id: 'chinesespecification',
                name: '规格',
                width: '15%'
            }, {
                id: 'formulation',
                name: '剂型',
                width: '10%'
            }
        ],
        pageSize: 20,
        url: "/api/v1/productList?pageNum={currentPage}&pageSize={pageSize}",
        dataListPath: "recordList",
        itemCountPath: "recordCount"
    };
}