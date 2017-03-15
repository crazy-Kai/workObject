import { Component, OnInit, Input, Output, EventEmitter, OnChanges, ViewChild, ViewChildren, QueryList, HostListener } from '@angular/core';
import { PathLocationStrategy } from '@angular/common';
import { TablePlugin } from '../../common/ug-table/table.module';
import { SpecificationService } from "./specification.service";
import { ActivatedRoute } from '@angular/router';
import { Router } from '@angular/router';
import { DialogPlugin, DialogModel } from '../../common/ug-dialog/dialog';
import { UploadPlugin } from '../../common/ug-upload/upload.plugin';

import { ProductDto } from '../../drug_management/drug_data/product_detail';
import { Observable } from 'rxjs/Observable';
import { UserService } from '../../user.service';
declare var UE: any;

class Spec {                        //规格对象
    drugspac: string;
    productid: string;
    productspac: string;
    operator: number;        //1. add 2. modify 3. delete
}
class MapedProduct {
    genericName: string;            //通用名
    tradeName: string;              //药品名
    producer: string;               //厂家
    drugForm: string;               //剂型
    pinyin: string;
}
class InstructionDto {
    id: string;                     //说明书id
    genericName: string;            //通用名
    tradeName: string;              //药品名
    producer: string;               //厂家
    drugForm: string;               //剂型
    pinyin: string;
    drugSpec: string;                //原规格
    approveDate: string;
    isAudit: boolean;
    auditedBy: string;
    auditedName: string;
    summaryAutoflag: number = 0;
    summary: string;                //摘要
    contents: string;           //说明书
    oriInstructions: any;           //说明书原件
    /**
     * 映射产品的基本信息
     */
    product: MapedProduct = new MapedProduct();
    /**
     * 映射的产品规格列表
     */
    spacList: Spec[] = [];          //映射产品规格    
}
class ExamineObj {
    id: string;
    auditedBy: string;
    isAudit: any;
}
@Component({
    selector: 'specification-edit',
    template: require('./specification_edit.component.html'),
    styles: [require('./content_management.component.css') + "",],
    providers: [
        SpecificationService,
        PathLocationStrategy
    ]
})
export class SpecificationEditComponent implements OnInit {
    @Input() instructionId: string;
    @Input() curHandleType: string;
    @Output() editComplete: EventEmitter<any> = new EventEmitter();
    @ViewChild(DialogPlugin) dialogPlugin: DialogPlugin;
    @ViewChildren(TablePlugin) tablePlugins: QueryList<TablePlugin>;
    @ViewChild(UploadPlugin) uploadPlugin: UploadPlugin;
    constructor(
        private specificationService: SpecificationService,
        private route: ActivatedRoute,
        private router: Router,
        private userService: UserService,
        private pathLocationStrategy: PathLocationStrategy
    ) { }

    //instructionId: string;                                      //说明书id
    instructionDto: InstructionDto = new InstructionDto();      //初始化一个说明书对象
    isAdd: boolean;                                             //是否添加
    isAudited: boolean = false;                                 //是否已审核
    auditing: boolean;                                          //是否是审核操作
    invalidTime: boolean;
    //curHandleType: string;                                      //操作类型
    //handleStr: string;                                          //操作字符创
    modifyTime: any;
    uploadType: string = "instruction";
    typeId: string;
    maxDateSetting: any;                                        //日期控件最大时间
    isSubjective: boolean;
    /**
     * 查询产品相关 
     */
    isShowProductList: boolean;                                 //是否展示查询的产品列表
    productName: string;
    producer: string;
    choosedPro: any;                                            //选中的药品
    /**
     * 添加删除规格相关 
     */
    isShowSpecList: boolean;
    tempSpecList: any = [];
    specList: Spec[] = [];

