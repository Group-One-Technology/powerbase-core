include SequelHelper

class Databases::Schema
  attr_accessor :database

  def initialize(database)
    @database = database
  end

  def create_table(table_name, fields)
    primary_keys = fields.select {|field| field[:is_primary_key]}
      .map {|field| field[:name].to_sym}

    sequel_connect(database) do |db|
      db.create_table(table_name.to_sym) do
        fields.each do |field|
          if field[:data_type].end_with?("enum") || (field[:enum_values] && field[:enum_values].length > 0)
            db.create_enum(field[:data_type].to_sym, field[:enum_values].uniq)
          end

          column(field[:name].to_sym, field[:data_type])
        end

        if primary_keys.length > 0
          primary_key(primary_keys)
        end
      end
    end
  end
end
