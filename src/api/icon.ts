//图标
import { defHttp } from '@/utils/http/axios';
import { ErrorMessageMode } from '/#/axios';
const icon = {
    //获取图标下拉菜单
    GetIconSimple: function () {
        return defHttp.get({
            url: '/Icon/GetIconSimple',
        });
    },
};
export default icon;
