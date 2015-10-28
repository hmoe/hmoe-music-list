var ffmpeg = require('fluent-ffmpeg');
var async = require('async');
var fs = require('fs');
var commandExists = require('command-exists');

var encodeMp3 = function(i,callback){
	if (fs.existsSync('./data/mp3-lq/'+i+'.mp3')) {
		console.log(i + '.mp3 already exist');
		return callback();
	}
	console.log('start processing ' + i);
	
	var command = ffmpeg();
	command.input('./data/mp3/'+i+'.mp3')
	.audioCodec('libmp3lame')
	.audioBitrate('128k')
	.audioChannels(2)
	.audioFrequency(44100)
	.format('mp3')
	.on('end', function() {
		console.log('Finished processing ' + i);
		return callback();
	})
	.on('error', function(err, stdout, stderr) {
		console.log('Cannot process '+i+' : ' + err.message);
		return callback();
	})
	.save('./data/mp3-lq/'+i+'.mp3');
}

var scanMp3 = function(){
	var path = './data/mp3';
	var workList = [];
	
	var files = fs.readdirSync(path);
	for(var i=0;i<files.length;i++) {  
		var item = files[i];
		var tmpPath = path + '/' + item,
			stats = fs.statSync(tmpPath);

		if (!stats.isDirectory()) {  
			var name = item.split('.',2);
			if(name[1]=='mp3'){
				workList.push(name[0]);
			}
		} 
	};  
	
	async.mapLimit(workList,4,encodeMp3);
}

commandExists('ffmpeg', function(err, commandExists) {
		if(!commandExists) {
			ffmpeg.setFfmpegPath('./libs/ffmpeg/bin/ffmpeg.exe');			
		}
		scanMp3();
});
