class UserMailer < ActionMailer::Base
  default from: "team@editmode.com"

  def confirm_email(user_id: nil)
    @user = User.find user_id
    raise StandardError.new "Failed to send confirm email, user##{user_id} could not be found." if !@user
    @action_url = "#{ENV["CLIENT"]}/user/confirm?token=#{@user.confirm_token}"
    @support_email = "team@editmode.com"

    mail(
      subject: 'Confirm Your Email',
      to: @user.email,
      track_opens: 'true',
      message_stream: 'outbound',
    )
  end
end
