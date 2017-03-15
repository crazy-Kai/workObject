import { Component ,OnInit} from '@angular/core';

import { UserService } from '../../user.service';

@Component({
	selector: 'ipharmacare-rule-management',
	template:require('./ipharmacare_rule_management.component.html')
})

export class IpharmacareRuleMangementComponent{
	constructor(
  		private userService:UserService) { }
}



