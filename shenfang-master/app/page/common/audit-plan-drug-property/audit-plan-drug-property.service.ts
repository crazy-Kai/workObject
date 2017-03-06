import { Injectable } from '@angular/core';
import { Headers, Http } from '@angular/http';

import 'rxjs/add/operator/toPromise';

import { AuditPlanDrugProperty } from './audit-plan-drug-property';

@Injectable()
export class AuditPlanDrugPropertyService {
    private headers = new Headers({'Content-Type': 'application/json'});
    private drugPropertyUrl = '/api/v1/drugPropertyList';

    constructor(private http: Http) { }

    getDrugPropertyList(): Promise<AuditPlanDrugProperty[]>{
        return this.http.get(this.drugPropertyUrl, {headers: this.headers})
                   .toPromise()
                   .then(response => response && response.json().code == 200 ? response.json().data as AuditPlanDrugProperty : [])
                   .catch(this.handleError);
    }
    searchDrugProperty(keyWord: string): Promise<AuditPlanDrugProperty[]>{
        return this.http.get(this.drugPropertyUrl + '?keyword=' + encodeURIComponent(keyWord), {headers: this.headers})
                   .toPromise()
                   .then(response => response && response.json().code == 200 ? response.json().data as AuditPlanDrugProperty : [])
                   .catch(this.handleError);
    }
    private handleError(error: any): Promise<any> {
        console.error('An error occurred', error); // for demo purposes only
        return Promise.reject(error.message || error);
    }
}