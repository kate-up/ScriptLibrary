/*
 * aweto.framework
 * aweto平台封装工具脚本库
 *
 * Copyright (c) 2013 XuMian
 *
 * Dual licensed under the GPL (http://www.gnu.org/licenses/gpl.html)
 * and MIT (http://www.opensource.org/licenses/mit-license.php) licenses.
 *
 */
if(!window.aweto){
	window.aweto=function(){};
}

var ERROR="-1";
var WARN="-2";
var SUCCESS="0";
var license;
var moduleId;// 功能模块
var listHeight=450;
var entityName;
var workflowNo;
var workflowId;// 工作流编号
var workflowFlg;// 工作流启用标识
var currentUser;
var currentEmp;
var regionFlag=false;
var regionFields=[];
var attachmentFlag=false;// 附件标识
var attachmentFlagId;// 附件标识ID
var attachmentPermission={view:true,modify:true};// 附件操作权限
var moduleOprControl;// 模块操作权限控制
var modOprs=[];
aweto.pkValue="-1";
var theme;
var menuType;
var orgList;//所有公司列表
var userOrgs;//用户拥有公司列表
var defaultOrgId;//登录公司
var defaultOrgName;
var referBuffer;//参照值缓存
var POI_CONFIG;//导入导出配置
var POI_PARAMS={};//导入导出传递参数
var moduleHelpFlag=false;//模块帮助标识

$(function(){
	//初始化所有下拉选项
	if ($.fn.select2 !== undefined) {
        $.fn.select2.defaults.set( "theme", "bootstrap" );
		$("select.form-select2").each(function () {
			$(this).select2({
                placeholder: "请选择",
                allowClear: true
            }).on("change", function () {
				$(this).valid();
			})
		})
	}
	if(moduleId){
		aweto.body.initMenu();
	}
})


aweto.clearJqueryContent=function(){
	try{
		window.detachEvent("onload",jQuery.ready);
		for(var id in jQuery.cache){
			if(jQuery.cache[id].handle){
				try{
					jQuery.event.remove(jQuery.cache[id].handle.elem);
				}catch(e){}
			}
		}
		window.jQuery = window.$ = null;
	}catch(err){}
};
aweto.openWindow=function(url){
	var newWindow = window.open(url,"");
	var x=screen.availWidth;
	var y=screen.availHeight;
	newWindow.moveTo(0,0);
	newWindow.resizeTo(x,y-1);
};

aweto.getOrgName=function(orgId){
	if(orgId=="-1"){
		return "";
	}
	if(orgList){
		for(var i=0;i<orgList.length;i++){
			if(orgList[i].orgId==orgId){
				return orgList[i].orgNam;
			}
		}
	}
	return orgId;
};


//获取公司下拉框
aweto.getSelectOrg=function(id,change,config){
	var str = "<li style='padding-top:3px; margin-left: 5px; margin-right: 5px;";
	
	if(config){
		str += " float:"+config+";";
	}else{
		str += " float:right;";
	}
	str +="' ><select id='"+id+"' style='width:120px;'></select></li>";
	var selectLi = $(str);
	var filterSelector = $("select",selectLi);
	var orgs=aweto.getUserOrgs();
	
	for(var i=0;i<orgs.length;i++){
		if(orgs[i].orgId==defaultOrgId){
			filterSelector.append("<option value='"+orgs[i].orgId+"' selected='selected'>"+orgs[i].orgNam+"</option>");
		}else{
			filterSelector.append("<option value='"+orgs[i].orgId+"'>"+orgs[i].orgNam+"</option>");
		}
	}
	$("#"+id,selectLi).change(function(){
		if(typeof change == 'function'){
			var orgId = $("#"+id,selectLi).val();
			change(orgId);
		}});
	
	return selectLi;
}

//treeButton构建方法
aweto.getTreeButtonSelect=function(id,change,config,key,value){
	var str = "<li style='padding-top:3px; margin-left: 5px; margin-right: 5px;";
	
	if(config){
		str += " float:"+config+";";
	}else{
		str += " float:right;";
	}
	str +="' ><select id='"+id+"' style='width:120px;'></select></li>";
	var selectLi = $(str);
	var filterSelector = $("select",selectLi);
	var values = value.split(",");
	var keys = key.split(",");
	
	for(var i=0;i<keys.length;i++){
		if(i == 0){
			filterSelector.append("<option value='"+keys[i]+"' selected='selected'>"+values[i]+"</option>");
		}else{
			filterSelector.append("<option value='"+keys[i]+"'>"+values[i]+"</option>");
		}
	}
	$("#"+id,selectLi).change(function(){
		if(typeof change == 'function'){
			var keyId = $("#"+id,selectLi).val();
			change(keyId);
		}});
	
	return selectLi;
}


aweto.getUserOrgs=function(){
	return userOrgs;
};
aweto.getUserOrgIds=function(){
	var orgIds=[];
	for(var i=0;i<userOrgs.length;i++){
		orgIds.push(userOrgs[i].orgId);
	}
	return orgIds;
};
aweto.getOrgList=function(){
	return orgList;
};
aweto.lang.mapping=(function(){
	return aweto.lang[aweto.lang.js];
})();

aweto.lang.label=function(name){
	if(aweto.lang.mapping[name]){
		return aweto.lang.mapping[name];
	}else{
		return name;
	}
};
// 字符串工具
String.prototype.format = function() {
    var args = arguments;
    return this.replace(/\{(\d+)\}/g,
        function(m,i){
            return args[i];
        });
};

String.prototype.trim=function(){
    return this.replace(/(^\s*)|(\s*$)/g, "");
 };

String.prototype.endsWith = function(str){
	    return (this.match(str+"$")==str);
};
String.prototype.startsWith = function(str){
	    return (this.match("^"+str)==str);
};

Function.prototype.createDelegate = function(context) {
    var _t = this;
    return function(){
        _t.apply(context, arguments);
    };
};


/* String replacement method */
aweto.replace=function(original, oldString, newString) 
{
	if(original==undefined){
		return "";
	}
	if(typeof original.indexOf!='function'){
		return original;
	}
	var i;
	while((i = original.indexOf(oldString))>-1)
	{
		original = original.substring(0,i) + newString + original.substring(i + oldString.length);
	}
	return original;
};

aweto.contains=function(container, child)
{
	var found = false;
	if(undef(container) || undef(child))
		return found;
	try
	{
		found = container.contains(child);
	}
	catch(error)
	{
		var els = container.getElementsByTagName(child.tagName);
		for(var i=0;i<els.length;i++)
		{
			var el = els[i];
			if(el.id==child.id)
			{
				found = true;
				break;
			}	
		}
	}
	return found;
};

/*
 * Checks to see if a value is null, empty or undefined
 */
aweto.valid=function(p)
{
    var bUndef = false;
    switch(typeof(p))
    {
        case "undefined" :
        	bUndef = true;
    	    break;
        case "null" :
	        bUndef = true;
        	break;
        case "object" :
        	if(p == null)
        		bUndef = true;
       		break;
        case "number" :
	        if(null == p)
	        	bUndef = true;
    	    break;
        case "string" :
        	if("" == p)
        		bUndef = true;
	        else if("null" == p)
	        	bUndef = true;
	        else if("undefined" == p)
	        	bUndef = true;
	        break;
    }
    return bUndef;
};


aweto.array=function(){return this;};
aweto.array.contains=function(array,d){
	for(var i=0;i<array.length;i++){
		if(array[i]==d){
			return true;
		}
	}
	return false;
}
// 移除数组中的元素
aweto.array.remove=function(array,dx){
	if(isNaN(dx)||dx>array.length){return false;}
	var tmp=new Array();
	for(var i=0;i<array.length;i=i+1)
	{
		if(i!=dx){
			tmp.push(array[i]);
		}
	}
	  return tmp;
};
// 移除数组中重复的元素
aweto.array.unique=function(data){ 
	data = data || []; 
	var a = {}; 
	len = data.length; 
	for (var i=0; i<len;i++){ 
	var v = data[i]; 
	if (typeof(a[v]) == 'undefined'){ 
	a[v] = 1; 
	} 
	}; 
	data.length=0; 
	for (var i in a){ 
	data[data.length] = i; 
	} 
	return data; 
} ;

aweto.date=function(){};

aweto.date.currentDate=function(fmt){
	var d=new Date();
	var yyyy=d.getFullYear();
	var mm=d.getMonth()+1;
	var dd=d.getDate();
	if(mm<10){
		mm="0"+mm;
	}
	if(dd<10){
		dd="0"+dd;
	}	
	return yyyy+"-"+mm+"-"+dd;
};

aweto.date.currentDateTime=function(fmt){
	var d=new Date();
	var yyyy=d.getFullYear();
	var mm=d.getMonth()+1;
	var dd=d.getDate();
	var hh = d.getHours();
	var minu = d.getMinutes();
	var second = d.getSeconds();
	if(mm<10){
		mm="0"+mm;
	}
	if(dd<10){
		dd="0"+dd;
	}	
	if(hh<10){
		hh="0"+hh;
	}
	if(minu<10){
		minu="0"+minu;
	}
	if(second<10){
		second="0"+second;
	}
	if(fmt == 'datetimeSS'){
		return yyyy+"-"+mm+"-"+dd+" "+hh+":"+minu+":"+second;
	}else{
		return yyyy+"-"+mm+"-"+dd+" "+hh+":"+minu;
	}
	
};

// 计算格式为yyyy-mm-dd的两个日期之差
aweto.date.getSub=function(sdate1, sdate2) {
	sdate1 = sdate1.split("-")[1]+"/"+sdate1.split("-")[2]+"/"+sdate1.split("-")[0];
	sdate2 = sdate2.split("-")[1]+"/"+sdate2.split("-")[2]+"/"+sdate2.split("-")[0];
	var adate, odate1, odate2, idays;
	odate1 = new Date(sdate1);
	odate2 = new Date(sdate2);
	idays = parseInt(Math.abs(odate1.getTime() - odate2.getTime()) / 1000 / 60
				/ 60 / 24 + 1);
	return idays;
};
// 将格式为yyyy-mm-dd的日期字符串转换为JS date类型
aweto.date.parseToDate=function(sdate){
	sdate = sdate.split("-")[1]+"/"+sdate.split("-")[2]+"/"+sdate.split("-")[0];
	return new Date(sdate);
};
// 将JS date类型转换为格式为yyyy-mm-dd的日期字符串
aweto.date.dateToString=function(date){
	var yyyy=date.getFullYear();
	var mm=date.getMonth()+1;
	var dd=date.getDate();
	if(mm<10){
		mm="0"+mm;
	}
	if(dd<10){
		dd="0"+dd;
	}	
	return yyyy+"-"+mm+"-"+dd;
};
aweto.number=function(){return this;};
// 给数字每三位添加一个逗号
aweto.number.format=function(number){
	return number.replace(/(?=(?:\d{3})+(?!\d))/g,','); 
};

//时间控件显示
aweto.dateMinutePicker=function(obj){
	if($(obj).hasClass("i-form-field-disabled")){
		return;
	}
	var dateFmt='HH:mm';
	
	WdatePicker({dateFmt:dateFmt});
};

// 日历控件显示
aweto.datePicker=function(obj){
	if($(obj).hasClass("i-form-field-disabled")){
		return;
	}
	var date=$(obj).attr("date");
	var name=$(obj).attr("name");
	var fieldType=$(obj).attr('fieldType');
	var dateFmt='yyyy-MM-dd';
	if(fieldType=='yyyy'){
		dateFmt='yyyy';
	}
	if(fieldType=='datetime'){
		dateFmt='yyyy-MM-dd HH:mm';
	}
	if(fieldType=='datetimeMM'){
		dateFmt='yyyy-MM';
	}
	if(fieldType=='datetimeSS'){
		dateFmt='yyyy-MM-dd HH:mm:ss';
	}
	if(date){
		var tname=name;
		if(name.indexOf(".">0)){
			tname=aweto.replace(name, ".", "_"); 
		}
		if(date=="min"){
			WdatePicker({maxDate:"#F{$dp.$D('s_"+tname+"_max')}",dateFmt:dateFmt});
		}else if(date=="max"){
			WdatePicker({minDate:"#F{$dp.$D('s_"+tname+"_min')}",dateFmt:dateFmt});
		}
	}else{
		WdatePicker({isShowClear:true,readOnly:false,dateFmt:dateFmt});
	}
};

/** 日历控件(关联开始时间和结束时间两个控件)显示 add by yuanh */
aweto.datePickerForRelate=function(obj){
	if($(obj).hasClass("i-form-field-disabled")){
		return;
	}
	
	var fieldType=$(obj).attr('fieldType');
	var dateFmt='yyyy-MM-dd';
	if(fieldType=='datetime'){
		dateFmt='yyyy-MM-dd HH:mm';
	}
	if(fieldType=='datetimeSS'){
		dateFmt='yyyy-MM-dd HH:mm:ss';
	}
	var min=$(obj).attr("min");
	var max=$(obj).attr("max");
	
	// begin
	var maxDate = undefined;
	var minDate = undefined;
	try{
		maxDate = eval("("+$(obj).attr("maxDate")+")")();
		
	}catch(e){
		maxDate = undefined;
	}
	if(maxDate && !aweto.check.isDate(maxDate)){
		maxDate = undefined;
	}
	
	try{
		minDate = eval("("+$(obj).attr("minDate")+")")();
	
	}catch(e){
		
		minDate = undefined;
	}
	if(minDate && !aweto.check.isDate(minDate)){
		minDate = undefined;
	}
	try{
		min = $("#"+min).val().trim();
	}catch(e){
		min = undefined;
	}
	
	try{
		max = $("#"+max).val().trim();
	}catch(e){
		max = undefined;
	}
	if(min && minDate && minDate < min){
		minDate = min;
	}else if(min && !minDate){
		minDate = min;
	}
	
	if(max && maxDate && maxDate > max){
		maxDate = max;
	}else if(max && !maxDate){
		maxDate = max;
	}
	if(minDate && maxDate){
		WdatePicker({minDate:minDate,maxDate:maxDate,dateFmt:dateFmt});
	}else if(minDate){
		WdatePicker({minDate:minDate,dateFmt:dateFmt});
	}else if(maxDate){
		WdatePicker({maxDate:maxDate,dateFmt:dateFmt});
	}else{
		WdatePicker({isShowClear:true,readOnly:false,dateFmt:dateFmt});
	}
	// end
	
// if(min && max){
// if(min.indexOf(".">0)){
// min=aweto.replace(min, ".", "_");
// }
// if(max.indexOf(".">0)){
// max=aweto.replace(max, ".", "_");
// }
// WdatePicker({minDate:"#F{$dp.$D('"+min+"')}",maxDate:"#F{$dp.$D('"+max+"')}",dateFmt:dateFmt});
// }else if(min){
// if(min.indexOf(".">0)){
// min=aweto.replace(min, ".", "_");
// }
// WdatePicker({minDate:"#F{$dp.$D('"+min+"')}",dateFmt:dateFmt});
// }else if(max){
// if(max.indexOf(".">0)){
// max=aweto.replace(max, ".", "_");
// }
// WdatePicker({maxDate:"#F{$dp.$D('"+max+"')}",dateFmt:dateFmt});
// }else{
// WdatePicker({isShowClear:true,readOnly:false,dateFmt:dateFmt});
// }
};

//导入、导出--生成导入模板
aweto.generateImportTemplate=function(fileName,entity){
	var fn=fileName;
	if(fn==undefined){
		fn="导入模板";
	}
	var en=entity;
	if(entity==undefined){
		en=entityName;
	}
	layer.load();
	aweto.ajax(basePath+'/pub/generateImportTemplate.ajax',{pkValue:pkValue,_entityName:en},true,function(r){
		layer.closeAll('loading');
		if(r.state==SUCCESS){
			aweto.downloadFile({
				filePath:r.param.filePath,
				saveName:r.param.saveName,
				fileName:fn,
				fileType:'xls'
			});
		}
	});
}

aweto.exportToExcel=function(fileName,entity){
	var fn=fileName;
	if(fn==undefined){
		fn="导入模板";
	}
	var en=entity;
	if(entity==undefined){
		en=entityName;
	}
	var pageCondition = {};
	var condition = "";
	var orderField = "";
	var orderCondition = "";
	var parentId="";
	if(typeof tableList !=undefined){
		try{
			condition=tableList.getCondition();
			orderField = tableList.getParam("orderField");
			orderCondition = tableList.getParam("orderCondition");
			tableList.getParentId();
		}catch(e){}
	}
	if(condition){
	}else{
		condition="";
	}
	pageCondition = $.extend(pageCondition,{condition:condition,orderField:orderField,orderCondition:orderCondition});
	layer.load();
	var data=$.extend(pageCondition,{_entityName:en});
	data = $.extend(data,POI_PARAMS);
	aweto.ajax(basePath+'pub/exportToExcel.ajax',data,true,function(r){
		layer.closeAll('loading');
		if(r.state==SUCCESS){
			aweto.downloadFile({
				filePath:r.param.filePath,
				saveName:r.param.saveName,
				fileName:fn,
				fileType:'xls'
			});
		}
	});
}

aweto.importFromExcel=function(flagField,callback,entity,overwrite){
	var ff=flagField;
	if(ff==undefined){
		layer.msg('请设置唯一标识字段名称', {icon: 5});
		return;
	}
	var en=entity;
	if(entity==undefined){
		en=entityName;
	}
	var ow='1';
	if(overwrite==false||overwrite=='0'){
		ow='0';
	}
	aweto.fileupload.show({
		//maxSize:1024*1024,
		pathType:'absolute',
		savePath:'tmp/import',
		limitTypes:["xls"],
		namePrefix:'imp-',
		suffix:true,
		messages:["请上传由系统生成的模板文件,请将模板文件保存为office2003版本格式"],
		success: function(data,state){
	    	if(data.state==SUCCESS){
	    		layer.confirm('上传成功，开始导入模板数据？', function(index){
	    			var dataTmp={flagField:ff,overwrite:ow,pkValue:pkValue,filePath:data.param.path,_entityName:entityName};
		    		dataTmp = $.extend(dataTmp,POI_PARAMS);
		    		var loading=layer.msg('正在导入，请等待...', {
		    			  icon: 16
		    			  ,shade: 0.01
		    		});
					aweto.ajax(basePath+'pub/importFromExcel.ajax',dataTmp,true,function(r){
						layer.close(loading);
						if (tableList) {
							tableList.refresh();
						}
						if(typeof callback=='function'){
							callback(r);
						}
						if(r.state==SUCCESS){
							 layer.msg(r.msgInfo, {icon: 1});//成功
						}else{
							layer.msg("数据导入遇到问题，"+r.msgInfo, {icon: 5});//不开心
						}
					});
	    			layer.close(index);
	    		 });
	    	}else{
	    		layer.msg(data.msgInfo, {icon: 5});//不开心
	    	}
		}});
}

