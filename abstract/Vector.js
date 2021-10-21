/** Simple vector class. **/
class Vector {
	/**
	 * Create a new Vector.
	 * @param [x=0] {int} - x coordinate
	 * @param [y=0] {int} - y coordinate
	 */
	constructor(x = 0, y = 0) {
		this.x = x;
		this.y = y;
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
		return new Vector(
			this.x - inputVector.x,
			this.y - inputVector.y
		);
	}
}

// module.exports = Vector;
export default Vector;
