import { Component ,OnInit} from '@angular/core';

import { UserService } from '../../user.service';

@Component({
	selector: 'rule-sort-management',
	template:require('./rule_sort_management.component.html')
})

export class RuleSortManagementComponent{
	constructor(
  		private userService:UserService) { }
}