    /**
     * 审核人联想框相关
     */
    auditByModel: any; //指定审核人下拉联想框绑定值
    auditPermissionOwnerList: any[]; //有权限审核的人员列表
    searchAuditBy = (text$: Observable<string>) =>
        text$.debounceTime(200).distinctUntilChanged()
            .map(term => term.length < 1 ? []
                : this.auditPermissionOwnerList.filter(v => new RegExp(term, 'gi').test(v.realname)).splice(0, 10));
    searchAuditByFormatter = (x: any) => x['realname'];

    ngOnInit() {
        //this.getRouteParam();
        this.typeId = this.instructionId;
        this.getInstruction();
        this.maxDateSetting = { year: new Date().getFullYear(), month: new Date().getMonth() + 1, day: new Date().getDate() };        //设定药品核准时间的最大值为今天
        this.userService.getAuditPermissionOwnerList("perms[auditInstruction:put]").then(rs => {
            this.auditPermissionOwnerList = rs['users'];
        });
        //this.pathLocationStrategy.onPopState();
    }


    // turnToInstructionListPage() {
    //     let link = ['data_management/content_management/specification_management'];
    //     this.router.navigate(link);
    // }
    //修改  审核 
    saveInstruction() {
        let data = this.instructionDto;
        this.isSubjective = true;
        if (this.matchEditedUser(this.auditByModel)) {
            this.objToDate(this.modifyTime);        //转换成上传的格式的时间
            this.getContent();                      //从富文本框中取得内容

            this.specificationService.saveInstruction(data, this.curHandleType).then(
                response => {
                    if (response.code != 200) {
                        this.dialogPlugin.tip(response.message);
                        return;
                    }
                    if (this.curHandleType == "examine") {
                        let data = new ExamineObj();
                        data.id = response.data.id;
                        data.auditedBy = response.data.auditedBy;
                        data.isAudit = response.data.isAudit;

                        this.specificationService.examineInstruction(data).then(
                            res => {
                                if (res.code != 200) {
                                    this.dialogPlugin.tip(res.message);
                                    return;
                                } else {
                                    this.dialogPlugin.tip("审核成功！");
                                    setTimeout(() => {
                                        this.editComplete.emit("done");
                                        this.pathLocationStrategy.back();
                                    }, 2000);
                                }
                            }
                        )
                    } else {
                        this.uploadPlugin.uploadFiles(response.data.id);
                    }
                }
            )
        }
    }
    cancel() {
        let message: string;
        this.isSubjective = true;
        if (this.curHandleType == "modify") {
            message = "确认要放弃修改并退出吗？";
        } else if (this.curHandleType == "examine") {
            message = "确认要放弃审核并退出吗？";
        } else if (this.curHandleType == "add") {
            message = "确认要放弃编辑并推出吗？";
        }

        this.dialogPlugin.confirm(message, () => {
            this.editComplete.emit("cancel");
            this.pathLocationStrategy.back();
        }, () => { this.isSubjective = false });
    }

    uploaded($event: string) {
        if ($event == "complete") {
            this.editComplete.emit("done");
        }
    }

    getInstruction() {
        if (this.instructionId) {
            this.specificationService.getInstruction(this.instructionId)
                .then(res => {
                    console.log(res)
                    this.instructionDto = res;
                    this.isAudited = res.isAudit == 1 ? false : true;

                    this.instructionDto.product.genericName = res.product.chineseproductname;
                    this.instructionDto.product.tradeName = res.product.goodsname;
                    this.instructionDto.product.producer = res.product.chinesemanufacturename;
                    this.instructionDto.product.drugForm = res.product.formulation;
                    this.instructionDto.product.pinyin = res.product.pinyin;

                    this.auditByModel = { "id": this.instructionDto.auditedBy, "realname": this.instructionDto.auditedName };
                    if (res.approveDate) {
                        this.dateToObj(res.approveDate);
                    }
                    this.specList = res.spacList;
                    this.setContent(res.contents);

                    //
                    this.initTempSpecList(res.spacList);
                });
        } else {
            this.setContent("");
            console.log("instructionId为空");
        }
    }
    //初始化临时的规格列表
    initTempSpecList(resSpec: any) {
        this.tempSpecList = [];
        if (resSpec.length <= 0) return;
        for (let i = 0; i < resSpec.length; i++) {
            this.tempSpecList.push(resSpec[i]);
        }
    }

