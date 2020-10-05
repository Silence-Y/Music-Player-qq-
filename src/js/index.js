(function ($, player) {
    function MusicPlayer(dom) {
        this.wrap = dom;
        //存储请求到的数据
        this.dataList = [];
        // this.now = 0; //歌曲的索引
        this.indexObj = null; //索引值对象（用于切歌 ）
        this.rotateTimer = null;
        this.curIndex = 0; //当前播放歌曲的索引值
        this.list = null; //列表切歌对象（在listPlay里赋了值）

        // 调用进度条的方法
        this.progress = player.progress.pro();
    }
    MusicPlayer.prototype = {
        init: function () { //初始化
            this.getDom();
            this.getData("../mock/data.json");
        },
        getDom: function () { //获取页面里的元素
            this.record = document.querySelector(".songImg img");
            this.controlBtns = document.querySelectorAll(".control li");
        },
        getData: function (url) {
            var This = this;
            $.ajax({
                url: url,
                method: "get",
                success: function (data) {
                    This.dataList = data; //存储请求过来的数据

                    This.listPlay(); //列表切歌要放到loadmusic前面

                    This.indexObj = new player.controlIndex(data.length) //给索引值赋值
                    This.loadMusic(This.indexObj.index); //加载音乐
                    This.musicControl(); //控制音乐

                    // 加载进度条
                    This.dragProgress();
                },
                error: function () {
                    console.log("数据请求失败")
                }
            });
        },
        //加载音乐
        loadMusic: function (index) {
            player.render(this.dataList[index]); //歌曲信息
            player.music.load(this.dataList[index].audioSrc);

            // 显示进度条,dataList为后端请求回来的数据
            this.progress.renderAllTime(this.dataList[index].duration)

            // 播放音乐
            if (player.music.status == "play") {
                player.music.play();
                this.controlBtns[2].className = 'playing'; //按钮状态变成播放状态
                this.imgRotate(0);

                // 移动进度条，从0开始
                this.progress.move(0);
            }

            // 改变列表里歌曲的选中状态
            this.list.changeSelect(index);

            this.curIndex = index; //存储当前歌曲对应的索引值
        },
        musicControl: function () { //控制音乐，上一首，下一首
            var This = this;
            // 上一首
            this.controlBtns[1].addEventListener("touchend", function () {
                player.music.status = "play";
                // This.now--;
                // This.loadMusic(This.now);
                This.loadMusic(This.indexObj.prev());
            })

            // 暂停/播放
            this.controlBtns[2].addEventListener("touchend", function () {
                if (player.music.status == "play") { //状态为播放
                    player.music.pause(); //要暂停
                    this.className = '';
                    This.imgStop();

                    // 暂停进度条
                    This.progress.stop();
                } else { //状态为暂停
                    player.music.play(); //要播放
                    //按钮变成播放状态
                    this.className = 'playing';
                    // 第二次播放的时候需要加上第二次旋转的角度
                    var deg = This.record.dataset.rotate || 0;
                    This.imgRotate(deg);

                    // 移动进度条
                    This.progress.move();
                };
            })
            // 下一首
            this.controlBtns[3].addEventListener("touchend", function () {
                player.music.status = "play";
                // This.now++;
                // This.loadMusic(This.now);    
                This.loadMusic(This.indexObj.next());
            })
        },

        // 旋转图片
        imgRotate: function (deg) {
            var This = this;
            clearInterval(this.rotateTimer);

            this.rotateTimer = setInterval(function () {
                deg = +deg + 0.2;

                This.record.style.transform = 'rotate(' + deg + 'deg)';
                This.record.dataset.rotate = deg; //把旋转的角度存到标签身上，为了暂停后继续播放
            }, 1000 / 60);
        },
        // 停止图片旋转
        imgStop: function () {
            clearInterval(this.rotateTimer);
        },
        // 列表切歌
        listPlay: function () {
            var This = this;
            this.list = player.listControl(this.dataList, this.wrap);

            //给列表按钮添加点击事件
            this.controlBtns[4].addEventListener('touchend', function () {
                This.list.slideUp(); //让列表显示出来
            })

            // 歌曲列表添加事件
            this.list.musicList.forEach(function (item, index) {
                item.addEventListener('touchend', function () {
                    if (This.curIndex == index) {
                        return;
                    }
                    player.music.status = 'play'; //歌曲要变成播放状态
                    This.indexObj.index = index; //索引值对象身上的当前索引值要更新
                    This.loadMusic(index); //加载点击对应的索引值的那首歌曲
                    This.list.slideDown(); //列表消失
                });
            });
        },
        dragProgress: function () {
            var This = this;
            // 拖拽圆点
            var circle = player.progress.drag(document.querySelector('.circle'));

            circle.init();
            circle.start = function () {
                // 按下的时候
            }
            circle.move = function (per) {
                // 按下的时候
                This.progress.update(per);
            }
            circle.end = function (per) {
                // console.log('dfsfd')
                var cutTime = per * This.dataList[This.indexObj.index].duration;
                player.music.playTo(cutTime);
                player.music.play();

                This.progress.move(per);

                var deg = This.record.dataset.rotate || 0;
                This.imgRotate(deg); //旋转图片
                //按钮状态变成播放状态
                This.controlBtns[2].className = 'playing';
            }
        }
    }

    var musicPlayer = new MusicPlayer(document.getElementById("wrap"));
    musicPlayer.init();



})(window.Zepto, window.player);