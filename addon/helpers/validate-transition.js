import { helper } from '@ember/component/helper';
import { Promise } from 'rsvp';

export function validateTransition([transition], { with: validator }) {
  return function() {
    return new Promise(resolve => {
      validator(resolve);
    }).then(() => {
      transition();
    });
  };
}

export default helper(validateTransition);
