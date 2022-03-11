class ApplicationWorker
  include Sidekiq::Worker

  def perform(*args)
    return if cancelled?
  end

  def cancelled?
    Sidekiq.redis {|c| c.exists?("cancelled-#{jid}") }
  end

  def self.cancel!(jid)
    Sidekiq.redis {|c| c.setex("cancelled-#{jid}", 86400, 1) }
  end
end