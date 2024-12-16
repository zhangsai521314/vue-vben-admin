import { useLocaleStore } from '@/store/modules/locale';

const VxetableMyCommon = {
  onSortChange(
    { field, order, sortList, column, property, $event },
    page,
    callback,
    localesCol = [],
  ) {
    const localeStore = useLocaleStore();
    const locale = localeStore.getLocale;
    page.sortlist = [];
    sortList.forEach((item) => {
      if (localesCol.indexOf(item.field) != -1) {
        if (locale == 'fr-FR') {
          page.sortlist.push(`${item.field}Fr ${item.order}`);
        } else if (locale == 'en-US') {
          page.sortlist.push(`${item.field}En ${item.order}`);
        } else {
          page.sortlist.push(`${item.field}Cn ${item.order}`);
        }
      } else {
        page.sortlist.push(`${item.field} ${item.order}`);
      }
    });
    if (callback) {
      callback();
    }
  },
};
export default VxetableMyCommon;
