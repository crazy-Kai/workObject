import { Component, OnInit, Input, Output, EventEmitter, ViewChild } from '@angular/core';
import { DrugService } from '../../data_management/patient_guide/drug_tree.service';
import { UserService } from '../../user.service';
import { DialogPlugin } from '../../common/ug-dialog/dialog';
import { TablePlugin } from '../../common/ug-table/table.module';

@Component({
    selector: 'add_product',
    template: require('./add_product.component.html'),
    styles: [require('./sort_management.component.css') + ""],
})
export class AddProductComponent implements OnInit {
    @Input() title = "知识管理平台";
    drugGroup: any;
    error: any;
    searchText: string;
    // @Input() isTemplate: boolean;
    @Input() drugForm: any;
    @ViewChild(DialogPlugin) dialogPlugin: DialogPlugin;
    @ViewChild(TablePlugin) tablePlugin: TablePlugin;
    productName: string;
    producerName: string;
    checkArr: any[] = [];
    selectedProject: any;
    productListUrl = '/api/v1/productList?pageNum={currentPage}&numPerPage={pageSize}';
    table: any = {
        title:[
            {
                type: 'checkbox'
            }, {
                id: 'chineseproductname',
                name: '通用名称'
            },
            {
                id: 'chinesemanufacturename',
                name: '生产厂家'
            }, {
                id: 'dictformulation',
                name: '字典剂型'
            }, {
                id: 'formulation',
                name: '产品剂型'
            }, {
                id: 'chinesespecification',
                name: '规格'
            }],
        pageSize: 20,
        url: "/api/v1/productList.json?numPerPage={pageSize}&pageNum={currentPage}",
        dataListPath: "recordList",
        itemCountPath: "recordCount"
    };

    @Output() onClose: EventEmitter<any> = new EventEmitter();

    constructor(private drugService: DrugService,
        private userService: UserService) {
    }


    ngOnInit() {
        if (this.drugForm) {
            this.productName = this.drugForm.drug.ypmc;
            this.searchProduct();
        }
    }

    // searchByDrugName() {
    //     if (!this.searchText) {
    //         this.ngOnInit();
    //         return;
    //     }
    //     // this.drugService.searchByDrugName(this.searchText)
    //     //     .then(drugGroup => this.drugGroup = drugGroup,
    //     //     error => this.error = <any>error);
    // }

    close(message?: string) {
        this.onClose.emit(message);
    }

    searchProduct() {
        let tempUrl = this.productListUrl;
        if ((!this.productName) && (!this.producerName)) {
            this.table.url = this.productListUrl;
            this.tablePlugin.loadDataByUrl(this.table.url, true);
            return;
        }
        if (this.productName) {
            tempUrl = tempUrl + "&productName=" + this.productName;
        }
        if (this.producerName) {
            tempUrl = tempUrl + "&producerName=" + this.producerName;
        }
        this.table.url = tempUrl;
        this.tablePlugin.loadDataByUrl(this.table.url, true);
    }

    addProduct() {
        // if (this.selectedProject && this.checkArr.length == 0) {
        // 		this.checkArr.push(this.selectedProject);
        // 	}
        if (this.checkArr.length == 0) {
            this.close();
            return;
        }
        this.drugService.addDrugProduct(this.checkArr, this.drugForm.drug.id)
            .then(result => {
                this.close(result.message);
            }
            , error => this.error = <any>error
            );
    }

    onCheck($event: any) {
        console.log($event);
        this.checkArr = $event;
    }

    onclick($event: any) {
        console.log($event);
        this.selectedProject = $event;
    }
}