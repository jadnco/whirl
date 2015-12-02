class Whirl {

  /**
   * Sets all property defaults, custom values
   *
   * @param {Object} slider
   * - The slider node element
   *
   * @param {Number} width
   * - Width (in pixels) the images should be displayed at
   */
  constructor(slider = {}, width = 900) {

    // Inital values
    this.start = 1;
    this.total = 0;
    this.current = 0;

    // Set values
    this.slider = slider;
    this.width = width;

    // TODO:
    // - Create nodes for drag drop
  }

  next() {
    this.current++;
  }

  previous() {
    this.current--;
  }

  compress() {

  }
}
