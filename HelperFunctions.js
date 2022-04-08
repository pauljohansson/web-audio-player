// helper function from https://stackoverflow.com/questions/4091183/html5-load-audio-time-metadata-but-not-audio
// changed slightly to fit my needs
export const setDurationsInPlayList = (playList, audioSource, index) => {
  return new Promise(function (resolve) {
    var audio = new Audio();

    audio.onloadedmetadata = function () {
      resolve(audio);
    };

    audio.preload = "metadata";
    audio.src = audioSource;

    setTimeout(function () {
      playList.getElementAtIndex(index).value.duration = audio.duration;
    }, 1000);
  });
};

export const convertToMinutes = (trackDuration) => {
  let minutes = Math.floor(trackDuration / 60);
  if (minutes < 10) {
    minutes = `0${minutes}`;
  }
  return minutes;
};

export const convertToSeconds = (trackDuration) => {
  let seconds = Math.floor(trackDuration % 60);
  if (seconds < 10) {
    seconds = `0${seconds}`;
  }
  return seconds;
};