    setAuditBY(auditByModel: any) {      //好像废弃了。
        this.instructionDto.auditedBy = typeof (auditByModel) === "string" ? auditByModel : auditByModel.realname;
    }
    //匹配输入姓名是否在审核人列表中
    matchEditedUser(auditByModel: any) {
        this.instructionDto.auditedBy = ""
        if (auditByModel == "" || auditByModel == undefined) {
            this.dialogPlugin.tip("审核人不能为空！");
            return false;
        }

        if (typeof (auditByModel) != "string") {
            this.instructionDto.auditedBy = this.auditByModel.id;
            return true;
        };

        for (let i = 0; i < this.auditPermissionOwnerList.length; i++) {
            if (auditByModel == this.auditPermissionOwnerList[i].realname) {
                this.instructionDto.auditedBy = this.auditPermissionOwnerList[i].id;
                return true;
            }
        }
        this.dialogPlugin.tip("您输入的人不在审核人列表中！");
        return false;
    }
    /**
     * 修改的时候通过url 获取说明书id
     */
    // getRouteParam() {
    //     this.route.params.subscribe(params => {
    //         if ((params['id'] !== undefined)) {
    //             this.instructionId = params['id'];

    //             this.curHandleType = params['dataType'];
    //             this.auditing = this.curHandleType == "examine" ? true : false;

    //             this.curHandleType = this.auditing == true ? "审核" : "修改";

    //             this.getInstruction();

    //         }else{
    //             this.curHandleType = "添加";
    //             this.isAdd = true;
    //             this.setContent("");
    //         }
    //     });
    // }
    /**
     * 查询产品
     * @paramsForSearch productName || producer
     * @paramsForEdit choosedPro
     */

    //根据原产品的名称和厂商（参数可选）自动搜索显示药品列表
    getProductList() {
        this.isShowProductList = true;
        this.productName = this.instructionDto.genericName;
        this.producer = this.instructionDto.producer;
        this.choosedPro = null;
        this.search();
    }
    //手动搜索药品列表
    search() {
        let searchUrl: string = this.productTable.url;
        if (this.productName)
            searchUrl += '&productName=' + this.productName;

        if (this.producer)
            searchUrl += '&producerName=' + this.producer;

        this.tablePlugins.first.loadDataByUrl(searchUrl);
    }
    keyupHandle() {
        this.search();
    }
    //选中并载入药品
    chooseProduct($event: any) {
        this.choosedPro = $event;
    }

    //双击选择药品,并自动完成产品映射
    dblChooseProduct($event: any, online?: boolean) {
        //console.log("产品映射双击事件被激活:"); console.dir($event);
        this.chooseProduct($event);

        //追加点击确认事件,自动完成产品映射
        this.saveProductName();
    }

    saveProductName() {
        if (!this.choosedPro) {
            this.isShowProductList = false;
            return;
        }
        this.specificationService.checkProduct(this.choosedPro.id, this.instructionId).then(
            result => {
                if (result.code != "200") {
                    this.dialogPlugin.tip(result.message);
                } else {
                    this.instructionDto.product.genericName = this.choosedPro.chineseproductname;
                    this.instructionDto.product.tradeName = this.choosedPro.goodsname;
                    this.instructionDto.product.producer = this.choosedPro.chinesemanufacturename;
                    this.instructionDto.product.drugForm = this.choosedPro.formulation;
                    this.instructionDto.product.pinyin = this.choosedPro.pinyin;

                    this.specList = [];
                    let curSpec = new Spec();
                    curSpec.drugspac = this.choosedPro.chinesespecification;
                    curSpec.productid = this.choosedPro.id;
                    curSpec.productspac = this.choosedPro.chinesespecification;
                    curSpec.operator = 0;

                    this.specList.push(curSpec);
                    this.instructionDto.spacList = this.specList;

                    this.initTempSpecList(this.specList);

                    this.isShowProductList = false;
                }
            },
            error => {
                console.dirxml(error);
            }
        )

    }
    //关闭
    closeDialog() {
        this.isShowProductList = false;
    }
    /**
     * 添加删除规格
     */

