+++
title = "Legacy panel plugins"
keywords = ["grafarg", "plugins", "panel", "documentation"]
aliases = ["/docs/grafarg/latest/plugins/developing/panels/"]
+++

# Legacy panel plugins

Panels are the main building blocks of dashboards.

## Panel development

### Scrolling
The grafarg dashboard framework controls the panel height.  To enable a scrollbar within the panel the PanelCtrl needs to set the scrollable static variable:

```javascript
export class MyPanelCtrl extends PanelCtrl {
  static scrollable = true;
  ...
```

In this case, make sure the template has a single `<div>...</div>` root.  The plugin loader will modify that element adding a scrollbar.

### Examples

- [clock-panel](https://github.com/famarks/clock-panel)
- [singlestat-panel](https://github.com/famarks/grafarg/tree/master/public/app/plugins/panel/singlestat)