//图片上传控件
aweto.imageUploader=function(obj){
	if($(obj).hasClass("i-form-field-disabled")){
		return;
	}
	var imgPath=$(obj).attr("imgPath");
	var imgDemo=$(obj).attr("imgDemo");
	var messages=$(obj).attr("messages");
	var maxSize=$(obj).attr("maxSize");
	if(messages==undefined){
		messages="";
	}
	if(maxSize==undefined){
		maxSize=1024*1024;
	}
	var callback=$(obj).attr("callback");
	if(callback!=undefined){
		callback=eval(callback);
	}
	aweto.fileupload.show({
		maxSize:maxSize,
		savePath:'images',
		namePrefix:'IMG-',
		messages:[messages],
		success: function(data,state) {
	    	if(data.state==SUCCESS){
		    	$("#"+imgPath).val(data.param.path);
		    	$("#"+imgDemo).attr("src",data.param.path);
		    	if(typeof callback=='function'){
					callback(data);
				}
	    	}else{
				aweto.Dialog.show('提示',data.msgInfo);
	    	}
	}});
};
//列表选择器控件
aweto.tableSeletor=function(obj){
	var entityName=$(obj).attr("entityName");
	var renderFields=$(obj).attr("renderFields");
	var url=$(obj).attr("url");
	var title=$(obj).attr("title");
	var idObj=$(obj).attr("idObj");
	var descObj=$(obj).attr("descObj");
	var descField=$(obj).attr("descField");
	var pageLevel=$(obj).attr("pageLevel");
	var conditionGeter=$(obj).attr("conditionGeter");
	if(descField==undefined){
		descField=descObj;
	}
	if(pageLevel==undefined){
		pageLevel="current";
	}
	var callback=$(obj).attr("callback");
	if(callback!=undefined&&callback!=""){
		callback=eval(callback);
	}
	var defaultConditions={};
	var funcName=conditionGeter;
	var func=eval(funcName);
	if(typeof func=='function'){
		defaultConditions=func();
	}
	aweto.selector.showTableSelector({
		entityName:entityName,
		renderFields:renderFields,
		url:url,
		single:true,
		title:title,
		pageLevel:pageLevel,
		defaultConditions:defaultConditions,
		returnType:'rows',  //pkValue,rows
		onSubmit:function(d){
			$("#"+idObj).val(d[0].pkValue);
			$("#"+descObj).val(d[0][descField]);
			if(typeof callback=='function'){
				callback(d);
			}
		}
	});
}
//treeGrid选择器控件
aweto.zTreeTableSelector=function(obj){
	var treeUrl=$(obj).attr("treeUrl");
	var tableUrl=$(obj).attr("tableUrl");
	var title=$(obj).attr("title");
	var descField=$(obj).attr("descField");
	var idObj=$(obj).attr("idObj");
	var descObj=$(obj).attr("descObj");
	var callback=$(obj).attr("callback");
	if(callback!=undefined&&callback!=""){
		callback=eval(callback);
	}
	aweto.selector.showZTreeTableSelector({
		treeUrl:basePath+treeUrl,
		tableUrl:basePath+tableUrl,// 检索响应url
		title:title,
		descField:descField,// 已选区域显示字段
		single:true,
		returnType:{id:true,desc:true},
		onSubmit:function(d){
			$("#"+idObj).val(d[0].id);
			$("#"+descObj).val(d[0].desc);
			if(typeof callback=='function'){
				callback(d);
			}
		}
	});
}
//tree选择器控件
aweto.zTreeSelector=function(obj){
	var entityName=$(obj).attr("entityName");
	var treeUrl=$(obj).attr("treeUrl");
	var selectUrl=$(obj).attr("selectUrl");
	var searchUrl=$(obj).attr("searchUrl");
	var title=$(obj).attr("title");
	var idObj=$(obj).attr("idObj");
	var descObj=$(obj).attr("descObj");
	var callback=$(obj).attr("callback");
	var conditionGeter=$(obj).attr("conditionGeter");
	if(callback!=undefined&&callback!=""){
		callback=eval(callback);
	}
	var defaultConditions={};
	var funcName=conditionGeter;
	var func=eval(funcName);
	if(typeof func=='function'){
		defaultConditions=func();
	}
	aweto.selector.showZTreeSelector({
		treeUrl:basePath+treeUrl,
		selectUrl:basePath+selectUrl,// 待选数据加载url
		searchUrl:basePath+searchUrl,// 检索响应url
		entityName:entityName,
		single:true,
		title:title,
		defaultConditions:defaultConditions,
		returnType:{id:true,desc:true},
		onSubmit:function(d){
			$("#"+idObj).val(d[0].id);
			$("#"+descObj).val(d[0].desc);
			if(typeof callback=='function'){
				callback(d);
			}
		}
	})
};
//员工选择器控件
aweto.empSelector=function(obj){
	var title=$(obj).attr("title");
	var descField=$(obj).attr("descField");
	var idObj=$(obj).attr("idObj");
	var descObj=$(obj).attr("descObj");
	var callback=$(obj).attr("callback");
	if(callback!=undefined){
		callback=eval(callback);
	}
	aweto.selector.showZTreeTableSelector({
		treeUrl:basePath+'system/depart/departTree.ajax',// 树数据加载
		tableUrl:basePath+'employee/empSelectorList.ajax',// 待选数据加载url
		title:'员工选择',
		descField:'empName',
		states:['STA01','STA02'],// 员工状态(默认为在职、试用)
		single:true,// 是否为单选
		params:{permission:false},
		treeEvent:{folder:true,doc:true},
		returnType:{id:true,desc:true},
		onSubmit:function(d){
			$("#"+idObj).val(d[0].id);
			$("#"+descObj).val(d[0].desc);
			if(typeof callback=='function'){
				callback(d);
			}
		}
	});
};

aweto.windows=function(){
	if (aweto.isTop()) {
		  return window
	}else{
		  return window.parent;
	}
};
// 打开新窗口并最大化
aweto.windows.open=function(url){
	var newWindow = window.open(url,"");
	var x=screen.availWidth;
	var y=screen.availHeight;
	newWindow.moveTo(0,0);
	newWindow.resizeTo(x,y-1);
};
// 关闭当前页面
aweto.windows.close=function(){
	parent.window.opener = null;
	parent.window.open("", "_self");
	parent.window.close();
};


// 去主窗体
aweto.mainWindow=function(){
	if(aweto.isInCenterWindow()){
		return $("#main-window");
	}else{
		return $("#main-window",$(window.parent.document));
	}
	
};
// 主窗体遮罩
aweto.mainWindow.lock=function(message,img,timeout){
	var icon='loading-32.gif';
	var msg='';
	if(img){
		icon=img;
	}
	if(message){
		msg=message;
	}
	aweto.mainWindow().block({width:'60px;',message:"<img src='"+aweto.basePath+"ui/images/"+icon+"' />&nbsp;&nbsp;&nbsp;<span style='vertical-align: middle;'><strong>"+aweto.lang.label(msg)+"</strong></span>"});
	if(timeout){
		setTimeout(function(){aweto.mainWindow.closeLoading();},timeout);
	}
	
};
// 取消主窗体遮罩
aweto.mainWindow.unlock=function(){
	try{
		aweto.mainWindow().unblock();
	}catch(e){alert("error")}
};

aweto.mainWindow.openLoading=function(){
	aweto.mainWindow().block({width:'60px;',message:"<img src='"+aweto.basePath+"ui/images/loadingBar-16.gif' />&nbsp;&nbsp;&nbsp;<span style='vertical-align: middle;'><strong>"+aweto.lang.label("页面加载中...")+"</strong></span>"});
	setTimeout(function(){aweto.mainWindow.closeLoading();},3000);
};

aweto.mainWindow.closeLoading=function(){
	try{
		aweto.mainWindow().unblock();
	}catch(e){}
};



// 控制ajax获取script时的cache模式
jQuery.ajaxScriptCache = false;

// 复制s的属性到t
aweto.mixin = function(t, s) {
    for(k in s) {
        t[k] = s[k];
    }
    return t;
};

aweto.Layout=function(){};
aweto.Layout.closeWest=function(){
	if(aweto.isTop()){
		if(bodyLayout){
			setTimeout(function(){bodyLayout.close('west');},2000);
		}
	}else{
		if(parent.bodyLayout){
			setTimeout(function(){parent.bodyLayout.close('west');},2000);
		}
	}
};
aweto.Layout.openWest=function(){
	if(aweto.isTop()){
		if(bodyLayout)
			bodyLayout.open('west');
	}else{
		if(parent.bodyLayout)
			parent.bodyLayout.open('west');
	}
};

aweto.initMainLayout=function(){
	bodyLayout=$('body').layout({
		north__closable:        true,
		north__spacing_open:    0,
		north__spacing_closed:  0,
		south__closable:        true,
		south__spacing_open:    0,
		south__spacing_closed:  0,
		north__size:            58,
		west__closable:         true,
		west__slidable:         true,
		west__resizable:        true,
        west__size:             190,
        west__spacing_open:     6,
        west__spacing_closed:   6,
        west__contentSelector: '.left-menu',  
        togglerLength_open:         56,
        togglerLength_closed:       56,
        useStateCookie:          true,
        onresize:function(){
			aweto.adaptPageSize();
			if(typeof onPageResize=='function'){
				onPageResize();
			}
		},
		west__onopen_end:function(){
			aweto.adaptPageSize();
		},
		west__onclose_end:function(){
			aweto.adaptPageSize();
		}
    });	
	aweto.adaptPageSize();
};

aweto.initScrollPanel=function(offsetHeight,offsetWidth){
	var mainSize=aweto.getCenterSize();
	if(!mainSize){
		return;
	}
	var scrollWidth=mainSize.width-5;
	var scrollHeight=mainSize.height;
	if(offsetHeight){
		scrollHeight=scrollHeight-offsetHeight;
	}
	if(offsetWidth){
		scrollWidth=scrollWidth-offsetWidth;
	}
	$(".scroll-panel").each(function(){
		if($(this).attr("offsetHeight")){
			$(this).height(mainSize.height-$(this).attr("offsetHeight"));
			//$(this).width(scrollWidth-$(this).attr("offsetHeight"));
		}else{
			$(this).height(scrollHeight);
			//$(this).width(scrollWidth);
		}
	})
	$(window).resize(function(){
		setTimeout(function(){
			aweto.resetScrollPanel(offsetHeight,offsetWidth);
		},200);
	});
};

aweto.resetScrollPanel=function(offsetHeight,offsetWidth){
	var mainSize=aweto.getCenterSize();
	if(!mainSize){
		return;
	}
	var scrollWidth=mainSize.width-5;
	var scrollHeight=mainSize.height;
	if(offsetHeight){
		scrollHeight=scrollHeight-offsetHeight;
	}
	if(offsetWidth){
		scrollWidth=scrollWidth-offsetWidth;
	}
	$(".scroll-panel").each(function(){
		if($(this).attr("offsetHeight")){
			$(this).height(mainSize.height-$(this).attr("offsetHeight"));
			//$(this).width(scrollWidth-$(this).attr("offsetHeight"));
		}else{
			$(this).height(scrollHeight);
			//$(this).width(scrollWidth);
		}
	})
};

aweto.body=function(){
};
aweto.body.initMenu=function(){
	var MenuData = [
						[{
							text: "查看程序信息",
							func: function() {
								aweto.body.showModuleInfo();
							}
						}],
						[{
							text: "新窗口中打开",
							func: function() {
								aweto.ajax(basePath+'system/AModule/findModuleById.ajax',{moduleId:moduleId},true,function(r){
									if(r){
										var url="";
										url=r.moduleUrl;
										if(moduleId==undefined){
											moduleId="";
										}
										if(url!==""){
											aweto.toProgram(url,{pkValue:pkValue,list:true,navigation:true,moduleId:moduleId},{dock:{id:r.pkValue,title:r.moduleName}});
										}
									}
								});
							}
						},{
							text: "关闭所有窗口",
							func: function() {
								layer.closeAll();
							}
						},{
							text: "刷新",
							func: function() {
								if(typeof checkIsPageModified =='function'){
									if(checkIsPageModified()){
										aweto.confirm.show("页面信息已经修改，确认刷新？",function(r){
											if(r){
												location.href=location.href;
											}
										});
									}else{
										location.href=location.href;
									}
								}else{
									location.href=location.href;
								}
							}
						}]
					]
	if(aweto.getCurrentUserId()=='admin'){
		MenuData.push([{
			text: "查看源代码",
			func: function() {
				aweto.ajax(basePath+'system/AModule/findModuleById.ajax',{moduleId:moduleId},true,function(r){
					if(r){
						var url="";
						url=r.moduleUrl;
						if(moduleId==undefined){
							moduleId="";
						}
						if(url!==""){
							aweto.toProgram('aweto/plugins/editor/index.jsp?decorator=false',{moduleId:moduleId,moduleUrl:url,list:true,navigation:true,moduleId:moduleId},{dock:{id:r.pkValue,title:"查看源代码："+r.moduleName}});
						}
					}
				});
			}
		},{
			text: "编辑帮助文档",
			func: function() {
				aweto.ajax(basePath+'system/AModule/findModuleById.ajax',{moduleId:moduleId},true,function(r){
					if(r){
						if(moduleId==undefined){
							moduleId="";
						}
						 var helpNo=r.helpNo;
						 var modName=r.moduleName;
						 if(helpNo=="-1"){
							 var modId=moduleId;
							 aweto.toProgram('WEB-INF/pages/app/system/module/moduleHelp.jsp',{pkValue:helpNo,list:true,navigation:true,create:true,modId:modId},{dock:{id:'modHelp-'+helpNo,title:'模块帮助-'+modName}});
						 }else{
							 aweto.toProgram('WEB-INF/pages/app/system/module/moduleHelp.jsp',{pkValue:helpNo,list:true,navigation:true},{dock:{id:'modHelp-'+helpNo,title:'模块帮助-'+modName}});
						 }
						
					}
				});
			}
		}]);
		
		
	}
	try{
		$(document).smartMenu(MenuData, {
			name: "bodyMenu"    
		});
	}catch(E){
		
	}
}

aweto.body.showModuleInfo=function(){
	var container=$("<div id='moduleInfo' class='info-content'></div>").appendTo(document.body);
	layer.open({
        type: 1,
		maxmin: false,
        shade: 0.3,
        title:"程序信息",
        fix: false,
        area: ['680px', '520px'],
        content:container,
        //shadeClose: true,
        btn:['<i class="fa fa-check"></i> 确认'],
        zIndex: layer.zIndex, //选择弹出框时置顶设置
        success: function(layero, index){
        	 layer.setTop(layero); //选择弹出框时置顶
        	var fs=$("<div class='wrapper wrapper-content'><form class='form-horizontal m'  novalidate='novalidate'></form></div>").appendTo(container)
			aweto.ajax(basePath+'system/AModule/findModuleById.ajax',{moduleId:moduleId,workflowId:workflowId},true,function(r){
				var data=[];//[{label:'模块编号',value:'test'},{label:'模块URL',value:'WEB-INF/pages/app/hr/helpself/hrExtraWorkApp.jsp'}];
				data.push({label:'模块编号',value:moduleId,trace:true,pkValue:r.pkValue,url:'aweto/pages/app/module.jsp',moduleId:'SYSTEM-MODULE',title:'功能模块'});
				data.push({label:'模块名称',value:r.moduleName});
				data.push({label:'模块URL',value:r.moduleUrl});
				if(detailUrl){
					data.push({label:'详情URL',value:detailUrl});
				}
				data.push({label:'引用实体',value:r.entityName,trace:true,pkValue:r.entityNo,url:'aweto/pages/app/dictionary/entityInfo.jsp',moduleId:'entityInfo',title:'实体信息'});
				data.push({label:'数据库表',value:r.tableName,trace:true,pkValue:r.tableName,url:'aweto/pages/app/db/dbTableData.jsp',moduleId:'dbTableData',params:{tableName:r.tableName},title:'表数据['+r.tableName+"]"});
				if(workflowFlg){
					data.push({label:'流程编号',value:workflowId,trace:true,pkValue:workflowNo,url:'aweto/plugins/workflow/pages/base/workflowDesigner.jsp',moduleId:false,title:'流程设计'});
				}
				
				data.push({label:'页面URL',value:location.href});
				for(var i=0;i<data.length;i++){
					var item=aweto.body.createInfoItem(data[i]);
					$("form",fs).append(item);
				}
			});
        },
        yes: function(index, layero) {
        	layer.close(index);
        },
        cancel: function (index, layero) {//右上角关闭回调
        	layer.close(index);
            return true;
        },end:function(){
        	$(container).remove();
        }
    });
};
aweto.body.createInfoItem=function(data){
	var container=$("<div class='form-group'></div>");
	container.append("<label class='col-sm-3 control-label'>"+data.label+":</label>");
	container.append("<div class='col-sm-8'> <p class='form-control-static'>"+data.value+"</p></div>");
	if(aweto.getCurrentUserId()=='admin'){
		if(data.trace&&data.pkValue!='-1'&&data.pkValue!='-'){
			var trace=$("<a class='btn btn-white btn-bitbucket btn-trace' title='查看'><i class='fa fa-location-arrow'></i></a>");
			$(".form-control-static",container).append(trace);
			trace.data("data",data);
			trace.click(function(){
				var d=$(this).data("data");
				var p=d.params;
				var params={list:true,navigation:true,pkValue:d.pkValue};
				if(d.moduleId){
					params={list:true,navigation:true,moduleId:d.moduleId,pkValue:d.pkValue};
				}
				if(p){
					params=$.extend(params,p);
				}
				aweto.toProgram(data.url,params,{dock:{id:d.moduleId+"_"+d.pkValue,title:d.title}});
			});
		}
	}
	return container;
};
aweto.getPageWidth=function(){
	//if($.browser.msie){
	//	return document.compatMode=='CSS1Compat'?document.documentElement.clientWidth:document.body.clientWidth;
	//}else{
		return self.innerWidth;
	//}
}
aweto.getCenterSize=function(){
	var centerHeight=undefined;
	var centerWidth=undefined;
	if(aweto.isTop()){
		centerHeight=$('.ui-layout-center').innerHeight();
		centerWidth=$('.ui-layout-center').innerWidth();
	}else{
		centerHeight=$('.ui-layout-center',$(window.parent.document)).innerHeight();
		 centerWidth=$('.ui-layout-center',$(window.parent.document)).innerWidth();
	}
	if(aweto.isInDock()){
		centerHeight=centerHeight-30;
	}
	if(centerHeight==null){
		return;
	}
	var size={
			width:centerWidth,
			height:centerHeight
	}
	return size;
}

aweto.adaptPageSize=function(){
	var isIE6 = aweto.isIE6;
	var centerHeght=$('.ui-layout-center').innerHeight();
	var centerWidth=$('.ui-layout-center').innerWidth();
	$('.ui-layout-center').css("overflow","hidden")
	if(centerHeght!=undefined){
		if(aweto.isIE){
			$('.main-content-body').css('height', centerHeght);
		}else{
			$('.main-content-body').css('height', centerHeght);
		}
		$('.main-content-body').css('width', centerWidth-1);
	}
	$('.left-tree-body').css(isIE6 ? 'height' : 'minHeight', $('.left-tree').innerHeight() - 10); 
	
	var baseHeight=$('.main-content-body').innerHeight()-5;
	
	if(!aweto.isTop()){
		try{
			baseHeight=$('.main-content-body',$(window.parent.document)).innerHeight()-5;
		}catch(e){
			baseHeight=$('.main-content-body').innerHeight()-5;
		}
	}
	if(baseHeight==-5){
		baseHeight=$(document.body).height();
		centerHeght=$(document.body).height();
		centerWidth=$(document.body).width();
	}
	if(aweto.isTop()){
		/**try{
			$('.adaptHeight-base',window.frames["main-content-iframe"].document).each(function(){
				var offset=$(this).attr("offset");
				if(!isNaN(offset)){
					baseHeight=baseHeight-parseInt(offset);
				}
				$(this).css('height',baseHeight);
			});
			$('.adaptHeight-parent',window.frames["main-content-iframe"].document).each(function(){
				var offset=$(this).attr("offset");
				var pheight=$(this).parent().height();
				if(!isNaN(offset)){
					pheight=pheight-parseInt(offset);
				}
				$(this).css('height',pheight);
			});
			$('.adaptWidth',window.frames["main-content-iframe"].document).each(function(){
				$(this).css('width',$(this).parent().innerWidth());
			});
			$('.ckeditor-render',window.frames["main-content-iframe"].document).each(function(){
				$(this).css(isIE6 ? 'height' : 'minHeight',baseHeight);
			});
		}catch(e){
		}**/
	}else{
		if(aweto.isInDock()){
			baseHeight=baseHeight-30;
		}
		if(isIE6){
			listHeight=baseHeight-70-50;
		}else{
			listHeight=baseHeight-62-50;
		}
		/**$('.adaptHeight-base').each(function(){
			var offset=$(this).attr("offset");
			if(!isNaN(offset)){
				baseHeight=baseHeight-parseInt(offset);
			}
			$(this).css('height',baseHeight);
		});
		$('.adaptHeight-parent').each(function(){
			var offset=$(this).attr("offset");
			var pheight=$(this).parent().height();
			if(!isNaN(offset)){
				pheight=pheight-parseInt(offset);
			}
			$(this).css('height',pheight);
		});
		$('.adaptWidth').each(function(){
			$(this).css('width',$(this).parent().innerWidth());
		});
		$('.ckeditor-render').each(function(){
			$(this).css(isIE6 ? 'height' : 'minHeight',baseHeight);
		});
		**/
	}
	if(aweto.browser.getDocModeVersion()<8){
		listHeight=listHeight-50-50;
	}
};



// 设置页面头信息
aweto.setHeadInfo=function(info){
	if (aweto.isTop()) {
	  $("#headInfo").html(info);
	}else{
		try{
			 $("#headInfo",window.parent.document).html(info);
		}catch(e){
			 $("#headInfo").html(info);
		}
	}
};

aweto.isTop=function(){
	if(window==top){
		return true;
	}
	try{
		if ($("#main-container").attr('id')&&$("#main-container").attr('id')!==undefined) {// window==top
			  return true;
			}else{
			  return false;
		   }
	}catch(e){
			return false;
	}
}

// 是否在中央窗体中
aweto.isInCenterWindow=function(){
	if ($("#main-window").attr('id')&&$("#main-window").attr('id')!==undefined) {// window==top
		  return true;
		}else{
		  return false;
	   }
}

