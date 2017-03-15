// 返回药品相关指导页列表显示

import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import { Headers, RequestOptions } from '@angular/http';
import { InterceptorService } from 'ng2-interceptors';
import { DrugGuideListDto } from './drug_guide.component';
import { patientGuideInfoDto } from './guide_detail';
class DrugDetailList {
    drugName: string;
    patientDrugGuideInfoDto: patientGuideInfoDto;
    productDtoList: any[];
}
@Injectable()
export class GuideListService {
    // error : string;

    constructor(
        private http: InterceptorService) { }

    drugGuideListUrl = '/api/v1/drugGuideList.json';  // URL to web API
    drugGuideUrl = '/api/v1/drugGuide.json';  // URL to web API
    deleteUrl = '/api/v1/patientDrugChildList.json';//删除表单中的数据
    drugSuggestionAPI = '/api/v1/drugSuggestion';   //药品自动建议
    productSuggestionAPI = '/api/v1/productSuggestion';  //产品自动建议

    //药品搜索条件
    drugName: string = "";
    createdByDrug: string = "";
    auditByDrug: string = "";
    statusDrug: number;//审核情况 0：全部 1：已审核
    searchDrugStatus = 0;//0：未搜索
    //产品搜索条件
    productName: string = "";
    createdByProduct: string = "";
    auditByProduct: string = "";
    statusProduct: number;//审核情况 0：全部 1：已审核
    searchProductStatus = 0;//0：未搜索

    /**
     * 获取药品输入框的自动提示框API
     */
    public getDrugSuggestionAPI() : string {
        return this.drugSuggestionAPI;
    }

    public getProductSuggestionAPI() : string {
        return this.productSuggestionAPI;
    }

    // 获取药品指导树
    getGuideList(applyType: number, pageNo?: number, pageSize?: number): Promise<DrugGuideListDto> {
        let tempUrl = this.drugGuideListUrl + "?applyType=" + applyType;
        if (pageNo)
            tempUrl = tempUrl + '&pageNo=' + pageNo;
        if (pageSize)
            tempUrl = tempUrl + '&pageSize=' + pageSize;
        return this.http.get(tempUrl)
            .toPromise()
            .then(this.extractData)
            .catch(this.handleError);
    };

    // 根据drugId获取详细信息
    getDrugDetail(drugId: string,isDrug?: boolean): Promise<any> {
        let tempUrl: string;
        if (isDrug) tempUrl = this.drugGuideUrl + "?drugId=" + drugId;    //+ isDrug; // bug修复，参数传递出现错误
        else tempUrl = this.drugGuideUrl + "?patientDrugGuideId=" + drugId; //+ isDrug; // bug修复，参数传递错误
        return this.http.get(tempUrl)
            .toPromise()
            .then(this.extractData)
            .catch(this.handleError);
    }

    getProductDetail(productId: string, isDrug?: boolean): Promise<any> {
        let tempUrl: string;
        if (isDrug) tempUrl = this.drugGuideUrl + "?productId=" + productId;
        else tempUrl = this.drugGuideUrl + "?patientDrugGuideId=" + productId;
        return this.http.get(tempUrl)
            .toPromise()
            .then(this.extractData)
            .catch(this.handleError);
    }

    // 保存药品detail
    saveGuideList(guideDetail: any): Promise<any> {
        let data = {
            'patientDrugGuideDto': guideDetail.patientDrugGuideDto,
            'patientDrugDescriptionDtoList': guideDetail.patientDrugDescriptionDtoList,
            'patientDrugEffectDtoList': guideDetail.patientDrugEffectDto,
            'patientDrugInfluenceDtoList': guideDetail.patientDrugInfluenceDto,
            'patientDrugStorageDto': guideDetail.patientDrugStorageDto,
            'patientDrugUsetimeDtoList': guideDetail.patientDrugUseTime
        }
        let body = JSON.stringify(data);
        let headers = new Headers({ 'Content-Type': 'application/json' });
        let options = new RequestOptions({ headers: headers });
        return this.http.post(this.drugGuideUrl, body, options)
            .toPromise()
            .then(this.extractJson)
            .catch(this.handleError);
    }

    // 修改药品detail
    updateGuideList(guideDetail: any): Promise<any> {
        let data = {
            'patientDrugGuideDto': guideDetail.patientDrugGuideDto,
            'patientDrugDescriptionDtoList': guideDetail.patientDrugDescriptionDtoList,
            'patientDrugEffectDtoList': guideDetail.patientDrugEffectDto,
            'patientDrugInfluenceDtoList': guideDetail.patientDrugInfluenceDto,
            'patientDrugStorageDto': guideDetail.patientDrugStorageDto,
            'patientDrugUsetimeDtoList': guideDetail.patientDrugUseTime
        }
        let body = JSON.stringify(data);
        let headers = new Headers({ 'Content-Type': 'application/json' });
        let options = new RequestOptions({ headers: headers });
        return this.http.put(this.drugGuideUrl, body, options)
            .toPromise()
            .then(this.extractJson)
            .catch(this.handleError);
    }

    // 审核药品产品指导单
    auditDrugGuide(id: String): Promise<any> {
        let body = JSON.stringify({ "patientGuideId": id });
        let headers = new Headers({ 'Content-Type': 'application/json' });
        let options = new RequestOptions({ headers: headers });
        return this.http.put("/api/v1/drugGuideStatus?patientGuideId=" + id, body, options)
            .toPromise()
            .then(res => {
                if (res.status < 200 || res.status >= 300) {
                    throw new Error('Bad response status: ' + res.status);
                }
                let body = res.json();
                return body || {};
            })
            .catch(this.handleError);
    }

    // 删除具体某一个药品
    deleteFromGuideList(drugGuideItem: any, applyType: number) {
        let tempUrl = this.drugGuideUrl + "?patientDrugGuideId=" + drugGuideItem.id + '&applyType=' + applyType;
        return this.http.delete(tempUrl)
            .toPromise()
            .then(this.extractData)
            .catch(this.handleError);

    }

    //删除药品中的数据
    deleteFromForm(type: string, id: number) {
        let tempUrl = this.deleteUrl + "?" + type + "=" + id;
        return this.http.delete(tempUrl)
            .toPromise()
            .then(this.extractData)
            .catch(this.handleError);

    }



    //根据药品名称、添加人、审核人、审核状态查询检索
    searchFromList(applyType: number, name?: string, createdBy?: string, auditBy?: string, status?: number) {
        let tempUrl = this.drugGuideListUrl + "?applyType=" + applyType;
        if (name) {
            if (applyType == 1) {
                tempUrl = tempUrl + "&drugName=" + name;
            }
            if (applyType == 2) {
                tempUrl = tempUrl + "&drugName=" + name;
            }
        }
        if (createdBy) {
            tempUrl = tempUrl + "&createdBy=" + createdBy;
        }
        if (auditBy) {
            tempUrl = tempUrl + "&auditBy=" + auditBy;
        }
        if (status)
            tempUrl = tempUrl + "&status=" + status;
        return this.http.get(tempUrl)
            .toPromise()
            .then(this.extractData)
            .catch(this.handleError);
    }

    private extractData(res: Response) {
        if (res.status < 200 || res.status >= 300) {
            throw new Error('Bad response status: ' + res.status);
        }
        let body = res.json();
        if (body.code != 200) throw new Error(body.code);
        return body.data || {};
    }

    private extractJson(res: Response) {
        if (res.status < 200 || res.status >= 300) {
            throw new Error('Bad response status: ' + res.status);
        }
        let body = res.json();
        // if (body.code != 200) throw new Error(body.code);
        return body || {};
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