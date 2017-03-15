import { Component, OnInit } from '@angular/core';

@Component({
    selector: 'my-home',
    template: `
        <h1 class="welcome">欢迎使用知识库</h1>
        <div class="welcome-img"><img src="../images/wiki.jpg"></div>
    `,
    styles: [`
    .welcome,
    .welcome-img {
        text-align: center;
    }
    `]
})
export class HomeComponent implements OnInit {
    constructor() { }

    ngOnInit() { }
}