class Pii < ApplicationRecord
  validates :name, presence: true

  def self.is_pii?(data)
    piis = Pii.all

    data = data.to_s.downcase.gsub("_"," ")
    piis.each do |pii|
      return true if data.include?(pii.name.downcase)
      return true if pii.abbreviation != nil && pii.abbreviation.length > 0 && data.include?(pii.abbreviation.downcase)
    end

    false
  end
end
