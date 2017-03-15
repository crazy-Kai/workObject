// 获取资料分类树服务

import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import { Headers, RequestOptions } from '@angular/http';
import { InterceptorService } from 'ng2-interceptors';
@Injectable()
export class DataSortService {
    dataGroup: {};
    error: string;

    constructor(
        private http: InterceptorService) { }

    booksTreeUrl = '/api/v1/booksTree';
    dictionaryDataUrl = '/api/v1/dataClassification';
    /**
     * 资料分类管理内容展示接口
     */
    booksPharmacyUrl = '/api/v1/booksPharmacy';                         //书籍
    booksPeriodicalUrl = '/api/v1/booksPeriodical';                     //期刊
    booksElectronicDocUrl = '/api/v1/booksElectronicDoc';               //电子文献
    booksElectronicBulletinUrl = '/api/v1/booksElectronicBulletin';     //电子公告
    booksOthersUrl = '/api/v1/booksOthers';                             //其他
    booksSuggestionAPI = '/api/v1/booksSuggestion';                     //检索时的自动提示


    //获取资料树的子目录
    getChildrenByNode(node: any): Promise<any[]> {
        let tempUrl: string = this.booksTreeUrl;
        if (node && node.id)
            tempUrl += "?pcode=" + node.id;
        return this.http.get(tempUrl)
            .toPromise()
            .then(this.extractData)
            .catch(this.handleError);
    };
    //获取资料分类树
    getBooksTree(dictVal?: string) {
        let tempUrl = dictVal ? `${this.booksTreeUrl}?dictValue=${dictVal}` : this.booksTreeUrl;

        return this.http.get(tempUrl).toPromise()
            .then(res => {
                if (res.status < 200 || res.status >= 300) {
                    throw new Error('Bad response status: ' + res.status);
                }
                let body = res.json();
                if(body.data){
                    for (let i = 0; i < body.data.length; i++){
                        body.data[i].uuid = uuid();
                        if(dictVal)
                            body.data[i].isExpanded = true;
                    }
                }
                return body.data;
            })
            .catch(this.handleError);
    }
    getSingleDataTree(pcode:string, dictVal?: string) {
        let tempUrl = dictVal ? `${this.booksTreeUrl}?pcode=${pcode}&dictValue=${dictVal}` : `${this.booksTreeUrl}?pcode=${pcode}`;

        return this.http.get(tempUrl).toPromise()
            .then(res => {
                if (res.status < 200 || res.status >= 300) {
                    throw new Error('Bad response status: ' + res.status);
                }
                let body = res.json();
                if(body.data){
                    for (let i = 0; i < body.data.length; i++){
                        body.data[i].uuid = uuid();
                        if(dictVal)
                            body.data[i].isExpanded = true;
                    }
                }
                return body.data;
            })
            .catch(this.handleError);
    }

    /**
     * 资料内容逻辑
     * @Method getData() => 获取对应数据
     * @Method addData() => 添加数据到对应目录
     * @Method updateData() => 修改对应的目录
     * @Method delData() => 删除对应数据
     */
    serializeUrl(type: string, params?:string){
        let tempUrl: string;
        switch(type){
            case 'data_pharmacy':
                tempUrl = this.booksPharmacyUrl + (params ? ("?id=" + params) : "");
                break;
            case 'data_periodical':
                tempUrl = this.booksPeriodicalUrl + (params ? ("?id=" + params) : "");
                break;
            case 'data_elec_doc':
                tempUrl = this.booksElectronicDocUrl + (params ? ("?id=" + params) : "");
                break;
            case 'data_elec_bull':
                tempUrl = this.booksElectronicBulletinUrl + (params ? ("?id=" + params) : "");
                break;
            case 'data_others':
                tempUrl = this.booksOthersUrl + (params ? ("?id=" + params) : "");
                break;
            default:
                break;
        }
        return tempUrl;
    }
    getData(type: string, id: any){
        let tempUrl: string;
        tempUrl = this.serializeUrl(type, id);
        return this.http.get(tempUrl)
            .toPromise()
            .then(this.extractJson)
            .catch(this.handleError)
    }
    addData(type: string, data: any){
        let tempUrl: string;
        tempUrl = this.serializeUrl(type);
        return this.http.post(tempUrl, data)
            .toPromise()
            .then(this.extractJson)
            .catch(this.handleError)
    }
    updateData(type: string, data: any){
        let tempUrl: string;
        tempUrl = this.serializeUrl(type);
         return this.http.put(tempUrl, data)
            .toPromise()
            .then(this.extractJson)
            .catch(this.handleError)
    }
    delData(type: string, id: string){
        let tempUrl: string;
        tempUrl = this.serializeUrl(type, id);
        return this.http.delete(tempUrl)
            .toPromise()
            .then(this.extractJson)
            .catch(this.handleError)
    }


    getCate(code: string){
        let tempUrl = this.dictionaryDataUrl + "?code=" + code;
        return this.http.get(tempUrl)
            .toPromise()
            .then(this.extractJson)
            .catch(this.handleError)
    }
    addCate(data: any){
        return this.http.post(this.dictionaryDataUrl, data)
            .toPromise()
            .then(this.extractJson)
            .catch(this.handleError)
    }
    updateCate(data: any){
        return this.http.put(this.dictionaryDataUrl, data)
            .toPromise()
            .then(this.extractJson)
            .catch(this.handleError)
    }
    deleteCate(code: string){
        let tempUrl: string;
        tempUrl = `${this.dictionaryDataUrl}?code=${code}`;
        return this.http.delete(tempUrl)
            .toPromise()
            .then(this.extractJson)
            .catch(this.handleError)
    }

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

}

let id = 0;
function uuid() {
    id = id + 1;
    return id;
}