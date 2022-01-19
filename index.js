// Accurate_Interval.js
// Thanks Squeege! For the elegant answer provided to this question:
// http://stackoverflow.com/questions/8173580/setinterval-timing-slowly-drifts-away-from-staying-accurate
// Github: https://gist.github.com/Squeegy/1d99b3cd81d610ac7351
// Slightly modified to accept 'normal' interval/timeout format (func, time).

const accurateInterval = function (fn, time) {
  var cancel, nextAt, timeout, wrapper;
  nextAt = new Date().getTime() + time;
  timeout = null;
  wrapper = function () {
    nextAt += time;
    timeout = setTimeout(wrapper, nextAt - new Date().getTime());
    return fn();
  };
  cancel = function () {
    return clearTimeout(timeout);
  };
  timeout = setTimeout(wrapper, nextAt - new Date().getTime());
  return {
    cancel: cancel,
  };
};

const items = [
  {
    title: "Break",
    id: "break-label",
    btnDecId: "break-decrement",
    btnIncId: "break-increment",
    strId: "break-length",
  },
  {
    title: "Session",
    id: "session-label",
    btnDecId: "session-decrement",
    btnIncId: "session-increment",
    strId: "session-length",
  },
  {
    lblId: "timer-label",
    txtLeftId: "time-left",
    btnStartId: "start_stop",
    btnResetid: "reset",
  },
];

class Presentational extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      sTime: 25,
      bTime: 5,
      timer: 1500,
      intervalID: "",
      timeLeft: "25:00",
      sStatus: "Session",
      isRunning: 0,
      sndTime: 0,
      items: items,
    };
    this.updateSessionTime = this.updateSessionTime.bind(this);
    this.updateBreakTime = this.updateBreakTime.bind(this);
    this.resetStates = this.resetStates.bind(this);
    this.beginCountDown = this.beginCountDown.bind(this);
    this.decrementTimer = this.decrementTimer.bind(this);
    this.formatTimeText = this.formatTimeText.bind(this);
  }

  formatTimeText(time) {
    let minutes = "";
    let seconds = "";
    if (("" + Math.floor(time / 60)).length === 1) {
      minutes = "0" + Math.floor(time / 60);
    } else {
      minutes = "" + Math.floor(time / 60);
    }

    if (("" + (time % 60)).length === 1) {
      seconds = "0" + (time % 60);
    } else {
      seconds = "" + (time % 60);
    }
    return minutes + ":" + seconds;
  }

  //Add functionality when timer reaches 0
  decrementTimer() {
    if (this.state.timer > 0) {
      this.setState({
        timer: this.state.timer - 1,
        timeLeft: this.formatTimeText(this.state.timer - 1),
      });
    } else {
      this.endAudio.play();
      if (this.state.sStatus === "Session") {
        this.state.intervalID.cancel();
        this.setState({
          sStatus: "Break",
          timer: this.state.bTime * 60,
          isRunning: 0,
          timeLeft: this.formatTimeText(this.state.bTime * 60),
        });
        this.beginCountDown();
      } else {
        this.state.intervalID.cancel();
        this.setState({
          sStatus: "Session",
          timer: this.state.sTime * 60,
          isRunning: 0,
          timeLeft: this.formatTimeText(this.state.sTime * 60),
        });
        this.beginCountDown();
      }
    }
  }

  beginCountDown() {
    if (this.state.isRunning === 1) {
      document.getElementById("start_stop").innerHTML = "Start ▷";
      document.querySelector(".mainContainer").style.boxShadow =
        getComputedStyle(document.documentElement).getPropertyValue(
          "--neutralShadow"
        );
      document.querySelector(".timeLabel").style.color = getComputedStyle(
        document.documentElement
      ).getPropertyValue("--color-neutral");
      document.querySelector(".stateTitle").style.color = getComputedStyle(
        document.documentElement
      ).getPropertyValue("--color-neutral");

      this.state.intervalID.cancel();
      this.setState({
        isRunning: 0,
      });
    } else {
      if (this.state.sStatus === "Session") {
        document.querySelector(".mainContainer").style.boxShadow =
          getComputedStyle(document.documentElement).getPropertyValue(
            "--sessionShadow"
          );
        document.querySelector(".timeLabel").style.color = getComputedStyle(
          document.documentElement
        ).getPropertyValue("--color-session");
        document.querySelector(".stateTitle").style.color = getComputedStyle(
          document.documentElement
        ).getPropertyValue("--color-session");
        document.getElementById("start_stop").innerHTML = "Stop  ⃞  &#8298;";
      } else {
        document.querySelector(".mainContainer").style.boxShadow =
          getComputedStyle(document.documentElement).getPropertyValue(
            "--breakShadow"
          );
        document.querySelector(".timeLabel").style.color = getComputedStyle(
          document.documentElement
        ).getPropertyValue("--color-break");
        document.querySelector(".stateTitle").style.color = getComputedStyle(
          document.documentElement
        ).getPropertyValue("--color-break");
        document.getElementById("start_stop").innerHTML = "Stop  ⃞  &#8298;";
      }

      this.setState({
        isRunning: 1,
        intervalID: accurateInterval(() => {
          this.decrementTimer();
        }, 1000),
      });
    }
  }

  resetStates() {
    document.getElementById("start_stop").innerHTML = "Start ▷";
    document.querySelector(".mainContainer").style.boxShadow = getComputedStyle(
      document.documentElement
    ).getPropertyValue("--neutralShadow");
    document.querySelector(".timeLabel").style.color = getComputedStyle(
      document.documentElement
    ).getPropertyValue("--color-neutral");
    document.querySelector(".stateTitle").style.color = getComputedStyle(
      document.documentElement
    ).getPropertyValue("--color-neutral");
    if (this.state.intervalID !== "") {
      this.state.intervalID.cancel();
    }
    this.setState({
      intervalID: "",
      sTime: 25,
      isRunning: 0,
      timer: 1500,
      bTime: 5,
      timeLeft: this.formatTimeText(1500),
      sStatus: "Session",
    });
    this.endAudio.pause();
    this.endAudio.currentTime = 0;
  }

  updateBreakTime(e) {
    if (this.state.isRunning === 1) {
      return;
    }
    if ((e < 0 && this.state.bTime > 1) || (e > 0 && this.state.bTime < 60)) {
      if (this.state.sStatus === "Break") {
        this.setState({
          bTime: this.state.bTime + e,
          timer: (this.state.bTime + e) * 60,
          timeLeft: this.formatTimeText((this.state.bTime + e) * 60),
        });
      } else {
        this.setState({
          bTime: this.state.bTime + e,
        });
      }
    }
  }

  updateSessionTime(e) {
    if (this.state.isRunning === 1) {
      return;
    }
    if ((e < 0 && this.state.sTime > 1) || (e > 0 && this.state.sTime < 60)) {
      if (this.state.sStatus === "Session") {
        this.setState({
          sTime: this.state.sTime + e,
          timer: (this.state.sTime + e) * 60,
          timeLeft: this.formatTimeText((this.state.sTime + e) * 60),
        });
      } else {
        this.setState({
          sTime: this.state.sTime + e,
        });
      }
    }
  }

  render() {
    return (
      <div className="mainContainer">
        <ButtonsContainer
          sUpdate={this.updateSessionTime}
          bUpdate={this.updateBreakTime}
          sTime={this.state.sTime}
          bTime={this.state.bTime}
          sItems={this.state.items[1]}
          bItems={this.state.items[0]}
        />
        <SessionContainer
          items={this.state.items[2]}
          begin={this.beginCountDown}
          timeLeft={this.state.timeLeft}
          resetStates={this.resetStates}
          lblTitle={this.state.sStatus}
        />
        <audio
          id="beep"
          preload="auto"
          ref={(audio) => {
            this.endAudio = audio;
          }}
          src="https://assets.mixkit.co/sfx/preview/mixkit-classic-alarm-995.mp3"
        />
      </div>
    );
  }
}

