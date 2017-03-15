import { Injectable } from '@angular/core';
import { Response, Headers, RequestOptions } from '@angular/http';
import { InterceptorService } from 'ng2-interceptors';

@Injectable()
export class HospitalService {

    constructor(
        private http: InterceptorService) { }

    hospitalUrl = '/api/v1/hospital';//获取医院列表
    hospitalStatusListUrl = 'api/v1/hospitalStatusList';//获取医院状态列表
    dictionaryTreeChooseUrl = '/api/v1/dictionaryTreeChoose?categoryCode=sys_gy_phase';//获取干预阶段
    contacterUrl = '/api/v1/hospitalConnector';//医院联系人
    hospitalLicenseUrl = 'api/v1/hospitalLicense';//系统激活码
    hospitalZoneLicenseUrl = 'api/v1/hospitalZoneLicense';//系统激活码
    regionTreeUrl = '/api/v1/regionTree';//区域树
    systemMenuTreeUrl = '/api/v1/hospResource';//系统菜单树
    hospitalSuggestionUrl = '/api/v1/hospitalSuggestion';

    /**** Begin 医院管理  */
    public getHospitalSuggestionURL() : string {
        return this.hospitalSuggestionUrl;
    }


    /** *获取医院管理列表 @parameter hospitalId*/
    getHosp(hospitalId: number): Promise<any> {
        let tempUrl = this.hospitalUrl + '?hospitalId=' + hospitalId;
        return this.http.get(tempUrl)
            .toPromise()
            .then(this.extractJson)
            .catch(this.handleError);
    };

    /** *医院管理列表 删除医院 @parameter hospitalId*/
    deleteHosp(hospitalId: number): Promise<any> {
        let tempUrl = this.hospitalUrl + '?hospitalId=' + hospitalId;
        return this.http.delete(tempUrl)
            .toPromise()
            .then(this.extractJson)
            .catch(this.handleError);
    };

    /** *获取医院状态列表*/
    getHospitalStatusList(): Promise<any> {
        return this.http.get(this.hospitalStatusListUrl)
            .toPromise()
            .then(this.extractJson)
            .catch(this.handleError);
    }
    /** End 医院管理 */

    /****Begin 干预 */

    /** *获取干预阶段 
     *   @parameter codes 以逗号区分code
     *   @return    返回codes对应的干预阶段节点cheacked为true，其余为false
     */
    getGyPhase(codes?: string): Promise<any> {
        let tempUrl = this.dictionaryTreeChooseUrl
        if (codes)
            tempUrl += '&codes=' + codes;
        return this.http.get(tempUrl)
            .toPromise()
            .then(this.extractJson)
            .catch(this.handleError);
    }
    /****End 干预 */

    /** Begin 客户医院管理*/

    /** *保存（新增）客户医院管理 
     *   @parameter data：any
     *   required ：data.code 机构编码
     *              data.name 机构名称
     *              data.legalRepresent 法定代表人
     *              data.regionId 区域ID
     *              data.zonesNum 院区数量
     * */
    postHosp(data: any): Promise<any> {
        let body = JSON.stringify(data);
        let headers = new Headers({ 'Content-Type': 'application/json' });
        let options = new RequestOptions({ headers: headers });
        return this.http.post(this.hospitalUrl, body, options)
            .toPromise()
            .then(this.extractJson)
            .catch(this.handleError);
    }

    /** *保存（修改）客户医院管理 
     *   @parameter data：any
     *   required ：data.id 医院Id
     *              data.code 机构编码
     *              data.name 机构名称
     *              data.legalRepresent 法定代表人
     *              data.regionId 区域ID
     *              data.zonesNum 院区数量
     * */
    putHosp(data: any): Promise<any> {
        let body = JSON.stringify(data);
        let headers = new Headers({ 'Content-Type': 'application/json' });
        let options = new RequestOptions({ headers: headers });
        return this.http.put(this.hospitalUrl, body, options)
            .toPromise()
            .then(this.extractJson)
            .catch(this.handleError);
    }
    /** End 客户医院管理 */

    /** * Begin 联系人管理*/

    /** *新增联系人 
     *   @parameter data：any
     *   required ：data.name 名字
     *              data.depart 科室
     *              data.phone 电话
     * */
    postContacter(data: any): Promise<any> {
        let body = JSON.stringify(data);
        let headers = new Headers({ 'Content-Type': 'application/json' });
        let options = new RequestOptions({ headers: headers });
        return this.http.post(this.contacterUrl, body, options)
            .toPromise()
            .then(this.extractJson)
            .catch(this.handleError);
    }

    /** *新增联系人 
     *   @parameter data：any
     *   required ：data.id 联系人ID
     *              data.name 名字
     *              data.depart 科室
     *              data.phone 电话
     * */
    putContacter(data: any): Promise<any> {
        let body = JSON.stringify(data);
        let headers = new Headers({ 'Content-Type': 'application/json' });
        let options = new RequestOptions({ headers: headers });
        return this.http.put(this.contacterUrl, body, options)
            .toPromise()
            .then(this.extractJson)
            .catch(this.handleError);
    }

