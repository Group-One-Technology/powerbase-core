class CreatePiis < ActiveRecord::Migration[6.1]
  def change
    create_table :piis do |t|
      t.string :name, null: false
      t.string :abbreviation
    end

    Pii.create(name: "Full Name", abbreviation: "Name")
    Pii.create(name: "Social Security Number", abbreviation: "SSN")
    Pii.create(name: "Driver's License")
    Pii.create(name: "Address")
    Pii.create(name: "Email Address", abbreviation: "Email")
    Pii.create(name: "Telephone Number")
    Pii.create(name: "Mobile Number")
    Pii.create(name: "Date of Birth", abbreviation: "Birthdate")
    Pii.create(name: "Debit Card")
    Pii.create(name: "Credit Card")
  end
end
