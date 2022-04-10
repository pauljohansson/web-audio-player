import { DoublyLinkedList } from "./DoublyLinkedList.js";
import { Track } from "./Track.js";
import {
  convertToMinutes,
  convertToSeconds,
  setDurationsInPlayList,
} from "./HelperFunctions.js";

// ============== Model ========================
//save original playlist in order to more easily turn off shuffle
const originalPlayList = new DoublyLinkedList();
var playList = originalPlayList;

// ============== View =========================
class WebAudioPlayerView {
  init() {
    this.renderTable();
  }

  renderTable() {
    const playList = webAudioPlayerApp.getPlayList();
    const playListTable = document.getElementById("playListTable");

    for (let i = 0; i < playList.length; i++) {
      const newRow = playListTable.insertRow(i + 1);
      const trackCell = newRow.insertCell(0);
      const fileNameCell = newRow.insertCell(1);
      const durationCell = newRow.insertCell(2);

      trackCell.setAttribute("class", "rightAlignText");
      durationCell.setAttribute("id", `dur${i + 1}`);
      durationCell.setAttribute("class", "rightAlignText");

      trackCell.textContent = playList.getElementAtIndex(i).value.trackNumber;
      fileNameCell.textContent = playList.getElementAtIndex(i).value.fileName;
      durationCell.textContent = playList.getElementAtIndex(i).value.duration;

      newRow.setAttribute("id", i + 1);
    }
  }

  clearPlayListTable() {
    const playListTable = document.getElementById("playListTable");

    while (playListTable.firstChild) playListTable.firstChild.remove();

    //rebuild table header
    const newRow = playListTable.insertRow(0);
    newRow.insertCell(0).outerHTML = "<th>Track</th>";
    newRow.insertCell(1).outerHTML = "<th>Filename</th>";
    newRow.insertCell(2).outerHTML = "<th>Duration</th>";
  }

  updateDurationsInTable() {
    const playList = webAudioPlayerApp.getPlayList();
    let currentNode = playList.head;
    let currentIndex = 0;

    while (currentNode) {
      const durationCell = document.getElementById(`dur${currentIndex + 1}`);
      const minutes = convertToMinutes(currentNode.value.duration);
      const seconds = convertToSeconds(currentNode.value.duration);

      durationCell.textContent = `${minutes}:${seconds}`;
      currentNode = currentNode.next;
      currentIndex++;
    }
  }

  selectTrackInTable(rowIndex) {
    const selectedRow = document.getElementById(rowIndex);
    selectedRow.setAttribute("class", "selected");
  }

  removeSelectionInTable(rowIndex) {
    const selectedRow = document.getElementById(rowIndex);
    selectedRow.removeAttribute("class");
  }
}

//================ Controller ==================
class WebAudioPlayerController {
  constructor(webAudioPlayerView) {
    this.webAudioPlayerView = webAudioPlayerView;
  }

  init() {
    this.webAudioPlayerView.init();

    this.indexOfCurrentTrack = 0;
    this.repeatState = "noRepeat";
    this.shuffle = false;

    document
      .getElementById("files")
      .addEventListener("change", this.handleFileSelect.bind(this));

    document
      .getElementById("player")
      .addEventListener("ended", this.handleNextTrackButton.bind(this));

    const stopButton = document.getElementById("stopButton");
    stopButton.onclick = this.handleStopButton.bind(this);

    const playButton = document.getElementById("playButton");
    playButton.onclick = this.handlePlayButton.bind(this);

    const pauseButton = document.getElementById("pauseButton");
    pauseButton.onclick = this.handlePauseButton;

    const previousTrackButton = document.getElementById("previousTrackButton");
    previousTrackButton.onclick = this.handlePreviousTrackButton.bind(this);

    const nextTrackButton = document.getElementById("nextTrackButton");
    nextTrackButton.onclick = this.handleNextTrackButton.bind(this);

    const repeatButton = document.getElementById("repeatButton");
    repeatButton.onclick = this.handleRepeatButton.bind(this);

    const shuffleButton = document.getElementById("shuffleButton");
    shuffleButton.onclick = this.handleShuffleButton.bind(this);
  }

