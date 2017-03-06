import { Injectable } from '@angular/core';
import { Headers, Http, Response } from '@angular/http';

import 'rxjs/add/operator/toPromise';

@Injectable()
export class IptDetailsService {
    // optRecipeId

    //患者医嘱就诊信息
    private iptOrderUrl = '/api/v1/ipt/all/iptPatient';
    //患者过敏药物列表
    private allergyListUrl = '/api/v1/ipt/all/allergyList';
    //患者医嘱列表
    private orderListUrl = '/api/v1/ipt/all/orderList';
    //诊断记录列表
    private diagnoseListUrl = '/api/v1/ipt/all/diagnoseList';
    //病程记录
    private progressUrl = '/api/v1/ipt/all/progressList';
    //入院记录
    private iptRecordListUrl= '/api/v1/ipt/all/iptRecordList';
    //检验检查单
    private iptExamListUrl = '/api/v1/ipt/all/examList';
    //药物敏感检验
    private drugSensitiveUrl= '/api/v1/ipt/all/drugSensitiveList';
    //手术
    private iptOperationListUrl = '/api/v1/ipt/all/operationList';
    //生命体征
    private vitalSignListUrl= '/api/v1/ipt/all/vitalSignList';
    //非药医嘱列表
    private nonOrderListUrl = '/api/v1/ipt/all/nonOrderList';
    //草药医嘱列表
    private herbOrderListUrl = '/api/v1/ipt/all/herbOrderList';
    //药物医嘱
    
    //细菌培养
    private bacterialListUrl = '/api/v1/ipt/all/bacterialList';
    //影像列表
    private imageListUrl = '/api/v1/ipt/all/imageList';
    //特殊检验
    private specialExamListUrl = '/api/v1/ipt/all/specialExamList';
    //警示信息 POST
    private engineMsgUrl = '/api/v1/ipt/all/engineMsgList';
    //上一个审核、下一个审核
    private aroundAuditResultUrl = '/api/v1/ipt/all/aroundAuditResultId'
    //审核药师医生交互结果
    private auditResultListUrl = '/api/ipt/all/v1/getAuditResultList';

    constructor(private http: Http) { }

