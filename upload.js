var Client = require('ftp');
var fs = require('fs');
var md5File = require('md5-file')

try{
	var config = JSON.parse(fs.readFileSync('./data/config/password.json', 'utf8'));
}catch(e){
	console.error('please check your password.json in ./data/config/');
	throw e;
}

var nullImage = md5File('./data/config/null.jpg');

var MP3List = [];
var MP3LQList = [];
var LyricList = [];
var BGList = [];
var BKList = [];

//search mp3
var files = fs.readdirSync('./data/mp3');
for(var i=0;i<files.length;i++) {  
	var item = files[i];
	var tmpPath = './data/mp3' + '/' + item,
		stats = fs.statSync(tmpPath);

	if (!stats.isDirectory()) {  
		var name = item.split('.',2);
		if(name[1]=='mp3'){
			MP3List.push(name[0]+'.mp3');
		}
	} 
};
console.log('found '+MP3List.length+' mp3');


//search mp3 lq
var files = fs.readdirSync('./data/mp3-lq');
for(var i=0;i<files.length;i++) {  
	var item = files[i];
	var tmpPath = './data/mp3-lq' + '/' + item,
		stats = fs.statSync(tmpPath);

	if (!stats.isDirectory()) {  
		var name = item.split('.',2);
		if(name[1]=='mp3'){
			MP3LQList.push(name[0]+'.mp3');
		}
	} 
};
console.log('found '+MP3LQList.length+' lq mp3');

//search bg jpg
var files = fs.readdirSync('./data/bg');
for(var i=0;i<files.length;i++) {  
	var item = files[i];
	var tmpPath = './data/bg' + '/' + item,
		stats = fs.statSync(tmpPath);

	if (!stats.isDirectory()) {  
		var name = item.split('.',2);
		if(name[1]=='jpg'&&md5File(tmpPath)!=nullImage){
			BGList.push(name[0]+'.jpg');
		}
	} 
};
console.log('found '+BGList.length+' bg ');

//search bk jpg
var files = fs.readdirSync('./data/bk');
for(var i=0;i<files.length;i++) {  
	var item = files[i];
	var tmpPath = './data/bk' + '/' + item,
		stats = fs.statSync(tmpPath);

	if (!stats.isDirectory()) {  
		var name = item.split('.',2);
		if(name[1]=='jpg'&&md5File(tmpPath)!=nullImage){
			BKList.push(name[0]+'.jpg');
		}
	} 
};
console.log('found '+BKList.length+' bk ');

//search lyric
var files = fs.readdirSync('./data/lyric');
for(var i=0;i<files.length;i++) {  
	var item = files[i];
	var tmpPath = './data/lyric' + '/' + item,
		stats = fs.statSync(tmpPath);

	if (!stats.isDirectory()) {  
		var name = item.split('.',2);
		if(name[1]=='txt'){
			LyricList.push(name[0]+'.txt');
		}
	} 
};
console.log('found '+LyricList.length+' lyric ');

// mp3 上传部分
var cm = new Client();
cm.on('ready', function() {
	
	var uploadCount = 0;
	
	function endCM(){
		if((MP3List.length==0)&&(MP3LQList.length==0)&&uploadCount<=0){
			cm.end();
			console.log('close connection to hmoe-media');
		}
	}
	
	cm.list('/hmmusic/mp3-high', function(err,list) {
		if (err) throw err;
		for(;MP3List.length>0;){
			var o = MP3List.pop();
			var found = false;
			for(var i = 0;i<list.length;i++){
				if(list[i].name==o){
					found = true;
					break;
				}
			}
			
			if(found){
				//console.log('ignore file /hmmusic/mp3-high/'+o);
			}else{
				uploadCount++;
				console.log('upload '+o+' to  /hmmusic/mp3-high/');
				cm.put('./data/mp3/'+o,'/hmmusic/mp3-high/'+o,function(err){
					uploadCount--;
					if(err){
						console.log('Error: unable to upload mp3 : '+err)
					}else{
						console.log('upload mp3 succeed');
					}
					endCM();
				});
			}
		}
		endCM();
	});
	
	cm.list('/hmmusic/mp3-vbr-128', function(err,list) {
		if (err) throw err;
		for(;MP3LQList.length>0;){
			var o = MP3LQList.pop();
			var found = false;
			for(var i = 0;i<list.length;i++){
				if(list[i].name==o){
					found = true;
					break;
				}
			}
			
			if(found){
				//console.log('ignore file /hmmusic/mp3-vbr-128/'+o);
			}else{
				uploadCount++;
				console.log('upload '+o+' to  /hmmusic/mp3-vbr-128/');
				cm.put('./data/mp3-lq/'+o,'/hmmusic/mp3-vbr-128/'+o,function(err){
					uploadCount--;
					if(err){
						console.log('Error: unable to upload mp3-lq : '+err)
					}else{
						console.log('upload mp3-lq succeed');
					}
					
					endCM();
				});
			}
		}
		endCM();
	});
});
cm.connect(config.media_ftp);

