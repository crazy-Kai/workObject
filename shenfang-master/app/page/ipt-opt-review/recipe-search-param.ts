export class RecipeSearchParams{
    startTime: string;
    endTime: string;
    auditObj: string;
    source: string;
    analysisType: string;
    analysisResultType: string;
    severityOperator: string;
    severity: string;
    cautionStatus: string;
    applyStatus: string;
    zoneIds: string;
    deptIds: string;
    doctorId: string;
    drugClassifyCode: string;
    drugId: string;
    drugName: string;
    antibacterialsFlag: string;
    injectableFlag: string;
    recipeNo: string;
    patientNo: string;
    auditDoctorId: string;
    precStatus: string;

    constructor() {
        this.antibacterialsFlag = '1';
    }
}