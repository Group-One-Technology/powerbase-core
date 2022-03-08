module Notifier
  extend ActiveSupport::Concern

  def inject_notifier_trigger
    notifier.add_trigger(name)
  end

  def inject_event_notifier_trigger
    notifier.add_event_trigger(name)
  end
end