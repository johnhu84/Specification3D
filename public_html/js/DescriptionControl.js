/**
 * 文件名: DescriptionControl.js
 * threejs 3D 展品控制器
 *
 * @version V 1.00   2016-05-10
 * @author Chunlin Hu
 */
( function () {

    THREE.DescriptionControl = function ( object, domElement, parameters, textSprite ) {
        var self = this;
            
        this._printerControl = ( parameters.printerControl !== undefined ) ? parameters.printerControl : null;
        this._object = object;
        this.id = ( parameters.id !== undefined ) ? parameters.id : null;
        //for an animation 3D object, there could be many states after each animation, defaults to 0, which means before any animation
        this.currentAnimationState = ( parameters.currentAnimationState !== void 0) ? parameters.currentAnimationState : 0;
        this.line = (parameters.line !== undefined) ? parameters.line : null;
        this._pivot = (parameters.pivot !== undefined) ? parameters.pivot : null;
        this._pivot2 = (parameters.pivot2 !== undefined) ? parameters.pivot2 : null;
        
        //helper THREE.Vector3 to save the last positions the description pivots were in
        this._pivotLast;
        this._pivot2Last;
        this._pivotSize = (parameters.pivotSize !== void 0) ? parameters.pivotSize : 20;
        this.message = (parameters.message !== undefined) ? parameters.message : "你好！";
        
        //the THREE.Vector3 position of the description line without the description message sprite
        this.origin = (parameters.origin !== undefined) ? parameters.origin : new THREE.Vector3( 0, 0, 0 );
        //the THREE.Vector3 position of the description line with the description message sprite
        this.target = (parameters.target !== undefined) ? parameters.target : new THREE.Vector3( 0, 0, 0 );
            
        //second set of origin/target pairs are for the positions of the description objects after animation
        this.origin2 = (parameters.origin2 !== undefined) ? parameters.origin2 : new THREE.Vector3( 0, 0, 0 );
        this.target2 = (parameters.target2 !== undefined) ? parameters.target2 : new THREE.Vector3( 0, 0, 0 );
            
        this.scene = (parameters.scene !== undefined) ? parameters.scene : null;
        this._camera = (parameters.camera !== undefined) ? parameters.camera : null;
        this.sprite = (parameters.sprite !== undefined) ? parameters.sprite : null;
        this.selectedObject;
        this.jsonStrs = [];
        this.isVr = (parameters.isVr !== undefined) ? parameters.isVr : null;

        this.canvas;
        this.context;
        this._transformControl = (parameters.transformControl !== void 0) ? parameters.transformControl : null;

        if (!this._pivot) {
            var cubeGeometry = new THREE.CubeGeometry(self._pivotSize,self._pivotSize,self._pivotSize,1,1,1);
            var wireMaterial = new THREE.MeshBasicMaterial( { color: 0xff0000, wireframe:false } );
            this._pivot = new THREE.Mesh(cubeGeometry, wireMaterial);//new THREE.SphereBufferGeometry(10, 100), new THREE.MeshBasicMaterial({color: 0xffff00}));
            /*var material = Physijs.createMaterial(
                wireMaterial,
                        .6, .3
            );
            this._pivot = new Physijs.BoxMesh(cubeGeometry, material)*/
            this._pivot.geometry.computeBoundingBox();
            this._pivotLast = this._pivot.position.clone();
        }
    
        if (!this._pivot2) {
            var cubeGeometry = new THREE.CubeGeometry(self._pivotSize/2,self._pivotSize/2,self._pivotSize/2,1,1,1);
            var wireMaterial = new THREE.MeshBasicMaterial( { color: 0xff0000, wireframe:false });//, transparent:true, opacity:0.1, side:THREE.DoubleSide } );
            this._pivot2 = new THREE.Mesh(cubeGeometry, wireMaterial);
            this._pivot2.geometry.computeBoundingBox();
            this._pivot2Last = this._pivot2.position.clone();
        }
    
        this.enable = true; // 是否可用
            
        this.draw = function() {
            var lineGeometry = new THREE.Geometry();
            lineGeometry.vertices.push(self.origin, self.target);
            lineGeometry.computeLineDistances();
            self.line = new THREE.Line( lineGeometry, new THREE.LineDashedMaterial( { color: 0x000000, dashSize: 3, gapSize: 1, linewidth: 2 } ) );
            //self.line.material.color.setHex(0x000000);
            self.scene.add(self._pivot);
            self._pivot.position.copy(self.origin);
            self._pivotLast.copy(self.origin);
            self.scene.add(self._pivot2);
            self._pivot2.position.copy(self.target);
            //self._pivot2.visible = false;
            self._pivot2Last.copy(self.target);
            self.sprite = self.makeTextSprite( {scale: 4} );
            self.sprite.geometry.computeBoundingBox();
            self.scene.add(self.sprite);
            //self._pivot2.add(self.sprite);
                
            self.sprite.position.copy(self.target);
            self.scene.add( self.line );
            //self.line.position.copy;
            //self._pivot.parent = self;
        };
        
        this.redraw = function() {
            self.line.geometry.vertices[0].copy(self.origin);
            self.line.geometry.vertices[1].copy(self.target);
            self.line.geometry.verticesNeedUpdate = true;
            self._pivot.position.copy(self.origin);
            self._pivotLast.copy(self.origin);
            self._pivot2.position.copy(self.target);
            self._pivot2Last.copy(self.target);
            self.sprite.position.copy(self.target);
            /*self.line.geometry.vertices[0].copy(self.currentAnimationState == 0 ? self.origin:self.origin2);
            self.line.geometry.vertices[1].copy(self.currentAnimationState == 0 ? self.target:self.target2);
            self.line.geometry.verticesNeedUpdate = true;
            self._pivot.position.copy(self.currentAnimationState == 0?self.origin:self.origin2);
            self._pivotLast.copy(self.currentAnimationState == 0?self.origin:self.origin2);
            self._pivot2.position.copy(self.currentAnimationState == 0?self.target:self.target2);
            self._pivot2Last.copy(self.currentAnimationState == 0?self.target:self.target2);
            self.sprite.position.copy(self.currentAnimationState == 0?self.target:self.target2);*/
        };

        this.makeVisible = function() {
            self._pivot.visible = true;
            self._pivot2.visible = true;
            self.line.visible = true;
            self.sprite.visible = true;
        };
        
        this.makeInvisible = function() {
            self._pivot.visible = false;
            self._pivot2.visible = false;
            self.line.visible = false;
            self.sprite.visible = false;
        };

        this.getSpriteMaxScale = function() {
            if (self.sprite) {
                var maximum = self.sprite.scale.x > self.sprite.scale.y ? self.sprite.scale.x:self.sprite.scale.y;
                maximum = maximum > self.sprite.scale.z?maximum:self.sprite.scale.z;
                return maximum;
            }
        };

        this.getSpriteRadius = function() {
            return self.sprite.geometry.boundingSphere.radius * self.getSpriteMaxScale();
        };

        this.makeTextSprite = function(params) {
            var fontsize = 32;//params.hasOwnProperty("fontsize") ? 
                //params["fontsize"] : 16;
            
            var scale = params.hasOwnProperty("scale") ? 
                params["scale"] : 1.0;
                
            var fillStyle = params.hasOwnProperty("fillStyle") ? 
                params["fillStyle"] : "#3f4046";
                
            var strokeStyle = params.hasOwnProperty("strokeStyle") ? 
                params["strokeStyle"] : "#3f4046";
                
            self.canvas = self.canvas?self.canvas:document.createElement('canvas');
            self.canvas.height = fontsize + 12;

            self.context = self.context?self.context:self.canvas.getContext('2d');

            self.context.font = fontsize + "px 宋体";
            var metrics = self.context.measureText( self.message );
            var textWidth = metrics.width;
            self.canvas.width =  textWidth +12;

            self.context.fillStyle = fillStyle;
            self.context.strokeStyle = strokeStyle;
            self.context.lineWidth = 2;
            self.roundRect(self.context, 1, 1, textWidth + 10, fontsize + 10, 6);
            self.context.fillStyle = "#ffffff";
            self.context.fillText( self.message, 5, fontsize  + 5);

            var texture = new THREE.Texture(self.canvas);
            texture.minFilter = THREE.LinearFilter;
            texture.magFilter = THREE.LinearFilter;
            texture.needsUpdate = true;
            var spriteMaterial = new THREE.SpriteMaterial( { map: texture });//, useScreenCoordinates: true } );
            var sprite = new THREE.Sprite( spriteMaterial );

            sprite.scale.set(scale * (textWidth +12), scale * (fontsize + 12),1.0);
            return sprite;
        };
            
            this.getSpriteVertices = function() {
                var arr = [];
                var d = getDimension(self.sprite);
                d.height = d.height * self.sprite.scale.y;
                d.width = d.width * self.sprite.scale.x;
                //d.depth = d.depth * self.sprite.scale.z;
                var geometry = new THREE.Geometry();
                for (var i = self.target.x; i < self.target.x + d.width; i+2) {
                    geometry.vertices.push(new THREE.Vector3(i-(d.width/2), self.target.y-(d.height/2), self.target.z));
                    geometry.vertices.push(new THREE.Vector3(i-(d.width/2), self.target.y + (d.height/2), self.target.z));
                }
                
                for (var i = self.target.y; i < self.target.y + d.height; i+2) {
                    geometry.vertices.push(new THREE.Vector3(self.target.x-(d.width/2), i-(d.height/2), self.target.z));
                    geometry.vertices.push(new THREE.Vector3(self.target.x + d.width-(d.width/2), i-(d.height/2), self.target.z));
                }
                
                function getDimension(obj) {
                    return { width: Math.abs(obj.geometry.boundingBox.max.x - obj.geometry.boundingBox.min.x),
                        height: Math.abs(obj.geometry.boundingBox.max.y - obj.geometry.boundingBox.min.y),
                        depth: Math.abs(obj.geometry.boundingBox.max.z - obj.geometry.boundingBox.min.z)
                    };
                }
                //self.scene.add(new THREE.Points(geometry, new THREE.PointsMaterial( { color: 0x555555, size: 2, sizeAttenuation: false } )));
                return geometry.vertices;
            };
            
            this.changeTextSprite = function(params, sprite) {
                var fontsize = params.hasOwnProperty("fontsize") ? 
                    params["fontsize"] : 16;
            
                var scale = params.hasOwnProperty("scale") ? 
                    params["scale"] : 1.0;
                
                var fillStyle = params.hasOwnProperty("fillStyle") ? 
                    params["fillStyle"] : "#3f4046";
                
                var strokeStyle = params.hasOwnProperty("strokeStyle") ? 
                    params["strokeStyle"] : "#3f4046";
                
                self.message = params.message;
                
                /*if (self.canvas && self.context) {
                    var metrics = self.context.measureText( self.message );
                    var textWidth = metrics.width;
                    self.canvas.width =  textWidth +12;

                    //self.context.fillStyle = fillStyle;
                    self.context.strokeStyle = strokeStyle;
                    self.context.lineWidth = 2;
                    self.context.clearRect(1, 1, textWidth + 10, fontsize + 10);
                    self.roundRect(self.context, 1, 1, textWidth + 10, fontsize + 10, 6);
                    self.context.fillStyle = "#ffffff";
                    self.context.fillText( params.message, 5, fontsize  + 5);
                } else {*/
                    self.context.clearRect(0, 0, self.canvas.width, self.canvas.height);
                    self.canvas = self.canvas?self.canvas:document.createElement('canvas');
                    //self.canvas = document.createElement('canvas');
                    self.canvas.height = fontsize + 12;

                    self.context = self.context?self.context:self.canvas.getContext('2d');
                    //self.context = self.canvas.getContext('2d');

                    self.context.font = fontsize + "px 宋体";
                    var metrics = self.context.measureText( self.message );
                    var textWidth = metrics.width;
                    self.canvas.width =  textWidth +12;

                    self.context.fillStyle = fillStyle;
                    self.context.strokeStyle = strokeStyle;
                    self.context.lineWidth = 2;
                    self.roundRect(self.context, 1, 1, textWidth + 10, fontsize + 10, 6);
                    self.context.fillStyle = "#ffffff";
                    self.context.fillText( params.message, 5, fontsize  + 5);
                //}
                    var texture = new THREE.Texture(self.canvas);
                    texture.minFilter = THREE.LinearFilter;
                    texture.magFilter = THREE.LinearFilter;
                    texture.needsUpdate = true;
                    
                    sprite.material.map = texture;
                    
                    sprite.scale.set(scale * (textWidth +12), scale * (fontsize + 12),1.0);
                return sprite;
            };

            this.roundRect = function(ctx, x, y, w, h, r) {
                ctx.beginPath();
                ctx.moveTo(x+r, y);
                ctx.lineTo(x+w-r, y);
                ctx.quadraticCurveTo(x+w, y, x+w, y+r);
                ctx.lineTo(x+w, y+h-r);
                ctx.quadraticCurveTo(x+w, y+h, x+w-r, y+h);
                ctx.lineTo(x+r, y+h);
                ctx.quadraticCurveTo(x, y+h, x, y+h-r);
                ctx.lineTo(x, y+r);
                ctx.quadraticCurveTo(x, y, x+r, y);
                ctx.closePath();
                ctx.fill();
                ctx.stroke();
            };
            
            this.updateLines = function(boundingObj) {
                self.target.copy(self._pivot2.position.clone());
                self.origin.copy(self._pivot.position.clone());
                self._pivotLast.copy(self.origin.clone());
                self._pivot2Last.copy(self.target.clone());
              
                self.line.geometry.vertices[0].copy(self.origin.clone());
                self.line.geometry.vertices[1].copy(self.target.clone());
                self.sprite.position.copy(self.target.clone());
                self._pivot.position.copy(self.origin.clone());
                self._pivot2.position.copy(self.target.clone());
                self.line.geometry.verticesNeedUpdate = true;
            };
        
        this.updateLines2 = function(boundingObj) {
                //self.target.copy(self.line.geometry.vertices[1]);
                //self.origin.copy(self.line.geometry.vertices[0]);
                
                self._pivot.position.copy(self.origin);
                self._pivot2.position.copy(self.target);
                self.sprite.position.copy(self.target);
                self.line.geometry.verticesNeedUpdate = true;
            };
        
        this.reset = function() {
            //self.origin.copy(self._pivotLast);
            //self.target.copy(self._pivot2Last);
            self.sprite.position.copy(self.target);
            self.line.geometry.vertices[1].copy(self.target);
            self._pivot.position.copy(self.origin);
            self._pivot2.position.copy(self.target);
            self.line.geometry.vertices[0].copy(self.origin);
            self.line.geometry.verticesNeedUpdate = true;
        };

        this.destroy = function(scene) {
            scene.remove(self.sprite);
            //self.sprite = null;
            delete self.sprite;
            scene.remove(self.line);
            //self.line = null;
            delete self.line
            scene.remove(self._pivot);
            //self._pivot = null;
            delete self._pivot;
            scene.remove(self._pivot2);
            //self._pivot2 = null;
            delete self._pivot2;
        };

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
            },
            origin2: {
                x: self.origin2.x,
                y: self.origin2.y,
                z: self.origin2.z
            },
            target2: {
                x: self.target2.x,
                y: self.target2.y,
                z: self.target2.z
            }
        };
    };

};

/* 原型 */
THREE.DescriptionControl.prototype = {
    constructor: THREE.DescriptionControl,
    
    get object ( ) {
        return this._object;
    },

    get pivot ( ) {
        return this._pivot;
    },
    
    set pivot ( pivot ) {
        this._pivot = pivot;
    },

    get pivot2 ( ) {
        return this._pivot2;
    },
    
    set pivot2 ( pivot2 ) {
        this._pivot2 = pivot2;
    }
};
}() );