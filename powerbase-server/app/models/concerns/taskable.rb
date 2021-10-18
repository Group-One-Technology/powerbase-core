module Taskable
  extend ActiveSupport::Concern

  def add_task(name: "", identifier: "", object: "", db: self)
    db.tasks.create(name: name, identifier: identifier, object: object, status: "pending")
  end
end