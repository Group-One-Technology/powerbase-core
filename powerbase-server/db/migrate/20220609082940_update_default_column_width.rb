class UpdateDefaultColumnWidth < ActiveRecord::Migration[6.1]
  def change
    change_column_default :view_field_options, :width, 150
  end
end
