

THREE.RotatorControls = function ( object, domElement, width, height, domElement2 ) {

	var _this = this;
	var STATE = { NONE: - 1, ROTATE: 0, ZOOM: 1, PAN: 2, TOUCH_ROTATE: 3, TOUCH_ZOOM_PAN: 4 };
        var DIRECTION = { UPLEFT: 1, UP: 2, UPRIGHT: 3, LEFT: 4, NOMOVE: 5, RIGHT: 6, DOWNLEFT: 7, DOWN: 8, DOWNRIGHT: 9 };
        var _currentDirection = DIRECTION.NOMOVE;
        var _targetRotation = 0;
	var _targetRotationOnMouseDown = 0;
        var _mouseX = 0, _mouseY = 0;
	var _mouseXOnMouseDown = 0, _mouseYOnMouseDown = 0;

	this.object = object;
	this.domElement = ( domElement !== undefined ) ? domElement : document;
        this.domElement2 = ( domElement2 !== undefined ) ? domElement2 : document;
        this.width = (width !== undefined) ? width : 400;
        this.height = (height !== undefined) ? height : 400;
        this.rotationSpeed = 0.008;

        //this.rotator = new THREE.TransformGizmoRotate();

	// API

	this.minDistance = 0;
	this.maxDistance = Infinity;

	var EPS = 0.000001;

        this.object.addEventListener( 'mousedown', onDocumentMouseDown, false );
	// events

	var changeEvent = { type: 'change' };
	var startEvent = { type: 'start' };
	var endEvent = { type: 'end' };


	// methods
        this.getMousePos = function (canvas, evt) {
            var rect = canvas.getBoundingClientRect();
            return {
                x: evt.clientX - rect.left,
                y: evt.clientY - rect.top
            };
        };

	function onDocumentMouseDown( event ) {

				event.preventDefault();

				_this.object.addEventListener( 'mousemove', onDocumentMouseMove, false );
				_this.object.addEventListener( 'mouseup', onDocumentMouseUp, false );
				_this.object.addEventListener( 'mouseout', onDocumentMouseOut, false );

				_mouseXOnMouseDown = event.clientX - _this.width/2;
                                _mouseYOnMouseDown = event.clientY - _this.height/2;
				_targetRotationOnMouseDown = _targetRotation;

			}

			function onDocumentMouseMove( event ) {

				_mouseX = event.clientX - _this.width/2;
                                _mouseY = event.clientY - _this.height/2;

                                var mousePos = getMousePos(_this.object, event);
                                
                                if (Math.abs(mousePos.x - _this.width/2) < 120.0) {
                                    _currentDirection = mousePos.x < _this.width/2 ? DIRECTION.UP : DIRECTION.DOWN;
                                } else if (Math.abs(mousePos.y - _this.height/2) < 120.0) {
                                    _currentDirection = mousePos.y < _this.height/2 ? DIRECTION.LEFT : DIRECTION.RIGHT;
                                } if (mousePos.x < _this.width/2 && mousePos.y < _this.height/2) {
                                    _currentDirection = DIRECTION.UPLEFT;
                                } else if (mousePos.x < _this.width/2 && mousePos.y > _this.height/2) {
                                    _currentDirection = DIRECTION.UPRIGHT;
                                } else if (mousePos.x > _this.width/2 && mousePos.y < _this.height/2) {
                                    _currentDirection = DIRECTION.DOWNLEFT;
                                } else {// if (mousePos.x > canvas.width/2 && mousePos.y < canvas.height/2) {
                                    _currentDirection = DIRECTION.DOWNRIGHT;
                                }
                                //console.log(mousePos.x + ', ' + mousePos.y + ', ' + _currentDirection);
				_targetRotation = _targetRotationOnMouseDown + ( _mouseX > _mouseY ? _mouseX - _mouseXOnMouseDown : _mouseY - _mouseYOnMouseDown ) * 0.02;
			}

			function onDocumentMouseUp( event ) {

				_this.object.removeEventListener( 'mousemove', onDocumentMouseMove, false );
				_this.object.removeEventListener( 'mouseup', onDocumentMouseUp, false );
				_this.object.removeEventListener( 'mouseout', onDocumentMouseOut, false );
                                _currentDirection = DIRECTION.NOMOVE;
			}

			function onDocumentMouseOut( event ) {

				_this.object.removeEventListener( 'mousemove', onDocumentMouseMove, false );
				_this.object.removeEventListener( 'mouseup', onDocumentMouseUp, false );
				_this.object.removeEventListener( 'mouseout', onDocumentMouseOut, false );
                                _currentDirection = DIRECTION.NOMOVE;
			}

			function onDocumentTouchStart( event ) {

				if ( event.touches.length === 1 ) {

					event.preventDefault();

					_mouseXOnMouseDown = event.touches[ 0 ].pageX - _this.width/2;
                                        _mouseYOnMouseDown = event.touches[ 0 ].pageY - _this.height/2;
					_targetRotationOnMouseDown = _targetRotation;

				}

			}

			function onDocumentTouchMove( event ) {

				if ( event.touches.length === 1 ) {

					event.preventDefault();

					_mouseX = event.touches[ 0 ].pageX - _this.width/2;
                                        _mouseY = event.touches[ 0 ].pageY - _this.height/2;
                                        
                                        var mousePos = getMousePos(_this.object, event);
                                
                                        if (Math.abs(mousePos.y - _this.height/2) < 120.0) {
                                            _currentDirection = mousePos.x < _this.width/2 ? DIRECTION.LEFT : DIRECTION.RIGHT;
                                        } else if (Math.abs(mousePos.x - _this.width/2) < 120.0) {
                                            _currentDirection = mousePos.y < _this.height/2 ? DIRECTION.UP : DIRECTION.DOWN;
                                        } if (mousePos.x < _this.width/2 && mousePos.y < _this.height/2) {
                                            _currentDirection = DIRECTION.UPLEFT;
                                        } else if (mousePos.x > _this.width/2 && mousePos.y < _this.height / 2) {
                                            _currentDirection = DIRECTION.UPRIGHT;
                                        } else if (mousePos.x < _this.width / 2 && mousePos.y > _this.height / 2) {
                                            _currentDirection = DIRECTION.DOWNLEFT;
                                        } else if (mousePos.x > _this.width/2 && mousePos.y > _this.height/2) {
                                            _currentDirection = DIRECTION.DOWNRIGHT;
                                        }
                                        
					_targetRotation = _targetRotationOnMouseDown + ( _mouseX > _mouseY ? _mouseX - _mouseXOnMouseDown : _mouseY - _mouseYOnMouseDown ) * 0.05;
                                        //printInfo();
				}

			}

			//

			this.animate = function() {

				//requestAnimationFrame( animate );
                                requestAnim( animate );
                                //controls.update();
                                //cube.rotateX(.01);//Date.now() * 0.001;//(23.5/180)*Math.PI;
                                //cube.rotateY(.01);//Date.now() * 0.001;
                                //cube.rotation.z = Date.now() * 0.001;
                                //cube.rotation.
				render();
                                
			};

			this.render = function() {
                            if (_currentDirection == DIRECTION.NOMOVE) {
                                return false;
                            } else if (_currentDirection == DIRECTION.UP) {
                                var rotation = ( _targetRotation - _this.domElement.rotation.y ) * _this.rotationSpeed;
                                _this.domElement.rotateY(-rotation);
                                //_this.domElement2.material.rotateY(-rotation);
                                //plane.rotation.y = cube.rotation.y -= Math.PI/365;
            //plane.rotation.y = cube.rotation.y -= ( targetRotation - cube.rotation.y ) * _this.rotationSpeed;
                            } else if (_currentDirection == DIRECTION.DOWN) {
                                var rotation = ( _targetRotation - _this.domElement.rotation.y ) * _this.rotationSpeed;
                                _this.domElement.rotateY(rotation);
                                //_this.domElement2.material.rotateY(rotation);
//plane.rotation.y = cube.rotation.y += Math.PI/365;
            //plane.rotation.y = cube.rotation.y += ( targetRotation - cube.rotation.y ) * _this.rotationSpeed;
                            } else if (_currentDirection == DIRECTION.LEFT) {
                                var rotation = ( _targetRotation - _this.domElement.rotation.y ) * _this.rotationSpeed;
                                _this.domElement.rotateX(-rotation);
                                //_this.domElement2.material.rotateX(-rotation);
                                /*var rotation = ( targetRotation - cube.rotation.x ) * _this.rotationSpeed;
                                cube.rotateX(-rotation);
                                plane.rotateX(-rotation);*/
//plane.rotation.x = cube.rotation.x -= Math.PI/365;
            //plane.rotation.x = cube.rotation.x -= ( targetRotation - cube.rotation.x ) * _this.rotationSpeed;
                            } else if (_currentDirection == DIRECTION.RIGHT) {
                                var rotation = ( _targetRotation - _this.domElement.rotation.y ) * _this.rotationSpeed;
                                _this.domElement.rotateX(rotation);
                                //_this.domElement2.material.rotateX(rotation);
                                /*var rotation = ( targetRotation - cube.rotation.x ) * _this.rotationSpeed;
                                cube.rotateX(rotation);
                                plane.rotateX(rotation);*/
//plane.rotation.x = cube.rotation.x += Math.PI/365;
                                //plane.rotation.x = cube.rotation.x += ( targetRotation - cube.rotation.x ) * _this.rotationSpeed;
                            } else if (_currentDirection == DIRECTION.UPLEFT) {
                                var rotation = ( _targetRotation - _this.domElement.rotation.y ) * _this.rotationSpeed;
                                _this.domElement.rotateY(-rotation);
                                _this.domElement.rotateX(-rotation);
                                //_this.domElement2.material.rotateY(-rotation);
                                //_this.domElement2.material.rotateX(-rotation);
                                /*var rotation = ( targetRotation - cube.rotation.y ) * _this.rotationSpeed;
                                cube.rotateY(-rotation);
                                plane.rotateY(-rotation);*/
//rotateAroundWorldAxis(cube, new THREE.Vector3(1, 1, 0), ( targetRotation - cube.rotation.y ) * _this.rotationSpeed);
                                //plane.rotation.y = cube.rotation.y -= ( targetRotation - cube.rotation.y ) * 0.0005;
	//plane.rotation.z = cube.rotation.z -= ( targetRotation - cube.rotation.z ) * 0.0005;			
        //plane.rotation.x = cube.rotation.x -= ( targetRotation - cube.rotation.x ) * 0.0005;
                                //plane.rotation.y = cube.rotation.y -= Math.PI/365;
                                //plane.rotation.x = cube.rotation.x -= Math.PI/365;
                            } else if (_currentDirection == DIRECTION.UPRIGHT) {
                                var rotation = ( _targetRotation - _this.domElement.rotation.y ) * _this.rotationSpeed;
                                _this.domElement.rotateY(-rotation);
                                _this.domElement.rotateX(rotation);
                                //_this.domElement2.material.rotateY(-rotation);
                                //_this.domElement2.material.rotateX(rotation);
                                /*var rotation = ( targetRotation - cube.rotation.y ) * _this.rotationSpeed;
                                cube.rotateY(-rotation);
                                plane.rotateY(-rotation);
                                cube.rotateX(rotation);
                                plane.rotateX(rotation);*/
//plane.rotation.y = cube.rotation.y -= Math.PI/365;
                                //plane.rotation.x = cube.rotation.x += Math.PI/365;
//
//plane.rotation.y = cube.rotation.y -= ( targetRotation - cube.rotation.y ) * _this.rotationSpeed;
                                //
//plane.rotation.x = cube.rotation.x += ( targetRotation - cube.rotation.x ) * _this.rotationSpeed;
                            } else if (_currentDirection == DIRECTION.DOWNLEFT) {
                                var rotation = ( _targetRotation - _this.domElement.rotation.y ) * _this.rotationSpeed;
                                _this.domElement.rotateY(rotation);
                                _this.domElement.rotateX(-rotation);
                                //_this.domElement2.material.rotateY(rotation);
                                //_this.domElement2.material.rotateX(-rotation);
                                /*var rotation = ( targetRotation - cube.rotation.y ) * _this.rotationSpeed;
                                cube.rotateY(rotation);
                                plane.rotateY(rotation);
                                cube.rotateX(-rotation);
                                plane.rotateX(-rotation);*/
//plane.rotation.y = cube.rotation.y += Math.PI/365;
                                //plane.rotation.x = cube.rotation.x -= Math.PI/365;
//
//plane.rotation.y = cube.rotation.y += ( targetRotation - cube.rotation.y ) * _this.rotationSpeed;
                                //
//plane.rotation.x = cube.rotation.x -= ( targetRotation - cube.rotation.x ) * _this.rotationSpeed;
                            } else if (_currentDirection == DIRECTION.DOWNRIGHT) {
                                var rotation = ( _targetRotation - _this.domElement.rotation.y ) * _this.rotationSpeed;
                                _this.domElement.rotateY(rotation);
                                _this.domElement.rotateX(rotation);
                                //_this.domElement2.material.rotateY(rotation);
                                //_this.domElement2.material.rotateX(rotation);
                            }
				//printInfo();
                            //renderer.render( scene, camera );
                            //_this.rotator.update();
			};


};

THREE.RotatorControls.prototype = Object.create( THREE.EventDispatcher.prototype );
THREE.RotatorControls.prototype.constructor = THREE.RotatorControls;