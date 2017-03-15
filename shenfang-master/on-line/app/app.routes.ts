import { Routes, RouterModule, CanActivate, Router } from '@angular/router';
import { UserService } from './user.service';
import { Injectable, ModuleWithProviders, NgModule } from '@angular/core';
// import { CanDeactivateGuard } from './can-deactivate-guard.service';
@Injectable()
export class AuthGuard implements CanActivate {

    constructor(private userService: UserService, private router: Router) { }

    canActivate() {

        if (this.userService.isLogin) {
            return true;
        }
        // this.router.navigate(['/login']);
        return false;
    }
}

//引入页面Component
import { HomeComponent } from './home.component';
//系统管理
import { FuncManagementComponent } from './system_management/system_privilege/management_function.component';
import { GroupManagementComponent } from './system_management/system_privilege/management_group.component';
import { UserManagementComponent } from './system_management/system_privilege/management_user.component';
import { AdvancedSetComponent } from './system_management/system_setting/setting_advanced.component';
import { BaseSetComponent } from './system_management/system_setting/setting_base.component';
//药品管理
import { DrugSortComponent } from './drug_management/sort_management/drug_sort_management.component';
import { PropertySortMangementComponent } from './drug_management/sort_management/property_sort_management.component';
import { ProductManagementComponent } from './drug_management/drug_data/product_management.component';
import { MaintainLogsComponent } from './drug_management/drug_data/maintain_logs.component';
import { ProductUpdateComponent } from './drug_management/drug_data/product_update.component';
import { ProductDetailComponent } from './drug_management/drug_data/product_detail.component';
//规则管理
import { RuleSortManagementComponent } from './rule_management/sort_management/rule_sort_management.component';
import { DiseaseSortManagementComponent } from './rule_management/sort_management/disease_sort_management.component';
import { DictionarySortManagementComponent } from './rule_management/sort_management/dictionary_sort_management.component';
import { DictionaryDataManagementComponent } from './rule_management/sort_management/dictionary_data_management.component';
import { SystemRuleManagementComponent } from './rule_management/content_management/system_rule_management.component';
import { DrugMatchManagementComponent } from './rule_management/content_management/drug_match_management.component';
import { DrugMatchEditComponent } from './rule_management/content_management/drug_match_edit.component';
import { DrugMatchDiclistComponent } from './rule_management/content_management/drug_match_dictlist.component';
import { DrugMatchDiceditComponent } from './rule_management/content_management/drug_match_dictedit.component';
import { IpharmacareRuleMangementComponent } from './rule_management/content_management/ipharmacare_rule_management.component';
import { MedicinesCompatibilityManagementComponent } from './rule_management/content_management/medicines_compatibility_management.component';
import { RuleAnalyzeTypeComponent } from './rule_management/content_management/rule_analyze_type.component';
//资料管理
import { DataSortManagementComponent } from './data_management/sort_management/data_sort_management.component';
import { SpecificationMangementComponent } from './data_management/content_management/specification_management.component';
import { DataContentManagementComponent } from './data_management/content_management/data_content_management.component';
import { EditDataContentComponent } from './data_management/content_management/edit_data_content.component';
import { DataGradeComponent } from './data_management/content_management/data_grade.component';
import { DoseSettingComponent } from './data_management/patient_guide/dose_setting.component';
import { DrugGuideComponent } from './data_management/patient_guide/drug_guide.component';
import { GeneralTimeSetComponent } from './data_management/patient_guide/general_timeset.component';
import { ProductGuideComponent } from './data_management/patient_guide/product_guide.component';
import { TermExplanationComponent } from './data_management/patient_guide/term_explanation.component';
import { SpecificationEditComponent } from './data_management/content_management/specification_edit.component';
import { SpecificationReviewComponent } from './data_management/content_management/specification_review.component';
import { DataGradeAuditComponent } from './data_management/content_management/data_grade_audit.component';
//产品/药品相关指导
import { AddDrugGuideComponent } from './data_management/patient_guide/add_drug_guide.component';
import { DrugTreeDetailComponent } from './data_management/patient_guide/drug_tree_detail.component';
import { AddProductGuideComponent } from './data_management/patient_guide/add_product_guide.component';
import { ProductListDetailComponent } from './data_management/patient_guide/product_list_detail.component';
//客户管理
import { HospitalManagementComponent } from './guest_management/hospital_management.component';
import { HospitalEditComponent } from './guest_management/hospital_edit.component';
import { AuthorizationCodeComponent } from './guest_management/authorization_code.component';
//知识分享
import { KnowledgeImportLogs } from './knowledge_sharing/knowledge_import_management/knowledge_import_logs.component';
import { KnowledgeImport } from './knowledge_sharing/knowledge_import_management/knowledge_import.component';
import { KnowledgeImportList } from './knowledge_sharing/knowledge_import_management/knowledge_import_list.component';
import { RuleImportList } from './knowledge_sharing/knowledge_import_management/rule_import_list.component';
import { IpharmacareRuleList } from './knowledge_sharing/knowledge_import_management/ipharmacare_rule_list.component';
import { HospitalRuleList } from './knowledge_sharing/knowledge_import_management/hospital_rule_list.component';
//知识分享·知识库发布 - by Anyvone@2017-01-05
import { KnowledgeLibReleaseComponent } from './knowledge_sharing/knowledge_lib/knowledge_lib_release.component';
import { KnowledgeLibReleaseLogComponent } from './knowledge_sharing/knowledge_lib/knowledge_lib_release_log.component';
import { KnowledgeLibExportComponent } from './knowledge_sharing/knowledge_lib/knowledge_lib_export.component';
import { ExportPackageComponent } from './knowledge_sharing/knowledge_lib/export_package.component';
import { ExportPackageListComponent } from './knowledge_sharing/knowledge_lib/export_package_list.component';

