module Indexable
  include SequelHelper
  extend ActiveSupport::Concern

  def doc_id
  end

  def reindex!
    migrator.index!
  end

  def reindex_later!
    TableIndexWorker.perform_async(self.id)
  end

  def sequel_records(order: nil)
    sequel_connect(self.db) do |db|
      table_query = db.from(self.name)
      @records = table_query.select(*default_table_select(self.db.adapter.to_sym, self.db.has_row_oid_support?))
        .order(order)
        .all
    end
  end
end