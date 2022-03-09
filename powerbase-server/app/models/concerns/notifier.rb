module Notifier
  extend ActiveSupport::Concern

  def inject_notifier_trigger
    notifier.add_triggers(name)
  end
end