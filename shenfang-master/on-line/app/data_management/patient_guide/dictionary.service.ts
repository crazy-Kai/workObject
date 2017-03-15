/**
 * /**
 *  @author: anwen
 *  @Description:TODO(树级目录相关接口调用)     
 *  @date：Created on 2016/6/30.
 */
import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import { Headers, RequestOptions } from '@angular/http';
import {InterceptorService } from 'ng2-interceptors';

/**
 * 字典分类对象定义
 * 
 * @author songjy
 */
export class DictionaryCategory {
    id: number;//主键
    code: string;//字典分类代码
    oldCode: string;//旧字典分类代码
    pid: number;//父主键
    name: string;//字典分类名称
    remark: string;//备注
    hasChildren: boolean;//是否存在子节点，true：存在false：不存在
    addChildren: boolean;//是否添加子节点，true:是，false:添加兄弟节点
    showLevel: boolean;//是否显示层级选项
    operationType: number;//1:添加2:修改
}

/**
 * 字典数据对象定义
 * 
 * @author songjy
 */
export class DictionaryData {
    code: string;//字典数据代码
    categoryCode: string;//字典分类代码
    pcode: string;//字典数据父代码
    dictValue: string;//字典数据值
    remark: string;//备注
    hasChildren: boolean;//是否存在子节点
    oldCode: string;//旧字典数据代码
    systemReserved: number;//0-非系统保留 或 1-系统保留
    dorder: number;//排序字段
    operationType: number;//1:添加操作2:修改操作
    showLevel: boolean;//是否显示层级选项
    addChildren: boolean;//是否添加子节点，true:是，false:添加兄弟节点
    dictionaryExtends: DictionaryExtend[];
}

export class DictionaryExtend {
    id: number;//属性扩展表id
    code: string;//字典数据代码
    categoryCode: string;//字典分类代码
    propertyKey: string;//属性键
    propertyValue: string//属性值
}

export class Extend {
    startTime: string;
    endTime: string;
}
@Injectable()
export class DictionaryService {
    dictionaryGroup: {};
    error: string;
    jixDicCode: string;
    constructor(
        private http: InterceptorService) { }

    dictionaryCategoryUrl = '/api/v0/dictionaryCategory';  // URL to web API
    dictionaryCategoryUrl_V1 = '/api/v1/dictionaryCategory';  // URL to web API
    dictionaryDataUrl = '/api/v1/dictionaryData';  // URL to web API

    getDictionaryCategory(): Promise<any[]> {
        return this.http.get(this.dictionaryCategoryUrl)
            .toPromise()
            .then(this.extractData)
            .catch(this.handleError);
    };

    /**
     * 字典分类添加
     * 
     * @author songjy
     * 
     * @param DictionaryCategory 字典分类信息
     */
    dictionaryCategoryAdd(dictionaryCategory: any): Promise<any> {
        let data: any = {
            "code": dictionaryCategory.code,
            "name": dictionaryCategory.name,
            "remark": dictionaryCategory.remark
        }

        if ((true == dictionaryCategory.addChildren) || ('true' == dictionaryCategory.addChildren)) {//添加子节点
            data.pid = dictionaryCategory.id;
        } else {//添加兄弟节点
            data.pid = dictionaryCategory.pid;
        }

        let body = JSON.stringify(data);
        let headers = new Headers({ 'Content-Type': 'application/json' });
        let options = new RequestOptions({ headers: headers });
        return this.http.post(this.dictionaryCategoryUrl_V1, body, options)
            .toPromise()
            .then(this.extractJson)
            .catch(this.handleError);
    }

    /**
     * 字典数据添加
     * 
     * @author songjy
     * 
     * @param DictionaryData 字典数据信息
     */
    dictionaryDataAdd(dictionaryData: any) {
        let data: any = {
            "categoryCode": dictionaryData.categoryCode,
            "code": dictionaryData.code,
            "dictValue": dictionaryData.dictValue,
            "systemReserved": dictionaryData.systemReserved,
            "remark": dictionaryData.remark,
            "pcode": dictionaryData.pcode,
            "dictionaryExtendDtos": dictionaryData.dictionaryExtends,
            "addChildren": dictionaryData.addChildren
        }

        if ((true == dictionaryData.addChildren) || ('true' == dictionaryData.addChildren)) {//添加子节点
            data.pcode = dictionaryData.oldCode;
        }

        let body = JSON.stringify(data);
        let headers = new Headers({ 'Content-Type': 'application/json' });
        let options = new RequestOptions({ headers: headers });
        return this.http.post(this.dictionaryDataUrl, body, options)
            .toPromise()
            .then(this.extractJsonDictionary)
            .catch(this.handleError);

    }