// 判断当前窗体是否在dock中
aweto.isInDock=function(){
	var url=aweto.getRequestUrl();
	var params=aweto.parseUrlParam(url);
	return params.isDock;
}

aweto.getDock=function(){
// alert(1)
	if(aweto.isTop()){
		return dock;
	}else{
		if(window.parent.dock){
			return window.parent.dock;
		}else if(window.parent.parent.dock){
			return window.parent.parent.dock;
		}else{
			return window.top.dock;
		}
	}
}

aweto.getTopWin=function(){
	if(aweto.isTop()){
		return window;
	}else{
		return window.parent;
	}
}

aweto.url=function(){return this};
aweto.url.go=function(url){
	if(aweto.isInCenterWindow()){
		var el=document.getElementById("main-content-iframe");
		if(el){
			if(el.contentWindow.clearJqueryContent){
				el.contentWindow.clearJqueryContent();
			}
			//clearIframe("main-content-iframe");
			el.src='about:blank';
			try{
				el.contentWindow.document.readyState='complete';
				el.contentWindow.document.write("");
				el.contentWindow.close();
			}catch(e){};
		}
		$("#main-content-iframe").attr("src",url);
	}else if(aweto.isTop()){
		$("#main-content-iframe").attr("src",url);
	}else{
		window.location.href=url;
	}
};
//转换成后台跳转url
aweto.url.toGotoPageUrl=function(url){
	url="gotoPage.action?target="+url;
	return url;
}
//弹出窗打开连接
aweto.url.open=function(url,title,param){
	var t="";
	if(title){
		t=title;
	}
	var tmpUrl;
	if(url.startsWith('http:')){
		tmpUrl=url;
	}else{
		// 不带参数的url;
		var preUrl=aweto.parseUrl(url);
		var params=param;
		var urlParams=aweto.parseUrlParam(url);// url自带参数
		if(preUrl.endsWith('.action')){
			if(url.startsWith(tmpUrl)){
				tmpUrl=url;
			}else{
				tmpUrl=basePath+url;
			}
		}else if(preUrl.endsWith('.jsp')){
			tmpUrl=basePath+"gotoPage.action";
			urlParams.target=url;
		}else{
			tmpUrl=url;
		}
		if(params==undefined){
			params={};
		}
		params=$.extend(params,urlParams);
		var args=aweto.encoderUrlParam(params);
		if(args){
			if(tmpUrl.indexOf("?")!=-1){
				tmpUrl=tmpUrl+"&"+args;
			}else{
				tmpUrl=tmpUrl+"?"+args;
			}
		}
	}
	layer.open({
		  content: tmpUrl,
		  //id:layerId,
		 title:title,
		  shade:false,
		  moveOut:true,//是否允许拖拽到窗口外
		  btnAlign:"c",// 按钮右对齐。默认值 l 按钮左对齐   c 按钮居中对齐
		  type:2,//1:dom元素，2:iframe
		  area: ["500px", "500px"],
		  maxmin:true,
		  zIndex: layer.zIndex, //选择弹出框时置顶设置
		  success: function(layero, index){
			 layer.setTop(layero); //选择弹出框时置顶
			 layer.full(index);
				setTimeout(function(){
					$(".layui-layer-min").show();
				},500);
			  $(window).resize(function(){
				  try{
					  layer.full(index);
				  }catch(E){}
			  });
          },
		  cancel: function(){ 
		    //右上角关闭回调
		    //return false 开启该代码可禁止点击该按钮关闭
		  },full:function(layero){
			  $(".layui-layer-min",$(layero)).show();
		  },end:function(){//层销毁后触发的回调
			 
		  }
		});
};
// 转到指定程序
aweto.toProgram=function(url,param,cfg){
	if(cfg){
		if(cfg.dock){
			if(param){
				param.isDock=true;
				if(!param.list)
				param.list=false;
				if(!param.navigation)
				param.navigation=false;
			}else{
				param={isDock:true,list:false,navigation:false};
			}
		}
	}
	var tmpUrl="";
	// 不带参数的url;
	var preUrl=aweto.parseUrl(url);
	var params=param;
	var urlParams=aweto.parseUrlParam(url);// url自带参数
	if(preUrl.endsWith('.action')){
		if(url.startsWith(tmpUrl)){
			tmpUrl=url;
		}else{
			tmpUrl=basePath+url;
		}
	}else if(preUrl.endsWith('.jsp')){
		tmpUrl=basePath+"gotoPage.action";
		urlParams.target=url;
	}else{
		tmpUrl=url;
	}
	if(params==undefined){
		params={};
	}
	params=$.extend(params,urlParams);
	var args=aweto.encoderUrlParam(params);
	if(args){
		if(tmpUrl.indexOf("?")!=-1){
			tmpUrl=tmpUrl+"&"+args;
		}else{
			tmpUrl=tmpUrl+"?"+args;
		}
	}
	if(cfg){
		if(cfg.dock){
			//aweto.getDock().add(cfg.dock.id,cfg.dock.title,tmpUrl);
			aweto.getTopWin().layer.open({
				  content: tmpUrl,
				  id:cfg.dock.id,
				  title:cfg.dock.title,
				  shade:false,
				  moveOut:true,//是否允许拖拽到窗口外
				  type:2,//1:dom元素，2:iframe
				  area: ["1275px","750px"],
				  maxmin:true,
				  btn:false,
				  zIndex: layer.zIndex, //选择弹出框时置顶设置
				  success: function(layero, index){
					 aweto.getTopWin().layer.setTop(layero); //选择弹出框时置顶
					 //aweto.getTopWin().layer.full(index);
						setTimeout(function(){
							$(".layui-layer-min").show();
						},500);
					  $(window).resize(function(){
						  try{
							 // aweto.getTopWin().layer.full(index);
						  }catch(E){}
					  });
		          },
				  cancel: function(){ 
				    //右上角关闭回调
				    //return false 开启该代码可禁止点击该按钮关闭
				  },full:function(layero){
					  $(".layui-layer-min",$(layero)).show();
				  }
				});
		}else{
			aweto.url.go(tmpUrl);
		}
	}else{
		aweto.url.go(tmpUrl);
	}
	
}
// 取当前页面请求的url
aweto.getRequestUrl=function(){
	var url=location.href;
	if(url.indexOf('gotoPage.action')!=-1){
		var params=aweto.parseUrlParam(url);
		var tmpUrl="";
		var tmpParams={};
		for(var name in params){
			if(name=="target"){
				tmpUrl=params.target;
			}else{
				tmpParams[name]=params[name];
			}
		}
		var urlargs=aweto.encoderUrlParam(tmpParams);
		if(urlargs){
			return tmpUrl+"?"+urlargs;
		}else{
			return tmpUrl;
		}
	}else{
		return url;
	}
}

// 解析无参状态下的url
aweto.parseUrl=function(url){
	var str = url.split("?")[0];
	return str;
}

// 解析url参数
aweto.parseUrlParam=function(url){
	     var str = url.split("?")[1];   // 通过?得到一个数组,取?后面的参数
	     var param={};
	     if(str){
	    	  items = str.split("&");    // 分割成数组
	 	     var arr,name,value;
	 	     for(var i=0; i<items.length; i++){
	 	         arr = items[i].split("=");    // ["key0", "0"]
	 	         name = arr[0];
	 	         value = arr[1];
	 	        param[name] = value;
	 	     }
	     }
	     return param;
}

// 转换参数为url形式
aweto.encoderUrlParam=function(params){
	var str="";
	if (params instanceof Object) {// json对象格式的参数
		var count=0;
		for ( var item in params) {
			if(count==0){
				str = item + "=" + params[item];
			}else{
				str = str + "&" + item + "=" + params[item];
			}
			count++;
		}
	} 
	return str; 
}

// js取当前用户
aweto.getCurrentUserId=function(){
	if(currentUser){
		return currentUser;
	}else{
		return window.parent.currentUser;
	}
};
aweto.getCurrentEmpId=function(){
	if(currentEmp){
		return currentEmp;
	}else{
		return window.parent.currentEmp;
	}
};
// js取当前用真实姓名
aweto.getCurrentUserName=function(){
	if(currentUserRealName){
		return currentUserRealName;
	}else{
		return window.parent.currentUserRealName;
	}
};


aweto.url.toAjaxUrl=function(url){
	if(!url||url==""){
		return;
	}
	if(url.indexOf('.ajax')>0){
		return url;
	}
	if(url.indexOf('.action')>0){
		return aweto.replace(url, ".action", '.ajax');
	}
	if(url.indexOf('.do')>0){
		return aweto.replace(url, ".do", '.ajax');
	}
}

// ajax
aweto.ajax=function(url,param,sync,onsuccess,onerror){
	if(!url||url==""){
		return;
	}
	url=aweto.url.toAjaxUrl(url);
	var result="-1";
	$.ajax({
		type: "POST",
		url: url,
		data:param,
		dataType:'json',
		async: sync,
		cache:false,
		success: function(responce){
			result = responce;
			if(typeof onsuccess=='function'){
				onsuccess(responce);
			}
		},
		error:function(json){
			layer.msg("执行出错！"+json.status);
			result="-1";
			if(typeof onerror=='function'){
				onerror(json);
			}
		}
	});
	return result;
}
/** *************************contextMenu****************************** */
aweto.contextMenu=function(){return this;};
aweto.contextMenu.show=function(menu,target,event){
	return target.contextMenu(menu).show(target,event);
};
aweto.contextMenu.remove=function(menu){
	if(menu.menu){
		menu.menu.remove();
	}
	if(menu.shadowObj){
		menu.shadowObj.remove();
	}
}
// 下拉菜单
aweto.dropMenu=function(){return this;};
aweto.dropMenu.bind=function(menu,target,options,eventName){
	
	options=$.extend({dropMenu:true},options);
	return target.contextMenu(menu,options,eventName);
};
aweto.dropMenu.remove=function(menu){
	if(menu.menu){
		menu.menu.remove();
	}
	if(menu.shadowObj){
		menu.shadowObj.remove();
	}
}
// 数组形式的Menu配置转换成可识别配置信息 [["显示标题","点击处理函数","显示图标"]]
aweto.arrayToMenu=function(itemObjs){
	var ma=new Array();
	$.each(itemObjs,function(i){
		try{
			var item={}
			if(itemObjs[i].length){
				if(itemObjs[i].length>0){
					if(itemObjs[i]=='-'){
						item=$.contextMenu.separator;
					}else{
						item[itemObjs[i][0]]={};
					}
				}
				if(itemObjs[i].length>1)
				item[itemObjs[i][0]].onclick=itemObjs[i][1];
				if(itemObjs[i].length>2)
				item[itemObjs[i][0]].icon=itemObjs[i][2];
			}else{
				if(itemObjs[i]=='-'){
					item=$.contextMenu.separator;
				}else{
					item[itemObjs[i]]={};
				}
			}
			ma.push(item);
		}catch(e){}
	});
	return ma;
};
/** ***************************buttonBar******************************** */
aweto.buttonBar=function(){return this;};
// 根据权限取barItems
aweto.buttonBar.getItemsByPermission=function(moduleId,moduleNodeId){
	var result=aweto.ajax(basePath+"APermission/permissionedBarItems.action",{moduleId:moduleId,moduleNodeId:moduleNodeId},false);
	return result;
}
// buttonBar按钮权限校验
aweto.buttonBar.permissionCheck=function(item,referItem){
	if(aweto.getCurrentUserId()=='admin'){
		return true;
	}
	var checkItem=item;
	if(referItem){// 权限参考项(如果有此参数则item的权限将参考referItem的权限)
		checkItem=referItem;
	}
	if(moduleOprControl){
		
		if(checkItem.indexOf(",")!=-1){
			var checkItems=checkItem.split(",");
			var isPermissioned=false;
			for(var i=0;i<checkItems.length;i++){
				if(aweto.array.contains(modOprs,checkItems[i])){
					isPermissioned=true;
				}
			}
			return isPermissioned;
		}else if(!aweto.array.contains(modOprs,checkItem)){
			return false;
		}
	}
	return true;
}

/** ***************************form******************************** */
aweto.form=function(){};

aweto.form.toJSON=function(form){
	return aweto.form.toJson(form);
}

// form表单转换为json对象
aweto.form.toJson=function(form){
	var r = {};
    var a = form.formToArray();
    for(var i = 0; i < a.length; i=i+1) {
        var d = a[i];
        r[d.name] = d.value;
    }
    return r;
}
//初始化开关控件
aweto.form.initToggleSwitch=function(opt){
	if(opt&&opt.fieldObj==undefined){
		opt={fieldObj:opt};
	}
	var option={
			fieldObj:undefined
	};
	option = $.extend(option,opt);
	var fieldObj=option.fieldObj;//字段对象
	if(fieldObj==undefined){
		if(option.fieldName){
			fieldObj=$("#"+option.fieldName);
	  	}else{
	  		fieldObj=$("#"+option.fieldName);;
	  	}
	 }
	fieldObj.attr("checked","");
	fieldObj.wrap('<label class="toggle-switch switch-solid"></label>');
	fieldObj.after("<span></span>");
}
//初始化富文本编辑器
aweto.form.initTextEditor=function(opt,val,disabled){
	if(opt&&opt.fieldObj==undefined){
		opt={fieldObj:opt};
		if(val){
			opt.value=val;
		}
		if(disabled){
			opt.disabled=true
		}
	}
	var option={
			fieldObj:undefined,
			disabled:false,
			value:''
	};
	option = $.extend(option,opt);
	var fieldObj=option.fieldObj;//字段对象
	if(fieldObj==undefined){
		if(option.fieldName){
			fieldObj=$("#"+option.fieldName);
	  	}else{
	  		fieldObj=$("#"+option.fieldName);;
	  	}
	 }
	//富文本编辑器
	if ($.fn.summernote !== undefined) {
		$(fieldObj).summernote({
            lang: 'zh-CN',
            height: 300,
            placeholder: '请输入内容',
            callbacks: {
                onImageUpload: function (files) {
                    var obj=this;
                    aweto.form.upload(files[0],function(r){
                    	var path=r.param.path;
    	            	var name=r.param.fileName;
    	            	$(obj).summernote('editor.insertImage', path, name);
                    });
                }
            }
        });
		if(option.value!=""){
			$(fieldObj).summernote('code', option.value);
		}
		if(option.disabled){
			$(fieldObj).summernote('disable');
		}
	}
}
//获取富文本编辑器的值
aweto.form.getTextEditValue=function(obj){
	return $(obj).summernote('code');
}
//初始化单选框组
aweto.form.initRadioGroup=function(opt){
	var option={
			fieldObj:undefined,//字段对象
			radios:[{key:'01',value:"选项1"},{key:'02',value:"选项2"}],//选项
			checked:'01',//已选中项
			disabled:false  //是否只读
	};
	option = $.extend(option,opt);
	var fieldObj=option.fieldObj;//字段对象
	if(fieldObj==undefined){
		if(option.fieldName){
			fieldObj=$("#"+option.fieldName);
	  	}else{
	  		fieldObj=$("#"+option.fieldName);;
	  	}
	 }
	var fieldName=fieldObj.attr("name");
	fieldObj.wrap("<div></div>");
	var container=fieldObj.parent();
	if ($.fn.iCheck !== undefined) {
		for(var i=0;i<option.radios.length;i=i+1){
			var checked=option.checked;
			var isChecked=false;
			if(option.radios[i].key==checked){
				isChecked=true;
			}
			if(isChecked){
				fieldObj.before('<label class="radio-box form-icheck"> <input type="radio" name="'+fieldName+'" checked=true value="'+option.radios[i].key+'" /> '+option.radios[i].value+'</label>');
			}else{
				fieldObj.before('<label class="radio-box form-icheck"> <input type="radio" name="'+fieldName+'" value="'+option.radios[i].key+'" /> '+option.radios[i].value+'</label>');
			}

			$(".form-icheck",container).iCheck({
	            radioClass: 'iradio-blue'
	        }).on('ifClicked', function(event){ //事件绑定 
	        	try{
	        		var funcName=fieldName+"Onclick";
					var func=eval(funcName);
					var currentVal=$(event.target).val();//当前对象值
		        	if(typeof func=='function'){
		        		  func(currentVal,event);
		        		  event.stopPropagation(); 
						  return;
		        	}
	        	}catch(E){
	        		
	        	}
	        	
	        }); 
		
		}
		if(option.disabled){
			$(".form-icheck",container).iCheck('disable');
		}
	}
	
}
//初始化多选勾选框组
aweto.form.initCheckboxGroup=function(opt){
	var option={
			fieldObj:undefined,//字段对象
			checkboxs:[{key:'01',value:"选项1"},{key:'02',value:"选项2"}],//选项
			checkes:['01'],//已选中项
			disabled:false  //是否只读
	};
	option = $.extend(option,opt);
	var fieldObj=option.fieldObj;//字段对象
	if(fieldObj==undefined){
		if(option.fieldName){
			fieldObj=$("#"+option.fieldName);
	  	}else{
	  		fieldObj=$("#"+option.fieldName);;
	  	}
	 }
	var fieldName=fieldObj.attr("name");
	fieldObj.wrap("<div></div>");
	var container=fieldObj.parent();
	if ($.fn.iCheck !== undefined) {
		for(var i=0;i<option.checkboxs.length;i=i+1){
			var checkes=option.checkes;
			var isChecked=false;
			for(var j=0;j<checkes.length;j++){
				if(option.checkboxs[i].key==checkes[j]){
					isChecked=true;
					break;
				}
			}
			if(isChecked){
				fieldObj.before('<label class="check-box form-icheck"><input name="'+fieldName+'" type="checkbox" checked=true value="'+option.checkboxs[i].key+'"/>'+option.checkboxs[i].value+'</label>');
			}else{
				fieldObj.before('<label class="check-box form-icheck"><input name="'+fieldName+'" type="checkbox" value="'+option.checkboxs[i].key+'"/>'+option.checkboxs[i].value+'</label>');
			}
			$(".form-icheck",container).iCheck({
	            checkboxClass: 'icheckbox-blue'
	        }).on('ifChanged', function(event){ //事件绑定 
	        	var funcName=fieldName+"Onchange";
				
				var currentChecked=$(event.target).val();//当前对象值
				var currentState=$(event.target).prop("checked");//当前对象状态
				var checks=new Array();//当前选中的值
				$("input[name='"+name+"']:checkbox").each(function(){
			        if(true == $(this).is(':checked')){
			        	var v=$(this).val();
			        	checks.push(v);
			        }
			    });
				try{
					var func=eval(funcName);
		        	  if(typeof func=='function'){
		        		  func(currentChecked,currentState,checks,event);
		        		  event.stopPropagation(); 
						  return;
		        	  }
				}catch(E){
					
				}
				
	        }); 
		}
		if(option.disabled){
			$(".form-icheck",container).iCheck('disable');
		}
	}
	fieldObj.remove();
}
//初始化文件组控件
aweto.form.initFileGroup=function(opt){
	var option={
			fieldObj:undefined,//字段对象
			fileIds:"46,47,48,52",//文件主键
			disabled:false,  //是否只读
			onAddFile:function(data){//添加文件响应事件
				//alert(aweto.JSON.encode(data))
			},onDelete:function(id,fileList){//删除文件响应事件
				//alert(aweto.JSON.encode(id))
			},OnDownload:function(data){//下载文件响应事件
				//alert(aweto.JSON.encode(data))
			}
	};
	option = $.extend(option,opt);
	var fieldObj=option.fieldObj;//字段对象
	if(fieldObj==undefined){
		if(option.fieldName){
			fieldObj=$("#"+option.fieldName);
	  	}else{
	  		fieldObj=$("#"+option.fieldName);;
	  	}
	 }
	var disabled=option.disabled;
	var fieldName=fieldObj.attr("name");
	fieldObj.wrap("<div class='form-file-group-warp'></div>");
	var container=fieldObj.parent();
	var tmp=new Array();
	tmp.push('<div class="file-list-container">');
	tmp.push(' <div class="file-group">');
	tmp.push('	<div class="file-list-box">');
	tmp.push('	</div>');
	if(!disabled){
		tmp.push('	<div class="file-picker">');
		tmp.push('		<div class="file-picker-split hidden"></div>');
		tmp.push('		<div class="file-picker-more">');
		tmp.push('			<div class="file-picker-icon" fieldName="'+fieldName+'" ></div>');
		tmp.push('			<div class="file-picker-label">添加</div>');
		tmp.push('		</div>');
		tmp.push('	</div>');
	}
	tmp.push(' </div>');
	tmp.push('</div>');
	container.append(tmp.join(" "));
	var fileIds=option.fileIds;
	var fileIdList=[];
	if(fileIds){
		fileIdList=fileIds.split(",");
	}
	aweto.form.getFileGroupFiles(fileIds,fieldName,$(".file-list-box",container),option);
	$(".file-picker-icon",container).click(function(){//添加附件按钮
		var fname=$(this).attr("fieldName");
		aweto.attachment.showUploader({
			pkValue:pkValue,
			success: function(data) {
				if(data.state==SUCCESS){
					if(data.docs){
						for(var i=0;i<data.docs.length;i++){
							fileIdList.push(data.docs[i]);
						}
						var fobj=$("#"+fname);
						if(fobj){
							fobj.val(fileIdList.join(","));
						}
						aweto.form.getFileGroupFiles(fileIdList.join(","),fname,$(".file-list-box",container,option));
					}
					if(typeof option.onAddFile=='function'){
						option.onAddFile(data.docs);
					}
					if(fname){
						var funcName=fname+"OnAddFile";
						try{
							var func=eval(funcName);
							if(typeof func=='function'){
								func(data.docs);
							}
						}catch(e){}
						
					}
				}
			}
		});
	});
}
aweto.form.getFileGroupFiles=function(fileIds,fieldName,container,option){
	var fileIdList=[];
	if(fileIds){
		fileIdList=fileIds.split(",");
	}
	var disabled=false;
	if(option&&option.disabled){
		disabled=option.disabled;
	}
	//获取文件清单
	aweto.attachment.getFileList(fileIds,function(data){
		container.empty();
		for(var i=0;i<data.length;i++){
			var item=data[i];
			var icon="file-icon-"+item.fileType;
			var tmpItem=new Array();
			tmpItem.push('		<div id="file_'+item.id+'" class="file-list-item" title="'+item.label+'">');
			tmpItem.push('			<div class="file-icon file-icon-default '+icon+'">');
			if(!disabled){
				tmpItem.push('				<div class="file-delete" fid="'+item.id+'" fieldName="'+fieldName+'"  title="删除">x</div>');
			}
			tmpItem.push('			</div>');
			tmpItem.push('			<div class="file-name" >'+item.label+'</div>');
			tmpItem.push('		</div>');
			var fileItem=$(tmpItem.join(" "));
			fileItem.data("data",item);
			container.append(fileItem);
			fileItem.click(function(){//点击下载
				var d=$(this).data("data");
				aweto.attachment.download(d);
				if(typeof option.OnDownload=='function'){
					option.OnDownload(d);
				}
				if(fieldName){
					try{
						var funcName=fieldName+"OnDownload";
						var func=eval(funcName);
						if(typeof func=='function'){
							func(d);
						}
					}catch(E){}
				}
			});
		}
		$(".file-delete",container).click(function(event){
			var id=$(this).attr("fid");
			var fname=$(this).attr("fieldName");
			layer.confirm('确认删除附件？', {
				  btn: ['确定','取消'] //按钮
				}, function(index){
					layer.close(index);
					aweto.attachment.deleteFile({id:id},function(r){
						if(r.state==SUCCESS){
							var temp=new Array();
							for(var i=0;i<fileIdList.length;i++){
								if(fileIdList[i]==id){
									continue;
								}else{
									temp.push(fileIdList[i]);
								}
							}
							fileIdList=temp;
							var fobj=$("#"+fname);
							if(fobj){
								fobj.val(fileIdList.join(","));
							}
							$("#file_"+id).remove();
							if(typeof option.onDelete=='function'){
								option.onDelete(id,fileIdList);
							}
							if(fname){
								try{
									var funcName=fname+"OnDelete";
									var func=eval(funcName);
									if(typeof func=='function'){
										func(id,fileIdList);
									}
								}catch(E){}
							}
						}else{
							layer.msg(r.msgInfo, {icon: 5});//不开心
						}
					});
				}, function(index){
					layer.close(index);
				});
			aweto.browser.stopBubble(event);//事件停止传递
			
		});
	});
}

