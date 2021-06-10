<template>
  <div class="listPage">
    <div class="listBox">
      <div v-if="ads.length === 0">
        <p class="text">Currently no ads to display</p>
      </div>
      <div v-for="ad in ads" :key="ad.adID" :ref="ad.adID" v-on:click="redirect(ad.adID)">
        <div class="ad">
          <div class="adInfo">
            <h3>{{ ad.adName }}<br><h6>Seller: {{ ad.adUsername }}</h6></h3>
            <img class="image" :src='image+ad.adID' alt="AdImage">
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'List',
  components: {},
  data: () => ({
    image: '/image/',
    ads: [],
  }),
  methods: {
    listenerAddAd(data) {
      this.$data.ads.push(data.ad);
    },
    listenerRemoveAd(data) {
      const index = this.$data.ads.findIndex(ad => Number(ad.adID) === Number(data.id));
      this.$data.ads.splice(index, 1);
    },
    redirect(adID) {
      this.$router.push(`/ad/${adID}`);
    },
    toggleDeleteMenu(adID) {
      if (this.$store.state.isAdmin) {
        this.$data.showDeleteMenu = adID;
      }
    },
  },
  created() {
    fetch('/api/ads')
      .then(res => res.json())
      .then((data) => {
        this.$data.ads = data.list;
        console.info(data.list);
      })
      .then(() => {
        this.$root.$data.socket.on('addAd', (data) => {
          this.listenerAddAd(data);
        });
        this.$root.$data.socket.on('removeAd', (data) => {
          this.listenerRemoveAd(data);
        });
      })
      .catch(console.error);
  },
  beforeDestroy() {
    this.$root.$data.socket.off('addAd');
    this.$root.$data.socket.off('removeAd');
  },
};
</script>
<style scoped>

.listPage {
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

.text {
  font-size: 24px;
  font-style: italic;
  padding: 12px;
}

.listBox {
  display: inline-block;
  width: 50%;
  margin-top: 64px;
  background-color: rgb(250, 250, 250);
  padding-bottom: 64px;
}

.ad {
  position: relative;
  display: inline-block;
  justify-content: center;
  align-items: center;
  height: 100px;
  width: 90%;
  margin: 8px;
  border: 1px solid rgb(0, 0, 0);
}

.adInfo {
  display: grid;
  grid-template-columns: 75% 25%;
  font-size: 18px;
  font-style: italic;
}

.image {
  max-height: 100%;
  max-width: 25%;
  position: absolute;
  right: 0;
}

</style>
