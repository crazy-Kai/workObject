/**
 * /**
 *  @author: anwen
 *  @Description:TODO(专业用语解释相关接口调用)     
 *  @date：Created on 2016/7/8.
 */
import {Injectable}     from '@angular/core';
import {Http, Response} from '@angular/http';
import {InterceptorService } from 'ng2-interceptors';
import {Headers, RequestOptions} from '@angular/http';
@Injectable()
export class TermExplainService {
    error: string;

    constructor(
        private http: InterceptorService) { }

    termExplainUrl = '/api/v1/patientTermExplain.json';  // URL to web API

    //获取专业用语解释
    getTermExplain(term: any): Promise<any> {
        let tempUrl = this.termExplainUrl + '?categoryCode=' + term.categoryCode + "&code=" + term.code;
        return this.http.get(tempUrl)
            .toPromise()
            .then(this.extractData)
            .catch(this.handleError);
    };

    //保存专业用语解释事件
    saveTermExplain(term: any): Promise<any> {
        let data = {
            "categoryCode": term.categoryCode,
            "code": term.code,
            "explainText": term.explainText,
            "patientOption": term.patientOption
        }
        let body = JSON.stringify(data);
        let headers = new Headers({ 'Content-Type': 'application/json' });
        let options = new RequestOptions({ headers: headers });
        return this.http.post(this.termExplainUrl, body, options)
            .toPromise()
            .then(this.extractData)
            .catch(this.handleError);
    };

    //更新专业用语解释
    updateTermExplain(term: any): Promise<any> {
        let data = {
            "categoryCode": term.categoryCode,
            "code": term.code,
            "explainText": term.explainText,
            "patientOption": term.patientOption,
            "id": term.id
        }
        let body = JSON.stringify(data);
        let headers = new Headers({ 'Content-Type': 'application/json' });
        let options = new RequestOptions({ headers: headers });
        return this.http.put(this.termExplainUrl, body, options)
            .toPromise()
            .then(this.extractData)
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

    isEmptyObject(obj: any) {
        for (var name in obj) {
            return false;
        }
        return true;
    }

}
