/*!
 * (c) 2015 Jaden Dessureault
 * This code is licensed under MIT license (see LICENSE for details)
 */

'use strict';

class Whirl {

  /**
   * Sets all property defaults, custom values
   *
   * @param {Object} zone
   * - The drop zone html element
   */
  constructor(zone = {}) {
    let children;

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
      height: window.innerHeight,
    };

    this.canvas = this.createCanvas();

    // Bind methods to the event listeners
    this.canvas.onmousedown = () => this.dragging = true;
    this.canvas.onmouseup = () => this.dragging = false;
    this.canvas.onmousemove = this.changeImage.bind(this);

    this.context = this.canvas.getContext('2d');

    // Set values
    this.zone = zone;

    this.classes = {
      splash: 'whirl-splash',
      loading: 'whirl-loading',
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

      for (let i = 0; i < children.length; i++) {
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
  createCanvas() {
    let canvas = this.canvas = document.createElement('canvas');

    return canvas;
  }

  /**
   * Insert the canvas into the DOM
   *
   * @param {Object} size
   * - Width and height to make the canvas
   */
  insertCanvas(size) {
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
  drag(event) {
    event.preventDefault();

    let classes = event.target.classList;

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
  drop(event) {
    event.preventDefault();

    // Don't allow any images to be added after the initial drop
    if (this.total > 0) {
      return alert('You cant add anymore images.');
    }

    // Get the array of files that were dropped in
    let files = event.dataTransfer.files;

    let file;
    let reader;

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

    for (let i = 0; i < files.length; i++) {
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
  changeImage(event) {
    let left = event.offsetX - event.target.offsetLeft;
    let _current;

    if (this.dragging) {

      // Calculate the current position by scaling mouse position
      _current = Math.floor((this.total * left) / this.size.width);

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
  getScaledSize(image) {
    let ratio = image.width / image.height;

    let height = this.size.height;
    let width = height * ratio;

    this.size.width = width;
    this.size.height = height;

    return {
      width: width,
      height: height,
    };
  }

  /**
   * Convert the original image
   * to a scaled version from the canvas
   *
   * @return {String}
   * - The DataURI of the new scaled image
   */
  getScaledImage() {
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
  loadImage(reader, index, size) {
    let image = new Image();
    let scaled = new Image();
    let added;

    let add = (img, _scaled) => {

      if (_scaled) {
        scaled.width = image.width;
        scaled.height = image.height;
      }

      this.images[index] = img;

      added = Object.keys(this.images).length;

      // Remove active class from drag element
      this.zone.classList.remove('drag-active');

      // The last image
      if (added === this.total) {
        this.canvas.hidden = false;
        this.hideLoading();
        this.hideZone();

        return;
      }
    };

    image.onload = () => {

      // Insert the canvas, based on image dimensions
      this.insertCanvas(this.getScaledSize(image));

      // Insert the original image into the canvas context
      this.insertImage(image);

      // Image is larger than 2MB
      if (size >= 2e6) {

        scaled.onload = () => {
          add(scaled, true);
        };

        scaled.src = this.getScaledImage();
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
  insertImage(image) {
    let size = this.getScaledSize(image);

    this.context.drawImage(image, 0, 0, size.width, size.height);
  }

  /**
   * Remove the drop zone from the DOM
   */
  hideZone() {
    this.zone && document.body.removeChild(this.zone);
  }

  /**
   * Display the splash screen
   */
  showSplash() {
    let node;

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
  hideSplash() {
    this.splash.hidden = true;
  }

  /**
   * Display the loading screen
   */
  showLoading() {
    let node;
    let percentNode;

    let label = 'Loading...';

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
  hideLoading() {

    // If the node exists, remove it
    this.loading.hidden = true;
  }
}
