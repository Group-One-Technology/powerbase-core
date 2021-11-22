class Fields::Creator
  include FieldTypeHelper

  attr_accessor :table, :column, :field, :field_name, :field_options, :table_view, :base_migration

  def initialize(column, table)
    @column = column
    @table = table
    @field_name = column[0]
    @field_options = column[1]
    @base_migration = table.db.base_migration
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

  def add_field_select_options
    field_select_options = FieldSelectOption.find_by(
      name: field_options[:db_type],
      powerbase_field_id: field.id,
    ) || FieldSelectOption.new
    field_select_options.name = field_options[:db_type]

    database = table.db

    if database.postgresql?
      field_select_options.values = field_options[:enum_values]
    elsif database.mysql2?
      field_select_options.values = field_options[:db_type].slice(5..-2)
        .tr("''", "")
        .split(",")
    end

    field_select_options.powerbase_field_id = field.id

    if !field_select_options.save
      base_migration.logs["errors"].push({
        type: "Active Record",
        error: "Failed to save '#{field_options[:db_type]}' enums",
        messages: field_select_options.errors.messages,
      })
      base_migration.save
    end
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
    if field.save
      add_to_viewfield
      add_field_select_options if field.powerbase_field_type.data_type == "enums"
    else
      base_migration.logs["errors"].push({
        type: "Active Record",
        error: "Failed to save '#{field_name}' field",
        messages: field.errors.messages,
      })
      base_migration.save
    end
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