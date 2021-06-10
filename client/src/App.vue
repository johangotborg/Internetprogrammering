<template>
  <div id="app">
    <nav class="navbar navbar-default navbar-inverse navbar-static-top" role="navigation">
      <div class="container">
        <!-- Brand and toggle get grouped for better mobile display -->
        <div class="navbar-header">
          <button
            type="button"
            class="navbar-toggle"
            data-toggle="collapse"
            data-target="#navbar-brand-centered"
          >
            <span class="sr-only">Toggle navigation</span>
            <span class="icon-bar"></span>
            <span class="icon-bar"></span>
            <span class="icon-bar"></span>
          </button>
          <div
            v-on:click="redirect('/list')"
            class="navbar-brand navbar-brand-centered"
            style="line-height: 1em; cursor: pointer;"
          >Häftet</div>
        </div>

        <!-- Collect the nav links, forms, and other content for toggling -->
        <div class="collapse navbar-collapse" id="navbar-brand-centered">
          <ul class="nav navbar-nav">
            <li v-if="this.$store.state.isLoggedIn === false" v-on:click="redirect('/login')">
              <a style="cursor: pointer;">Login</a>
            </li>
            <li v-if="this.$store.state.isLoggedIn === false" v-on:click="redirect('/register')">
              <a style="cursor: pointer;">Register</a>
            </li>
            <li v-if="this.$store.state.isLoggedIn === true" v-on:click="logout()">
              <a style="cursor: pointer;">Logout</a>
            </li>
            <li v-if="this.$store.state.isLoggedIn === true" v-on:click="redirect('/profile')">
              <a style="cursor: pointer;">Profile</a>
            </li>
            <li v-on:click="redirect('/menu')">
              <a style="cursor: pointer;">Menu</a>
            </li>
          </ul>
        </div>
        <!-- /.navbar-collapse -->
      </div>
      <!-- /.container-fluid -->
    </nav>
    <router-view></router-view>
  </div>
</template>

<script>
export default {
  methods: {
    redirect(target) {
      this.$router.push(target);
    },
    logout() {
      fetch('/api/logout')
        .then(resp => resp.json())
        .then((resp) => {
          if (resp.status !== 200) {
            throw new Error(resp.msg);
          } else {
            this.$store.commit('setIsLoggedIn', false);
            this.$store.commit('setIsAdmin', false);
            this.$router.push('/login');
          }
        })
        .catch((err) => {
          console.error(err);
        });
    },
  },
};
</script>

<style>
.html,
body {
  margin: 0;
  padding: 0;
  border: 0;
}

span.text-blue {
  color: #387eff;
}

button:focus {
  outline: 0;
}

.navbar .container {
  margin-left: 0;
  margin-right: 0;
  padding-left: 0;
  width: 100%;
}

.navbar-brand-centered {
  position: absolute;
  left: 50%;
  display: block;
  width: 160px;
  text-align: center;
  background-color: transparent;
}

.navbar > .container .navbar-brand-centered,
.navbar > .container-fluid .navbar-brand-centered {
  margin-left: -80px;
}

.navbar {
  border-bottom: 0;
}

.navbar-default .navbar-nav > li:not(.active) > a:not(.unresponsive):hover {
  background-color: #0e0e0e;
}

.navbar-default .navbar-nav > .active > a,
.navbar-default .navbar-nav > .active > a:focus {
  background-color: #3873ff;
  color: #ffffff;
}

.navbar-default .navbar-nav > .active > a:hover {
  background-color: #1c65eb;
}

.nav.navbar-nav.navbar-right > li > .unresponsive:hover {
  color: #777777;
  cursor: default;
}

div.light-blue-background {
  background-color: #c5e7ff;
}
</style>
