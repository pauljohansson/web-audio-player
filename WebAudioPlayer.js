import { DoublyLinkedList } from "./DoublyLinkedList.js";
import { Track } from "./Track.js";

// ============== Model ========================
const playList = new DoublyLinkedList();

// ============== View =========================
class WebAudioPlayerView {
  init() {}
}

//================ Controller ==================
class WebAudioPlayerController {
  constructor(webAudioPlayerView) {
    this.webAudioPlayerView = webAudioPlayerView;
  }

  init() {
    this.webAudioPlayerView.init();
  }
}

const webAudioPlayerView = new WebAudioPlayerView();
const webAudioPlayerApp = new WebAudioPlayerController(webAudioPlayerView);

window.onload = webAudioPlayerApp.init();
