/**
 * 文件名: CompassControls.js
 * threejs 3D 场景罗盘控制器
 *
 * @version V 1.00   2015-05-15
 * @author Zhou Shijie
 */

THREE.CompassControls = function ( object, domElement ) {
	var _object = object;                         // 受控目标
	var _domElement = ( domElement !== undefined ) ? domElement : document;
	
	var _offsetLeft = 0;
	var _offsetTop = 0;
	var _viewHalfX = 0;
	var _viewHalfY = 0;
		
	this.getObject = function () {
		return _object;
	};
	
	this.getDomElement = function () {
		return _domElement;
	};
	
   //  侦听事件
   window.addEventListener( 'resize', onResize, false );
	_domElement.addEventListener( 'resize', onResize, false );
   _domElement.addEventListener( 'mousedown', onMouseDown, false );
   _domElement.addEventListener( 'mouseup', forbidden, false );
   _domElement.addEventListener( 'mouseout', forbidden, false );
   _domElement.addEventListener( 'mouseover', forbidden, false );
   _domElement.addEventListener( 'click', onClick, false );
   _domElement.addEventListener( 'contextmenu', forbidden, false );
	onResize();
	
   // 禁止事件冒泡
   function forbidden(event) {
       event.preventDefault();
       event.stopPropagation();
       return false;
   }
   
   function onMouseDown(event) {
        if ( _domElement !== document ) {
            _domElement.focus();
        }
        event.preventDefault();
        event.stopPropagation();
   }

	function onResize() {
        if ( _domElement === document ) {
            _offsetLeft = 0;
            _offsetTop = 0;
            _viewHalfX = window.innerWidth / 2;
            _viewHalfY = window.innerHeight / 2;
        } else {
            var dom = _domElement ;
            _offsetLeft = 0;
            _offsetTop = 0;
            do {
                _offsetLeft += dom.offsetLeft;
                _offsetTop += dom.offsetTop;
                dom = dom.parentNode;
            } while (dom !== null && dom !== document );
            _viewHalfX = _domElement.offsetWidth / 2;
            _viewHalfY = _domElement.offsetHeight / 2;
        }
	}
	
	function onClick(event) {
		event.preventDefault();
		event.stopPropagation() ;
        
		var mouseX = event.pageX - _offsetLeft - _viewHalfX;
		var mouseY = event.pageY - _offsetTop - _viewHalfY;
		var radius =  Math.sqrt(mouseX*mouseX + mouseY* mouseY);
		if (radius !== 0) {
			if(mouseY < 0){
				_object.rotateY ( - Math.asin(mouseX / radius));
			} else {
				_object.rotateY (Math.asin(mouseX / radius) - Math.PI);
			}
		}
	}
	
};


//  原型
THREE.CompassControls.prototype = {
    constructor: THREE.CompassControls,
    get object ( ) {
        return this.getObject;
    },
    get domElement ( ) {
        return this.getDomElement;
    }
};
