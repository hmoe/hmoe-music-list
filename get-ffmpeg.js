var commandExists = require('command-exists');
var os = require('os');
var fs = require('fs');
var http = require('http');
var Zip = require('node-7z');
var ncp = require('ncp').ncp;
var rimraf = require('rimraf');

var findFFmpeg = function(){
	if (fs.existsSync('./libs/ffmpeg/bin/ffmpeg.exe')) {
		return true;
	}
	return false;
}

var download = function(url, dest, cb) {
  var file = fs.createWriteStream(dest);
  var request = http.get(url, function(response) {
    response.pipe(file);
    file.on('finish', function() {
      file.close(cb);  // close() is async, call cb after close completes.
    });
  }).on('error', function(err) { // Handle errors
    fs.unlink(dest); // Delete the file async. (But we don't check the result)
    if (cb) cb(err.message);
  });
};

var downloadFFmpeg = function(url){
	
	if (fs.existsSync('ffmpeg.7z')) {
		console.log('file have already downloaded!');
		unzipFFmpeg();
		return;
	}else{
		console.log('now downloading ffmpeg. please wait ...');
		download(url,'ffmpeg.7z.tmp',function(error){
			if(error){
				console.log('error in downloading ffmpeg from '+url+' !');
				process.exit(-2);
			}
			console.log('download finished.');
			fs.rename('ffmpeg.7z.tmp', 'ffmpeg.7z', function(err) {
				if ( err ) {
					console.log('ERROR: ' + err);
					process.exit(-3);
				}else{
					unzipFFmpeg();
				}
			});
		})
	}
}

var unzipFFmpeg = function(){
	console.log('Now unzipping files...');
	var myTask = new Zip();
	myTask.extractFull('ffmpeg.7z', './libs')
	// When all is done 
	.then(function () {
		console.log('Extracting done!');
		ncp('./libs/ffmpeg-20151025-git-2ccc1b3-win64-static/', './libs/ffmpeg/', function(err) {
			if(err){
				//console.log(err);
			}else{
				rimraf('./libs/ffmpeg-20151025-git-2ccc1b3-win64-static',function(err){
					if(err){
						console.log(err)
					}
				});
				rimraf('./ffmpeg.7z',function(err){
					if(err){
						console.log(err)
					}
				});
			}
		});
		ncp('./libs/ffmpeg-20151025-git-2ccc1b3-win32-static/', './libs/ffmpeg/', function(err) {
			if(err){
				//console.log(err);
			}else{
				rimraf('./libs/ffmpeg-20151025-git-2ccc1b3-win32-static',function(err){
					if(err){
						console.log(err)
					}
				});
				rimraf('./ffmpeg.7z',function(err){
					if(err){
						console.log(err)
					}
				});
			}
		});
	})
	// On error 
	.catch(function (err) {
		console.error(err);
	});
}


	commandExists('ffmpeg', function(err, commandExists) {
		if(!commandExists) {
			if(os.platform()==='win32'){
				if(!findFFmpeg()){
					if(os.arch()==='x64'){
						console.log('You are using windows x64 ! \nDownload for ffmpeg will start soon.')
						downloadFFmpeg('http://ffmpeg.zeranoe.com/builds/win64/static/ffmpeg-20151025-git-2ccc1b3-win64-static.7z');
					}else if(os.arch()==='ia32'){
						console.log('You are using windows x86 ! \nDownload for ffmpeg will start soon.');
						downloadFFmpeg('http://ffmpeg.zeranoe.com/builds/win32/static/ffmpeg-20151025-git-2ccc1b3-win32-static.7z');
					}else{
						console.log('You are using windows with unsupported CPU ! \n\
							Please go to the homepage of ffmpeg and install ffmpeg to the %PATH%');
						process.exit(-1);
					}
				}else{
					console.log('ffmpeg : ok');
				}
			}else{
				console.log('No ffmpeg found.You should get ffmpeg from your package manager.try like : \n \
					ubuntu : sudo apt-get install ffmpeg \n \
					centos : yum install ffmpeg \n\
					os x : brew install ffmpeg');
				process.exit(-1);
			}
		}else{
			console.log('ffmpeg : ok');
		}
	});

