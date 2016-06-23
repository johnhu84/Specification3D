/**
 * 文件名: PrinterControl.js
 * threejs 3D 展品控制器
 *
 * @version V 1.00   2016-05-10
 * @author Chunlin Hu
 */
( function () {
    THREE.PrinterControl = function ( object, domElement, parameters, textSprite ) {
        var self = this;
        this._object = object;
        this._objects = [];
        this._domElement = ( domElement !== undefined ) ? domElement : document;
        this._onComplete = function() {};
        
        if ( this._domElement !== document ) {
            this._domElement.setAttribute( 'tabindex', -1 );
            this._domElement.focus();
        }
    
        this.camera = null;
        this.scene = ( parameters.scene !== undefined ) ? parameters.scene : null;
        this.webgl = ( parameters.webgl !== undefined ) ? parameters.webgl : true;
        
        this.descriptions = [];
        this.descriptionSprites = [];
        this.descriptionSpritePivots = [];
        this.descriptionSpriteOriginPivots = [];
        
        this.descriptionContainer = ( parameters.descriptionContainer !== undefined ) ? parameters.descriptionContainer : 'desc';
    
        //for an animation 3D object, there could be many states after each animation clip, defaults to 2
        this.animationStates = ( parameters.animationStates !== void 0) ? parameters.animationStates : 2;
        this.animationAction = ( parameters.animationAction !== void 0) ? parameters.animationAction : null;
        this.animationClip = ( parameters.animationClip !== void 0) ? parameters.animationClip : null;
        this.animationMixer = ( parameters.animationMixer !== void 0) ? parameters.animationMixer : null;
        this.animationDuration = ( parameters.animationDuration !== void 0) ? parameters.animationDuration : .5;
        
        this.currentAnimationState = 0; //states 0 for initial, and 1 after animation
        
        this.progressBar = ( parameters.progressBar !== void 0) ? parameters.progressBar : 'progressbar';
        this._raycaster = self.raycaster;
        this._camera = self.camera;
        this._width = ( this._width !== undefined ) ? this._width : 500;
        this._height = ( this._height !== undefined ) ? this._height : 500;
        this._floorY = ( parameters.floorY !== undefined ) ? parameters.floorY : -199;
        this._transformControl = ( parameters.transformControl !== void 0 ) ? parameters.transformControl : null;
        this.collisionControl = ( parameters.collisionControl !== void 0 ) ? parameters.collisionControl : null;
    
        this.enable = true; // 是否可用
            
        $('#printer').change(function (e) {
            self.uploadPrinter();
        });
            
        this.uploadPrinter = function(printerId) {
            self.reset();
            var printer = document.getElementById(printerId?printerId:'printer');
            var file = printer.files[ 0 ];
            var reader = new FileReader();
            reader.addEventListener( 'load', function ( event ) {
                var contents = event.target.result;
                    
                console.log(contents);
                    
                var data;

                try {
                    data = JSON.parse( contents );
                } catch ( error ) {
                    console.log(error);
                    return;
                }

                self.handleJSON( data, file );//, filename );
            }, false );
            
            reader.addEventListener('progress', function(event) {
                if (event.lengthComputable) {
                    var percentage = Math.round((event.loaded * 100) / event.total);
                    console.log(percentage);
                    $('#' + self.progressBar).progressbar({value: percentage});
                }
            }, false);
            
            reader.readAsText( file );
        };

        this.update = function() {
            var descriptions = self.descriptions;
            for (var i in descriptions) {
                var description = descriptions[i];
                for (var j in self._objects) {
                    if (typeof description.update == 'function')
                        description.update2(self._objects[j]);
                }
            }
        };
          
        this.makeVisible = function() {
            for (var i in self.descriptions) {
                var description = self.descriptions[i];
                if (description.currentAnimationState != self.currentAnimationState) {
                    var origin = description.origin.clone();
                    description.origin.copy(description.origin2.clone());
                    description.origin2.copy(origin);
                    var target = description.target.clone();
                    description.target.copy(description.target2.clone());
                    description.target2.copy(target);
                }
                description.currentAnimationState = self.currentAnimationState;
                description.makeVisible();
                description.redraw();
            }
        };
        
        this.makeInvisible = function() {
            for (var i in self.descriptions) {
                var description = self.descriptions[i];
                description.makeInvisible();
            }
        };
          
        this.reset = function() {
            for (var i in self.descriptions) {
                var description = self.descriptions[i];
                description.destroy(self.scene);
            }
            self.scene.remove(self.object);
            self.object = null;
            self._objects.length = 0;
            self.descriptions.length = 0;
            self.descriptionSprites.length = 0;
            self.descriptionSpritePivots.length = 0;
            self.descriptionSpriteOriginPivots.length = 0;
            //var objects = self.scene.children;
            //while ( objects.length > 0 ) {
		//objects[0].parent.remove(objects[0]);
                //this.removeObject( objects[ 0 ] );
            //}
        };
        
        this.toggleAnimation = function() {
            self.currentAnimationState = !self.currentAnimationState;
        };

        this.addDescription = function(description, origin, target) {
            var cameraPosition = new THREE.Vector3((self.object.geometry.boundingBox.max.x * self.object.scale.x) + 80, (self.object.geometry.boundingBox.max.y * self.object.scale.y) + 70, (self.object.geometry.boundingBox.max.z * self.object.scale.z) + 60);//camera.position.clone();
            origin = ( origin !== undefined ) ? origin : cameraPosition;
            target = ( target !== undefined ) ? target : new THREE.Vector3( cameraPosition.x + 110, cameraPosition.y + 90, cameraPosition.z + 70);
            
            var newDescription = new THREE.DescriptionControl(null, renderer.domElement, {scene: self.scene, camera: self.camera, message: description, origin: origin,
                target: target, printerControl: self, currentAnimationState: self.currentAnimationState });
            newDescription.draw();
            self.descriptions.push(newDescription);
            self.descriptionSprites.push(newDescription.sprite);
            self.descriptionSpritePivots.push(newDescription._pivot2);
            self.descriptionSpriteOriginPivots.push(newDescription._pivot);
            
            $('#' + self.descriptionContainer).append('<p><span>'+newDescription.message+'</span><span><input type="button" class="edit-msg" value="edit"/></span><span><input class="edit-msg-ind" type="hidden" value="'
                    +(self.descriptions.length-1)+'"/></span></p>');
            return newDescription;
        };
        
        this.editDescription = function(message, description, descriptionId) {
            description.changeTextSprite({message:message, scale:4}, description.sprite);
            
            $('#' + self.descriptionContainer + ' p:eq(' + descriptionId + ') span:first').html(message);
            return description;
        };
        
        this.handleJSON = function( data, file, filename ) {
            var scope = this;
            if ( data.metadata === undefined ) { // 2.0
                data.metadata = { type: 'Geometry' };
            }

            if ( data.metadata.type === undefined ) { // 3.0
                data.metadata.type = 'Geometry';
            }

            if ( data.metadata.version === undefined ) {
                data.metadata.version = data.metadata.formatVersion;
            }

            if ( data.metadata.type === 'BufferGeometry' ) {
                var loader = new THREE.BufferGeometryLoader();
                var result = loader.parse( data );

                var mesh = new THREE.Mesh( result );

                editor.addObject( mesh );
                editor.select( mesh );

            } else if ( data.metadata.type.toLowerCase() === 'geometry' ) {

                var loader = new THREE.JSONLoader();
                if (scope.texturePath)
                    loader.setTexturePath( scope.texturePath );

                var result = loader.parse( data );

                if (!scope.webgl) {
                    for(var i in result.materials)
                        result.materials[i].overdraw = 1;
                }

                var geometry = result.geometry;
                var material;

                if ( result.materials !== undefined ) {
                    if ( result.materials.length > 1 ) {
                        material = new THREE.MeshFaceMaterial( result.materials );
                    } else {
                        material = result.materials[ 0 ];
                    }
                } else {
                    material = new THREE.MeshPhongMaterial();
                }

                geometry.sourceType = "ascii";
                geometry.sourceFile = file.name;

                var mesh;
                if (geometry.animation) {
                    if ( geometry.animation && geometry.animation.hierarchy ) {
                        mesh = new THREE.SkinnedMesh( geometry, material );
                    } else {
                        mesh = new THREE.Mesh( geometry, material );
                    }
                
                    var material = new THREE.MeshLambertMaterial( {
                        vertexColors: THREE.FaceColors,
                        morphTargets: true,
                        overdraw: 0.5
                    } );
                    mesh = new THREE.Mesh(geometry, material);

                    mesh.name = filename;
                    var data;
                    mesh.scale.set(2.5, 2.5, 2.5);
                    scene.add( mesh );
                    mesh.geometry.computeBoundingBox();
                    self.object = mesh;
                    self.collisionControl._nonCollidibleObjs.push(mesh);
                    self._objects.push(mesh);
                    self.animationMixer = new THREE.AnimationMixer(mesh);
                    self.animationClip = THREE.AnimationClip.CreateFromMorphTargetSequence( 'animation', geometry.morphTargets, 30 );
                    self.animationAction = self.animationMixer.clipAction(self.animationClip).setDuration(self.animationDuration).play();
                    self.animationDuration = self.animationAction._clip.duration;
                    self.animationAction.paused = true;
                } else {
                    var material = new THREE.MultiMaterial( result.materials );
                    var object = new THREE.Mesh( geometry, material );
                    object.castShadow = true;
                    object.scale.set(12, 12, 12);
                    object.geometry.center();
                    scene.add(object);
                    self.object = object;
                    self.collisionControl._nonCollidibleObjs.push(object);
                    self._objects.push(object);
                    //printerControl._floorY = floorY;
                }
            } else if ( data.metadata.type.toLowerCase() === 'object' ) {

                var loader = new THREE.ObjectLoader();
                if (scope.texturePath)
                    loader.setTexturePath( scope.texturePath );

                var result = loader.parse( data );
                if ( result instanceof THREE.Scene ) {
                    editor.setScene( result );
                } else {
                    editor.addObject( result );
                    editor.select( result );
                }
            } else if ( data.metadata.type.toLowerCase() === 'scene' ) {
                // DEPRECATED
                var loader = new THREE.SceneLoader();
                loader.parse( data, function ( result ) {
                    editor.setScene( result.scene );
                }, '' );
            }
        };
    };

/* 原型 */
THREE.PrinterControl.prototype = {
    constructor: THREE.PrinterControl,
    
    get object ( ) {
        return this._object;
    },
    
    set object ( object ) {
        this._object = object;
    },

    get domElement ( ) {
        return this._domElement;
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
    },
    
    get origin ( ) {
        return this._origin;
    },
    
    set origin ( origin ) {
        this._origin = origin;
    },

    get target ( ) {
        return this._target;
    },
    
    set target ( target ) {
        this._target = target;
    },
    
    get scene ( ) {
        return this._scene;
    },
    
    set scene ( scene ) {
        this._scene = scene;
    }
};
	//THREE.PrinterControl.prototype = Object.create( THREE.Material.prototype );
	THREE.PrinterControl.prototype.constructor = THREE.PrinterControl;

}() );