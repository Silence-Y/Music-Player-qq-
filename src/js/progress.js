(function (root) {
    // 进度条的构造函数
    function Progress() {
        // 总时间,为秒
        this.durTime = 0;
        // 定时器
        this.frameId = null;
        this.startTime = 0;
        // 最近一次的百分比
        this.lastPercent = 0;

        this.init();
    }
    Progress.prototype = {
        // 初始化
        init: function () {
            this.getDom();
            // console.log(this.formatTime(266))
        },
        getDom: function () {
            // 当前时间
            this.curTime = document.querySelector('.curTime');
            // 小圆点
            this.circle = document.querySelector('.circle');
            // 前面的背景
            this.frontBg = document.querySelector('.frontBg');
            // 总体时间
            this.totalTime = document.querySelector('.totalTime');
        },
        // 渲染总时间
        renderAllTime: function (time) {
            // 时间为 266，是秒
            this.durTime = time;
            time = this.formatTime(time);
            // 在dom中更新
            this.totalTime.innerHTML = time;
        },
        // 时间格式化
        formatTime: function (time) {
            // 时间进行取整
            time = Math.round(time);
            // 显示  分  取整
            var m = Math.floor(time / 60);
            // 显示  秒
            var s = time % 60;
            // 如果m  小于10，就在前面补0
            m = m < 10 ? '0' + m : m;
            s = s < 10 ? '0' + s : s;
            return m + ":" + s;
        },

        // 移动进度条
        move: function (per) {
            var This = this;

            cancelAnimationFrame(this.frameId);

            this.lastPercent = per === undefined ? this.lastPercent : per;

            // 按下进度条的时间
            this.startTime = new Date().getTime();

            function frame() {
                // 当前时间
                var curTime = new Date().getTime();
                // 时间百分比,移动到的时间百分比
                // durTime为秒，要变成毫秒
                var per = This.lastPercent + (curTime - This.startTime) / (This.durTime * 1000);
                // per小于1  说明歌曲正在播放
                if (per <= 1) {
                    // 更新进度条
                    This.update(per);
                } else {
                    // 清除定时器
                    cancelAnimationFrame(This.frameId);
                }
                // 定时器,h5新增，和setTimeout类似,用递归
                This.frameId = requestAnimationFrame(frame);
            }

            frame();
        },
        // 更新进度条
        update: function (per) {
            // 更新左边的时间
            var time = this.formatTime(per * this.durTime);
            this.curTime.innerHTML = time;

            // 更新进度条的位置
            this.frontBg.style.width = per * 100 + '%';

            // 更新圆点的位置
            // 取决于父级的宽度  l为走的距离
            var l = per * this.circle.parentNode.offsetWidth;
            this.circle.style.transform = 'translateX(' + l + 'px)';
        },
        // 暂停进度条
        stop: function () {
            // 取消定时器
            cancelAnimationFrame(this.frameId);
            // 停止的时间戳
            var stopTime = new Date().getTime();
            // 最近一次的百分比
            // 停止的时候显示的时间
            this.lastPercent += (stopTime - this.startTime) / (this.durTime * 1000);
        }
    }

    function instanceProgress() {
        return new Progress();
    }



    // 拖拽
    function Drag(obj) {
        this.obj = obj;
        this.starPointX = 0;
        this.startLeft = 0;
        this.percent = 0;
    }
    Drag.prototype = {
        init: function () {
            var This = this;
            this.obj.style.transform = 'translateX(0)';
            // 开始拖拽
            this.obj.addEventListener('touchstart', function (ev) {
                This.starPointX = ev.changedTouches[0].pageX;
                This.startLeft = parseFloat(this.style.transform.split('(')[1]);
                This.start && This.start();
            });
            // 拖拽距离
            this.obj.addEventListener('touchmove', function (ev) {
                This.disPointX = ev.changedTouches[0].pageX - This.starPointX;
                var l = This.startLeft + This.disPointX;

                if (l < 0) {
                    l = 0
                } else if (l > this.offsetParent.offsetWidth) {
                    l = this.offsetParent.offsetWidth;
                }

                this.style.transform = 'translateX(' + l + 'px)';

                This.percent = l / this.offsetParent.offsetWidth;
                This.move && This.move(This.percent);

                ev.preventDefault();
            });
            // 拖拽结束
            this.obj.addEventListener('touchend', function (ev) {
                This.end && This.end(This.percent);
            });
        }
    }

    function instanceDrag(obj) {
        return new Drag(obj);
    }

    root.progress = {
        pro: instanceProgress,
        drag: instanceDrag,
    }
})(window.player || (window.player = {}));