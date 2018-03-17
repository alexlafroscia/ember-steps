# Tab Selection Bound to Query Param

Often times, you might want to store the active tab in the URL, so that the user can come back to the same place they left off. This also allows you to use regular `link-to` helpers to transition between tabs. Just make sure that the query param that's passed in is always equal to a valid step name.

{{docs/cookbook/tabs/demo-with-query-param tab=tab}}
