import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  mn: {
    translation: {
      // Нэвтрэх хуудас
      'login.title': 'Нэвтрэх',
      'login.username': 'Хэрэглэгчийн нэр',
      'login.password': 'Нууц үг',
      'login.submit': 'Нэвтрэх',
      'login.noAccount': 'Бүртгэлгүй юу?',
      'login.register': 'Бүртгүүлэх',
      
      // Dashboard
      'dashboard.welcome': 'Сайн уу',
      'dashboard.total': 'Нийт',
      'dashboard.completed': 'Дууссан',
      'dashboard.pending': 'Хүлээгдэж буй',
      'dashboard.addTodo': 'Юу хийх вэ...',
      'dashboard.add': 'Нэмэх',
      'dashboard.search': 'Даалгавар хайх...',
      'dashboard.all': 'Бүгд',
      'dashboard.personal': 'Хувийн',
      'dashboard.work': 'Ажил',
      'dashboard.study': 'Хичээл',
      'dashboard.noTodos': 'Todo байхгүй. Нэмээрэй!',
      'dashboard.noResults': 'Хайлтад тохирох todo олдсонгүй',
      'dashboard.logout': 'Гарах',
    },
  },
  en: {
    translation: {
      'login.title': 'Login',
      'login.username': 'Username',
      'login.password': 'Password',
      'login.submit': 'Login',
      'login.noAccount': "Don't have an account?",
      'login.register': 'Register',
      
      'dashboard.welcome': 'Hello',
      'dashboard.total': 'Total',
      'dashboard.completed': 'Completed',
      'dashboard.pending': 'Pending',
      'dashboard.addTodo': 'What to do...',
      'dashboard.add': 'Add',
      'dashboard.search': 'Search tasks...',
      'dashboard.all': 'All',
      'dashboard.personal': 'Personal',
      'dashboard.work': 'Work',
      'dashboard.study': 'Study',
      'dashboard.noTodos': 'No todos. Add one!',
      'dashboard.noResults': 'No matching todos found',
      'dashboard.logout': 'Logout',
    },
  },
};

i18n.use(initReactI18next).init({
  resources,
  lng: localStorage.getItem('language') || 'mn',
  fallbackLng: 'mn',
  interpolation: { escapeValue: false },
});

export default i18n;