const routes: Routes = [{
    path: '',
    // redirectTo: '/home',
    component: HomeComponent,
    pathMatch: 'full'
}, {
    path: 'home',
    component: HomeComponent,
    canActivate: [AuthGuard]
},
//系统管理
{
    path: 'system_management/system_privilege/management_function',
    component: FuncManagementComponent,
    canActivate: [AuthGuard]
}, {
    path: 'system_management/system_privilege/management_group',
    component: GroupManagementComponent,
    canActivate: [AuthGuard]
}, {
    path: 'system_management/system_privilege/management_user',
    component: UserManagementComponent,
    canActivate: [AuthGuard]
}, {
    path: 'system_management/system_setting/setting_advanced',
    component: AdvancedSetComponent,
    canActivate: [AuthGuard]
}, {
    path: 'system_management/system_setting/setting_base',
    component: BaseSetComponent,
    canActivate: [AuthGuard]
},
//药品管理
{
    path: 'drug_management/sort_management/drug_sort_management',
    component: DrugSortComponent,
    canActivate: [AuthGuard]
}, {
    path: 'drug_management/sort_management/property_sort_management',
    component: PropertySortMangementComponent,
    canActivate: [AuthGuard]
}, {
    path: 'drug_management/drug_data/product_management',
    component: ProductManagementComponent,
    canActivate: [AuthGuard]
}, {
    path: 'drug_management/drug_data/product_management/maintain_logs',
    component: MaintainLogsComponent,
    canActivate: [AuthGuard]
}, {
    // 产品详情
    path: 'drug_management/drug_data/product_management/product_detail/:product_id/:operate',
    component: ProductDetailComponent,
    canActivate: [AuthGuard]
}, {
    path: 'drug_management/drug_data/product_management/product_update',
    component: ProductUpdateComponent,
    canActivate: [AuthGuard]
},
//规则管理
{
    path: 'rule_management/sort_management/rule_sort_management',
    component: RuleSortManagementComponent,
    canActivate: [AuthGuard]
}, {
    path: 'rule_management/sort_management/disease_sort_management',
    component: DiseaseSortManagementComponent,
    canActivate: [AuthGuard]
}, {
    path: 'rule_management/sort_management/dictionary_sort_management',
    component: DictionarySortManagementComponent,
    canActivate: [AuthGuard]
}, {
    path: 'rule_management/sort_management/dictionary_sort_management/dictionary_data_management/rule/:categoryCode',
    component: DictionaryDataManagementComponent,
    canActivate: [AuthGuard]
}, {
    path: 'rule_management/sort_management/dictionary_sort_management/dictionary_data_management/prop/:categoryCode',
    component: DictionaryDataManagementComponent,
    canActivate: [AuthGuard]
}, {
    path: 'rule_management/content_management/system_rule_management',
    component: SystemRuleManagementComponent,
    canActivate: [AuthGuard]
}, {
    path: 'rule_management/content_management/drug_match_management',
    component: DrugMatchManagementComponent,
    canActivate: [AuthGuard]
}, {
    path: 'rule_management/content_management/drug_match_management/drug_match_edit',
    component: DrugMatchEditComponent,
    canActivate: [AuthGuard]
}, {
    path: 'rule_management/content_management/drug_match_management/drug_match_edit/:id',
    component: DrugMatchEditComponent,
    canActivate: [AuthGuard]
}, {
    path: 'rule_management/content_management/drug_match_management/drug_match_dictlist',
    component: DrugMatchDiclistComponent,
    canActivate: [AuthGuard]
}, {
    path: 'rule_management/content_management/drug_match_management/drug_match_dictlist/drug_match_dictedit/:id',
    component: DrugMatchDiceditComponent,
    canActivate: [AuthGuard]
}, {
    path: 'rule_management/content_management/ipharmacare_rule_management',
    component: IpharmacareRuleMangementComponent,
    canActivate: [AuthGuard]
}, {
    path: 'rule_management/content_management/medicines_compatibility_management',
    component: MedicinesCompatibilityManagementComponent,
    canActivate: [AuthGuard]
}, {
    path: 'rule_management/content_management/rule_analyze_type',
    component: RuleAnalyzeTypeComponent,
    canActivate: [AuthGuard]
},
//资料管理
{
    path: 'data_management/sort_management/data_sort_management',
    component: DataSortManagementComponent,
    canActivate: [AuthGuard]
},
{//内容管理
    path: 'data_management/content_management/specification_management',
    component: SpecificationMangementComponent,
    canActivate: [AuthGuard]
}, {

    path: 'data_management/content_management/data_content_management',
    component: DataContentManagementComponent,
    canActivate: [AuthGuard]
}, {
    path: 'data_management/content_management/data_content_management/edit_data_content/:docType',
    component: EditDataContentComponent,
    canActivate: [AuthGuard]
}, {

    path: 'data_management/content_management/data_content_management/edit_data_content/:docType/:id',
    component: EditDataContentComponent,
    canActivate: [AuthGuard]
}, {
    path: 'data_management/content_management/data_grade',
    component: DataGradeComponent,
    canActivate: [AuthGuard]
}, {
    path: 'data_management/content_management/specification_management/specification_edit/:id/:dataType',
    component: SpecificationEditComponent,
    canActivate: [AuthGuard],
    canDeactivate: [CanDeactivateGuard]
}, {
    path: 'data_management/content_management/specification_management/specification_edit',
    component: SpecificationEditComponent,
    canActivate: [AuthGuard],
    canDeactivate: [CanDeactivateGuard]
}, {
    path: 'data_management/content_management/specification_management/specification_review/:id',
    component: SpecificationReviewComponent,
    canActivate: [AuthGuard]
}, {
    path: 'data_management/content_management/data_grade/data_grade_audit/:doc_type/:id/:isAudited/:status',
    component: DataGradeAuditComponent,
    canActivate: [AuthGuard]
}, {
    path: 'data_management/patient_guide/dose_setting',
    component: DoseSettingComponent,
    canActivate: [AuthGuard]
}, {
    path: 'data_management/patient_guide/drug_guide',
    component: DrugGuideComponent,
    canActivate: [AuthGuard]
}, {
    path: 'data_management/patient_guide/general_timeset',
    component: GeneralTimeSetComponent,
    canActivate: [AuthGuard]
}, {
    path: 'data_management/patient_guide/product_guide',
    component: ProductGuideComponent,
    canActivate: [AuthGuard]
}, {
    path: 'data_management/patient_guide/term_explanation',
    component: TermExplanationComponent,
    canActivate: [AuthGuard]
},
//产品/药品相关指导
{
    path: 'data_management/patient_guide/drug_guide/add_drug_guide',
    component: AddDrugGuideComponent,
    canActivate: [AuthGuard]
}, {
    // 添加药品树中的/:drug_id
    path: 'data_management/patient_guide/drug_guide/drug_tree_detail/:drug_id/:status',
    component: DrugTreeDetailComponent,
    canActivate: [AuthGuard],
    canDeactivate: [CanDeactivateGuard]
}, {
    path: 'data_management/patient_guide/product_guide/add_product_guide',
    component: AddProductGuideComponent,
    canActivate: [AuthGuard]
}, {
    // 添加产品列表中的/:drug_id
    path: 'data_management/patient_guide/product_guide/product_list_detail/:drug_name/:drug_id/:status',
    component: ProductListDetailComponent,
    canActivate: [AuthGuard],
    canDeactivate: [CanDeactivateGuard]
},
//客户管理
{
    path: 'guest_management/hospital_management',
    component: HospitalManagementComponent,
    canActivate: [AuthGuard]
}, {
    path: 'guest_management/hospital_management/hospital_edit',
    component: HospitalEditComponent,
    canActivate: [AuthGuard]
}, {
    path: 'guest_management/hospital_management/hospital_edit/:id',
    component: HospitalEditComponent,
    canActivate: [AuthGuard]
}, {
    path: 'guest_management/hospital_management/authorization_code/:id',
    component: AuthorizationCodeComponent,
    canActivate: [AuthGuard]
},
//知识分享
{
    path: 'knowledge_sharing/knowledge_import_management/knowledge_import_list',
    component: KnowledgeImportList,
    canActivate: [AuthGuard]
}, {
    path: 'knowledge_sharing/knowledge_import_management/knowledge_import_list/knowledeg_import_logs',
    component: KnowledgeImportLogs,
    canActivate: [AuthGuard]
}, {
    path: 'knowledge_sharing/knowledge_import_management/knowledge_import_list/knowledeg_import',
    component: KnowledgeImport,
    canActivate: [AuthGuard]
}, {
    path: 'knowledge_sharing/knowledge_import_management/rule_import_list',
    component: RuleImportList,
    canActivate: [AuthGuard]
}, {
    path: 'knowledge_sharing/knowledge_import_management/ipharmacare_rule_list',
    component: IpharmacareRuleList,
    canActivate: [AuthGuard]
}, {
    path: 'knowledge_sharing/knowledge_import_management/hospital_rule_list',
    component: HospitalRuleList,
    canActivate: [AuthGuard]
}
    //知识分享·知识库发布 knowledge_sharing/knowledge_lib_release/knowledge_lib_release
    , {
    path: 'knowledge_sharing/knowledge_lib/knowledge_lib_release',
    component: KnowledgeLibReleaseComponent,
    canActivate: [AuthGuard]
}, {
    path: 'knowledge_lib/knowledge_lib_release/view_release_log',
    component: KnowledgeLibReleaseLogComponent,
    canActivate: [AuthGuard]
}, {
    path: 'knowledge_sharing/knowledge_lib/knowledge_lib_export',
    component: KnowledgeLibExportComponent,
    canActivate: [AuthGuard]
}, {
    path: 'knowledge_sharing/knowledge_lib/export_package',
    component: ExportPackageComponent,
    canActivate: [AuthGuard]
}, {
    path: 'knowledge_sharing/knowledge_lib/export_package_list/:id',
    component: ExportPackageListComponent,
    canActivate: [AuthGuard]
}];

export const authProviders = [AuthGuard, UserService];
export const appRoutingProviders: any[] = [
    authProviders,
    CanDeactivateGuard
];
// export const routing: ModuleWithProviders = RouterModule.forRoot(routes);

@NgModule({
    imports: [
        RouterModule.forRoot(routes)
    ],
    exports: [
        RouterModule
    ]
})
export class AppRoutingModule { }