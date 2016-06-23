/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

                
                function createScene( geometry, materials, x, y, z, s ) {

				//ensureLoop( geometry.animation );

				geometry.computeBoundingBox();
				//var bb = geometry.boundingBox;

				/*for ( var i = 0; i < materials.length; i ++ ) {

					var m = materials[ i ];
					m.skinning = true;
					m.morphTargets = true;

					//m.specular.setHSL( 0, 0, 0.1 );

					m.color.setHSL( 0.6, 0, 0.6 );

					//m.map = map;
					//m.envMap = envMap;
					//m.bumpMap = bumpMap;
					//m.bumpScale = 2;

					//m.combine = THREE.MixOperation;
					//m.reflectivity = 0.75;

				}*/

				mesh = new THREE.Mesh( geometry, new THREE.MultiMaterial( materials ) );//SkinnedMesh( geometry, new THREE.MultiMaterial( materials ) );
				mesh.name = "Printer";
				//mesh.position.set( x, y - bb.min.y * s, z );
				//mesh.scale.set( s, s, s );
				scene.add( mesh );
                                mesh.position.setY(floorY);
				mesh.castShadow = true;
				mesh.receiveShadow = true;
                                printerControl.object = mesh;
                                collisionControl._nonCollidibleObjs.push(printerControl.object);
				helper = new THREE.SkeletonHelper( mesh );
				helper.material.linewidth = 3;
				helper.visible = false;
				scene.add( helper );

				mixer = new THREE.AnimationMixer( mesh );

				bonesClip = geometry.animations[0];
				facesClip = THREE.AnimationClip.CreateFromMorphTargetSequence( 'facialExpressions', mesh.geometry.morphTargets, 3 );

			}

			function initGUI() {

				var API = {
					'show model'    	: true,
					'show skeleton'		: false,
					'show 2nd model'	: false,
					'show mem. info'	: false
				};

				var gui = new dat.GUI();

				gui.add( API, 'show model' ).onChange( function() {
						mesh.visible = API[ 'show model' ];
				} );

				gui.add( API, 'show skeleton' ).onChange( function() {
						helper.visible = API[ 'show skeleton' ];
				} );

				gui.add( API, 'show 2nd model' ).onChange( function() {
						mesh2.visible = API[ 'show 2nd model' ];
				} );


				gui.add( API, 'show mem. info' ).onChange( function() {

					showMemInfo = API[ 'show mem. info' ];

				} );

				// utility function used for drop-down options lists in the GUI
				var objectNames = function( objects ) {

					var result = [];

					for ( var i = 0, n = objects.length; i !== n; ++ i ) {

						var obj = objects[ i ];
						result.push( obj && obj.name || '&lt;null&gt;' );

					}

					return result;

				};


				// creates gui folder with tests / examples for the action API
				var clipControl = function clipControl( gui, mixer, clip, rootObjects ) {

					var folder = gui.addFolder( "Clip '" + clip.name + "'" ),

						rootNames = objectNames( rootObjects ),
						rootName = rootNames[ 0 ],
						root = rootObjects[ 0 ],

						action = null,

						API = {

							'play()': function play() {

								action = mixer.clipAction( clip );//, root );
								action.play();

							},

							'stop()': function() {

								action = mixer.clipAction( clip, root );
								action.stop();

							},

							'reset()': function() {

								action = mixer.clipAction( clip, root );
								action.reset();

							},

							get 'time ='() {

								return action !== null ? action.time : 0;

							},

							set 'time ='( value ) {

								action = mixer.clipAction( clip, root );
								action.time = value;

							},

							get 'paused ='() {

								return action !== null && action.paused;

							},

							set 'paused ='( value ) {

								action = mixer.clipAction( clip, root );
								action.paused = value;

							},

							get 'enabled ='() {

								return action !== null && action.enabled;

							},

							set 'enabled ='( value ) {

								action = mixer.clipAction( clip, root );
								action.enabled = value;

							},

							get 'clamp ='() {

								return action !== null ? action.clampWhenFinished : false;

							},

							set 'clamp ='( value ) {

								action = mixer.clipAction( clip, root );
								action.clampWhenFinished = value;

							},

							get 'isRunning() ='() {

								return action !== null && action.isRunning();

							},

							set 'isRunning() ='( value ) {

								alert( "Read only - this is the result of a method." );

							},

							'play delayed': function() {

								action = mixer.clipAction( clip, root );
								action.startAt( mixer.time + 0.5 ).play();

							},

							get 'weight ='() {

								return action !== null ? action.weight : 1;

							},

							set 'weight ='( value ) {

								action = mixer.clipAction( clip, root );
								action.weight = value;

							},

							get 'eff. weight'() {

								return action !== null ? action.getEffectiveWeight() : 1;

							},

							set 'eff. weight'( value ) {

								action = mixer.clipAction( clip, root );
								action.setEffectiveWeight( value );

							},

							'fade in': function() {

								action = mixer.clipAction( clip, root );
								action.reset().fadeIn( 0.25 ).play();

							},

							'fade out': function() {

								action = mixer.clipAction( clip, root );
								action.fadeOut( 0.25 ).play();

							},

							get 'timeScale ='() {

								return ( action !== null ) ? action.timeScale : 1;

							},

							set 'timeScale ='( value ) {

								action = mixer.clipAction( clip, root );
								action.timeScale = value;

							},

							get 'eff.T.Scale'() {

								return ( action !== null ) ? action.getEffectiveTimeScale() : 1;

							},

							set 'eff.T.Scale'( value ) {

								action = mixer.clipAction( clip, root );
								action.setEffectiveTimeScale( value );

							},

							'time warp': function() {

								action = mixer.clipAction( clip, root );
								var timeScaleNow = action.getEffectiveTimeScale();
								var destTimeScale = timeScaleNow > 0 ? -1 : 1;
								action.warp( timeScaleNow, destTimeScale, 4 ).play();

							},

							get 'loop mode'() {

								return action !== null ? action.loop : THREE.LoopRepeat;

							},

							set 'loop mode'( value ) {

								action = mixer.clipAction( clip, root );
								action.loop = + value;

							},

							get 'repetitions'() {

								return action !== null ? action.repetitions : Infinity;

							},

							set 'repetitions'( value ) {

								action = mixer.clipAction( clip, root );
								action.repetitions = + value;

							},

							get 'local root'() { return rootName; },

							set 'local root'( value ) {

								rootName = value;
								root = rootObjects[ rootNames.indexOf( rootName ) ];
								action = mixer.clipAction( clip, root );

							}

						};

					folder.add( API, 'play()' );
					folder.add( API, 'stop()' );
					folder.add( API, 'reset()' );
					folder.add( API, 'time =', 0, clip.duration ).listen();
					folder.add( API, 'paused =' ).listen();
					folder.add( API, 'enabled =' ).listen();
					folder.add( API, 'clamp =' );
					folder.add( API, 'isRunning() =').listen();
					folder.add( API, 'play delayed' );
					folder.add( API, 'weight =', 0, 1 ).listen();
					folder.add( API, 'eff. weight', 0, 1 ).listen();
					folder.add( API, 'fade in' );
					folder.add( API, 'fade out' );
					folder.add( API, 'timeScale =', -2, 2).listen();
					folder.add( API, 'eff.T.Scale', -2, 2).listen();
					folder.add( API, 'time warp' );
					folder.add( API, 'loop mode', {
						"LoopOnce": THREE.LoopOnce,
						"LoopRepeat": THREE.LoopRepeat,
						"LoopPingPong": THREE.LoopPingPong
					} );
					folder.add( API, 'repetitions', 0, Infinity );
					folder.add( API, 'local root', rootNames );

					API[ 'play()' ]();

				}; // function clipControl

				// one folder per clip
				clipControl( gui, mixer, bonesClip, [ null, mesh ] );
				

				var memoryControl = function( gui, mixer, clips, rootObjects ) {

					var clipNames = objectNames( clips ),
						rootNames = objectNames( rootObjects );

					var folder = gui.addFolder( "Memory Management" ),

						clipName 	= clipNames[ 0 ],
						clip 		= clips[ 0 ],

						rootName 	= rootNames[ 0 ],
						root		= rootObjects[ 0 ],

						API = {

							get 'clip'() { return clipName; },

							set 'clip'( value ) {

								clipName = value;
								clip = clips[ clipNames.indexOf( clipName ) ];

							},

							get 'root'() { return rootName; },

							set 'root'( value ) {

								rootName = value;
								root = rootObjects[ rootNames.indexOf( rootName ) ];

							},

							'uncache clip': function() {

								mixer.uncacheClip( clip );

							},

							'uncache root': function() {

								mixer.uncacheRoot( root );

							},

							'uncache action': function() {

								mixer.uncacheAction( clip, root );

							}

						};

					folder.add( API, 'clip', clipNames );
					folder.add( API, 'root', rootNames );
					folder.add( API, 'uncache root' );
					folder.add( API, 'uncache clip' );
					folder.add( API, 'uncache action' );

				}

				memoryControl( gui, mixer,
						[ bonesClip, facesClip ], [ mesh ] );


			}