/**
 * /**
 *  @author: anwen
 *  @Description:TODO(药品/产品相关指导数据结构维护)     
 *  @date：Created on 2016/7/14.
 */

//主表
export class PatientDrugGuideDto {
    constructor(
        public id: string,
        public applyType: number,
        public drugId: string,
        status:string,
        unitCode: string,
        public takeMethod: string
    ) { }
}
export class PatientProductGuideDto {
    constructor(
        public id: string,
        public applyType: number,
        public productId: string,
        status:string,
        unitCode: string,
        public takeMethod: string
    ) { }
}

export class PatientDrugDescriptionDtoList {
    constructor(
        public property: string = "",
        public value: string = ""
    ) { }
}

//描述表
export class Des {
    drugDes: string;
    forbiddenUseDrugDes: string;
    recentSituation: string;
    useMethod: string;
    missTakeDeal: string;
    attention: string;
    otherEffect: string;
    cenditionChange: string;
    childrenAttention: string;
    getGestationAttention: string;
    gestationAttention: string;
    athleteAttention: string;
    lactationAttention: string;
    operationAttention: string;
    heredityAttention: string;
    otherAttention: string;
}
//副作用表
export class PatientDrugEffectDto {
    level: string;
    symptom: string;
    solution: string;
}
//会影响本药的药物
export class PatientDrugInfluenceDto {
    constructor(
        drugCategory: string = "",
        drugNames: string = ""
    ) { }
}

//储藏方法
export class PatientDrugStorageDto {
    startTemperature: number;
    endTemperature: number;
    temperature:string;
    container: string;
    light: string;
    humidity: string;
    environment: string;
    life: number;
    comment: string;
    id: string;
}
//给药时间
/**
 * takeTiming:给药时机
 * takeTimes：给药频率
 */
export class PatientDrugUsetimeDto {
    constructor(
        takeTiming: string,
        takeFrequencyArr: string[],
        drugGuideId: string
    ) { }
}
export class FreqItem {
    id: any;
    takeTimes: string;
    takeFrequencyArr: string[]=[];
    takeTiming: string;
    type:string;
    isDisabled:boolean;
}
export class OccaItem {
    id:number;
    freqs: FreqItem[] = [];
    takeTiming: string;
    options:any[];
}
//总体表
export class GuideDetail {
    
    constructor(
        public patientDrugGuideDto: any,
        public patientDrugDescriptionDtoList: PatientDrugDescriptionDtoList[],
        public patientDrugEffectDto: PatientDrugEffectDto[],
        public patientDrugInfluenceDto: PatientDrugInfluenceDto[],
        public patientDrugStorageDto: PatientDrugStorageDto,
        public patientDrugUseTime: FreqItem[]
    ) { }
}
export class patientGuideInfoDto {
        public patientDrugGuideDto: any;
        public patientDrugDescriptionDtoList: PatientDrugDescriptionDtoList[];
        public patientDrugEffectDtoList: PatientDrugEffectDto[];
        public patientDrugInfluenceDtoList: PatientDrugInfluenceDto[];
        public patientDrugStorageDto: PatientDrugStorageDto;
        public patientDrugUsetimeDtoList: FreqItem[];
        public updatedBy:string;
}
export class ProductGuideList {
	productId: string;
    productName: string;
    createdBy: string;
    createdTime: string;
    status: number;
    auditBy: string;
    auditTime: string;
}