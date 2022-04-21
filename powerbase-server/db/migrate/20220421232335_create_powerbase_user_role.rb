include SequelHelper

class CreatePowerbaseUserRole < ActiveRecord::Migration[6.1]
  def up
    powerbase = Powerbase::Schema.new
    powerbase.create_role("powerbase_user")
  end

  def down
    powerbase = Powerbase::Schema.new
    powerbase.drop_role("powerbase_user")
  end
end
