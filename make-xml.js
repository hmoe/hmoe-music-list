var fs = require('fs');
var async = require('async');
var builder = require('xmlbuilder');
var mp3Duration = require('mp3-duration');
var md5File = require('md5-file')

var workList = [];

var missBGList = [];
var missBKList = [];
var missLyricList = [];
var missMp3HQList = [];
var missMp3LQList = [];

var nullImage = md5File('./data/config/null.jpg');

var buildXML = function(){
	var xml = builder.create('list',
		{version: '1.0', encoding: 'UTF-8', standalone: true},
		{pubID: null, sysID: null},
		{allowSurrogateChars: false, skipNullAttributes: false, 
		headless: true, ignoreDecorators: false, stringify: {}})
	
	for(var i=workList.length-1;i>=0;i--){
		if(typeof(workList[i])=="undefined"){
			console.log('Error: id '+i+' is not found')
			continue;
		}
		var o = {
			'type':workList[i].type,
			'music_id':workList[i].music_id,
			'duration':workList[i].duration,
			'label':workList[i].label,
			'lrc':'lrc/'+workList[i].music_id+'.txt',
			'bg_video':'bk91/'+workList[i].music_id+'.jpg',
			'bg':'bg.php?id='+workList[i].music_id+'',
			'dl_link':workList[i].dl_link
		};
		xml.ele('m',o);
		
		//test item
		if(!fs.existsSync('./data/bg/'+workList[i].music_id+'.jpg')){
			missBGList.push(workList[i]);
		}else{
			if(md5File('./data/bg/'+workList[i].music_id+'.jpg')==nullImage){
				missBGList.push(workList[i]);
			}
		}
		
		if(!fs.existsSync('./data/bk/'+workList[i].music_id+'.jpg')){
			missBKList.push(workList[i]);
		}
		
		if(!fs.existsSync('./data/lyric/'+workList[i].music_id+'.txt')){
			missLyricList.push(workList[i]);
		}
		
		if(!fs.existsSync('./data/mp3/'+workList[i].music_id+'.mp3')){
			missMp3HQList.push(workList[i]);
		}
		
		if(!fs.existsSync('./data/mp3-lq/'+workList[i].music_id+'.mp3')){
			missMp3LQList.push(workList[i]);
		}
    }
	
	var xmlString = xml.end({ pretty: true, indent: '  ', newline: '\r\n' });
	//console.log(xmlString);
	fs.writeFile('./gen/list.xml',xmlString,function(err){
		if(err){
			console.log('error in writing list.xml');
		}else{
			console.log('xml created succeed!')
		}
	});
	
	fs.writeFile('./gen/miss-bg.json',JSON.stringify(missBGList, null, 4),function(err){
		if(err){
			console.log('error in writing miss-bg.json');
		}else{
			console.log('miss-bg.json created succeed!')
		}
	});
	
	fs.writeFile('./gen/miss-bk.json',JSON.stringify(missBKList, null, 4),function(err){
		if(err){
			console.log('error in writing miss-bk.json');
		}else{
			console.log('miss-bk.json created succeed!')
		}
	});
	
	fs.writeFile('./gen/miss-lyric.json',JSON.stringify(missLyricList, null, 4),function(err){
		if(err){
			console.log('error in writing miss-lyric.json');
		}else{
			console.log('miss-lyric.json created succeed!')
		}
	});
	
	fs.writeFile('./gen/miss-mp3-hq.json',JSON.stringify(missMp3HQList, null, 4),function(err){
		if(err){
			console.log('error in writing miss-mp3-hq.json');
		}else{
			console.log('miss-mp3-hq.json created succeed!')
		}
	});
	
	fs.writeFile('./gen/miss-mp3-lq.json',JSON.stringify(missMp3LQList, null, 4),function(err){
		if(err){
			console.log('error in writing miss-mp3-lq.json');
		}else{
			console.log('miss-mp3-lq.json created succeed!')
		}
	});
}

var scanJSON = function(){
	var path = './data/json';
	
	var files = fs.readdirSync(path);
	for(var i=0;i<files.length;i++) {  
		var item = files[i];
		var tmpPath = path + '/' + item,
			stats = fs.statSync(tmpPath);

		if (!stats.isDirectory()) {  
			var name = item.split('.',2);
			if(name[1]=='json'){
				workList[Number(name[0])-1] = JSON.parse(fs.readFileSync(tmpPath, 'utf8'));
				workList[Number(name[0])-1].music_id = Number(name[0]);
			}
		} 
	};  
	
	// scan and update duration
	async.mapLimit(workList,20,function(obj,callback){
		var id = obj.music_id;
		if (typeof(obj.duration) == "undefined"){
			mp3Duration('./data/mp3-lq/'+id+'.mp3', function (err, duration) {
				if (err){
					workList[Number(id)-1].duration = 0;
					console.log(err.message);
					return callback();
				}
				
				console.log(id+'.mp3 duration:' + duration);
				workList[Number(id)-1].duration = Math.floor(Number(duration));
				
				//cache the duration
				var o = JSON.parse(fs.readFileSync('./data/json/'+id+'.json', 'utf8'));
				o.duration = Math.floor(Number(duration));
				fs.writeFileSync('./data/json/'+id+'.json',JSON.stringify(o));
				
				return callback();
			});
		}else{
			return callback();
		}
		
	},function(){
		buildXML();
	});
}

scanJSON();