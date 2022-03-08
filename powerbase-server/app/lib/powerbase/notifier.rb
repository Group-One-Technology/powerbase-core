module Powerbase
  class Notifier
    include SequelHelper

    attr_accessor :powerbase_database

    def initialize(powerbase_database)
      @powerbase_database = powerbase_database
    end

    def add_trigger(table_name)
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
        puts "#{Time.now} -- Injecting Table Update Trigger... DONE"
      rescue Sequel::Error => exception
        if !exception.message.include?("PG::DuplicateObject")
          puts "#{Time.now} -- Error for table #{table_name} in db##{@powerbase_database.id}: #{exception.message}"
          Sentry.capture_exception(exception)
        end
      end
    end

    def add_event_trigger(table_name)
      if !powerbase_database.is_superuser
        puts "#{Time.now} -- User must be a superuser to be able to inject event triggers."
        return
      end

      begin
        puts "#{Time.now} -- Injecting Table Update Event Trigger..."
        sequel_connect(powerbase_database) do |db|
          db.run("
            CREATE EVENT TRIGGER #{table_name}_schema_changed
            ON ddl_command_end
            WHEN TAG IN ('CREATE TABLE', 'ALTER TABLE')
            EXECUTE PROCEDURE table_schema_update_notify()
          ")
        end
        puts "#{Time.now} -- Injecting Table Update Event Trigger... DONE"
      rescue Sequel::Error => exception
        if !exception.message.include?("PG::DuplicateObject")
          puts "#{Time.now} -- Error for table #{table_name} in db##{@powerbase_database.id}: #{exception.message}"
          Sentry.capture_exception(exception)
        end
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

            PERFORM pg_notify('powerbase_table_update', json_build_object('table', TG_TABLE_NAME, 'primary_key', COALESCE(reg_id, oid), 'type', TG_OP, 'trigger_type', 'trigger')::text);
            RETURN NEW;
          END;
          $$ LANGUAGE plpgsql
        ")
      end
      puts "#{Time.now} -- Injecting Table Notifier Function... DONE"
    end

    def create_event_notifier!
      if !powerbase_database.is_superuser
        puts "#{Time.now} -- User must be a superuser to be able to inject event notifiers."
        return
      end

      puts "#{Time.now} -- Injecting Table Event Notifier Function..."
      sequel_connect(powerbase_database) do |db|
        db.run("
          CREATE OR REPLACE FUNCTION public.table_schema_update_notify()
          RETURNS event_trigger
          LANGUAGE plpgsql
          AS $function$
          DECLARE
            obj RECORD;
            tbl TEXT;
            col TEXT;
            colnum integer;
            schma TEXT;
            command_tag TEXT;
            object_identity TEXT;
            object_type TEXT;
          BEGIN
            FOR obj IN SELECT * FROM pg_event_trigger_ddl_commands() WHERE command_tag IN ('CREATE TABLE', 'ALTER TABLE') LOOP
              tbl = obj.objid::regclass;
              colnum = obj.objsubid::regclass;
              schma = obj.schema_name;
              object_identity = obj.object_identity;
              command_tag = obj.command_tag;
            object_type = obj.object_type;
            END LOOP;
            col := (SELECT attname FROM pg_attribute WHERE attrelid = tbl::regclass AND attnum = colnum);

            PERFORM pg_notify('powerbase_table_update', json_build_object('trigger_type', 'event_trigger', 'schema_name', schma, 'table', tbl, 'column', col, 'object', object_identity, 'command_tag', command_tag, 'object_type', object_type)::text);
          END;
          $function$
        ")
      end
      puts "#{Time.now} -- Injecting Table Event Notifier Function... DONE"
    end
  end
end
