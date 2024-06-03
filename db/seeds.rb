# This file should contain all the record creation needed to seed the database with its default values.
# The data can then be loaded with the bin/rails db:seed command (or created alongside the database with db:setup).
#
# Examples:
#
#   movies = Movie.create([{ name: 'Star Wars' }, { name: 'Lord of the Rings' }])
#   Character.create(name: 'Luke', movie: movies.first)
data = [
  { name: "都庁",
    latitude: 35.6895014,
    longitude: 139.6917337,
    address: "日本、〒163-8001 東京都新宿区西新宿２丁目８−１" },
  { name: "後楽園",
    latitude: 35.7054551,
    longitude: 139.7535553,
    address: "日本、〒112-0004 東京都文京区後楽１丁目３" },
  { name: "江ノ電自転車ニキ",
    latitude: 35.3076198,
    longitude: 139.4937805,
    address: "日本、〒248-0033 神奈川県鎌倉市腰越２丁目１０−２５" }
]

data.each do |point_attribute|
  Point.create!(point_attribute)
end
