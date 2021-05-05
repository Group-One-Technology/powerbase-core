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

ActiveRecord::Schema.define(version: 2021_05_05_143050) do

  # These are extensions that must be enabled in order to support this database
  enable_extension "plpgsql"

  create_table "powerbase_databases", force: :cascade do |t|
    t.string "name", null: false
    t.text "description"
    t.string "encrypted_connection_string", null: false
    t.string "database_type", default: "postgres"
    t.boolean "is_migrated", default: false
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
  end

  create_table "powerbase_tables", force: :cascade do |t|
    t.string "name", null: false
    t.text "description"
    t.bigint "powerbase_database_id"
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.index ["powerbase_database_id"], name: "index_powerbase_tables_on_powerbase_database_id"
  end

  add_foreign_key "powerbase_tables", "powerbase_databases"
end