  handleFileSelect(e) {
    if (e.target.files.length === 0) return null;

    //turn off shuffle when opening new audio files to not run into errors
    if (webAudioPlayerApp.isShuffle()) webAudioPlayerApp.handleShuffleButton();

    if (playList.head !== null) {
      playList.removeAllElements();
      webAudioPlayerApp.clearPlayListTable();
    }

    const files = e.target.files;

    for (let i = 0; i < files.length; i++) {
      const trackNumber = i + 1;
      const fileName = files[i].name;
      const source = URL.createObjectURL(files[i]);
      //duration is null because we don't know it yet; it will be set later
      const track = new Track(trackNumber, fileName, null, source);
      originalPlayList.appendElement(track);

      //sets duration for each track in the playlist; has to be done asynchronously
      setDurationsInPlayList(playList, source, i);
    }

    webAudioPlayerApp.renderTable();

    //probably better with async and await
    setTimeout(function () {
      webAudioPlayerApp.updateDurationsInTable();
    }, 1000);

    const firstTrack = playList.head.value;
    webAudioPlayerApp.setTrack(firstTrack);
    webAudioPlayerApp.setIndexOfCurrentTrack(0);
  }

  handleStopButton() {
    const player = document.getElementById("player");
    const indexOfCurrentTrack = webAudioPlayerApp.getIndexOfCurrentTrack();
    const currentTrackNumber =
      playList.getElementAtIndex(indexOfCurrentTrack).value.trackNumber;

    webAudioPlayerApp.removeSelectionInTable(currentTrackNumber);

    player.pause();
    player.currentTime = 0;
  }

  handlePlayButton() {
    const player = document.getElementById("player");
    const indexOfCurrentTrack = webAudioPlayerApp.getIndexOfCurrentTrack();
    const currentTrackNumber =
      playList.getElementAtIndex(indexOfCurrentTrack).value.trackNumber;

    webAudioPlayerApp.selectTrackInTable(currentTrackNumber);

    player.play();
  }

  handlePauseButton() {
    const player = document.getElementById("player");

    player.pause();
  }

  handlePreviousTrackButton() {
    const player = document.getElementById("player");
    const indexOfCurrentTrack = webAudioPlayerApp.getIndexOfCurrentTrack();
    const currentTrack = playList.getElementAtIndex(indexOfCurrentTrack);
    const currentTrackNumber = currentTrack.value.trackNumber;

    if (currentTrack.previous === null) return null;

    const previousTrackNumber = currentTrack.previous.value.trackNumber;

    webAudioPlayerApp.removeSelectionInTable(currentTrackNumber);

    const previousTrack = currentTrack.previous.value;
    let nextIndex = indexOfCurrentTrack - 1;
    const indexOfFirstTrack = 0;
    const indexOfLastTrack = playList.length - 1;

    if (playList.isCircular && indexOfCurrentTrack === indexOfFirstTrack)
      nextIndex = indexOfLastTrack;

    webAudioPlayerApp.setTrack(previousTrack);
    webAudioPlayerApp.setIndexOfCurrentTrack(nextIndex);
    webAudioPlayerApp.selectTrackInTable(previousTrackNumber);

    player.play();
  }

  handleNextTrackButton() {
    const player = document.getElementById("player");
    const indexOfCurrentTrack = webAudioPlayerApp.getIndexOfCurrentTrack();
    const currentTrack = playList.getElementAtIndex(indexOfCurrentTrack);
    const currentTrackNumber = currentTrack.value.trackNumber;

    if (currentTrack.next === null) return null;

    const nextTrackNumber = currentTrack.next.value.trackNumber;

    webAudioPlayerApp.removeSelectionInTable(currentTrackNumber);

    const nextTrack = currentTrack.next.value;
    let nextIndex = indexOfCurrentTrack + 1;
    const indexOfFirstTrack = 0;
    const indexOfLastTrack = playList.length - 1;

    if (playList.isCircular && indexOfCurrentTrack === indexOfLastTrack)
      nextIndex = indexOfFirstTrack;

    webAudioPlayerApp.setTrack(nextTrack);
    webAudioPlayerApp.setIndexOfCurrentTrack(nextIndex);
    webAudioPlayerApp.selectTrackInTable(nextTrackNumber);

    player.play();
  }

