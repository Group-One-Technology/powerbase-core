class MainMailer < ApplicationMailer
  def test_email(user_id: nil)
    @user = User.find user_id
    raise StandardError.new "Failed to send test email, user##{user_id} could not be found." if !@user

    @date = Time.now.utc.to_formatted_s(:rfc822) + " (UTC)"

    mail(
      subject: 'Powerbase Test Email',
      from: @sender_email,
      to: @user.email,
      track_opens: 'true',
      message_stream: 'outbound',
    )
  end
end
