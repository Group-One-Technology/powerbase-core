# This file should contain all the record creation needed to seed the database with its default values.
# The data can then be loaded with the bin/rails db:seed command (or created alongside the database with db:setup).
#
# * Seed PowerbaseFieldTypes...
single_line_text = PowerbaseFieldType.find_or_create_by(name: "Single Line Text", description: "A short string.", data_type: "string")
long_text = PowerbaseFieldType.find_or_create_by(name: "Long Text", description: "A long string.", data_type: "text")
json_text = PowerbaseFieldType.find_or_create_by(name: "JSON Text", description: "A JSON in a form of a string.", data_type: "text")
checkbox = PowerbaseFieldType.find_or_create_by(name: "Checkbox", description: "A binary choice.", data_type: "boolean")
number = PowerbaseFieldType.find_or_create_by(name: "Number", description: "Can either be an integer or decimal. Depends on the user.", data_type: "number")
single_select = PowerbaseFieldType.find_or_create_by(name: "Single Select", description: "Shows a list of options in which a user only selects a single one.", data_type: "enums")
multiple_select = PowerbaseFieldType.find_or_create_by(name: "Multiple Select", description: "Shows a list of options in which a user can select multiple options.", data_type: "array")
date = PowerbaseFieldType.find_or_create_by(name: "Date", description: "A date.", data_type: "date")
email = PowerbaseFieldType.find_or_create_by(name: "Email", description: "An email.", data_type: "string")
url = PowerbaseFieldType.find_or_create_by(name: "URL", description: "A link to a web page.", data_type: "string")
currency = PowerbaseFieldType.find_or_create_by(name: "Currency", description: "Money, a medium of exchange for goods and services.", data_type: "number")
percent = PowerbaseFieldType.find_or_create_by(name: "Percent", description: "Number or ratio expressed as a fraction of 100.", data_type: "number")
plugin = PowerbaseFieldType.find_or_create_by(name: "Plugin", description: "A type that uses hooks up a plugin made by other devs.", data_type: "plugin")
others = PowerbaseFieldType.find_or_create_by(name: "Others", description: "A db_type that hasn't been mapped yet.", data_type: "others")

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
FieldDbTypeMapping.find_or_create_by(db_type: "numeric", adapter: "sequel", powerbase_field_type_id: number.id)
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
