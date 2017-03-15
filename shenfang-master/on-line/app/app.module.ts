import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { TreeModule } from 'angular2-tree-component';
import { appRoutingProviders, AppRoutingModule } from '../app/app.routes';
import { ServerInterceptor } from './server.interceptor';
import { provideInterceptorService } from 'ng2-interceptors';

import { AppComponent } from './app.component';
import { DialogModule } from './common/ug-dialog/dialog';
import { TableModule } from './common/ug-table/table.module';
import { UploadPlugin } from './common/ug-upload/upload.plugin';
import { NgbModule, NgbDatepickerI18n } from '@ng-bootstrap/ng-bootstrap';
import { I18n, CustomDatepickerI18n } from './common/i18n_service';

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
import { AddProductComponent } from './drug_management/sort_management/add_product.component';
import { AddDrugComponent } from './drug_management/sort_management/add_drug.component';
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
import { DataGradeAuditContentComponent } from './data_management/content_management/data_grade_audit_content.component';
//产品/药品相关指导
import { AddDrugGuideComponent } from './data_management/patient_guide/add_drug_guide.component';
import { DrugTreeDetailComponent, BaseDrugComponent } from './data_management/patient_guide/drug_tree_detail.component';
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

import { AutocompleteDirective } from './common/auto-complete-directive/autocomplete-directive';
import { AutocompleteService } from './common/auto-complete-directive/autocomplete.service';
import { AutocompleteWindowComponent } from './common/auto-complete-directive/autocomplete-window.component';

//Pipe
import { FormatListToStrPipe } from './format_list_to_str.pipe'
//CSS
// import './plugin/bootstrap/css/bootstrap.min.css';
// import './app.component.css';

//通用组件部分 common component
import { DrugCategoryTree } from './common/drug_category/drug_category_tree.component';
import { DrugCategoryDialog } from './common/drug_category/drug_category_dialog.component';
import { TypeaheadDirective, TypeaheadWindow } from './common/typeahead/typeahead.directive';
import { DialogProdlistComponent } from './common/dialog-prodlist/dialog-prodlist.component';

@NgModule({
  imports: [
    BrowserModule,
    FormsModule,
    DialogModule,
    TableModule,
    TreeModule,
    AppRoutingModule,
    HttpModule,
    NgbModule.forRoot()
  ],
  declarations: [
    AppComponent,
    HomeComponent,
    UploadPlugin,
    FuncManagementComponent,
    GroupManagementComponent,
    UserManagementComponent,
    AdvancedSetComponent,
    BaseSetComponent,
    DrugSortComponent,
    PropertySortMangementComponent,
    ProductManagementComponent,
    MaintainLogsComponent,
    ProductUpdateComponent,
    ProductDetailComponent,
    RuleSortManagementComponent,
    DiseaseSortManagementComponent,
    DictionarySortManagementComponent,
    DictionaryDataManagementComponent,
    SystemRuleManagementComponent,
    DrugMatchManagementComponent,
    DrugMatchEditComponent,
    DrugMatchDiclistComponent,
    DrugMatchDiceditComponent,
    IpharmacareRuleMangementComponent,
    MedicinesCompatibilityManagementComponent,
    RuleAnalyzeTypeComponent,
    DataSortManagementComponent,
    SpecificationMangementComponent,
    DataContentManagementComponent,
    EditDataContentComponent,
    DataGradeComponent,
    DoseSettingComponent,
    DrugGuideComponent,
    GeneralTimeSetComponent,
    ProductGuideComponent,
    TermExplanationComponent,
    SpecificationEditComponent,
    SpecificationReviewComponent,
    DataGradeAuditComponent,
    AddDrugGuideComponent,
    DrugTreeDetailComponent,
    AddProductGuideComponent,
    ProductListDetailComponent,
    AddDrugComponent,
    AddProductComponent,
    DataGradeAuditContentComponent,
    BaseDrugComponent,
    HospitalManagementComponent,
    HospitalEditComponent,
    AuthorizationCodeComponent,
    //知识分享
    KnowledgeImportLogs,
    KnowledgeImport,
    KnowledgeImportList,
    RuleImportList,
    IpharmacareRuleList,
    HospitalRuleList,
    KnowledgeLibReleaseComponent,
    KnowledgeLibReleaseLogComponent,
    KnowledgeLibExportComponent,
    ExportPackageComponent,
    ExportPackageListComponent,
    //pipe
    FormatListToStrPipe,
    // common 通用组件部分
    DrugCategoryTree,
    DrugCategoryDialog,
    TypeaheadDirective,
    TypeaheadWindow,
    DialogProdlistComponent,

    // 自动补全
    AutocompleteDirective,
    AutocompleteWindowComponent
  ],
  providers: [
    AutocompleteService,
    appRoutingProviders,
    ServerInterceptor,
    I18n, { provide: NgbDatepickerI18n, useClass: CustomDatepickerI18n },
    provideInterceptorService([
      ServerInterceptor
    ])
  ],
  entryComponents: [TypeaheadWindow, AutocompleteWindowComponent],
  bootstrap: [AppComponent]
})
export class AppModule { }