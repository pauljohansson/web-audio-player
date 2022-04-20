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
    newRow.setAttribute("id", 0);
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

    this.stopButton = document.getElementById("stopButton");
    this.stopButton.onclick = this.handleStopButton.bind(this);

    this.playButton = document.getElementById("playButton");
    this.playButton.onclick = this.handlePlayButton.bind(this);

    this.pauseButton = document.getElementById("pauseButton");
    this.pauseButton.onclick = this.handlePauseButton;

    this.previousTrackButton = document.getElementById("previousTrackButton");
    this.previousTrackButton.onclick =
      this.handlePreviousTrackButton.bind(this);

    this.nextTrackButton = document.getElementById("nextTrackButton");
    this.nextTrackButton.onclick = this.handleNextTrackButton.bind(this);

    this.repeatButton = document.getElementById("repeatButton");
    this.repeatButton.onclick = this.handleRepeatButton.bind(this);

    this.shuffleButton = document.getElementById("shuffleButton");
    this.shuffleButton.onclick = this.handleShuffleButton.bind(this);

    document
      .getElementById("files")
      .addEventListener("change", this.handleFileSelect.bind(this));

    document
      .getElementById("player")
      .addEventListener("ended", this.nextTrackButton.onclick);

    document
      .getElementById("playListTable")
      .addEventListener("click", this.handleClickInTable.bind(this));
  }

  handleFileSelect(e) {
    if (e.target.files.length === 0) return null;

    //turn off shuffle when opening new audio files to not run into errors
    if (this.isShuffle()) this.handleShuffleButton();

    if (playList.head !== null) {
      playList.removeAllElements();
      this.webAudioPlayerView.clearPlayListTable();
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

    this.webAudioPlayerView.renderTable();

    //probably better with async and await
    setTimeout(() => {
      this.webAudioPlayerView.updateDurationsInTable();
    }, 1000);

    const firstTrack = playList.head.value;
    this.setTrack(firstTrack);
    this.setIndexOfCurrentTrack(0);
  }

  handleStopButton() {
    if (playList.head === null) return null;

    const player = document.getElementById("player");
    const indexOfCurrentTrack = this.getIndexOfCurrentTrack();
    const currentTrackNumber =
      playList.getElementAtIndex(indexOfCurrentTrack).value.trackNumber;

    this.webAudioPlayerView.removeSelectionInTable(currentTrackNumber);

    player.pause();
    player.currentTime = 0;
  }

  handlePlayButton() {
    if (playList.head === null) return null;

    const player = document.getElementById("player");
    const indexOfCurrentTrack = this.getIndexOfCurrentTrack();
    const currentTrackNumber =
      playList.getElementAtIndex(indexOfCurrentTrack).value.trackNumber;

    this.webAudioPlayerView.selectTrackInTable(currentTrackNumber);

    player.play();
  }

  handlePauseButton() {
    const player = document.getElementById("player");

    player.pause();
  }

  handlePreviousTrackButton() {
    if (playList.head === null) return null;

    const player = document.getElementById("player");
    const indexOfCurrentTrack = this.getIndexOfCurrentTrack();
    const currentTrack = playList.getElementAtIndex(indexOfCurrentTrack);
    const currentTrackNumber = currentTrack.value.trackNumber;

    if (currentTrack.previous === null) return null;

    const previousTrackNumber = currentTrack.previous.value.trackNumber;

    this.webAudioPlayerView.removeSelectionInTable(currentTrackNumber);

    const previousTrack = currentTrack.previous.value;
    let nextIndex = indexOfCurrentTrack - 1;
    const indexOfFirstTrack = 0;
    const indexOfLastTrack = playList.length - 1;

    if (playList.isCircular && indexOfCurrentTrack === indexOfFirstTrack)
      nextIndex = indexOfLastTrack;

    this.setTrack(previousTrack);
    this.setIndexOfCurrentTrack(nextIndex);
    this.webAudioPlayerView.selectTrackInTable(previousTrackNumber);

    player.play();
  }

  handleNextTrackButton() {
    if (playList.head === null) return null;

    const player = document.getElementById("player");
    const indexOfCurrentTrack = this.getIndexOfCurrentTrack();
    const currentTrack = playList.getElementAtIndex(indexOfCurrentTrack);
    const currentTrackNumber = currentTrack.value.trackNumber;

    if (currentTrack.next === null) return null;

    const nextTrackNumber = currentTrack.next.value.trackNumber;

    this.webAudioPlayerView.removeSelectionInTable(currentTrackNumber);

    const nextTrack = currentTrack.next.value;
    let nextIndex = indexOfCurrentTrack + 1;
    const indexOfFirstTrack = 0;
    const indexOfLastTrack = playList.length - 1;

    if (playList.isCircular && indexOfCurrentTrack === indexOfLastTrack)
      nextIndex = indexOfFirstTrack;

    this.setTrack(nextTrack);
    this.setIndexOfCurrentTrack(nextIndex);
    this.webAudioPlayerView.selectTrackInTable(nextTrackNumber);

    player.play();
  }

  handleRepeatButton() {
    if (playList.head === null || playList.head.value.duration === null)
      return null;

    const repeatButton = document.getElementById("repeatButton");
    const player = document.getElementById("player");

    if (this.getRepeatState() === "noRepeat") {
      repeatButton.setAttribute("src", "icons/repeatTrack.gif");
      this.setRepeatState("repeatTrack");
      player.removeEventListener("ended", this.nextTrackButton.onclick);
      player.addEventListener("ended", this.playButton.onclick);
    } else if (this.getRepeatState() === "repeatTrack") {
      playList.convertToCircularDoublyLinkedList();
      repeatButton.setAttribute("src", "icons/repeatPlayList.gif");
      this.setRepeatState("repeatPlayList");
      player.removeEventListener("ended", this.playButton.onclick);
      player.addEventListener("ended", this.nextTrackButton.onclick);
    } else {
      playList.revertBackToDoublyLinkedList();
      repeatButton.setAttribute("src", "icons/noRepeat.gif");
      this.setRepeatState("noRepeat");
    }
  }

  handleShuffleButton() {
    if (playList.head === null || playList.head.value.duration === null)
      return null;

    const shuffleButton = document.getElementById("shuffleButton");
    const indexOfCurrentTrack = this.getIndexOfCurrentTrack();
    const currentTrack = playList.getElementAtIndex(indexOfCurrentTrack);
    const currentTrackNumber = currentTrack.value.trackNumber;

    this.webAudioPlayerView.removeSelectionInTable(currentTrackNumber);

    if (!this.isShuffle()) {
      this.setShuffle(true);
      this.shuffleTracks();
      shuffleButton.setAttribute("src", "icons/shuffle.gif");
    } else {
      this.setShuffle(false);
      this.unShuffleTracks();
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
    this.setTrack(firstTrack);
    this.setIndexOfCurrentTrack(0);

    if (this.getRepeatState() === "repeatPlayList")
      playList.convertToCircularDoublyLinkedList();
  }

  unShuffleTracks() {
    playList = originalPlayList;
    const firstTrack = playList.head.value;
    this.setTrack(firstTrack);
    this.setIndexOfCurrentTrack(0);

    if (this.getRepeatState() === "repeatPlayList")
      playList.convertToCircularDoublyLinkedList();
  }

  handleClickInTable(e) {
    const rowId = e.target.closest("tr").getAttribute("id");

    if (rowId == 0) return null;

    const indexOfCurrentTrack = this.getIndexOfCurrentTrack();
    const currentTrack = playList.getElementAtIndex(indexOfCurrentTrack);
    const currentTrackNumber = currentTrack.value.trackNumber;

    this.webAudioPlayerView.removeSelectionInTable(currentTrackNumber);

    const indexOfChosenTrack = this.getIndexByTrackNumber(rowId);
    const chosenTrack = playList.getElementAtIndex(indexOfChosenTrack).value;

    this.setTrack(chosenTrack);
    this.setIndexOfCurrentTrack(indexOfChosenTrack);
    this.handlePlayButton();
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

  getIndexByTrackNumber(trackNumber) {
    let currentNode = playList.head;

    while (currentNode) {
      if (currentNode.value.trackNumber == trackNumber)
        return playList.getIndexOfElement(currentNode.value);

      currentNode = currentNode.next;
    }
  }

  isShuffle() {
    return this.shuffle;
  }

  setShuffle(boolean) {
    if (typeof boolean !== "boolean") return null;
    this.shuffle = boolean;
  }
}

const webAudioPlayerView = new WebAudioPlayerView();
const webAudioPlayerApp = new WebAudioPlayerController(webAudioPlayerView);

window.onload = webAudioPlayerApp.init();
