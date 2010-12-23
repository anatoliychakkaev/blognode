load 'deploy' if respond_to?(:namespace) # cap2 differentiator

##################################
# Edit these
set :application, "blognode"
set :node_file, "app.js"
set :host, "node.xpend.net"
# ssh_options[:keys] = [File.join(ENV["HOME"], ".ec2", "default.pem")]
set :repository, "git@github.com:anatoliychakkaev/blognode.git"
set :branch, "master"
set :deploy_to, "/var/www/apps/#{application}"
set :application_port, "1601"
####################################

set :scm, :git
set :deploy_via, :remote_cache
role :app, host
set :user, "anatoliy"
set :use_sudo, true
set :admin_runner, 'anatoliy'
#default_run_options[:pty] = true

namespace :deploy do
  task :start, :roles => :app, :except => { :no_release => true } do
    run "#{try_sudo :as => 'root'} start #{application}"
  end

  task :stop, :roles => :app, :except => { :no_release => true } do
    run "#{try_sudo :as => 'root'} stop #{application}"
  end

  task :restart, :roles => :app, :except => { :no_release => true } do
    run "#{try_sudo :as => 'root'} restart #{application} || #{try_sudo :as => 'root'} start #{application}"
  end

  desc "Symlink config files"
  task :symlink_configs, :roles => :app do
    %w[app_config.yml].each do |f|
      run "ln -sf #{shared_path}/config/#{f} #{release_path}/config/#{f}"
    end
  end

  desc "Check required packages and install if packages are not installed"
  task :check_packages, roles => :app do
    run "cd #{release_path} && jake depends"
  end

  task :create_deploy_to_with_sudo, :roles => :app do
    run "#{try_sudo :as => 'root'} mkdir -p #{deploy_to}"
    run "#{try_sudo :as => 'root'} chown #{admin_runner}:#{admin_runner} #{deploy_to}"
  end

  task :write_upstart_script, :roles => :app do
    upstart_script = <<-UPSTART
  description "#{application}"

  start on startup
  stop on shutdown

  script
      # We found $HOME is needed. Without it, we ran into problems
      export HOME="/home/#{admin_runner}"

      cd #{current_path}
      exec sudo -u #{admin_runner} sh -c "/usr/local/bin/node #{current_path}/#{node_file} >> #{shared_path}/log/#{application}.log 2>&1"
  end script
  respawn
UPSTART
  put upstart_script, "/tmp/#{application}_upstart.conf"
    run "#{try_sudo :as => 'root'} mv /tmp/#{application}_upstart.conf /etc/init/#{application}.conf"
  end

  desc "Update submodules"
  task :update_submodules, :roles => :app do
    run "cd #{release_path}; git submodule init && git submodule update"
  end

  task :create_deploy_to_with_sudo, :roles => :app do
    run "sudo mkdir -p #{deploy_to}"
    run "sudo chown #{admin_runner}:#{admin_runner} #{deploy_to}"
  end

end

before 'deploy:setup', 'deploy:create_deploy_to_with_sudo'
after 'deploy:setup', 'deploy:write_upstart_script'
after "deploy:finalize_update", "deploy:update_submodules", "deploy:symlink_configs", "deploy:check_packages"
