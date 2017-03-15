import { Component, OnInit, Input, ViewChild, ElementRef } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { DialogPlugin, DialogModel } from '../../common/ug-dialog/dialog';
import { KnowledgeImportService } from './knowledge_import.service';

@Component({
	selector: 'knowledge-import',
	templateUrl: 'knowledge_import.component.html',
	styleUrls: ['./knowledge_import_management.css'],
	providers: [KnowledgeImportService]
})

export class KnowledgeImport implements OnInit {
	@Input() curOrg: any;
	@ViewChild(DialogPlugin) dialogPlugin: DialogPlugin;
	constructor(
		private location: Location,
		private route: ActivatedRoute,
		private router: Router,
		private el: ElementRef,
		private knowledgeImportService: KnowledgeImportService
	) {
		this.route.queryParams.subscribe((params: any) => {
			typeof params['org'] === "undefined" ? '' : (this.curOrg = JSON.parse(decodeURIComponent(params['org'])));
		});
	}

	hospitalDataImportAPI = 'api/v1/hospitalDataImport';
	progress: string = "10%";
	faild: boolean;
	uploadfile: any;
	uploading: boolean;
	uploaded: boolean;
	result: any[];


	ngOnInit() {
		//直接输入地址无法获得当前机构，路由导航到知识导入列表页面
		if (!this.curOrg) {
			this.router.navigate(['knowledge_sharing/knowledge_import_management/knowledge_import_list']);
			return;
		}

		this.getImportProgress(true);		//410  没请求过   500  失败，有错误信息   200  -> progress 100 完成  
	}

	/**
	 * 进度查看方法
	 * 用途 => 初次进入是检查是否有未处理完的请求
	 * 		   不间断查询导入进度直到完成
	 */
	getImportProgress(isInit: boolean, t?: any) {
		this.knowledgeImportService.getImportProgress(this.curOrg.hospitalId)
			.then(res => {
				if (isInit) {
					this.initComponent(res);		//只有初始化的时候调用
					return;
				}
				this.excuteResult(res, t);
			});
	}

	initComponent(res: any) {
		if (res.code == 410 || res.code == 500 || (res.code == 200 && res.data.progress == 100)) {
			//未上传或上传完成
			return;
		}
		if (res.code == 200 && res.data.progress != 100) {
			//上次上传还未完成，继续
			this.uploading = true;
			this.progress = res.data.progress + "%";
			this.serializeResult(res.data.result);

			this.checkProgress();	//开启进度监控
		}
	}

	excuteResult(res: any, t?: any) {
		//this.uploading = true;
		this.progress = res.data.progress + "%";
		this.serializeResult(res.data.result);

		if (res.data.progress == 100) {
			this.uploaded = true;
			this.uploading = false;

			if (t) {
				clearInterval(t);
			}
			if (res.code == 500) {
				this.faild = true;
				this.dialogPlugin.tip(res.message);
			}
		}
	}
	//进度序列化
	serializeResult(resData: any) {
		this.result = ["0: 开始..."];
		for (let attr in resData) {
			this.result.push(attr + "%: " + resData[attr]);
		}
	}

	checkProgress() {
		this.getImportProgress(false);

		let t = setInterval(() => {
			this.getImportProgress(false, t);
		}, 1000);
	}

	/**
	 * 返回
	*/
	goBack() {
		this.location.back();
	}

	/**
	 * 上传
	 * # 临时处理方案 #
	 */
	readFile(file: any) {
		this.uploadfile = file.files[0];
	}
	addFile() {
		if (!this.uploadfile) {
			this.dialogPlugin.tip("请先选择一个文件！");
			return;
		}
		//初始化部分数据
		this.faild = false;
		this.uploading = true;
		this.uploaded = false;
		this.progress = "10%";
		this.serializeResult({});

		let formData: FormData = new FormData();
		formData.append('file', this.uploadfile);
		formData.append('hospitalId', this.curOrg.hospitalId);

		let xhr: XMLHttpRequest = new XMLHttpRequest();
		xhr.onreadystatechange = () => {
			if (xhr.readyState === 4) {
				if (xhr.status === 200) {
					let body = JSON.parse(xhr.response);
					let fileData = body.data;
					if (body.code == 200) {
						this.checkProgress();	//开启进度监控
					} else {
						this.dialogPlugin.tip("上传文件失败！");
					}
				} else {
					this.dialogPlugin.tip("上传文件失败！");
				}

			}
		};
		xhr.open('POST', this.hospitalDataImportAPI, true);
		xhr.send(formData);
	}


}