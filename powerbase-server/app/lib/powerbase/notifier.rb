module Powerbase
  class Notifier

    attr_accessor :db

    def initialize(db)
      @db = db
    end

    def add_trigger(table_name)
      db.run("
        CREATE TRIGGER #{table_name}_changed
        AFTER INSERT OR UPDATE OR DELETE
        ON #{table_name}
        FOR EACH ROW
        EXECUTE PROCEDURE table_update_notify()
      ")
    end

    def create_notifier!
      db.run("
        CREATE OR REPLACE FUNCTION table_update_notify() RETURNS trigger AS $$
        DECLARE
          id bigint;
        BEGIN
        CASE TG_OP
          WHEN 'INSERT', 'UPDATE' THEN
            id := NEW.id;
          WHEN 'DELETE' THEN
            id := OLD.id;
          END CASE;

          PERFORM pg_notify('table_update', json_build_object('table', TG_TABLE_NAME, 'id', id, 'type', TG_OP)::text);
          RETURN NEW;
        END;
        $$ LANGUAGE plpgsql
      ")
    end
  end
end
