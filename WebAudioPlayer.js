import { DoublyLinkedList } from "./DoublyLinkedList.js";
import { Track } from "./Track.js";
import {
  convertToMinutes,
  convertToSeconds,
  setDurationsInPlayList,
} from "./HelperFunctions.js";

// ============== Model ========================
const playList = new DoublyLinkedList();

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

    document
      .getElementById("files")
      .addEventListener("change", this.handleFileSelect);

    document
      .getElementById("player")
      .addEventListener("ended", this.handleNextTrackButton);

    const stopButton = document.getElementById("stopButton");
    stopButton.onclick = this.handleStopButton;

    const playButton = document.getElementById("playButton");
    playButton.onclick = this.handlePlayButton;

    const pauseButton = document.getElementById("pauseButton");
    pauseButton.onclick = this.handlePauseButton;

    const previousTrackButton = document.getElementById("previousTrackButton");
    previousTrackButton.onclick = this.handlePreviousTrackButton;

    const nextTrackButton = document.getElementById("nextTrackButton");
    nextTrackButton.onclick = this.handleNextTrackButton;
  }

  handleFileSelect(e) {
    if (e.target.files.length === 0) return null;

    const files = e.target.files;

    for (let i = 0; i < files.length; i++) {
      const trackNumber = i + 1;
      const fileName = files[i].name;
      const source = URL.createObjectURL(files[i]);
      //duration is null because we don't know it yet; it will be set later
      const track = new Track(trackNumber, fileName, null, source);
      playList.appendElement(track);

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

    webAudioPlayerApp.setTrack(nextTrack);
    webAudioPlayerApp.setIndexOfCurrentTrack(nextIndex);
    webAudioPlayerApp.selectTrackInTable(nextTrackNumber);

    player.play();
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

  renderTable() {
    this.webAudioPlayerView.renderTable();
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
