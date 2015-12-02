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
    this.start = 1;
    this.total = 0;
    this.current = 0;

    this.createCanvas();

    this.context = this.canvas.getContext('2d');

    // Set values
    this.zone = zone;
    this.width = width;

    this.classes = {
      splash: 'whirl-splash',
      loading: 'whirl-loading',
    };

    // Show splash screen
    this.showSplash();

    // Prevent the default drag events
    this.zone.addEventListener('dragover', this.cancel, false);
    this.zone.addEventListener('dragenter', this.cancel, false);

    // Add drop listener to the slider element
    this.zone.addEventListener('drop', this.drop.bind(this), false);
  }

  createCanvas() {
    this.canvas = document.createElement('canvas');
    this.canvas.id = 'whirl-slider';
  }

  /**
   * [cancel description]
   * @param  {[type]} event [description]
   * @return {[type]}       [description]
   */
  cancel(event) {
    console.log('drag event called');
    event.preventDefault && event.preventDefault();

    return false;
  }

  drop(event) {
    console.log('drop event called');
    event = event || window.event;

    // TODO: Check if already images, dont allow more

    event.preventDefault && event.preventDefault();

    this.showLoading();

    let files = event.dataTransfer.files;

    let file;
    let reader;

    for (let i = 0; i < files.length; i++) {
      file = files[i];
      reader = new FileReader();

      reader.readAsDataURL(file);

      reader.addEventListener('loadend', this.loadImage.bind(reader, (image) => {
        this.insertImage(image);
      }));
    }

    // Add the canvas to the body
    document.body.insertBefore(this.canvas, zone);
  }

  /**
   * [loadImage description]
   * @return {[type]} [description]
   */
  loadImage(callback) {
    let image = new Image();

    image.src = this.result;

    callback(image);
  }

  insertImage(image) {
    this.context.drawImage(image, 0, 0, this.width, 100);
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
      //this.canvas.appendChild(node);

      this.splash = node;
    }
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
      //this.canvas.appendChild(node);

      this.loading = node;
    }
  }

  hideLoading() {

    // If the node exists, remove it
    //this.canvas.removeChild(this.loading);
  }

  next() {
    this.current++;
  }

  previous() {
    this.current--;
  }
}
