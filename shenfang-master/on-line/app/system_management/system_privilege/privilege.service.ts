// 获取资料分类树服务

import { Injectable}     from '@angular/core';
import { Http, Response} from '@angular/http';
import { Headers, RequestOptions} from '@angular/http';
import { InterceptorService } from 'ng2-interceptors';

@Injectable()
export class  PrivilegeService {
    dataGroup: {};
    error: string;

    constructor(
        private http: InterceptorService) { }
    
    /**
     * 添加，修改用户
     * 添加 post   修改  put
     */
    userInfoAPI = '/api/v1/authUser';
    injectDrugsAPI = 'api/v1/drugUser';
    add(data: any){
        return this.http.post(this.userInfoAPI, data)
            .toPromise()
            .then(this.extractJson)
            .catch(this.handleError);
    }
    update(data: any){
        return this.http.put(this.userInfoAPI, data)
            .toPromise()
            .then(this.extractJson)
            .catch(this.handleError);
    }
    //注入关联药品
	injectDrugs(type:string, data: any) {
        let tempUrl = this.injectDrugsAPI;
        if (type == "add") {
            return this.http.post(tempUrl, data)
                .toPromise()
                .then(this.extractJson)
                .catch(this.handleError);
        } else if (type == "edit") {
            return this.http.put(tempUrl, data)
                .toPromise()
                .then(this.extractJson)
                .catch(this.handleError);
        }
	}
    /**
     * 关联药品相关
     * 
     */
    drugCategoryAPI = "/api/v1/drugTree?drugId=";
    drugUser = "/api/v1/drugUser?userId=";
    //获取用户关联的药品
    getDrugUser(id: string):Promise<any>{
        let tempUrl = this.drugUser + id;
        return this.http.get(tempUrl)
            .toPromise()
            .then(this.extractJson)
            .catch(this.handleError);
    }
    //获取药品分类
    getCategory(){
        let tempUrl = this.drugCategoryAPI;
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
        let tempUrl = "/api/v1/drugTree/" + str + "?notClearChildren=true";
        return this.http.get(tempUrl)
            .toPromise()
            .then(this.extractJson)
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
