/*****资料评分
 * @Auther anwen
 * @Date 2016.10.8
 * @Fuction 资料分析中的数据获取和保存
 */
import { Injectable } from '@angular/core';
import { Http, Headers, RequestOptions, Response } from '@angular/http';
import {InterceptorService } from 'ng2-interceptors';
@Injectable()
export class ScoreService {

    scoringRuleUrl = '/api/v1/scoringRule';  //获取评分规则信息
    scoreUrl = '/api/v1/score';             //获取评分数据
    scoreAuditUrl = '/api/v1/scoreAudit';             //获取评分数据

    // scoringType: number = 1; //该评分人的scoringType，1-1号评分人，2-2号评分人，0-审核人
    ScoreLevel:string;        //审核人的评分质量
    ScoreLevel_1: string;     //1号评分人的评分质量
    ScoreLevel_2: string;     //2号评分人的评分质量

    constructor(
        private http: InterceptorService) { }

    /******* 
     * @function 获取评分人评分数据
     * @param scoringType 0-审核人, 1-评分人1, 2-评分人2
     *        dataId -businessId
     * @result 以List形式返回，graders-评分人名称，score-分数
    */
    getScore(dataId: string, scoringType?: number) {
        let tempUrl = this.scoreUrl + "?dataId=" + dataId;
        if (scoringType != undefined) {
            tempUrl += "&scoringType=" + scoringType;
        }
        return this.http.get(tempUrl)
            .toPromise()
            .then(this.extractData)
            .catch(this.handleError);
    }

    /******* 
     * @function 获取评分规则信息
     * @param id-文献类型，如 meta
     * @result 以List形式返回，scoringSetting存放可以选择的评分选项，以“；”隔开
    */
    getItemInfo(id: string) {
        let tempUrl = this.scoringRuleUrl + "?pid=" + id;
        return this.http.get(tempUrl)
            .toPromise()
            .then(this.extractData)
            .catch(this.handleError);
    }

    /****保存评分
     * -postScore 新增
     * -putScore  修改
     * 
     * @param scoringRuleId - 评分规则id 如：meta-1
              dataType - 文献类型 如：meta
              score - 评分分数
              dataId - businessId
     */
    postScore(returnBody: any[]): Promise<any> {
        let data = returnBody;
        let body = JSON.stringify(data);
        let headers = new Headers({ 'Content-Type': 'application/json' });
        let options = new RequestOptions({ headers: headers });
        return this.http.post(this.scoreUrl, body, options)
            .toPromise()
            .then(this.extractJson)
            .catch(this.handleError);
    }

    putScore(returnBody: any[]): Promise<any> {
        let data = returnBody;
        let body = JSON.stringify(data);
        let headers = new Headers({ 'Content-Type': 'application/json' });
        let options = new RequestOptions({ headers: headers });
        return this.http.put(this.scoreUrl, body, options)
            .toPromise()
            .then(this.extractJson)
            .catch(this.handleError);
    }

    /****保存评分审核
     * -postScoreAudit 新增
     * 
     * @param scoringRuleId - 评分规则id 如：meta-1
              dataType - 文献类型 如：meta
              score - 评分分数
              dataId - businessId
     */
    postScoreAudit(returnBody: any[]): Promise<any> {
        let data = returnBody;
        let body = JSON.stringify(data);
        let headers = new Headers({ 'Content-Type': 'application/json' });
        let options = new RequestOptions({ headers: headers });
        return this.http.post(this.scoreAuditUrl, body, options)
            .toPromise()
            .then(this.extractJson)
            .catch(this.handleError);
    }

    isEmptyObject(obj: any):boolean {
        for (var name in obj) {
            return false;
        }
        return true;
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