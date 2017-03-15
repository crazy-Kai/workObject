/***
 * 
 * @auther 
 * @modify anwen
 */
import { Component, OnInit, Output, Input, EventEmitter, ViewChild } from '@angular/core';
import { PathLocationStrategy } from '@angular/common';
import { Router } from '@angular/router';
import { ProductManageService } from './product.service';
import { ActivatedRoute } from '@angular/router';
import { ProductInfoDetail } from './product_detail';
import { PharmacokineticsDto } from './product_detail';
import { ProductDto } from './product_detail';
import { Pharmacokinetics, PharData } from './product_detail';
import { DialogPlugin, DialogModel } from '../../common/ug-dialog/dialog';
import { TreeNode } from 'angular2-tree-component';
import { DictionaryService } from '../../data_management/patient_guide/dictionary.service';
import { UserService } from '../../user.service';
import { DrugService } from '../../data_management/patient_guide/drug_tree.service';


var DRUG_ID = '0013921000';

@Component({
    selector: 'product-detail',
    styles: [require('./product.css') + ""],
    template: require('./product_detail.component.html'),
    providers: [
        DictionaryService,
        ProductManageService,
        DrugService,
        PathLocationStrategy
    ]
})
export class ProductDetailComponent implements OnInit {
    @Input() productId: string;
    @Input() operate: boolean;
    // @Output() editComplete: EventEmitter<any> = new EventEmitter();
    @ViewChild(DialogPlugin) dialogPlugin: DialogPlugin;
    sub: any;
    //operate: boolean;  //true 修改 false 查看
    //productId: string;
    error: any;
    DRAG_ROUTE_CODE = 'sys_dictcate_gytj'; //给药途径code
    pharmacokineticsDto = new Array<PharmacokineticsDto>();
    productDto = new ProductDto;
    drugcategoryname: string;       //映射新分类暂存字段
    pharmacokinetics = new Pharmacokinetics();
    drugList: string[];
    chooseDictCodes: string = '';
    chooseDictName: string = '';
    drugPropertys: string;
    productDictformulation: string;
    chooseRouteCodes: string = '';
    chooseRouteName: string = '';
    flmcId: string;
    productInfoDetail: ProductInfoDetail = {
        'productDto': this.productDto,
        'pharmacokineticsDtos': this.pharmacokineticsDto,
        'drugList': this.drugList,
        'chooseDictCodes': this.chooseDictCodes,
        'chooseDictName': this.chooseDictName,
        'drugPropertys': this.drugPropertys,
        'productDictformulation': this.productDictformulation,
        'chooseRouteCodes': this.chooseRouteCodes,
        'chooseRouteName': this.chooseRouteName,
        'flmcId': this.flmcId
    }

    DISEASE_CODE = "sys_dictcate_jix";
    diseaseGroup: any;
    categoryCode: string;
    dictValue: string;
    searchText: string;
    jixDicCode: string;
    isAddProductDialog: boolean = false;
    propertyGroup: any;//分类属性树
    propertyCode = 'sys_dictcate_shux';
    options: any = {
        options: {
            getChildren: this.getTreeChildren.bind(this),
            idField: 'uuid'
        }
    };
    isAddDrugDialog: boolean = false;
    drugGroup: any;//分类属性树
    drugOptions: any = {
        options: {
            getChildren: this.getDrugTreeChildren.bind(this),
            idField: 'uuid'
        }
    };

    constructor(
        private router: Router,
        private route: ActivatedRoute,
        private productManageService: ProductManageService,
        private dictionaryService: DictionaryService,
        private drugService: DrugService,
        private pathLocationStrategy: PathLocationStrategy
    ) { }

    ngOnInit() {
        document.documentElement.scrollTop = document.body.scrollTop =0;
        if(!this.productId || !this.operate){
            this.getRouteParam();
        }
        this.getProductInfo();
    }


    getRouteParam() {
        this.sub = this.route.params.subscribe(params => {
            if ((params['product_id'] !== undefined)) {
                this.productId = params['product_id'];
            }
            if ((params['operate'] !== undefined)) {
                let operateStr = params['operate'];
                if (operateStr == 'false') this.operate = false;
                if (operateStr == 'true') this.operate = true;
            }

        });
    }
    getProductInfo() {
        this.productManageService.getProductInfo(this.productId).then(productInfoDetail => {
            if (!this.productManageService.isEmptyObject(productInfoDetail.productDto)) {
                this.productDto = productInfoDetail.productDto;
            }

            this.dictionaryService.jixDicCode = this.productDto.dictformulation;

            if (!this.productManageService.isEmptyObject(productInfoDetail.pharmacokineticsDtos)) {
                this.pharmacokineticsDto = productInfoDetail.pharmacokineticsDtos;
                this.getFromPharmacokineticsDto();
            }

            if (!this.productManageService.isEmptyObject(productInfoDetail.drugList)) {
                this.drugList = productInfoDetail.drugList;
            }

            if (!this.productManageService.isEmptyObject(productInfoDetail.dictValuesCode))
                this.chooseDictCodes = productInfoDetail.dictValuesCode;

            if (!this.productManageService.isEmptyObject(productInfoDetail.dictValues))
                this.chooseDictName = productInfoDetail.dictValues;

            if (!this.productManageService.isEmptyObject(productInfoDetail.drugPropertys)){
                this.drugPropertys = productInfoDetail.drugPropertys.join('<br/>');
            }
            
            if (!this.productManageService.isEmptyObject(productInfoDetail.productDictformulation))
                this.productDictformulation = productInfoDetail.productDictformulation;

            if (!this.productManageService.isEmptyObject(productInfoDetail.routeValuesCode))
                this.chooseRouteCodes = productInfoDetail.routeValuesCode;

            if (!this.productManageService.isEmptyObject(productInfoDetail.routeValues))
                this.chooseRouteName = productInfoDetail.routeValues;

            this.getPropertyTree();
            this.getDrugTree();
        })
    }


