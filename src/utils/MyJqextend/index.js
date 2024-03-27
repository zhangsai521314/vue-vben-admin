const timeIds = {};
//jq扩展
$.extend({
    //组件定时器id,用于组件销毁时销毁。key一个组件的名称，组件内使用addTimeId时key一致。
    addTimeId(id, key) {
        if (!timeIds[key]) {
            timeIds[key] = [];
        }
        timeIds[key].push(id);
        return id;
    },
    //清除全部定时id
    clearTimeIds(key) {
        if (timeIds[key]) {
            for (let i = timeIds[key].length - 1; i >= 0; i--) {
                try {
                    clearInterval(timeIds[key][i]);
                } catch (error) {
                    clearTimeout(timeIds[key][i]);
                }
                timeIds[key].splice(i, 1);
            }
        }
    }
});