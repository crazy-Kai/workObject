import { Component } from '@angular/core';

@Component({
	selector: 'login',
	templateUrl: 'login.component.html',
	styleUrls: [ 'login.component.css' ]
})

export class LoginComponent {
	private title: string = '基础数据管理平台';
	private userNameTip: string = '用户名';
    private passwordTip: string = '密码';

	/**
     * 登录框中，密码输入后的回车事件
     */
    onEnterPressed($event:any) {
        if ( !this.username ) {
            this.userNameTip = '请输入用户名';
            return;
        }

        if ( !this.password ) {
            this.passwordTip = '请输入密码';
            return;
        }

        this.onSubmit();
    }
}