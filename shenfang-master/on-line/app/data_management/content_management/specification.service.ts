import {Injectable}     from '@angular/core';
import {Http, Response} from '@angular/http';
import {Headers, RequestOptions} from '@angular/http';
import {InterceptorService } from 'ng2-interceptors';
@Injectable()
export class SpecificationService{
    constructor(
        private http: InterceptorService) { }


    instructionURL = '/api/v1/instruction';                 //修改接口
    examineInstructionURL = '/api/v1/auditInstruction';     //审核接口
    instuctionImg = '/api/v1/getOrgList';               //获取该说明书下的说明书原件图片  typeId：说明书id;  uploadType = instruction(当前组件下为固定说明书类型)
    drugSuggestionURL = "/api/v1/drugSuggestion";

    public getDrugSuggestionURL() : string {
        return this.drugSuggestionURL;
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


    checkProduct(id:string, instructionId: string){
        let tempUrl = "/api/v1/checkProduct" + "?productId=" + id +"&instructionId=" + instructionId;
        return this.http.get(tempUrl)
            .toPromise()
            .then(this.extractJson)
            .catch(this.handleError);
    }
    getInstruction(id:string){
        let tempUrl = this.instructionURL + "?id=" + id;
        return this.http.get(tempUrl)
            .toPromise()
            .then(this.extractData)
            .catch(this.handleError);
    }
    deleteInstruction(id: string){
        let tempUrl = this.instructionURL + "?id=" + id;
        return this.http.delete(tempUrl)
            .toPromise()
            .then(this.extractJson)
            .catch(this.handleError);
    }
    getInstructionSpacInfo(instructionId:string,optHis:string){
        let tempUrl = "/api/v1/instructionspacs";
        if(optHis){
            tempUrl = tempUrl + "?optHis=" + optHis;
        }
        if(instructionId){
            tempUrl = tempUrl + "&instructionId=" + instructionId;
        }
        
        console.dirxml(tempUrl);
        let headers = new Headers({ 'Content-Type': 'application/json' });
        let options = new RequestOptions({ headers: headers });
        return this.http.get(tempUrl, options)
            .toPromise()
            .then(this.extractData)
            .catch(this.handleError);
        
    }

    saveInstruction(instructionDto: any, type: string) {
        let tempUrl = this.instructionURL;
        let data = instructionDto;
        if(type == "add"){
            return this.http.post(tempUrl, data)
            .toPromise()
            .then(this.extractJson)
            .catch(this.handleError);
        }else{
            return this.http.put(tempUrl, data)
            .toPromise()
            .then(this.extractJson)
            .catch(this.handleError);
        }
        
    }

    examineInstruction(data: any){
        let tempUrl = this.examineInstructionURL;
        return this.http.put(tempUrl, data)
            .toPromise()
            .then(this.extractJson)
            .catch(this.handleError);

    }

    updateInstruction(instructionDto: any): Promise<any[]> {
        let tempUrl = this.instructionURL;
        let data = instructionDto;
        let body = JSON.stringify(data);
        let headers = new Headers({ 'Content-Type': 'application/json' });
        let options = new RequestOptions({ headers: headers });
        return this.http.put(tempUrl, body, options)
            .toPromise()
            .then(this.extractData)
            .catch(this.handleError);
    }

    /**
     * 获取该说明书下的说明书原件图片
     */
    getInstructionImg(typeId: string){
        let tempUrl = this.instuctionImg + "?typeId=" + typeId + "&uploadType=instruction";
        return this.http.get(tempUrl)
            .toPromise()
            .then(this.extractJson)
            .catch(this.handleError);
    }
}