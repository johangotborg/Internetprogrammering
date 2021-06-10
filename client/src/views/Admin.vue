<template>
  <div class="container">
    <section class="col-md-10 col-md-offset-1">
      <div style="text-align: right">
        <button class="adminButton" v-on:click="logout()">Log out</button>
      </div>
      <div class="row" style="text-align: center;">
        <h1>Admin</h1>
        <button v-on:click="togglePopup()">Add timeslot</button>
      </div>
      <div>
        <div class="modal" v-if="popup === true">
          <div class="modal-content">
            <span class="close" v-on:click="popup = false">X</span>
            <div style="text-align: center; align-content: center; justify-content: center;">
              <h2><b>Add timeslot</b></h2>
              <div class="timeSelector">
                <button v-on:click="incHour(1)">+</button>
                <p/>
                <button v-on:click="incMinute(1)">+</button>
                <p>{{ hour }}</p>
                <p>:</p>
                <p>{{ minute }}</p>
                <button v-on:click="incHour(-1)">-</button>
                <p/>
                <button v-on:click="incMinute(-1)">-</button>
              </div>
              <div style="display: block; text-align: center; margin-top: 16px;">
                <button class="finishButton" style="background-color: lightgreen;"
                v-on:click="addTimeSlot()">
                  <b>Add timeslot</b></button>
                <button class="finishButton" style="background-color: red;"
                v-on:click="togglePopup()"><b>Cancel</b></button>
              </div>
            </div>
          </div>
        </div>
      </div>


      <div class="row">
        <div v-for="timeslot in timeslots" :key="timeslot.timeslotID"
        :ref="timeslot.timeslotID" style="justify-content: center; align-items: center;">
          <div class="timeslot" v-if="timeslot.status === 0"
            style="background-color: #8FF774;">
            <button class="adminButton" v-on:click="removeTimeSlot(timeslot)">
              Delete</button>
            <span class="mainInfo">
              {{ timeslot.time }}
              @{{ timeslot.assistant }}
            </span>
          </div>
          <div class="timeslot" v-else-if="timeslot.status === 1"
          style="background-color: #F2F985;">
            <span class="mainInfo">
              {{ timeslot.time }}
              @{{ timeslot.assistant }}
            </span>
            <br><button class="adminButton" v-on:click="removeTimeSlot(timeslot)">
              Delete</button>
          </div>
          <div class="timeslot" v-else-if="timeslot.status === 2"
          style="background-color: #F98585;">
            <span class="mainInfo">
              {{ timeslot.time }}
              @{{ timeslot.assistant }}
            </span>
            <p class="bookedBy">
              Booked by: {{ timeslot.bookedBy }}</p>
            <br><button class="adminButton" v-on:click="removeTimeSlot(timeslot)">
              Delete</button>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script>
