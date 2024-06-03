class Point < ApplicationRecord
  attr_accessor :keyword
  validates :name, presence: true
  validates :latitude, presence: true
  validates :longitude, presence: true
  validates :address, presence: true
end
