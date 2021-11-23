class MagicValue < ApplicationRecord
    belongs_to :powerbase_field_type
    belongs_to :powerbase_field, foreign_key: "pk_field_id"
end
