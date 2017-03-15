/**
 *  @author: anwen
 *  @Description:TODO(菜单获取及菜单数据的存储)     
 */
import {
    Injectable
} from '@angular/core';

export class NaviInfo {
    name: String;
    grade: number;
}

@Injectable()
export class MenuService {
    menus: any;
    selectedMenu: any; //被选中的二级菜单项
    selectedThrMenu: any; //被选中的三级菜单
    urlList: any;
    naviBar: NaviInfo[] = [];
    bootMenu: any;

    /**
     * 获取用户所有菜单信息
     * @param obj:   所有菜单资源对象
     * @param debug: 是否打印调试信息
     */
    getAllMenu(obj: any, debug?: boolean) {
        this.bootMenu = obj;
        if (debug) {
            console.log(obj);
        }
    }

    getCurMenu(id: number) {
        return this.bootMenu[id].resourceList;
    }

    getMenusByUrl() {
        let currentUrl = window.location.pathname;
        let currentRouter = currentUrl.slice(currentUrl.indexOf("/") + 1);

        currentRouter = currentRouter ? currentRouter : "home"; //路由重定向，路由中修改后这里也需要修改
        this.urlList = currentRouter.split("/");
        
        if (!this.bootMenu) return false;
        // if (this.urlList.length < 3) {
        //     //this.initMenus();
        // } else {
        
        for (let i = 0; i < this.bootMenu.length; i++) {
            if (this.bootMenu[i].id == this.urlList[0] || this.bootMenu[i].resource == currentRouter) {
                this.menus = this.bootMenu[i].resourceList;
                
                //this.selectedMenu = this.menus[0];
                this.pushNaviInfo(this.bootMenu[i].name, "", 1);
                for(let j = 0; j < this.bootMenu[i].resourceList.length; j++){
                    if(this.urlList[1] == this.bootMenu[i].resourceList[j].id){
                        this.pushNaviInfo(this.bootMenu[i].resourceList[j].name, "", 2);
                        this.selectedMenu = this.menus[j];
                        // let thrMenu = this.bootMenu[i].resourceList[j].resourceList;
                        // for(let k = 0; k < thrMenu.length; k++){
                        //     if(this.urlList[2] == thrMenu[k].id){
                        //         this.pushNaviInfo(thrMenu[k].name, "", 2);
                        //         this.selectedThrMenu = thrMenu[k];
                        //     }
                        // }
                    }
                }
                break;
            }
            // let secondMenu = this.bootMenu[i].resourceList;
            // for (let j = 0; j < secondMenu.length; j++) {
            //     let thirdMenu = secondMenu[j].resourceList;
            //     for (let k = 0; k < thirdMenu.length; k++) {
            //         if (currentRouter.indexOf(thirdMenu[k].resource) != -1) {
            //             this.selectedMenu = secondMenu[j];
            //             this.pushNaviInfo(this.bootMenu[i].name, "", 1);
            //             this.pushNaviInfo(secondMenu[j].name, "", 2);
            //             this.pushNaviInfo(thirdMenu[k].name, "", 3);

            //             return this.getCurMenu(i);
            //         }
            //     }
            // }
            // }
        }
        if(!this.menus) this.menus = this.bootMenu[0].resourceList;
        return this.menus;

        // for (let i = 0; i < this.bootMenu.length; i++) {
        //     if (currentRouter.indexOf(this.bootMenu[i].resource) > -1) {
        //         this.pushNaviInfo(this.bootMenu[i].name, "", 1);
        //         return this.getCurMenu(i);
        //     }
        //     let secondMenu = this.bootMenu[i].resourceList;
        //     for (let j = 0; j < secondMenu.length; j++) {
        //         if (currentRouter.indexOf(secondMenu[j].resource) > -1) {
        //             this.pushNaviInfo(this.bootMenu[i].name, "", 1);
        //             this.pushNaviInfo(secondMenu[j].name, "", 2);
        //             return this.getCurMenu(i);
        //         }
        //         let thirdMenu = secondMenu[j].resourceList;
        //         for (let k = 0; k < thirdMenu.length; k++) {
        //             if (currentRouter.indexOf(thirdMenu[k].resource) > -1) {
        //                 this.pushNaviInfo(this.bootMenu[i].name, "", 1);
        //                 this.pushNaviInfo(secondMenu[j].name, "", 2);
        //                 this.pushNaviInfo(thirdMenu[k].name, "", 3);
        //                 return this.getCurMenu(i);
        //             }
        //         }
        //     }
        // }

    }

    //为selectmenu和navibar初始化
    initMenus() {
        //this.menus = this.bootMenu[0].resourceList[0].resourceList[1];
        this.selectedMenu = this.bootMenu[0].resourceList[0].resourceList[1];
        this.pushNaviInfo('系统管理', "", 1);
        this.pushNaviInfo('系统权限', "", 2);
        this.pushNaviInfo('用户管理', "", 3);
        console.log(this.selectedMenu)
    }

    //获取菜单目录
    setMenusById(id: number) {
        let menuSortId: number;
        for (let i = 0; i < this.bootMenu.length; i++) {
            if (this.bootMenu[i].sort == id) {
                menuSortId = i;
                break;
            }
        }
        this.menus = this.bootMenu[menuSortId].resourceList;
        this.selectedMenu = this.menus[0];
    }

    //导航栏事件
    pushNaviInfo(name1: string, name2: string, grade: number) {
        if (grade == 3 && this.naviBar.length < 2) {
            let navi = new NaviInfo();
            navi.name = name2;
            navi.grade = grade - 1;
            this.naviBar.push(navi);
        }
        let navi = new NaviInfo();
        navi.name = name1;
        navi.grade = grade;
        this.popNaviInfo(navi);
        this.naviBar.push(navi);
    }

    popNaviInfo(navi: NaviInfo) {
        for (let i = this.naviBar.length; i > navi.grade - 1; i--) {
            this.naviBar.pop();
        }
    }
}
