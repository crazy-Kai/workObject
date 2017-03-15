export class ProductDto {
    id: string;
    chineseproductname: string;
    maincontentname: string;
    chinesemedname: string;
    enmaincontentname: string;
    drugcategoryname: string;
    goodsname: string;
    dictformulation: string;
    formulation: string;
    chinesespecification: string;
    transspecification: string;
    convertpercent: number;
    prepunit: string;
    packageunit: string;
    packagespec: string;
    enspecunit: string;
    cnspecunit: string;
    specquantity: number;
    packagematerial: string;
    chinesemanufacturename: string;
    registerno: string;
    standardcode: string;
    productcategory: string;
    productcode: string;
    elementcode: string;
    formulacode: string;
    speccode: string;
    medcode: string;
    medicinecode: string;
    ddd: number;
    dddunit: string;
    remark: string;
    pinyin: string;
    status: number;
    createuser: string;
    createdate: string;
    modifyuser: string;
    modifydate: string;
    imgpath: string;
    datasource: string;
    uploadid: string;
    pharmacokineticsDtos: PharmacokineticsDto[];
}

export class PharmacokineticsDto {
    id: number;
    property: string;
    value: string;
    applyType: number;
    referenceId: string;
}

export class ProductInfoDetail {
    constructor(
        public productDto: ProductDto,
        public pharmacokineticsDtos: PharmacokineticsDto[],
        public drugList: string[],
        public chooseDictCodes: string,
        public chooseDictName: string,
        public drugPropertys: string,
        public productDictformulation: string,
        public chooseRouteCodes: string,
        public chooseRouteName: string,
        public flmcId: string
    ) { }
}

export class PharData {
    constructor(
        value: string = '',
        id: number = null
    ) { }
}

export class Pharmacokinetics {
    atrioventricularModel: PharData;
    plasmaProteinBindingRate: PharData;
    halfTime: PharData;
    excretionPathway: PharData;
    peakTime: PharData;
    distributionCubage: PharData;
    bioavailability: PharData;
    absorptionFraction: PharData;
    effectiveTime: PharData;
    pharmacokinetics: PharData;
    effecDuration: PharData;
    organToxicities: PharData;
    minimalEffectiveConcentration: PharData;
    minimumToxicConcentration: PharData;
    capacity: PharData;
    constructor(

    ) {
        this.atrioventricularModel = new PharData();
        this.plasmaProteinBindingRate = new PharData();
        this.halfTime = new PharData();
        this.excretionPathway = new PharData();
        this.peakTime = new PharData();
        this.distributionCubage = new PharData();
        this.bioavailability = new PharData();
        this.absorptionFraction = new PharData();
        this.effectiveTime = new PharData();
        this.pharmacokinetics = new PharData();
        this.effecDuration = new PharData();
        this.organToxicities = new PharData();
        this.minimalEffectiveConcentration = new PharData();
        this.minimumToxicConcentration = new PharData();
        this.capacity = new PharData();
    }
}

