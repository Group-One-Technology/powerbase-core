module Notifier
  extend ActiveSupport::Concern

  def inject_notifier_triggers
    notifier.add_triggers(name)
  end

  def inject_notifier_trigger
    notifier.add_trigger(name)
  end

  def inject_notifier_event_trigger
    notifier.add_event_trigger(name)
  end

  def inject_notifier_drop_event_trigger
    notifier.add_drop_event_trigger(name)
  end
end