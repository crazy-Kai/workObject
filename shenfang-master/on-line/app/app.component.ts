import { Component, OnInit, Input, trigger, state, style, transition, animate, ViewChild, HostListener } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

import './rxjs-operators';

import { CookieService } from 'angular2-cookie/services/cookies.service';

//引入Service
import { MenuService, NaviInfo } from './menu.service';
import { Menu } from './menu';
import { UserService } from './user.service';
import { User } from './user';
import { GuideListService } from './data_management/patient_guide/guide_list.service';
import { DrugService } from './data_management/patient_guide/drug_tree.service';
import { SearchService } from './search.service';
//引入插件
import { DialogPlugin } from './common/ug-dialog/dialog.plugin';


@Component({
    selector: 'my-app',
    templateUrl: './app.component.html',
    styles: [
        require('../src/bootstrap/css/bootstrap.min.css').toString(),
        require('../src/app.component.css').toString(),
        require('../src/mymodel.css').toString(),
        require('../plugin/ug-table/table.plugin.css').toString(),
        require('../plugin/ug-dialog/dialog.plugin.css').toString()
    ],
    animations: [
        trigger('openClose', [
            state('in', style({
                height: '*'
            })),
            transition('void => *', [
                style({
                    height: '0px'
                }),
                animate("10ms linear")
            ]),
            transition('* => void', [
                animate("10ms linear", style({
                    height: '0px'
                }))
            ])
        ])
    ],
    providers: [
        CookieService,
        MenuService,
        GuideListService,
        DrugService,
        SearchService
    ]
})
export class AppComponent implements OnInit {
    @ViewChild(DialogPlugin) dialogPlugin: DialogPlugin;
    username: string;
    password: string;
    lockPwd: boolean = false;

    menus: any[] = [];
    // user: User;
    title = '基础数据管理平台';
    naviBar: NaviInfo[] = [];
    selectedMenu: any; //被选中的二级菜单项
    selectedThrMenu: any; //被选中的三级菜单
    hoveredMenu: any;   //鼠标移动覆盖的对象
    submitted = false; //未登录为false，登陆为true
    error: string;
    curRouter: string;
    navOpenStatus: boolean = true;
    /**
     * 根目录对象配置
     */
    curRootMenus: any;
    rootMenus: any;
    isSys: boolean;
    isPros: boolean;
    isData: boolean;
    isRule: boolean;
    isGuest: boolean;
    isDict: boolean;
    isSharing: boolean;
    isDropdownMenu: boolean = false;

    /**
     * 变量：登陆表单input元素的输入提示
     */
    userNameTip: string = '用户名';
    passwordTip: string = '密码';

    constructor(private router: Router,
        private cookieService: CookieService,
        private menuService: MenuService,
        private userService: UserService) {
    }

    ngOnInit() {
        //cookie
        this.username = this.cookieService.get('username');
        this.password = this.cookieService.get('password');
        if (this.username && this.password) {
            this.lockPwd = true;
        }

        this.userService.isLogin = false;
        this.getUserInfo();
        //this.setPageHeight();
    }

    // setPageHeight(){
    //     let screenH = document.body.clientHeight;
    //     document.getElementById('page').style.height = (screenH - 91) + 'px';
    // }

    getMenus(user: any) {
        this.rootMenus = user.pageResource;

        this.setValidRootMenus(this.rootMenus);
        this.menuService.getAllMenu(user.pageResource);

        this.menus = this.menuService.getMenusByUrl();

        this.selectedMenu = this.menuService.selectedMenu;
        this.selectedThrMenu = this.menuService.selectedThrMenu;
        if (this.menus[0]) this.curRootMenus = this.menus[0].parentId;

        this.naviBar = this.menuService.naviBar;
        let link = window.location.pathname;
        this.router.navigate([link]);
    }
    //主菜单点击事件绑定
    setMenus(node: any, id: number) {
        this.curRootMenus = node;
        this.menuService.setMenusById(id);
        this.menus = this.menuService.menus;
        this.selectedMenu = this.menuService.selectedMenu;
        this.pushNaviInfo(node.innerHTML, "", 1);
    }