    //患者医嘱就诊信息
    getIptOrder(id: string){
        return this.http.get(this.iptOrderUrl + '?id=' + id)
            .toPromise()
            .then(this.extractData)
            .catch(this.handleError)
    }
    //获取患者过敏药物列表
    getAllergyList(orderId: string){
        return this.http.get(this.allergyListUrl + '?id=' + orderId)
            .toPromise()
            .then(this.extractData)
            .catch(this.handleError)
    }
    //获取医嘱列表
    getOrderList(orderId: number, startDate: string, period: number){
        let reqUrl = this.orderListUrl + '?id=' + orderId + ( (startDate && startDate != '') ? ('&startDate=' + startDate) : '') + (period ? ('&period=' + period) : '');
        return this.http.get(reqUrl)
            .toPromise()
            .then(this.extractData)
            .catch(this.handleError)
    }
    //获取诊断记录列表
    getDiagnoseList(orderId: number, startDate: string, period: number){
        let reqUrl = this.diagnoseListUrl + '?id=' + orderId + ( (startDate && startDate != '') ? ('&startDate=' + startDate) : '') + (period ? ('&period=' + period) : '');
        return this.http.get(reqUrl)
            .toPromise()
            .then(this.extractData)
            .catch(this.handleError)
    }
    //病程记录
    getProgress(orderId: number, startDate: string, period: number){
        let reqUrl = this.progressUrl + '?id=' + orderId + ( (startDate && startDate != '') ? ('&startDate=' + startDate) : '') + (period ? ('&period=' + period) : '');
        return this.http.get(reqUrl)
            .toPromise()
            .then(this.extractData)
            .catch(this.handleError)
    }
    //入院记录
    getIptRecordList(orderId: string){
        return this.http.get(this.iptRecordListUrl + '?id=' + orderId)
            .toPromise()
            .then(this.extractData)
            .catch(this.handleError)
    }
    //检验检查单
    getIptExamList(orderId: number, startDate: string, period: number){
        let reqUrl = this.iptExamListUrl + '?id=' + orderId + ( (startDate && startDate != '') ? ('&startDate=' + startDate) : '') + (period ? ('&period=' + period) : '');
        return this.http.get(reqUrl)
            .toPromise()
            .then(this.extractData)
            .catch(this.handleError)
    }
    //药物敏感检验
    getDrugSensitive(orderId: string){
        return this.http.get(this.drugSensitiveUrl + '?id=' + orderId)
            .toPromise()
            .then(this.extractData)
            .catch(this.handleError)
    }
    //细菌培养
    getBacterialList(orderId: number, startDate: string, period: number){
        let reqUrl = this.bacterialListUrl + '?id=' + orderId + ( (startDate && startDate != '') ? ('&startDate=' + startDate) : '') + (period ? ('&period=' + period) : '');
        return this.http.get(reqUrl)
            .toPromise()
            .then(this.extractData)
            .catch(this.handleError)
    }
    //影像列表
    getImageList(orderId: number, startDate: string, period: number){
        let reqUrl = this.imageListUrl + '?id=' + orderId + ( (startDate && startDate != '') ? ('&startDate=' + startDate) : '') + (period ? ('&period=' + period) : '');
        return this.http.get(reqUrl)
            .toPromise()
            .then(this.extractData)
            .catch(this.handleError)
    }
    //特殊检验
    getSpecialExamList(orderId: number, startDate: string, period: number){
        let reqUrl = this.specialExamListUrl + '?id=' + orderId + ( (startDate && startDate != '') ? ('&startDate=' + startDate) : '') + (period ? ('&period=' + period) : '');
        return this.http.get(reqUrl)
            .toPromise()
            .then(this.extractData)
            .catch(this.handleError)
    }
    //手术
    getIptOperationList(orderId: number, startDate: string, period: number){
        let reqUrl = this.iptOperationListUrl + '?id=' + orderId + ( (startDate && startDate != '') ? ('&startDate=' + startDate) : '') + (period ? ('&period=' + period) : '');
        return this.http.get(reqUrl)
            .toPromise()
            .then(this.extractData)
            .catch(this.handleError)
    }
    //生命体征
    getVitalSignList(orderId: number, startDate: string, period: number){
        let reqUrl = this.vitalSignListUrl + '?id=' + orderId + ( (startDate && startDate != '') ? ('&startDate=' + startDate) : '') + (period ? ('&period=' + period) : '');
        return this.http.get(reqUrl)
            .toPromise()
            .then(this.extractData)
            .catch(this.handleError)
    }
    //非药医嘱列表
    getNonOrderList(orderId: number, startDate: string, period: number){
        let reqUrl = this.nonOrderListUrl + '?id=' + orderId + ( (startDate && startDate != '') ? ('&startDate=' + startDate) : '') + (period ? ('&period=' + period) : '');
        return this.http.get(reqUrl)
            .toPromise()
            .then(this.extractData)
            .catch(this.handleError)
    }
    //草药医嘱列表
    getHerbOrderList(orderId: string){
        return this.http.get(this.herbOrderListUrl + '?id=' + orderId)
            .toPromise()
            .then(this.extractData)
            .catch(this.handleError)
    }
    //警示信息
    getEngineMsgList(id: string, groupNo: string, orderIdList: any[]): Promise<any> {
        let engineMsgData = {
            'engineId': id,
            'groupNo': groupNo,
            'medicalIds': orderIdList,
            'herbMedicalIds': []
        };
        return this.http.post(this.engineMsgUrl, engineMsgData)
                   .toPromise()
                   .then(response => response && response.json().code == 200 ? response.json().data : {})
                   .catch(this.handleError);
    }
    //审核药师医生交互结果
    getAuditResultList(orderId: string){
        return this.http.get(this.auditResultListUrl + '?id=' + orderId)
            .toPromise()
            .then(this.extractData)
            .catch(this.handleError)
    }


    /**
     * promise预处理
     */
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
        return body.data;
    }
    private handleError(error: any): Promise<any> {
        console.error('An error occurred', error); // for demo purposes only
        return Promise.reject(error.message || error);
    }
}