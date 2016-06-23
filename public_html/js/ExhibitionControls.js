/**
 * 文件名: ExhibitionControls.js
 * threejs 3D 展品控制器
 *
 * @version V 1.00   2014-11-07
 * @author Zhou Shijie
 */

THREE.ExhibitionControls = function ( object, domElement ) {
    THREE.Object3D.call(this);
    this._object = object;
    this._domElement = ( domElement !== undefined ) ? domElement : document;
    if ( this._domElement !== document ) {
        this._domElement.setAttribute( 'tabindex', -1 );
        this._domElement.focus();
    }
    
    this.origin = new THREE.Vector3( 0, 0, 0 );
    this.target = new THREE.Vector3( 0, 0, 0 );
    
    this._minRadius = 0;
    this._maxRadius = Infinity;
    this._minLongitude = - Math.PI;
    this._maxLongitude = Math.PI;
    this._minLatitude = - Math.PI / 2;
    this._maxLatitude = Math.PI / 2;

    this._radius =  undefined;
    this._longitude =  undefined;
    this._latitude = undefined;
    
    this.enable = true;                                     // 是否可用
    this.moveSpeed = Math.PI / 18 ;          // 移动角速度
    this.zoomSpeed = 1.0;                            // 镜头前后移动速度
    this.autoMove = false;                             // 自动旋转
    
    //var _this = this;
    
    // 移动Flag
    var _moveLeft = false;
    var _moveRight = false;
    var _moveUp = false;
    var _moveDown = false;
    var _zoomIn = false;
    var _zoomOut = false;
    
    // 鼠标Flag
    var _mouseDragOn = false;
    var _mouseInitialX = 0;
    var _mouseInitialY = 0;
    var _mouseDeltaX = 0;
    var _mouseDeltaY = 0;
    var _wheelDelta = 0;
    
    /* 获取正交坐标值 */
    this.getPosition = function ( ) {
        var pos = this._object.position.clone();
        return pos.sub(this.origin);
    };
    
    /* 设置正交坐标值 */
    this.setPosition = function ( x, y, z ) {
        var rad = arithRadius( x, y, z ), lon = arithLongitude( x, z ), lat = arithLatitude( rad, y );
        if ( ( rad >= this._minRadius )  && ( rad <= this._maxRadius ) && ( lon >= this._minLongitude )  && ( lon <= this._maxLongitude ) && ( lat >= this._minLatitude ) && ( lat <= this._maxLatitude ) ) {
            var pos = this._object.position.set( x, y, z ).add(  this.origin );
            this._object.lookAt( this.target);
            return pos;
        } else { 
            return  this.setSpherical ( rad, lon, lat );
        }
    };

    /* 获取球坐标半径 */
    this.getRadius = function ( ) {
        var pos =  this.getPosition();
        return arithRadius ( pos.x, pos.y, pos.z );
    };

    /* 获取球坐标纬度(弧度) */
    this.getLatitude = function ( ) {
        var pos =  this.getPosition();
        var r = arithRadius( pos.x, pos.y, pos.z) ;
        return arithLatitude( r, pos.y );
    };
    
    /* 获取球坐标纬度(角度)  */
    this.getLatitudeDegree = function ( v ) {
        var lat = ( v !== undefined ) ? v : this.getLatitude();
        return THREE.Math.radToDeg(lat);
    };

    /* 获取球坐标纬度(度分秒字符串)  */
    this.getLatitudeDegreeString = function ( v ) {
        var deg = this.getLatitudeDegree( v );
        return fixDegree(deg);
    };

    /* 获取球坐标经度(弧度)  */
    this.getLongitude = function () {
        var pos =  this.getPosition();
        return arithLongitude( pos.x, pos.z );
    };

    /* 获取球坐标经度(角度)  */
    this.getLongitudeDegree = function ( v ) {
        var lon = ( v !== undefined ) ? v : this.getLongitude();
        return THREE.Math.radToDeg(lon);
    };

    /* 获取球坐标经度(度分秒字符串)  */
    this.getLongitudeDegreeString = function ( v ) {
       var deg = this.getLongitudeDegree( v );
        return fixDegree(deg);
    };

    /* 设置球坐标位置 */
    this.setSpherical = function ( rad, lon, lat ) {
        var x, y, z;
        if ( rad < this._minRadius )  rad = this._minRadius;
        if ( rad > this._maxRadius )  rad = this._maxRadius;
        if ( lon > Math.PI )  lon -= Math.PI * 2;
        if ( lon < -Math.PI )  lon += Math.PI * 2;
        if ( lon < this._minLongitude )  lon = this._minLongitude;
        if ( lon > this._maxLongitude )  lon = this._maxLongitude;
        if ( lat > Math.PI )  lat -= (Math.PI * 2);
        if ( lat < -Math.PI )  lat += (Math.PI * 2);
        if ( lat < this._minLatitude )  lat = this._minLatitude;
        if ( lat > this._maxLatitude )  lat = this._maxLatitude;
        
        this._radius = rad;
        this._longitude = lon;
        this._latitude = lat;
        
        x = rad * Math.cos(lon) * Math.cos(lat);
        y = rad * Math.sin(lat);
        z = rad * Math.sin(lon) * Math.cos(lat);
        
        var pos = this._object.position.set( x, y, z ).add( this.origin );
        this._object.lookAt( this.target);
        return pos;
    };
    
    /* 刷新控制器 */
    this.update = function( delta ) {
        if (this._radius === undefined) this._radius = this.getRadius();
        if (this._longitude === undefined) this._longitude = this.getLongitude();
        if (this._latitude === undefined) this._latitude = this.getLatitude();
        if ( !this.enable ) return;
        var changed = false;
         if ( _wheelDelta ) {
            this._radius -= _wheelDelta * delta * this.zoomSpeed;
            _wheelDelta = 0;
            changed = true;
        } else {
            var actualZoomSpeed = delta * this.zoomSpeed;
            if ( _zoomIn ) {
                this._radius -= actualZoomSpeed;
                changed = true;
            }
            if ( _zoomOut ) {
                this._radius += actualZoomSpeed;
                changed = true;
            }
        }
        if ( _mouseDragOn ) {
            var actualMoveX = Math.asin( _mouseDeltaX  / this._radius );
            var actualMoveY = Math.asin( _mouseDeltaY / this._radius );
            _mouseDeltaX = 0;
            _mouseDeltaY = 0;
            this._longitude += actualMoveX;
            this._latitude += actualMoveY;
            changed = true;
        } else {
            var actualMoveSpeed = delta * this.moveSpeed;
            if ( _moveLeft ) {
                this._longitude += actualMoveSpeed;
                changed = true;
           }
            if ( _moveRight ) {
                this._longitude -= actualMoveSpeed;
                changed = true;
            }
            if ( _moveUp ) {
                this._latitude+= actualMoveSpeed;
                changed = true;
            }
            if ( _moveDown ) {
                this._latitude -= actualMoveSpeed;
                changed = true;
            }
        }
        if ( this.autoMove && ( !changed ) ) {
            this._longitude -= actualMoveSpeed / 2;
            changed = true;
        }
        if (changed) this.setSpherical ( this._radius, this._longitude, this._latitude ) ;
    };
    
    //  侦听事件
    this._domElement.addEventListener( 'mousedown', onMouseDown, false );
    this._domElement.addEventListener( 'mousemove', onMouseMove, false );
    this._domElement.addEventListener( 'mouseup', onMouseUp, false );
    this._domElement.addEventListener( 'mouseout', onMouseOut, false );
    this._domElement.addEventListener( 'mouseover', onMouseOver, false );
    this._domElement.addEventListener( 'mousewheel', onMouseWheel, false );
    this._domElement.addEventListener( 'DOMMouseScroll', onMouseWheel, false );      //firefox
    this._domElement.addEventListener( 'keydown', onKeyDown, false );
    this._domElement.addEventListener( 'keyup',  onKeyUp, false )

    /* 鼠标按下事件 */
    function onMouseDown ( event ) {
		event.preventDefault();
		event.stopPropagation();
        if ( event.button == 0 ) {
            _mouseDragOn = true;
            _mouseInitialX = event.clientX;
            _mouseInitialY = event.clientY;
        }
        if ( this !== document ) {
            this.focus();
        }
    }

    /* 鼠标移动事件 */
    function onMouseMove ( event ) {
		event.preventDefault();
		event.stopPropagation();
        if ( _mouseDragOn ) {
            _mouseDeltaX = event.clientX - _mouseInitialX;
            _mouseDeltaY = event.clientY - _mouseInitialY;
            _mouseInitialX = event.clientX;
            _mouseInitialY = event.clientY;
        }
    }

    /* 鼠标放开事件 */
    function onMouseUp ( event ) {
        _mouseDragOn = false;
        _mouseInitialX = 0;
        _mouseInitialY = 0;
        _mouseDeltaX = 0;
        _mouseDeltaY = 0;
    }

    /* 鼠标移出事件 */
    function onMouseOut ( event ) {
        event.preventDefault();
        event.stopPropagation();
        if (event.buttons != 0) {
            _mouseDragOn = false;
        }
    }

    /* 鼠标移入事件 */
    function onMouseOver ( event ) {
        event.preventDefault();
        event.stopPropagation();
        if ( ( ( event.buttons  & 1 ) == 1 ) && ( this === document.activeElement ) ) {
            _mouseDragOn = true;
            _mouseInitialX = event.clientX;
            _mouseInitialY = event.clientY;
        }
    }
    
    /* 鼠标滚轮事件 */
    function onMouseWheel ( event ) {
        event.preventDefault();
        event.stopPropagation();
		if ( event.wheelDelta ) { // WebKit / Opera / Explorer 9
			_wheelDelta += event.wheelDelta / 40;
		} else if ( event.detail ) { // Firefox
			_wheelDelta += - event.detail / 3;
		}
    }
        
    /* 键盘按下事件 */
    function onKeyDown ( event ) {
        switch ( event.keyCode ) {
            case 38: // up
            case 87: // W
                _moveUp = true;
                break;
            case 37: // left
            case 65: // A
                _moveLeft = true;
                break;
            case 40: // down
            case 83: // S
                _moveDown = true;
                break;
            case 39: // right
            case 68: // D
                _moveRight = true;
                break;
            case 73:  // I
                _zoomIn = true;
                break;
            case 79:  // O
                _zoomOut = true;
                break;
         }       
    }
    
    /* 键盘放开事件 */
    function onKeyUp ( event ) {
        switch ( event.keyCode ) {
            case 38: // up
            case 87: // W
                _moveUp = false;
                break;
            case 37: // left
            case 65: // A
                _moveLeft = false;
                break;
            case 40: // down
            case 83: // S
                _moveDown = false;
                break;
            case 39: // right
            case 68: // D
                _moveRight = false;
                break;
            case 73:  // I
                _zoomIn = false;
                break;
            case 79:  // O
                _zoomOut = false;
                break;
         }       
    }
    
    /* 根据坐标计算半径*/
    function arithRadius( x, y, z) {
         if ( ( x == 0 ) && ( y == 0 ) && ( z == 0 ) ) {
             return 0;
         }
         return Math.sqrt( Math.pow( x, 2 ) + Math.pow( y, 2 ) + Math.pow( z, 2 ) );
    }

    /* 根据坐标计算经度*/
    function arithLongitude( x, z ) {
        if ( x == 0) {
            return (Math.PI / 2 * Math.sign(z));
        }
        if (x < 0 ) {
            if ( z < 0 ) {
                return Math.atan( z/ x)  - Math.PI;
            }
            return Math.atan( z/ x)  + Math.PI ;
        }
        return Math.atan( z / x) ;
    }

    /* 根据坐标计算纬度*/
    function arithLatitude( r, y) {
        if ( r == 0 ) {
            return 0;
        }
        return Math.asin( y / r );
    }

   function fixDegree(deg) {
       var sig = " ";
        if ( deg == 0 ) {
            return ( "" + 0 + "°");
        }
        if (deg < 0) {
            deg = -deg;
            sig = "-";
        }
        deg = deg.toFixed(8)
        var d = Math.floor(deg);
        var dm = (deg - d) * 60;
        var m = Math.floor(dm);
        var ds = (dm - m) * 60;
        var s= Math.floor(ds);
        var ms =  Math.floor((ds - s) * 1000);
        var ret = sig + d + "°" ;
        if ( dm != 0  ) {
            ret += m + "\'";
            if ( ds != 0  ) {
                 ret += s;
                 if ( ms != 0 ) {
                    ret +=  "." + ms;
                 }
                 ret += "\"";
            }
        }
        return ret;
   }
};

