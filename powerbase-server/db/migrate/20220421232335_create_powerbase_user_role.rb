include SequelHelper

class CreatePowerbaseUserRole < ActiveRecord::Migration[6.1]
  def up
    begin
      powerbase = Powerbase::Schema.new
      powerbase.create_role("powerbase_user")
    rescue Sequel::Error => exception
      if !exception.message.include?("PG::DuplicateObject")
        raise exception
      end
    end
  end

  def down
    powerbase = Powerbase::Schema.new
    powerbase.drop_role("powerbase_user")
  end
end
