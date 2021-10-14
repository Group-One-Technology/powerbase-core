# This file should contain all the record creation needed to seed the database with its default values.
# The data can then be loaded with the bin/rails db:seed command (or created alongside the database with db:setup).
#
# * Seed PowerbaseFieldTypes...
single_line_text = PowerbaseFieldType.find_or_create_by(name: "Single Line Text", description: "A short string.", data_type: "string", is_virtual: false)
long_text = PowerbaseFieldType.find_or_create_by(name: "Long Text", description: "A long string.", data_type: "text", is_virtual: false)
checkbox = PowerbaseFieldType.find_or_create_by(name: "Checkbox", description: "A binary choice.", data_type: "boolean", is_virtual: false)
number = PowerbaseFieldType.find_or_create_by(name: "Number", description: "Can either be an integer or decimal. Depends on the user.", data_type: "number", is_virtual: false)
single_select = PowerbaseFieldType.find_or_create_by(name: "Single Select", description: "Shows a list of options in which a user only selects a single one.", data_type: "string", is_virtual: false)
multiple_select = PowerbaseFieldType.find_or_create_by(name: "Multiple Select", description: "Shows a list of options in which a user can select multiple options.", data_type: "string", is_virtual: false)
date = PowerbaseFieldType.find_or_create_by(name: "Date", description: "A date.", data_type: "string", is_virtual: false)
email = PowerbaseFieldType.find_or_create_by(name: "Email", description: "An email.", data_type: "string", is_virtual: false)
plugin = PowerbaseFieldType.find_or_create_by(name: "Plugin", description: "A type that uses hooks up a plugin made by other devs.", data_type: "string", is_virtual: true)
others = PowerbaseFieldType.find_or_create_by(name: "Others", description: "A db_type that hasn't been mapped yet.", data_type: "string", is_virtual: false)

FieldDbTypeMapping.find_or_create_by(db_type: "character varying", adapter: "sequel", powerbase_field_type_id: single_line_text.id)
FieldDbTypeMapping.find_or_create_by(db_type: "char", adapter: "sequel", powerbase_field_type_id: single_line_text.id)
FieldDbTypeMapping.find_or_create_by(db_type: "varchar", adapter: "sequel", powerbase_field_type_id: single_line_text.id)
FieldDbTypeMapping.find_or_create_by(db_type: "uuid", adapter: "sequel", powerbase_field_type_id: single_line_text.id)
FieldDbTypeMapping.find_or_create_by(db_type: "text", adapter: "sequel", powerbase_field_type_id: long_text.id)
FieldDbTypeMapping.find_or_create_by(db_type: "boolean", adapter: "sequel", powerbase_field_type_id: checkbox.id)
FieldDbTypeMapping.find_or_create_by(db_type: "float", adapter: "sequel", powerbase_field_type_id: number.id)
FieldDbTypeMapping.find_or_create_by(db_type: "bigint", adapter: "sequel", powerbase_field_type_id: number.id)
FieldDbTypeMapping.find_or_create_by(db_type: "int", adapter: "sequel", powerbase_field_type_id: number.id)
FieldDbTypeMapping.find_or_create_by(db_type: "integer", adapter: "sequel", powerbase_field_type_id: number.id)
FieldDbTypeMapping.find_or_create_by(db_type: "tinyint", adapter: "sequel", powerbase_field_type_id: number.id)
FieldDbTypeMapping.find_or_create_by(db_type: "decimal", adapter: "sequel", powerbase_field_type_id: number.id)
FieldDbTypeMapping.find_or_create_by(db_type: "date", adapter: "sequel", powerbase_field_type_id: date.id)
FieldDbTypeMapping.find_or_create_by(db_type: "time", adapter: "sequel", powerbase_field_type_id: date.id)
FieldDbTypeMapping.find_or_create_by(db_type: "timestamp", adapter: "sequel", powerbase_field_type_id: date.id)
FieldDbTypeMapping.find_or_create_by(db_type: "enum", adapter: "sequel", powerbase_field_type_id: single_select.id)

# * Seed PII...
Pii.find_or_create_by(name: "Full Name")
Pii.find_or_create_by(name: "Social Security Number", abbreviation: "SSN")
Pii.find_or_create_by(name: "Driver's License")
Pii.find_or_create_by(name: "Address")
Pii.find_or_create_by(name: "Email Address", abbreviation: "Email")
Pii.find_or_create_by(name: "Telephone Number")
Pii.find_or_create_by(name: "Mobile Number")
Pii.find_or_create_by(name: "Date of Birth", abbreviation: "Birthdate")
Pii.find_or_create_by(name: "Debit Card")
Pii.find_or_create_by(name: "Credit Card")

# Import Elastic Search indices and data
PowerbaseDatabase.__elasticsearch__.create_index!
PowerbaseDatabase.import(scope: "turbo")

PowerbaseTable.__elasticsearch__.create_index!
PowerbaseTable.import(scope: "turbo")
