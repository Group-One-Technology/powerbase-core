class UserMailer < ApplicationMailer
  def confirm_email(user_id: nil)
    @user = User.find user_id
    raise StandardError.new "Failed to send confirm email, user##{user_id} could not be found." if !@user

    if !@user.pending_any_confirmation?
      puts "User##{@user.id}'s email is already confirmed"
      return
    end

    @action_url = "#{ENV["CLIENT"]}/user/confirm-email?token=#{@user.confirmation_token}"
    @support_email = self.class.support_email
    @confirm_within = ActiveSupport::Duration.build(@user.confirm_within).inspect

    mail(
      subject: 'Confirm Your Email',
      to: @user.unconfirmed_email,
      track_opens: 'true',
      message_stream: 'outbound',
    )
  end
end
