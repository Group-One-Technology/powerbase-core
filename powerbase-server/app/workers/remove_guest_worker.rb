class RemoveGuestWorker
  include Sidekiq::Worker
  include TablePermissionsHelper
  include FieldPermissionsHelper

  def perform(guest_id, database_id, access)
    return unless access == "custom"

    db = PowerbaseDatabase.find database_id
    db.powerbase_tables.each do |table|
      table.remove_guest(guest_id)

      fields = PowerbaseField.where(powerbase_table_id: table.id)
      fields.each do |field|
        field.remove_guest(guest_id)
      end
    end
  end
end