# Pattern Lab Node

This project is built with [Pattern Lab Node](https://github.com/pattern-lab/edition-node-gulp).

## Installing

In order to get Pattern Lab up and running in your local environment.

1. Download or clone this repository to your local machine.
2. If gulp is not installed on your computer, install it using `npm install gulp-cli -g` in the command line. If that doesn't work, try the `sudo npm install gulp-cli -g` command.
3. In the command line, navigate to the root of the project, then run `npm install` to download the project's dependencies.
4. Run `gulp patternlab:serve` to build Pattern Lab and watch for changes.
5. Visit `http://localhost:3000/` in your browser to view Pattern Lab.

## Exporting to the Style Guide

Pattern Lab serves as the [workshop](http://bradfrost.com/blog/post/the-workshop-and-the-storefront/) where the design system design and development is done. The style guide serves as the storefront where the patterns and documentation are presented. Here's how to export patterns and other assets from Pattern Lab into the style guide:


1. Make sure the Pattern Lab and style guide repositories are sitting adjacent to each other, like so:

```
pattern-lab/
style-guide/
```

2. Navigate to the root of the Pattern Lab in the command line:

```
cd /path/to/pattern-lab
```

3. Run the `style-guide-export` command:

```
gulp style-guide-export
```


This command will copy the following files and directories into the style guide project file structure:

- `public/patterns/` => `includes/patterns`
- `public/patterns/` => `patterns`
- `public/icons.svg` => `icons.svg`
- `public/css/` => `css/`
- `public/js/` => `js/`
- `public/images` => `images/`

Once those assets are imported into this repository, the style guide is ready to build.

## Pattern Lab Documentation
Please view [Pattern Lab's documentation](http://patternlab.io/docs/index.html) for info on how to use the tool.

## Helpful Commands

These are some helpful commands you can use on the command line for working with Pattern Lab.

> Reminder: These commands assume a global installation of gulp 4.X, instead of a local installation.

### List all of the available commands

To list all available commands type:

    gulp patternlab:help

### Generate Pattern Lab

To generate the front-end for Pattern Lab type:

    gulp patternlab:build

### Watch for changes and re-generate Pattern Lab

To watch for changes, re-generate the front-end, and server it via a BrowserSync server,  type:

    gulp patternlab:serve

BrowserSync should open [http://localhost:3000](http://localhost:3000)
