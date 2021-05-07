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

ActiveRecord::Schema.define(version: 2021_05_07_125455) do

  # These are extensions that must be enabled in order to support this database
  enable_extension "plpgsql"

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
    t.boolean "is_foreign_key", default: false, null: false
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

  add_foreign_key "powerbase_fields", "powerbase_field_types"
  add_foreign_key "powerbase_fields", "powerbase_tables"
  add_foreign_key "powerbase_tables", "powerbase_databases"
end
