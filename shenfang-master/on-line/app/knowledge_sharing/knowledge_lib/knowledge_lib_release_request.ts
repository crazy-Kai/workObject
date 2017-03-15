/**
 * 发布请求
 */
export class KnowledgeLibReleaseRequest{
	/** 发布请求 */
	id: string;
	publishedTime: number;		//发布时间
	publishedBy: string;		//发布人
	publishedName: string;		//发布
	publishContent: String;		//发布内容
	confirmInfo: string;		//确认信息
	auditInfo: string;			//审核意见

	status: number;		//发布进度: 0:发布请求开始处理; 100:发布请求执行完毕; 101:发布自测通过; 102:发布自测不通过; 103:审核通过; 104:审核不通过
	statusName:	string;
	confirmPackagePath: string;	

	/** 测试结果 */
	testResultStatus: number;	//测试结果:
	testResultContent: string;	//测试意见:

	/** 审核结果 */
	auditedTime: number;	//审核时间
	auditedBy: string;		//审核人
	auditedName: string;	//
	auditedRemark: string;	//审核备注说明

	/** 知识库发布流程相关 */
	private static publishStatusMap = {
		"0": "发布已提交",
		"100": "发布待自测",
		"101": "自测通过,待审核",
		"102": "自测不通过",
		"103": "审核通过",
		"104": "审核不通过"
	};

	/** 返回当前发布流程对应的解释 */
	public getStatusName() : string {
		if ( this.status == undefined ) return null;
		return KnowledgeLibReleaseRequest.publishStatusMap[this.status];
	}

	public static getPublishedStatusMap() {
		return KnowledgeLibReleaseRequest.publishStatusMap;
	}

	/**
	 * 构造函数
	 */
	constructor(
		id:string, submitTime: number, submitor: string, releaseContent: string, confirmPackagePath: string,
		testResultStatus: number, testResultContent: string,
		auditTime: number,
		auditor: string,
		status: any,
		auditRemark: string
	 ) {
		this.id = id;
		this.publishedBy = submitor;
		this.publishedTime = submitTime;
		this.publishContent = releaseContent;
		this.confirmPackagePath = confirmPackagePath;
		this.testResultStatus = testResultStatus;
		this.testResultContent = testResultContent;
		this.auditedTime = auditTime;
		this.auditedBy = auditor;
		this.status = status;
		this.auditedRemark = auditRemark;
	}
	
	/**
	 * 提供一个mokc方法，构造测试数据对象
	 */
	public static mockNewInstance(status: number) : KnowledgeLibReleaseRequest {
		let mockObject: KnowledgeLibReleaseRequest = new KnowledgeLibReleaseRequest(
			"test-id", 123456789, "testor", "test post", "--",
			null, null, null, null, status, null
		);
		return mockObject;
	}

	/**
	 * 提供一个方法,在get查询时,可以自动拼装成key=value字符串
	 */
	public toKeyValueStringByQuery() {
		return "publishId=" + this.id + "&publishedBy=" + this.publishedBy + 
			"&auditedBy=" + this.auditedBy + "&status=" + this.status ;			
	}
}