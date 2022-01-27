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
    @records = sequel_connect(self.db) do |db|
      db.from(self.name)
        .order(order)
        .all
    end
  end
end