'use strict';

class Whirl {

  /**
   * Sets all property defaults, custom values
   *
   * @param {Object} zone
   * - The drop zone node element
   *
   * @param {Number} width
   * - Width (in pixels) the images should be displayed at
   */
  constructor(zone = {}, width = 900) {

    // Inital values
    this.start = 0;
    this.total = 0;
    this.current = 0;
    this.min = 5;
    this.dragging = false;
    this.images = {};
    this.size = {
      width: 0,
      height: window.outerHeight,
    };

    this.canvas = this.createCanvas();

    this.canvas.onmousedown = () => this.dragging = true;
    this.canvas.onmouseup = () => this.dragging = false;
    this.canvas.onmousemove = this.changeImage.bind(this);

    this.context = this.canvas.getContext('2d');

    // Set values
    this.zone = zone;
    this.width = width;

    this.classes = {
      splash: 'whirl-splash',
      loading: 'whirl-loading',
    };

    // Prevent the default drag events
    this.zone.ondragover = this.drag;
    this.zone.ondragenter = this.drag;
    this.zone.ondragleave = this.drag;

    // Add drop listener to the slider element
    this.zone.ondrop = () => this.drop();

    let children = this.zone.children;

    if (this.zone.hasChildNodes) {
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

  createCanvas() {
    let canvas = this.canvas = document.createElement('canvas');

    return canvas;
  }

  insertCanvas(size) {
    this.canvas.width = size.width;
    this.canvas.height = size.height;
    this.canvas.style.cursor = 'ew-resize';
    this.canvas.hidden = true;

    // Insert canvas right before the drop zone
    document.body.insertBefore(this.canvas, zone);
  }

  /**
   * [cancel description]
   * @param  {[type]} event [description]
   * @return {[type]}       [description]
   */
  drag(event) {
    event.preventDefault && event.preventDefault();

    let classes = event.target.classList;

    if (!classes.contains('drag-active')) {
      classes.add('drag-active');
    } else if (event.type === 'dragleave') {
      classes.remove('drag-active');
    }

    return false;
  }

  drop(event) {
    event = event || window.event;

    event.preventDefault && event.preventDefault();

    // Don't allow any images to be added after the initial drop
    if (this.total > 0) {
      return alert('You cant add anymore images.');
    }

    let files = event.dataTransfer.files;

    let file;
    let reader;

    this.total = files.length;

    if (this.total < this.min) {
      this.total = 0;
      files = null;

      event = null;

      return alert('You need to select at least 5 images.');
    }

    this.showLoading();
    this.hideSplash();

    for (let i = 0; i < files.length; i++) {
      file = files[i];

      reader = new FileReader();

      reader.readAsDataURL(file);

      reader.onloadend = this.loadImage.bind(this, reader, file, i);
    }
  }

  changeImage(event) {
    let left = event.offsetX - event.target.offsetLeft;
    let _current;

    if (this.dragging) {
      _current = Math.floor((this.total * left) / this.size.width);

      // Only redraw if we need to go to another image
      if (_current !== this.current) {
        this.current = _current;

        if (_current === 0) {
          this.canvas.style.cursor = 'e-resize';
        } else if (_current === this.total - 1) {
          this.canvas.style.cursor = 'w-resize';
        } else {
          this.canvas.style.cursor = 'ew-resize';
        }

        this.context.drawImage(this.images[_current], 0, 0, this.size.width, this.size.height);
      }
    }
  }

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

  getScaledImage() {
    return this.canvas.toDataURL();
  }

  /**
   * [loadImage description]
   * @return {[type]} [description]
   */
  loadImage(reader, file, index) {
    let image = new Image();
    let scaled = new Image();

    image.onload = () => {

      // Insert the canvas, based on image dimensions
      this.insertCanvas(this.getScaledSize(image));

      // Insert the original image into the canvas context
      this.insertImage(image);

      scaled.onload = () => {

        // scaled.name = file.name;
        scaled.width = image.width;
        scaled.height = image.height;

        this.images[index] = scaled;

        // On the last image
        if (index === this.total - 1) {
          this.canvas.hidden = false;

          // hide the loading screen
          this.hideLoading();

          this.hideZone();
        }

        // Remove active class from drag element
        this.zone.classList.remove('drag-active');
      };

      scaled.src = this.getScaledImage();
    };

    image.src = reader.result;

    if (image.complete || image.readyState === 4) image.onload();
  }

  insertImage(image) {
    let size = this.getScaledSize(image);

    this.context.drawImage(image, 0, 0, size.width, size.height);
  }

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

  hideSplash() {
    this.splash.hidden = true;
  }

  /**
   * Display the loading screen
   */
  showLoading() {
    let node;

    if (!this.loading) {
      node = document.createElement('div');

      node.className = this.classes.loading;
      node.textContent = 'Loading...';

      // Append into the slider element
      this.zone.appendChild(node);

      this.loading = node;
    } else {
      this.loading.hidden = false;
    }
  }

  hideLoading() {
    // If the node exists, remove it
    this.loading.hidden = true;
  }

  next() {
    this.current++;
  }

  previous() {
    this.current--;
  }
}
