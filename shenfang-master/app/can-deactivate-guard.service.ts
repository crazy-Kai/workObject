import { Injectable }    from '@angular/core';
import { CanDeactivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot }  from '@angular/router';
import { Observable }    from 'rxjs/Observable';
// import { DrugTreeDetailComponent } from './data_management/patient_guide/drug_tree_detail.component'
// import { ProductListDetailComponent } from './data_management/patient_guide/product_list_detail.component'
// export interface CanComponentDeactivate {
//   canDeactivate: () => Observable<boolean> | boolean;
// }


// @Injectable()
// export class CanDeactivateGuard implements CanDeactivate<DrugTreeDetailComponent> {
//   canDeactivate(
//     // component: DrugTreeDetailComponent,
//     route: ActivatedRouteSnapshot,
//     state: RouterStateSnapshot) {
//     return component.canDeactivate ? component.canDeactivate() : true;
//   }
// }