    getFromPharmacokineticsDto() {
        for (let i = 0; i < this.pharmacokineticsDto.length; i++) {
            let name = this.pharmacokineticsDto[i].property;
            this.pharmacokinetics[name].value = this.pharmacokineticsDto[i].value;
            this.pharmacokinetics[name].id = this.pharmacokineticsDto[i].id;
        }
    }

    onCancel(isView: boolean) {
        //isView -true 查看
        if (isView) {
            this.pathLocationStrategy.back();
            return;
        }
        this.dialogPlugin.confirm("确认要放弃保存并退出吗？", () => {
            this.pathLocationStrategy.back();
        }, () => { });
    }

    // turnToProductListPage() {
    //     let link = ['drug_management/drug_data/product_management'];
    //     this.router.navigate(link);
    // }

    updateInfo() {
        this.productDto.drugcategoryname = this.drugcategoryname;
        this.updatePharmacokineticsToPharmacokineticsDto();
        this.moveDataToProductInfoDetail();
        this.productManageService.saveProductInfo(this.productInfoDetail).then(productInfoDetail => {
            this.pathLocationStrategy.back();
        }, error => this.error = error
        );
    }

    updatePharmacokineticsToPharmacokineticsDto() {
        let i = 0;
        for (var name in this.pharmacokinetics) {
            if (this.pharmacokinetics[name].id || this.pharmacokinetics[name].value) {
                this.pharmacokineticsDto[i] = new PharmacokineticsDto();
                this.pharmacokineticsDto[i].applyType = 2;
                this.pharmacokineticsDto[i].property = name;
                this.pharmacokineticsDto[i].value = this.pharmacokinetics[name].value;
                this.pharmacokineticsDto[i].id = this.pharmacokinetics[name].id;
                i++;
            };
        }
        this.productDto.pharmacokineticsDtos = this.pharmacokineticsDto;
    }

    moveDataToProductInfoDetail() {
        this.productInfoDetail.productDto = this.productDto;
        this.productInfoDetail.productDto.dictformulation = this.dictionaryService.jixDicCode;
        this.productInfoDetail.pharmacokineticsDtos = this.pharmacokineticsDto;
        this.productInfoDetail.drugPropertys = this.drugPropertys;
        this.productInfoDetail.drugList = this.drugList;
        this.productInfoDetail.chooseDictName = this.chooseDictName;
        this.productInfoDetail.chooseDictCodes = this.chooseDictCodes;
        this.productInfoDetail.flmcId = this.flmcId;
        this.productInfoDetail.productDictformulation = this.productDictformulation;
        this.productInfoDetail.chooseRouteName = this.chooseRouteName;
        this.productInfoDetail.chooseRouteCodes = this.chooseRouteCodes;
    }

    // 选择剂型
    chooseJix() {
        this.dialogPlugin.myDialog();
        this.getDiseaseCategory();
    }

    getDiseaseChildren(node: any): any {
        return this.dictionaryService.getChildrenByNode(node.data);
    }
    jixTemplateStringOptions = {
        getChildren: this.getDiseaseChildren.bind(this),
        idField: 'uuid'
    }
    getDiseaseCategory() {
        this.dictionaryService.getChildrenByCode(this.DISEASE_CODE)
            .then(disease => {
                this.diseaseGroup = disease;
            },
            error => this.error = <any>error);
    }
    searchjix() {
        if (!this.searchText) {
            this.getDiseaseCategory();
            return;
        }
        this.dictionaryService.searchByValue(this.DISEASE_CODE, this.searchText)
            .then(diseaseGroup =>
                this.diseaseGroup = diseaseGroup,
            error => this.error = <any>error);
    }
    confirmDisease() {
        this.dictionaryService.jixDicCode = this.jixDicCode;
        // this.onClose();
    }
    // onClose() {
    //     this.dialogModel.isTemplate = false;
    // }
    getJixTreeNode($event: any) {
        this.jixDicCode = $event.node.data.code;
    }

