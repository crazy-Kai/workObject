import { Component, OnInit, ViewChild } from '@angular/core';

import { UserService } from '../../user.service';
import { ProductUploadService } from './product_upload.service';
import { DialogPlugin } from '../../common/ug-dialog/dialog';

interface UploadElement extends HTMLElement {
	uploadify: Function
}

@Component({
	selector: 'product-update',
	template: require('./product_update.component.html'),
	providers: [
		ProductUploadService
	]
})
export class ProductUpdateComponent {
	constructor(
		private userService: UserService,
		private productUploadService: ProductUploadService
	) { }

	@ViewChild(DialogPlugin) dialogPlugin: DialogPlugin;
	uploadFile(file: any) {
		let uploadfile = file.files[0];
		this.productUploadService.hasProgress = true;
		this.productUploadService.makeFileRequest(uploadfile);
	}

	//删除非本次导入产品
	deleteProducts() {
		this.dialogPlugin.confirm('确定删除非本次导入的产品数据？', () => {
			// this.productUploadService
		}, () => { });
	}

	cancelUpload() {
		let productDom = document.getElementById('#productUpload') as UploadElement
		if (productDom instanceof HTMLElement)
			productDom.uploadify('cancel');
	}
}
