class PointsController < ApplicationController
  def index
    @points = Point.all
    @points_json = @points.map { |o| point_to_hash(o) }.to_json
    @point = Point.new
  end

  def show
    @point = Point.find(params[:id])
    @point_json = point_to_hash(@point).to_json
  end

  def create
    @point = Point.new(point_params)
    if @point.save
      flash[:notice] = 'ポイントを登録しました'
      redirect_to root_url
    else
      @points = Point.all
      @points_json = @points.map { |o| point_to_hash(o) }.to_json
      flash.now[:alert] = 'ポイントを登録できませんでした'
      render :index
    end
  end

  private

  def point_params
    params.require(:point).permit(:name, :latitude, :longitude, :address, :keyword)
  end

  def point_to_hash(point)
    { id: point.id,
      name: point.name,
      lat: point.latitude,
      lng: point.longitude }
  end

end
