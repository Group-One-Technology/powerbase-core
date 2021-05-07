# This file should contain all the record creation needed to seed the database with its default values.
# The data can then be loaded with the bin/rails db:seed command (or created alongside the database with db:setup).
#
# * Seed PowerbaseFieldTypes...
PowerbaseFieldType.create(name: "Single Line Text", description: "A short string.", data_type: "string", is_virtual: false)
PowerbaseFieldType.create(name: "Long Text", description: "A long string.", data_type: "text", is_virtual: false)
PowerbaseFieldType.create(name: "Checkbox", description: "A binary choice.", data_type: "boolean", is_virtual: false)
PowerbaseFieldType.create(name: "Number", description: "Can either be an integer or decimal. Depends on the user.", data_type: "number", is_virtual: false)
PowerbaseFieldType.create(name: "Checkbox", description: "A binary choice.", data_type: "boolean", is_virtual: false)
PowerbaseFieldType.create(name: "Single Select", description: "Shows a list of options in which a user only selects a single one.", data_type: "string", is_virtual: false)
PowerbaseFieldType.create(name: "Multiple Select", description: "Shows a list of options in which a user can select multiple options.", data_type: "string", is_virtual: false)
PowerbaseFieldType.create(name: "Date", description: "A date.", data_type: "string", is_virtual: false)
PowerbaseFieldType.create(name: "Email", description: "An email.", data_type: "string", is_virtual: false)
PowerbaseFieldType.create(name: "Plugin", description: "A type that uses hooks up a plugin made by other devs.", data_type: "string", is_virtual: true)
