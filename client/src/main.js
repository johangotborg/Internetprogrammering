import Vue from 'vue';
import io from 'socket.io-client';
import App from './App.vue';
import router from './router';
import store from './store';

Vue.config.productionTip = false;

(async () => {
  const { isAuthenticated, isAdmin } = await fetch('/api/isAuthenticated')
    .then(resp => resp.json())
    .catch(console.error);
  store.commit('setIsLoggedIn', isAuthenticated);
  store.commit('setIsAdmin', isAdmin);

  new Vue({
    router,
    store,
    render: h => h(App),
    data: {
      socket: io('https://localhost:8080').connect(),
    },
  }).$mount('#app');
})();
