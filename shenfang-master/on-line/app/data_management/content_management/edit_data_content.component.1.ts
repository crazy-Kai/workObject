/***
 * 资料内容管理详情页面
 * @auther zhouyan
 * @modify anwen
 */

import { Component, OnInit, DoCheck, ViewChild, Input, Output, Injectable, EventEmitter, IterableDiffers } from '@angular/core';
import { Router } from '@angular/router';
import { TreeNode } from 'angular2-tree-component';
import { ActivatedRoute } from '@angular/router';
import { DataDetailService } from './data_detail.service';
import { DictionaryService } from '../patient_guide/dictionary.service';
import { DrugService } from '../patient_guide/drug_tree.service';
//引入插件 
import { DialogPlugin, DialogModel } from '../../common/ug-dialog/dialog';
import { TablePlugin } from '../../common/ug-table/table.module';
import { UploadPlugin } from '../../common/ug-upload/upload.plugin';
// import { UploadPlugin } from '../../common/ug-upload/upload.plugin';
import { UserService } from '../../user.service';


@Component({
    selector: 'edit-data-content',
    styles: [require('./content_management.component.css') + ""],
    template: require('./edit_data_content.component.html'),
    providers: [
        DataDetailService,
        DictionaryService,
        DrugService
    ]
})
export class EditDataContentComponent implements OnInit {
    sub: any;
    params: string;
    uploadType = "collect";
    dataType: number;
    id: number;
    navigated = false;
    error: any;
    @ViewChild(DialogPlugin) dialogPlugin: DialogPlugin;
    @ViewChild(TablePlugin) tablePlugin: TablePlugin;
    @ViewChild(UploadPlugin) uploadPlugin: UploadPlugin;
    docInfo: any = {};

    //弹窗类型
    isDialog = false;
    typeTitles = ['疾病', '药品', '产品', '书籍', '资料', '报纸'];
    type: number;//弹窗类型
    nodes: any;//树的节点
    options: any;//树的参数
    searchText: string[] = [];//搜索内容
    code: string;
    table: any;//表
    checkedList: any;//选择列表

    currentDisease: any = {};//单选项目的当前目标信息
    currentDrug: any = {};
    currentBook: any = {};
    currentJournal: any = {};
    currentPaper: any = {};


    //疾病
    DISEASE_CODE = "sys_diagnose";//疾病
    icdName: string;

    //药品
    DRUG_ID = "0013921000";
    drugName: string;

    //产品
    productName: string = '';
    goodsname: string = '';
    producerName: string = '';

    //书籍
    bookName: string;

    //期刊
    periodName: string;

