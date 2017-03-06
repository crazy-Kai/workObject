import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Http } from '@angular/http';

@Component({
	selector: 'zone-component',
	templateUrl: './zone.component.html',
	styleUrls: [ '../../popup-add.css' ]
})

export class ZoneComponent implements OnInit{
	private api: string = '/api/v1/zoneList';
	private zoneKeyword: string;
	private zoneList: any[];

    @Input() deptList : any[];
    @Output() zoneClick = new EventEmitter();

	constructor(private http: Http){}

	ngOnInit(){
		this.getZoneList();
	}

	getZoneList(){
		this.http.get(this.api + '?keyword=' + encodeURIComponent(this.zoneKeyword || '') )
            .toPromise()
            .then(response => {
                this.zoneList = this.extractData(response);
            })
            .catch(this.handleError);
	}

    keydown($event){
        if($event.keyCode == 13){
            this.getZoneList();
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
            _this.deptList.forEach(function(_zone){
                if(_zone.zoneId == item.id){
                    item.checked = true;
                }
            });
        });
        return body.data || {};
    }

	private handleError(error: any) {
        console.error('An error occurred', error);
        return Promise.reject(error.message || error);
    }

    private fnZoneClick($event,zone){
        if($event.target.checked){
            this.deptList.push({
                zoneId: zone.id,
                zoneName: zone.name,
                idNamePairs: {}
            });
        }else{
            for(var i=0,len=this.deptList.length; i<len; i++){
                if(this.deptList[i].zoneId == zone.id){
                    this.deptList.splice(i,1);
                }
            }
        }
        
        this.zoneClick.emit(this.deptList);
    }
}