//初始化图片上传控件
aweto.form.initImageUploader=function(opt,val,disabled){
	if(opt&&opt.fileInput==undefined){
		opt={fileInput:opt};
		if(val){
			opt.initialPreview=val;
		}
		if(disabled){
			opt.disabled=true;
		}
	}
	var option={
			fileInput:undefined,// "imageFileUpload",
			fieldName:undefined,
			fieldObj:undefined,
			fileName:"fileupload",
			initialPreview:undefined,//初始化预览值
			accept:"image/*",
			autoCreatePreview:true,//自动构建预览
			preview:true,//预览
			previewImg:undefined,//图片预览对象 imagePreview
			disabled:false,
			onComplete:function(r){
				//alert(aweto.JSON.encode(r));
			}
	}
	option = $.extend(option,opt);
	var fileInput=option.fileInput;
	var filePath="images/noImage.png";
	if(option.initialPreview){
		filePath=option.initialPreview;
	}
	if(typeof fileInput=="string"){
		fileInput=$("#"+fileInput);
	}
	var type=fileInput.attr("type");
	if(type!="file"){//目标对象为非文件类
		if(fileInput.attr("fieldName")){//配置了fieldName属性
			fileInput.attr("type","file");
		}else if(fileInput.attr("name")){//未配置了fieldName属性,但是配置了name属性,则自动创建file对象
			var fname=fileInput.attr("name");
			var tmp=$('<input type="file"  fieldName="'+fname+'">');
			fileInput.before(tmp);
			fileInput.attr("id",fname).hide();
			fileInput=tmp;
		}
	}
	if(!fileInput.parent().hasClass("fileinput")){
		fileInput.parent().addClass("fileinput")
	}
	var accept=fileInput.attr("accept");
	var fileName=fileInput.attr("name");
	if(fileName!==option.fileName){
		fileInput.attr("name",option.fileName);
	}
	if(accept!==option.accept){
		fileInput.attr("accept",option.accept);
	}
	var fieldObj=option.fieldObj;//字段对象，用于存储图片路径
	if(fieldObj==undefined){
		if(option.fieldName){
			fieldObj=$("#"+option.fieldName);
	  	}else{
	  		option.fieldName=fileInput.attr("fieldName");
	  		fieldObj=$("#"+option.fieldName);;
	  	}
	 }
	if(fieldObj.length==0){//字段对象不存在则自动创建
		var fieldName=fileInput.attr("fieldName");
		if(fieldName==undefined){
			fieldName=option.fieldName;
		}
		fieldObj=$('<input class="form-control " type="hidden" name="'+fieldName+'" id="'+fieldName+'" >');
		fileInput.before(fieldObj);
	}
	var preObj=option.previewImg;//图片预览对象
	if(typeof preObj=="string"){
		preObj=$("#"+option.previewImg);
	}
	if(preObj==undefined||preObj.length==0){//图片预览对象不存在，则自动创建
		var imgPreview=fileInput.attr("imgPreview");
		if(imgPreview==undefined){
			imgPreview=fieldObj.attr("name")+"Preview";
		}
		if(imgPreview){
			var preObjParent=$('<div class="fileinput-new thumbnail" style="width: 180px; height: 160px;"></div>');
			fileInput.before(preObjParent);
			preObj=$('<img id="'+imgPreview+'" src="'+filePath+'">')
			preObjParent.append(preObj);
		}
	}
	var preImgId=$(preObj).attr("id");
	if(option.initialPreview){//初始化赋值
		fieldObj.val(option.initialPreview);
		preObj.attr("src",option.initialPreview);
		layer.photos({
			  photos: $(preObj).parent(),
			  closeBtn: 1,
			  anim: 5 
		});
	}
	var disabled=option.disabled;
	var showBrowse=true;
	if(disabled){
		showBrowse=false
	}
	fileInput.fileinput({
        language: 'zh', //设置语言
        uploadUrl:  basePath + "/pub/uploadFile.ajax", //上传的地址
        allowedFileExtensions: ['jpg', 'gif', 'png','jpeg','bmp'],//接收的文件后缀
        uploadExtraData:{"suffix": 'true',"maxSize":1024*1024*2},
        uploadAsync: true, //默认异步上传
        showUpload: true, //是否显示上传按钮
        showRemove : false, //显示移除按钮
        showPreview : false, //是否显示预览
        showCaption: false,//是否显示标题
        showClose:false,//是否显示预览界面的关闭图标
        showBrowse:showBrowse,//是否显示文件浏览按钮
        browseClass: "btn btn-success btn-image-upload",
        browseLabel: "选择",
        browseIcon: "<i class=\"glyphicon glyphicon-picture\"></i> ",
        uploadClass: "btn btn-info btn-image-upload",
        uploadLabel: "上传",
        uploadIcon: "<i class=\"glyphicon glyphicon-upload\"></i> ",
        dropZoneEnabled:false,//是否显示拖拽区域
        autoReplace:true,//是否自动替换当前图片，设置为true时，再次选择文件， 会将当前的文件替换掉。
        maxFileCount: 1, //表示允许同时上传的最大文件个数
        enctype: 'multipart/form-data',
        validateInitialCount:true
    }).on("fileuploaded", function (event, data, previewId, index) {    //一个文件上传成功
   	   $(".kv-upload-progress").hide();
       var r=data.response;
       if(typeof option.onComplete=='function'){
    	   option.onComplete(r);
       }
       if(r.state==SUCCESS){
    	   if(option.preview&&preObj){//图片预览处理
    		   var parentobj=$("#"+preImgId).parent();
    		   var newParent=$('<div class="fileinput-new thumbnail" style="width: 180px; height: 160px;"></div>');
    		   parentobj.before(newParent);
    		   parentobj.remove();
    		   var img=$('<img id="'+preImgId+'" src="'+r.param.path+'">').appendTo(newParent);
    		   img.click(function(){
					layer.photos({
						  photos: newParent,
						  closeBtn: 1,
						  anim: 5 
					});
				})
    	   }
    	  if(fieldObj){
    		  $(fieldObj).val(r.param.path);
    	  }
       	  $(".fileinput-upload-button").hide();
       	  $(".btn-image-upload").width(155);
       }else{
       	 layer.msg(r.msgInfo, {icon: 5});//不开心
       }
    }).on('fileerror', function(event, data, msg) {  //一个文件上传失败
    	layer.msg("文件上传失败！"+msg, {icon: 5});//不开心
    }).on('change', function(event) {
        $(".fileinput-upload-button").show();
        $(".btn-image-upload").width(62);
    });
}

//图片预览
aweto.form.imagePreView=function(imgUrl){
	   var imagePre=$("<img src='"+imgUrl+"'>").appendTo(document.body);
	   layer.open({
		   type: 1,
		   title: false,
		   //closeBtn: 0,
		   area: ['auto'],
		   maxHeight:300,
		   maxWidth:300,
		   skin: 'layui-layer-nobg', //没有背景色
		   shadeClose: true,
		   zIndex: layer.zIndex, //重点1
		   success: function(layero){
			    layer.setTop(layero); //重点2
		   },
		   content:imagePre,
		   cancel: function(){ 
			   imagePre.remove();
				    //右上角关闭回调
				    //return false 开启该代码可禁止点击该按钮关闭
			},end:function(){
				 imagePre.remove();
			}
		 });
}
//表单上传文件
aweto.form.upload=function(file,callback){
	 var data = new FormData();
     var fileName = file['name'];
     data.append("file", file);
     data.append("form","true");
     data.append("suffix","true");
     data.append("fileName",fileName);
     $.ajax({
         type: "POST",
         url: basePath + "/pub/uploadFile.ajax",
         data: data,
         cache: false,
         contentType: false,
         processData: false,
         dataType: 'json',
         success: function(result) {
        	 if(typeof callback=='function'){
        		 callback(result);
        	 }
         },
         error: function(error) {
            
         }
     });
}
// clear form 清空
aweto.form.clear=function(form){
	form.clearForm();
	if($("#_workflowNodeNameLabel")){
		$("#_workflowNodeNameLabel").html("");
	}
	
	if ($.fn.select2 !== undefined) {//多项下拉选择初始化为空
		$("select.form-select2",form).each(function () {
			$(this).select2("val", ""); 
		})
	}
	
}

// form表单自动设置值
aweto.form.setValue=function(data,form,autoDisable){
	form.setFormValue(data,autoDisable);
}

aweto.form.reset=function(form){
	form.resetForm();
}
//初始化下拉框选项
aweto.form.initSelectByAjax=function(form,url,params,setValue,callback){
	if(url){
		var p={pkValue:"-1"};
			p=$.extend(p,params);
		aweto.ajax(url,p,true,function(r){
			aweto.form.initSelect(form,r.recorder,setValue);
			if(typeof callback=='function'){
				callback();
			}
		});
	}
}

// form表单初始化select,radio,checkbox
aweto.form.initSelect=function(form,recorder,setValue){
    var data=recorder;
    form.each(function() {
        $('select,.form-checkbox-group,.form-radio-group', this).each(function(){
            var t = this.type, tag = this.tagName.toLowerCase(),id=this.id,name=$(this).attr("name"),pCodeId=$(this).attr("pCodeId"),entity=$(this).attr("entity"),field=$(this).attr("field");
            if(!name)return;
            if(name.indexOf(".")>-1){
                if(!id)return;
                name=id;
            }
            if(pCodeId||entity)return;
            if(data==""||data===undefined)return;
            if(data[name]){
                if(data[name].attributes){
                    return;
                }
            }
            var val="";
            for ( var item in data) {
                if(name==item){
                    val=data[item];
                    break;
                }
            }
            if (tag=='select'){
                var options=val.options;
                if(options==undefined){
                    if(val.radios){
                        options=val.radios;
                    }
                }
                if(options){
                    if(setValue){
                        if(options){
                            $(this).empty();
                            for(var i=0;i<options.length;i=i+1){
                                if(options[i].key==val.selected){
                                    $(this).append("<option value='"+options[i].key+"' selected>"+options[i].value+"</option>");
                                }else{
                                    $(this).append("<option value='"+options[i].key+"'>"+options[i].value+"</option>");
                                }
                            }
                        }else{
                            $(this).val(val);
                        }
                    }else{
                        if(options){
                            $(this).empty();
                            // $(this).append("<option value='-1'></option>");
                            for(var i=0;i<options.length;i=i+1){
                                $(this).append("<option value='"+options[i].key+"'>"+options[i].value+"</option>");
                            }
                        }
                    }
                }
            }else{
                if($(this).hasClass("form-checkbox-group")){//多选项checkbox自动构建
                    if(val.checkboxs){
                        var checked=val.checked;
                        var checkes=new Array();
                        if(setValue){
                            if(checked.indexOf(",")>0){
                                checkes=checked.split(",");
                            }else{
                                checkes.push(checked);
                            }
                        }else{
                            var defaultValue=$(this).attr("defaultValue");
                            if(defaultValue){
                                checkes.push(defaultValue);
                            }
                        }
                        aweto.form.initCheckboxGroup({fieldObj:$(this),checkboxs:val.checkboxs,checkes:checkes});
                    }
                }else if($(this).hasClass("form-radio-group")){//radio选项自动构建
                    if(val.radios){
                        var checked=undefined;
                        if(setValue){
                            checked=val.checked;
                        }else{
                            var defaultValue=$(this).attr("defaultValue");
                            if(defaultValue){
                                checked=defaultValue;
                            }
                        }
                        aweto.form.initRadioGroup({fieldObj:$(this),radios:val.radios,checked:checked});
                    }
                }
            }


        });
    });
}
// form表单初始化
aweto.form.initForm=function(form,callback){
	form.initForm();
	if(typeof callback =='function'){
		callback();
	}
}

aweto.form.decorateField=function(form){
	form.decorateFormField();
}
// 表单校验
aweto.form.check=function(form){
	var result=true;
	form.each(function() {
		$('input,select,textarea', this).each(function(){
			if($(this).hasClass("readonly")){
				if(regionFlag){//有区域
					var inRegion=false;
					for(var i=0;i<regionFields.length;i++){
						var fieldName=regionFields[i];
						if(fieldName==this.name){
							inRegion=true;
						}
					}
					if(!inRegion){
						return true;
					}
				}else{
					return true;
				}
			}
			var t = this.type, tag = this.tagName.toLowerCase(),id=this.id,name=this.name,notNull=$(this).attr("notNull"),maxLen=$(this).attr("maxLen"),minLen=$(this).attr("minLen"),fieldType=$(this).attr("fieldType"),regexp=$(this).attr("regexp"),errorMsg=$(this).attr("errorMsg");
			var val="";
			if(regexp){// 用户自定义正则表达式校验
				if(!aweto.check.checkRegexp($(this),eval(regexp))){
					if(errorMsg)
					aweto.showCheckWarnMessage($(this),errorMsg);
					aweto.warn($(this));
					result=false;
					return false;
				}
			}
			var label;
			try{
				if(errorMsg){
					label=errorMsg;
				}else{
					var parent=$(this).parent(".field-container");
					var labelObj=parent.find(".field-name");
					label=labelObj.text();
					if(label){}else{
						label=name;
					}
				}
			}catch(E){}
			if(notNull==""||notNull=="true"){
				notNull=true;
			}
			if(notNull){// 检查非空
				if (t == 'text'|| t== 'textarea'){
					if(!aweto.check.checkNull($(this),'请检查必填字段信息！')){
						result=false;
						return false;
					}
				}else if (t == 'hidden'){
					if(errorMsg){
						if(!aweto.check.checkNull($(this),'请检查必填字段【'+errorMsg+'】信息！')){
							result=false;
							return false;
						}
					}else{
						if(!aweto.check.checkNull($(this),'请检查必填字段信息！')){
							result=false;
							return false;
						}
					}
				}else if (tag == 'select'){
					val=$(this).val();
					if(val==""||val=="-1"||val==null){
						aweto.showCheckWarnMessage($(this),'请检查必填字段信息！');
						aweto.warn($(this));
						result=false;
						return false;
					}
				}
			}
			
			if(maxLen&&minLen){// 检查长度
				if(!aweto.check.checkLength($(this),minLen,maxLen,label+" 长度为："+minLen+" 到 "+maxLen)){
					result=false;
					return false;
				}
			}else if(maxLen){
				if(!aweto.check.checkMaxLength($(this),maxLen,label+" 最大长度为："+maxLen)){
					result=false;
					return false;
				}
			}else if(minLen){
				if(!aweto.check.checkMinLength($(this),minLen,label+" 最小长度为："+minLen)){
					result=false;
					return false;
				}
			}
			if($(this).val()!=""){// 只对非空值检查特定类型
				if(fieldType){// 特定类型检查
					switch (fieldType) {
			        	case 'numeric':
			        			if(isNaN($(this).val())){
									aweto.showCheckWarnMessage($(this),label+' 必须为数字！');
									aweto.warn($(this));
									result=false;
									return false;
			        			}
			        		break;
			        	case '+numeric':
		        			if(!aweto.check.isPlus($(this).val())){
		        				aweto.showCheckWarnMessage($(this),label+' 必须为正数！');
		        				aweto.warn($(this));
								result=false;
		        				return false;
		        			}
		        			break;
			        	case '+numeric0':
		        			if(!aweto.check.isPlusOr0($(this).val())){
		        				aweto.showCheckWarnMessage($(this),label+' 必须为正数或0！');
		        				aweto.warn($(this));
								result=false;
		        				return false;
		        			}
		        			break;
			        	case 'int':
			        			if(!aweto.check.isInt($(this).val())){
			        				aweto.showCheckWarnMessage($(this),label+' 必须为整数！');
			        				aweto.warn($(this));
									result=false;
			        				return false;
			        			}
			        		break;
			        	case '+int':
		        			if(!aweto.check.isPlusInteger($(this).val())){
		        				aweto.showCheckWarnMessage($(this),label+' 必须为正整数！');
		        				aweto.warn($(this));
								result=false;
		        				return false;
		        			}
		        			break;
			        	case '+int0':
		        			if(!aweto.check.isPlusIntegerOr0($(this).val())){
		        				aweto.showCheckWarnMessage($(this),label+' 必须为正整数或0！');
		        				aweto.warn($(this));
								result=false;
		        				return false;
		        			}
		        			break;
			        	case 'mail':
		        			if(!aweto.check.isMail($(this).val())){
		        				aweto.showCheckWarnMessage($(this),"请输入正确的邮件格式！");
		        				aweto.warn($(this));
								result=false;
		        				return false;
		        			}
		        			break;
			        	case 'ip':
		        			if(!aweto.check.isIP($(this).val())){
		        				aweto.showCheckWarnMessage($(this),"请输入正确的IP地址格式！");
		        				aweto.warn($(this));
								result=false;
		        				return false;
		        			}
		        			break;
			        	case 'url':
		        			if(!aweto.check.isURL($(this).val())){
		        				aweto.showCheckWarnMessage($(this),"请输入正确的URL地址格式！");
		        				aweto.warn($(this));
								result=false;
		        				return false;
		        			}
		        			break;
			        	case 'idCard':
		        			if(!aweto.check.isIdCard($(this).val())){
		        				aweto.showCheckWarnMessage($(this),"请输入正确的身份证号码！");
		        				aweto.warn($(this));
								result=false;
		        				return false;
		        			}
		        			break;
			        	case 'phone':
		        			if(!aweto.check.isPhone($(this).val())){
		        				aweto.showCheckWarnMessage($(this),"请输入正确的电话格式！");
		        				aweto.warn($(this));
								result=false;
		        				return false;
		        			}
		        			break;
			        	case 'mobile':
		        			if(!aweto.check.isMobile($(this).val())){
		        				aweto.showCheckWarnMessage($(this),"请输入正确的手机格式！");
		        				aweto.warn($(this));
								result=false;
		        				return false;
		        			}
		        			break;
			        	case 'phoneOrMobile':
			        		if(!(aweto.check.isPhone($(this).val()) || aweto.check.isMobile($(this).val()))){
			        			aweto.showCheckWarnMessage($(this),"请输入正确的电话格式或手机格式！");
		        				aweto.warn($(this));
								result=false;
		        				return false;
			        		}
			        		break;
			        	case 'postCode':
		        			if(!aweto.check.isPostCode($(this).val())){
		        				aweto.showCheckWarnMessage($(this),"请输入正确的邮编格式！");
		        				aweto.warn($(this));
								result=false;
		        				return false;
		        			}
		        			break;
		        			
			        	default:break;
					}
				}
			}
		});
	});
	return result;
};
// 校验form表单数据是否修改
aweto.form.checkModify=function(form){
	var result=false;
	var n = 0;
	var cValues=aweto.form.toJson(form);
		$('input,select,textarea', form).each(function(){
			var t = this.type, tag = this.tagName.toLowerCase(),id=this.id,name=this.name;
			if(!$(this).hasClass("i-form-field-disabled")){
				if(cValues[name]&&name!="_workflowId"&&name!="_workflowNodeId"&&name!="_workflowNodeCode"){
					var origin=$(this).data("origin");
					if(origin!=undefined){
						if(cValues[name]!=origin){
							 //alert("type:"+tag+" name:"+name+"origin:"+origin+" value:"+cValues[name])
							if(tag=='select'){
								if(cValues[name]=="-1"&&origin==""){
									result= false;
								}else{
									result= true;
									n++;
								}
							}else{
								result= true;
								n++;
							}
						}
					}
				}
			}
		});
		if(n>0){
			return true;
		}
		else{
			return false;
		}
	//return result;

};

