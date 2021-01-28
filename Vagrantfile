Vagrant.configure("2") do |config|
  config.vm.box = "ubuntu/xenial64"
  # config.vm.hostname = "lamp"
  # config.vm.synced_folder ".", "/vagrant", type: "virtualbox" # fix for bug with jessie64
  config.vm.network "private_network", ip: "192.168.75.75"
  config.vm.provision :shell, path: "server/server-bootstrap.sh"
end
