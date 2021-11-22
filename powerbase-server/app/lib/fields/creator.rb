class Fields::Creator
  include FieldTypeHelper

  attr_accessor :table, :column, :field, :field_name, :field_options, :table_view

  def initialize(column, table)
    @column = column
    @table = table
    @field_name = column[0]
    @field_options = column[1]
    @table_view = find_or_create_table_view

    create_field_object
  end

  def create_field_object
    @field = PowerbaseField.new(field_params)
  end

  def find_or_create_table_view
    TableView.find_by(powerbase_table_id: table.id) ||
    TableView.create!(
      powerbase_table_id: table.id,
      name: "Default",
      view_type: "grid",
      order: 0
    )
  end

  def add_to_viewfield
    ViewFieldOption.find_by(
      table_view_id: table_view.id,
      powerbase_field_id: field.id,
    ) ||
    ViewFieldOption.create!({
      width: set_view_field_width,
      order: table.fields.count,
      table_view_id: table_view.id,
      powerbase_field_id: field.id
    })

    # Set table as migrated for non-turbo databases
    table.is_migrated = true if !table.powerbase_database.is_turbo
    table.save
  end

  def field_params
    {
      name: field_name,
      oid: field_options[:oid],
      db_type: field_options[:db_type],
      default_value: field_options[:default] || nil,
      is_primary_key: field_options[:primary_key],
      is_nullable: field_options[:allow_null],
      powerbase_field_type_id: field_type,
      powerbase_table_id: table.id,
      is_pii: Pii.is_pii?(field_name)
    }

  end

  def field_type
    column_type = FieldDbTypeMapping.includes(:powerbase_field_type)
    .where("? ILIKE CONCAT('%', db_type, '%')", "%#{field_options[:db_type]}%")
    .take

    field_type = PowerbaseFieldType.find_by(
      name: column_type ? column_type.powerbase_field_type.name : "Others"
    ).id || single_line_text_field.id
  end

  def save
    field.save && add_to_viewfield
  end


  private
  def set_view_field_width
    case field.powerbase_field_type_id
    when 3
      field.name.length > 4 ? field.name.length * 20 : 100
    else
      300
    end
  end
end