    /**
     * 字典分类修改
     * 
     * @author songjy
     * 
     * @param DictionaryCategory 字典分类信息
     */
    dictionaryCategoryModify(dictionaryCategory: any): Promise<any> {
        let data = {
            "id": dictionaryCategory.id,
            "code": dictionaryCategory.code,
            "oldCode": dictionaryCategory.oldCode,
            "name": dictionaryCategory.name,
            "remark": dictionaryCategory.remark
        }

        let body = JSON.stringify(data);
        let headers = new Headers({ 'Content-Type': 'application/json' });
        let options = new RequestOptions({ headers: headers });
        return this.http.put(this.dictionaryCategoryUrl_V1, body, options)
            .toPromise()
            .then(this.extractJson)
            .catch(this.handleError);
    }

    /**
     * 字典数据修改
     * 
     * @author songjy
     * 
     * @param DictionaryCategory 字典分类信息
     */
    dictionaryDataModify(dictionaryData: any): Promise<any> {
        let data: any = {
            "categoryCode": dictionaryData.categoryCode,
            "code": dictionaryData.code,
            "oldCode": dictionaryData.code,
            "dictValue": dictionaryData.dictValue,
            "systemReserved": dictionaryData.systemReserved,
            "remark": dictionaryData.remark,
            "pcode": dictionaryData.pcode,
            "dictionaryExtendDtos": dictionaryData.dictionaryExtends
        }

        let body = JSON.stringify(data);
        let headers = new Headers({ 'Content-Type': 'application/json' });
        let options = new RequestOptions({ headers: headers });
        return this.http.put(this.dictionaryDataUrl, body, options)
            .toPromise()
            .then(this.extractJsonDictionary)
            .catch(this.handleError);
    }

    /**
     * 字典分类删除--根据主键删除
     * 
     * @author songjy
     * 
     * @param DictionaryCategory 字典分类信息
     */
    dictionaryCategoryDelete(dictionaryCategory: any): Promise<any> {
        let url = this.dictionaryCategoryUrl_V1 + '?code=' + dictionaryCategory.code;
        return this.http.delete(url)
            .toPromise()
            .then(this.extractJson)
            .catch(this.handleError);
    }

    /**
     * 字典数据删除--根据联合主键删除
     * 
     * @author songjy
     * 
     */
    dictionaryDataDelete(dictionaryData: any) {
        let url = this.dictionaryDataUrl + '?code=' + dictionaryData.code + '&categoryCode=' + dictionaryData.categoryCode;
        return this.http.delete(url)
            .toPromise()
            .then(this.extractJsonDictionary)
            .catch(this.handleError);
    }

    /**
     * 获取所有的字典分类树ROOT节点
     * 
     * @author songjy
     */
    findDictionaryCategory(): Promise<any[]> {

        return this.http.get(this.dictionaryCategoryUrl_V1)
            .toPromise()
            .then(this.extractData)
            .catch(this.handleError);
    };

    /**
     * 根据父节点查询其所有的字典分类子节点
     * 
     * @author songjy
     * 
     * @param node 父节点信息
     */
    getDictionaryCategoryChildrenByPid(node: any): Promise<any[]> {
        let tempUrl = this.dictionaryCategoryUrl_V1;

        if (node.id) {
            tempUrl += '?pid=' + node.id;
        } else {
            return;
        }

        return this.http.get(tempUrl)
            .toPromise()
            .then(this.extractData)
            .catch(this.handleError);
    }

    /**
     * 根据字典分类名称查询字典分类树
     * 
     * @author songjy
     * 
     * @param name 字典分类名称，模糊匹配
     */
    searchDictionaryCategoryByName(name: string) {
        let tempUrl = this.dictionaryCategoryUrl_V1;

        if (name) {
            tempUrl += '?name=' + name;
        }

        return this.http.get(tempUrl)
            .toPromise()
            .then(this.extractDataDictionary)
            .catch(this.handleError);
    }