    /***********点击跳出带checkbox的tree框 产品属性
	 * - getCheckedNode()
	 *   获取已经勾选的数据
	 * - getPropertyTree()
	 *   获取分类属性树
	 */

    getPropertyTree() {
        this.dictionaryService.getChildrenByCode(this.propertyCode)
            .then(propertyGroup => {
                let checkedCodes = this.chooseDictCodes.split('@@@');
                for (let i = 0; i < propertyGroup.length; i++) {
                    for (let j = 0; j < checkedCodes.length; j++) {
                        if (propertyGroup[i].code == checkedCodes[j]) {
                            propertyGroup[i].checked = true;
                        }
                    }
                }
                this.propertyGroup = propertyGroup;
            },
            error => this.error = error);
    }

    getTreeChildren(node: any): any {
        // return this.dictionaryService.getChildrenByNode(node.data);
        return new Promise((resolve, reject) => {
            resolve(this.dictionaryService.getChildrenByNode(node.data)
                .then(result => {
                    let checkedCodes = this.chooseDictCodes.split('@@@');
                    for (let i = 0; i < result.length; i++) {
                        for (let j = 0; j < checkedCodes.length; j++) {
                            if (result[i].code == checkedCodes[j]) {
                                result[i].checked = true;
                            }
                        }
                    }
                    return result;
                }));
        });
    }

    getCheckedNode($event: any) {
        this.chooseDictCodes = "";
        this.chooseDictName = "";
        for (let i = 0; i < $event.length; i++) {
            this.chooseDictCodes += $event[i].code + "@@@";
            this.chooseDictName += $event[i].name + ",";
        }
    }

    onProductClose() {
        this.isAddProductDialog = false;
    }

    addProductProprety() {
        this.isAddProductDialog = true;
    }
    /***********点击跳出带checkbox的tree框 药品
	 * - getCheckedNode()
	 *   获取已经勾选的数据
	 * - getPropertyTree()
	 *   获取分类属性树
	 */

    getDrugTree() {
        this.dictionaryService.getChildrenByCode(this.DRAG_ROUTE_CODE)
            .then(drugGroup => {
                let checkedCodes = this.chooseRouteCodes.split('@@@');
                for (let i = 0; i < drugGroup.length; i++) {
                    for (let j = 0; j < checkedCodes.length; j++) {
                        if (drugGroup[i].code == checkedCodes[j]) {
                            drugGroup[i].checked = true;
                        }
                    }
                }
                this.drugGroup = drugGroup;
            },
            error => this.error = error);
    }

    getDrugTreeChildren(node: any): any {
        // return this.dictionaryService.getChildrenByNode(node.data);
        return new Promise((resolve, reject) => {
            resolve(this.dictionaryService.getChildrenByNode(node.data)
                .then(result => {
                    let checkedCodes = this.chooseRouteCodes.split('@@@');
                    for (let i = 0; i < result.length; i++) {
                        for (let j = 0; j < checkedCodes.length; j++) {
                            if (result[i].code == checkedCodes[j]) {
                                result[i].checked = true;
                            }
                        }
                    }
                    return result;
                }));
        });
    }

    getDrugCheckedNode($event: any) {
        this.chooseRouteCodes = "";
        this.chooseRouteName = "";
        for (let i = 0; i < $event.length; i++) {
            this.chooseRouteCodes += $event[i].code + "@@@";
            this.chooseRouteName += $event[i].name + ",";
        }
    }

    onDrugClose() {
        this.isAddDrugDialog = false;
    }

    addDrugProprety() {
        this.isAddDrugDialog = true;
    }

    /************************ 获取药品分类弹窗 ************************/
    drugCategoryDialogOptions: any;
    @ViewChild('drugCategoryDialog') dialog: any;
    chooseNewCategory() {
        this.drugCategoryDialogOptions = {
            chooseControl: (function (productDto : any, dialogPlugin : any) {  return function (choosedDrug: any) {
                    console.dirxml(productDto);
                    console.dirxml(dialogPlugin);
                    if (choosedDrug.name === productDto.drugcategoryname || !productDto.drugcategoryname) {
                        let hasChildren = choosedDrug.hasChildren;
                        if (hasChildren == null)
                            hasChildren = choosedDrug.children == null? false : choosedDrug.children.length == 0 ? false : true;
                        if (hasChildren) {
                            return false;
                        }
                    } else {
                        dialogPlugin.tip("只能选择名为" + productDto.drugcategoryname + '的分类');
                        return false;
                    }
                    return true;
                }}(this.productDto, this.dialogPlugin))
            }
        this.dialog.show();
    }
    chooseNewCategoryConfirm($event: any) {
        this.flmcId = $event[0].id;
        this.drugcategoryname = $event[0].name;
    }
    /************************ 获取药品分类弹窗 ************************/
}