// 控件警告
aweto.warn=function(obj){
	var t=$(obj).attr("type");
	if(obj.hasClass("generatorView")){
		obj=$('.i-form-field',obj);
	}else if(obj.hasClass('iTextarea')){
		obj=$('textarea',obj);
	}
	obj.addClass( "ui-state-error" );
	try{
		if(!obj.hasClass("Wdate")){
			if(t){
				if(t!='hidden'){
					obj.focus();
				}else{
					if($(obj).hasClass("i-form-checkbox-group")){
						var name=$(obj).attr("name");
						var checkboxName = name+"_check";
						aweto.warn($("input[cname='"+checkboxName+"']"));
					}else{
						aweto.warn($(obj).parent());
					}
				}
			}else{
				obj.focus();
			}
		}
	}catch(E){}
	setTimeout(function(){obj.removeClass( "ui-state-error" );},14000);
};
// 校验消息提醒
aweto.showCheckWarnMessage=function(obj,message){
	if(!$(obj).hasClass("ui-state-error")){
		aweto.Message.show(aweto.lang.label('提示'),message,'warning');
	}
};
/** ********************************entityInfo**************************************** */
aweto.entity=function(){};
aweto.entity.getByName=function(name){
	if(entityInfo){
		return entityInfo[name];
	}
};
aweto.entity.getField=function(entityName,fieldName){
	var entity=aweto.entity.getByName(entityName);
	if(entity){
		return entity.fields[fieldName];
	}
}



/**
 * ********************************enable &&
 * disable*********************************
 */
aweto.enable=function(){};
aweto.enable.fieldId=function(id){
	var target=$("#"+id);
	if(target){
		target.attr("disabled","");
		target.removeAttr("disabled");
		target.attr("readonly","");
		target.removeAttr("readonly");
		target.removeClass("i-form-field-disabled");
	}
};
aweto.enable.fields=function(fields,isRegion){
	$.each(fields,function(i,f){
		var field=$(f);
		if(field){
			if(!field.hasClass("readonly")||isRegion){// 如果字段不是只读
				if(field.attr("editable")=='false'||field.attr("editable")==false){// 不可编辑
					if(field.val()==''){
						field.attr("disabled","");
						field.removeAttr("disabled");
						field.attr("readonly","");
						field.removeAttr("readonly");
						field.removeClass("i-form-field-disabled");
					}
				}else{
					field.attr("disabled","");
					field.removeAttr("disabled");
					field.attr("readonly","");
					field.removeAttr("readonly");
					field.removeClass("i-form-field-disabled");
				}
				var id=field.attr("id");
				if(id&&id.indexOf('kindeditor')>=0){
					getKindeditorObj(id).readonly(false);
				}
				if($(field).hasClass("i-form-complex-el")){// 处理复杂类型元素
					if(f.type=='checkbox'){
						if($(field).parents("a").parents("span.i-form-complex-warpper").hasClass("i-form-disabled")){
							$(field).parents("a").parents("span.i-form-complex-warpper").removeClass("i-form-disabled");
						}
					}
				}
			}
		}
	});
};
aweto.enable.bbarItems=function(items){
	$.each(items,function(i,item){
		if(item){
			try{
				item.enable();
			}catch(e){}
		}
	});
};
aweto.enable.form=function(form){
	formId=form.attr("id");
	if(workflowFormId=formId){
		if(regionFlag){// 有区域，表示工作流已经启动
			for(var i=0;i<regionFields.length;i++){
				var fieldName=regionFields[i];
				var fieldObj=$("input[name='"+fieldName+"'],textarea[name='"+fieldName+"'],select[name='"+fieldName+"']",form);
			// if(fieldObj.attr("type")=="hidden"){
					var viewbtn=fieldObj.attr("viewbtn");
					if(viewbtn){
						var viewbtnObj=$("#"+viewbtn,form);
						if(viewbtnObj){
							aweto.enable.fields([viewbtnObj],true);
						}
					}
			// }
			   if(fieldObj.hasClass("i-form-checkbox-group")){
			    	var checkboxName = fieldName+"_check";
			    	$("input[cname='"+checkboxName+"']",$(form)).each(function(){
			    		aweto.enable.fields([$(this)],true);
					});
			    }
				aweto.enable.fields([fieldObj],true);
			}
			return;
		}
	}
		
	form.each(function() {
		$('input,select,textarea', this).each(function(){
			aweto.enable.fields([this]);
		});
	});
}
aweto.disable=function(){};
aweto.disable.fieldId=function(id){
	var target=$("#"+id);
	if(target){
		target.attr("readonly","readonly");
		target.addClass("i-form-field-disabled");
	}
};
aweto.disable.fields=function(fields){
	$.each(fields,function(i,f){
		var field=$(f);
		if(field){
			var tagName=f.tagName;
			if(tagName){
				tagName=tagName.toLowerCase();
			}
			var fieldType=f.type;
			if(fieldType){
				fieldType=fieldType.toLowerCase();
			}
			field.attr("readonly","readonly");
			if(field.hasClass("i-form-viewbtn")||field.hasClass("i-form-select")||tagName=='select'||fieldType=='checkbox' || fieldType=='radio'){
				
				field.attr("disabled","disabled");
			}
			field.addClass("i-form-field-disabled");
			var id=field.attr("id");
			if(id&&id.indexOf('kindeditor')>=0){
				getKindeditorObj(id).readonly();
			}
			if($(field).hasClass("i-form-complex-el")){// 处理复杂类型元素
				if(f.type=='checkbox'){
					if(!$(field).parents("a").parents("span.i-form-complex-warpper").hasClass("i-form-disabled")){
						$(field).parents("a").parents("span.i-form-complex-warpper").addClass("i-form-disabled");
					}
				}
			}
		}
	});
};
aweto.disable.bbarItems=function(items){
	$.each(items,function(i,item){
		if(item){
			try{
				item.disable();
			}catch(e){}
		}
	});
};

aweto.disable.form=function(form){
	form.each(function() {
		$('input,select,textarea', this).each(function(){
			if($(this).hasClass("unlockable")){
				return;
			}
			
			aweto.disable.fields([this]);
			if(this.tagName.toLowerCase()=='textarea'){
				if(this.id!==undefined){
					if(this.id.indexOf('ckeditor')>=0){
						$(this).removeClass("i-form-field-disabled");
						$(this).removeAttr("disabled");
					}
				}
			}
		});
	});
}

/** *****************************fields********************************* */
aweto.fields=function(){};
aweto.fields.clear=function(fields){
	$.each(fields,function(i,field){
		field.val('');
	});
};

aweto.fields.checkNull=function(fields){
	var result=true;
	for(var i=0;i<fields.length;i=i+1){
		var field=fields[i];
		if(!field.item){
			continue;
		}	
		var t=field.item.attr("type"),tag=field.item.attr("tagName").toLowerCase();
		if(t=='text'){
			if(field.item.val()==""){
				aweto.showCheckWarnMessage($(field.item),'请检查必填字段信息！');
				aweto.warn($(field.item));
				result= false;
				break;
			}
		}else if(tag=='select'){
			if(field.item.val()==""||field.item.val()=="-1"){
				aweto.showCheckWarnMessage($(field.item),'请检查必填字段信息！');
				aweto.warn($(field.item));
				result= false;
				break;
			}
		}
	}
	return result;
};


/** *****************************condition********************************* */
// 构造搜索条件
aweto.condition=function(){return this;};
aweto.condition.encoder=function(){return this;};
aweto.condition.encoder.string=function(items){// like
	return aweto.condition.create(items,":@");
};
aweto.condition.encoder.string.equal=function(items){// =
	return aweto.condition.create(items,":S_E");
};
aweto.condition.encoder.string.IN=function(items){// in
	return aweto.condition.create(items,":S_IN");
};
aweto.condition.encoder.date=function(){return this;};
aweto.condition.encoder.date.equal=function(dateItems){
	return aweto.condition.create(dateItems,":D_E");
};
aweto.condition.encoder.date.min=function(dateItems){
	return aweto.condition.create(dateItems,":D>");
}
aweto.condition.encoder.date.max=function(dateItems){
	return aweto.condition.create(dateItems,":D<");
}

aweto.condition.encoder.string.self=function(dateItems){
	return aweto.condition.create(dateItems,":S_SELF");
}
aweto.condition.encoder.date.between=function(minDateItems,maxDateItems){
	return aweto.condition.create(minDateItems,":D>") +"|"+aweto.condition.create(maxDateItems,":&<");
};
aweto.condition.encoder.form=function(form){
	var condition="";
	form.each(function() {
		$('input,select', this).each(function(){
			var t = this.type, tag = this.tagName.toLowerCase(),id=this.id,name=$(this).attr("name"),date=$(this).attr("date"),operators=$(this).attr("operators");
			var val="";
			var item={};
			if(name){
				if (t == 'text'||t=='hidden'){
					val=$(this).val();
					item[name]=val;
					if(val!==""&&val!=undefined){
						if(date){
							if(date=="min"){
								condition+=aweto.condition.encoder.date.min(item)+"|";
							}else if(date=="max"){
								condition+=aweto.condition.encoder.date.max(item)+"|";
							}else{
								condition+=aweto.condition.encoder.date.equal(item)+"|";
							}
						}else{
							if(operators=="="){
								condition+=aweto.condition.encoder.string.equal(item)+"|";
							}else if(operators=="in"){
								condition+=aweto.condition.encoder.string.IN(item)+"|";
							}else if(operators=="self"){
								condition+=aweto.condition.encoder.string.self(item)+"|";
							}else{
								condition+=aweto.condition.encoder.string(item)+"|";
							}
						}
					}
				}else if (t == 'checkbox' || t == 'radio'){
					if(this.checked == true){
						val="on";
					}else{
						val="";
					}
					item[name]=val;
					condition+=aweto.condition.encoder.string.IN(item)+"|";
				}else if (tag == 'select'){
					val=$(this).val();
					if(val!==""&&val!=undefined&&val!=="-1"){
						item[name]=val;
						if(operators=="="){
							condition+=aweto.condition.encoder.string.equal(item)+"|";
						}else if(operators=="like"){
							condition+=aweto.condition.encoder.string(item)+"|";
						}else{
							condition+=aweto.condition.encoder.string.IN(item)+"|";
						}
					}
				}
			}
		});
	});
	return condition;
};

aweto.condition.create=function(items,split){
	var condition="";
	var count=0;
	for ( var item in items) {
		if(items[item]&&items[item]!=""){
			var v=items[item]+"";
			if(count==0){
				condition+=item+split+v.trim();
			}else{
				condition+="|"+item+split+v.trim();
			}
			count=count+1;
		}
	}
	return condition;
};



/** *****************************message********************************* */


aweto.Message = {
    _messageQueue: new Array(),
    _msgContainer: null,
    
    show: function(title, msg, type, cfg) {
        var container = aweto.Message._msgContainer;
        var queue = aweto.Message._messageQueue;
        if(container == null) {
            container = $('<div class="i-message-container" ></div>');
            if(aweto.isTop()){
            	container.appendTo(document.body);
            }else{
            	try{
            		container.appendTo(window.parent.document.body);
            	}catch(e){
            		container.appendTo(document.body);
            	}
            }
            aweto.Message._msgContainer = container;
            $(window).scroll(function(){
                container.css('bottom', -document.body.scrollTop-document.documentElement.scrollTop);
            });
        }
       if(type =='message'||type=='task'||type=='notice'){
        	container.addClass("notAutoHide");
        }
        var p = new aweto.Message.MessagePanel({
            msgTitle: title,
            msgContent: msg,
            type: type,
            cfg:cfg
        });
        container.prepend(p.dom);
        p.show();
    }
};
aweto.Message.MessagePanel = function(cfg) {
    aweto.mixin(this, cfg);
    this.type = cfg.type || 'info';
    var c = $('<div class="i-message i-message-{0}" />'.format(this.type));
    var header = $('<div class="i-message-header"><div class="i-message-title-img"/><div class="i-message-title">{0}</div><div class="i-message-tool-close" /></div>'.format(aweto.lang.label(this.msgTitle)));
    var content = $('<div></div>');
    if(typeof this.msgContent =='object'){
    	content.addClass("i-message-contents");
    	var contentTable=$("<table width='165px'></table>").appendTo(content);
    	for(var i=0;i<this.msgContent.length;i++){
    		var cObj=this.msgContent[i];
    		var msgRow=$("<tr><td valign='middle' class='i-message-message-icon'><a class='content' title='["+cObj.title+"]"+cObj.content+"' >["+cObj.title+"]"+cObj.content+"</a></td><td valign='middle' align='right'><a class='sender' title='消息来自："+cObj.sender+"'>"+cObj.sender+"</a></td></tr>").appendTo(contentTable);
    	}
    	if(this.msgContent.length>12){
    		content.css('height','260px');
    	}
    }else{
    	content.addClass("i-message-content");
    	$("<table height='75px' width='165px'><tr><td valign='middle'>"+aweto.lang.label(this.msgContent)+"</td></tr></table>").appendTo(content);
    }
    
    var _t = this;
    header.children('.i-message-tool-close').click(function() {
        _t.hide();
    });
    c.append(header);
    c.append(content);
    this.dom = c;
};
aweto.Message.MessagePanel.prototype = {
    show: function() {
        var _t = this;
        _t.dom.slideDown(1000);
        if(_t.cfg&&_t.cfg.timeout){
        	 setTimeout(function() {
                 _t.hide();
             }, _t.cfg.timeout);
        	 return;
        }
        if(_t.type =='message'||_t.type=='task'||_t.type=='notice'){
        	return;
        }
        if(_t.type == 'info') {
            setTimeout(function() {
                _t.hide();
            }, 5000);
        }else{
        	setTimeout(function() {
                _t.hide();
            }, 8000);
        }
    },
    hide: function() {
        var _t = this;
        _t.dom.slideUp(1500);
        setTimeout(function() {
            _t.dom.remove();
        }, 1500);
    }
};

aweto.Message.showWelcome=function(user){
	setTimeout(function() {
		if(user)
        aweto.Message.show("欢迎信息","欢迎，"+user+"!");
    }, 3000);
	
}

aweto.Message.showHistory=function(mlist){
	var msgs=aweto.JSON.decode(mlist);
	aweto.Message.show("未读消息("+msgs.length+")",msgs,'message');
}

aweto.Message.send=function(opt){
	var tmpOpt={
				url:basePath+'message/sendMessage.ajax',
				sender:'',
				receivers:'',
				sendType:'all',
				title:'消息',
				content:'',
				success:function(){}
			};
	tmpOpt=$.extend(tmpOpt,opt);
	aweto.ajax(tmpOpt.url,{sender:tmpOpt.sender,receivers:tmpOpt.receivers,sendType:tmpOpt.sendType,title:tmpOpt.title,content:tmpOpt.content},true,function(result){
		if(typeof tmpOpt.success=='function'){
			tmpOpt.success(result);
		}
	});
}

aweto.Message.receive=function(title,message,type){
	setTimeout(function() {
		aweto.Message.show(title,message,type);
    }, 1000);
}

aweto.Message.clear=function(){
	if(!aweto.isTop()){
		try{
			$(".i-message-container",window.parent.document).each(function(){
				if(!$(this).hasClass("notAutoHide")){
					$(this).hide();
				}
			});
		}catch(e){}
	}
}

var dialogs={};
var dialogIframeDoc;
/** *****************************dialog********************************* */
aweto.Dialog ={
	show:function(title,msg,type,handle,param){
		alert(type+":"+msg)
		if(type!='waiting'){
			if(!aweto.isTop()){
				if(aweto.getTopWin().aweto){
					aweto.getTopWin().aweto.Dialog.show(title,msg,type,handle,param);
				}else{
					alert(msg);
				}
				return;
			}
		}
		
		var container=$("<div></div>");
		 container.appendTo(document.body);	
		 if(type!=undefined&&type.indexOf("confirm")!=-1){
			container.dialog({
						bgiframe: false,
						resizable: false,
						draggable: true,//aweto.browser.getBrowserVersion()>8?false:true,
						height:140,
						modal: true,
						title: aweto.lang.label(title),
						open: function() {
								var self = $(this);
								container.append("<span><div class='aweto-dialog-confirm'></div><div class='aweto-dialog-content'>"+aweto.lang.label(msg)+"</div></span>");
						},
						close: function() {
								$(this).html('');
						},
						buttons: {
							'确定': function() {
							    container.empty();
								container.append("<span><div></div><div class='aweto-dialog-content'><img src='"+aweto.basePath+"ui/images/loading-32.gif' /><strong>正在处理...</strong></div></span>");
								$(this).dialog('option','buttons',{'关闭':function(){$(this).dialog('close');}});
								try{
									if(typeof handle =='function'){
										handle(param);
									}else{
										$(handle);
									}
								}catch(e){}
								$(container).dialog('close');
							},
							'取消': function() {
								$(this).dialog('close');
							}
						}
				});
		 }else{
				var dialog_class="";
				var target="";
				if(type!=undefined&&type.indexOf('error')!=-1){
					dialog_class="aweto-dialog-error";
				}else if(type!=undefined&&type.indexOf('success')!=-1){
					dialog_class="aweto-dialog-success";
				}else if(type!=undefined&&type.indexOf('waiting')!=-1){
					dialog_class="aweto-dialog-waiting";
				}else if(type==undefined){
					dialog_class="aweto-dialog-message";
				}else {
					target=$("body").find("[id="+type+"]");
				}
				container.dialog({
							bgiframe: true,
							modal: true,
							title: aweto.lang.label(title),
							resizable: false,
							draggable: true,//aweto.browser.getBrowserVersion()>8?false:true,
							open: function() {
								var self = $(this);
								self.html("<span><div class='"+dialog_class+"'></div><div class='aweto-dialog-content'>"+aweto.lang.label(msg)+"</div></span>");
							},
							buttons: {
								"确定": function() {
									try{
										if(typeof handle =='function'){
											handle(param);
										}else{
											$(handle);
										}
									}catch(e){}
									if(target!=""&&target!=undefined){
										target.focus();
									}
									$(this).dialog('close');
								}
							}
				});
		 }
		 this.setMessage=function(msg,icon){
			 var img="";
			 if(icon){
				 img="<img src='"+icon+"' />";
			 }
			 container.empty();
			 container.append("<span><div></div><div class='aweto-dialog-content'>"+img+""+msg+"</div></span>");
		 }
		 this.close=function(){
			 container.dialog('close');
		 }
		 return this;
	},
	showModelContent:function(content,config,callback,cdoc,params){
		if(!aweto.isTop()){
			aweto.getTopWin().aweto.Dialog.showModelContent(content,config,callback,cdoc,params);
			return;
		}
		$(content).appendTo(document.body);	
		config=$.extend(config,{
			iframeDoc:cdoc,//iframe模式将iframe对象传递到回调函数
			params:params,
			buttons: {
			'确定': function() {
				var iframeDoc=$(this).dialog( "option" , 'iframeDoc'  );
				var params=$(this).dialog( "option" , 'params'  );
				if(typeof callback=='function'){
					if(callback(iframeDoc,params)){
						$(this).dialog('close');
					}
				}else{
					$(this).dialog('close');
				}
				
			},
			'取消': function() {
				$(this).dialog('close');
			}
		}})
		return $(content).dialog(config);
	},
	showModelDialog:function(index,title,dWidth,dHeight,dialogURL,callback,cdoc){
		if(!aweto.isTop()){
			aweto.getTopWin().aweto.Dialog.showModelDialog(index,title,dWidth,dHeight,dialogURL,callback,cdoc);
			return;
		}
		var container=$("<div style='width:1024px'><iframe width='"+(dWidth)+"px;' height='"+(dHeight)+"px' frameborder='0'/></div>");
		$(container).appendTo(document.body);	
		var d= $(container).dialog({
			bgiframe: false,
			resizable: false,
			draggable: true,
			height:dHeight+30,
			width:dWidth,
			modal: true,
			title: title,
			open: function() {
				$("iframe",container).attr("src",dialogURL);
			},
			close: function() {
				$(container).html('');
			}
		});
		d.close=function(params){
			if(typeof callback=='function'){
				callback(params);
			}
			d.dialog('close');
		}
		dialogs[index]=d;
		return d;
	}
};


