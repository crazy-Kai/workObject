import { Component, OnInit, Input, Output, EventEmitter, OnChanges } from '@angular/core';

import { DrugService } from '../../data_management/patient_guide/drug_tree.service';

import { UserService } from '../../user.service';

@Component({
    selector: 'add_drug',
    template: require('./add_drug.component.html')
})
export class AddDrugComponent implements OnInit, OnChanges {
    
    @Input() drugGroup: any;
    @Input() options: any;
    drugCheckedArr: any[] = [];
    error: any;
    title = "知识管理平台";
    
    @Output() onClose: EventEmitter<any> = new EventEmitter();
    @Output() getCheckedNodes: EventEmitter<any> = new EventEmitter();
    // @Output() getChildren : EventEmitter<any> = new EventEmitter();

    constructor(private drugService: DrugService,
        private userService: UserService) {
    }

    ngOnInit() {
    }

    ngOnChanges(changes: any) {
        if(changes){
            this.options = changes.options && changes.options.currentValue;
        }
        if (this.options && this.options.title) this.title = this.options.title;
    }

    close() {
        this.onClose.emit(null);
    }

    getCheckedNodeList(nodes: any[]) {
        for (let index = 0; index < nodes.length; index++) {
            if (nodes[index].checked) {
                this.drugCheckedArr.push(nodes[index]);
            }
            if (!this.isEmptyObject(nodes[index].children)) {
                this.getCheckedNodeList(nodes[index].children);
            }
        }
    }

    //剔除非底层node
    filterNodes(nodes: any[]){
        let pcodeArr: any[] = [];

        nodes.forEach(element => {
            if(element.pcode){
                pcodeArr.push(element.pcode)
            }
        });
        
        nodes.forEach((element, index) => {
            element.ignore = false;
            for(let i = 0; i < pcodeArr.length; i++){
                if(element.code == pcodeArr[i]){
                    element.ignore = true;
                }
            }
        })
        
    }

    isEmptyObject(obj: any): boolean {
        for (var name in obj) {
            return false;
        }
        return true;
    }
    save() {
        this.close();
        this.drugCheckedArr = [];
        this.getCheckedNodeList(this.drugGroup);
        this.filterNodes(this.drugCheckedArr);
        this.getCheckedNodes.emit(this.drugCheckedArr);
    }

    //获取符合条件的node,返回第一个符合的
    getNodeByParams(paramName: string, paramValue: any): any {
        return this.getCheckedNode(this.drugGroup, paramName, paramValue);
    }

    private getCheckedNode(arr: any[], paramName: string, paramValue: any): any {
        for (let i = 0; i < arr.length; i++) {
            if (arr[i][paramName] == paramValue) {
                return arr[i];
            }
            if (!this.isEmptyObject(arr[i].children)) {
                return this.getCheckedNode(arr[i].children, paramName, paramValue);
            }
        }
        return false;
    }

    changeChecked(Treenode: any, $event: any) {
        let node = Treenode.data;
        node.checked = !node.checked;
        //this.recursionChildrenChecked(node);
        //this.recursionParentChecked(Treenode);
        if (this.options.isHalfCheckLink == false) {
            if (!node.checked && Treenode.parent) {
                //如果是取选
                this.recuresionParentIsAllChecked(Treenode.parent);
            }
        }
        $event.stopPropagation();
    }

    //递归children，使其全选或全不选
    recursionChildrenChecked(node: any) {
        if (!this.isEmptyObject(node.children)) {
            for (let i = 0; i < node.children.length; i++) {
                node.children[i].checked = node.checked;
                this.recursionChildrenChecked(node.children[i]);
            }
        }
    }

    recuresionParentIsAllChecked(Treenode: any) {
        let node = Treenode.data;
        for (let i = 0; i < node.children.length; i++) {
            if(node.children[i].checked)
                return;
        }
        node.checked = false;
        if(Treenode.parent) this.recuresionParentIsAllChecked(Treenode.parent);
    }

    //递归遍历parent
    recursionParentChecked(Treenode: any) {
        if (Treenode.parent) {
            if (Treenode.data.checked) {
                Treenode.parent.data.checked = true;
                this.recursionParentChecked(Treenode.parent);
            }
        }
    }
    // //递归遍历parent 子不选时修改父-样式
    // recursionParentHalfChecked(Treenode: any) {
    //     if (Treenode.parent) {
    //         if (!Treenode.data.checked) {
    //             // Treenode.parent.data.checked = false;  
    //             this.recursionParentChecked(Treenode.parent);
    //         }
    //     }
    // }

    //递归children，全不选时，父级处于半选中状态(返回true)
    recursionChildrenHalfChecked(node: any): boolean {
        //console.log(node)
        if (!this.isEmptyObject(node.children)) {
            let flag : Boolean  = node.children[0].checked == undefined ? false : node.children[0].checked;
            for (let i = 0; i < node.children.length; i++) {
                if (flag != (node.children[i].checked == undefined ? false : node.children[i].checked)) {
                    return true;//有一个子不是选中状态，则显示半选中状态样式
                }
                if (this.recursionChildrenHalfChecked(node.children[i]))
                    return true;
            }
        }
        return false;
    }

    //递归children，全不选时，父级处于未选中状态(返回false)，全选时处于全选中状态（返回false）
    linkRecursionChildrenHalfChecked(node: any): boolean {
        if (!this.isEmptyObject(node.children)) {
            let flag : Boolean  = node.children[0].checked;
            for (let i = 0; i < node.children.length; i++) {
                if (flag != node.children[i].checked) {
                    return true;//有一个子不是选中状态，则显示半选中状态样式
                }
                if (this.recursionChildrenHalfChecked(node.children[i]))
                    return true;
            }
        }
        return false;

    }

    isChecked(Treenode: any): boolean {
        let node = Treenode.data;
        return node.checked;
    }

    isHalfChecked(Treenode: any) {
        // if (this.options.isHalfCheckLink == false)
        //     return this.linkRecursionChildrenHalfChecked(Treenode.data);
        // else
            return this.recursionChildrenHalfChecked(Treenode.data);
    }

}