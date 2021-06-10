<template>
  <div class="adPage">
    <div class="content">
      <div class="options">
      </div>
      <img v-if="ad.adID !== undefined" class="image" :src="image+ad.adID">
      <div class="header">
        {{ ad.adName }}
      </div>
      <div class="description">
        {{ ad.adDescription }}
      </div>
      <div class="contacts">
        <h2>Contacts</h2>
        <dl>
          <dt>Owner:</dt><dd>{{ ad.adUsername }}</dd>
          <dt>Phonenumber:</dt><dd>{{ phone }}</dd>
          <dt>Email:</dt><dd><a :href="mail+email">{{ email }}</a></dd>
        </dl>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Ad',
  components: {},
  data() {
    return {
      mail: 'mailto: ',
      image: '/image/',
      ad: {},
      phone: '',
      email: '',
    };
  },
  methods: {
  },
  beforeCreate() {
    fetch('/api/ad', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        adID: this.$route.params.adID,
      }),
    })
      .then(resp => resp.json())
      .then((resp) => {
        if (resp.status !== 200) {
          console.info(this.$route.params.tableID);
          throw new Error(`Unexpected failure when visiting ad: ${this.name}`);
        } else {
          this.$data.ad = resp.ad;
          this.$data.phone = resp.phone;
          this.$data.email = resp.email;
        }
      })
      .then(() => {
        this.$root.$data.socket.on(`joinTable${this.$route.params.tableID}`, (data) => {
          this.listenerJoinTable(data.removeTimeSlot);
        });
        this.$root.$data.socket.on(`leaveTable${this.$route.params.tableID}`, (data) => {
          this.listenerLeaveTable(data);
        });
      })
      .catch((err) => {
        console.error(err);
      });
  },
  beforeDestroy() {
  },
};
</script>

<style scoped>
.adPage {
  display: block;
  position: fixed;
  padding-top: 50px;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  overflow: auto;
  background-color: rgb(150, 150, 150);
  align-content: center;
  text-align: center;
  justify-content: center;
}

.content {
  display: inline-block;
  width: 50%;
  margin-top: 64px;
  background-color: rgb(250, 250, 250);
  padding-bottom: 64px;
  align-content: center;
  text-align: center;
  justify-content: center;
  word-wrap: break-word;
}

.image {
  max-width: 100%;
  border: 3px solid rgb(133, 133, 133);
  padding: 1px;
}

.header {
  font-size: 36px;
  background-color: rgb(230, 230, 230);
  border: 3px solid rgb(230, 230, 230);
  padding: 6px;
  margin-bottom: 16px;
  border-radius: 10px;
}
.description {
  font-size: 16px;
  padding: 6px;
  background-color: rgb(230, 230, 230);
  border: 3px solid rgb(230, 230, 230);
  border-radius: 10px;
}

</style>
