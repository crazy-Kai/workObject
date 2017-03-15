import { Injectable } from '@angular/core';
import {Http, Response} from '@angular/http';
import {Headers, RequestOptions} from '@angular/http';
import {InterceptorService } from 'ng2-interceptors';

@Injectable()
export class DrugMatchService {

    constructor(
        private http: InterceptorService) { }

    
    /**
     * APIs
     */
    getPwDetailAPI = 'api/v1/pwDrugMatch?pwDrugMatchId=';    //药品配伍 => 根据id获取药品配伍信息
    editDrugMatchAPI = 'api/v1/pwDrugMatch'                  //药品配伍 => 药品配伍接口 POST: 新增; PUT: 修改; DELETE: 删除;

    getPwDicsAPI = 'api/v1/pwMessageList';                   //配伍字典 => 获取配伍字典信息列表
    modifyPwDicAPI= 'api/v1/pwMessage';                      //配伍字典 => 配伍字典接口 GET: 根据ID获取配伍字典信息  PUT: 修改配伍字典信息
    
    drugCategoryAPI = "/api/v1/drugTree?drugId=";            //药品树接口

    /**
     * 配伍字典操作
     */
    //根据id获取配伍信息
    getPwDicById(id: string){
        let tempUrl = this.modifyPwDicAPI + "?pwMessageId=" + id;
        return this.http.get(tempUrl)
            .toPromise()
            .then(this.extractJson)
            .catch(this.handleError);
    }
    modifyPwDic(data: any){
        return this.http.put(this.modifyPwDicAPI, data)
            .toPromise()
            .then(this.extractJson)
            .catch(this.handleError)
    }

    /**
     * 药品配伍信息操作
     * --delDrugMatch：删除
     * --addDrugMatch: 新增
     * --modifyDrugMatch: 修改
     * 
     * @params id：配伍信息id
     */
    //根据id获取配伍信息
    getPwInfoById(id: string){
        let tempUrl = this.getPwDetailAPI + id;
        return this.http.get(tempUrl)
            .toPromise()
            .then(this.extractJson)
            .catch(this.handleError);
    }
    //获取配伍字典列表信息
    getPwList(){
        return this.http.get(this.getPwDicsAPI)
            .toPromise()
            .then(this.extractJson)
            .catch(this.handleError);
    }
    //删除一条药品配伍信息
    delDrugMatch(id: string){
        let tempUrl = this.editDrugMatchAPI + "?pwDrugMatchId=" + id;
        return this.http.delete(tempUrl)
            .toPromise()
            .then(this.extractJson)
            .catch(this.handleError);
    }
    //新增一条药品配伍信息
    addDrugMatch(data: any){
        return this.http.post(this.editDrugMatchAPI, data)
            .toPromise()
            .then(this.extractJson)
            .catch(this.handleError);
    }
    //修改一条药品配伍信息
    modifyDrugMatch(data: any){
        return this.http.put(this.editDrugMatchAPI, data)
            .toPromise()
            .then(this.extractJson)
            .catch(this.handleError);
    }
    
    /**
     * 药品tree
     * 获取药品列表   搜索药品列表
     */
    getCategory(id?: any){
        let tempUrl = this.drugCategoryAPI + id;
        return this.http.get(tempUrl)
            .toPromise()
            .then(this.extractJson)
            .catch(this.handleError);
    }
    //获取药品子分类
    getChildrenCategory(node: string){
        let tempUrl = this.drugCategoryAPI + node;
        return this.http.get(tempUrl)
            .toPromise()
            .then(this.extractData)
            .catch(this.handleError);
    }
    //获取搜索药品
    getByValue(str: string){
        let tempUrl: string;
        if(!str)
            tempUrl = "/api/v1/drugTree?drugId=0013921000"
        else
            tempUrl = "/api/v1/drugTree/" + str + "?notClearChildren=true&root=001";
            
        return this.http.get(tempUrl)
            .toPromise()
            .then(this.extractJson)
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