// 获取药品树服务

import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import { Headers, RequestOptions } from '@angular/http';
import { UserService } from '../../user.service';
import { InterceptorService } from 'ng2-interceptors';

@Injectable()
export class DrugService {
    drugGroup: {};
    // nodeName:string;
    error: string;
    node: any;
    flmc: string;
    flmcId: string;
    //拷贝添加
    targetId: string;
    ypmc: string;
    copyId: string;
    copyDrugRule: string;
    copyDrugProduct: string;

    //搜索药品
    searchText: string;
    searchStatus = false;

    constructor(
        private http: InterceptorService,
        private userService: UserService) { }

    drugCategoryUrl = '/api/v1/drugTree';  // URL to web API
    drugFormInfoUrl = '/api/v1/drugForm';
    savaDrugInfoUrl = '/api/v1/drugCategory';
    deleteDrugInfoUrl = '/api/v1/drug';
    drugProductUrl = '/api/v1/drugProduct';//药品关联产品url
    drugSuggestionAPI = '/api/v1/drugSuggestionAPI';

    postDrugInfo(formDto: any): Promise<any> {
        let body = JSON.stringify(formDto);
        let headers = new Headers({ 'Content-Type': 'application/json' });
        let options = new RequestOptions({ headers: headers });
        return this.http.post(this.savaDrugInfoUrl, body, options)
            .toPromise()
            .then(this.extractJson)
            .catch(this.handleError);
    }

    putDrugInfo(formDto: any): Promise<any> {
        let body = JSON.stringify(formDto);
        let headers = new Headers({ 'Content-Type': 'application/json' });
        let options = new RequestOptions({ headers: headers });
        return this.http.put(this.savaDrugInfoUrl, body, options)
            .toPromise()
            .then(this.extractJson)
            .catch(this.handleError);
    }
    //获取药品表单数据
    getDrugFormInfo(id: string): Promise<any> {
        let tempUrl = this.drugFormInfoUrl + "?id=" + id;
        return this.http.get(tempUrl)
            .toPromise()
            .then(this.extractData)
            .catch(this.handleError);
    };
    //获取药品类
    getDrugCategory(): Promise<any[]> {
        // let tempUrl = this.drugCategoryUrl + "?drugId=0013921000";
        return this.http.get(this.drugCategoryUrl)
            .toPromise()
            .then(this.extractData)
            .catch(this.handleError);
    };

    //获取药品树的子目录
    getChildren(id: string): Promise<any> {
        let tempUrl = this.drugCategoryUrl + "?drugId=" + id;
        return this.http.get(tempUrl)
            .toPromise()
            .then(res => {
                if (res.status < 200 || res.status >= 300) {
                    throw new Error('Bad response status: ' + res.status);
                }
                let body = res.json();
                for (let i = 0; i < body.data.length; i++)
                    body.data[i].uuid = uuid();
                return body.data || {};
            })
            .catch(this.handleError);
    };

    // 127.0.0.1:8081/api/v1/drugTree/医院?notClearChildren=true&root=001
    searchByDrugName(drugName: string): Promise<any[]> {
        let tempUrl = this.drugCategoryUrl + '/' + drugName + "?notClearChildren=true&root=001";
        return this.http.get(tempUrl)
            .toPromise()
            .then(this.extractData)
            .catch(this.handleError);
    }

    copyCategory() {
        if (!this.targetId) {
            alert("请选择药品!");
            return;
        }
        let tempUrl = this.savaDrugInfoUrl + "/" + this.targetId + "/" + this.copyId + "?copyDrugRule=" + this.copyDrugRule + "&copyDrugProduct=" + this.copyDrugProduct;
        let body = "";
        let headers = new Headers({ 'Content-Type': 'application/json' });
        let options = new RequestOptions({ headers: headers });
        return this.http.post(tempUrl, body, options)
            .toPromise()
            .then(this.extractData)
            .catch(this.handleError);
    }
    deleteDrug() {
        if (!this.targetId || !this.ypmc) {
            alert("请选择药品!");
            return;
        }
        let tempUrl = this.deleteDrugInfoUrl + "?drugId=" + this.targetId + "&ypmc=" + this.ypmc;
        let headers = new Headers({ 'Content-Type': 'application/json' });
        let options = new RequestOptions({ headers: headers });
        return this.http.delete(tempUrl, options)
            .toPromise()
            .then(this.extractJson)
            .catch(this.handleError);
    }

    //删除药品关联产品
    //传入该药品ID，以及该药品关联产品列表products
    deleteDrugProduct(drugProducts: any[], drugId: string): Promise<any> {
        let drugProductIdsStr: string = '';
        let tempUrl = this.drugProductUrl;
        for (let index = 0; index < drugProducts.length; index++) {
            drugProductIdsStr += drugProducts[index].id + '@@@';
        }
        tempUrl = tempUrl + "?drugProductIds=" + drugProductIdsStr + "&drugId=" + drugId;
        return this.http.delete(tempUrl)
            .toPromise()
            .then(this.extractJson)
            .catch(this.handleError);
    }

    addDrugProduct(drugProducts: any[], drugId: string): Promise<any> {
        let drugProductIdsStr: string = '';
        let tempUrl = this.drugProductUrl;
        for (let index = 0; index < drugProducts.length; index++) {
            drugProductIdsStr += drugProducts[index].id + '@@@';
        }
        tempUrl = tempUrl + "?drugProductIds=" + drugProductIdsStr + "&drugId=" + drugId;
        let headers = new Headers({ 'Content-Type': 'application/json' });
        let options = new RequestOptions({ headers: headers });
        return this.http.post(tempUrl, options)
            .toPromise()
            .then(this.extractJson)
            .catch(this.handleError);
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

    isEmptyObject(obj: any) {
        for (var name in obj) {
            return false;
        }
        return true;
    }

}

var id = 0;

function uuid() {
    id = id + 1;
    return id;
} 