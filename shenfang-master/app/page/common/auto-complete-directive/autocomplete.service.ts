import { Injectable } from '@angular/core';
import { Headers, Http } from '@angular/http';

import 'rxjs/add/operator/toPromise';

@Injectable()
export class AutocompleteService {

	constructor(private http: Http){}

    private headers = new Headers({'Content-Type': 'application/json'});
    private api = {
        doctorInZone: '/api/v1/doctorInZone',
        drugList: '/api/v1/drugList'
    }

	public getDoctorList(keycode){
        return this.http.get(this.api.doctorInZone + '?keyword=' + encodeURIComponent(keycode || ''), {headers: this.headers})
            .toPromise()
            .then(response => this.extractData(response))
            .catch(this.handleError);
    }

    public getDrugList(keycode){
        return this.http.get(this.api.drugList + '?keyword=' + encodeURIComponent(keycode || ''), {headers: this.headers})
            .toPromise()
            .then(response => this.extractData(response))
            .catch(this.handleError);
    }

    private handleError(error: any) {
        console.error('An error occurred', error);
        return Promise.reject(error.message || error);
    }

    private extractData(res: any) {
        if (res.status < 200 || res.status >= 300) {
            throw new Error('Bad response status: ' + res.status);
        }
        let body = res.json(),
            _this = this;

        return body.data || [];
    }
}