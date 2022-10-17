import Controller from '@ember/controller';

// BEGIN-SNIPPET cookbook-tabs-with-query-params-controller.js
export default class TabsQueryParamController extends Controller {
  queryParams = ['tab'];
  tab = 'first';
}
// END-SNIPPET
