import { timeout } from 'ember-concurrency';

export default async function (password) {
  await timeout(1500);

  return password === 'password';
}
