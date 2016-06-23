/**
 * 文件名: PanoramaControls.js
 * threejs 3D 全景图控制器
 *
 * @version V 1.00   2014-11-07
 * @author Zhou Shijie
 */

THREE.PanoramaControls = function ( camera, domElement ) {
    this._camera = camera;
    this._domElement = ( domElement !== undefined ) ? domElement : document;
    if ( this._domElement !== document ) {
        this._domElement.setAttribute( 'tabindex', -1 );
        this._domElement.focus();
    }
    
    this.radius = 1000;
    this.maxLat = 85;
    this.minLat = -85;
    this.maxFov = 150;
    this.minFov = 15;
    this.rotateSpeed = 1.0;
    this.zoomSpeed = 0.5;
    this.autoMove = false;                             // 自动旋转
    this.autoMoveSpeed = 0.2;
    this.autoMoveDelay = 60;
    
    var rotateLeft = false, rotateRight = false, rotateUp = false, rotateDown = false;
    var zoomIn = false, zoomOut = false;
    
    var isUserInteracting = false,
    onMouseDownMouseX = 0, onMouseDownMouseY = 0,
    lon = 0, onMouseDownLon = 0,
    lat = 0, onMouseDownLat = 0;
    
    var changeFov = false, isUserZooming = false,
    onTouchZoomStart = 0, onTouchZoomEnd = 0,
    fov = camera.fov;
    
    var clock = new THREE.Clock();
    var refDelta = 0;
    
    this.update = function () {
        var dtlt = clock.getDelta();

        if ( ! isUserInteracting ) {
            if ( rotateUp )  lat += this.rotateSpeed;
            if ( rotateDown )  lat -= this.rotateSpeed;
            if ( rotateLeft )  lon -= this.rotateSpeed;
            if ( rotateRight )  lon += this.rotateSpeed;
            if ( this.autoMove )  {
            	if (refDelta < this.autoMoveDelay) { 
                    refDelta += dtlt;
                } else {
            	   lon += this.autoMoveSpeed;
                }
            }
        }
        lat = Math.max( this.minLat, Math.min( this.maxLat, lat ) );
        var phi = THREE.Math.degToRad( 90 - lat );
        var theta = THREE.Math.degToRad( lon );
        var x = this.radius * Math.sin( phi ) * Math.cos( theta ),  y = this.radius * Math.cos( phi ), z = this.radius * Math.sin( phi ) * Math.sin( theta );
        this._camera.position.set(  -x,  -y, -z );
        this._camera.lookAt( new THREE.Vector3( x,y,z ) );
        if (zoomIn) {
            fov -= this.zoomSpeed;
             changeFov = true;
        }
        if (zoomOut) {
            fov += this.zoomSpeed;
            changeFov = true;
        }
        if (changeFov) {
            fov = Math.max( this.minFov, Math.min( this.maxFov, fov ) );
            this._camera.fov = fov;
            this._camera.updateProjectionMatrix();
            changeFov = false;
        }
    };
    
    this._domElement.addEventListener( 'contextmenu', function ( event ) { event.preventDefault(); }, false );
    this._domElement.addEventListener( 'keydown', onKeyDown, false );
    this._domElement.addEventListener( 'keyup',  onKeyUp, false );
    this._domElement.addEventListener( 'mousedown', onMouseDown, false );
    this._domElement.addEventListener( 'mousemove', onMouseMove, false );
    this._domElement.addEventListener( 'mouseup', onMouseUp, false );
    this._domElement.addEventListener( 'mouseout', onMouseOut, false );
    this._domElement.addEventListener( 'mouseover', onMouseOver, false );
    this._domElement.addEventListener( 'mousewheel', onMouseWheel, false );
    this._domElement.addEventListener( 'DOMMouseScroll', onMouseWheel, false );      //firefox
    this._domElement.addEventListener( 'touchstart', onTouchStart, false );
    this._domElement.addEventListener( 'touchmove', onTouchMove, false );
    this._domElement.addEventListener( 'touchend', onTouchEnd, false );
    
    function onKeyDown( event ) {
        refDelta = 0;
        switch ( event.keyCode ) {
            case 38: // up
            case 87: // W
                rotateUp = true;
                break;
            case 37: // left
            case 65: // A
                rotateLeft = true;
                break;
            case 40: // down
            case 83: // S
                rotateDown = true;
                break;
            case 39: // right
            case 68: // D
                rotateRight = true;
                break;
            case 73:  // I
                zoomIn = true;
                break;
            case 79:  // O
                zoomOut = true;
                break;
        }    
    }
    
    function onKeyUp( event ) {
        refDelta = 0;
        switch ( event.keyCode ) {
            case 38: // up
            case 87: // W
                rotateUp = false;
                break;
            case 37: // left
            case 65: // A
                rotateLeft = false;
                break;
            case 40: // down
            case 83: // S
                rotateDown = false;
                break;
            case 39: // right
            case 68: // D
                rotateRight = false;
                break;
            case 73:  // I
                zoomIn = false;
                break;
            case 79:  // O
                zoomOut = false;
                break;
        }    
    }
    
    function onMouseDown( event ) {
        event.preventDefault();
        refDelta = 0;
        isUserInteracting = true;
        onMouseDownMouseX = event.clientX;
        onMouseDownMouseY = event.clientY;
        onMouseDownLon = lon;
        onMouseDownLat = lat;
        if ( this !== document ) {
            this.focus();
        }
    }

    function onMouseMove( event ) {
        event.preventDefault();
        event.stopPropagation();
        refDelta = 0;
        if ( isUserInteracting === true ) {
            lon = ( onMouseDownMouseX - event.clientX ) * 0.1 + onMouseDownLon;
            lat = ( event.clientY - onMouseDownMouseY ) * 0.1 + onMouseDownLat;
        }
    }
    
    function onMouseUp( event ) {
        refDelta = 0;
        isUserInteracting = false;
    }
    
    function onMouseOut ( event ) {
        event.preventDefault();
        refDelta = 0;
        isUserInteracting = false;
    }
    
    function onMouseOver ( event ) {
        event.preventDefault();
        refDelta = 0;
        if ( ( (event.buttons  & 1 ) == 1 ) && ( this === document.activeElement ) ) {
            isUserInteracting = true;
        }
    }
    
    function onMouseWheel ( event ) {
        event.preventDefault();
        refDelta = 0;
        if ( event.wheelDeltaY ) {
            fov -= event.wheelDeltaY * 0.025;
        } else if ( event.wheelDelta ) {
            fov -= event.wheelDelta * 0.025;
        } else if ( event.detail ) {
            fov += event.detail * 0.3;
        }
        changeFov = true;
    }
    
    function onTouchStart ( event ) {
        //event.preventDefault();
        event.stopPropagation();
        refDelta = 0;
        switch ( event.touches.length ) {
            case 1:
                isUserInteracting = true;
                onMouseDownMouseX = event.touches[ 0 ].clientX;
                onMouseDownMouseY = event.touches[ 0 ].clientY;
                onMouseDownLon = lon;
                onMouseDownLat = lat;
                break;
            case 2:
                isUserZooming = true;
                onMouseDownMouseX = ( event.touches[ 0 ].clientX + event.touches[ 1 ].clientX ) / 2;
                onMouseDownMouseY = ( event.touches[ 0 ].clientY + event.touches[ 1 ].clientY ) / 2;
                onMouseDownLon = lon;
                onMouseDownLat = lat;
                 var dx = event.touches[ 0 ].clientX - event.touches[ 1 ].clientX;
                 var dy = event.touches[ 0 ].clientY - event.touches[ 1 ].clientY;
                 onTouchZoomStart = Math.sqrt( dx * dx + dy * dy );
                 break;
        }
        if ( this !== document ) {
            this.focus();
        }
    }

    function onTouchMove ( event ) {
        event.preventDefault();
        event.stopPropagation();
        refDelta = 0;
        switch ( event.touches.length ) {
            case 1:
                if ( isUserInteracting === true ) {
                    lon = ( onMouseDownMouseX - event.touches[ 0 ].clientX ) * 0.1 + onMouseDownLon;
                    lat = ( event.touches[ 0 ].clientY - onMouseDownMouseY ) * 0.1 + onMouseDownLat;
                }
                break;
            case 2:
                if ( isUserZooming === true ) {
                    lon = ( onMouseDownMouseX - ( ( event.touches[ 0 ].clientX + event.touches[ 1 ].clientX ) / 2 ) ) * 0.1 + onMouseDownLon;
                    lat = ( ( ( event.touches[ 0 ].clientY + event.touches[ 1 ].clientY ) / 2 ) - onMouseDownMouseY ) * 0.1 + onMouseDownLat;
                    var dx = event.touches[ 0 ].clientX - event.touches[ 1 ].clientX;
                    var dy = event.touches[ 0 ].clientY - event.touches[ 1 ].clientY;
                    onTouchZoomEnd = Math.sqrt( dx * dx + dy * dy );
                    fov -= (onTouchZoomEnd - onTouchZoomStart) * 0.1;
                    onTouchZoomStart = onTouchZoomEnd;
                    changeFov = true;
                }
                break;
        }
    }

    function onTouchEnd ( event ) {
        refDelta = 0;
        switch ( event.touches.length ) {
            case 0:
                isUserInteracting = false;
                break;
            case 1:
                isUserZooming = false;
                break;
        }
    }

}

/* 原型 */
THREE.PanoramaControls.prototype = {
    constructor: THREE.PanoramaControls,
    
    get camera ( ) {
        return this._camera;
    },

    get domElement ( ) {
        return this._domElement;
    }
}