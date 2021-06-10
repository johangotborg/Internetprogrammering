<template>
  <div class="registerPage">
    <div class="registerBox">
      <form v-on:submit.prevent="register()">
        <h5>Username:</h5>
        <input class="form-control" type="text" v-model="username" required autofocus />
        <h5>Password:</h5>
        <input class="form-control" type="password" v-model="password1" required />
        <h5>Repeat password:</h5>
        <input class="form-control" type="password" v-model="password2" required />
        <h5>Displayname: (Will be visible to other users)</h5>
        <input class="form-control" type="text" v-model="displayname" required />
        <h5>Email:</h5>
        <input class="form-control" type="email" v-model="email" required />
        <h5>Phonenumber:</h5>
        <input class="form-control" type="tel" v-model="phone" placeholder="070-11111111"
        pattern="[0-9]{10}" required /><br>
        <input class="button" type="submit" value="Register" />
      </form>
      <button class="button" v-on:click="cancel()">Cancel</button>
      <div class="invalidInput">
        <p v-if="invalidInput === true">{{ invalidInputMsg }}</p>
      </div>
    </div>
  </div>

</template>

<script>
export default {
  name: 'Register',
  components: {},
  data: () => ({
    username: '',
    password1: '',
    password2: '',
    displayname: '',
    email: '',
    phone: '',
    invalidInput: false,
    invalidInputMsg: '',
  }),
  methods: {
    register() {
      fetch('/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: this.username,
          password1: this.password1,
          password2: this.password2,
          displayname: this.displayname,
          email: this.email,
          phone: this.phone,
        }),
      })
        .then(resp => resp.json())
        .then((resp) => {
          if (resp.status === 200) {
            this.$router.push('/login');
            return;
          }
          this.$data.invalidInput = true;
          this.$data.invalidInputMsg = resp.msg;
          throw new Error(resp.msg);
        })
        .catch((error) => {
          console.error('Registration failed');
          console.error(error);
        });
    },
    cancel() {
      this.$router.push('/login');
    },
  },
};
</script>

<style scoped>
.registerPage {
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

.registerBox {
  background-color: #fefefe;
  margin: auto;
  padding: 50px;
  border: 1px solid #888;
  width: 25%;
  height: 700px;
  text-align: center;
  align-content: center;
}

.button {
  width: 200px;
  height: 30px;
  margin: 3px;
  border-radius: 8px;
  text-align: center;
}

.invalidInput {
  text-align: center;
  margin-top: 16px;
  font-size: 16px;
  color: red;
}

</style>
