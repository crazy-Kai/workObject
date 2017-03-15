import {Injectable}     from '@angular/core';
import {Http, Response} from '@angular/http';
import {Headers, RequestOptions} from '@angular/http';
import {InterceptorService } from 'ng2-interceptors';

@Injectable()
export class DataDetailService {
    constructor(
        private http: InterceptorService) { }
    dataDetailUrl = '/api/v1/doc';
    saveDataUrl ='/api/v1/doc';
    delDataUrl ='/api/v1/doc';

    // 点击获取资料详细内容
    getDocInfo(id: number) {
        let tempUrl = this.dataDetailUrl + "?id=" + id;
        return this.http.get(tempUrl)
            .toPromise()
            .then(this.extractData)
            .catch(this.handleError);
    }
    
    // getPharmacyList(){
        // let tempUrl = this.bookListUrl;
        // return this.http.get(tempUrl)
        //     .toPromise()
        //     .then(this.extractData)
        //     .catch(this.handleError);
    // }

    // 新增->保存资料
    newData(data:any):Promise<any> {
        let body = JSON.stringify(data);
        let headers = new Headers({'Content-Type': 'application/json'});
        let options = new RequestOptions({headers: headers});
        return this.http.post(this.saveDataUrl, body, options)
            .toPromise()
            .then(this.extractJson)
            .catch(this.handleError);
    }

    // 修改->保存资料
    save(data:any):Promise<any> {
        let body = JSON.stringify(data);
        let headers = new Headers({'Content-Type': 'application/json'});
        let options = new RequestOptions({headers: headers});
        return this.http.put(this.saveDataUrl, body, options)
            .toPromise()
            .then(this.extractJson)
            .catch(this.handleError);
    }
    //删除 -> 资料
    del(id: string) {
        let tempUrl = this.delDataUrl + "?id=" + id;
        return this.http.delete(tempUrl)
            .toPromise()
            .then(this.extractJson)
            .catch(this.handleError);
    }


    private extractData(res: Response) {
        if (res.status < 200 || res.status >= 300) {
            throw new Error('Bad response status: ' + res.status);
        }
        let body: any;
        try {
            body = res.json();
        } catch (error) {
            return {};
        } 

        return body.data || {};
    }

    private extractJson(res: Response) {
        if (res.status < 200 || res.status >= 300) {
            throw new Error('Bad response status: ' + res.status);
        }
        let body: any;
        
        try {
            body = res.json();
        } catch(error) {
            return {};
        }

        return body || {};
    }

    private handleError(error: any) {
        console.error('An error occurred', error);
        return Promise.reject(error.message || error);
    }

}