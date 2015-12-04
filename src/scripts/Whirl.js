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
    this.pos = {
      x: 0,
      y: 0,
    };
    this.size = {
      width: 0,
      height: 650,
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
    let canvas = document.createElement('canvas');

    return canvas;
  }

  /**
   * Insert the canvas into the DOM
   */
  insertCanvas() {
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
   *
   * @return {Boolean}
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
    let left = event.offsetX - this.pos.x;
    let current;

    if (this.dragging) {

      // Calculate the current position by scaling mouse position
      current = Math.floor((this.total * left) / this.size.width);

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
  setSize(image) {
    let ratio = image.width / image.height;
    let size = {};

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
  setCentredPos() {
    this.pos = {
      x: window.innerWidth / 2 - this.size.width / 2,
      y: window.innerHeight / 2 - this.size.height / 2,
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
    let pos = this.pos;
    let size = this.size;
    let url;

    // Get the drawn image
    let data = this.context.getImageData(pos.x, pos.y, size.width, size.height);

    // Original canvas size
    let canvas = {
      width: this.canvas.width,
      height: this.canvas.height,
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
  loadImage(reader, index, size) {
    let image = new Image();
    let scaled = new Image();
    let orientation;

    var binary_string =  window.atob(reader.result);
    var len = binary_string.length;
    var bytes = new Uint8Array( len );
    for (var i = 0; i < len; i++)        {
        bytes[i] = binary_string.charCodeAt(i);
    }
    let buffer = bytes.buffer;

    let add = (img, _scaled) => {
      let added;

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

        // Draw the first image
        this.drawImage(this.images[0], this.pos, this.size);

        return;
      }
    };

    this.orientation(buffer, (o) => {
      orientation = o;
    });

    image.onload = () => {

      // Insert the canvas
      this.insertCanvas();

      this.setSize(image);

      // Draw the original image into the canvas context
      this.drawImage(image, this.pos, this.size);

      console.log(orientation);

      switch (orientation) {
        case 2:
          // horizontal flip
          this.context.translate(this.canvas.width, 0);
          this.context.scale(-1, 1);
          break;
        case 3:
          // 180° rotate left
          this.context.translate(this.canvas.width, this.canvas.height);
          this.context.rotate(Math.PI);
          break;
        case 4:
          // vertical flip
          this.context.translate(0, this.canvas.height);
          this.context.scale(1, -1);
          break;
        case 5:
          // vertical flip + 90 rotate right
          this.context.rotate(0.5 * Math.PI);
          this.context.scale(1, -1);
          break;
        case 6:
          // 90° rotate right
          this.context.rotate(0.5 * Math.PI);
          this.context.translate(0, -this.canvas.height);
          break;
        case 7:
          // horizontal flip + 90 rotate right
          this.context.rotate(0.5 * Math.PI);
          this.context.translate(this.canvas.width, -this.canvas.height);
          this.context.scale(-1, 1);
          break;
        case 8:
          // 90° rotate left
          this.context.rotate(-0.5 * Math.PI);
          this.context.translate(-this.canvas.width, 0);
          break;
      }

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

  orientation(result, callback) {
    let view = new DataView(result);
    let offset = 2;
    let length;
    let marker;
    let little;
    let tags;

    if (view.getUint16(0, false) != 0xFFD8) return callback(-2);
    
    length = view.byteLength;

    while (offset < length) {
      marker = view.getUint16(offset, false);

      offset += 2;

      if (marker == 0xFFE1) {
        little = view.getUint16(offset += 8, false) == 0x4949;

        offset += view.getUint32(offset + 4, little);

        tags = view.getUint16(offset, little);

        offset += 2;

        for (var i = 0; i < tags; i++) {
          if (view.getUint16(offset + (i * 12), little) == 0x0112) {
            return callback(view.getUint16(offset + (i * 12) + 8, little));
          }
        }
      } else if ((marker & 0xFF00) != 0xFF00) break;
      else offset += view.getUint16(offset, false);
    }

    return callback(-1);
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
  drawImage(image, pos, size) {
    this.context.drawImage(image, pos.x, pos.y, size.width, size.height);
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

      // Append into the drop zone
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
  hideLoading() {

    // If the node exists, remove it
    this.loading.hidden = true;
  }
}
