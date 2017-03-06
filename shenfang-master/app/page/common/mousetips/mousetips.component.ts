import { Component, OnInit, Input, Output, EventEmitter} from '@angular/core';

@Component({
    selector: 'mouse-tips',
    templateUrl: 'mousetips.component.html',
    styleUrls: [ 'mousetips.component.css' ]
})
export class MusetipsComponent implements OnInit{
    @Input() title: string;
    @Input() conW: string;
    @Input() posInfo: any;      //位置信息，用于处理边界遮挡的问题
    ngOnInit(){
        console.log(this.posInfo)            
    }

    ngAfterViewInit(){
        console.log(document.getElementsByTagName('body')[0].offsetWidth)
        console.log(document.getElementById('mousetips').offsetWidth)

        this.resetPos();
    }

    resetPos(){
        if(!this.posInfo) return;

        let winW = document.getElementsByTagName('body')[0].offsetWidth;
        let eleW = document.getElementById('mousetips').offsetWidth;

        if(this.posInfo.left < eleW/2){
            document.getElementById('mousetipsbody').style.marginLeft = (eleW/2 - this.posInfo.left) - this.posInfo.offsetWidth + 'px';
            document.getElementById('mousetipsdeco').style.marginRight = (eleW/2 - this.posInfo.left) - this.posInfo.offsetWidth/2 + 'px';
        }

        if(winW - this.posInfo.left < eleW/2){
            document.getElementById('mousetipsbody').style.marginRight = (eleW/2 - winW + this.posInfo.left) + this.posInfo.offsetWidth + 'px';
            document.getElementById('mousetipsdeco').style.marginLeft = (eleW/2 - winW + this.posInfo.left) - this.posInfo.offsetWidth/2 + 'px';
        }
    }
}
