/**
 * /**
 *  @author: anwen
 *  @Description:TODO(剂量单位设置相关接口调用)     
 *  @date：Created on 2016/7/11.
 */
import {Injectable}     from '@angular/core';
import {Http, Response} from '@angular/http';
import {Headers, RequestOptions} from '@angular/http';
import {InterceptorService } from 'ng2-interceptors';

@Injectable()
export class PatientDosageService {
    error: string;

    constructor(
        private http: InterceptorService) { }

    patientDosageUrl = '/api/v1/patientDosageForm.json';  // URL to web API

    //根据复合主键获取剂量单位设置
    getPatientDosage(dosage: any): Promise<any> {
        let tempUrl = this.patientDosageUrl + '?categoryCodeJix=' + dosage.categoryCodeJix + '&codeJix=' + dosage.codeJix;
        return this.http.get(tempUrl)
            .toPromise()
            .then(this.extractData)
            .catch(this.handleError);
    };

    //保存剂量单位设置事件
    savePatientDosage(dosage: any): Promise<any> {
        let data = {
            "categoryCodeJix": dosage.categoryCodeJix,
            "codeJix": dosage.codeJix,
            "categoryCodeUnit": dosage.categoryCodeUnit,
            "codeUnit": dosage.codeUnit
        }
        let body = JSON.stringify(data);
        let headers = new Headers({ 'Content-Type': 'application/json' });
        let options = new RequestOptions({ headers: headers });
        return this.http.post(this.patientDosageUrl, body, options)
            .toPromise()
            .then(this.extractData)
            .catch(this.handleError);
    };

    //更新剂量单位设置
    updatePatientDosage(dosage: any): Promise<any> {
        let data = {
            "categoryCodeJix": dosage.categoryCodeJix,
            "codeJix": dosage.codeJix,
            "categoryCodeUnit": dosage.categoryCodeUnit,
            "codeUnit": dosage.codeUnit,
            "id": dosage.id
        }
        let body = JSON.stringify(data);
        let headers = new Headers({ 'Content-Type': 'application/json' });
        let options = new RequestOptions({ headers: headers });
        return this.http.put(this.patientDosageUrl, body, options)
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