/* 原型 */
THREE.ExhibitionControls.prototype = {
    constructor: THREE.ExhibitionControls,
    
    get object ( ) {
        return this._object;
    },

    get domElement ( ) {
        return this._domElement;
    },

    get minRadius ( ) {
        return this._minRadius;
    },
    
    set minRadius ( rad ) {
        if ( rad <= this._maxRadius) { 
            this._minRadius = Math.max( rad, 0 );
        }
    },

    get maxRadius ( ) {
        return this._maxRadius;
    },

    set maxRadius ( rad ) {
        if ( rad >= this._minRadius) { 
            this._maxRadius =  rad;
        }
    },

    get minLongitude ( ) {
        return this._minLongitude;
    },

    set minLongitude ( lon ) {
        if ( lon <= this._maxLongitude) { 
            this._minLongitude = Math.max( lon, - Math.PI * 2 );
        }
    },

    get maxLongitude ( ) {
        return this._maxLongitude;
    },

    set maxLongitude ( lon ) {
        if ( lon >= this._minLongitude) { 
            this._maxLongitude = Math.min( lon, Math.PI * 2 );
        }
    },

    get minLatitude ( ) {
        return this._minLatitude;
    },

    set minLatitude ( lat ) {
        if ( lat <= this._maxLatitude) { 
            this._minLatitude = Math.max( lat, - Math.PI / 2 );
        }
    },

    get maxLatitude ( ) {
        return this._maxLatitude;
    },

    set maxLatitude ( lat ) {
        if ( lat >= this._minLatitude) { 
            this._maxLatitude = Math.min( lat, Math.PI / 2);
        }
    },
    
    get radius( ) {
        if (this._radius === undefined) this._radius = this.getRadius();
        return this._radius;
    },
    
     set radius( rad ) {
        if (this._longitude === undefined) this._longitude = this.getLongitude();
        if (this._latitude === undefined) this._latitude = this.getLatitude();
        this.setSpherical ( rad,  this._longitude, this._latitude );
    },
    
    get longitude( ) {
        if (this._longitude === undefined) this._longitude = this.getLongitude();
        return this._longitude;
    },
    
     set longitude( lon ) {
        if (this._radius === undefined) this._radius = this.getRadius();
        if (this._latitude === undefined) this._latitude = this.getLatitude();
        this.setSpherical( this._radius,  lon, this._latitude );
    },

    get latitude( ) {
        if (this._latitude === undefined) this._latitude = this.getLatitude();
        return this._latitude;
    },
    
     set latitude( lat ) {
        if (this._radius === undefined) this._radius = this.getRadius();
        if (this._longitude === undefined) this._longitude = this.getLongitude();
        this.setSpherical( this._radius,  this._longitude, lat );
    }
};
