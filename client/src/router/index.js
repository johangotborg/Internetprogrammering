import Vue from 'vue';
import VueRouter from 'vue-router';
import MenuView from '../views/Menu.vue';
import AdView from '../views/Ad.vue';
import LoginView from '../views/Login.vue';
import ProfileView from '../views/Profile.vue';
import RegisterView from '../views/Register.vue';
import store from '../store';

Vue.use(VueRouter);

const routes = [
  { path: '/', redirect: '/menu' },
  { path: '/menu', component: MenuView },
  { path: '/ad/:adID', component: AdView },
  { path: '/login', component: LoginView },
  { path: '/profile', component: ProfileView },
  { path: '/register', component: RegisterView },
];

const router = new VueRouter({
  mode: 'hash',
  base: process.env.BASE_URL,
  routes,
});

// Setup Authentication guard
router.beforeEach((to, from, next) => {
  fetch('/api/isAuthenticated')
    .then(resp => resp.json())
    .then((resp) => {
      store.commit('setIsLoggedIn', resp.isAuthenticated);
      store.commit('setIsAdmin', resp.isAdmin);
    })
    .catch(console.error);
  if (!store.state.isLoggedIn && to.path === '/profile') {
    next('/menu');
  } if (store.state.isLoggedIn && (to.path === '/login' || to.path === '/register')) {
    next('/menu');
  } else {
    next();
  }
});

export default router;
