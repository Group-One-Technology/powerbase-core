class RemoveComposedRecordIdentifierFromMagicValues < ActiveRecord::Migration[6.1]
  def change
    remove_column :magic_values, :composed_record_identifier, :string
    remove_column :magic_values, :field_name, :string
    remove_column :magic_values, :field_id, :integer
    remove_column :magic_values, :table_id, :integer
    remove_column :magic_values, :field_type_id, :integer
    add_column :magic_values, :pk_field_value, :string
    add_reference :magic_values, :pk_field, references: :powerbase_field, index: true
    add_foreign_key :magic_values, :powerbase_fields, column: :pk_field_id
    add_reference :magic_values, :powerbase_field_type, foreign_key: true
    add_reference :magic_values, :powerbase_field, foreign_key: true
    add_reference :magic_values, :powerbase_table, foreign_key: true

  end
end
