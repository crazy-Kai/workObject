import { Component ,OnInit} from '@angular/core';

import { UserService } from '../../user.service';

@Component({
	selector: 'medicines-compatibility-management',
	template:require('./medicines_compatibility_management.component.html')
})

export class MedicinesCompatibilityManagementComponent{
	constructor(
  		private userService:UserService) { }
}