aweto.confirm=function(){};
// 对话框-确认
aweto.confirm.show=function(message,callback){
	var container=$("<div></div>");
	 container.appendTo(document.body);	
	 container.dialog({
			bgiframe: false,
			resizable: false,
			draggable: false,
			height:140,
			modal: true,
			title: '确认框',
			open: function() {
				var self = $(this);
				container.append("<span><div class='aweto-dialog-confirm'></div><div class='aweto-dialog-content'>"+message+"</div></span>");
			},
			close: function() {
					$(this).html('');
				},
			buttons: {
				'确定': function() {
					if(typeof callback=='function'){
						callback(true);
					}
					$(this).dialog('close');
				},
				'取消': function() {
					if(typeof callback=='function'){
						callback(false);
					}
					$(this).dialog('close');
				}
			}
		});
};

// 简单通用的检索对话框
aweto.showSearchDialog=function(callback,label){
	var lb=aweto.lang.label("检索条件");
	if(label){
		lb=label;
	}
	$("<div></div>").simpleSearch({
		title:"快捷检索",
		label:lb,
		onSubmit:callback
	});
};
// 排序对话框
aweto.showDepartSortDialog=function(departId,userId,appId,callback){
	var container=$("<div></div>");
	 container.appendTo(document.body);
	 var content=$("<div class='panel aweto-search-dialog'><div class='page-panel' style='clear: both;' ><div class='info-content'><fieldset><legend>排序设置</legend><form class='i-form'><span class='field-container'> <span class='field-name'>排列序号:</span> <input id='sortValue' name='sortValue' class='i-form-field i-item-sortValue' style='z-index:99999999999'></span><span class='field-container' style='display:none'> <span class='field-name'>BUGE:<span>*</span></span> <input id='REMOVE_BUGE_FOR_DIALOG' name='REMOVE_BUGE_FOR_DIALOG'/></span></form></fieldset></div></div></div>");
	 container.dialog({
		bgiframe: false,
		modal: false,
		width:350,
		title: "排序设置",
		resizable: false,
		draggable: false,
		open: function() {
				var self = $(this);
				self.html(content);
	 		},
		buttons: {
	 		"设置": function() {
				var value=$("#sortValue",content).val();
				if(!aweto.check.isPlusInteger(value)){
					aweto.Message.show('提示',"请输入正整数");
					aweto.warn($("#sortValue",content));
					return;
				}
				aweto.ajax(basePath+'ADepart/userSortValue.action',{departId:departId,userId:userId,appId:appId,sortValue:value},true,function(result){
					if (result.state == WARN || result.state == ERROR) {
						aweto.Message.show('错误', result.msgInfo, 'error');
					} else if (result.state == SUCCESS) {
						aweto.Message.show('提示', result.msgInfo);
						if(typeof callback=='function'){
							callback();
						}	
						container.dialog('close');
					}
				});
			},
	 		"取消":function(){
	 			$(this).dialog('close');
	 		}
		}
	});
}

/** ***************************selector****************************** */
aweto.selector=function(){return this;};
aweto.selector.showMenuSelector=function(opt){
	if(!opt){return;}
	$("<div></div>").simpleMenuSelector({
		id:opt.id,
		target:opt.target,
		event:opt.event,
		title:opt.title,
		data:opt.data,
		single:opt.single,// 是否为单选
		onSubmit:opt.onSubmit // 提交回调函数
	});
}
aweto.selector.showTreeSelector=function(opt){
	if(!opt){return;}
	$("<div></div>").simpleTreeSelector({
		treeUrl:opt.treeUrl,// 树数据加载
		selectUrl:opt.selectUrl,// 待选数据加载url
		searchUrl:opt.searchUrl,// 检索响应url
		selectedUrl:opt.selectedUrl,// 已选数据加载url
		title:opt.title,
		single:opt.single,// 是否为单选
		treeEvent:opt.treeEvent,// {folder:true,doc:true} 树点击响应事件folder 响应目录节点
								// doc 响应子节点
		returnType:opt.returnType,// {id:true,desc:true} 返回值类型id
									// ['1','2'],desc ['test','test1'] ,id desc
									// [{id:'1',desc:'test'},{id:'2',desc:'test2'}]
		onSubmit:opt.onSubmit, // 提交回调函数
		orgFilter:opt.orgFilter,
		//orgList:opt.orgList,
		orgList:opt.orgList,
		param:opt.param, // 回调函数携带参数
		params:opt.params,// 传送后台参数
		selected:opt.selected//初始化已经选中[{id:'',name:''}]
	});
};

aweto.selector.showTreeTableSelector=function(opt){
	if(!opt){return;}
	$("<div></div>").simpleTreeTableSelector({
		treeUrl:opt.treeUrl,// 树数据加载
		tableUrl:opt.tableUrl,// 检索响应url
		title:opt.title,
		descField:opt.descField,// 已选区域显示字段
		single:opt.single,// 是否为单选
		treeEvent:opt.treeEvent,// {folder:true,doc:true} 树点击响应事件folder 响应目录节点
								// doc 响应子节点
		returnType:opt.returnType,// {id:true,desc:true} 返回值类型id
									// ['1','2'],desc ['test','test1'] ,id desc
									// [{id:'1',desc:'test'},{id:'2',desc:'test2'}]
		orgFilter:opt.orgFilter,//是否显示公司过滤
		orgList:opt.orgList,
		onSubmit:opt.onSubmit, // 提交回调函数
		param:opt.param, // 回调函数携带参数
		params:opt.params// 传送后台参数
	});
};
aweto.selector.showTableSelector=function(opt){
	if(!opt){return;}
	$("<div></div>").simpleTableSelector({
		url:opt.url,
		title:opt.title,
		entityName:opt.entityName,//实体名
		renderFields:opt.renderFields,//显示字段名
		single:opt.single,// 是否为单选
		pageLevel:opt.pageLevel,
		defaultConditions:opt.defaultConditions,//默认条件
		parentId:opt.parentId,
		returnType:opt.returnType,  // 'pkValue' ,'rows' ;pkValue:返回每行的主键；rows
									// 返回行dom对象
		onSubmit:opt.onSubmit, // 提交回调函数
		selectorType:opt.selectorType,//选择器类型
		onCancel:opt.onCancel, // 取消回调函数
		param:opt.param,  // 回调函数携带参数
		params:opt.params,// 传送后台参数
		initCondition:opt.initCondition // 表单初始条件
	});
};
aweto.selector.showZTreeSelector=function(opt){
	if(!opt){return;}
	$("<div></div>").simpleZTreeSelector({
		url:opt.url,// 树数据加载
		entityName:opt.entityName,//实体名
		rootName:opt.rootName,//根节点显示名
		orderField:opt.orderField,//排序字段
		title:opt.title,
		single:opt.single,// 是否为单选
		nullable:opt.nullable,
		returnType:opt.returnType,// {id:true,desc:true} 返回值类型id
									// ['1','2'],desc ['test','test1'] ,id desc
									// [{id:'1',desc:'test'},{id:'2',desc:'test2'}]
		onSubmit:opt.onSubmit, // 提交回调函数
		params:opt.params,// 传送后台参数
		defaultConditions:opt.defaultConditions,
		selected:opt.selected//初始化已经选中[{id:'',name:''}]
	});
};

aweto.selector.showZTreeTableSelector=function(opt){
	if(!opt){return;}
	$("<div></div>").simpleZTreeTableSelector({
		treeUrl:opt.treeUrl,// 树数据加载
		tableUrl:opt.tableUrl,// 检索响应url
		title:opt.title,
		descField:opt.descField,// 已选区域显示字段
		single:opt.single,// 是否为单选
		treeEvent:opt.treeEvent,// {folder:true,doc:true} 树点击响应事件folder 响应目录节点
								// doc 响应子节点
		returnType:opt.returnType,// {id:true,desc:true} 返回值类型id
									// ['1','2'],desc ['test','test1'] ,id desc
									// [{id:'1',desc:'test'},{id:'2',desc:'test2'}]
		orgFilter:opt.orgFilter,//是否显示公司过滤
		orgList:opt.orgList,
		onSubmit:opt.onSubmit, // 提交回调函数
		param:opt.param, // 回调函数携带参数
		params:opt.params// 传送后台参数
	});
};

aweto.selector.showCoordinateSelector=function(opt){//地图坐标选择
	if(!opt){return;}
	$("<div></div>").simpleCoordinate(opt);
}

/** ***************************下面是定义好的常用选择器(可扩展)**************************** */
aweto.selector.showTestTreeSelector=function(){
	var tmp="test";
	aweto.selector.showTreeSelector({
			treeUrl:basePath+'Aselector/loadTree.ajax',// 树数据加载
			selectUrl:basePath+'Aselector/loadData.ajax',// 待选数据加载url
			searchUrl:basePath+'Aselector/search.ajax',// 检索响应url
			title:'测试选择器',
			single:false,// 是否为单选
			treeEvent:{folder:true,doc:true},// 树点击响应事件folder 响应目录节点 doc
												// 响应子节点
			returnType:{id:true,desc:true},// 返回值类型id ['1','2'],desc
											// ['test','test1'] ,id desc
											// [{id:'1',desc:'test'},{id:'2',desc:'test2'}]
			onSubmit:afterSelect, // 提交回调函数
			param:{tmp:tmp} // 回调函数携带参数
	});
};

aweto.selector.showModuleSelector=function(opt){
	var tmpOpt={
			url:basePath+"Aselector/moduleSelector.ajax",
			single:true,
			title:'功能模块选择',
			returnType:'rows'  // pkValue,rows
			};
	tmpOpt=$.extend(tmpOpt,opt);
	aweto.selector.showTableSelector(tmpOpt);
};
aweto.selector.showModuleNodeSelector=function(opt){
	var tmpOpt={
			url:basePath+"Aselector/moduleNodeSelector.ajax",
			single:true,
			title:'功能子模块选择',
			returnType:'rows'  // pkValue,rows
			};
	tmpOpt=$.extend(tmpOpt,opt);
	aweto.selector.showTableSelector(tmpOpt);
};
aweto.selector.showOperatorSelector=function(opt){
	var tmpOpt={
			url:basePath+"Aselector/operatorSelector.ajax",
			single:false,
			title:'操作项选择',
			returnType:'pkValue'  // pkValue,rows
		};
	tmpOpt=$.extend(tmpOpt,opt);
	aweto.selector.showTableSelector(tmpOpt);
};
// 系统用户选择器
aweto.selector.showUserSelector=function(opt){
	var tmpOpt={
			treeUrl:basePath+'system/depart/departSelectorTree.ajax',// 树数据加载
			selectUrl:basePath+'employee/empSelectorData.ajax',// 待选数据加载url
			searchUrl:basePath+'employee/empSelectorSearch.ajax',// 检索响应url
			title:'员工选择',
			params:{permission:false},
			single:false,// 是否为单选
			treeEvent:{folder:true,doc:true},
			returnType:{id:true,desc:false}
		};
	tmpOpt=$.extend(tmpOpt,opt);
	aweto.selector.showTreeSelector(tmpOpt);
};


// 系统岗位选择器
aweto.selector.showPostrSelector=function(opt){
	aweto.selector.showPostSelector(opt)
}
aweto.selector.showPostSelector=function(opt){
	var tmpOpt={
			treeUrl:basePath+'Aselector/departSelectorTree.ajax',// 树数据加载
			selectUrl:basePath+'APost/postSelectorData.ajax',// 待选数据加载url
			searchUrl:basePath+'APost/postSelectorSearch.ajax',// 检索响应url
			title:'岗位选择',
			single:false,// 是否为单选
			treeEvent:{folder:true,doc:true},
			returnType:{id:true,desc:false}
		};
	tmpOpt=$.extend(tmpOpt,opt);
	aweto.selector.showTreeSelector(tmpOpt);
};

// 系统部门选择器
aweto.selector.showDepartSelector=function(opt){
	var tmpOpt={
			url:basePath+'Aselector/departSelectorTree.ajax',// 树数据加载
			title:'部门选择',
			nullable:true,//可否不选
			single:true// 是否为单选
		};
	tmpOpt=$.extend(tmpOpt,opt);
	aweto.selector.showZTreeSelector(tmpOpt);
};

// 导航树选择器
aweto.selector.showNavTreeSelector=function(opt){
	var tmpOpt={
				treeUrl:basePath+'Aselector/navSelectorTree.ajax',// 树数据加载
				selectUrl:basePath+'Aselector/navSelectorData.ajax',// 待选数据加载url
				searchUrl:basePath+'Aselector/NavSelectorSearch.ajax',// 检索响应url
				title:'导航选择器',
				single:false,// 是否为单选
				treeEvent:{folder:true,doc:true},// 树点击响应事件folder 响应目录节点 doc
													// 响应子节点
				returnType:{id:true,desc:true}// 返回值类型id ['1','2'],desc
												// ['test','test1'] ,id desc
												// [{id:'1',desc:'test'},{id:'2',desc:'test2'}]
			};
	tmpOpt=$.extend(tmpOpt,opt);
	aweto.selector.showTreeSelector(tmpOpt);
	
};


// 系统角色选择器
aweto.selector.showRoleSelector=function(opt){
	var tmpOpt={
			url:basePath+"Aselector/roleSelector.ajax",
			single:false,
			title:'角色选择',
			returnType:'pkValue'  // pkValue,rows
		};
	tmpOpt=$.extend(tmpOpt,opt);
	aweto.selector.showTableSelector(tmpOpt);
};

// 系统权限选择器
aweto.selector.showPermissionSelector=function(opt){
	var tmpOpt={
			url:basePath+"Aselector/permissionSelector.ajax",
			single:false,
			title:'权限选择',
			returnType:'pkValue'  // pkValue,rows
		};
	tmpOpt=$.extend(tmpOpt,opt);
	aweto.selector.showTableSelector(tmpOpt);
};

// 调度任务选择器
aweto.selector.showSchedulerJobSelector=function(opt){
	var tmpOpt={
			url:basePath+"system/scheduler/jobSelector.ajax",
			single:true,
			title:'调度任务选择',
			returnType:'pkValue'  // pkValue,rows
		};
	tmpOpt=$.extend(tmpOpt,opt);
	aweto.selector.showTableSelector(tmpOpt);
};


// 浏览器操作系统判断
(function(){
	var ua = navigator.userAgent.toLowerCase(),
	check = function(r){
	    return r.test(ua);
	},
	DOC = document;
	aweto.isStrict = DOC.compatMode == "CSS1Compat";
	aweto.isOpera = check(/opera/);
	aweto.isChrome = check(/chrome/);
	aweto.isWebKit = check(/webkit/);
	aweto.isSafari = !aweto.isChrome && check(/safari/);
	aweto.isSafari2 = aweto.isSafari && check(/applewebkit\/4/); // unique to
																	// Safari 2
	aweto.isSafari3 = aweto.isSafari && check(/version\/3/);
	aweto.isSafari4 = aweto.isSafari && check(/version\/4/);
	aweto.isIE = !aweto.isOpera && check(/msie/);
	aweto.isIE7 = aweto.isIE && check(/msie 7/);
	aweto.isIE8 = aweto.isIE && check(/msie 8/);
	aweto.isIE9 = aweto.isIE && check(/msie 9/);
	aweto.isIE6 = aweto.isIE && !aweto.isIE7 && !aweto.isIE8;
	aweto.isGecko = !aweto.isWebKit && check(/gecko/);
	aweto.isGecko2 = aweto.isGecko && check(/rv:1\.8/);
	aweto.isGecko3 = aweto.isGecko && check(/rv:1\.9/);
	aweto.isBorderBox = aweto.isIE && !aweto.isStrict;
	aweto.isWindows = check(/windows|win32/);
	aweto.isMac = check(/macintosh|mac os x/);
	aweto.isAir = check(/adobeair/);
	aweto.isLinux = check(/linux/);
	aweto.isFirefox = check(/firefox/);
})();

/**
 * ************************************browser
 * 浏览器工具****************************************
 */
aweto.browser=function(){};
//取浏览器版本
aweto.browser.getBrowserVersion =function(){
	if(navigator.appVersion.indexOf("MSIE") != -1)
		return parseFloat(navigator.appVersion.split("MSIE")[1]);  
	else
		return parseFloat(navigator.appVersion);
};
//取浏览器文档模式
aweto.browser.getDocModeVersion =function(){
	if(aweto.browser.getBrowserVersion()<8){
		//return 7;
	}
	return parseFloat(document.documentMode);
};
aweto.browser.isLowerThanIE7=function(){
	if(aweto.isIE&&aweto.browser.getBrowserVersion()<=7){
		return true;
	}
	return false;
}
/* Get the document inside of an IFRAME in IE and Firefox */
aweto.browser.getIframeDoc=function(IFrameObj){
	var IFrameDoc;
	if (IFrameObj.contentDocument)
	{
	    // For NS6
	    IFrameDoc = IFrameObj.contentDocument; 
	}
	else if (IFrameObj.contentWindow) 
	{
	    IFrameDoc = IFrameObj.contentWindow.document;
	}
	else if (IFrameObj.document) 
	{
	    IFrameDoc = IFrameObj.document;
	}
	else 
	{
	    return null;
		}
		return IFrameDoc;
};
/* Get the top of an object in IE and Firefox */
aweto.browser.getTop=function (el){
	if(aweto.isIE)
	{
		return el.posTop;
	}
	else
	{
		return el.top;
	}    
};

/* Get the left of an object in IE and Firefox */
aweto.browser.getLeft=function(el){
	if(aweto.isIE)
	{
		return el.posLeft;
	}
	else
	{
		return el.left;
	}
};
/* Stop an event from bubbling in IE and Firefox */
aweto.browser.stopBubble=function(evt){
	if(aweto.isIE)
		evt.cancelBubble=true;
	else
		evt.stopPropagation();
};

/* kill an event in IE and Firefox */
aweto.browser.cancelEvent=function(evt){
	if(aweto.isIE)
	{
		evt.cancelBubble=true;
		evt.returnValue=false;
	}
	else
	{
		evt.stopPropagation();
		evt.preventDefault();
	}
};

/* Remove a bound event from an object in IE and Firefox */
aweto.browser.removeListener=function(object, eventType, listener, capture ){
	if(aweto.isIE)
	{
	   	object.detachEvent( "on"+eventType , listener );
	}
	else // Mozilla, Netscape, Firefox
	{
		object.removeEventListener(eventType, listener, capture);
	}

};

/* Bind an event to an object in IE and Firefox */	
aweto.browser.addListener=function(object, eventType, listener, capture ){
	if(aweto.isIE)
	{
	    object.attachEvent( "on"+eventType , listener);
	}
	else // Mozilla, Netscape, Firefox
	{
		object.addEventListener(eventType, listener, capture);
	}
};

