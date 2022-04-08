import { DoublyLinkedList } from "./DoublyLinkedList.js";
import { Track } from "./Track.js";

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
}

//================ Controller ==================
class WebAudioPlayerController {
  constructor(webAudioPlayerView) {
    this.webAudioPlayerView = webAudioPlayerView;
  }

  init() {
    this.webAudioPlayerView.init();

    document
      .getElementById("files")
      .addEventListener("change", this.handleFileSelect);
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
    }

    webAudioPlayerApp.renderTable();

    const firstTrack = playList.head.value;
    webAudioPlayerApp.setTrack(firstTrack);
  }

  setTrack(track) {
    const player = document.getElementById("player");
    player.setAttribute("src", track.source);
  }

  getPlayList() {
    return playList;
  }

  renderTable() {
    this.webAudioPlayerView.renderTable();
  }
}

const webAudioPlayerView = new WebAudioPlayerView();
const webAudioPlayerApp = new WebAudioPlayerController(webAudioPlayerView);

window.onload = webAudioPlayerApp.init();
