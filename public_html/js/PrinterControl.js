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
        
        this.model;
        this.animations;
	this.kfAnimations = [ ];
	this.kfAnimationsLength = 0;
        this.lastTimestamp = 0;
	this.progress = 0;
        
        this.descriptionContainer = ( parameters.descriptionContainer !== undefined ) ? parameters.descriptionContainer : 'desc';
    
        //for an animation 3D object, there could be many states after each animation clip, defaults to 2
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
        this.isAnimationEnabled = true;
        this.isAnimatingForwards = true;
    
        this.enable = true; // 是否可用
            
        $('#printer').change(function (e) {
            self.uploadPrinter();
        });
            
        this.testLoad = function() {
            var loader = new THREE.ColladaLoader();
            self.lastTimestamp = 0;
            self.progress = 0;

            loader.load( './f.dae', function ( collada ) {

		self.model = collada.scene;
		self.animations = collada.animations;
            	self.kfAnimationsLength = self.animations.length;
				self.model.scale.x = self.model.scale.y = self.model.scale.z = 2;//0.125; // 1/8 scale, modeled in cm

		self.init2();
		self.start2();
		self.animate2( self.lastTimestamp );

            } );
        };
        
        this.playForwards = function() {
            self.lastTimestamp = 0;
            self.progress = 0;
            self.init2();
            self.start2();
            self.animate2( self.lastTimestamp );
        };
        
        this.playBackwards = function() {
            self.lastTimestamp = 0;
            self.progress = 0;
            self.initBackwards();
            self.startBackwards();
            self.animateBackwards( self.lastTimestamp );
        };
        
        this.staticLoad = function(f) {
            var loader = new THREE.JSONLoader();
            loader.load(f, function(geometry, materials) {
                if (!self.webgl) {
                    for(var i in materials)
                        materials[i].overdraw = 1;
                }
                var material = new THREE.MultiMaterial( materials );
                var object = new THREE.Mesh( geometry, material );
                    
                object.castShadow = true;
                //object.scale.set(20, 20, 20);
                object.geometry.center();
                object.geometry.computeBoundingBox();
                object.position.setX(430);
                object.position.setZ(10);
                object.position.setY(10);
                self.scene.add(object);
                self.collisionControl._nonCollidibleObjs.push(object);
                self._objects.push(object);
                self.isAnimationEnabled = false;
            });
        };
            
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
                    //self.handleCOLLADA(data, file);
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
            
            for (var i in self._objects) {
                self._objects[i] = null;
            }
            
            //delete self._objects;
            self._objects.length = 0;
            self.descriptions.length = 0;
            self.descriptionSprites.length = 0;
            self.descriptionSpritePivots.length = 0;
            self.descriptionSpriteOriginPivots.length = 0;
            $('#' + self.descriptionContainer).empty();//html('');
        };

        this.addDescription = function(description, origin, target) {
            var cameraPosition = new THREE.Vector3((self.object.geometry.boundingBox.max.x * self.object.scale.x) + 80, (self.object.geometry.boundingBox.max.y * self.object.scale.y) + 70, (self.object.geometry.boundingBox.max.z * self.object.scale.z) + 60);//camera.position.clone();
            origin = ( origin !== undefined ) ? origin : cameraPosition;
            target = ( target !== undefined ) ? target : new THREE.Vector3( cameraPosition.x + 110, cameraPosition.y + 90, cameraPosition.z + 70);
            
            var newDescription = new THREE.DescriptionControl(null, renderer.domElement, {scene: self.scene, camera: self.camera, message: description, origin: origin,
                target: target, origin2: origin.clone(), target2: target.clone(), printerControl: self, currentAnimationState: self.currentAnimationState });
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
                        for (var i in result.materials) {
                            result.materials[i].morphTargets = true;
                        }
                        material = new THREE.MeshFaceMaterial( result.materials );
                    } else {
                        material = result.materials[ 0 ];
                    }
                } else {
                    //material = new THREE.MeshPhongMaterial();
                    material = new THREE.MeshLambertMaterial( {
                        vertexColors: THREE.FaceColors,
                        morphTargets: true,
                        overdraw: 0.5
                    } );
                }

                geometry.sourceType = "ascii";
                geometry.sourceFile = file.name;

                var mesh;
                /*if (geometry.animations) {
                    self.model = geometry.scene;
                    self.animations = geometry.animations;
                    self.kfAnimationsLength = self.animations.length;
                    //self.model.scale.x = self.model.scale.y = self.model.scale.z = 0.125; // 1/8 scale, modeled in cm

                    //self.init2();
                    //self.start2();
                    //self.animate2( self.lastTimestamp );
                } else */if (geometry.morphTargets) {
                    /*if ( geometry.animation && geometry.animation.hierarchy ) {
                        mesh = new THREE.SkinnedMesh( geometry, material );
                    } else {
                        mesh = new THREE.Mesh( geometry, material );
                    }*/
                
                    var material = new THREE.MeshLambertMaterial( {
                        vertexColors: THREE.FaceColors,
                        morphTargets: true,
                        overdraw: 0.5
                    } );
                    mesh = new THREE.Mesh(geometry, material);

                    mesh.name = filename;
                    var data;
                    mesh.scale.set(.05, .05, .05);
                    mesh.position.set(0, .8, -5);
                    scene.add( mesh );
                    mesh.geometry.computeBoundingBox();
                    //var boundingBox = new THREE.BoundingBoxHelper(mesh);// mesh.geometry.boundingBox;
                    //scene.add(boundingBox);
                    //mesh.geometry.center();
                    var height = (Math.abs(mesh.geometry.boundingBox.max.y - mesh.geometry.boundingBox.min.y));// * mesh.scale.y);
                    //mesh.position.setY(self._floorY);// + height);
                    self.object = mesh;
                    self.collisionControl._nonCollidibleObjs.push(mesh);
                    self._objects.push(mesh);
                    self.animationMixer = new THREE.AnimationMixer(mesh);
                    //if (!geometry.animations[0])
                        self.animationClip = THREE.AnimationClip.CreateFromMorphTargetSequence( 'animation', geometry.morphTargets, 30 );
                    //else
                        //self.animationClip = geometry.animations[0];
                    //cutting animation duration by half because js animations seem to move to destination then back to initial position
                    self.animationDuration = (self.animationClip.duration/3);// - (self.animationClip.duration/4);// + self.animationClip.duration/5;//self.animationAction._clip.duration;
                    self.animationAction = self.animationMixer.clipAction(self.animationClip).setDuration(self.animationDuration).play();
                    printerControl.animationDuration = printerControl.animationClip.duration*(printerControl.animationClip.tracks.length-1)/printerControl.animationClip.tracks.length - 0.005;
                    self.animationAction.paused = true;
                    self.isAnimationEnabled = true;
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
                    self.isAnimationEnabled = false;
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
        
        this.handleCOLLADA = function( data, file, filename ) {
            var scope = this;
            
                var loader = new THREE.ColladaLoader();//JSONLoader();
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
                if (geometry.animations) {
                    self.model = geometry.scene;
                    self.animations = geometry.animations;
                    self.kfAnimationsLength = self.animations.length;
                    //self.model.scale.x = self.model.scale.y = self.model.scale.z = 0.125; // 1/8 scale, modeled in cm

                    self.init2();
                    self.start2();
                    self.animate2( self.lastTimestamp );
                } else if (geometry.morphTargets) {
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
                    mesh.scale.set(4.5, 4.5, 4.5);
                    scene.add( mesh );
                    mesh.geometry.computeBoundingBox();
                    mesh.geometry.center();
                    self.object = mesh;
                    self.collisionControl._nonCollidibleObjs.push(mesh);
                    self._objects.push(mesh);
                    self.animationMixer = new THREE.AnimationMixer(mesh);
                    //if (!geometry.animations[0])
                        self.animationClip = THREE.AnimationClip.CreateFromMorphTargetSequence( 'animation', geometry.morphTargets, 30 );
                    //else
                        //self.animationClip = geometry.animations[0];
                    self.animationDuration = self.animationClip.duration;//self.animationAction._clip.duration;
                    self.animationAction = self.animationMixer.clipAction(self.animationClip).setDuration(self.animationDuration).play();
                    self.animationAction.paused = true;
                    self.isAnimationEnabled = true;
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
                    self.isAnimationEnabled = false;
                }
        };
        
        this.init2 = function() {

				/*var container = document.createElement( 'div' );
				document.body.appendChild( container );

				// Camera

				camera = new THREE.PerspectiveCamera( 40, window.innerWidth / window.innerHeight, 0.01, 1000 );
				camera.position.set( -5.00181875, 3.42631375, 11.3102925 );
				camera.lookAt( new THREE.Vector3( -1.224774125, 2.18410625, 4.57969125 ) );*/

				// KeyFrame Animations

				for ( var i = 0; i < self.kfAnimationsLength; ++i ) {

					var animation = self.animations[ i ];

					var kfAnimation = new THREE.KeyFrameAnimation( animation );
					kfAnimation.timeScale = 1;
					self.kfAnimations.push( kfAnimation );

				}

				// Grid

				/*var material = new THREE.LineBasicMaterial( { color: 0x303030 } );
				var geometry = new THREE.Geometry();
				var floor = -0.04, step = 1, size = 14;

				for ( var i = 0; i <= size / step * 2; i ++ ) {

					geometry.vertices.push( new THREE.Vector3( - size, floor, i * step - size ) );
					geometry.vertices.push( new THREE.Vector3(   size, floor, i * step - size ) );
					geometry.vertices.push( new THREE.Vector3( i * step - size, floor, -size ) );
					geometry.vertices.push( new THREE.Vector3( i * step - size, floor,  size ) );

				}

				var line = new THREE.LineSegments( geometry, material );
				scene.add( line );*/

				// Add the COLLADA

				//model.getObjectByName( 'camEye_camera', true ).visible = false;
				//model.getObjectByName( 'camTarget_camera', true ).visible = false;

				self.scene.add( self.model );

			};

			this.start2 = function() {

				for ( var i = 0; i < self.kfAnimationsLength; ++i ) {

					var animation = self.kfAnimations[i];

					for ( var h = 0, hl = animation.hierarchy.length; h < hl; h++ ) {

						var keys = animation.data.hierarchy[ h ].keys;
						var sids = animation.data.hierarchy[ h ].sids;
						var obj = animation.hierarchy[ h ];

						if ( keys.length && sids ) {

							for ( var s = 0; s < sids.length; s++ ) {

								var sid = sids[ s ];
								var next = animation.getNextKeyWith( sid, h, 0 );

								if ( next ) next.apply( sid );

							}

							obj.matrixAutoUpdate = false;
							animation.data.hierarchy[ h ].node.updateMatrix();
							obj.matrixWorldNeedsUpdate = true;

						}

					}

					animation.loop = false;
					animation.play();

				}

			};

			this.animate2 = function( timestamp ) {

				var frameTime = ( timestamp - self.lastTimestamp ) * 0.001;

				if ( self.progress >= 0 && self.progress < 48 ) {

					for ( var i = 0; i < self.kfAnimationsLength; ++i ) {

						self.kfAnimations[ i ].update( frameTime );

					}

				} else if ( self.progress >= 48 ) {

					for ( var i = 0; i < self.kfAnimationsLength; ++i ) {

						self.kfAnimations[ i ].stop();

					}

					self.progress = 0;
					self.start2();

				}

				self.progress += frameTime;
				self.lastTimestamp = timestamp;
				requestAnimationFrame( self.animate2 );
			};
                        
                        this.initBackwards = function() {

				// KeyFrame Animations

				for ( var i = self.kfAnimationsLength - 1; i >= 0; --i ) {

					var animation = self.animations[ i ];

					var kfAnimation = new THREE.KeyFrameAnimation( animation );
					kfAnimation.timeScale = 1;
					self.kfAnimations.push( kfAnimation );

				}

				self.scene.add( self.model );

			};

			this.startBackwards = function() {

				for ( var i = 0; i < self.kfAnimationsLength; ++i ) {

					var animation = self.kfAnimations[i];

					for ( var h = 0, hl = animation.hierarchy.length; h < hl; h++ ) {

						var keys = animation.data.hierarchy[ h ].keys;
						var sids = animation.data.hierarchy[ h ].sids;
						var obj = animation.hierarchy[ h ];

						if ( keys.length && sids ) {

							for ( var s = 0; s < sids.length; s++ ) {

								var sid = sids[ s ];
								var next = animation.getNextKeyWith( sid, h, 0 );

								if ( next ) next.apply( sid );

							}

							obj.matrixAutoUpdate = false;
							animation.data.hierarchy[ h ].node.updateMatrix();
							obj.matrixWorldNeedsUpdate = true;

						}

					}

					animation.loop = false;
					animation.play();

				}

			};

			this.animateBackwards = function( timestamp ) {

				var frameTime = ( timestamp - self.lastTimestamp ) * 0.001;

				if ( self.progress >= 0 && self.progress < 48 ) {

					for ( var i = 0; i < self.kfAnimationsLength; ++i ) {

						self.kfAnimations[ i ].update( -frameTime );

					}

				} else if ( self.progress >= 48 ) {

					for ( var i = 0; i < self.kfAnimationsLength; ++i ) {

						self.kfAnimations[ i ].stop();

					}

					self.progress = 0;
					self.startBackwards();

				}

				self.progress += frameTime;
				self.lastTimestamp = timestamp;
				requestAnimationFrame( self.animateBackwards );
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

}() );