    getChildrenByNode(node: any): Promise<any[]> {
        let tempUrl: string;
        if (!(node.pcode === undefined)) {
            tempUrl = this.dictionaryDataUrl + '?categoryCode=' + node.categoryCode + "&pcode=" + node.code;
        } else {
            tempUrl = this.dictionaryDataUrl + '?categoryCode=' + node.code;
        }
        return this.http.get(tempUrl)
            .toPromise()
            .then(this.extractDataDictionary)
            .catch(this.handleError);
    }

    getChildrenByCode(categoryCode: string) {
        let tempUrl: string;
        tempUrl = this.dictionaryDataUrl + '?categoryCode=' + categoryCode;
        return this.http.get(tempUrl)
            .toPromise()
            .then(this.extractDataDictionary)
            .catch(this.handleError);
    }

    searchByValue(categoryCode: string, dictValue: string): Promise<any> {

        if (categoryCode) {//字典分类代码必传

            let tempUrl = this.dictionaryDataUrl;
            tempUrl += '?categoryCode=' + categoryCode;

            if (dictValue) {
                tempUrl += "&dictValue=" + dictValue;
            }

            return this.http.get(tempUrl)
                .toPromise()
                .then(res => {
                    if (res.status < 200 || res.status >= 300) {
                        throw new Error('Bad response status: ' + res.status);
                    }
                    let body = res.json().data;
                    if(!this.isEmptyObject(body))
                        body = getExpand(body);
                    return body;
                })
                .catch(this.handleError);
        }

    }

    getNodyByCategory(categoryCode: string): Promise<any> {

        if (categoryCode) {//字典分类代码必传

            let tempUrl = this.dictionaryDataUrl;
            tempUrl += '?categoryCode=' + categoryCode;

            return this.http.get(tempUrl)
                .toPromise()
                .then(this.extractData)
                .catch(this.handleError);
        }

    }

    getNodeByCode(categoryCode: string, code: string) {
        let tempUrl = this.dictionaryDataUrl + "/" + categoryCode + "/" + code;
        return this.http.get(tempUrl)
            .toPromise()
            .then(this.extractDataDictionary)
            .catch(this.handleError);
    }

    //遍历判断是否是子或者是本身
    //
    // @Param  rootCode:根的code
    //         node：子数据
    //         categoryCode:分类
    // @resule boolean  
    // 
    // eg： categoryCode="sys_dictcate_gytj"
    //      rootCode="消化道全身给药"
    //      node.code="口服"
    //      result : true
    isChildren(node: any, rootCode: string): boolean {
        if ((rootCode === node.code) || (rootCode === node.pcode)) {
            return true;
        }
        else {
            if (!node.pcode) {
                return false;
            }
            this.getChildrenByNode(node)
                .then(nodedata => {
                    this.isChildren(nodedata, rootCode);
                }, error => this.error = <any>error
                );
        }
        return false;
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

    private extractDataDictionary(res: Response) {
        if (res.status < 200 || res.status >= 300) {
            throw new Error('Bad response status: ' + res.status);
        }
        let body = res.json();
        if (body.data instanceof Array) {
            for (let index = 0; index < body.data.length; index++) {
                body.data[index].uuid = uuid();
            }
        }
        return body.data || {};
    }
    private extractJsonDictionary(res: Response) {
        if (res.status < 200 || res.status >= 300) {
            throw new Error('Bad response status: ' + res.status);
        }
        let body = res.json();
        if (body.data instanceof Array) {
            for (let index = 0; index < body.data.length; index++) {
                body.data[index].uuid = uuid();
            }
        }
        return body || {};
    }

    private handleError(error: any) {
        console.error('An error occurred', error);
        return Promise.reject(error.message || error);
    }

    isEmptyObject(obj: any): boolean {
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

function getExpand(arr: any[]): any[] {
    if (arr.length == 0 || !arr) {
        return;
    }
    for (let i = 0; i < arr.length; i++) {
        if(arr[i].hasChildren && arr[i].children != null){
            arr[i].isExpanded = true;
            arr[i].uuid = uuid();
        }            
        if (arr[i].children) getExpand(arr[i].children);
    }
    return arr;
}