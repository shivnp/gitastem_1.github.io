# GitaSTEM

## Quick-start - running this repo locally

### Install deps

On Ubuntu:
```
sudo apt install ruby-full build-essential zlib1g-dev
sudo gem install jekyll bundler
```

On Mac:
```
brew install chruby ruby-install xz
ruby-install ruby
echo "source $(brew --prefix)/opt/chruby/share/chruby/chruby.sh" >> ~/.zshrc
echo "source $(brew --prefix)/opt/chruby/share/chruby/auto.sh" >> ~/.zshrc
echo "chruby ruby" >> ~/.zshrc
source ~/.zshrc # or restart your session
gem install jekyll bundler
```

Then:
```
bundle install
```

### Run server with livereload
```
bundle exec jekyll serve --livereload
```
----
Credits for the site template to [MLSS](https://github.com/mlinpl/mlss2023.mlinpl.org).