//图像上传部分
var ci = new Client();
ci.on('ready', function() {
	
	var uploadCount = 0;
	
	function endCI(){
		if((BGList.length==0)&&(BKList.length==0)&&uploadCount<=0){
			ci.end();
			console.log('close connection to hmoe-image');
		}
	}
	
	ci.list('/bg', function(err,list) {
		if (err) throw err;
		for(;BGList.length>0;){
			var o = BGList.pop();
			var found = false;
			for(var i = 0;i<list.length;i++){
				if(list[i].name==o){
					found = true;
					break;
				}
			}
			
			if(found){
				// console.log('ignore file /bg/'+o);
			}else{
				uploadCount++;
				console.log('upload '+o+' to  /bg/');
				ci.put('./data/bg/'+o,'/bg/'+o,function(err){
					uploadCount--;
					if(err){
						console.log('Error: unable to upload bg : '+err)
					}else{
						console.log('upload bg succeed');
					}
					endCI();
				});
			}
		}
		endCI();
	});
	
	ci.list('/bk', function(err,list) {
		if (err) throw err;
		for(;BKList.length>0;){
			var o = BKList.pop();
			var found = false;
			for(var i = 0;i<list.length;i++){
				if(list[i].name==o){
					found = true;
					break;
				}
			}
			
			if(found){
				// console.log('ignore file /bk/'+o);
			}else{
				uploadCount++;
				console.log('upload '+o+' to  /bk/');
				ci.put('./data/bk/'+o,'/bk/'+o,function(err){
					uploadCount--;
					if(err){
						console.log('Error: unable to upload bk : '+err)
					}else{
						console.log('upload bk succeed');
					}
					
					endCI();
				});
			}
		}
		endCI();
	});
});
ci.connect(config.image_ftp);

//主服务器上传
var ch = new Client();
ch.on('ready', function() {
	var uploadCount = 0;
	
	function endCH(){
		if((LyricList.length==0)&&uploadCount<=0){
			ch.end();
			console.log('close connection to hmoe-home');
		}
	}
	
	ch.get('/music2.hmacg.cn/list.xml',function(err,stream){
		if(err){
			console.log(err);
		}else{
			stream.once('close', function() { 
				console.log('old xml is saved.')
				if (fs.existsSync('./gen/list.xml')){
					uploadCount++;
					ch.put('./gen/list.xml','/music2.hmacg.cn/list.xml',function(err){
						if(err){
							console.log(err);
						}else{
							console.log('list.xml upload succeed!');
						}
						endCH(); 
					});
				}
				endCH(); 
			});
      		stream.pipe(fs.createWriteStream('./gen/list_'+new Date().getTime()+'.bak'));
		}
	});


	ch.list('/music2.hmacg.cn/lrc', function(err,list) {
		if (err) throw err;
		for(;LyricList.length>0;){
			var o = LyricList.pop();
			var found = false;
			for(var i = 0;i<list.length;i++){
				if(list[i].name==o){
					found = true;
					break;
				}
			}
			
			if(found){
				// console.log('ignore file /music2.hmacg.cn/lrc/'+o);
			}else{
				uploadCount++;
				console.log('upload '+o+' to  /music2.hmacg.cn/lrc/');
				ch.put('./data/lyric/'+o,'/music2.hmacg.cn/lrc/'+o,function(err){
					uploadCount--;
					if(err){
						console.log('Error: unable to upload lyric : '+err)
					}else{
						console.log('upload lyric succeed');
					}
					
					endCH();
				});
			}
		}
		endCH();
	});
});
ch.connect(config.home_ftp);