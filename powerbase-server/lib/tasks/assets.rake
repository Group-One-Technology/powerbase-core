task_exists = Rake.application.tasks.any? { |t| t.name == 'assets:precompile' }
Rake::Task["assets:precompile"].clear if task_exists

namespace :assets do
  task :precompile do
    puts "Does not precompile..."
  end
end