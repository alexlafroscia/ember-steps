# Tab Selection Bound to Query Param

Often times, you might want to store the active tab in the URL, so that the user can come back to the same place they left off. This also allows you to use regular `link-to` helpers to transition between tabs. Just make sure that the query param that's passed in is always equal to a valid step name.

<DocsDemo as |demo|>
<demo.example @name="cookbook-tabs-with-query-params.hbs">
<TabGroup>
<TabLink @route='docs.cookbook.tabs-query-param' @query={{hash tab='first'}}>
Link to First Tab
</TabLink>
<TabLink @route='docs.cookbook.tabs-query-param' @query={{hash tab='second'}}>
Link to Second Tab
</TabLink>
</TabGroup>

    <StepManager @currentStep={{this.tab}} as |w|>
      <w.Step @name='first'>
        This content is on the first tab
      </w.Step>

      <w.Step @name='second'>
        This content is on the second tab
      </w.Step>
    </StepManager>

</demo.example>

<demo.snippet @name="cookbook-tabs-with-query-params.hbs" />
<demo.snippet
@name="cookbook-tabs-with-query-params-controller.js"
@label="controller.js"
/>
</DocsDemo>