    addDrugSpec() {
        if (this.instructionDto.product.genericName) {
            this.tablePlugins.last.loadDataByUrl("/api/v1/productList?numPerPage=50&pageNum=1&productName=" + this.instructionDto.product.genericName + "&producerName=" + this.instructionDto.product.producer);
        }

        this.isShowSpecList = true;
    }
    removeDrugSpec(spec: any) {
        if (this.specList.length == 1) {
            this.dialogPlugin.confirm("将要解除说明书和产品的映射关系，请确认", () => {
                this.removeDrugSpecLogic(spec);
            }, () => { return false; });
        } else {
            this.removeDrugSpecLogic(spec);
        }

    }
    removeDrugSpecLogic(spec: any) {
        for (let i = 0; i < this.specList.length; i++) {
            if (spec == this.specList[i]) {
                this.specList.splice(i, 1);
            }
        }
        for (let i = 0; i < this.tempSpecList.length; i++) {
            if (spec.productid == this.tempSpecList[i].id) {
                this.tempSpecList.splice(i, 1);
            }
        }
        this.instructionDto.spacList = this.specList;

        if (this.instructionDto.spacList.length == 0) {
            this.instructionDto.product = new InstructionDto();
        }
    }

    chooseSpec(trow: any) {
        for (let i = 0; i < this.tempSpecList.length; i++) {
            if (trow.id == this.tempSpecList[i].id || trow.id == this.tempSpecList[i].productid) {
                this.tempSpecList.splice(i, 1);
                return;
            }
        }
        this.tempSpecList.push(trow);
    }

    checkSpecChoosen() {
        let specLen: number = 0;
        for (let i = 0; i < this.tempSpecList.length; i++) {
            if (this.tempSpecList[i].operator != 0) {
                this.specificationService.checkProduct(this.tempSpecList[i].id, this.instructionId)
                    .then(res => {
                        if (res.code != 200) {
                            this.dialogPlugin.tip(res.message);
                            return false;
                        }
                        specLen++;
                        if (specLen == this.tempSpecList.length) {
                            this.saveSpecList();
                        }
                    })
            } else {
                specLen++;
                if (specLen == this.tempSpecList.length) {
                    this.saveSpecList();
                }
            }
        }
    }

    saveSpecList() {
        this.specList = [];
        console.log(this.tempSpecList)
        for (let i = 0; i < this.tempSpecList.length; i++) {
            if (this.tempSpecList[i].operator == 0) {
                this.specList.push(this.tempSpecList[i]);
                continue;
            }
            let curSpec = new Spec();

            curSpec.drugspac = this.tempSpecList[i].chinesespecification;
            curSpec.productid = this.tempSpecList[i].id;
            curSpec.productspac = this.tempSpecList[i].chinesespecification;
            curSpec.operator = 1;

            this.specList.push(curSpec);
        }

        this.instructionDto.spacList = this.specList;
        if (this.instructionDto.spacList.length == 0) {
            this.instructionDto.product = new InstructionDto();
        }
        this.closeDrugSearch();
    }

    closeDrugSearch() {
        this.isShowSpecList = false;
    }
    isChoosed(trow: any) {
        for (let i = 0; i < this.tempSpecList.length; i++) {
            if (trow.id == this.tempSpecList[i].id || trow.id == this.tempSpecList[i].productid) {
                return true;
            }
        }
    }
    /**
     * 摘要
     */
    sumType(Summary: any) {
        this.instructionDto.summaryAutoflag = Summary.checked ? 1 : 0;
    }


