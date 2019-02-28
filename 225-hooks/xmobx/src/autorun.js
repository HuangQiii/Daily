import manager from './manager';

export default autorun = function(observer) {
  manager.startCollect(observer);
  observer();
  manager.finishCollect();
}