    //报纸
    newspaperName: string;
    // dictionaryData: any={};
    // pharmacyList: any={};

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private dictionaryService: DictionaryService,
        private dataDetailService: DataDetailService,
        private drugService: DrugService,
        private userService: UserService) { }

    ngOnInit() {
        this.getRouteParam();
    }

    getRouteParam() {
        this.sub = this.route.params.subscribe(params => {
            if ((params['dataType'] !== undefined)) {
                this.dataType = params['dataType'];
                this.navigated = true;
            } else {
                if ((params['doc_type'] !== undefined) && (params['id'] !== undefined)) {
                    this.dataType = params['doc_type'];
                    this.id = params['id'];
                    this.getDocInfo(this.id);
                    // this.getDictionaryData();
                    // this.getPharmacyList();
                    this.navigated = true;
                } else {
                    this.navigated = false;
                }
            }
        });
        this.docInfo.docType = this.dataType;
    }

    getDocInfo(id: number) {
        this.dataDetailService.getDocInfo(id)
            .then(docInfo => {
                this.docInfo = docInfo;
                this.bookName = this.docInfo.book;
                this.periodName = this.docInfo.period;
                this.newspaperName = this.docInfo.newspaper;
                for (let i = 0; i < docInfo.dpds.length; i++) {
                    if (docInfo.dpds[i].dbdType == 0) {
                        this.drugName = docInfo.dpds[i].dbdName;
                        this.docInfo.drugs = docInfo.dpds[i].dbdId;
                    }
                    if (docInfo.dpds[i].dbdType == 1) {
                        this.productName = docInfo.dpds[i].dbdName;
                        this.docInfo.products = docInfo.dpds[i].dbdId;
                    }
                    if (docInfo.dpds[i].dbdType == 2) {
                        this.icdName = docInfo.dpds[i].dbdName;
                        this.docInfo.icdCodes = docInfo.dpds[i].dbdId;
                    }
                }
            },
            error => this.error = error
            );
    }


    turnToDataContentPage() {
        this.router.navigate(['data_management/content_management/data_content_management']);
    }

    // 保存
    onSubmit() {
        // 新增一条资料
        if (!this.id) {
            this.dataDetailService.newData(this.docInfo)
                .then(savedData => {
                    if (savedData.code == '200') {
                        this.dialogPlugin.tip(savedData.message);
                        this.uploadPlugin.uploadFiles(savedData.data.id);
                        this.id = savedData.data.id;
                    } else {
                        this.dialogPlugin.tip(savedData.message);
                    }
                },
                error => this.error = error);
        }
        // 修改资料
        else {
            this.dataDetailService.save(this.docInfo)
                .then(savedData => {
                    if (savedData.status == '200') {
                        this.dialogPlugin.tip(savedData.message);
                        this.uploadPlugin.uploadFiles(this.id);
                    } else {
                        this.dialogPlugin.tip(savedData.message);
                    }
                },
                error => this.error = error);
        }
    }
    // 取消修改关闭
    onCancel() {
        this.dialogPlugin.confirm("确认要放弃保存并退出吗？", () => {
            this.turnToDataContentPage();
        }, () => { });
    }

    /******弹窗相关
     *  - isDialog true  弹出弹出框
     */
    // 选择疾病
    chooseDisease() {
        this.type = 0;
        this.isDialog = true;
        this.getDiseaseCategory();
        this.options = this.diseaseTemplateStringOptions;
        this.code = this.DISEASE_CODE;
    }
    getDiseaseCategory() {
        this.dictionaryService.getChildrenByCode(this.DISEASE_CODE)
            .then(disease => {
                this.nodes = disease;
            },
            error => this.error = <any>error);
    }
    getDiseaseChildren(node: any): any {
        return this.dictionaryService.getChildrenByNode(node.data);
    }
    diseaseTemplateStringOptions = {
        getChildren: this.getDiseaseChildren.bind(this),
        idField: 'uuid'
    }
    // 选择药品
    chooseDrug() {
        this.type = 1;
        this.isDialog = true;
        this.getDrugCategory();
        this.options = this.drugTemplateStringOptions;
        this.code = this.DRUG_ID;
    }
    getDrugChildren(node: any): any {
        return this.drugService.getChildren(node.data.id)
    }
    drugTemplateStringOptions = {
        getChildren: this.getDrugChildren.bind(this),
        idField: 'uuid'
    }
    getDrugCategory() {
        this.drugService.getChildren(this.DRUG_ID)
            .then(drug => {
                this.nodes = drug;
            },
            error => this.error = <any>error);
    }
    // 选择产品 
    chooseProduct() {
        this.type = 2;
        this.isDialog = true;
        this.table = this.producttable;

        //解决第二次打开产品分类弹出框时，加载的是上一次搜索的数据
        this.table.url = this.producttable.initUrl;
        this.searchText[this.type] = '', this.goodsname = '', this.producerName = '';
    }
    producttable: any = {
        title: [
            {
                name: '选择框',
                type: 'checkbox'
            }, {
                type: 'index',
                name: '序号',
            }, {
                id: 'id',
                name: '产品ID',
            }, {
                id: 'chineseproductname',
                name: '通用名称',
            }, {
                id: 'goodsname',
                name: '商品名称',
            }, {
                id: 'chinesemanufacturename',
                name: '生产厂家',
            }, {
                id: 'chinesespecification',
                name: '规格',
            }, {
                id: 'formulation',
                name: '剂型',
            }
        ],
        pageSize: 20,
        url: "/api/v1/productList?pageNum={currentPage}&pageSize={pageSize}",
        initUrl: "/api/v1/productList?pageNum={currentPage}&pageSize={pageSize}",
        dataListPath: "recordList",
        itemCountPath: "recordCount"
    };
    cancelProduct(product: any) {
        if (this.isContains(this.checkedList, product)) {
            this.removeObjFromArr(this.checkedList, product);
            this.tablePlugin.tableModel.checkedRowsArr = this.checkedList;
        }
    }
    // 选择书籍
    chooseBook() {
        this.type = 3;
        this.isDialog = true;
        if (this.searchText[this.type]) {
            this.booktable.url = this.booktable.initUrl + '&bookName=' + this.searchText[this.type];
        }

        this.table = this.booktable;
    }
    booktable: any = {
        title: [
            {
                id: 'id',
                name: 'ID',
                width: '100px'
            }, {
                id: 'bookName',
                name: '书籍名称',
                width: '200px'
            }, {
                id: 'bookAuthor',
                name: '作者'
            }, {
                id: 'press',
                name: '出版社',
                width: '200px'
            }, {
                id: 'isbn',
                name: 'ISBN'
            }, {
                id: 'timePub',
                name: '出版时间',
                type: 'date'
            }, {
                id: 'modifyUser',
                name: '维护人'
            }, {
                id: 'modifyTime',
                name: '更新时间',
                type: 'date'
            }
        ],
        pageSize: 20,
        url: "/api/v1/booksPharmacyListByName?pageNum={currentPage}&numPerPage={pageSize}",
        initUrl: "/api/v1/booksPharmacyListByName?pageNum={currentPage}&numPerPage={pageSize}",
        dataListPath: "recordList",
        itemCountPath: "recordCount"
    };
    // 选择期刊-资料
    chooseJournal() {
        this.type = 4;
        this.isDialog = true;
        if (this.searchText[this.type]) {
            this.journaltable.url = this.journaltable.initUrl + '&periodicalName=' + this.searchText[this.type];
        }
        this.table = this.journaltable;
    }
    journaltable: any = {
        title: [
            {
                id: 'id',
                name: '序号'
            }, {
                id: 'periodicalName',
                name: '期刊名称'
            }, {
                id: 'name_zh_en',
                name: '中文/英文名称'
            }, {
                id: 'organizerName',
                name: '主办单位'
            }, {
                id: 'distributionUnit',
                name: '发行单位'
            }, {
                id: 'placePub',
                name: '出版地'
            }, {
                id: 'modifyUser',
                name: '维护人'
            }, {
                id: 'modifyTime',
                name: '更新时间',
                type: 'date'
            }
        ],
        pageSize: 20,
        url: "/api/v1/booksPeriodicalListByName?pageNum={currentPage}&numPerPage={pageSize}",
        initUrl: "/api/v1/booksPeriodicalListByName?pageNum={currentPage}&numPerPage={pageSize}",
        dataListPath: "recordList",
        itemCountPath: "recordCount"
    };

    // 选择报纸
    choosePaper() {
        this.type = 5;
        this.isDialog = true;
        this.table = this.papertable;
    }

    papertable: any = {
        title: [
            {
                id: 'id',
                name: '序号'
            }, {
                id: 'newspaperName',
                name: '报纸名'
            }, {
                id: 'languages',
                name: '语种'
            }, {
                id: 'publication',
                name: '出版社'
            }, {
                id: 'newspaperCategory',
                name: '报刊类别'
            }, {
                id: 'isbn',
                name: '标准刊号'
            }, {
                id: 'publicationTime',
                name: '创刊时间',
                type: 'date'
            }, {
                id: 'modifyUser',
                name: '添加人'
            }, {
                id: 'modifyTime',
                name: '添加时间',
                type: 'date'
            }
        ],
        pageSize: 20,
        url: "/api/v1/booksNewspaperList?pageNum={currentPage}&numPerPage={pageSize}",
        initUrl: "/api/v1/booksNewspaperList?pageNum={currentPage}&numPerPage={pageSize}",
        dataListPath: "recordList",
        itemCountPath: "recordCount"
    };
    //弹窗公用方法
    onClose() {
        this.isDialog = false;
    }
    onCheck($event: any) {
        this.checkedList = $event;
        console.log(this.checkedList);
    }
    search() {
        let searchUrl: string;
        // if (!this.searchText[this.type] && this.type != 2) {
        //     this.ngOnInit();
        //     return;
        // }
        switch (this.type) {
            case 0:
                if (!this.searchText[this.type])
                    this.getDiseaseCategory();
                else {
                    this.dictionaryService.searchByValue(this.code, this.searchText[this.type])
                    .then(result =>
                        this.nodes = result,
                    error => this.error = <any>error);
                }
                break;
            case 1:
                if (!this.searchText[this.type])
                    this.getDrugCategory();
                else {
                    this.drugService.searchByDrugName(this.searchText[this.type])
                        .then(drugGroup => this.nodes = drugGroup,
                        error => this.error = <any>error);
                }
                break;
            case 2:
                //资料管理>内容管理>资料内容管理>添加期刊杂志::选择产品分类 + 搜索
                //searchText == productName, goodsname, producerName
                searchUrl = this.table.initUrl;
                if (this.searchText[this.type]) {
                    searchUrl += '&productName=' + this.searchText[this.type];
                }

                if (this.goodsname) {
                    searchUrl += '&goodsname=' + this.goodsname;
                }

                if (this.producerName) {
                    searchUrl += '&producerName=' + this.producerName;
                }

                this.tablePlugin.loadDataByUrl(searchUrl);
                break;
            case 3:
                searchUrl = this.table.initUrl;
                if (this.searchText[this.type]) {
                    searchUrl += '&bookName=' + this.searchText[this.type];
                }
                this.tablePlugin.loadDataByUrl(searchUrl);
                break;
            case 4:
                searchUrl = this.table.initUrl;
                if (this.searchText[this.type]) {
                    searchUrl += '&periodicalName=' + this.searchText[this.type];
                }
                this.tablePlugin.loadDataByUrl(searchUrl);
                break;
        }
    }
    chooseNode($event: any) {
        switch (this.type) {
            case 0:
                this.currentDisease = $event.node.data;
                break;
            case 1:
                this.currentDrug = $event.node.data;
                break;
        }
    }
    //选择产品分类等弹出框中，table行选择事件
    chooseTr($event: any) {
        switch (this.type) {
            case 3:
                this.currentBook = $event;
                break;
            case 4:
                this.currentJournal = $event;
                break;
            case 5:
                this.currentPaper = $event;
                break;
        }
    }
    confirm() {
        switch (this.type) {
            case 0:
                this.docInfo.icdCodes = this.currentDisease.code;
                this.icdName = this.currentDisease.name;
                break;
            case 1:
                this.docInfo.drugs = this.currentDrug.id;
                this.drugName = this.currentDrug.name;
                break;
            case 2:
                this.docInfo.products = '';
                this.productName = '';      //修复重新选择产品时，前一次的产品分类选择不清空的bug
                for (let i = 0; i < this.checkedList.length; i++) {
                    this.docInfo.products += this.checkedList[i].id + ',';
                    this.productName += this.checkedList[i].chineseproductname + ',';
                }
                break;
            case 3:
                this.docInfo.book = this.currentBook.id;
                this.docInfo.nameBook = this.currentBook.bookName;
                break;
            case 4:
                this.docInfo.period = this.currentJournal.id;
                this.periodName = this.currentJournal.periodicalName;
                break;
            case 5:
                this.docInfo.newspaper = this.currentPaper.id;
                this.newspaperName = this.currentPaper.newspaperName;
                break;
        }
        this.onClose();
    }
    /********** 数组相关操作 ******
   * 
  */
    //判断元素obj是否存在在该数组arr中
    private isContains(arr: any[], obj: any): boolean {
        for (let index = 0; index < arr.length; index++) {
            if (arr[index] === obj) {
                return true;
            }
        }
        return false;
    }

    private removeObjFromArr(arr: any[], obj: any) {
        for (let index = 0; index < arr.length; index++) {
            if (arr[index] === obj) {
                arr.splice(index, 1);
                return true;
            }
        }
        console.error(obj + "not exist in" + arr);
        return false;
    }

}

