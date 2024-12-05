import { genMessage } from '../helper';
import antdLocale from 'ant-design-vue/es/locale/en_US';

const modules = import.meta.glob('./en_US/**/*.{json,ts,js}', { eager: true });
export default {
  message: {
    ...genMessage(modules as Recordable<Recordable>, 'en_US'),
    antdLocale,
  },
  dateLocale: null,
  dateLocaleName: 'en-US',
};
