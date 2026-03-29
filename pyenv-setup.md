Do `brew install pyenv`.

Then install a version using `pyenv install <<version>>`

And then pick `pyenv global <<version>>` or `pyenv local <<version>>`.

```sh
echo 'export PYENV_ROOT="$HOME/.pyenv"' >> ~/.zshrc
echo 'export PATH="$PYENV_ROOT/shims:$PYENV_ROOT/bin:$PATH"' >> ~/.zshrc
echo 'eval "$(pyenv init -)"' >> ~/.zshrc
source ~/.zshrc
```