class UserMailer < ActionMailer::Base
  default from: "team@editmode.com"

  def confirm_email(user_id: nil)
    @user = User.find user_id
    raise StandardError.new "Failed to send confirm email, user##{user_id} could not be found." if !@user
    @action_url = "#{ENV["CLIENT"]}/user/confirm-email?token=#{@user.confirm_token}"
    @support_email = "team@editmode.com"

    mail(
      subject: 'Confirm Your Email',
      to: @user.email,
      track_opens: 'true',
      message_stream: 'outbound',
    )
  end

  def reset_password(user_id: nil)
    @user = User.find user_id
    raise StandardError.new "Failed to send reset password email, user##{user_id} could not be found." if !@user
    @action_url = "#{ENV["CLIENT"]}/user/reset-password?token=#{@user.reset_password_token}"
    @support_email = "team@editmode.com"

    mail(
      subject: 'Password Reset',
      to: @user.email,
      track_opens: 'true',
      message_stream: 'outbound',
    )
  end

  def changed_password_notice(user_id: nil)
    @user = User.find user_id
    raise StandardError.new "Failed to send reset password success response email, user##{user_id} could not be found." if !@user
    @date = Time.now.utc.to_formatted_s(:rfc822) + " (UTC)"
    @action_url = "#{ENV["CLIENT"]}/forgot-password"
    @support_email = "team@editmode.com"

    mail(
      subject: 'Your password has been changed successfully',
      to: @user.email,
      track_opens: 'true',
      message_stream: 'outbound',
    )
  end
end
