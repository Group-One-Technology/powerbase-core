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
        puts "#{Time.now} -- Injecting Table Update Trigger..."
        sequel_connect(powerbase_database) do |db|
          db.run("
            CREATE TRIGGER #{table_name}_changed
            AFTER INSERT OR UPDATE OR DELETE
            ON #{table_name}
            FOR EACH ROW
            EXECUTE PROCEDURE table_update_notify()
          ")
        end
        puts "#{Time.now} --Injecting Table Update Trigger...DONE"
      rescue => exception
        puts "#{Time.now} -- Notification trigger for #{table_name} already exist"
      end
    end

    def create_notifier!
      puts "#{Time.now} -- Injecting Table Notifier Function..."
      sequel_connect(powerbase_database) do |db|
        db.run("
          CREATE OR REPLACE FUNCTION table_update_notify() RETURNS trigger AS $$
          DECLARE
            reg_id JSONB;
            affected_row JSON;
            oid JSONB;
          BEGIN
            BEGIN
              CASE TG_OP
              WHEN 'INSERT', 'UPDATE' THEN
                affected_row := row_to_json(NEW);
                oid := json_object_agg('oid', NEW.oid);
              WHEN 'DELETE' THEN
                affected_row := row_to_json(OLD);
                oid := json_object_agg('oid', OLD.oid);
              END CASE;
            EXCEPTION
              WHEN undefined_column THEN
                oid := null;
            END;

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

            PERFORM pg_notify('powerbase_table_update', json_build_object('table', TG_TABLE_NAME, 'primary_key', COALESCE(reg_id, oid), 'type', TG_OP, 'data', NEW)::text);
            RETURN NEW;
          END;
          $$ LANGUAGE plpgsql
        ")
      end

      puts "#{Time.now} -- Injecting Table Notifier Function...DONE"
    end
  end
end
