/***
 * 存放搜索条件，使之离开后仍存在
 */
import { Injectable } from '@angular/core';

@Injectable()
export class SearchService {

    // 资料管理

    // 内容管理
    /****** 资料评分
     *  dataGrade为前缀
     *  -dataGradeDocName 期刊名称
        -dataGradeScoreType 资料类型
        -dataGradeGraders0 审核人
        -dataGradeGraders1 1号评分人
        -dataGradeGraders2 2号评分人
        -dataGradeUserCreate 添加人
     */
    dataGradeDocName: string;
    dataGradeScoreType: string;
    dataGradeGraders0: string;
    dataGradeGraders1: string;
    dataGradeGraders2: string;
    dataGradeUserCreate: string;
    dataScoreStatus:string;

    //规则管理
    /*** 疾病分类管理
     * diseaseCategoryName 分类名称
     * diseaseCategoryCode 分类编号
     */
    diseaseCategoryName:string;
    diseaseCategoryCode:string

    //客户管理
    /**
     * 医院管理
     * hospName
     */
    hospName:string;
    hospCurrentStatus:string;
    hospRegionId:string;
    hospTechPerson:string;
    hospBusinessPerson:string;
}

