import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import { Headers, RequestOptions } from '@angular/http';
import { InterceptorService } from 'ng2-interceptors';

@Injectable()
export class KnowledgeImportService {
    constructor(
        private http: InterceptorService) { }

    /**
     * APIS
     */
    getOrgsListAPI = 'api/v1/agencyList';                           //获取机构列表
    getKnowledgeImportListAPI = 'api/v1/knowledgeImportList';       //获取用户规则回收列表
    getImportProgressAPI = 'api/v1/KnowledgeImportProgress';        //获取导入进度
    hospitalDataImportAPI = 'api/v1/hospitalDataImport';            //数据导入
    getKnowledgeHistoryListAPI = 'api/v1/knowledgeHistoryList';


    /**
     * 获取机构列表
     * @param type;
     * 医院  平台
     */
    getOrgsList(type?: string) {
        let tempUrl = type ? `${this.getOrgsListAPI}?type=${type}` : `${this.getOrgsListAPI}`;
        return this.http.get(tempUrl)
            .toPromise()
            .then(this.extractJson)
            .catch(this.handleError)
    }

    /**
     * 获取用户规则回收列表
     */
    getKnowledgeImportList(param?: string) {
        let tempUrl = param ? `${this.getKnowledgeImportListAPI}?${param}` : `${this.getKnowledgeImportListAPI}`;
        return this.http.get(tempUrl)
            .toPromise()
            .then(this.extractJson)
            .catch(this.handleError)
    }

    /**
     * 获取导入进度
     */
    getImportProgress(hospitalId: string) {
        let tempUrl = `${this.getImportProgressAPI}?hospitalId=${hospitalId}`;
        return this.http.get(tempUrl)
            .toPromise()
            .then(this.extractJson)
            .catch(this.handleError)
    }

    /**
     * 获取回收日志
     */
    getKnowledgeHistoryList(param: string) {
        let tempUrl = param ? `${this.getKnowledgeHistoryListAPI}?${param}` : `${this.getKnowledgeHistoryListAPI}`;
        return this.http.get(tempUrl)
            .toPromise()
            .then(this.extractData)
            .catch(this.handleError)

    }

    private extractJson(res: Response) {
        if (res.status < 200 || res.status >= 300) {
            throw new Error('Bad response status: ' + res.status);
        }
        let body = res.json();
        return body || {};
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
}