  handleRepeatButton() {
    if (playList.head === null || playList.head.value.duration === null)
      return null;

    const repeatButton = document.getElementById("repeatButton");
    const player = document.getElementById("player");
    const repeatState = webAudioPlayerApp.getRepeatState();
    const handlePlayButton = webAudioPlayerApp.handlePlayButton;
    const handleNextTrackButton = webAudioPlayerApp.handleNextTrackButton;

    if (repeatState === "noRepeat") {
      repeatButton.setAttribute("src", "icons/repeatTrack.gif");
      webAudioPlayerApp.setRepeatState("repeatTrack");
      player.removeEventListener("ended", handleNextTrackButton);
      player.addEventListener("ended", handlePlayButton);
    } else if (repeatState === "repeatTrack") {
      playList.convertToCircularDoublyLinkedList();
      repeatButton.setAttribute("src", "icons/repeatPlayList.gif");
      webAudioPlayerApp.setRepeatState("repeatPlayList");
      player.removeEventListener("ended", handlePlayButton);
      player.addEventListener("ended", handleNextTrackButton);
    } else {
      playList.revertBackToDoublyLinkedList();
      repeatButton.setAttribute("src", "icons/noRepeat.gif");
      webAudioPlayerApp.setRepeatState("noRepeat");
    }
  }

  handleShuffleButton() {
    if (playList.head === null || playList.head.value.duration === null)
      return null;

    const shuffleButton = document.getElementById("shuffleButton");
    const indexOfCurrentTrack = webAudioPlayerApp.getIndexOfCurrentTrack();
    const currentTrack = playList.getElementAtIndex(indexOfCurrentTrack);
    const currentTrackNumber = currentTrack.value.trackNumber;

    webAudioPlayerApp.removeSelectionInTable(currentTrackNumber);

    if (!webAudioPlayerApp.isShuffle()) {
      webAudioPlayerApp.setShuffle(true);
      webAudioPlayerApp.shuffleTracks();
      shuffleButton.setAttribute("src", "icons/shuffle.gif");
    } else {
      webAudioPlayerApp.setShuffle(false);
      webAudioPlayerApp.unShuffleTracks();
      shuffleButton.setAttribute("src", "icons/noShuffle.gif");
    }
  }

  shuffleTracks() {
    const shuffledPlayList = new DoublyLinkedList();
    let savedIndicies = [];

    for (let i = 0; i < playList.length; i++) savedIndicies.push(i);

    for (let i = 0; i < playList.length; i++) {
      const randomIndex = Math.floor(Math.random() * savedIndicies.length);
      const usedIndex = savedIndicies[randomIndex];
      savedIndicies.splice(savedIndicies.indexOf(usedIndex), 1);
      const randomTrack = playList.getElementAtIndex(usedIndex).value;
      shuffledPlayList.appendElement(randomTrack);
    }

    playList = shuffledPlayList;
    const firstTrack = playList.head.value;
    webAudioPlayerApp.setTrack(firstTrack);
    webAudioPlayerApp.setIndexOfCurrentTrack(0);

    if (webAudioPlayerApp.getRepeatState() === "repeatPlayList")
      playList.convertToCircularDoublyLinkedList();
  }

  unShuffleTracks() {
    playList = originalPlayList;
    const firstTrack = playList.head.value;
    webAudioPlayerApp.setTrack(firstTrack);
    webAudioPlayerApp.setIndexOfCurrentTrack(0);

    if (webAudioPlayerApp.getRepeatState() === "repeatPlayList")
      playList.convertToCircularDoublyLinkedList();
  }

  setTrack(track) {
    const player = document.getElementById("player");
    player.setAttribute("src", track.source);
  }

  getPlayList() {
    return playList;
  }

  getIndexOfCurrentTrack() {
    return this.indexOfCurrentTrack;
  }

  setIndexOfCurrentTrack(index) {
    this.indexOfCurrentTrack = index;
  }

  getRepeatState() {
    return this.repeatState;
  }

  setRepeatState(state) {
    if (state === "repeatTrack" || state === "repeatPlayList")
      this.repeatState = state;
    else this.repeatState = "noRepeat";
  }

  isShuffle() {
    return this.shuffle;
  }

  setShuffle(boolean) {
    if (typeof boolean !== "boolean") return null;
    this.shuffle = boolean;
  }

  renderTable() {
    this.webAudioPlayerView.renderTable();
  }

  clearPlayListTable() {
    this.webAudioPlayerView.clearPlayListTable();
  }

  updateDurationsInTable() {
    this.webAudioPlayerView.updateDurationsInTable();
  }

  selectTrackInTable(rowIndex) {
    this.webAudioPlayerView.selectTrackInTable(rowIndex);
  }

  removeSelectionInTable(rowIndex) {
    this.webAudioPlayerView.removeSelectionInTable(rowIndex);
  }
}

const webAudioPlayerView = new WebAudioPlayerView();
const webAudioPlayerApp = new WebAudioPlayerController(webAudioPlayerView);

window.onload = webAudioPlayerApp.init();
