class Task < ApplicationRecord
  enum status: {pending: "pending", running: "running", completed: "completed"}

  belongs_to :taskable, polymorphic: true
  scope :ordered, -> {order(:status)}
  

  def object
    return unless super.present?
    YAML.load(super)
  end

  def raw_object
    object.class_name.constantize.find(object.id)
  end


  def self.create_object(arg)
    YAML.dump(OpenStruct.new(arg))
  end
end
