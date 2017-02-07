import * as dispose from '../../src/disposable/dispose'

export default FakeDisposeSource

FakeDisposeSource.from = function (disposer, stream) {
  return new FakeDisposeSource(disposer, stream.source)
}

function FakeDisposeSource (disposer, source) {
  this.source = source
  this.disposable = dispose.create(disposer)
}

FakeDisposeSource.prototype.run = function (sink, scheduler) {
  return dispose.all([this.source.run(sink, scheduler), this.disposable])
}