class UserMailer < ApplicationMailer
  def confirm_email(user_id: nil)
    @user = User.find user_id
    raise StandardError.new "Failed to send confirm email, user##{user_id} could not be found." if !@user

    if !@user.pending_any_confirmation?
      puts "User##{@user.id}'s email is already confirmed"
      return
    end

    @action_url = "#{ENV["CLIENT"]}/user/confirm-email?token=#{@user.confirmation_token}"
    @confirm_within = ActiveSupport::Duration.build(@user.confirm_within).inspect

    if Rails.env.production?
      mail(
        subject: 'Confirm Your Email',
        from: @sender_email,
        to: @user.unconfirmed_email,
        track_opens: 'true',
        message_stream: 'outbound',
      )
    else
      puts "#{Time.now} -- Confirm Your Email, #{@user.unconfirmed_email} - #{@action_url}"
    end
  end

  def reset_password(user_id: nil, token: nil)
    @user = User.find user_id
    raise StandardError.new "Failed to send reset password email, user##{user_id} could not be found." if !@user
    raise StandardError.new "Failed to send reset password email for user##{user_id}, token is missing." if !token

    @action_url = "#{ENV["CLIENT"]}/user/reset-password?token=#{token}"
    @reset_password_within = ActiveSupport::Duration.build(@user.reset_password_within).inspect

    if Rails.env.production?
      mail(
        subject: 'Password Reset',
        from: @sender_email,
        to: @user.email,
        track_opens: 'true',
        message_stream: 'outbound',
      )
    else
      puts "#{Time.now} -- Reset your password, #{@user.email} within #{@reset_password_within} - #{@action_url}"
    end
  end

  def changed_password_notice(user_id: nil)
    @user = User.find user_id
    raise StandardError.new "Failed to send reset password success response email, user##{user_id} could not be found." if !@user

    @date = Time.now.utc.to_formatted_s(:rfc822) + " (UTC)"
    @action_url = "#{ENV["CLIENT"]}/forgot-password"

    if Rails.env.production?
      mail(
        subject: 'Your password has been changed successfully',
        from: @sender_email,
        to: @user.email,
        track_opens: 'true',
        message_stream: 'outbound',
      )
    else
      puts "#{Time.now} -- Password has been changed at #{@date}, #{@user.email} - Forgot Password: #{@action_url}"
    end
  end

  def changed_email_notice(user_id: nil, old_email: nil, email: nil)
    @user = User.find user_id
    raise StandardError.new "Failed to send change email notice email, user##{user_id} could not be found." if !@user

    @date = Time.now.utc.to_formatted_s(:rfc822) + " (UTC)"
    @old_email = old_email
    @email = @user.unconfirmed_email || @user.email

    if Rails.env.production?
      mail(
        subject: 'Your email has been changed',
        from: @sender_email,
        to: @old_email,
        track_opens: 'true',
        message_stream: 'outbound',
      )
    else
      puts "#{Time.now} -- Email has been changed to #{@email} at #{@date}, #{@old_email}"
    end
  end
end
