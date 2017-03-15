import { Injectable } from '@angular/core';

@Injectable()
export class UrlService {
    _url: string;
    _params:any;

    setUrl({url}:any){
        this._url = url;
        this._params = this.getResponses();
    }

    get params() { 
        return this._params;
    };

    //传入id=1?option=true,返回{option:true}
    getResponses(): any {
        let paramsList: string[];
        let params = new Object();
        let index = this._url.indexOf('?');
        if (index === -1) {
            return;
        }
        this._url = this._url.substring(++index, this._url.length);
        paramsList = this._url.split('&');
        for (let i = 0; i < paramsList.length; i++) {
            let values = paramsList[i].split("=");
            params[values[0]] = values[1];
        }
        return params;
    }

}