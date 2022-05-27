module FieldTypeHelper
  def single_line_text_field
    @single_line_text_field ||= PowerbaseFieldType.find_by(name: "Single Line Text")
  end

  def long_text_field_type
    PowerbaseFieldType.find_by(name: "Long Text")
  end

  def date_field_type
    PowerbaseFieldType.find_by(name: "Date")
  end

  def number_field_type
    PowerbaseFieldType.find_by(name: "Number")
  end
end