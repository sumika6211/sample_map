import ApplicationController from "./application_controller";

// ファイル内でグローバルに使いたい変数
let map
let marker

// Connects to data-controller="google-map--form"
export default class extends ApplicationController {

  // addressListValueに今回の入力補助の住所データーを格納する
  static values = { location: {
                      lat: 35.6895014,
                      lng: 139.6917337
                    },
                    zoom: 15,
                    addressList: [] }

  static targets = [ 'map', 'keyword', `address`,
                     'latitude', 'longitude', 'addressList' ]

  connect() {
    this.newMap()
  }

  newMap() {
    const loader = this.setLoader()
    loader.load().then(async () => {
      const { Map } = await google.maps.importLibrary("maps");
      map = new Map(this.mapTarget, {
        center: this.Value,
        zoom: this.zoomValue,
      })
      // フォームに緯度経度の情報があれば、locationValue　の値と、地図の座標を更新
      this.initMarker()
      // 更新された情報で地図の中心を更新（setCenterはgooglemapの組み込み関数）
      map.setCenter(this.locationValue)
      // Stimulusのイベントを使うと `loader` のスコープ外となるので、async内に普通にJSのイベントを書く
      this.keywordTarget.addEventListener('change', () => {
        // 検索キーワードが変更されたらchangeKeywordAction()を実行
        this.changeKeywordAction()
      })
      google.maps.event.addListener(map, 'click', (e) => {
        // 地図がクリックされたらclickMapAction(イベントの戻り値)を実行
        this.clickMapAction(e)
      });
    })
  }

  changeKeywordAction() {
    // this.keywordTarget.value でkeywordフォームの値を取得
    // 取得したキーワードからジオコーディングする
    this.geoCoding(this.keywordTarget.value)
  }

  clickMapAction(e) {
    // 引数から取得できる緯度経度の情報を取り出す
    // lat()　lng()　と関数になっているので()が要るため注意
    this._location = { lat: e.latLng.lat(), lng: e.latLng.lng() }
    // 古いマーカーを削除
    this.clearMarker()
    // 緯度経度の情報を更新
    this.setLocation(this._location)
    // マーカーのセット
    this.newMarker()
    // キーワードフォームをクリア
    this.keywordTarget.value = ""
    // 緯度経度から住所を取り出す
    this.reverseGeoGoding()
  }

  geoCoding(keyword) {
    // ジオコーダーのコンストラクターを呼び出す
    this._geocoder = new google.maps.Geocoder()
    // キーワードで緯度経度を検索
    this._geocoder.geocode({ address: keyword }, (results, status) => {
      // 住所が見つかった場合の処理
      if (status == 'OK') {
        // 結果の緯度経度情報部分を取得
        this._result = results[0].geometry.location
        // 緯度経度情報をmap側で使えるように変換
        this._location = { lat: this._result.lat(), lng: this._result.lng() }
        // 古いマーカーを削除
        this.clearMarker()
        // 緯度経度の情報を更新
        this.setLocation(this._location)
        // マーカーのセット
        this.newMarker()
        // 更新された情報で地図の中心を更新
        map.setCenter(this._location)
        // 逆ジオコーディングで住所データーを取得
        this.reverseGeoGoding()
      } else {
        // 駄目だったら緯度経度フォームをクリア
        this.clearLocationForm()
      }
    })
  }

  reverseGeoGoding() {
    // ジオコーダーのコンストラクターを呼び出す
    this._geocoder = new google.maps.Geocoder()
    // 緯度経度から住所を検索
    this._geocoder.geocode({ location: this.locationValue }, (results, status) => {
      if (status == 'OK') {
        // 該当があれば datalist に住所情報を用意する
        this.setAddresList(results)
      } else {
        // なければ datalist はクリアする
        this.clearAddressList()
      }
    })
    // アドレスフォームはクリアする
    this.addressTarget.value = ""
  }

  clearAddressList() {
    // addressListValue　を空配列に戻し
    this.addressListValue = []
    // datalist 内も空にする
    this.addressListTarget.innerHTML = ""
  }

  setAddresList(result) {
    // 古い住所情報を削除
    this.clearAddressList()
    // 新しい住所情報を addressListValue　にセット
    this.setAddressListValue(result)
    // セットした情報を `option` タグに変換し `datalist` に加える
    this.addressListValue.forEach(address => {
      this._option = document.createElement('option')
      this._option.value = address
      this.addressListTarget.append(this._option)
    })
  }

  setAddressListValue(result) {
    // ローカル変数に空配列を用意しておき
    this._addressList = []
    // 住所候補を１件ずつ追加
    result.forEach(o => {
      this._address = o.formatted_address
      this._addressList.push(this._address)
    });
    // addressListValue を更新（static values は要素個別の追加ができないため一気に）
    this.addressListValue = this._addressList
  }

  clearMarker() {
    // マーカーがnullだとコンストラクターがないため、setMap()が使えない為の条件式
    if (marker != null) {
      // マーカーを空にする
      marker.setMap(null)
    }
  }

  newMarker() {
    // マーカーをセット
    marker = new google.maps.Marker({
      map: map,
      position: this.locationValue
    })
  }

  writeToLocationForm(location) {
    // フォームに緯度経度を書き込む
    this.latitudeTarget.value = location.lat
    this.longitudeTarget.value = location.lng
  }

  clearLocationForm() {
    // 緯度経度のフォームをクリア
    this.latitudeTarget.value = ""
    this.longitudeTarget.value = ""
  }

  initMarker() {
    // フォームから緯度経度の値を取得
    this._latitude = this.latitudeTarget.value
    this._longitude = this.longitudeTarget.value
    // フォームの値が緯度経度共に空でない場合
    if (this._latitude != "" && this._longitude != "") {
      // 取得した情報は文字の為parseFloatした上で locationValue にセット
      this.locationValue = { lat: parseFloat(this._latitude), lng: parseFloat(this._longitude) }
      // セットした locationValue からマーカーをセット
      this.newMarker(this.locationValue)
    }
  }

  setLocation(location) {
    // lovcationValue に 引数の値をセット
    this.locationValue = location
    // 緯度経度のフォームに引数の値をセット
    this.writeToLocationForm(location)
  }
}