const ButtonsContainer = (props) => {
  return (
    <div className="controls">
      <Buttons
        update={props.sUpdate}
        title={props.sItems.title}
        time={props.sTime}
        id={props.sItems.id}
        btnDecId={props.sItems.btnDecId}
        btnIncId={props.sItems.btnIncId}
        strId={props.sItems.strId}
      />
      <Buttons
        update={props.bUpdate}
        title={props.bItems.title}
        time={props.bTime}
        id={props.bItems.id}
        btnDecId={props.bItems.btnDecId}
        btnIncId={props.bItems.btnIncId}
        strId={props.bItems.strId}
      />
    </div>
  );
};

const Buttons = (props) => {
  return (
    <div>
      <p id={props.id}>{props.strId}</p>
      <div className="btns">
        <button id={props.btnDecId} onClick={() => props.update(-1)}>
          -
        </button>
        <p id={props.strId}>{props.time}</p>
        <button id={props.btnIncId} onClick={() => props.update(1)}>
          +
        </button>
      </div>
    </div>
  );
};

const SessionContainer = (props) => {
  return (
    <div className="sessionContainer">
      <p id={props.items.lblId} className="stateTitle">
        {props.lblTitle}
      </p>
      <p id={props.items.txtLeftId} className="timeLabel">
        {props.timeLeft}
      </p>

      <div className="btns">
        <button id={props.items.btnStartId} onClick={props.begin}>
          Start ▷
        </button>
        <button id={props.items.btnResetid} onClick={props.resetStates}>
          {props.items.btnResetid}
        </button>
      </div>
    </div>
  );
};

ReactDOM.render(<Presentational />, document.getElementById("App"));
