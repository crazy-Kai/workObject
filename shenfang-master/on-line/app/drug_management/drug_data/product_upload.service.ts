import { Injectable } from '@angular/core';
import {Http, Response} from '@angular/http';
import {Headers, RequestOptions} from '@angular/http';
import {InterceptorService } from 'ng2-interceptors';
import {Observable} from 'rxjs/Rx';
class FileInfo {
    id: string;
    fileName: string;
    fileVersion: any;
    filePath: string;
}

@Injectable()
export class ProductUploadService {
    hasProgress = false;
    message: string;
    // fileList: FileInfo[] = [];
    fileMessage:string='';
    progress: number;
    constructor(
        private http: InterceptorService) { }

    productImportUrl = "/api/v1/productImport";

    makeFileRequest(file: File) {
        let formData: FormData = new FormData(),
            xhr: XMLHttpRequest = new XMLHttpRequest(),
            fileData: FileInfo = new FileInfo();
        fileData.fileName = file.name;
        // this.fileList.push(fileData);
        formData.append("uploadFile", file);
        // formData.append("fileName", fileData.fileName);
        xhr.onreadystatechange = () => {
            if (xhr.readyState === 4) {
                if (xhr.status === 200) {
                    // observer.next(JSON.parse(xhr.response));
                    // observer.complete();
                    let body = JSON.parse(xhr.response);
                    if (body.code != 200) { 
                        this.message = body.message;
                        setTimeout(()=>{this.message=''},1000); 
                    }
                    else {
                        fileData = body.data;
                        // this.fileList[this.fileList.length - 1] = fileData;
                        this.fileMessage += body.message;
                    }
                    this.hasProgress = false;
                } else {
                    // observer.error(xhr.response);
                }
            }
        };
        // xhr.upload.onprogress = (event) => {
        //     this.progress = Math.round(event.loaded / event.total * 100);
        //     // this.progressObserver.next(this.progress);
        // };
        xhr.open('POST', this.productImportUrl, true);
        xhr.send(formData);
    }

    // deleteOrg(index: number): Promise<any> {
    //     let tempUrl = this.deleteOrgUrl + "?filePath=" + this.fileList[index].filePath + "&id=" + this.fileList[index].id;
    //     return this.http.delete(tempUrl)
    //         .toPromise()
    //         .then(this.extractData)
    //         .catch(this.handleError);
    // }

    // downloadFile(index: number): Promise<any> {
    //     let tempUrl = this.downloadUrl + "?fileName=" + this.fileList[index].fileName + "&filePath=" + this.fileList[index].filePath;
    //     return this.http.get(tempUrl)
    //         .toPromise()
    //         .then(this.extractData)
    //         .catch(this.handleError);
    // }
    deleteProducts(){
        return this.http.delete(this.productImportUrl)
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