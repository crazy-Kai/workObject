import { Component, OnInit, Input, Output, EventEmitter, OnChanges, ViewChild, ViewChildren, QueryList } from '@angular/core';
import { PathLocationStrategy } from '@angular/common';
import { TablePlugin } from '../../common/ug-table/table.module';
import { SpecificationService } from "./specification.service";
import { ActivatedRoute } from '@angular/router';
import { Router } from '@angular/router';

import { ProductDto } from '../../drug_management/drug_data/product_detail';
import { UserService } from '../../user.service';


@Component({
    selector: 'specification-review',
    template: require('./specification_review.component.html'),
    styles: [require('./content_management.component.css') + ""],
    providers: [
        SpecificationService,
        PathLocationStrategy
    ]
})
export class SpecificationReviewComponent implements OnInit {
    @Input() instructionId: string; 
    @ViewChildren(TablePlugin) tablePlugins: QueryList<TablePlugin>;
    @Output() reviewComplete: EventEmitter<any> = new EventEmitter();
    constructor(
        private specificationService: SpecificationService,
        private route: ActivatedRoute,
        private router: Router,
        private userService: UserService,
        private pathLocationStrategy: PathLocationStrategy
    ) { }
    //instructionId: string;
    instructionDto: any = {
        product: {},
        spacList: [],
    };
    instructionImgs:any[] = []; 

    ngOnInit() {
        //this.getRouteParam();
        this.getInstruction();
        this.getInstructionImg();
    }

    turnToInstructionListPage() {
        let link = ['data_management/content_management/specification_management'];
        this.router.navigate(link);
    }

    getInstruction() {
        if (this.instructionId) {
            this.specificationService.getInstruction(this.instructionId)
                .then(res => {
                    this.instructionDto = res;
                    this.instructionDto.contents = this.instructionDto.contents ? this.instructionDto.contents.replace(/\n/g, '<br/>') : "";
                    this.instructionDto.summary = this.instructionDto.summary ? this.instructionDto.summary.replace(/\n/g, '<br/>') : "";
                });
        } else {
            console.log("instructionId为空");
        }
    }
    
    /**
     * 通过url 获取说明书id
     */
    // getRouteParam() {
    //     this.route.params.subscribe(params => {
    //         if ((params['id'] !== undefined)) {
    //             this.instructionId = params['id'];
    //         }
    //     });
    // }
    
    getBack(){
        this.reviewComplete.emit("done");
        this.pathLocationStrategy.back();
    }

    /**
     * 获取说明书原件
     */
    getInstructionImg(){
        this.specificationService.getInstructionImg(this.instructionId)
            .then(res => {
                if(res.data){
                    this.instructionImgs = res.data;
                }
            });
    }
    preview(img:any){
        let url = "/api/v1/orgFileOpen?filePath=" + img.filePath;
        window.open(url, '_blank');
    }
}