export default {
  name: 'Admin',
  components: {},
  data: () => ({
    timeslots: [],
    assistant: '',
    popup: false,
    hour: String(new Date().getHours()).padStart(2, 0),
    minute: String(new Date().getMinutes()).padStart(2, 0),
  }),
  methods: {
    changeTimeslotStatuses(data) {
      const index = this.$data.timeslots.findIndex(
        ts => Number(ts.timeslotID) === Number(data.timeslotID),
      );
      this.$data.timeslots[index].status = data.status;
      if (data.status === 2) {
        this.$data.timeslots[index].bookedBy = data.bookedBy;
      }
    },
    newTimeslot(data) {
      if (data.newTimeSlot.assistant === this.$data.assistant) {
        this.$data.timeslots.push(data.newTimeSlot);
        this.$data.timeslots = this.$data.timeslots.sort(this.compare);
      }
    },
    dropTimeslot(timeslotID) {
      const index = this.$data.timeslots.findIndex(
        ts => Number(ts.timeslotID) === Number(timeslotID),
      );
      this.$data.timeslots.splice(index, 1);
    },
    addTimeSlot() {
      fetch('/api/addTimeSlot', {
        method: 'POST',
        headers: {
          'Content-type': 'application/json',
        },
        body: JSON.stringify({
          hour: this.$data.hour,
          minute: this.$data.minute,
          assistant: this.$data.assistant,
        }),
      })
        .then((resp) => {
          if (resp.ok) {
            this.togglePopup();
            return resp.json();
          }
          throw new Error(resp.error);
        })
        .catch((err) => {
          console.error(err);
        });
    },
    removeTimeSlot(timeslot) {
      fetch('/api/removeTimeSlot', {
        method: 'POST',
        headers: {
          'Content-type': 'application/json',
        },
        body: JSON.stringify({
          id: timeslot.timeslotID,
        }),
      })
        .catch((err) => {
          console.error(err);
        });
    },
    togglePopup() {
      this.$data.popup = !this.$data.popup;
    },
    incHour(val) {
      let h = Number(this.$data.hour) + val;
      if (h === 24) {
        h = 0;
      } else if (h === -1) {
        h = 23;
      }
      this.$data.hour = String(h).padStart(2, 0);
    },
    incMinute(val) {
      let min = Number(this.$data.minute) + val;
      if (min === 60) {
        min = 0;
      } else if (min === -1) {
        min = 59;
      }
      this.$data.minute = String(min).padStart(2, 0);
    },
    logout() {
      fetch('/api/logout')
        .then((resp) => {
          if (resp.ok) {
            this.$store.commit('setIsAuthenticated', false);
            this.$router.push('/list');
          }
        })
        .catch((error) => {
          throw new Error(error);
        });
    },
    compare(ts1, ts2) {
      const ts1Hour = Number(ts1.time.substring(0, 2));
      const ts2Hour = Number(ts2.time.substring(0, 2));
      if (ts1Hour - ts2Hour !== 0) {
        return (ts1Hour - ts2Hour) / Math.abs(ts1Hour - ts2Hour);
      }
      const ts1Minute = ts1.time.substring(3);
      const ts2Minute = ts2.time.substring(3);
      if (ts1Minute - ts2Minute !== 0) {
        return (ts1Minute - ts2Minute) / Math.abs(ts1Minute - ts2Minute);
      }
      return 0;
    },
  },
  beforeCreate() {
    fetch('/api/AdminList')
      .then(res => res.json())
      .then((data) => {
        this.$data.timeslots = data.list.sort(this.compare);
        this.$data.assistant = data.displayname;
      })
      .then(() => {
        this.$root.$data.socket.on('changeTimeslotStatus', (data) => {
          this.changeTimeslotStatuses(data);
        });
      })
      .then(() => {
        this.$root.$data.socket.on('newTimeSlot', (data) => {
          this.newTimeslot(data);
        });
      })
      .then(() => {
        this.$root.$data.socket.on('removeTimeSlot', (data) => {
          this.dropTimeslot(data.removeTimeSlot);
        });
      })
      .catch(console.error);
  },
  beforeDestroy() {
    this.$root.$data.socket.off('changeTimeslotStatus');
    this.$root.$data.socket.off('newTimeSlot');
    this.$root.$data.socket.off('removeTimeSlot');
  },
};
</script>

<style scoped>
.modal {
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

.modal-content {
  background-color: #fefefe;
  margin: auto;
  padding: 20px;
  border: 1px solid #888;
  width: 50%;
  text-align: center;
  align-content: center;
}

.timeSelector {
    display: inline-grid;
    grid-template-columns: repeat(3, 1fr);
    grid-template-rows: repeat(3, 1fr);
    gap: 3px;
    font-size: 32px;
}

.valueButton {
  border-radius: 8px;
  background-color: rgb(96, 217, 221);
}

.finishButton {
  width: 250px;
  height: 30px;
  margin: 3px;
  border-radius: 8px;
  text-align: center;
}

.timeslot {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 64px;
  width: 252;
  margin: 12px;
  border: 2px solid;
}
.mainInfo {
  font-size: 24px;
}

.bookedBy {
  position: absolute;
  bottom: 0;
  right: 6px;
  font-style: italic;
}

.adminButton {
  position: absolute;
  left: 6px;
  width: 100px;
  height: 30px;
  margin: 3px;
  border-radius: 8px;
  text-align: center;
  background-color: #CFBEBE;
}
</style>
