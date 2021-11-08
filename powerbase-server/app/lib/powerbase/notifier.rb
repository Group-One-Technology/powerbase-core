module Powerbase
  class Notifier
    include SequelHelper

    attr_accessor :powerbase_database

    def initialize(powerbase_database)
      @powerbase_database = powerbase_database
    end

    def add_trigger(table_name)
      # Wrap in a rescuer since this command will return an error if the table already has the same trigger fucntion
      begin
        puts "Injecting Table Update Trigger..."
        sequel_connect(powerbase_database) do |db|
          db.run("
            CREATE TRIGGER #{table_name}_changed
            AFTER INSERT OR UPDATE OR DELETE
            ON #{table_name}
            FOR EACH ROW
            EXECUTE PROCEDURE table_update_notify()
          ")
        end
        puts "Injecting Table Update Trigger...DONE"
      rescue => exception
        puts "Notification trigger for #{table_name} already exist"
      end
    end

    def add_oid!(table_name)
      puts "Adding OID Column..."
      sequel_connect(powerbase_database) do |db|
        db.run("
          ALTER TABLE #{table_name}
          SET WITH OIDS;
        ")
      end
      puts "Adding OID Column...DONE"
    end

    def create_notifier!
      puts "Injecting Table Notifier Function..."
      sequel_connect(powerbase_database) do |db|
        db.run("
          CREATE OR REPLACE FUNCTION table_update_notify() RETURNS trigger AS $$
          DECLARE
            reg_id JSONB; 
            affected_row JSON;
            oid JSONB;
          BEGIN
            CASE TG_OP
            WHEN 'INSERT', 'UPDATE' THEN
              affected_row := row_to_json(NEW);
              IF to_jsonb(NEW) ? 'oid' THEN
                oid := json_object_agg('oid', NEW.oid);
              END IF;
            WHEN 'DELETE' THEN
              affected_row := row_to_json(OLD);
              IF to_jsonb(OLD) ? 'oid' THEN
                oid := json_object_agg('oid', OLD.oid);
              END IF;
            END CASE;

            WITH pk_columns (attname) AS (
              SELECT 
                  CAST(a.attname AS TEXT) 
              FROM 
                  pg_index i 
                  JOIN pg_attribute a ON a.attrelid = i.indrelid AND a.attnum = ANY(i.indkey) 
              WHERE 
                  i.indrelid = TG_RELID 
                  AND i.indisprimary
            )
            SELECT 
                json_object_agg(key, value) INTO reg_id
            FROM 
                json_each_text(affected_row)
            WHERE 
                key IN(SELECT attname FROM pk_columns);
            
            PERFORM pg_notify('powerbase_table_update', json_build_object('table', TG_TABLE_NAME, 'primary_key', COALESCE(reg_id, oid), 'type', TG_OP)::text);
            RETURN NEW;
          END;
          $$ LANGUAGE plpgsql
        ")
      end
      puts "Injecting Table Notifier Function...DONE"

    end
  end
end