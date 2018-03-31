export function initialize(appInstance) {
  const metrics = appInstance.lookup('service:metrics');
  const versions = appInstance.lookup('service:project-version');

  metrics.set('context.appVersion', versions.current);
}

export default {
  initialize
};
