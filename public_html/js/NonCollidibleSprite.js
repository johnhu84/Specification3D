/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


/**
 * 文件名: NonCollidibleSprite.js
 * threejs 3D 展品控制器
 *
 * @version V 1.00   2016-05-10
 * @author Chunlin Hu
 */
( function () {

	THREE.NonCollidibleSprite = function ( object, domElement, parameters, textSprite ) {
            THREE.Sprite.call(this);
            var self = this;

        this.toJSON = function() {
        return {
            description: self.message,
            origin: {
                x: self.origin.x,
                y: self.origin.y,
                z: self.origin.z
            },
            target: {
                x: self.target.x,
                y: self.target.y,
                z: self.target.z
            }
        };
    };

};

	THREE.NonCollidibleSprite.prototype = Object.create( THREE.Sprite.prototype );
	THREE.NonCollidibleSprite.prototype.constructor = THREE.NonCollidibleSprite;
}() );