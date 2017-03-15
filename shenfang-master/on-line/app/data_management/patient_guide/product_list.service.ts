import {Injectable}     from '@angular/core';
import {Http, Response} from '@angular/http';
import {Headers, RequestOptions} from '@angular/http';
import {InterceptorService } from 'ng2-interceptors';
import {DrugGuideListDto} from './drug_guide.component';
import {patientGuideInfoDto} from './guide_detail';
class productDto{
    pageBreakerDto:any;
    productDtoList:patientGuideInfoDto;
}

@Injectable()
export class ProductService {
    drugGroup: {};
    // nodeName:string;
    error: string;

    constructor(
        private http: InterceptorService) { }

    productInfoUrl = '/api/v1/productList';  // URL to web API

//传一个参数时表示查询该productName，传入两个参数表示分页查询 
    getProductInfo(arg1?:any,arg2?:any):Promise<productDto> {
        let tempUrl = this.productInfoUrl;
        if(arg1)
            tempUrl = this.productInfoUrl + "?productName=" + arg1 ;
        if(arg1 && arg2)
            tempUrl = this.productInfoUrl +"?numPerPage=" + arg1 +"&pageNum="+arg2;
        return this.http.get(tempUrl)
            .toPromise()
            .then(this.extractData)        
            .catch(this.handleError);
    };

    searchProduct(productName?:string,producerName?:string,numPerPage?:number,pageNum?:number):Promise<productDto>{
        let tempUrl = this.productInfoUrl + "?";
        if(producerName){
            tempUrl += 'producerName=' + producerName;
            if(producerName){
                tempUrl += '&productName=' + productName;
            }
        }else tempUrl += 'productName=' + productName;
        if(numPerPage&&pageNum)
            tempUrl += "&numPerPage=" + numPerPage +"&pageNum="+pageNum;
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