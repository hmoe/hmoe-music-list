# H萌在线音乐管理 #

本程序是H萌的在线音乐管理小工具。至于想要在这里发现服务器密码的不太可能吧。为什么开源呢，因为反正没什么用（笑）。

## 系统要求 ##

本程序兼容32位或者64位Windows、OS X、Linux。

依赖软件：

* nodejs（需要预先安装并且添加到环境变量）
* ffmpeg（Linux或者OS X需要手动下载。Windows自动安装）
* 7zip（只有Windows需要，已经附带提供）

## 安装 ##

* 下载或者`git clone`本项目
* 切换到工作路径下
* 执行`npm install`，并且等待npm自动安装依赖项（约20M）
* 执行`node init.js`。
	* 初始化程序会自动检查ffmpeg依赖项：如果是Windows系统会自动下载ffmpeg（32位或者64位，取决于系统版本）。其他系统如果没有ffmpeg需要手动从软件源安装。Windows下自动下载的完整64位ffmpeg需要系统空间约114M。
	* 初始化程序会从H萌在线音乐的xml列表处获得当前的列表，并且把数据写入JSON文件。
	* 初始化程序会开始从在线音乐CDN自动获取全部的高清版的音乐、背景图片、专辑图片。如果不需要下载，请`Ctrl+C`终止程序并且复制到对应的data目录。目前已知有未知原因下载可能中途停止，请终止程序之后重新运行（大概是某处忘记加回调了吧）。现在全部的高清背景图占用73M，专辑图像占用4.1M，歌词占用1.66M，高清歌曲占用4.5G。

## 压缩MP3 ##

执行`node deal-mp3.js`会扫描`./data/mp3/`目录。并且通过ffmpeg压缩产生MP3（采样率44100，码率128K，编码器libmp3lame）。如果`./data/mp3-lq/`目录下面已经有对应的MP3会跳过当前任务。

## 生成XML以及报表 ##

执行`node make-xml.js`会扫描`./data/json/`寻找歌曲配置文件。并且在`./gen/`目录下面生成XML文件以及缺失资源的文件报表。歌曲的时长会自动读取，如果可以会自动缓存到json里面。

## 上传服务器 ##

**<<TODO:>>**

## 添加歌曲 ##

* 在`./data/json/`下面建立`<歌曲ID>.json`。这个JSON应该包含标题、类型、以及百度下载地址。
* 在`./data/mp3/`添加`<歌曲ID>.mp3`。本文件应该是高分辨率的MP3。
* 在`./data/bg/`和`./data/bk/`以及`./data/lyric/`添加对应资源。
* 运行`node deal-mp3.js`
* 运行`node make-xml.js`
* 上传歌曲<<TODO:>>

## Author ##

manageryzy@gmail.com


## Licence ##

BSD