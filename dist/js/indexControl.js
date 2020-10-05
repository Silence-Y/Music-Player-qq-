(function (root) {
    function Index(len) {
        this.index = 0;
        this.len = len;
    }
    Index.prototype = {
        // 用于获取上一个索引
        prev: function () {
            return this.get(-1);
        },
        // 用于获取下一个索引
        next: function () {
            return this.get(+1);
        },
        // 用于获取索引，参数为+1或-1
        get: function (val) {
            this.index = (this.index + val + this.len) % this.len;
            return this.index;
        }
    }

    root.controlIndex = Index; //把构造函数暴露出去


})(window.player || (window.player = {}))