    setValidRootMenus(bootMenu: Array<any>) {
        if (!bootMenu) return;
        bootMenu.forEach(element => {
            switch (element.id) {
                case "system_management":
                    this.isSys = true;
                    break;
                case "product_management":
                    this.isPros = true;
                    break;
                case "data_management":
                    this.isData = true;
                    break;
                case "rule_management":
                    this.isRule = true;
                    break;
                case "guest_management":
                    this.isGuest = true;
                    break;
                case "dictionary_management":
                    this.isDict = true;
                case 'knowledge_sharing':
                    this.isSharing = true;
                default:
                    break;
            }
        });
    }

    //修改grade级导航栏，grade从1开始，grade=1时表示一级目录
    pushNaviInfo(name1: string, name2: string, grade: number) {
        this.menuService.pushNaviInfo(name1, name2, grade);
    }

    //导航栏点击事件
    onSelect(menu: any, grade: number) {
        if (!this.navOpenStatus) return;
        this.selectedMenu = menu;
        this.menuService.selectedMenu = this.selectedMenu;
        this.pushNaviInfo(menu.name, "", grade);

        if (menu.resource) {
            this.router.navigate([menu.resource]);
        }
    }
    onSelectThr(submenu: any, menu: any) {
        this.selectedMenu = menu;
        this.selectedThrMenu = submenu;
    }
    //切换slide
    switchNavStatus() {
        this.navOpenStatus = !this.navOpenStatus;

        //this.selectedMenu = null;
    }
    showMinNav(menu: any) {
        if (this.navOpenStatus) return;
        this.hoveredMenu = menu;
    }
    hideMinNav(menu: any) {
        if (this.navOpenStatus) return;
        this.hoveredMenu = null;
    }
    onSelectMin(menu: any, grade: number) {
        if (this.navOpenStatus) return;
        this.selectedMenu = menu;
        this.menuService.selectedMenu = this.selectedMenu;
        this.pushNaviInfo(menu.name, "", grade);

        if (menu.resource) {
            this.router.navigate([menu.resource]);
        }
    }
    //用户模块
    getUserInfo() {
        this.userService.getUserInfo()
            .then(user => {
                this.userService.user = user;
                if (this.userService.isEmptyObject(this.userService.user)) {
                    this.userService.isLogin = false;
                } else {
                    this.userService.isLogin = true;
                }

                this.getMenus(user);    //从用户信息中获得该用户权限下的菜单目录
            },
            error => this.error = <any>error);
    }


    onSubmit() {
        let self = this;
        this.userService.login(this.username, this.password)
            .then(user => {
                this.userService.user = user;
                if (this.userService.isEmptyObject(this.userService.user)) {
                    self.dialogPlugin.tip('用户名或者密码错误');
                } else {
                    this.userService.isLogin = true;
                    this.getMenus(user);    //从用户信息中获得该用户权限下的菜单目录

                    //cookie
                    if (this.lockPwd) {
                        this.cookieService.put('username', this.username);
                        this.cookieService.put('password', this.password);
                    } else {
                        this.username = "";
                        this.password = "";

                        this.cookieService.remove('username');
                        this.cookieService.remove('password');
                    }
                }
            },
            error => this.error = <any>error);
    }

    logout() {
        this.dialogPlugin.confirm("你确定要退出吗？", () => {
            this.logoutUser();
        }, () => {
        });
    }

    logoutUser() {
        this.userService.logout()
            .then((user: any) => {
                this.userService.user = user;
                this.userService.isLogin = false;
                this.isDropdownMenu = false;
            },
            (error: any) => this.error = <any>error);
    }

    @HostListener('document:click', ['$event'])
    onClickDoc($event: any) {
        this.isDropdownMenu = false;
    }

    onClickName($event: any) {
        this.isDropdownMenu = !this.isDropdownMenu;
        $event.stopPropagation();

    }

    /**
     * 登录框中，密码输入后的回车事件
     */
    onEnterPressed($event: any) {
        if (!this.username) {
            this.userNameTip = '请输入用户名';
            return;
        }

        if (!this.password) {
            this.passwordTip = '请输入密码';
            return;
        }

        this.onSubmit();
    }
}