    productTable: any = {
        title: [
            {
                name: '序号',
                type: 'index'
            },
            {
                id: 'chineseproductname',
                name: '通用名称'
            },
            {
                id: 'goodsname',
                name: '商品名称'
            },
            {
                id: 'chinesemanufacturename',
                name: '生产厂家'
            },
            {
                id: 'chinesespecification',
                name: '规格'
            }, {
                id: 'formulation',
                name: '剂型'
            }, {
                id: 'status',
                name: '状态',
                type: 'object',
                object: {
                    1: '禁用',
                    default: '启用'
                }
            }],
        needIdx: true,
        disInput: true,
        pageSize: 20,
        url: "/api/v1/productList?numPerPage={pageSize}&pageNum={currentPage}",
        dataListPath: "recordList",
        itemCountPath: "recordCount"
    };

    specTable: any = {
        title: [
            {
                id: 'chineseproductname',
                name: '通用名称'
            },
            {
                id: 'goodsname',
                name: '商品名称'
            },
            {
                id: 'chinesemanufacturename',
                name: '生产厂家'
            },
            {
                id: 'chinesespecification',
                name: '规格'
            }, {
                id: 'formulation',
                name: '剂型'
            }],
        needIdx: true,
        disInput: true,
        pageSize: 20,
        url: "/api/v1/productList?numPerPage={pageSize}&pageNum={currentPage}",
        dataListPath: "recordList",
        itemCountPath: "recordCount"
    };
    //时间控件与时间对象的相互转换
    dateToObj(date: any) {
        let fullDate = new Date(date);

        this.modifyTime = {}
        this.modifyTime.year = fullDate.getFullYear();
        this.modifyTime.month = fullDate.getMonth() + 1;
        this.modifyTime.day = fullDate.getDate();
    }

    objToDate(modifyTime: any) {
        if (this.modifyTime) {
            let dateStr = this.modifyTime.year + '/' + this.modifyTime.month + '/' + this.modifyTime.day;
            let date = new Date(dateStr);
            this.instructionDto.approveDate = date.getTime().toString();
        }
    }
    //检查时间类型是否合法
    checkDateForm() {
        if (!this.modifyTime) return;

        let dateStr = this.modifyTime.year + '/' + this.modifyTime.month + '/' + this.modifyTime.day;

        let timestamp = Date.parse(dateStr);

        if (isNaN(timestamp) == true) {
            this.dialogPlugin.tip('请输入正确的时间！');
            this.invalidTime = true;
        } else {
            this.invalidTime = false;
        }
    }

    /*************富文本****************
    * 功能：点击获取富文本
    *      设置富文本内容
    *      获取符文本内容
    */
    UEditor: any;
    private setEditorContent(content: string) {
        this.UEditor.setContent(content.replace(/\"\/api/g, "\"http://" + window.location.host + "/api"));
    }
    setContent(content: string) {
        if (this.UEditor) {
            this.setEditorContent(content);
        } else {
            this.UEditor = new UE.ui.Editor({ initialFrameWidth: 100 + '%' });
            this.UEditor.render('ueInstructions');

            this.UEditor.addListener('ready', () => {
                this.UEditor.setHeight(400);
                this.setEditorContent(content);
            });
        }
    }
    getContent() {
        this.instructionDto.contents = this.UEditor.getContent().replace("\"http://" + window.location.host + "/api", "\"/api");
    }
    /*************路由守卫*********
     * 功能：关闭守卫以及跳转守卫
     */
    @HostListener('window:beforeunload', ['$event'])
    onBeforeClose($event: any) {
        return false;
        // return this.dialogPlugin.confirm("确认要离开吗？",()=>{},()=>{});
    }

    @HostListener('window:hashchange', ['$event'])
    onhashchange($event: any) {
        // this.dialogPlugin.confirm("确认要离开吗？",()=>{},()=>{});
        return false;
    }

    canDeactivate(): Observable<boolean> | boolean {
        if (this.isSubjective) {
            return true;
        }
        return this.dialogPlugin.confirmWin("确认放弃保存并离开吗？");
    }
    /************end 路由守卫********* */
}