/**
 * Simple vector class.
 */
class Vector {
	/**
	 * Create a new Vector.
	 * @param [x=0] {float} - x coordinate
	 * @param [y=0] {float} - y coordinate
	 */
	constructor(x = 0, y = 0) {
		/**
		 * X value.
		 * @type {float}
		 */
		this.x = parseFloat(x);

		/**
		 * Y value.
		 * @type {float}
		 */
		this.y = parseFloat(y);
	}

	/**
	 * Returns a new vector which is the result of adding this and another vector.
	 * @param inputVector {Vector} - Vector to add.
	 * @returns {Vector} Sum of this vector and inputVector
	 */
	add(inputVector) {
		return new Vector(
			this.x + inputVector.x,
			this.y + inputVector.y
		);
	}

	/**
	 * Returns a new vector which is the result of subtracting inputVector from this vector.
	 * @param inputVector {Vector} - Vector to subtract.
	 * @returns {Vector} Result of subtracting inputVector from this one.
	 */
	subtract(inputVector) {
		if(inputVector instanceof Vector == false) { ///MOVE
			console.error("not a vector");
			throw new Error("inputVector not a Vector");
		}

		return new Vector(
			this.x - inputVector.x,
			this.y - inputVector.y
		);
	}

	/**
	 * Returns a new vector which is the result of dividing the components of this one by a number.
	 * @param divisor {float} - Vector to subtract.
	 * @returns {Vector} Result of dividing components by divisor.
	 * @todo Consider handling zero vector
	 */
	divideComponents(divisor) {
		return new Vector(
			this.x / divisor,
			this.y / divisor
		);
	}

	/**
	 * Returns a new vector which is this vector scaled by a number. Essentially multiplies the components by a number.
	 * @param amount {float} - Amount to scale the vector by.
	 * @returns {Vector} Scaled vector.
	 */
	scale(amount) {
		return new Vector(
			this.x * amount,
			this.y * amount
		);
	}

	/**
	 * Returns a normalized instance of this vector.
	 * @returns {Vector} Normalized vector.
	 * @todo Consider handling zero vector
	 */
	normalize() {
		var magnitude = this.getMagnitude();
		return this.divideComponents(magnitude);
	}

	/**
	 * Returns magnitude of vector.
	 * @returns {float}
	 */
	getMagnitude() {
		return Math.sqrt(this.x*this.x + this.y*this.y);
	}

	/**
	 * Returns new vector with properties of this vector rounded down.
	 * @returns {Vector} rounded vector.
	 */
	floor() {
		return new Vector(Math.floor(this.x), Math.floor(this.y));
	}
}

module.exports = Vector;
// export default Vector;
