
if defined? Rails::Server
  PowerbaseDatabase.turbo.each do |db|
    db.listen!
    puts "Listening to #{db.name}...."
  end
end