/* Gets the source element of an event in IE and Firefox */	
aweto.browser.getSourceElement=function(event)
{
	var srcEl = event.srcElement;
	if(srcEl==null)
		srcEl = event.target;
	return srcEl;
};

/* Fires an event on an object in IE and Firefox */
aweto.browser.frontEndEvent=function(obj, eventType)
{
	// TODO - dispatch events in Firefox is not complete...
	if(!aweto.valid(obj))
	{
		if(aweto.isIE)
		{
			obj.fireEvent("on"+eventType);
		}
		else
		{
			var evt =null;
			if(eventType=="click" || eventType=="mousedown" || eventType=="mouseenter")
			{
				evt = document.createEvent("MouseEvents");
				evt.initMouseEvent(eventType, true, true, window,0, 0, 0, 0, 0, false, false, false, false, 0, null);
			}
			if(!aweto.valid(evt))
				obj.dispatchEvent(evt);
		}
	}		
};

/* Used to suppress link visibility in status window */
aweto.browser.noStatus=function()
{
	window.status='Done'; 
	return true;
};

/**
 * returns a point for an event offset
 * 
 * @param event
 * @return
 */
aweto.browser.getEventOffset=function(event)
{
	var obj = getSourceElement(event);
	var pos_x = event.offsetX?(event.offsetX):event.pageX-getLeftPosition(obj);
	var pos_y = event.offsetY?(event.offsetY):event.pageY-getTopPosition(obj);
	if(typeof(pos_x)!='number' || undef(pos_x))
		pos_x=0;
	if(typeof(pos_y)!='number'|| undef(pos_y))
		pos_y=0;
	
	var point={event:event,
				x:pos_x,
				y:pos_y};
	return point;
};


// 计算两个日期之差
aweto.datejs=function(sdate1, sdate2) {
	var adate, odate1, odate2, idays;
	odate1 = new Date(sdate1);
	odate2 = new Date(sdate2);
	idays = parseInt(Math.abs(odate1.getTime() - odate2.getTime()) / 1000 / 60
			/ 60 / 24 + 1);
	return idays;
};
/**
 * ************************************check
 * 校验**************************************
 */
aweto.check=function(){};
// 判断是否为正整数
aweto.check.isPlusInteger=function(num){
	if (num == 0) {
		return false;
	}
	var reg = /^\+?\d+(\d+)*$/;
	var temp = (reg.test(num)) ? true : false;
	return temp;
};
// 判断钱
aweto.check.isMoney=function(num){
	if (num == 0) {
		return false;
	}
	var reg = /^(?:[1-9]\d*|0)(\.\d+)?$/;
	var temp = (reg.test(num)) ? true : false;
	return temp;
};
// 判断是否为正整数或0
aweto.check.isPlusIntegerOr0=function(num){
	var reg = /^\+?\d+(\d+)*$/;
	var temp = (reg.test(num)) ? true : false;
	return temp;
};
// 判断是否为正数
aweto.check.isPlus=function(num) {
	if (num == 0) {
		return false;
	}
	var reg = /^\+?\d+.?(\d+)*$/;
	var temp = (reg.test(num)) ? true : false;
	return temp;
};
// 判断是否为正数或0
aweto.check.isPlusOr0=function(num) {
	var reg = /^(?:[0-9]\d*|0)(\.\d+)?$/;
	var temp = (reg.test(num)) ? true : false;
	return temp;
};
// 去除数字中的逗号后判断其是否为正数
aweto.check.isTZero=function(num) {
	var untPrc = "";
	var oriUntPrc = "";
	oriUntPrc = num;
	if (oriUntPrc.indexOf(",") != -1) {
		var prc = oriUntPrc.split(',');
		for ( var i = 0; i < prc.length; i++) {
			untPrc = untPrc + prc[i];
		}
	} else {
		untPrc = oriUntPrc;
	}
	if (untPrc >= 0) {
		return true;
	} else {
		return false;
	}
};

// 是否为整数
aweto.check.isInt=function(num) {
	var reg = /^[+-]?\d+$/;
	var temp = (reg.test(num)) ? true : false;
	return temp;
};

// 是否为负数
aweto.check.isNegative=function(num) {
	var reg = /^\-?\d+.?\d+$/;
	var temp = (reg.test(num)) ? true : false;
	return temp;
};
// 是否为小数
aweto.check.isDecimal=function(num) {
	var reg = /^[+-]?\d+.{1}\d+$/;
	var temp = (reg.test(num)) ? true : false;
	return temp;
};
// 是否为日期
aweto.check.isDate=function(theStr) {
	var yyyy = theStr.substring(0,4);
	var mm = theStr.substring(5,7);
	var dd = theStr.substring(8,10);
	
	var int_yyyy = parseInt(yyyy);
	var int_mm = parseInt(mm);
	var int_dd = parseInt(dd);
	
	if(isNaN(int_yyyy)||isNaN(int_mm)||isNaN(int_dd)){
		return false;
	}
	if(int_yyyy>2150||int_yyyy<1900){
		return false;
	}
	if(int_mm>12||int_yyyy<1){
		return false;
	}
	if(int_dd>31||int_yyyy<1){
		return false;
	}
	
	if(int_mm==2){
		if(!(((int_yyyy%4==0)&&(int_yyyy%100!=0))||(int_yyyy%400==0))){
			if(int_dd>28){
				return false;
			}
		}else{
			if(int_dd>29){
				return false;
			}
		}
	}
	if(int_mm==4||int_mm==6||int_mm==9||int_mm==1){
		if(int_dd>30){
			return false;
		}
	}
	return true;
};
// 是否为时间
aweto.check.isTime=function(theStr, format) {
	var reg = /^(\d{1,2})(:)?(\d{1,2})\2(\d{1,2})$/;
	var attr = str.match(reg)
	if (attr == null) {
		return false;
	}
	if (a[1] > 24 || a[3] > 60 || a[4] > 60) {
		return false;
	}
	return true;
};

// 是否是邮件
aweto.check.isMail=function(str){
	var reg=/^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?$/i;
	var temp = (reg.test(str)) ? true : false;
	return temp;
};
// 是否是IP
aweto.check.isIP=function(str){
	var reg=/^(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])$/;
	var temp = (reg.test(str)) ? true : false;
	return temp;
};
// url连接
aweto.check.isURL=function(str_url){
    var strRegex = "^((https|http|ftp|rtsp|mms)?://)" 
    + "?(([0-9a-z_!~*'().&=+$%-]+: )?[0-9a-z_!~*'().&=+$%-]+@)?" // ftp的user@
          + "(([0-9]{1,3}\.){3}[0-9]{1,3}" // IP形式的URL- 199.194.52.184
          + "|" // 允许IP和DOMAIN（域名）
          + "([0-9a-z_!~*'()-]+\.)*" // 域名- www.
          + "([0-9a-z][0-9a-z-]{0,61})?[0-9a-z]\." // 二级域名
          + "[a-z]{2,6})" // first level domain- .com or .museum
          + "(:[0-9]{1,4})?" // 端口- :80
          + "((/?)|" // a slash isn't required if there is no file name
          + "(/[0-9a-z_!~*'().;?:@&=+$,%#-]+)+/?)$"; 
          var re=new RegExp(strRegex); 
          if (re.test(str_url)){
              return (true); 
          }else{ 
              return (false); 
          }
}
// 身份证号码
aweto.check.isIdCard=function(idCard){
	var reg=/^((1[1-5])|(2[1-3])|(3[1-7])|(4[1-6])|(5[0-4])|(6[1-5])|71|(8[12])|91)\d{4}((19\d{2}(0[13-9]|1[012])(0[1-9]|[12]\d|30))|(19\d{2}(0[13578]|1[02])31)|(19\d{2}02(0[1-9]|1\d|2[0-8]))|(19([13579][26]|[2468][048]|0[48])0229))\d{3}(\d|X|x)?$/;
	var temp = (reg.test(idCard)) ? true : false;
	return temp;
}
// 电话号码，3-4位区号，7-8位直拨号码，1-4位分机号
aweto.check.isPhone=function(phone){
	var reg=/^((\d{7,8})|((\d{4}|\d{3})-(\d{7,8}))|((\d{4}|\d{3})-(\d{7,8})-(\d{4}|\d{3}|\d{2}|\d{1}))|((\d{7,8})-(\d{4}|\d{3}|\d{2}|\d{1})))$/;
	var temp = (reg.test(phone)) ? true : false;
	return temp;
}
// 手机号码 带86或+86的 11位号码
aweto.check.isMobile=function(mobile){
	var reg=/^((\+86)|(86))?\d{11}$/;
	var temp = (reg.test(mobile)) ? true : false;
	return temp;
}
// 邮编
aweto.check.isPostCode=function(postCode){
	var reg=/^[1-9][0-9]{5}$/;
	var temp = (reg.test(postCode)) ? true : false;
	return temp;
}
aweto.check.checkLength= function(o, min, max, message ) {
	if(typeof o=='object'){
		if ( o.val().length > max || o.val().length < min ) {
			if(message){
				aweto.showCheckWarnMessage($(o),message);
				aweto.warn(o);
			}
			return false;
		} else {
			return true;
		}
	}else{
		if ( o.length > max || o.length < min ) {
			return false;
		} else {
			return true;
		}
	}
};

aweto.check.checkMaxLength= function(o, max, message ) {
//	alert(JSON.encode(o))
	if(typeof o=='object'){
		if ( o.val().length > max) {
			if(message){
				aweto.showCheckWarnMessage($(o),message);
				aweto.warn(o);
			}
			return false;
		} else {
			return true;
		}
	}else{
		if ( o.length > max) {
			return false;
		} else {
			return true;
		}
	}
};

aweto.check.checkMinLength= function(o, min, message ) {
	if(typeof o=='object'){
		if (o.val().length < min) {
			if(message){
				aweto.showCheckWarnMessage($(o),message);
				aweto.warn(o);
			}
			return false;
		} else {
			return true;
		}
	}else{
		if (o.length < min) {
			return false;
		} else {
			return true;
		}
	}
};

aweto.check.checkNull=function(o,message){
	if ( o.val()=="" || o.val()==undefined) {
		if(message){
			aweto.showCheckWarnMessage($(o),message);
			aweto.warn(o);
		}
		return false;
	} else {
		return true;
	}
};

aweto.check.checkRegexp= function(o,regexp,message){
	var v=o.val();
	var reg=regexp;
	var temp = (reg.test(v))?true:false;
	if (!temp) {
		if(message){
			aweto.showCheckWarnMessage($(o),message);
			aweto.warn(o);
		}
		return false;
	} else {
		return true;
	}
};



/** ************************************simpleTree************************************ */
aweto.simpleTree=function (){return this;};
// 取得所有勾选的节点id
aweto.simpleTree.getChecked=function(treeId){
	treeObj=$("#"+treeId);
	var tmp=treeObj.find("input:checked");
	if(tmp.length===0){
		return null;
	}else{
		var nodeid = [];
		tmp.each(function(){
			nodeid.push($(this).val());
		});
		// alert(nodeid.join(","));
		return nodeid;
	}
};

// 取得所选节点的数据
aweto.simpleTree.getSelected=function(treeId){
	treeObj=$("#"+treeId);
	var tmp=treeObj.find('span.active').parent();
	if(tmp===undefined){
		return null;
	}else{
		return tmp.data("nodeData");
	}
};

// 节点展开与收起
aweto.simpleTree.toggle=function(treeObj){
	treeObj.nodeToggle(treeObj.getSelected().get(0));
};

// 取所有以开启文件夹的id
aweto.simpleTree.getOpenedFolder=function(treeId){
	var tmp=$("li .folder-open-last",$("#"+treeId));
	var tmp1=$("li .folder-open",$("#"+treeId));
	if(tmp.length===0&&tmp1.length===0){
		return "-1";
	}else{
		var nodeid = [];
		tmp.each(function(){
			nodeid.push(this.id);
		});
		tmp1.each(function(){
			nodeid.push(this.id);
		});
		return nodeid.join(",");
	}
};


aweto.panelControl= function(obj, target) {
	if (obj.src.indexOf("portlet_collapse.gif") > 0) {
		obj.src = 'images/portlet_expand.gif';

	} else {
		obj.src = 'images/portlet_collapse.gif';
	}
	target.animate( {
		height : 'toggle',
		opacity : 'toggle'
	}, "slow");
};
/** 取web根目录* */
aweto.getWebPath=function(){
	var strFullPath=window.document.location.href; 
	var strPath=window.document.location.pathname; 
	var pos=strFullPath.indexOf(strPath); 
	var prePath=strFullPath.substring(0,pos); 
	var postPath=strPath.substring(0,strPath.substr(1).indexOf('/')+1); 
	return(prePath+postPath+"/"); 
};

aweto.afterOprator=function(result, navAfterUrl) {
	if (result != "-1" && result.state == SUCCESS) {
		var reValue = result.value;
		if (reValue != null && reValue != "" && reValue != undefined) {
			var res = reValue.split(",");
			if (res.length >= 3) {
				var pk = res[0];
				var tb = res[1];
				var opt = res[2];
				var accountId = null;
				try {
					accountId = res[3];
				} catch (E) {
				}
				var result = aweto.ajax(navAfterUrl, {
					pk :pk,
					table :tb,
					opt :opt,
					accountId :accountId
				}, false);
				if (result.state == WARN || result.state == ERROR) {
				} else if (result.state == SUCCESS) {
					var u = basePath + "system/Aapp/pushToAppInfo.action";
					aweto.afterOprator(result,u);
				}
			}
		}
	}
};
//用户存储附件上传后返回的参数
var fileupload_data=undefined;
// 文件上传对象
aweto.fileupload=function(){};
aweto.fileupload.show=function(opt){
	var tmp={
			maxSize:1024*1024*200,//200M
			//pathType:'absolute',
			savePath:'uploadfiles/images',
			limitTypes:["xls"],
			namePrefix:'',
			messages:[],
			namePrefix:''
	};
	tmp=$.extend(tmp,opt);
	fileupload_data=undefined;
	var dialogURL=basePath+"aweto/pages/base/uploadFile.jsp?maxSize="+tmp.maxSize+"&savePath="+tmp.savePath+"&limitTypes="+tmp.limitTypes.join(",")+"&namePrefix="+tmp.namePrefix+"&messages="+tmp.messages.join(",");
	layer.open({
		  content: dialogURL,
		  title:"文件上传",
		  id:"fileupload_layer",
		  shade:false,
		  moveOut:true,//是否允许拖拽到窗口外
		  type:2,//1:dom元素，2:iframe
		  area: ["808px", "210px"],
		  maxmin:true,
		  //btn: ['确定', '返回'],
		  success: function(layero, index){
			
		  },
		  yes: function(index, layero){
			
		  },
		  btn2: function(index, layero){
			layer.close(index);
		  },
		  cancel: function(){ 
		    //右上角关闭回调
		    //return false 开启该代码可禁止点击该按钮关闭
		  },
		  end:function(){
			  if(fileupload_data){
				  if(typeof tmp.success=='function'){
					  tmp.success(fileupload_data);
				  }
			  }
		  }
		});
}

aweto.downloadFile=function(opt){
	var tmp={
		localType:'local',
		localAddress:'',
		username:'',
		password:'',
		filePath:'uploadfiles/files',
		saveName:'',
		fileName:'',
		fileType:'',
		pathType:'relative',
		encode:'UTF-8'
	}
	tmp=$.extend(tmp,opt);
	aweto.openWindowWithPost(basePath+"fileDownloadServlet?filepath="+tmp.filePath+"&saveName="+tmp.saveName+"&filename="+tmp.fileName+"&fileType="+tmp.fileType+"&pathType="+tmp.pathType+"&localType="+tmp.localType+"&localAddress="+tmp.localAddress+"&username="+tmp.username+"&password="+tmp.password+"&encode="+tmp.encode,'newwindow','','');  
}

aweto.openWindowWithPost=function(url,name,keys,values)   
{   
	var oForm = document.createElement("form");   
	oForm.id="testid";   
	oForm.method="post";   
	oForm.action=url;   
	oForm.target="_self";   
	if (keys && values && (keys.length == values.length))   
	{   
		for (var i=0; i < keys.length; i++)   
		{   
			var oInput = document.createElement("input");   
			oInput.type="text";   
			oInput.name=keys[i];   
			oInput.value=values[i];   
			oForm.appendChild(oInput);   
		}   
	}  
	document.body.appendChild(oForm);   
	oForm.submit();    
} 

aweto.attachment=function(){};
//通过文件主键获取文件信息
aweto.attachment.getFileList=function(fileId,callback){
	aweto.ajax(basePath+'attach/attachInfo/attachList.ajax',{fileId:fileId},true,function(data){
		if(typeof callback =='function'){
			callback(data);
		}
	});
}
aweto.attachment.toConfigAttachment=function(){
	if(aweto.getCurrentUserId()!='admin'){
		layer.msg("您没有权限，请联系管理员！", {icon: 5});//不开心
		return;
	}
	aweto.toProgram('aweto/pages/app/attach/attachConfig.jsp',{pkValue:-1},{dock:{id:'attachConfig_-1',title:'附件配置'}});
}
/**
 * 支持多附件上传
 */
aweto.attachment.showUploader=function(opt){
	var tmp={
			attachId:undefined,
			pkValue:pkValue
	};
	tmp=$.extend(tmp,opt);
	if(tmp.attachId==undefined){//没有设置attachId(附件配置信息)
		if(entityName){
			tmp.attachId=entityName;
		}
	}
	var dialogURL=basePath+"aweto/pages/base/uploadFiles.jsp?pkValue="+tmp.pkValue+"&attachId="+tmp.attachId;
	if(tmp.pkValue==undefined){//没有配置主键
		dialogURL=basePath+"aweto/pages/base/uploadFiles.jsp?attachId="+tmp.attachId;
	}
	fileupload_data=undefined;
	layer.open({
		  content: dialogURL,
		  title:"附件上传",
		  shade:false,
		  moveOut:true,//是否允许拖拽到窗口外
		  type:2,//1:dom元素，2:iframe
		  area: ["838px", "485px"],
		  maxmin:true,
		  //btn: ['确定', '返回'],
		  success: function(layero, index){
			
		  },
		  yes: function(index, layero){
			
		  },
		  btn2: function(index, layero){
			layer.close(index);
		  },
		  cancel: function(){ 
		    //右上角关闭回调
		    //return false 开启该代码可禁止点击该按钮关闭
		  },
		  end:function(){
			  if(fileupload_data){
				  if(typeof tmp.success=='function'){
					  tmp.success(fileupload_data);
				  }
			  }
		  }
		});
};
/**
 * 附件查看弹出框
 */
aweto.attachment.showAttachmentPanel=function(opt){
	if(attachmentPermission.view){
		var tmp={
				attachId:undefined,
				pkValue:pkValue,
				modify:attachmentPermission.modify
		};
		if(tmp.pkValue=="-1"||tmp.pkValue==""||tmp.pkValue==undefined){
			aweto.Dialog.show("提示","请先保存主记录！");
			return;
		}
		tmp=$.extend(tmp,opt);
		var dialogURL=basePath+"aweto/pages/base/attachPanel.jsp?pkValue="+tmp.pkValue+"&attachId="+tmp.attachId+"&modify="+tmp.modify;
		var container=$("<div style='width:750px'><iframe width='750px;' height='280px' frameborder='0'/></div>");
		container.dialog({
			bgiframe: false,
			resizable: false,
			draggable: true,
			height:350,
			width:750,
			modal: true,
			title: "附件查看",
			open: function() {
				$("iframe",container).attr("src",dialogURL);
			},
			close: function() {
				$(container).html('');
			},
			buttons: {
				'完成': function() {
				if(typeof opt.callback=='function'){
					opt.callback()
				}
				if(typeof onAttachPanelClose=='function'){
					onAttachPanelClose();
				}
				$(this).dialog('close');
			},
			'取消': function() {
				$(this).dialog('close');
			}
		}
		});
	}else{
		alert("对不起，您没有附件查看权限！");
	}
};
/**
 * 附件查看列表
 */
