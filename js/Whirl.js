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

    var children = undefined;

    // Inital values
    this.start = 0;
    this.total = 0;
    this.current = 0;
    this.added = 0;
    this.min = 5;
    this.dragging = false;
    this.images = {};
    this.pos = {
      x: 0,
      y: 0
    };
    this.size = {
      width: 0,
      height: 650
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

    // Check for custom splash and/or loading elments
    if (this.zone.hasChildNodes) {
      children = this.zone.children;

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
      var canvas = document.createElement('canvas');

      return canvas;
    }

    /**
     * Insert the canvas into the DOM
     */

  }, {
    key: 'insertCanvas',
    value: function insertCanvas() {
      this.canvas.width = window.innerWidth;
      this.canvas.height = window.innerHeight;
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
     *
     * @return {Boolean}
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
      var left = event.offsetX - this.pos.x;
      var current = undefined;

      if (this.dragging) {

        // Calculate the current position by scaling mouse position
        current = Math.floor(this.total * left / this.size.width);

        // Cursor is over the left
        if (current < this.start) {
          current = this.total + current;
        }

        // Cursor is over the right
        else if (current >= this.total) {
            current = (this.total - current) * -1;
          }

        // Only redraw if we need to go to another image
        if (current !== this.current) {
          this.current = current;

          // Draw the new image
          this.images[current] && this.drawImage(this.images[current], this.pos, this.size);
        }
      }
    }

    /**
     * Set image size
     *
     * @param {Object} size
     * - Size to set w/ width and height
     */

  }, {
    key: 'setSize',
    value: function setSize(image) {
      var ratio = image.width / image.height;
      var size = {};

      size.height = this.size.height;
      size.width = size.height * ratio;

      this.size.width = size.width;

      !this.pos.x && this.setCentredPos();

      return size;
    }

    /**
     * Calculate the centred position
     * of the image in the window
     */

  }, {
    key: 'setCentredPos',
    value: function setCentredPos() {
      this.pos = {
        x: window.innerWidth / 2 - this.size.width / 2,
        y: window.innerHeight / 2 - this.size.height / 2
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
      var pos = this.pos;
      var size = this.size;
      var url = undefined;

      // Get the drawn image
      var data = this.context.getImageData(pos.x, pos.y, size.width, size.height);

      // Original canvas size
      var canvas = {
        width: this.canvas.width,
        height: this.canvas.height
      };

      // Change canvas size to image size
      this.canvas.width = this.size.width;
      this.canvas.height = this.size.height;

      this.context.putImageData(data, 0, 0);

      url = this.canvas.toDataURL();

      // Set back to original
      this.canvas.width = canvas.width;
      this.canvas.height = canvas.height;

      return url;
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

      var add = function add(img, _scaled) {
        var added = undefined;

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

          // Draw the first image
          _this2.drawImage(_this2.images[0], _this2.pos, _this2.size);

          return;
        }
      };

      image.onload = function () {

        // Insert the canvas
        _this2.insertCanvas();

        _this2.setSize(image);

        // Draw the original image into the canvas context
        _this2.drawImage(image, _this2.pos, _this2.size);

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
     * Draw an image onto the canvas
     *
     * @param {Object} image
     * - The image object to draw
     *
     * @param {Object} pos
     * - Position coordinates x and y
     *
     * @param {Object} size
     * - Width and height of the image
     */

  }, {
    key: 'drawImage',
    value: function drawImage(image, pos, size) {
      this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
      this.context.drawImage(image, pos.x, pos.y, size.width, size.height);
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

        // Append into the drop zone
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

        // Append into the drop zone
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
