import { Pipe, PipeTransform } from '@angular/core';

@Pipe({name: 'formatListToStr'})
export class FormatListToStrPipe implements PipeTransform {
	transform(value: any[], exponent?: string){
		let exStr: string = "";
		if(!value) return;

		if(!exponent){
			exStr = value.join(" | ");
		}else{
			for(let i = 0; i < value.length; i++){
				if(i == 0){
					exStr += value[i][exponent];
				}else{
					exStr = exStr + " | " + value[i][exponent];
				}
			}
		}
		
		return exStr;
	}
}