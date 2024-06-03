//親コントローラーをimportする事で共通の設定や関数をまとめている
import ApplicationController from "./application_controller";

// ↓これは元々記述されているコメントで、View側でタグにこの記述を埋めるとこのコントローラーとつながるよという内容
// Connects to data-controller="google-map--show"
export default class extends ApplicationController {
  // View側の、data-google-map--show-target="map" のついたDOM を mapTarget として登録
  static targets = [ 'map' ]
  // Viewが繋がったときに実行される関数
  connect() {
    // newMap()の呼び出し
    this.newMap()
  }
  // 地図を表示させる関数
  newMap() {
    // 親コントローラーにある関数、 setLoader()の呼び出し。
    const loader = this.setLoader()
    // async wait を使ってGoogleMapのライブラリが読み込まれるまで待つ。
    loader.load().then(async () => {
      // 読み込みを待つとMapコンストラクターが使えるように。
      const { Map } = await google.maps.importLibrary("maps");
      // this.mapTarget.dataset.json　で埋め込んだデーターを取り出し、Jsonに変換。
      this._location = JSON.parse(this.mapTarget.dataset.json)
      // new Map で新しく地図を作成　座標と縮尺を設定。
      this._map = new Map(this.mapTarget, {
        center: { lat: this._location.lat, lng: this._location.lng },
        zoom: 15,
      })
      // マーカー設置。先程作った this._map　に 座標 this._location を指定する事でピンを刺す 。
      new google.maps.Marker({
        map: this._map,
        position: this._location
      })
    })
  }
}