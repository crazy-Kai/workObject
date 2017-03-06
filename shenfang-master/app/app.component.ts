import { Component, OnInit, Input, trigger, state, style, transition, animate, ViewChild, HostListener } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

import './rxjs-operators';

import { Menu, SubMenu } from './menu.service';
//引入Service 
import { CookieService } from 'angular2-cookie/services/cookies.service';
import { MenuService } from './menu.service';
//引入插件
import { DialogPlugin } from './plugin/ug-dialog/dialog.plugin';



@Component({
    selector: 'my-app',
    template: require('./app.component.html'),
    styles: [require('../src/bootstrap/css/bootstrap.min.css') + "",
        require('../src/app.common.css') + "",
        require('./app.component.css') + ""],
    providers: [
        CookieService,
        MenuService
    ]
})
export class AppComponent implements OnInit {
    SelectMenu: any;

    constructor(private menuService: MenuService) { }

    ngOnInit() {

    }
}
