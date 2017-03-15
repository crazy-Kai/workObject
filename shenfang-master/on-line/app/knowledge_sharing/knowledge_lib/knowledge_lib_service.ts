import { Injectable } from '@angular/core';
import {Http, Response} from '@angular/http';
import {Headers, RequestOptions} from '@angular/http';
import {InterceptorService } from 'ng2-interceptors';
import {Observable} from 'rxjs/Rx';

@Injectable()
export class KnowledgeLibService {
    constructor( private http: InterceptorService) {    }
    private message: string;

    //知识库发布API
    private baseUrl: string = '/api/v1/knowledgePublishes';        //发布请求
    private currentStatusUrl: string = this.baseUrl + '/current';     //发布进度
    private testResultUrl: string = this.baseUrl + '/status';         //测试结果
    private auditedResultUrl: string = this.testResultUrl;               //审核结果


    //知识库发布日志API
    private queryLibReleaseLogUrl = this.baseUrl;

    public getBaseUrl() {
        return this.baseUrl;
    }

    //导出更新包API
    private latestSucessUrl: string = '/api/v1/knowledgePublishes/latestSuccess';
    private startExportUrl: string = '/api/v1/knowledgePackages';
    private getExportProgressUrl: string = '/api/v1/knowledgePackages/current';
    private getExportHistory: string = '/api/v1/knowledgePackages';

    //下载测试用知识更新包
    private packageForTestUrl: string = "/api/v1/knowledgePackages/confirmPackage"; //get


    /** service内部方法区 */
    //----------------------------------------------------------

    /**
     * http请求时的错误处理
     */
    private errorHandler( error: any) {
        console.error('error occurred:', error);
        return Promise.reject( error.message || error);
    }

    /**
     * http请求的正确处理:
     */
    private extractData( res: Response) {
        if ( res.status < 200 || res.status >= 300) {
            throw new Error("Bad response status:" + res.status );
        }
        let body = res.json();
        return body.data || {};
    }

    private extractJson(res: Response) {
        if (res.status < 200 || res.status >= 300) {
            throw new Error('Bad response status: ' + res.status);
        }
        let body = res.json();
        return body || {};
    }

    /** 业务逻辑方法区 */
    //----------------------------------------------------------

    /**
     * 初次加载页面时,根据权限展示相应的页面元素
     */
    public loadInitPage(initPageUrl: string) {
        return this.http.get(initPageUrl).toPromise()
            .then(this.extractJson).catch(this.errorHandler);
    }

    /**
     * 获取当前知识库提交发布请求的状态
     */
    public getCurrentPublishedStatus() {
        return this.http.get(this.currentStatusUrl).toPromise()
            .then(this.extractJson).catch(this.errorHandler);
    }

    /**
     * 知识库发布请求的提交
     */
    public postLibPublishRequest(body: any) {
        return this.http.post(this.baseUrl, body).toPromise()
            .then(this.extractJson).catch(this.errorHandler);
    }

    /**
     * 知识库发布提交测试结果
     */
    public postTestResult(body: any) {
        return this.http.post( this.testResultUrl, body).toPromise()
            .then( this.extractJson ).catch(this.errorHandler);
    }

    /**
     * 知识库发布提交审核结果
     */
    public putAuditResult(body: any) {
        return this.http.put(this.auditedResultUrl, body).toPromise()
            .then( this.extractJson ).catch(this.errorHandler);
    }


    //----------知识库发布日志-------------------
    /**
     * 知识库发布历史 - 根据条件检索发布历史
     */
    public queryPagedLibReleaseLogList(queryStr: any) {
        let url = this.queryLibReleaseLogUrl;
        
        if ( queryStr ) {
            //存在检索条件时
            url += "?" + queryStr;
        }

        return this.http.get(url).toPromise().then( this.extractData ).catch( this.errorHandler);
    }

    //----------End:知识库发布日志


    //------------导出更新包------------------
    /**
     * 获取最近的更新包信息
     */

    public getLatestSucess(){
        return this.http.get(this.latestSucessUrl)
            .toPromise()
            .then(this.extractJson)
            .catch(this.errorHandler)
    }
    /**
     * 开始导出
     */
    public startExport(data: any){
        return this.http.post(this.startExportUrl, data)
            .toPromise()
            .then(this.extractJson)
            .catch(this.errorHandler)
    }
    /**
     * 知识包导出进度
     */
    public getExportProgress(hospitalId: any){
        let tempUrl = this.getExportProgressUrl + '?hospitalId=' + hospitalId
        return this.http.get(tempUrl)
            .toPromise()
            .then(this.extractJson)
            .catch(this.errorHandler)
    }
    /**
     * 获取导出记录
     */
    public getLatestsData(hospitalId: string, items?: number){
        let pageSize:number = items ? items : 2;
        let tempUrl = this.getExportHistory + '?hospitalId='+ hospitalId +'&pageSize=' + items;

        return this.http.get(tempUrl)
            .toPromise()
            .then(this.extractJson)
            .catch(this.errorHandler)
    }

    /**
     * 下载测试用知识更新包
     */
    public getDownloadTestPackageUrl() : string {
        return this.packageForTestUrl;
    }
}