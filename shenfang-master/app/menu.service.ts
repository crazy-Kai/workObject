import { Injectable } from '@angular/core';

export class SubMenu {
    title: string;
    resource: string;
}

export class Menu {
    id: number;
    iconSrc: string;
    iconActionSrc: string;
    title: string;
    subMenus: SubMenu[];
}

@Injectable()
export class MenuService {
    menus: Menu[] = [{
        id: 1,
        iconSrc: 'app/images/menu-set.svg',
        iconActionSrc: 'app/images/menu-set-a.svg',
        title: '审方设置',
        subMenus: [
            { title: '审方方案设置', resource: 'audit-setting' }
        ]
    }, {
        id: 2,
        iconSrc: 'app/images/menu-audit.svg',
        iconActionSrc: 'app/images/menu-audit-a.svg',
        title: '处方/医嘱审核',
        subMenus: [
            { title: '门诊处方审核', resource: 'opt-audit-plan-choose' },
            { title: '住院医嘱审核', resource: 'ipt-audit-plan-choose' }
        ]
    }, {
        id: 3,
        iconSrc: 'app/images/menu-result.svg',
        iconActionSrc: 'app/images/menu-result-a.svg',
        title: '审核结果查看',
        subMenus: [
            { title: '已审门诊处方查看', resource: 'opt-recipe-review' },
            { title: '已审住院医嘱查看', resource: 'ipt-recipe-review' }
        ]
    }, {
        id: 4,
        iconSrc: 'app/images/menu-statistics.svg',
        iconActionSrc: 'app/images/menu-statistics-a.svg',
        title: '审方统计',
        subMenus: [
            { title: '药师工作统计', resource: 'pharmacists-statistic' }
        ]
    }, {
        id: 5,
        iconSrc: 'app/images/menu-alert-message.svg',
        iconActionSrc: 'app/images/menu-alert-message-a.svg',
        title: '警示信息管理',
        subMenus: [
            { title: '用药警示管理', resource: 'alert-message' },
            { title: '用药警示管理-个人', resource: 'alert-message-person' },
            { title: '用药警示管理-管理', resource: 'alert-message-master' }
        ]
    }];
}