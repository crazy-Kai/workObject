import { Component, OnInit, Input, Output, ViewChild, EventEmitter } from '@angular/core';
import { TreeModule, TreeNode, TreeComponent } from 'angular2-tree-component';
import { Http } from '@angular/http';

@Component({
	selector: 'dept-component',
	templateUrl: './dept.component.html',
	styleUrls: [ './dept.component.css', '../../popup-add.css']
})

export class DeptComponent implements OnInit{
	private api: Object = {
        'getDataList': '/api/v1/deptTree',
        'getChildNodes': '/api/v1/childrenDept'
    };
	private deptKeyword: string = '';
	private dataList: any[];
    private options: any = {};

    @ViewChild('tree')
    private tree: TreeComponent;

	@Input() zone: Object = {};
    @Input() deptList: any[];
    @Input() type: any;
    @Output() deptNodeClick = new EventEmitter();

	constructor(private http: Http){}

	ngOnInit(){
        if(!this.dataList || !this.deptList.length){
            this.getDataList();
        }

        this.options.getChildren = this.getChildren.bind(this);
	}

	getDataList(){
        this.clearExpandNode();
		this.http.get(this.api['getDataList'] + '?keyword=' + encodeURIComponent(this.deptKeyword || '') +'&type=' + (this.type || ''))
            .toPromise()
            .then(response => {
                this.dataList = this.extractData(response);
            })
            .catch(this.handleError);
        
        // this.http.get(this.api + '?zoneId=' + ((this.zone&&this.zone['id']) || '') + '?keyWord=' + encodeURIComponent(this.deptKeyword || '') )
        //     .toPromise()
        //     .then(response => {
        //         this.deptList = this.extractData(response);
        //     })
        //     .catch(this.handleError);
	}

    keydown($event){
        if($event.keyCode == 13){
            this.getDataList();
        }
    }

    private clearExpandNode(){
        for(let prop in this.tree.treeModel.expandedNodeIds){
            if(this.tree.treeModel.expandedNodeIds.hasOwnProperty(prop)){
                delete this.tree.treeModel.expandedNodeIds[prop];
            }
        }
    }

    setExpanded(arr: any[]) {
        for (let i = 0; i < arr.length; i++) {
            if (arr[i].open && arr[i].hasChild){
                this.tree.treeModel.expandedNodeIds[arr[i].id] = true;
            }
            if (arr[i].hasChild && arr[i].children)
                this.setExpanded(arr[i].children);
        }
    }

    private getChildren(node: any){
        let tempUrl = this.api['getChildNodes'] + "?parentId=" + node.data.id;
        return this.http.get(tempUrl)
            .toPromise()
            .then(response => {
                let result = this.extractData(response);
                return result;
            })
            .catch(this.handleError);
    }

    private nodeCBoxClick(node){
        this.setNodeChecked(node);

        this.deptNodeClick.emit(this.deptList);
    }

    setNodeChecked(node){
        node.checked = !node.checked;
        // if(node.checked){
        //     this.activeDept.push(node);
        // }else{
        //     for(let i=0,len=this.activeDept.length; i<len; i++){
        //         if(this.activeDept[i].id == node.id){
        //             this.activeDept.splice(i,1);
        //         }
        //     }
        // }
        if(node.checked){
            this.deptList.forEach((_zone)=>{
                if(_zone.id == this.zone['id']){
                    _zone.idNamePairs[node.id] = node.name;
                }
            });
        }else{
            this.deptList.forEach((_zone)=>{
                if(_zone.id == this.zone['id']){
                    delete _zone.idNamePairs[node.id];
                }
            });
        }
        if(node.children){
            for(let child of node.children){
                this.setNodeChecked(child);
            } 
        }
    }

	private extractData(res: any) {
        if (res.status < 200 || res.status >= 300) {
            throw new Error('Bad response status: ' + res.status);
        }
        let body = res.json(),
            _this = this;
        //后端返回的是hasChild,需要hasChildren字段
        body.data.forEach(function(item){
            item.hasChildren = item.hasChild;

            _this.deptList.forEach((_zone)=>{
                if(_zone.idNamePairs){
                    for(let prop in _zone.idNamePairs){
                        if(prop == item.id){
                            item.checked = true;
                        }
                    }
                }
            });
        });
        return body.data || {};
    }

	private handleError(error: any) {
        console.error('An error occurred', error);
        return Promise.reject(error.message || error);
    }
}
