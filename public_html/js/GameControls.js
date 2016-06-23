/**
 * 文件名: GameControls.js
 * threejs 3D 场景控制器
 *
 * @version V 1.00   2014-10-15
 * @author Zhou Shijie
 */

THREE.GameControls = function ( object, domElement ) {
    this.object = object;                         // 受控目标
    this.movementSpeed = 1.0;          // 移动速度
    this.rotateSpeed = 1.0;                   //旋转速度
    this.constrainVertical = false;         // 限制垂直方向
    this.minInterval = 0.1;                    // 和障碍物之间最小距离
    this.enable = true;

    this._domElement = ( domElement !== undefined ) ? domElement : document;
    if ( this._domElement !== document ) {
        this._domElement.setAttribute( 'tabindex', -1 );
        this._domElement.focus();
    }
	 
    // 移动Flag
    var _moveForward = false;
    var _moveBackward = false;
    var _moveLeft = false;
    var _moveRight = false;
    var _moveUp = false;
    var _moveDown = false;

    // 旋转Flag
    var _rotateLeft = false;
    var _rotateRight = false;
    var _rotateUp = false;
    var _rotateDown = false;
    var _dipLeft = false;
    var _dipRight = false;

    // 鼠标Flag
    var _mouseDragOn = false;
    var _mouseX = 0;
    var _mouseY = 0;

    // 坐标
    var _offsetLeft = 0;
    var _offsetTop = 0;
    var _viewHalfX = 0;
    var _viewHalfY = 0;

    var _obstacles = [];         // 所有障碍物

    // 追加障碍物
    this.addObstacle =  function(obstacle) {
        if ( obstacle === this ) {
            console.error( "THREE.GameControls.addObstacle:", obstacle, "can't be added as a obstacle of itself." );
            return this;
        }
        if ( obstacle instanceof THREE.Object3D ) {
            _obstacles.push( obstacle );
        } else {
            console.error( "THREE.GameControls.addObstacle:", obstacle, "is not an instance of THREE.Object3D." );
        }
        return this;
    };

    // 删除障碍物
    this.removeObstacle =  function(obstacle) {
        var index = _obstacles.indexOf( obstacle );
        if ( index !== - 1 ) {
            _obstacles.splice( index, 1 );
        }
    };

    //碰撞检测
    this.checkCollision = function(direction) {
       var originPoint = this.object.position.clone();
       
       var vertices = [];
        vertices.push(direction);
        if ( direction.x == 0 ) {
            vertices.push( new THREE.Vector3( - this.minInterval, direction.y, direction.z ) );
            vertices.push( new THREE.Vector3( this.minInterval, direction.y, direction.z ) );
        }
         if ( direction.y == 0 ) {
            vertices.push( new THREE.Vector3( direction.x, - this.minInterval,  direction.z ) );
            vertices.push( new THREE.Vector3( direction.x, this.minInterval, direction.z ) );
        }
         if ( direction.z == 0 ) {
            vertices.push( new THREE.Vector3( direction.x, direction.y, - this.minInterval ) );
            vertices.push( new THREE.Vector3( direction.x, direction.y, this.minInterval ) );
        }
       
        for (var i = 0; i < vertices.length; i++ ) {
            var directionPoint = vertices[i].applyMatrix4( this.object.matrix );
            var directionVector = directionPoint.clone().sub( this.object.position );
            var ray = new THREE.Raycaster( originPoint, directionVector.clone().normalize() );
            var collisionResults = ray.intersectObjects( _obstacles );
            if ( ( collisionResults.length > 0 ) && ( collisionResults[0].distance <= this.minInterval ) ) {
                return true;
            } 
        }
        return false;
    };
    
    // 刷新
    this.update = function( delta ) {
        if ( !this.enable ) return;
        var actualMoveSpeed = delta * this.movementSpeed;
        var actualRotateSpeed = delta * this.rotateSpeed * Math.PI / 36;
        
        if ( _moveForward ) {
            if( !this.checkCollision( new THREE.Vector3( 0, 0, -actualRotateSpeed - this.minInterval  ) ) )  this.object.translateZ( - actualMoveSpeed );
        }
        if ( _moveBackward ) {
            if( !this.checkCollision( new THREE.Vector3( 0, 0, actualRotateSpeed + this.minInterval ) ) )  this.object.translateZ( actualMoveSpeed );
        }
        if ( _moveLeft ) {
            if( !this.checkCollision( new THREE.Vector3( -actualRotateSpeed - this.minInterval, 0, 0 ) ) )  this.object.translateX( - actualMoveSpeed );
        }
        if ( _moveRight ) {
           if( !this.checkCollision( new THREE.Vector3( actualRotateSpeed + this.minInterval, 0, 0 ) ) )  this.object.translateX( actualMoveSpeed );
        }
        if ( _moveUp ) {
            if( !this.checkCollision( new THREE.Vector3( 0, actualRotateSpeed + this.minInterval, 0 ) ) )  this.object.translateY( actualMoveSpeed );
        }
        if ( _moveDown ) {
            if( !this.checkCollision( new THREE.Vector3( 0, -actualRotateSpeed - this.minInterval, 0 ) ) )  this.object.translateY( - actualMoveSpeed );
        }

        if ( _mouseDragOn ) {
            if ( _mouseX != 0 )  this.object.rotateY( - actualRotateSpeed * _mouseX );
            if ( _mouseY != 0 )  this.object.rotateX( - actualRotateSpeed * _mouseY );
        } else {
            if (_rotateLeft)  this.object.rotateY( actualRotateSpeed );
            if (_rotateRight)  this.object.rotateY( - actualRotateSpeed );
            if (_rotateUp)  this.object.rotateX( actualRotateSpeed );
            if (_rotateDown)  this.object.rotateX( - actualRotateSpeed );
        }
        if (_dipLeft)  this.object.rotateZ( actualRotateSpeed );
        if (_dipRight)  this.object.rotateZ( - actualRotateSpeed );
    };
    
    //  调整大小
    this.onResize = function() {
        if ( this._domElement === document ) {
            _offsetLeft = 0;
            _offsetTop = 0;
            _viewHalfX = window.innerWidth / 2;
            _viewHalfY = window.innerHeight / 2;
        } else {
            var dom = this._domElement ;
            _offsetLeft = 0;
            _offsetTop = 0;
            do {
                _offsetLeft += dom.offsetLeft;
                _offsetTop += dom.offsetTop;
                dom = dom.parentNode;
            } while (dom !== null && dom !== document);
            _viewHalfX = this._domElement.offsetWidth / 2;
            _viewHalfY = this._domElement.offsetHeight / 2;
        }
    };

    // 按下键盘
     this.onKeyDown = function( event ) {
        switch ( event.keyCode ) {
            case 38: // up
            case 87: // W
                _moveForward = true;
                break;
            case 37: // left
            case 65: // A
                _moveLeft = true;
                break;
            case 40: // down
            case 83: // S
                _moveBackward = true;
                break;
            case 39: // right
            case 68: // D
                _moveRight = true;
                break;
            case 81: // Q
                _rotateLeft = true;
                break;
            case 69: // E
                _rotateRight = true;
                break;
            case 82: // R
                _moveUp = !this.constrainVertical;
                break;
            case 70: // F
                _moveDown = !this.constrainVertical;
                break;
            case 84: // T
                _rotateUp = !this.constrainVertical;
                break;
            case 71: // G
                _rotateDown = !this.constrainVertical;
                break;
            case 90: // Z
                _dipLeft = !this.constrainVertical;
                break;
            case 67: //C
                _dipRight = !this.constrainVertical;
                break;
        }
    };

    //放开键盘
    this.onKeyUp = function( event ) {
        switch ( event.keyCode ) {
            case 38: // up
            case 87: // W
                _moveForward = false;
                break;
            case 37: // left
            case 65: // A
                _moveLeft = false;
                break;
            case 40: // down
            case 83: // S
                _moveBackward = false;
                break;
            case 39: // right
            case 68: // D
                _moveRight = false;
                break;
            case 81: // Q
                _rotateLeft = false;
                break;
            case 69: // E
                _rotateRight = false;
                break;
            case 82: // R
                _moveUp = false;
                break;
            case 70: // Fr
                _moveDown = false;
                break;
            case 84: // T
                _rotateUp = false;
                break;
            case 71: // G
                _rotateDown = false;
                break;
            case 90: // Z
                _dipLeft = false;
                break;
            case 67: //C
                _dipRight = false;
                break;
        }
    };

    //按下鼠标
    this.onMouseDown = function ( event ) {
        if ( !this.enable ) return;
        if ( this._domElement !== document ) {
            this._domElement.focus();
        }
        event.preventDefault();
        event.stopPropagation();
        switch ( event.button ) {
            case 0:
                _moveForward = true;
                break;
            case 2:
                _moveBackward = true;
                break;
        }
        _mouseDragOn = true;
    };

    //放开鼠标
    this.onMouseUp = function ( event ) {
        event.preventDefault();
        event.stopPropagation();
        switch ( event.button ) {
            case 0:
                 _moveForward = false;
                 break;
            case 2:
                _moveBackward = false;
                break;
        }
        _mouseDragOn = false;
    };

    //移动鼠标
    this.onMouseMove = function ( event ) {
            _mouseX = 2.0 * (event.pageX - _offsetLeft - _viewHalfX) / _viewHalfX;
            if (this.constrainVertical) {
                _mouseY = 0;
            } else {
                _mouseY = 2.0 * (event.pageY - _offsetTop - _viewHalfY) / _viewHalfX;
            }
    };
    
    //移出鼠标
    this.onMouseOut = function ( event ) {
        event.preventDefault();
        event.stopPropagation();
        var buttons = ( event.buttons !== undefined ) ? event.buttons : 7;
        if (buttons != 0) {
            if ((buttons & 1) == 1) {
                _moveForward = false;
            }
            if ((buttons & 2) == 2) {
                _moveBackward = false;
            }
            _mouseDragOn = false;
        }
    };

    //移入鼠标
    this.onMouseOver = function ( event ) {
        event.preventDefault();
        event.stopPropagation();
        var buttons = ( event.buttons !== undefined ) ? event.buttons : 0;
        if (( buttons != 0 ) && ( this._domElement === document.activeElement )) {
            if ((buttons & 1) == 1) {
                _moveForward = true;
            }
            if ((buttons & 2) == 2) {
                _moveBackward = true;
            }
            _mouseDragOn = true;
        }
    };
    
    // 失去焦点
    this.onBlur = function ( ) {
        _moveForward = false;
        _moveBackward = false;
        _moveLeft = false;
        _moveRight = false;
        _moveUp = false;
        _moveDown = false;
        _rotateLeft = false;
        _rotateRight = false;
        _rotateUp = false;
        _rotateDown = false;
        _dipLeft = false;
        _dipRight = false;
        _mouseDragOn = false;
        _mouseX = 0;
        _mouseY = 0;
    };

    // 右键菜单
    this.onContextMenu = function ( event ) {
        event.preventDefault();
        event.stopPropagation() ;
        return false;
    };

    // 绑定事件
    function bind( scope, fn ) {
        return function () {
            fn.apply( scope, arguments );
        };
    }

    //  侦听事件
    window.addEventListener( 'resize', bind( this, this.onResize), false );
    this._domElement.addEventListener( 'keydown', bind( this, this.onKeyDown), false );
    this._domElement.addEventListener( 'keyup',  bind( this, this.onKeyUp ), false )
    this._domElement.addEventListener( 'mousedown', bind( this, this.onMouseDown ), false );
    this._domElement.addEventListener( 'mouseup', bind( this, this.onMouseUp ), false );
    this._domElement.addEventListener( 'mousemove', bind( this, this.onMouseMove ), false );
    this._domElement.addEventListener( 'mouseout', bind( this, this.onMouseOut ), false );
    this._domElement.addEventListener( 'mouseover', bind( this, this.onMouseOver ), false );
    this._domElement.addEventListener( 'blur', bind( this, this.onBlur ), false );
    this._domElement.addEventListener( 'contextmenu', bind( this, this.onContextMenu), false );

    this.onResize();
};

//  原型
THREE.GameControls.prototype = {
    constructor: THREE.GameControls,
    get domElement ( ) {
        return this._domElement;
    }
};
