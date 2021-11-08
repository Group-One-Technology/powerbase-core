class GuestsController < ApplicationController
  before_action :authorize_access_request!

  schema(:index) do
    required(:database_id)
    required(:email)
    required(:access)
    optional(:permissions)
  end

  schema(:change_access) do
    required(:id)
    required(:access)
  end

  schema(:create) do
    required(:database_id)
    required(:email)
    required(:access)
    optional(:permissions)
  end

  schema(:accept_invite, :reject_invite, :destroy) do
    required(:id)
  end

  # GET /databases/:database_id/guests
  def index
    current_user.can?(:view_base, safe_params[:database_id])

    @guests = Guest.where(powerbase_database_id: safe_params[:database_id])
    render json: @guests.map {|item| user_format_json(item)}
  end

  # GET /base_invitations
  def base_invitations
    render json: current_user.guest_invitations.map {|item| format_json(item)}
  end

  # PUT /guests/:id/accept_invite
  def accept_invite
    @guest = Guest.find(safe_params[:id])

    if @guest.user_id != current_user.id
      render json: { error: "Not Authorized." }, status: :unprocessable_entity
      return
    end

    if @guest.update(is_accepted: true)
      render json: format_json(@guest)
    else
      render json: @guest.errors, status: :unprocessable_entity
    end
  end

  # PUT /guests/:id/reject_invite
  def reject_invite
    @guest = Guest.find(safe_params[:id])

    if @guest.user_id != current_user.id
      render json: { error: "Not Authorized." }, status: :unprocessable_entity
      return
    end

    @guest.destroy
    render status: :no_content
  end

  # PUT /guests/:id/change_access
  def change_access
    @guest = Guest.find(safe_params[:id])
    raise NotFound.new("Could not find guest with id of #{safe_params[:id]}") if !@guest
    current_user.can?(:change_guest_access, @guest.powerbase_database, @guest)

    if @guest.update(access: safe_params[:access])
      render json: format_json(@guest)
    else
      render json: @guest.errors, status: :unprocessable_entity
    end
  end

  # POST /databases/:database_id/guests
  def create
    current_user.can?(:invite_guests, safe_params[:database_id])
    @user = User.find_by(email: safe_params[:email])

    if !@user
      render json: { error: "Could not find user with email of '#{safe_params[:email]}'." }, status: :unprocessable_entity
      return
    end

    if @user.id == current_user.id
      render json: { error: "User with email of '#{current_user.email}' already has access to the database with id of #{database_id}." }, status: :unprocessable_entity
      return
    end

    @guest = Guest.find_by(powerbase_database_id: safe_params[:database_id], user_id: @user.id)

    if @guest
      render json: { error: "User with email of '#{@user.email}' is already a guest of this database." }, status: :unprocessable_entity
      return
    end

    @guest = Guest.new({
      user_id: @user.id,
      powerbase_database_id: safe_params[:database_id],
      access: safe_params[:access],
      permissions: safe_params[:permissions],
      inviter_id: current_user.id,
    })

    if @guest.save
      render json: format_json(@guest), status: :created
    else
      render json: @guest.errors, status: :unprocessable_entity
    end
  end

  # DELETE /guests/:id
  def destroy
    @guest = Guest.find(safe_params[:id])
    raise AccessDenied if !@guest
    current_user.can?(:remove_guests, @guest.powerbase_database, @guest)
    @guest.destroy

    render status: :no_content
  end

  private
    def format_json(guest)
      {
        id: guest.id,
        access: guest.access,
        permissions: guest.permissions,
        user_id: guest.user_id,
        user: user_format_json(guest),
        inviter_id: guest.inviter_id,
        inviter: inviter_format_json(guest.inviter),
        database_id: guest.powerbase_database_id,
        database_name: guest.powerbase_database.name,
        is_accepted: guest.is_accepted,
      }
    end

    def user_format_json(guest)
      user = guest.user

      {
        id: guest.id,
        access: guest.access,
        permissions: guest.permissions,
        user_id: user.id,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        is_accepted: guest.is_accepted,
      }
    end

    def inviter_format_json(user)
      {
        id: user.id,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
      }
    end
end