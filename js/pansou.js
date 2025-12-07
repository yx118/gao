var rule = {
	title:'盘搜',
	host:'https://so.252035.xyz',
	homeUrl:'/',
	url: '',
	filter_url:'',
	filter:{
	},
	searchUrl: '/api/search?kw=**',
	searchable:2,
	quickSearch:0,
	filterable:0,
	headers:{
		'User-Agent': PC_UA,
		'Accept': 'application/json',
		'Content-Type': 'application/json',
	},
	timeout:5000,
	play_parse:true,
	lazy:`js: 
input = panPlay(input,playObj.flag)
`,
	limit:6,
	推荐:'',
	一级:'',
	二级:`js:
	let id=input;
	let title="";
	let pic="";
	let typeName="";
	let dec=id;
	let remark="";
	let vod={vod_id:id,vod_name:title,vod_pic:pic,type_name:typeName,vod_remarks:remark,vod_content:dec};
	
	initPan();
	let panVod = panDetailContent(vod ,[input]);
	TABS = panVod.tabs
	LISTS = panVod.lists
	detailError = panVod.error
	vod["vod_play_from"]=panVod.tabs.join("$$$");

	for (var i in LISTS) {
		if (LISTS.hasOwnProperty(i)) {
			try {
			LISTS[i] = LISTS[i].map(function (it) {
				return it.split('$').slice(0, 2).join('$');
			});
			} catch (e) {
			print('格式化LISTS发生错误:' + e.message);
			}
		}
	}
	vod_play_url = LISTS.map(function (it) {
		return it.join('#');
	}).join("$$$");
	vod["vod_play_url"]=vod_play_url;
	VOD=vod;
	`,
	搜索:`js:
	function get_result(){
		// 优先使用自定义URL，如果没有配置则使用默认searchUrl
		var c = rule.params;
		let searchUrl = '';
		if (c && c.trim() !== '') {
			// rule.params是经过URL编码的，需要先解码
			try {
				searchUrl = decodeURIComponent(c);
			} catch (e) {
				// 如果解码失败，使用原始值
				searchUrl = c;
			}
		} else {
			searchUrl = rule.searchUrl;
		}
		const url = searchUrl.replace('**', encodeURIComponent(KEY));
		let response;
		try {
			response = request(url);
			const result = JSON.parse(response);
			
			// 检查返回状态
			if (!result || result.code !== 0 || !result.data) {
				return [];
			}
			
			const data = result.data;
			const videos = [];
			const processedLinks = new Set(); // 用于去重
			
			// 处理 merged_by_type 数据
			if (data.merged_by_type) {
				for (const type in data.merged_by_type) {
					if (data.merged_by_type.hasOwnProperty(type)) {
						const links = data.merged_by_type[type];
						if (Array.isArray(links)) {
							for (const link of links) {
								if (!link.url) continue;
								
								// 生成唯一标识用于去重
								const linkKey = type + '|' + link.url;
								if (processedLinks.has(linkKey)) continue;
								processedLinks.add(linkKey);
								
								// 构建资源名称
								let vodName = link.note || link.title || '未知资源';
								
								// 处理图片
								let pic = '';
								if (link.images && Array.isArray(link.images) && link.images.length > 0) {
									pic = link.images[0];
								}
								
								// 构建备注信息
								let remark = type.toUpperCase();
								if (link.source) {
									remark += (remark ? ' | ' : '') + link.source;
								}
								
								// 构建完整的链接（包含提取码）
								let vodId = link.url;
								
								videos.push({
									vod_id: vodId,
									vod_name: vodName,
									vod_pic: pic,
									vod_remarks: remark,
								});
							}
						}
					}
				}
			}
			
			return videos;
		} catch (e) {
			print('搜索发生错误: ' + e.message);
			return [];
		}
	}
	
	VODS = get_result();
`,
}