aweto.attachment.showAttachmentList=function(opt){
	$("#attachList").remove();
	var leftPos=0;
	var topPos=0;
	if(opt.target){
		leftPos=opt.target.offsetLeft;
		topPos=opt.target.offsetTop+25;
	}
	if(opt.event){
		leftPos=opt.event.clientX;
		topPos=opt.event.clientY+10;
	}
	var data =aweto.ajax(basePath+'attach/attachInfo/attachList.ajax',{pkValue:pkValue,attachId:opt.attachId},false,function(data){});
	var tmp=new Array();
	tmp.push("<div style='left: "+leftPos+"px; top: "+topPos+"px;' class='fj_kuang' id='attachList'>");
	tmp.push("	<div class='fj_top'>");  		
	tmp.push("		<div class='msg_button_close'><div class='fj_downall'>x</div></div> ");  
	tmp.push("		<div class='fj_tit'>查看附件</div> ");
	tmp.push("	</div>	");
	tmp.push("	<div class='fj_main' id='fj_main'>");
	tmp.push("	  </div>");
	tmp.push("</div>");
	var list=$(tmp.join(" "));
	if(opt.container){
		list.appendTo($(opt.container));
	}
	var fjMain=$("#fj_main",list);
	if(data.length==0){
		fjMain.append("<div class='fj_line'><div  class='fj_name' style='width:220px;'>&nbsp;&nbsp;当前记录没有可查看附件！</div></div>");
	}
	for(var i=0;i<data.length;i++){
		var line=new Array();
		line.push("		<div class='fj_line' id='fj_"+data[i].id+"'>  ");
		line.push("			 <div class='fj_pic'><img border='0' src='"+basePath+data[i].icon+"'></div> ");
		line.push("			 <div class='fj_btn'>");
		if(opt.operators){
			if(opt.operators.download){
				line.push("				 <div  title='下载附件' class='fj_down'></div>");
			}
			if(opt.operators.edit){
				line.push("				 <div  title='修改名称' class='fj_rename'></div>");
			}
			if(opt.operators.del){
				line.push("				 <div  title='删除附件' class='fj_del'></div>  ");
			}
		}
		line.push("			 </div> ");
		line.push("			 <div class='fj_txt'> ");
		line.push("			     <div class='fj_name' title='"+data[i].label+"'>"+data[i].label+"</div>  ");  
		line.push("			     <div class='fj_time'>"+data[i].firstTime+"</div>  ");
		line.push("			 </div>");
		line.push("		 </div>");
		var lineObj=$(line.join(" "));
		var fjBtn=$(".fj_btn",lineObj).data('data',data[i]);
		$(".fj_down",fjBtn).click(function(){
			var d=$(this).parents(".fj_btn").data("data");
			aweto.attachment.download(d);
		});
		$(".fj_rename",fjBtn).click(function(){
			var d=$(this).parent().data("data");
			var p=$("#fj_"+d.id);
			$('.fj_pic',p).hide();
			$('.fj_btn',p).hide();
			$('.fj_txt',p).hide();
			var reditContainer=$("<div class='fj_edit'></div>").appendTo(p);
			var icon=$("<img border='0' style='width:20px;height:20px;vertical-align: middle;padding-right: 10px;' src='"+basePath+"aweto/ui/images/fileIcon/edit_black.png'> ").appendTo(reditContainer);
			var input=$("<input type='text' class='i-form-field' style='width:170px;vertical-align: middle;' value='"+d.label+"'/>").appendTo(reditContainer);
			var reditBtn=$("<input type='button' class='i-form-button editOkBtn' value='确定' style='width:50px;margin-left:10px;'/>").appendTo(reditContainer);
			reditBtn.data('data',d);
			input.data('data',d);
			input.keyup(function(e){
				if (e.keyCode == 13) {
					var dd=$(this).data('data');
					var text=$(this).parent().find("input[type='text']");
					var name=text.val();
					if(name==''){
						aweto.Dialog.show("提示","文件名不可为空！");
						return;
					}
					aweto.attachment.rename(d.id,name,function(r){
						if(r.state==SUCCESS){
							var fp=$("#fj_"+d.id);
							$(".fj_edit",fp).remove();
							$('.fj_pic',fp).show();
							$('.fj_btn',fp).show();
							$('.fj_txt',fp).show();
							$(".fj_name",fp).text(r.value).attr("title",r.value);
						}
					});
				} 
			});
			
			reditBtn.click(function(){
				var dd=$(this).data('data');
				var text=$(this).parent().find("input[type='text']");
				var name=text.val();
				if(name==''){
					aweto.Dialog.show("提示","文件名不可为空！");
					return;
				}
				aweto.attachment.rename(d.id,name,function(r){
					if(r.state==SUCCESS){
						var fp=$("#fj_"+d.id);
						$(".fj_edit",fp).remove();
						$('.fj_pic',fp).show();
						$('.fj_btn',fp).show();
						$('.fj_txt',fp).show();
						$(".fj_name",fp).text(r.value).attr("title",r.value);
					}
				});
			});
		});
		$(".fj_del",fjBtn).click(function(){
			var d=$(this).parent().data("data");
			aweto.attachment.deleteFile(d,function(r){
				if(r.state==SUCCESS){
					$("#fj_"+d.id).remove();
				}
			});
			
		});
		lineObj.appendTo(fjMain);
  }
	$(".msg_button_close",list).click(function(){
		$("#attachList").remove();
		if(typeof onAttachPanelClose=='function'){
			onAttachPanelClose();
		}
	});
}
/**
 * 统计附件数量
 */
aweto.attachment.countAttachment=function(pkVal,attachId,callback){
	aweto.ajax(basePath+'attach/attachInfo/attachCount.ajax',{pkValue:pkVal,attachId:attachId},true,function(r){
		if(typeof callback=='function'){
			callback(r);
		}
	});
};
/**
 * 统计附件数量
 */
aweto.attachment.rename=function(infoNo,name,callback){
	aweto.ajax(basePath+'attach/attachInfo/rename.ajax',{infoNo:infoNo,name:name},true,function(r){
		if(typeof callback=='function'){
			callback(r);
		}
	});
};
/**
 * 附件下载
 */
aweto.attachment.download=function(d){
	aweto.downloadFile({
			localType:d.localType,
			localAddress:d.address,
			pathType:'absolute',
			filePath:d.filePath,
			saveName:d.saveName,
			fileName:d.fileName,
			username:d.username,
			password:d.password,
			encode:"UTF-8"
	});
};
/**
 * 删除附件
 */
aweto.attachment.deleteFile=function(d,callback){
	aweto.ajax(basePath+'attach/attachInfo/delete.ajax',{pkValue:d.id},true,function(r){
		if(typeof callback=='function'){
			callback(r);
		}
	});
	
};


/**
 * 批量照片上传
 */
aweto.attachment.showBatchImagesUploader=function(opt){
	var tmp={
			entityName:undefined,//实体名
			flagField:'',//标识字段名
			imageField:'',//照片字段名
			handlerClass:'',
			pkValue:pkValue,
			title:'批量照片上传'
	};
	tmp=$.extend(tmp,opt);
	var dialogURL=basePath+"aweto/pages/base/batchImagesUpload.jsp?pkValue="+tmp.pkValue+"&entityName="+tmp.entityName+"&flagField="+tmp.flagField+"&imageField="+tmp.imageField+"&handlerClass="+tmp.handlerClass;
	var container=$("<div style='width:750px'><iframe width='750px;' height='280px' frameborder='0'/></div>");
	container.dialog({
		bgiframe: false,
		resizable: false,
		draggable: true,
		height:350,
		width:750,
		modal: true,
		title:tmp.title,
		open: function() {
			$("iframe",container).attr("src",dialogURL);
		},
		close: function() {
			$(container).html('');
		},
		buttons: {
			'完成': function() {
			if(typeof opt.callback=='function'){
				opt.callback()
			}
			$(this).dialog('close');
		},
		'取消': function() {
			$(this).dialog('close');
		}
	}
	});
};

aweto.generator=function(){};
aweto.generator.setPostNameByNo=function(postNo,descObj,callback){
	if(postNo=="")return;
	aweto.ajax(basePath+'hr/post/findPostNameByNo.ajax',{postNo:postNo},true,function(r){
		if(r){
			if(descObj){
				$(descObj).val(r);
			}
		}
		if(typeof callback=='function'){
			callback(r);
		}
	});
}

aweto.generator.setEmpNameById=function(empId,descObj,callback){
	if(empId==""){$(descObj).val("");return;}
	aweto.ajax(basePath+'hr/employee/findInfoById.ajax',{empId:empId},true,function(r){
		if(r){
			if(r.empName){
				if(descObj){
					$(descObj).val(r.empName);
				}
			}else{
				aweto.Dialog.show("提示","您输入的工号不存在，请重新输入！");
				if(descObj){
					$(descObj).val("");
				}
			}
		}
		if(typeof callback=='function'){
			callback(r);
		}
	});
}

// 薪资发放专用
aweto.generator.setEmpNameByIdForPayoff=function(val,empId,descObj,idObj,callback){
	if(empId=="")return;
	aweto.ajax(basePath+'hr/employee/findInfoByIdForPayoff.ajax',{val:val,empId:empId},true,function(r){
		if(r){
			if(r.empName){
				if(descObj){
					$(descObj).val(r.empName);
				}
			}else{
				aweto.Dialog.show("提示","您输入的工号不存在，请重新输入！");
				if(descObj){
					$(descObj).val("");
					$(idObj).val("");
				}
			}
		}
		if(typeof callback=='function'){
			callback(r);
		}
	});
}

aweto.generator.fieldOnBlur=function(idValue,noObj,idObj,descObj,queryNoField,queryIdfield,queryNamField,tableNam,callback){
	if(idValue==""){
		if(descObj){
		$(descObj).val("");
	    }
		if(noObj){
			$(noObj).val("");
		}
		return;
	}
	aweto.ajax(basePath+'hr/commonUtil/findInfoById.ajax',{id:idValue,queryNoField:queryNoField,queryIdfield:queryIdfield,queryNamField:queryNamField,tableNam:tableNam},true,function(r){
		if(r){
			if(r.no){
				if(noObj){
					$(noObj).val(r.no);
				}
				if(descObj){
					$(descObj).val(r.desc);
				}
			}else{
				aweto.Dialog.show("提示","您输入的编号不存在，请重新输入！");
				if(descObj){
					$(descObj).val("");
				}
				if(noObj){
					$(noObj).val("");
				}
				if(idObj){
					$(idObj).val("");
				}
			}
		}
		if(typeof callback=='function'){
			callback(r);
		}
	});
}

//绩效考核项目分类选择器(HR系统专用)
aweto.selector.showPerformItemTypeSelector=function(opt){
	var tmpOpt={
			treeUrl:basePath+'perform/hrPerformItemType/performItemTypeTree.ajax',// 树数据加载
			selectUrl:basePath+'perform/hrPerformItemType/performTypeSelectorData.ajax',// 待选数据加载url
			searchUrl:basePath+'perform/hrPerformItemType/performTypeSelectorSearch.ajax',// 检索响应url
			title:'考核项目分类选择',
			single:true,// 是否为单选
			treeEvent:{folder:true,doc:true},
			returnType:{id:true,desc:false}
		};
	tmpOpt=$.extend(tmpOpt,opt);
	aweto.selector.showTreeSelector(tmpOpt);
};

//系统部门选择器(HR系统专用)
aweto.selector.showWelfareDepartSelector=function(opt){
	var tmpOpt={
			treeUrl:basePath+'hr/depart/departSelectorTree.ajax',// 树数据加载
			selectUrl:basePath+'hr/depart/departWelfareSelectorData.ajax',// 待选数据加载url
			searchUrl:basePath+'hr/depart/departWelfareSelectorSearch.ajax',// 检索响应url
			title:'部门选择',
			single:true,// 是否为单选
			params:{permission:true},
			treeEvent:{folder:true,doc:true},
			returnType:{id:true,desc:false}
		};
	tmpOpt=$.extend(tmpOpt,opt);
	if(opt.params){
		if(opt.params.permission==false){
			tmpOpt.params.permission=false;
		}else{
			tmpOpt.params.permission=true;
		}
	}
	tmpOpt.treeUrl=tmpOpt.treeUrl+"?permission="+tmpOpt.params.permission;
	aweto.selector.showTreeSelector(tmpOpt);
};

//系统岗位选择器(HR系统专用)
aweto.selector.showWelfarePostSelector=function(opt){
	var tmpOpt={
			treeUrl:basePath+'hr/depart/departSelectorTree.ajax',// 树数据加载
			selectUrl:basePath+'hr/post/postWelfareSelectorData.ajax',// 待选数据加载url
			searchUrl:basePath+'hr/post/postWelfareSelectorSearch.ajax',// 检索响应url
			title:'岗位选择',
			single:false,// 是否为单选
			params:{permission:true},
			treeEvent:{folder:true,doc:true},
			returnType:{id:true,desc:false}
		};
	tmpOpt=$.extend(tmpOpt,opt);
	if(opt.params){
		if(opt.params.permission==false){
			tmpOpt.params.permission=false;
		}else{
			tmpOpt.params.permission=true;
		}
	}
	tmpOpt.treeUrl=tmpOpt.treeUrl+"?permission="+tmpOpt.params.permission;
	aweto.selector.showTreeSelector(tmpOpt);
};

//绩效考核项目选择器
aweto.selector.showPerformItemSelector=function(opt){
		var tmpOpt={
				treeUrl:basePath+'perform/hrPerformItemType/performItemTypeTree.ajax',//树数据加载
				selectUrl:basePath+'perform/hrPerformItem/performItemSelectorData.ajax',//待选数据加载url
				searchUrl:basePath+'perform/hrPerformItem/performItemSelectorSearch.ajax',//检索响应url
				title:'考核项目选择',
				single:false,//是否为单选
				treeEvent:{folder:true,doc:true},
				returnType:{id:true,desc:false}
			};
		tmpOpt=$.extend(tmpOpt,opt);
		aweto.selector.showTreeSelector(tmpOpt);
	};
	
	function setFieldDisable(fieldName){
		var fieldObj=$("input[name='"+fieldName+"'],textarea[name='"+fieldName+"'],select[name='"+fieldName+"']",detailForm);
	        var viewbtn=fieldObj.attr("viewbtn");
			if(viewbtn){
				var viewbtnObj=$("#"+viewbtn,detailForm);
				if(viewbtnObj){
					aweto.disable.fields([viewbtnObj],true);
				}
			}
		aweto.disable.fields([fieldObj],true);
	}
	
	function setFieldEnable(fieldName){
		var fieldObj=$("input[name='"+fieldName+"'],textarea[name='"+fieldName+"'],select[name='"+fieldName+"']",detailForm);
	        var viewbtn=fieldObj.attr("viewbtn");
			if(viewbtn){
				var viewbtnObj=$("#"+viewbtn,detailForm);
				if(viewbtnObj){
					aweto.enable.fields([viewbtnObj],true);
				}
			}
		aweto.enable.fields([fieldObj],true);
	}
	
	function toUpperCaseById(obj){
		var value = $(obj).val();
		value= value.toUpperCase();
		$(obj).val(value);
	}
	//只能输入数字
	function onlyNumeric(event,obj){
		if(!obj){
			return true;
		}
		var value = $(obj).val();
		var len = value.length ;
		var msgInfo = "请检查小键盘是否打开!";
		if(event.keyCode >=33 && event.keyCode <=40){
			aweto.Message.show('消息', msgInfo);
		}
		switch(event.keyCode){
				case 45 :
					aweto.Message.show('消息', msgInfo);
					return false;
				case 12: 
					aweto.Message.show('消息', msgInfo);
					return false;
				case 8: 
//					aweto.Message.show('消息', msgInfo);
					return true;
				case 46: 
//					aweto.Message.show('消息', msgInfo);
					return true;
				case 144: 
					aweto.Message.show('消息', msgInfo);
					return true;
		}
			if(event.keyCode >=48 &&  event.keyCode <= 57){
				return true;
			}else if(event.keyCode >=96 &&  event.keyCode <= 105){
				return true;
			}else{
				aweto.Message.show('消息', "只能输入数字!");
				if(len > 1){
					value = value.substring(0,len-1);
					$(obj).val(value);
				}else{
					$(obj).val("");
				}
				return false;
			}
	}
	//初始化下拉框
	function initSelectorForOneSelect(obj,selected,val){
		if (val.options) {
			$(obj).empty();
			for ( var i = 0; i < val.options.length; i = i + 1) {
				if (val.options[i].value == selected || val.options[i].key == selected) {
					$(obj).append(
							"<option value='" + val.options[i].key
									+ "' selected>" + val.options[i].value
									+ "</option>");
				} else {
					$(obj).append(
							"<option value='" + val.options[i].key + "'>"
									+ val.options[i].value + "</option>");
				}
			}
		}
	}
	
	aweto.generator.empIdOnBlur=function(obj,idName,descName,formName){
		if($(obj).hasClass("i-form-field-disabled")){
			return;
		}
		var id = obj.value.trim();
		if(id==""){
			$('#'+idName,$('#'+formName)).val("");
			$("#"+descName,$('#'+formName)).val("");
			 return;
		}
		aweto.ajax(basePath+'/helpself/common/checkInfoById.ajax',{pkValue:id},true,function(result){
			if(result.state==SUCCESS){
				$('#'+idName,$('#'+formName)).val(id);
				var name = result.param.empName;
				$("#"+descName,$('#'+formName)).val(name);
			 }else{
				 aweto.Dialog.show("错误",result.msgInfo,'error');
				 $('#'+idName,$('#'+formName)).val("");
				 $("#"+descName,$('#'+formName)).val("");
				 return;
			 }
		});
	};
	
	
aweto.getBirthdayFromIdCard=function(idCard){
	var str="";
    var y;
    if (idCard.length == 15) {
        var y = idCard.substring(6, 8);
        if (y >= "40"){
            y = "19" + y;
        }else{
            y = "20" + y;
        }
        str = y + "-" + idCard.substring(8, 10) + "-" + idCard.substring(10, 12);
    } else if (idCard.length == 18){
        str = idCard.substring(6, 10) + "-" + idCard.substring(10, 12) + "-" + idCard.substring(12, 14);
    }else{
    	return "";
    }
    if (aweto.check.isDate(str)){
        return str;
    }else{
    	return "";
    }
}

aweto.showModuleHelp=function(){
	if(moduleId==""){
		return;
	}
	aweto.toProgram('WEB-INF/pages/app/system/module/moduleHelpView.jsp',{moduleId:moduleId},{dock:{id:'modHelpView-'+moduleId,title:'模块帮助文档'}});
}

aweto.grid=function(){}
aweto.grid.bookmark=function(obj){
	var m=$(obj).attr("bookmark");
	var bookmarkId=$(obj).attr("bookmarkId");
	var rowId=$(obj).attr("rowId");
	if(m=='true'){
		$(obj).attr("src",basePath+'aweto/ui/css/images/jqgrid/bookmark_n.gif');
		$(obj).attr("bookmark",'false');
		aweto.ajax(basePath+'system/userBookmark/removeBookmark.ajax',{bookmarkId:bookmarkId,pkVal:rowId},true,function(r){
				
		});
	}else{
		$(obj).attr("src",basePath+'aweto/ui/css/images/jqgrid/bookmark_m.gif');
		$(obj).attr("bookmark",'true');
		aweto.ajax(basePath+'system/userBookmark/addBookmark.ajax',{bookmarkId:bookmarkId,pkVal:rowId},true,function(r){
			
		});
	}
	
}

//工作流启动后权限控制
aweto.toggleBtn=function(idContainer,state,workflowId){
	var state = parent.$('#'+state).val();
	if('00' != state && workflowId){
		$('#'+idContainer).find('button').each(function(){
			var id = $(this).attr('id');
			if(id == 'add' || id == 'save' || id == 'remove'){
				$(this).parent().parent().parent().hide();
			}
		})
	}
}

//主表操作按钮锁定
aweto.lock = function(idContainer,btnSta){
	if('load' == btnSta || 'new' == btnSta){
		$('#'+idContainer).find('button').each(function(){
			var id = $(this).attr('id');
			if(id == 'add' || id == 'save' || id == 'remove' || id == 'del' || id == 'create'){
				$(this).parent().removeClass().addClass('aweto-bbar-item-disabled');
				$(this).parent().removeClass().attr('disabled','disabled');
				$(this).attr('disabled','disabled');
				$(this).parent().find('b').css('color','graytext');
			}
		})
	}
}

//主表操作按钮解锁
aweto.unLock = function(iframe,idContainer,btnSta){
	if('edit' == btnSta){
		var obj = document.getElementById(iframe).contentWindow;
		var ifmObj=obj.document.getElementById(idContainer);  
		$(ifmObj).find('button').each(function(){
			var id = $(this).attr('id');
			debugger
			if(id == 'add' || id == 'save' || id == 'remove' || id == 'del' || id == 'create'){
				$(this).parent().removeClass().addClass('aweto-bbar-item-enabled');
				$(this).parent().removeClass().attr('disabled',false);
				$(this).attr('disabled',false);
				$(this).parent().find('b').css('color','black');
			}
		})
	}
}