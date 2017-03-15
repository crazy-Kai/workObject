/**
 * /**
 *  @author: anwen
 *  @Description:TODO(通用时间设置相关接口调用)     
 *  @date：Created on 2016/7/11.
 */
import {Injectable}     from '@angular/core';
import {Http, Response} from '@angular/http';
import {Headers, RequestOptions} from '@angular/http';
import {FreqItem} from './general_timeset.component';
import {InterceptorService } from 'ng2-interceptors';

@Injectable()
export class PatientUseTimeService {
    error: string;

     constructor(
        private http: InterceptorService) { }

    patientUseTimeUrl = '/api/v1/patientUseTime';  // URL to web API

    //获取通用时间设置
    getPatientUseTime(categoryCodeShij: string, codeShij: string): Promise<any> {
        let tempUrl = this.patientUseTimeUrl + '?categoryCodeShij=' + categoryCodeShij + "&codeShij=" + codeShij;
        return this.http.get(tempUrl)
            .toPromise()
            .then(this.extractData)
            .catch(this.handleError);
    };

    getPatientUseTimeByFreq(codeShij: string, codeFreq: string) {
        let tempUrl = this.patientUseTimeUrl + "?categoryCodeShij=sys_dictcate_shij&codeShij=" + codeShij + "&categoryCodeFreq=sys_route_freq&codeFreq=" + codeFreq;
        return this.http.get(tempUrl)
            .toPromise()
            .then(this.extractData)
            .catch(this.handleError);
    }

    //保存通用时间设置事件
    savePatientUseTime(categoryCodeShij: string, codeShij: string, freqs: any[]): Promise<FreqItem[]> {
        let data = {
            "categoryCodeShij": categoryCodeShij,
            "codeShij": codeShij,
            "data": freqs
        }
        let body = JSON.stringify(data);
        let headers = new Headers({ 'Content-Type': 'application/json' });
        let options = new RequestOptions({ headers: headers });
        return this.http.post(this.patientUseTimeUrl, body, options)
            .toPromise()
            .then(this.extractData)
            .catch(this.handleError);
    };

    //更新通用时间设置事件
    updatePatientUseTime(categoryCodeShij: string, codeShij: string, freqs: any[]): Promise<any> {
        let data = {
            "categoryCodeShij": categoryCodeShij,
            "codeShij": codeShij,
            "data": freqs
        }
        let body = JSON.stringify(data);
        let headers = new Headers({ 'Content-Type': 'application/json' });
        let options = new RequestOptions({ headers: headers });
        return this.http.put(this.patientUseTimeUrl, body, options)
            .toPromise()
            .then(this.extractData)
            .catch(this.handleError);
    };

    //根据id删除给药频率
    deletePatientUseTime(id: number) {
        let tempUrl = '/api/v1/patientUseTime' + '/' + id;
        return this.http.delete(tempUrl)
            .toPromise()
            .then(this.extractData)
            .catch(this.handleError);
    }

    //产品/药品相关指导，给药时间设置，删除给药时机
    deleteUseTimeByGuideId(patientDrugGuideId:string,takeTiming:string){
        let tempUrl = '/api/v1/patientUserTime?patientDrugGuideId=' + patientDrugGuideId + '&takeTiming=' + takeTiming;
        return this.http.delete(tempUrl)
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