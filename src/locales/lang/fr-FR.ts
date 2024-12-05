import { genMessage } from '../helper';
import antdLocale from 'ant-design-vue/es/locale/fr_FR';

const modules = import.meta.glob('./fr_FR/**/*.{json,ts,js}', { eager: true });
export default {
  message: {
    ...genMessage(modules as Recordable<Recordable>, 'fr_FR'),
    antdLocale,
  },
  dateLocale: null,
  dateLocaleName: 'fr-FR',
};
