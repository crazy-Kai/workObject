import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import { Headers, RequestOptions } from '@angular/http';
import { InterceptorService } from 'ng2-interceptors';

@Injectable()
export class DrugRuleTreeService {

    constructor(
        private http: InterceptorService) { }

    drugRuleTreeUrl = '/api/v1/drugRuleTree';  // URL to web API
    childDrugUrl = '/api/v1/childRuleList';

    getDrugRuleTree(arg1?: any, arg2?: any): Promise<any> {
        return this.http.get(this.drugRuleTreeUrl)
            .toPromise()
            .then(res=>{
                if (res.status < 200 || res.status >= 300) {
                    throw new Error('Bad response status: ' + res.status);
                }
                let body = res.json();
                body.data = this.setExpanded(body.data);
                console.log(body.data);
                return body.data;
            })
            .catch(this.handleError);
    };

    searchRuleTree(name: string, status: string) {
        let tempUrl = this.drugRuleTreeUrl + '?name=' + name + '&status=' + status;
        return this.http.get(tempUrl)
            .toPromise()
            .then(res => {
                if (res.status < 200 || res.status >= 300) {
                    throw new Error('Bad response status: ' + res.status);
                }
                let body = res.json();
                body.data = this.setExpanded(body.data);
                console.log(body.data);
                return body.data;
            })
            .catch(this.handleError);
    }

    setExpanded(arr: any[]):any[] {
        for (let i = 0; i < arr.length; i++) {
            arr[i].uuid = uuid();
            if (arr[i].children && arr[i].children.length != 0)
                arr[i].children = this.setExpanded(arr[i].children);
        }
        return arr;
    }

    getChildrenByCode(code: string): Promise<any> {
        let tempUrl = this.childDrugUrl + '?code=' + code;
        return this.http.get(tempUrl)
            .toPromise()
            .then(this.extractData)
            .catch(this.handleError);
    }

    private extractData(res: Response) {
        if (res.status < 200 || res.status >= 300) {
            throw new Error('Bad response status: ' + res.status);
        }
        let body = res.json();
        return body.data;
    }

    private handleError(error: any) {
        console.error('An error occurred', error);
        return Promise.reject(error.message || error);
    }

    isEmptyObject(obj: any) {
        if (obj == null)
            return true;
        for (var name in obj) {
            return false;
        }
        return true;
    }
}

var i = 0;
function uuid() {
    i = i + 1;
    return i;
}