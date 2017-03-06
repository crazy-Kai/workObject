import { Component, OnInit, Input, Output, EventEmitter} from '@angular/core';

@Component({
    selector: 'time-interval',
    templateUrl: 'time-interval.component.html',
})
export class TimeIntervalComponent implements OnInit{
    @Input() startTime: any;            //开始时间时间戳  数字 或 纯数字的字符串
    @Input() endTime: any;              //截止时间时间戳  数字 或 纯数字的字符串
    @Output() timeSetted = new EventEmitter();     //输出一个包含起止时间戳的对象
    
    /**
	 * 时间控件参数
	 */
    startDate: string;
	endDate: string;
	//minStartDate: any;
	maxStartDate:any = {year: new Date().getFullYear(), month: new Date().getMonth() + 1, day: new Date().getDate()};
	minEndDate: any;
	maxEndDate:any = {year: new Date().getFullYear(), month: new Date().getMonth() + 1, day: new Date().getDate()};        //设定时间的最大值为今天string;

    outPutDate: any = {}

    ngOnInit(){
        if(this.startTime){
            if(typeof(this.startTime) == 'string')
                this.startTime = parseInt(this.startTime);
            this.startDate = this.dateToObj(this.startTime);
        }
        if(this.endTime){
            if(typeof(this.endTime) == 'string')
                this.endTime = parseInt(this.endTime);
            this.endDate = this.dateToObj(this.endTime);
        }       
    }

    /**
	 * 时间控件与时间对象的相互转换
	 */
    dateToObj(date: number) {
        if(typeof(date) != 'number') return;
        let fullDate = new Date(date);
        let modifyTime:any = {};

        modifyTime.year = fullDate.getFullYear();
        modifyTime.month = fullDate.getMonth() + 1;
        modifyTime.day = fullDate.getDate();
        
        return modifyTime;
    }

    objToDate(oriDate: any) {
        let dateStr = oriDate.year + '-' + oriDate.month + '-' + oriDate.day;
        let date = new Date(dateStr);
        let timeStamp = date.getTime().toString();
        return timeStamp;
    }
    

	setEndInterval($event: any){
        if(!$event) return;
        this.outPutDate.startTime = this.objToDate($event);
        this.timeSetted.emit(this.outPutDate);
        if($event){
			this.minEndDate = $event;
		}else{
			this.minEndDate = null;
		}
	}
	setStrartInterval($event: any){
        if(!$event) return;
        this.outPutDate.endTime = this.objToDate($event);
        this.timeSetted.emit(this.outPutDate);
		if($event){
			this.maxStartDate = $event;
		}else{
			this.maxStartDate = {year: new Date().getFullYear(), month: new Date().getMonth() + 1, day: new Date().getDate()};
		}
	}

}