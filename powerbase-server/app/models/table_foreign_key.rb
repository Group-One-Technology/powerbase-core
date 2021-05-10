class TableForeignKey < ApplicationRecord
  validates :name, presence: true
  validates :columns, presence: true
  validates :referenced_columns, presence: true

  belongs_to :powerbase_table
  belongs_to :referenced_table, class_name: 'PowerbaseTable'
end
