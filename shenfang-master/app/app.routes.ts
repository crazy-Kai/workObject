import { Routes, RouterModule, CanActivate, Router } from '@angular/router';
// import { UserService } from './user.service';
import { Injectable, ModuleWithProviders,NgModule } from '@angular/core';
// import { CanDeactivateGuard } from './can-deactivate-guard.service';

//pages
import { TestLineChartComponent } from './test/test-line-chart.component';
import { AuditSettingComponent } from './page/audit-setting/audit-setting.component';
import { AuditPlanComponent } from './page/audit-setting/audit-plan.component';
//审方方案查看
import { AuditReviewComponent } from './page/audit-setting/audit-review.component'
//门诊方案选择
import { OptAuditPlanChooseComponent } from './page/ipt-opt-auditing/opt-audit-plan-choose.component';
//医嘱方案选择
import { IptAuditPlanChooseComponent } from './page/ipt-opt-auditing/ipt-audit-plan-choose.component';
//处方审核列表
import { OptOrderAuditComponent } from './page/ipt-opt-auditing/opt-order-audit.component';
//医嘱审核列表
import { IptOrderAuditComponent } from './page/ipt-opt-auditing/ipt-order-audit.component';
//医嘱审核详情
import { IptOrderDetailsComponent } from './page/ipt-opt-auditing/ipt-order-details.component';
//门诊处方详情
import { OptRecipeDetailsComponent } from './page/ipt-opt-auditing/opt-recipe-details.component';

import { OptRecipeReviewComponent } from './page/ipt-opt-review/opt-recipe-review.component';
import { IptRecipeReviewComponent } from './page/ipt-opt-review/ipt-recipe-review.component';
import { OptRecipeReviewDetailsComponent } from './page/ipt-opt-review/opt-recipe-review-details.component';
import { IptRecipeReviewDetailsComponent } from './page/ipt-opt-review/ipt-recipe-review-details.component';
import { PharmacistsStatisticComponent } from './page/pc-statistic/pharmacists-statistic.component';

//警示信息管理
import { AlertMessageComponent } from './page/alert-message/list/alert-message.component';
//警示信息详情-管理
import { AlertMessageDetailsComponent } from './page/alert-message/alert-message-details.component';

import { LoginComponent } from './page/login/login.component';

@Injectable()
export class AuthGuard implements CanActivate {

    // constructor(private userService: UserService, private router: Router) { }

    canActivate() {

        // if (this.userService.isLogin) {
        //     return true;
        // }
        // this.router.navigate(['/login']);
        return false;
    }
}


const routes: Routes = [
    { path: '', 
      component: AuditSettingComponent,
      pathMatch: 'full' 
    },{
      path:'test-svg',
      component: TestLineChartComponent
    },{
      path:'audit-setting',
      component: AuditSettingComponent
    },{
      path:'audit-plan',
      component: AuditPlanComponent
    },{
      path:'audit-plan/:id',
      component: AuditPlanComponent
    },
    //审方方案查看
    {
      path: 'audit-review/:id',
      component: AuditReviewComponent
    },
    //处方方案选择
    {
      path: 'opt-audit-plan-choose',
      component: OptAuditPlanChooseComponent
    },
    //医嘱方案选择
    {
      path: 'ipt-audit-plan-choose',
      component: IptAuditPlanChooseComponent
    },
    //处方审核列表
    {
      path:'opt-order-audit',
      component: OptOrderAuditComponent
    },
    //医嘱审核列表
    {
      path: 'ipt-order-audit',
      component: IptOrderAuditComponent
    },
    //医嘱审核详情
    {
      path:'ipt-order-details/:recipeId',
      component: IptOrderDetailsComponent
    },
    //门诊处方详情
    {
      path:'opt-recipe-details/:recipeId',
      component: OptRecipeDetailsComponent
    },
    //审核结果查看
    {
      path: 'opt-recipe-review',
      component: OptRecipeReviewComponent
    },
    {
      path: 'ipt-recipe-review',
      component: IptRecipeReviewComponent
    },
    {
      path: 'opt-recipe-review-details/:recipeId',
      component: OptRecipeReviewDetailsComponent
    },
    {
      path: 'ipt-recipe-review-details/:recipeId',
      component: IptRecipeReviewDetailsComponent
    },
    //药师工作统计
    {
      path: 'pharmacists-statistic',
      component: PharmacistsStatisticComponent
    },
    //警示信息管理
    {
      path: 'alert-message',
      component: AlertMessageComponent
    },
    {
      path: 'alert-message-master',
      component: AlertMessageComponent
    },
    {
      path: 'alert-message-person',
      component: AlertMessageComponent
    },
    //警示信息详情-管理
    {
      path: 'alert-message-details',
      component: AlertMessageDetailsComponent
    },
    {
      path: 'alert-message-details/:productId/:auditObject',
      component: AlertMessageDetailsComponent
    },
    {
      path: 'login',
      component: LoginComponent
    }
];

// export const authProviders = [AuthGuard, UserService];
// export const appRoutingProviders: any[] = [
//     // authProviders,
//     CanDeactivateGuard
// ];
// export const routing: ModuleWithProviders = RouterModule.forRoot(routes);

@NgModule({
  imports: [
    RouterModule.forRoot(routes)
  ],
  exports: [
    RouterModule
  ]
})
export class AppRoutingModule {}