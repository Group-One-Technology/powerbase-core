# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `bin/rails
# db:schema:load`. When creating a new database, `bin/rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema.define(version: 2021_05_10_104813) do

  # These are extensions that must be enabled in order to support this database
  enable_extension "plpgsql"

  create_table "field_db_type_mappings", force: :cascade do |t|
    t.string "db_type", null: false
    t.string "adapter", default: "sequel", null: false
    t.bigint "powerbase_field_type_id", null: false
    t.index ["powerbase_field_type_id"], name: "index_field_db_type_mappings_on_powerbase_field_type_id"
  end

  create_table "field_select_options", force: :cascade do |t|
    t.string "name", null: false
    t.string "values", default: [], null: false, array: true
    t.bigint "powerbase_field_id", null: false
    t.index ["powerbase_field_id"], name: "index_field_select_options_on_powerbase_field_id"
  end

  create_table "powerbase_databases", force: :cascade do |t|
    t.string "name", null: false
    t.text "description"
    t.string "encrypted_connection_string", null: false
    t.string "database_type", default: "postgres", null: false
    t.boolean "is_migrated", default: false, null: false
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
  end

  create_table "powerbase_field_types", force: :cascade do |t|
    t.string "name", null: false
    t.text "description"
    t.string "data_type", default: "string", null: false
    t.boolean "is_virtual", default: false, null: false
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
  end

  create_table "powerbase_fields", force: :cascade do |t|
    t.string "name", null: false
    t.string "description"
    t.integer "oid", null: false
    t.string "db_type", null: false
    t.string "default_value"
    t.boolean "is_primary_key", default: false, null: false
    t.boolean "is_nullable", default: true, null: false
    t.boolean "is_hidden", default: false, null: false
    t.boolean "is_frozen", default: false, null: false
    t.integer "order", null: false
    t.bigint "powerbase_table_id", null: false
    t.bigint "powerbase_field_type_id", null: false
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.index ["powerbase_field_type_id"], name: "index_powerbase_fields_on_powerbase_field_type_id"
    t.index ["powerbase_table_id"], name: "index_powerbase_fields_on_powerbase_table_id"
  end

  create_table "powerbase_tables", force: :cascade do |t|
    t.string "name", null: false
    t.text "description"
    t.bigint "powerbase_database_id", null: false
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.index ["powerbase_database_id"], name: "index_powerbase_tables_on_powerbase_database_id"
  end

  create_table "table_foreign_keys", force: :cascade do |t|
    t.string "name", null: false
    t.string "columns", default: [], null: false, array: true
    t.string "referenced_columns", default: [], null: false, array: true
    t.bigint "powerbase_table_id", null: false
    t.bigint "referenced_table_id", null: false
    t.index ["powerbase_table_id"], name: "index_table_foreign_keys_on_powerbase_table_id"
    t.index ["referenced_table_id"], name: "index_table_foreign_keys_on_referenced_table_id"
  end

  add_foreign_key "field_db_type_mappings", "powerbase_field_types"
  add_foreign_key "field_select_options", "powerbase_fields"
  add_foreign_key "powerbase_fields", "powerbase_field_types"
  add_foreign_key "powerbase_fields", "powerbase_tables"
  add_foreign_key "powerbase_tables", "powerbase_databases"
  add_foreign_key "table_foreign_keys", "powerbase_tables"
  add_foreign_key "table_foreign_keys", "powerbase_tables", column: "referenced_table_id"
end
