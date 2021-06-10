<template>
  <div class="container">
    <div class="listPage">

      <div class="addAd" v-if="showAdd === true">
        <div class="addAdContent">
          <span class="close" v-on:click="showAdd = false">X</span>
          <form v-on:submit.prevent="addAd()" enctype="multipart/form-data" id="adForm">
            <dl>
              <dt><label for="title">Title:</label></dt><dd><input type="text" id="title"
              v-model="newTitle" minlength=3 maxlength=25
              style="width: 228px;" required /></dd><br>
              <dt><label>Description</label></dt><dd><textarea rows="20" cols="100" id="description"
              v-model="newDescription" style="width: 228px; height: 100px;" form="adForm"
              required /></dd><br>
              <dt><label for="cost">Cost (SEK)</label></dt><dd><input type="number"
                id="cost" v-model="newCost" min="0" max="1000000" style="width: 128px;"
                required /></dd><br>
              <dt><label for="image">Upload image</label></dt><dd><input type="file" ref="file"
              v-on:change="saveNewImage()" id="image" name="image" accept=".png, .jpg, .jpeg"
              required/></dd>
            </dl>
            <input class="actionButton" style="background-color: rgb(174, 255, 158);" type="submit"
            value="Create"/>
          </form>
          <button class="actionButton" style="background-color: rgb(241, 133, 133);"
          v-on:click="showAdd = false"><b>Cancel</b></button>
          <p class="errormsg">{{ createAdErrorMsg }}</p>
        </div>
      </div>

      <div class="listBox">
        <div class="buttonArea">
          <button class="mainButton" v-on:click="showAdd = true">Add ad</button>
          <button class="mainButton" v-on:click="view='ownAds'">Own ads</button>
          <button v-if="this.$store.state.isAdmin" class="mainButton"
          v-on:click="view='allAds'">All ads</button>
        </div>
        <div class="ownAds" v-if="view === 'ownAds'">
          <div v-if="userAds.length === 0">
            <p class="text">Currently no ads to display</p>
          </div>
          <div v-for="ad in userAds" :key="ad.adID" :ref="ad.adID">
            <div class="ad">
              <div class="adInfo">
                <h3>{{ ad.adName }}<br><h6>Seller: {{ ad.adUsername }}<br>
                <button v-on:click="removeAd(ad.adID)">Delete</button></h6></h3>
                <img class="image" :src='image+ad.adID' alt="AdImage">
              </div>
            </div>
          </div>
        </div>
        <div class="allAds" v-if="view === 'allAds'">
          <div v-if="allAds.length === 0">
            <p class="text">Currently no ads to display</p>
          </div>
          <div v-for="ad in allAds" :key="ad.adID" :ref="ad.adID">
            <div class="ad">
              <div class="adInfo">
                <h3>{{ ad.adName }}<br><h6>Seller: {{ ad.adUsername }}<br>
                <button v-on:click="removeAd(ad.adID)">Delete</button></h6></h3>
                <img class="image" :src='image+ad.adID' alt="AdImage">
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<script>
export default {
  name: 'Profile',
  components: {},
  data: () => ({
    showAdd: false,
    image: '/image/',
    userAds: [],
    user: {},
    view: 'ownAds',
    newTitle: '',
    newDescription: '',
    newCost: '',
    newImage: null,
    createAdErrorMsg: '',
    allAds: [],
  }),
  methods: {
    saveNewImage() {
      this.$data.newImage = this.$refs.file.files;
    },
    listenerAddAd(data) {
      this.$data.allAds.push(data.ad);
    },
    listenerRemoveAd(data) {
      const indexAll = this.$data.allAds.findIndex(ad => Number(ad.adID) === Number(data.id));
      this.$data.allAds.splice(indexAll, 1);
      const indexOwn = this.$data.userAds.findIndex(ad => Number(ad.adID) === Number(data.id));
      if (indexOwn !== -1) {
        this.$data.userAds.splice(indexOwn, 1);
      }
    },
    addAd() {
      const formData = new FormData();
      formData.append('image', this.$data.newImage[0]);
      formData.append('newTitle', this.$data.newTitle);
      formData.append('newDescription', this.$data.newDescription);
      formData.append('newCost', this.$data.newCost);
      fetch('/api/addAd', {
        method: 'POST',
        body: formData,
      })
        .then(resp => resp.json())
        .then((resp) => {
          if (resp.status !== 200) {
            console.error(resp.msg);
            throw new Error(resp.msg);
          }
          this.$data.userAds.push(resp.ad);
          this.$data.newTitle = '';
          this.$data.newDescription = '';
          this.$data.newCost = '';
          this.$data.newImage = null;
          this.$data.showAdd = false;
        })
        .catch((error) => {
          console.error(error);
        });
    },
    removeAd(ID) {
      fetch('/api/removeAd', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          adID: ID,
        }),
      })
        .then(resp => resp.json())
        .then((resp) => {
          if (resp.status !== 200) {
            console.error(resp.msg);
            throw new Error(resp.msg);
          }
        })
        .catch((error) => {
          console.error(error);
        });
    },
  },
  beforeCreate() {
    fetch('/api/userAds')
      .then(res => res.json())
      .then((data) => {
        this.$data.userAds = data.userAds;
        this.$data.user = data.user;
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
    if (this.$store.state.isAdmin) {
      fetch('/api/ads')
        .then(res => res.json())
        .then((data) => {
          this.$data.allAds = data.list;
        })
        .catch((error) => {
          console.error(error);
        });
    }
  },
  beforeDestroy() {
    this.$root.$data.socket.off('changeTimeslotStatus');
    this.$root.$data.socket.off('newTimeSlot');
    this.$root.$data.socket.off('removeTimeSlot');
  },
};
</script>

<style scoped>
.text {
  font-size: 24px;
  font-style: italic;
  padding: 12px;
}

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

.addAd {
  display: block;
  position: fixed;
  z-index: 1;
  padding-top: 100px;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  overflow: auto;
  background-color: rgb(0,0,0);
  background-color: rgba(0,0,0,0.4);
}

.addAdContent {
  background-color: #fefefe;
  margin: auto;
  padding: 20px;
  border: 1px solid #888;
  width: 50%;
  text-align: center;
  align-content: center;
}

.listBox {
  display: inline-block;
  width: 50%;
  background-color: rgb(250, 250, 250);
  margin-top: 64px;
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

.buttonArea {
  padding: 16px;
}

.image {
  max-height: 100%;
  max-width: 25%;
  position: absolute;
  right: 0;
}

</style>
