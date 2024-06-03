import ApplicationController from "./application_controller";

// ファイル内でグローバルに使いたい変数。
let map
let markers = []
let infoWindows = []

// Connects to data-controller="google-map--index"
export default class extends ApplicationController {
  // ステートとして管理したい変数を設定。デフォルト値も先に入れておく。
  // locationのように階層化されたデーターはgetは出来るが下層データーを個別にsetできない。
  // pointsのような配列データーも１件ずつの登録変更削除はできず、配列そのものを再代入しかできない。
  static values = { location: {
                        lat: 38.041184121,
                        lng: 137.1063077823
                    },
                    zoom: 5,
                    points: [] }

  //　使うDomを変数に登録。 this.mapTarget で呼び出し。
  static targets = [ 'map' ]

  // 読み込み時に実行する関数。
  connect() {
    this.setPoints()
    this.newMap()
  }

  newMap() {
    const loader = this.setLoader()
    loader.load().then(async () => {
      const { Map } = await google.maps.importLibrary("maps");
      // 地図を statis values の情報から作成
      map = new Map(this.mapTarget, {
        center: this.locationValue,
        zoom: this.zoomValue,
      })
      // 地図に全マーカーをセット
      this.addMarkersToMap()
    })
  }

  // ###地図にピンを追加する

  addMarkersToMap() {
    // 全ポイントをループで１件ずつ処理
    this.pointsValue.forEach((o, i) => {
      // markers　に 座標データー１件を追加
      this.addMarkerToMarkers(o)
      // infoWindowｓ に 吹き出しデーターを１件追加
      this.addInfoWindowToInfoWindows(o)
      // マーカーに該当する吹き出しを開くクリックイベントを追加
      this.addEventToMarker(i)
    })
  }

  addMarkerToMarkers(o) {
    // 引数の値からマーカーを１件作成
    this._marker = new google.maps.Marker({
      position: { lat: o.lat, lng: o.lng },
      map,
      name: o.name
    })
    // markersに１件マーカーを追加
    markers.push(this._marker)
  }

  addInfoWindowToInfoWindows(o) {
    // 引数の値から吹き出しを１件作成
    // 吹き出しの中にはpoints/:idへのリンク
    // リンクには data-turbolinks="false" でリロードさせるとJS側のワーニングが出ない。
    this._infoWindow = new google.maps.InfoWindow({
      content: `
        <a href="/points/${o.id}" data-turbolinks="false">
          ${o.name}
        </a>
      `
    })
    // infoWindowに1件吹き出しを追加
    infoWindows.push(this._infoWindow)
  }

  addEventToMarker(i) {
    // i番目のマーカーにクリックイベントを追加
    markers[i].addListener('click', () => {
      // 同じインデックス番号iを吹き出しを開く
      infoWindows[i].open(map, markers[i]);
    });
  }

  // ###Valuesの値操作

  // DBに登録されているPoint全件をValuesに追加し、デフォルトの座標も更新
  setPoints() {
    this.pointsValue = JSON.parse(this.mapTarget.dataset.json)
    this.getLastPointLocation()
  }

  // 最後に登録されたデーターの緯度経度をデフォルトの値としてリセット
  getLastPointLocation() {
    // pointsValue に登録されているポイントの要素がある場合のみ
    if (this.pointsValue.length > 0) {
      // 要素をid順に並び替えたときの最後の要素を取得し
      this._lastPoint = this.pointsValue.sort((a, b) => { a.id - b.id }).reverse()[0]
      // locationValueにポイントを登録
      this.locationValue = this._lastPoint
      // ズームは適当だが、データーが無い時より拡大気味に
      this.zoomValue = 12
    }
  }
}