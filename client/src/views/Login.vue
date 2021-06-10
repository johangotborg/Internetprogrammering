
<template>
  <div class="loginPage">
    <div class="loginBox">
      <form v-on:submit.prevent="login()">
        <h5>Username:</h5>
        <input class="form-control" type="text" v-model="username" required autofocus />
        <h5>Password:</h5>
        <input class="form-control" type="password" v-model="password" required /><br>
        <input class="button" type="submit" value="Login" />
      </form>
      <button class="button" v-on:click="register()">Register</button>
      <div class="badCredentials">
        <p v-if="badCredentials === true">{{ badCredentialsMsg }}</p>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Login',
  components: {},
  data: () => ({
    username: '',
    password: '',
    badCredentials: false,
    badCredentialsMsg: '',
  }),
  methods: {
    login() {
      fetch('/api/authenticate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: this.username,
          password: this.password,
        }),
      })
        .then(resp => resp.json())
        .then((resp) => {
          if (resp.status === 200) return resp;
          this.$store.commit('setIsLoggedIn', false);
          this.$data.badCredentials = true;
          this.$data.badCredentialsMsg = resp.msg;
          throw new Error('Bad credentials');
        })
        .then((resp) => {
          this.$store.commit('setIsLoggedIn', true);
          this.$store.commit('setIsAdmin', resp.isAdmin);
          this.$router.push('/menu');
        })
        .catch((error) => {
          console.error('Authentication failed');
          console.error(error);
        });
    },
    register() {
      console.info('trying to registerbutton');
      this.$router.push('/register');
    },
  },
};
</script>

<style scoped>

.loginPage {
  display: block;
  position: fixed;
  padding-top: 150px;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  overflow: auto;
  background-color: rgb(0,0,0);
  background-color: rgba(0,0,0,0.4);
}

.loginBox {
  background-color: #fefefe;
  margin: auto;
  padding: 50px;
  border: 1px solid #888;
  width: 25%;
  height: 60%;
  text-align: center;
  align-content: center;
}

.button {
  width: 65%;
  height: 30px;
  margin: 3px;
  border-radius: 8px;
  text-align: center;
}

.badCredentials {
  text-align: center;
  margin-top: 16px;
  font-size: 16px;
  color: red;
}
</style>
