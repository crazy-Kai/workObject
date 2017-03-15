/***
 * 资料内容管理详情页面
 * @auther zhouyan
 * @modify anwen
 */
import { Component, OnInit, DoCheck, ViewChild, Input, Output, Injectable, EventEmitter, IterableDiffers } from '@angular/core';
import { Router } from '@angular/router';
import { TreeNode, TreeComponent, TREE_ACTIONS, KEYS, IActionMapping } from 'angular2-tree-component';
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
import { DataSortService } from '../sort_management/data_sort.service';
import { DialogProdlistComponent } from '../../common/dialog-prodlist/dialog-prodlist.component';
declare var UE: any;

@Component({
    selector: 'edit-data-content',
    styles: [require('./content_management.component.css') + ""],
    template: require('./edit_data_content.component.html'),
    providers: [
        DataDetailService,
        DictionaryService,
        DrugService,
        DataSortService
    ]
})
export class EditDataContentComponent implements OnInit {
    @ViewChild(DialogPlugin) dialogPlugin: DialogPlugin;
    @ViewChild(TablePlugin) tablePlugin: TablePlugin;
    @ViewChild(UploadPlugin) uploadPlugin: UploadPlugin;
    
    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private dictionaryService: DictionaryService,
        private dataDetailService: DataDetailService,
        private drugService: DrugService,
        private userService: UserService,
        private dataSortService: DataSortService) { }
    
    @ViewChild(TreeComponent) private tree: TreeComponent;
    bookTreeData: any;  //分类树
    treeSearchWord: string;

    docType: any; //0:书籍资料  1:期刊杂志  2:电子文献  3:电子公告  4:其他资料
    docTypeMap: string[] = [
        "书籍", "期刊", "电子文献", "电子公告", "其他资料"
    ];
    pcode: string;      //当前资料类型搜索字段
    docTypeName: string;    //当前资料类型搜索时，展示在页面的名称
    curType: any;
    uploadType = "collect"; //用于文件上传
    /**
	 * 
	 */
    id: any;                                //资料id
    docInfo: any = {};                      //资料对象

    
    /**
     * 关联药品、产品、疾病
     * code => API value, name => view value 
     */
    icdCodes: any[] = [];
    drugs: any[] = [];
    products: any[] = [];

    nodes: any;                         //
    options: any;
    curNodes: any[] = [];
    relevanceType: number;              // 0 => 药品， 1  => 产品, 2 => 疾病
    productSearchQuery: any = {};
    provenances: string[] = ['神经内科', '血液科', '内分泌科', '心血管科', '呼吸科', '消化科', '感染科', '肾内科', '肿瘤科', '精神科', '风湿免疫科', '普通外科', '骨科', '心胸外科', '神经外科',
                                '泌尿外科', '肛肠外科', '整形外科', '妇产科', '儿科', '皮肤科', '眼科', '耳鼻喉科', '口腔科', '急诊/重症科', '麻醉科', '影像科', '检验科', '病理科', '药学科'];
    DISEASE_CODE = "sys_diagnose";
    DRUG_ID = "0013921000";

    startPage: string;
    endPage: string;

    /**
     * 权限变量
     */
    docModifyPrivilegeName: string = "doc:put";
    readOnly: boolean = false;

    ngOnInit() {
        //路由跳转进来,需要判断一下权限
        this.checkDocModifyPrivilege();

        this.getRouteParam();

        //根据权限,展示页面的相应内容
        this.filterDomByPrivilege();
    }

    ngAfterViewInit(){
        this.initUEditor();
    }

    /**
     * 
     */
    private checkDocModifyPrivilege() : void {
        this.readOnly = !this.doPrivilegeCheck( this.docModifyPrivilegeName );
        console.log("资料内容修改权限:" + this.readOnly);
    }

    private doPrivilegeCheck( privilegeString: string) : boolean {
        if(this.userService.hasJurisdiction( privilegeString )){
            return true;
        }else{
            return false;
        }
    }

    /**
     * 根据权限,展示页面的响应内容
     */
    private filterDomByPrivilege() : void {
        
    }

    //获取资料内容
    getDocInfo(){
        this.dataDetailService.getDocInfo(this.id)
            .then(docInfo => {
                this.docInfo = docInfo;
                
                for (let i = 0; i < docInfo.dpds.length; i++) {
                    if (docInfo.dpds[i].dbdType == 0) { //药品
                        this.drugs.push(docInfo.dpds[i]);
                    }
                    if (docInfo.dpds[i].dbdType == 1) { //产品
                        this.products.push(docInfo.dpds[i]);
                    }
                    if (docInfo.dpds[i].dbdType == 2) { //疾病
                        this.icdCodes.push(docInfo.dpds[i]);
                    }
                }
                this.setContent(this.docInfo.content);
                this.initDataTrans();   //将原数据转换成显示和提交的字符串
            });
    }
    
    getRouteParam() {
        this.route.params.subscribe(params => {
            if (params['docType'] !== undefined) {
                this.docType = params['docType'];
            }
            if(params['id'] !== undefined) {
                this.id = params['id'];
                this.getDocInfo();
            }
        });
        this.docInfo.docType = this.docType;
    }
    /**
     * tree搜索操作
     */
    search(){
        if(this.relevanceType == -1)
            this.getSingleDataTree(this.pcode, this.treeSearchWord);
        else if(this.relevanceType == 0)
            this.searchByDrugName();
        else if(this.relevanceType == 1)
            this.searchPro();
        else if(this.relevanceType == 2)
            this.searchByDiseaseName();
    }
    /**
     * 选择资料类型
     */
    chooseDataType(){
        switch(this.docType){
            case '0':
                this.pcode = 'data_pharmacy';
                this.docTypeName = this.docTypeMap[0];
                break;
            case '1':
                this.pcode = 'data_periodical';
                this.docTypeName = this.docTypeMap[1];
                break;
            case '2':
                this.pcode = 'data_elec_doc';
                this.docTypeName = this.docTypeMap[2];
                break;
            case '3':
                this.pcode = 'data_elec_bull';
                this.docTypeName = this.docTypeMap[3];
                break;
            case '4':
                this.pcode = 'data_others';
                this.docTypeName = this.docTypeMap[4];
                break;
            default:
                break;
        }
        this.relevanceType = -1;
        this.treeSearchWord = "";
        this.getSingleDataTree(this.pcode);
    }
    getSingleDataTree(pcode:string, dictValue?: string) {
		this.dataSortService.getSingleDataTree(pcode, dictValue)
			.then(res => {
				if (res != null) {
					if(dictValue)
						this.setExpanded(res);
					this.bookTreeData = res;
				}
				else this.bookTreeData = [];
			});
	}
	getChildren(node: any): any {
		return this.dataSortService.getChildrenByNode(node.data);
	}
	dataTypeTreeOptions = {
		getChildren: this.getChildren.bind(this),
		idField:'id'
	}
    chooseType($event: any){
        this.curType = $event.node.data;
    }

    /**
     * 资料 - 添加 - 选择 - 确认：增加双击即选择时间
     */
    private dblClickRowChoose(tree: TreeComponent) : void {
        this.curType = tree.treeModel.focusedNode.data;
        this.confirm();
    }

    //设置搜索展开
    setExpanded(arr: any[]) {
		for (let i = 0; i < arr.length; i++) {
			if (arr[i].open || arr[i].isExpanded){
				this.tree.treeModel.expandedNodeIds[arr[i].id || arr[i].code] = true;
			}
				
			if (arr[i].hasChildren && arr[i].children)
				this.setExpanded(arr[i].children);
		}
	}
    /**
     * 关联疾病、药品、产品内容加载
     */
    actionMapping: IActionMapping = {
		mouse: {
			dblClick: (tree, node, $event) => {
                this.chooseNode(node.data)
			}
		}
	};
    // 数据转换方法
    initDataTrans(){
        //docInfo.drugs
        if(this.drugs && this.drugs.length > 0){
            for(let i = 0; i < this.drugs.length; i++){
                if(this.drugs[i].dbdName){
                    this.drugs[i].name = this.drugs[i].dbdName;
                }
                if(this.drugs[i].dbdId){
                    this.drugs[i].id = this.drugs[i].dbdId;
                }
            }
            this.docInfo.drugs = this.codeToStr(this.drugs, 'id');
            this.docInfo.refDrugs = this.nameToStr(this.drugs);
        }
        //docInfo.products
        if(this.products && this.products.length > 0){
            for(let i = 0; i < this.products.length; i++){
                if(this.products[i].dbdName){
                    this.products[i].name = this.products[i].dbdName;
                }
                if(this.products[i].dbdId){
                    this.products[i].id = this.products[i].dbdId;
                }
            }
            this.docInfo.products = this.codeToStr(this.products, 'id');
            this.docInfo.refProducts = this.nameToStr(this.products);
        }
        //docInfo.icdCodes
        if(this.icdCodes && this.icdCodes.length > 0){
            for(let i = 0; i < this.icdCodes.length; i++){
                if(this.icdCodes[i].dbdName){
                    this.icdCodes[i].name = this.icdCodes[i].dbdName;
                }
                if(this.icdCodes[i].dbdId){
                    this.icdCodes[i].code = this.icdCodes[i].dbdId;
                }
            }
            this.docInfo.icdCodes = this.codeToStr(this.icdCodes, 'code');
            this.docInfo.refIcdCodes = this.nameToStr(this.icdCodes);
        }

        //numberPage
        if(this.docInfo.numPage){
            this.startPage = this.docInfo.numPage.split("-")[0];
            this.endPage = this.docInfo.numPage.split("-")[1];
        }
    }
    dataTrans(){
        //docInfo.drugs
        if(this.drugs && this.drugs.length > 0){
            this.docInfo.drugs = this.codeToStr(this.drugs, 'id');
            this.docInfo.refDrugs = this.nameToStr(this.drugs);
        }
        //docInfo.products
        if(this.products && this.products.length > 0){
            for(let i = 0; i < this.products.length; i++){
                if(this.products[i].chineseproductname){
                    this.products[i].name = this.products[i].chineseproductname;
                }
            }
            this.docInfo.products = this.codeToStr(this.products, 'id');
            this.docInfo.refProducts = this.nameToStr(this.products);
        }
        //docInfo.icdCodes
        if(this.icdCodes && this.icdCodes.length > 0){
            this.docInfo.icdCodes = this.codeToStr(this.icdCodes, 'code');
            this.docInfo.refIcdCodes = this.nameToStr(this.icdCodes);
        }
    }
    //构建一个中间数据
    createCurNode(data: any){
        this.curNodes = [];
        if(data && data.length){
            for(let i = 0; i < data.length; i++){
                this.curNodes.push(data[i]);
            }
        }
    }
    codeToStr(data: any, attr: string){
        let codes: any[] = [];
        
        for(let i = 0; i < data.length; i++){
           codes.push(data[i][attr]);
        }
        
        return codes.join("|");
    }
    nameToStr(data: any){
        let names: any[] = [];
        for(let i = 0; i < data.length; i++){
            names.push(data[i].name);
        }
        return names.join("|");
    }
    // 选择药品
    chooseDrug() {
        this.relevanceType = 0;
        this.treeSearchWord = "";
        this.createCurNode(this.drugs);
        //this.curNodes = this.drugs;
        this.getDrugCategory();
        this.options = this.drugTemplateStringOptions;
    }
    getDrugChildren(node: any): any {
        return this.drugService.getChildren(node.data.id)
    }
    drugTemplateStringOptions = {
        getChildren: this.getDrugChildren.bind(this),
        actionMapping: this.actionMapping,
        idField: 'id'
    }
    getDrugCategory() {
        this.drugService.getChildren(this.DRUG_ID)
            .then(drug => {
                this.nodes = drug;
            });
    }
    searchByDrugName(){
        if(!this.treeSearchWord){
            this.getDrugCategory();
            return;
        }
        this.drugService.searchByDrugName(this.treeSearchWord)
            .then(drug => {
                if(drug)
                    this.setExpanded(drug);
                this.nodes = drug;
            })
    }


    // 选择疾病
    chooseDisease() {
        this.relevanceType = 2;
        this.treeSearchWord = "";
        this.createCurNode(this.icdCodes);
        //this.curNodes = this.icdCodes;
        this.getDiseaseCategory();
        this.options = this.diseaseTemplateStringOptions;
    }
    getDiseaseCategory() {
        this.dictionaryService.getChildrenByCode(this.DISEASE_CODE)
            .then(disease => {
                this.nodes = disease;
            });
    }
    getDiseaseChildren(node: any): any {
        return this.dictionaryService.getChildrenByNode(node.data);
    }
    diseaseTemplateStringOptions = {
        getChildren: this.getDiseaseChildren.bind(this),
        actionMapping: this.actionMapping,
        idField: 'code'
    }
    searchByDiseaseName(){
        this.dictionaryService.searchByValue(this.DISEASE_CODE, this.treeSearchWord)
            .then(disease => {
                if(disease)
                    this.setExpanded(disease);
                this.nodes = disease;
            })
    }
    
    // 选择产品
    //checkedList: any[];
    chooseProducts() {
        this.relevanceType = 1;
        this.createCurNode(this.products);
    }
    searchPro(){
        let query: string = this.producttable.url;

        for(let attr in this.productSearchQuery){
            if (this.productSearchQuery[attr]) {
				query += `&${attr}=${this.productSearchQuery[attr]}`;
			}
        }

        this.tablePlugin.loadDataByUrl(query, true);
    }
    onCheck($event: any) {
        this.curNodes = $event;
    }
    producttable: any = {
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
    //handler
    chooseNode(node: any){
        if(this.curNodes.length > 0){
            for(let i = 0; i < this.curNodes.length; i++){
                if(this.relevanceType == 2){
                    if(node.code == this.curNodes[i].code){
                        this.curNodes.splice(i, 1);
                        return;
                    }
                }else if(this.relevanceType == 0){
                    if(node.id == this.curNodes[i].id){
                        this.curNodes.splice(i, 1);
                        return;
                    }
                }
            }
        }
        this.curNodes.push(node);
    }

    /**
     * 选择资料后的确认按钮事件
     */
    private confirm() : void {
        switch(this.relevanceType){
            case -1:
                if(this.curType.type == 0){
                    this.dialogPlugin.tip('请选择一个具体的资料。');
                    return;
                }
                this.docInfo.bookId = this.curType.id;
                this.docInfo.nameBook = this.curType.name;
                break;
            case 0:
                this.drugs = this.curNodes;
                if(this.drugs.length == 0){
                    this.docInfo.drugs = "";
                    this.docInfo.refDrugs = "";
                }else{
                    this.dataTrans();
                }
                break;
            case 1:
                this.products = this.curNodes;
                
                if(this.products.length == 0){
                    this.docInfo.products = "";
                    this.docInfo.refProducts = "";
                }else{
                    this.dataTrans();
                }
                break;
            case 2:
                this.icdCodes = this.curNodes;
                if(this.icdCodes.length == 0){
                    this.docInfo.icdCodes = "";
                    this.docInfo.refIcdCodes = "";
                }else{
                    this.dataTrans();
                }
                break;
            default:
                break;
        }
        this.relevanceType = undefined;
    }
    close(){
        this.relevanceType = undefined;
    }
    /**
     * 关联科室多选下拉框
     * 考虑后期开发成组件
     */
    selecting: boolean = false;
    selectedList: string[] = this.docInfo.provenance ? this.docInfo.provenance.split('|') : [];
    
    select(opt: any){
        if(this.contains(opt)){
            this.selectedList.splice(this.selectedList.indexOf(opt), 1);
        }else{
            if(this.selectedList.length >= 2){
                this.dialogPlugin.tip('最多只能选择2个关联科室！');
                return;
            }
            this.selectedList.push(opt);
        }
        this.docInfo.provenance = this.selectedList.join('|');
    }
    contains(opt: any){
        if(!this.selectedList) return false;
        for(let i = 0; i < this.selectedList.length; i++){
            if(opt == this.selectedList[i]){
                return true;
            }
        }
        return false;
    }
    /**关联科室结束 */

    //保存 修改
    save(){
        if(this.docType == 0 || this.docType == 1){
            if(!this.docInfo.drugs && !this.docInfo.products && !this.docInfo.icdCodes){
                this.dialogPlugin.tip('必须关联一个药品、产品或者疾病。');
                return;
            }
        }
        
        //numberPage
        if(this.startPage || this.endPage){
            if(parseInt(this.startPage) > parseInt(this.endPage)){
                this.dialogPlugin.tip('请输入正确的起止页格式！');
                return;
            }
            this.docInfo.numPage = `${this.startPage}-${this.endPage}`;
        }

        this.getContent();      //获取富文本编辑器内的数据
        if(this.docInfo.id){
            this.dataDetailService.save(this.docInfo)
                .then(res => {
                    this.dialogPlugin.tip(res.message);
                    if(res.code == '200'){
                        if(this.uploadPlugin.compileData.length > 0)
                            this.uploadPlugin.uploadFiles(res.data.id);
                    }
                })
        }else{
            this.dataDetailService.newData(this.docInfo)
                .then(res => {
                    this.dialogPlugin.tip(res.message);
                    if(res.code == '200'){
                        this.docInfo.id = res.data.id;
                        if(this.uploadPlugin.compileData.length > 0)
                            this.uploadPlugin.uploadFiles(res.data.id);
                    }
                })
        }
    }
    //文件上传完成
    uploaded($event: any){
        this.goback();
    }

    //返回上一页
    goback(){
        history.back();
    }

    /*************富文本****************
    * 功能：点击获取富文本
    *      设置富文本内容
    *      获取符文本内容
    */
    UEditor: any;
    
    initUEditor(){
        // this.UEditor = UE.getEditor('ueCotent');
        this.UEditor = new UE.ui.Editor({initialFrameWidth: 100 + '%', readonly: this.readOnly});
        this.UEditor.render('ueCotent');
        this.UEditor.addListener('ready',()=>{
            this.UEditor.setHeight(350);
        });
    }

    setContent(content: string) {
        this.UEditor.addListener('ready',()=>{
            this.UEditor.setContent(content.replace(/\"\/api/g, "\"http://" + window.location.host + "/api"));
        });
     }

    getContent(){
        this.docInfo.content = this.UEditor.getContent().replace("\"http://" + window.location.host + "/api", "\"/api");
    }

    @ViewChild(DialogProdlistComponent) dpc: DialogProdlistComponent;
    fnDialogProdListShow(){
        this.dpc.show();
    }

    fnDialogProdListClose(){
        this.dpc.fnClose();
    }
    
    fnDialogProdListConfirm($event: any[]){
        this.products = $event;
        let names: any[] = [];
        for(let prod of this.products){
            names.push(prod.chineseproductname);
        }
        this.docInfo.refProducts = names.join("|");
    }
}

