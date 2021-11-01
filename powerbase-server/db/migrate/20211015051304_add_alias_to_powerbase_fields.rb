class AddAliasToPowerbaseFields < ActiveRecord::Migration[6.1]
  def change
    add_column :powerbase_fields, :alias, :string

    fields = PowerbaseField.all
    fields.each do |field|
      field.alias = field.name.titlecase
      field.save
    end
  end
end
