import { Component ,OnInit} from '@angular/core';

import { UserService } from '../../user.service';

@Component({
	selector: 'property-sort-management',
	template:require('./property_sort_management.component.html'),
	styles:[require('./sort_management.component.css')+""],
})

export class PropertySortMangementComponent{
	constructor(
  		private userService:UserService) { }
}



