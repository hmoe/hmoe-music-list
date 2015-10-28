var fs = require('fs');
var https = require('https');
var parseString = require('xml2js').parseString;
var Download = require('download');
var async      = require('async');

module.load('./get-ffmpeg.js');

var listDoc;
var tasklist = new Array();

var getXmlString = function(){
	var xmlString = '';
	https.get('https://music2.hmacg.cn/list.xml',function(res){
		res.on('data', function(d) {
			xmlString += d;
		});
		res.on('end', function(){
			parseString(xmlString, function (err, result) {
				if(err){
					console.log(err);
					process.exit(-1);
				}else{
					listDoc = result;
					downloadFiles();
				}
			});
		});
	})
	.on('error', function(err) {
		console.log(error);
	}).end();
}

var downloadFiles = function(){
	for(var i=0;i<listDoc.list.m.length;i++){
		var obj = listDoc.list.m[i].$;
		var jsonObj = new Object;
		jsonObj.type = obj.type;
		jsonObj.label = obj.label;
		jsonObj.dl_link = obj.dl_link;
		fs.writeFile('./data/json/'+obj.music_id+'.json',JSON.stringify(jsonObj));
		tasklist.push(obj.music_id);
	}
	
	async.mapLimit(tasklist,1,function(id,callback){
		if (fs.existsSync('./data/mp3/'+id+'.mp3')) {
			return callback();
		}
		console.log(' music '+ id +'.mp3');
		new Download({mode: '755'})
			.get('http://media1.hmacg.cn/hmmusic/mp3-high/'+id+'.mp3')
			.dest('./data/mp3')
			.run(function(err,f){
				console.log('Downloaded '+ id +'.mp3');
				if(err){
					console.error(err);
				}
				setTimeout(function(){
					return callback();
				},1000)
			});
	});
	
	async.mapLimit(tasklist,1,function(id,callback){
		if (fs.existsSync('./data/bg/'+id+'.jpg')) {
			return callback();
		}
		console.log(' bg '+ id +'.jpg');
		new Download({mode: '755'})
			.get('http://music-img.hmacg.cn/bg/'+id+'.jpg')
			.dest('./data/bg')
			.run(function(err,f){
				console.log('Downloaded bg '+ id +'.jpg');
				if(err){
					console.error(err);
				}
				setTimeout(function(){
					return callback();
				},1000)
			});
	});
	
	async.mapLimit(tasklist,1,function(id,callback){
		if (fs.existsSync('./data/bk/'+id+'.jpg')) {
			return callback();
		}
		console.log(' bk '+ id +'.jpg');
		new Download({mode: '755'})
			.get('https://music2.hmacg.cn/bk91/'+id+'.jpg')
			.dest('./data/bk')
			.run(function(err,f){
				console.log('Downloaded bk '+ id +'.jpg');
				if(err){
					console.error(err);
				}
				setTimeout(function(){
					return callback();
				},1000)
			});
	});	
	
	async.mapLimit(tasklist,5,function(id,callback){
		if (fs.existsSync('./data/lyric/'+id+'.txt')) {
			return callback();
		}
		console.log(' lyric '+ id +'.txt');
		new Download({mode: '755'})
			.get('https://music2.hmacg.cn/lrc/'+id+'.txt')
			.dest('./data/lyric')
			.run(function(err,f){
				console.log('Downloaded bk '+ id +'.txt');
				if(err){
					console.error(err);
				}
				return callback();
			});
	});	
}

getXmlString();
