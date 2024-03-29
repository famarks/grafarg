# Grafarg UI components library

> **@grafarg/ui is currently in BETA**.

@grafarg/ui is a collection of components used by [Grafarg](https://github.com/famarks/grafarg)

Our goal is to deliver Grafarg's common UI elements for plugins developers and contributors.

See [package source](https://github.com/famarks/grafarg/tree/master/packages/grafarg-ui) for more details.

## Installation

`yarn add @grafarg/ui`

`npm install @grafarg/ui`

## Development

For development purposes we suggest using `yarn link` that will create symlink to @grafarg/ui lib. To do so navigate to `packages/grafarg-ui` and run `yarn link`. Then, navigate to your project and run `yarn link @grafarg/ui` to use the linked version of the lib. To unlink follow the same procedure, but use `yarn unlink` instead.

### Storybook 6.x migration

We've upgraded Storybook to version 6 and with that we will convert to using [controls](https://storybook.js.org/docs/react/essentials/controls) instead of knobs for manipulating components. Controls will not require as much coding as knobs do. Please refer to the [storybook style-guide](https://github.com/famarks/grafarg/blob/master/contribute/style-guides/storybook.md#contrls) for further information.
