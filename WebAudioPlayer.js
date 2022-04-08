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
  }

  getPlayList() {
    return playList;
  }
}

const webAudioPlayerView = new WebAudioPlayerView();
const webAudioPlayerApp = new WebAudioPlayerController(webAudioPlayerView);

window.onload = webAudioPlayerApp.init();
