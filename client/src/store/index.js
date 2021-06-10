import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);

// no-param-reassign prevents store.isAuthenticated = isAuthenticated
/* eslint-disable no-param-reassign */
export default new Vuex.Store({
  state: {
    isLoggedIn: false,
    isAdmin: false,
  },
  mutations: {
    setIsLoggedIn(store, isLoggedIn) {
      store.isLoggedIn = isLoggedIn;
    },
    setIsAdmin(store, isAdmin) {
      store.isAdmin = isAdmin;
    },
  },
  actions: {
  },
  modules: {
  },
});
