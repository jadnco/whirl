/*!
 * (c) 2015 Jaden Dessureault
 * This code is licensed under MIT license (see LICENSE for details)
 */

'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Whirl = (function () {

  /**
   * Sets all property defaults, custom values
   *
   * @param {Object} zone
   * - The drop zone html element
   */

  function Whirl() {
    var _this = this;

    var zone = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

    _classCallCheck(this, Whirl);

    // Inital values
    this.start = 0;
    this.total = 0;
    this.current = 0;
    this.added = 0;
    this.min = 5;
    this.dragging = false;
    this.images = {};
    this.size = {
      width: 0,
      height: window.innerHeight
    };

    this.canvas = this.createCanvas();

    // Bind methods to the event listeners
    this.canvas.onmousedown = function () {
      return _this.dragging = true;
    };
    this.canvas.onmouseup = function () {
      return _this.dragging = false;
    };
    this.canvas.onmousemove = this.changeImage.bind(this);

    this.context = this.canvas.getContext('2d');

    // Set values
    this.zone = zone;

    this.classes = {
      splash: 'whirl-splash',
      loading: 'whirl-loading'
    };

    // Prevent the default drag events
    this.zone.ondragover = this.drag;
    this.zone.ondragenter = this.drag;
    this.zone.ondragleave = this.drag;

    // Add drop listener to the slider element
    this.zone.ondrop = this.drop.bind(this);

    var children = this.zone.children;

    // Check for custom splash and/or loading elments
    if (this.zone.hasChildNodes) {
      for (var i = 0; i < children.length; i++) {
        if (this.zone.children[i].className === this.classes.loading) {
          this.loading = children[i];

          this.hideLoading();
        } else if (this.zone.children[i].className === this.classes.splash) {
          this.splash = children[i];

          this.showSplash();
        }
      }
    }

    // Show splash screen
    this.showSplash();
  }

  /**
   * Creat the canvas element
   *
   * @return {Object}
   * - Referece to the canvas element
   */

  _createClass(Whirl, [{
    key: 'createCanvas',
    value: function createCanvas() {
      var canvas = this.canvas = document.createElement('canvas');

      return canvas;
    }

    /**
     * Insert the canvas into the DOM
     *
     * @param {Object} size
     * - Width and height to make the canvas
     */

  }, {
    key: 'insertCanvas',
    value: function insertCanvas(size) {
      this.canvas.width = size.width;
      this.canvas.height = size.height;
      this.canvas.style.cursor = 'ew-resize';
      this.canvas.hidden = true;

      // Insert canvas right before the drop zone
      document.body.insertBefore(this.canvas, zone);
    }

    /**
     * Adds active class to the drop zone
     * to indicate that files are being dragged over
     *
     * @param {Object} event
     * - Mouse event
     *
     * @return {Boolean}
     */

  }, {
    key: 'drag',
    value: function drag(event) {
      event.preventDefault();

      var classes = event.target.classList;

      if (!classes.contains('drag-active')) {
        classes.add('drag-active');
      } else if (event.type === 'dragleave') {
        classes.remove('drag-active');
      }

      return false;
    }

    /**
     * Reads the dropped files
     *
     * @param {Object} event
     * - drop event
     */

  }, {
    key: 'drop',
    value: function drop(event) {
      event.preventDefault();

      // Don't allow any images to be added after the initial drop
      if (this.total > 0) {
        return alert('You cant add anymore images.');
      }

      // Get the array of files that were dropped in
      var files = event.dataTransfer.files;

      var file = undefined;
      var reader = undefined;

      this.total = files.length;

      // Make sure the min has been added
      // Some weird bugs occur otherwise
      if (this.total < this.min) {
        this.total = 0;
        files = null;

        return alert('You need to select at least 5 images.');
      }

      this.showLoading();
      this.hideSplash();

      for (var i = 0; i < files.length; i++) {
        file = files[i];

        reader = new FileReader();

        reader.readAsDataURL(file);

        reader.onloadend = this.loadImage.bind(this, reader, i, file.size);
      }

      return false;
    }

    /**
     * Draw the next or previos image
     *
     * @param {Object} event
     * - the mouse event
     */

  }, {
    key: 'changeImage',
    value: function changeImage(event) {
      var left = event.offsetX - event.target.offsetLeft;
      var _current = undefined;

      if (this.dragging) {

        // Calculate the current position by scaling mouse position
        _current = Math.floor(this.total * left / this.size.width);

        // Only redraw if we need to go to another image
        if (_current !== this.current) {
          this.current = _current;

          if (_current === 0) {

            // No more images to the left
            this.canvas.style.cursor = 'e-resize';
          } else if (_current === this.total - 1) {
            this.canvas.style.cursor = 'w-resize';
          } else {
            this.canvas.style.cursor = 'ew-resize';
          }

          // Draw the new image
          this.context.drawImage(this.images[_current], 0, 0, this.size.width, this.size.height);
        }
      }
    }

    /**
     * Scale the original image size to defined size
     *
     * @param {Object} image
     * - The original image
     *
     * @return {Object}
     * - The scaled dimensions
     */

  }, {
    key: 'getScaledSize',
    value: function getScaledSize(image) {
      var ratio = image.width / image.height;

      var height = this.size.height;
      var width = height * ratio;

      this.size.width = width;
      this.size.height = height;

      return {
        width: width,
        height: height
      };
    }

    /**
     * Convert the original image
     * to a scaled version from the canvas
     *
     * @return {String}
     * - The DataURI of the new scaled image
     */

  }, {
    key: 'getScaledImage',
    value: function getScaledImage() {
      return this.canvas.toDataURL();
    }

    /**
     * Load the image from the reader
     * build the images array
     *
     * @param {Object} reader
     * - The reader object which holds the original image
     *
     * @param {Integer} index
     * - Current index relative to all files
     */

  }, {
    key: 'loadImage',
    value: function loadImage(reader, index, size) {
      var _this2 = this;

      var image = new Image();
      var scaled = new Image();
      var added = undefined;

      var add = function add(img, _scaled) {

        if (_scaled) {
          scaled.width = image.width;
          scaled.height = image.height;
        }

        _this2.images[index] = img;

        added = Object.keys(_this2.images).length;

        // Remove active class from drag element
        _this2.zone.classList.remove('drag-active');

        // The last image
        if (added === _this2.total) {
          _this2.canvas.hidden = false;
          _this2.hideLoading();
          _this2.hideZone();

          return;
        }
      };

      image.onload = function () {

        // Insert the canvas, based on image dimensions
        _this2.insertCanvas(_this2.getScaledSize(image));

        // Insert the original image into the canvas context
        _this2.insertImage(image);

        // Image is larger than 2MB
        if (size >= 2e6) {

          scaled.onload = function () {
            add(scaled, true);
          };

          scaled.src = _this2.getScaledImage();
        } else {

          add(image);
        }
      };

      image.src = reader.result;

      if (image.complete && image.readyState === 4) image.onload();
    }

    /**
     * Draw the scaled image into the canvas
     *
     * @param {Object} image
     * - The original image
     */

  }, {
    key: 'insertImage',
    value: function insertImage(image) {
      var size = this.getScaledSize(image);

      this.context.drawImage(image, 0, 0, size.width, size.height);
    }

    /**
     * Remove the drop zone from the DOM
     */

  }, {
    key: 'hideZone',
    value: function hideZone() {
      this.zone && document.body.removeChild(this.zone);
    }

    /**
     * Display the splash screen
     */

  }, {
    key: 'showSplash',
    value: function showSplash() {
      var node = undefined;

      // Custom splash element wasn't found
      // so create a default one
      if (!this.splash) {
        node = document.createElement('div');

        node.className = this.classes.splash;
        node.textContent = 'Drag & drop your images';

        // Append into the slider element
        this.zone.appendChild(node);

        this.splash = node;
      }

      this.splash.hidden = false;
    }

    /**
     * Hide the splash screen
     */

  }, {
    key: 'hideSplash',
    value: function hideSplash() {
      this.splash.hidden = true;
    }

    /**
     * Display the loading screen
     */

  }, {
    key: 'showLoading',
    value: function showLoading() {
      var node = undefined;
      var percentNode = undefined;

      var label = 'Loading...';

      if (!this.loading) {
        node = document.createElement('div');

        node.className = this.classes.loading;
        node.textContent = label;

        // Append into the slider element
        this.zone.appendChild(node);

        this.loading = node;
      } else {
        this.loading.hidden = false;
      }
    }

    /**
     * Hide the loading screen
     */

  }, {
    key: 'hideLoading',
    value: function hideLoading() {

      // If the node exists, remove it
      this.loading.hidden = true;
    }
  }]);

  return Whirl;
})();