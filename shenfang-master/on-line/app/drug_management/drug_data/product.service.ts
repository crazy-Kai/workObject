import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import { Headers, RequestOptions } from '@angular/http';
import { InterceptorService } from 'ng2-interceptors';
class productInfoDto {
    productDto: any;
    drugList: any[];
    dictValuesCode: any;
    dictValues: any;
    drugPropertys: any[];
    productDictformulation: any;
    routeValuesCode: any;
    routeValues: any;
    pharmacokineticsDtos: any[];
}

@Injectable()
export class ProductManageService {

    constructor(
        private http: InterceptorService) { }

    productDetailUrl = '/api/v1/productInfo.json';
    saveProductDtoUrl = '/api/v1/product.json';
    getProductUrl = '/api/v1/products';
    productSuggestionAPI = '/api/v1/productSuggestion';
    producerSuggestionAPI = '/api/v1/producerSuggestion';

    getProduct(param?: string){
        let tempUrl = `${this.getProductUrl}?${param}`;
        return this.http.get(tempUrl)
            .toPromise()
            .then(this.extractJson)
            .catch(this.handleError)
    }

    getProductInfo(arg1?: any): Promise<productInfoDto> {
        let tempUrl = this.productDetailUrl;
        if (arg1)
            tempUrl = this.productDetailUrl + "?productId=" + arg1;
        return this.http.get(tempUrl)
            .toPromise()
            .then(this.extractData)
            .catch(this.handleError);
    };
    private extractData(res: Response) {
        if (res.status < 200 || res.status >= 300) {
            throw new Error('Bad response status: ' + res.status);
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

    // 保存产品dto
    saveProductInfo(productInfo: any): Promise<any[]> {
        let tempUrl:string='';
        let data = productInfo.productDto;
        let keyword: string[] = [];
        if (productInfo.flmcId)
            keyword.push('flmcId=' + productInfo.flmcId);
        if (productInfo.chooseDictCodes)
            keyword.push('chooseDictCodes=' + productInfo.chooseDictCodes);
        if (productInfo.chooseRouteCodes)
            keyword.push('chooseRouteCodes=' + productInfo.chooseRouteCodes);
        if(keyword.length!=0){
            tempUrl = keyword.join('&');
            tempUrl = this.saveProductDtoUrl + '?' + tempUrl;
        }else{
            tempUrl = this.saveProductDtoUrl;
        }
        let body = JSON.stringify(data);
        let headers = new Headers({ 'Content-Type': 'application/json' });
        let options = new RequestOptions({ headers: headers });
        return this.http.put(tempUrl, body, options)
            .toPromise()
            .then(this.extractData)
            .catch(this.handleError);
    }
}