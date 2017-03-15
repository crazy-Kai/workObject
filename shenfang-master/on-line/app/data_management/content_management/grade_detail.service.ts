import {Injectable}     from '@angular/core';
import {Http, Response} from '@angular/http';
import {Headers, RequestOptions} from '@angular/http';

@Injectable()
export class GradeDetailService {
    literatureType:string;
    docInfo: any={};
}