import { genMessage } from '../helper';
import antdLocale from 'ant-design-vue/es/locale/fr_FR';

const modules = import.meta.glob('./fr/**/*.{json,ts,js}', { eager: true });
export default {
  message: {
    ...genMessage(modules as Recordable<Recordable>, 'fr_FR'),
    antdLocale,
  },
  dateLocale: null,
  dateLocaleName: 'fr_FR',
};
