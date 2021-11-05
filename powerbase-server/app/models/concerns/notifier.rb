module Notifier
  extend ActiveSupport::Concern
  def inject_oid
    # Add OID Column
    notifier.add_oid!(name)
  end

  def inject_notifier_trigger
    notifier.add_trigger(name)
  end
end