    /** *删除联系人  @parameter id 联系人Id*/
    deleteContacter(id: number) {
        let tempUrl = this.contacterUrl + '?id=' + id;
        return this.http.delete(tempUrl)
            .toPromise()
            .then(this.extractJson)
            .catch(this.handleError);
    }
    /** End 客户医院管理 */

    /****Begin 区域 */

    /*** 获取区域树 */
    getRegionTree() {
        return this.http.get(this.regionTreeUrl)
            .toPromise()
            .then(response => {
                if (response.status < 200 || response.status >= 300) {
                    throw new Error('Bad response status: ' + response.status);
                }
                let body = response.json();
                body.data = this.setEmptyChildren(body.data);
                return body;
            })
            .catch(this.handleError);
    }

    getRegionTreeChildren(pcode: string) {
        let tempUrl = this.regionTreeUrl + '?pcode=' + pcode;
        return this.http.get(tempUrl)
            .toPromise()
            .then(response => {
                if (response.status < 200 || response.status >= 300) {
                    throw new Error('Bad response status: ' + response.status);
                }
                let body = response.json();
                body.data = this.setEmptyChildren(body.data);
                return body.data;
            })
            .catch(this.handleError);
    }
    /****End 区域 */

    /****Begin 系统激活码 */

    /** *保存（新增）系统激活码 
     *   @parameter data：any ,hospitalId 医院id
     *   required ：hospitalId 医院id
     *              data.serverCode 机器码
     *              data.licenseType 授权类型
     *              data.deadTime 到期时间
     * */
    postSysActivationCode(data: any, hospitalId: number): Promise<any> {
        data.hospitalId = hospitalId;
        let body = JSON.stringify(data);
        let headers = new Headers({ 'Content-Type': 'application/json' });
        let options = new RequestOptions({ headers: headers });
        return this.http.post(this.hospitalLicenseUrl, body, options)
            .toPromise()
            .then(this.extractJson)
            .catch(this.handleError);
    }

    /** *删除系统激活码  @parameter id 系统激活码Id*/
    deleteSysActivationCode(id: number) {
        let tempUrl = this.hospitalLicenseUrl + '?id=' + id;
        return this.http.delete(tempUrl)
            .toPromise()
            .then(this.extractJson)
            .catch(this.handleError);
    }
    /****End 系统激活码 */

    /****Begin 院区激活码 */

    /** *保存（新增）院区激活码 
     *   @parameter data：any,hospitalId 医院id
     *   required ：data.hospitalId 医院id
     *              data.serverCode 机器码
     *              data.licenseType 授权类型
     *              data.deadTime 到期时间
     * */
    postZoneActivationCode(data: any, hospitalId: any): Promise<any> {
        data.hospitalId = hospitalId;
        let body = JSON.stringify(data);
        let headers = new Headers({ 'Content-Type': 'application/json' });
        let options = new RequestOptions({ headers: headers });
        return this.http.post(this.hospitalZoneLicenseUrl, body, options)
            .toPromise()
            .then(this.extractJson)
            .catch(this.handleError);
    }

    /** *保存（修改）院区激活码 
     *   @parameter data：any,hospitalId 医院id
     *   required ：hospitalId 医院id
     *              data.serverCode 机器码
     *              data.licenseType 授权类型
     *              data.zoneName 院区名称
     * */
    putZoneActivationCode(data: any, hospitalId: number): Promise<any> {
        data.hospitalId = hospitalId;
        let body = JSON.stringify(data);
        let headers = new Headers({ 'Content-Type': 'application/json' });
        let options = new RequestOptions({ headers: headers });
        return this.http.put(this.hospitalZoneLicenseUrl, body, options)
            .toPromise()
            .then(this.extractJson)
            .catch(this.handleError);
    }


    /** *删除院区激活码  @parameter id 院区激活码Id*/
    deleteZoneActivationCode(id: number) {
        let tempUrl = this.hospitalZoneLicenseUrl + '?id=' + id;
        return this.http.delete(tempUrl)
            .toPromise()
            .then(this.extractJson)
            .catch(this.handleError);
    }
    /****End 院区激活码 */

    /****获取系统菜单 */
    getSystemMenu(supportType: number, allDictShare:number, allProductShare:number) {
        let tempUrl = this.systemMenuTreeUrl + '?hospSysType=4&supportType=' + supportType
                        + '&allDictShare=' + allDictShare + '&allProductShare=' + allProductShare;
        return this.http.get(tempUrl)
            .toPromise()
            .then(this.extractJson)
            .catch(this.handleError);
    }
    /*** End 系统菜单操作 */


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

    setEmptyChildren(treenodes: any[]) {
        if ( !treenodes || !treenodes.length ) {
            //修复bug: treenodes为空的情况
            return treenodes;
        }

        for (let i = 0; i < treenodes.length; i++) {
            if (treenodes[i].children.length == 0)
                treenodes[i].children = null;
        }
        return treenodes;
    }

}