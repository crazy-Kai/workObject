import { Component, Input, Output, ViewChild, EventEmitter, OnChanges } from '@angular/core';
import { TreeModule, TreeNode, TreeComponent } from 'angular2-tree-component';
import { Http, Response, Headers, RequestOptions } from '@angular/http';
import { InterceptorService } from 'ng2-interceptors';

export class Options {
    
}

@Component({
    selector: 'drug-category-tree',
    template: `
        <Tree #tree [nodes]="drugNodes" [options]="options" (onActivate)="activate($event)"></Tree>
    `
    // styles: []
})
export class DrugCategoryTree implements OnChanges {

    @ViewChild('tree')
	private tree: TreeComponent;
    ngAfterViewInit() {
        console.log("find tree");
        console.log(this.tree);
    }

    @Input() nodes: any;
    @Input() options: any;
    @Input() keyword: String;
    @Output() onActivate: EventEmitter<any> = new EventEmitter();

    defaultOptions = new Options();
	drugNodes: any[] = [];
    drugCategoryUrl = '/api/v1/drugTree';
    

    constructor(private http: InterceptorService) { }
    
    ngOnInit() {
        this.options = {
            getChildren: this.getChildren.bind(this),
            idField:'id'
        }

		this.getDrugCategory().then(drugNodes => {
            this.drugNodes = drugNodes;
        });
	}

    private activate($event: any) {
		var id = $event.node.data.id;
		var name = $event.node.data.name;
        this.onActivate.emit($event);
	}

    private getDrugCategory(): Promise<any[]> {
        return this.http.get(this.drugCategoryUrl)
            .toPromise()
            .then(this.extractData)
            .catch(this.handleError);
    };
    private getChildren(node: any): any {
		let tempUrl = this.drugCategoryUrl + "?drugId=" + node.data.id;
        return this.http.get(tempUrl)
            .toPromise()
            .then(this.extractData)
            .catch(this.handleError);
	}
    private searchByDrugName(drugName: string): any {
        let tempUrl = this.drugCategoryUrl + '/' + drugName + "?notClearChildren=true&root=001";
        return this.http.get(tempUrl)
            .toPromise()
            .then(this.extractData)
            .then(drugNodes => {
                this.setExpanded(drugNodes);
                this.drugNodes = drugNodes;
            })
            .catch(this.handleError);
    }
    private extractData(res: Response) {
        if (res.status < 200 || res.status >= 300) {
            throw new Error('Bad response status: ' + res.status);
        }
        let body = res.json();
        return body.data || {};
    }
    private handleError(error: any) {
        console.error('An error occurred', error);
        return Promise.reject(error.message || error);
    }

    ngOnChanges(changes : any) {
        if(changes.keyword.currentValue)
            this.searchByDrugName(changes.keyword.currentValue);
        else {
            this.getDrugCategory().then(drugNodes => {
                this.drugNodes = drugNodes;
            });
        }

    }

    setExpanded(arr: any[]) {
		for (let i = 0; i < arr.length; i++) {
			if (arr[i].open){
				this.tree.treeModel.expandedNodeIds[arr[i].id] = true;
			}
				
			if (arr[i].hasChildren && arr[i].children)
				this.setExpanded(arr[i].children);
		}
	}
}