# Whirl

[![forthebadge](http://forthebadge.com/images/badges/uses-badges.svg)](http://forthebadge.com)

An ES6 script that lets you scrub through a dropped in list of sequential images. This works particularly well for 360° rotating product images.

## Getting Started

Whirl is written in ES6, so before running in a browser you'll need to pipe it through your favourite transpiler. If you don't want to go through that hassle, you can get the transpiled version in [`gh-pages`](/tree/gh-pages).

After doing so, create an element that will be used as a drop-zone and reference the script just before the end of the `body` tag:

```html
    <div id="zone"></div>

    <script src="Whirl.js"></script>
  </body>
</html>
```

Once the script is referenced, you can create a new instance and pass in the drop-zone element as the only parameter:

```js
  var zone = document.getElementById('zone');

  var whirl = new Whirl(zone);
```

## Options

Whirl automatically inserts three nodes into the DOM: `div.whirl-splash` & `div.whirl-loading` into the `zone` and `canvas` into the `body`. You have the option to create custom `splash` and `loading` elements by manually putting them inside the `zone` element:

```html
<div id="zone">
  <div class="whirl-loading">A custom loading element</div>
  <div class="whirl-splash">A custom splash element</div>
</div>
```

## Demo

To see a working demo, head over to [jaden.io/whirl](http://jaden.io/whirl) and drop in a list of sequential images.