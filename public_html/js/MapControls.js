/**
 * 文件名: GameControls.js
 * threejs 3D 小地图控制器
 * 
 * @version V 1.00   2014-10-15
 * @author Zhou Shijie 
 */

THREE.MapControls = function ( object, domElement, proportion, focusElement) {
    this.object = object;                         // 受控目标
    this.domElement = ( domElement !== undefined ) ? domElement : document;
    this.proportion = ( proportion !== undefined ) ? proportion:1.0;    //比例
    this.focusElement = ( focusElement !== undefined ) ? focusElement : document;
    
    this._offsetLeft = 0;
    this._offsetTop = 0;
    this._viewHalfX = 0;
    this._viewHalfY = 0;

    //  调整大小
    this.onResize = function() {
        if ( this.domElement === document ) {
            this._offsetLeft = 0;
            this._offsetTop = 0;
            this._viewHalfX = window.innerWidth / 2;
            this._viewHalfY = window.innerHeight / 2;
        } else {
            var dom = this.domElement ;
            this._offsetLeft = 0;
            this._offsetTop = 0;
            do {
                this._offsetLeft += dom.offsetLeft;
                this._offsetTop += dom.offsetTop;
                dom = dom.parentNode;
            } while (dom !== null && dom !== document);
            this._viewHalfX = this.domElement.offsetWidth / 2;
            this._viewHalfY = this.domElement.offsetHeight / 2;
        }
    }

    //按下鼠标
    this.onMouseDown = function ( event ) {
        if ( this.focusElement !== document ) {
            this.focusElement.focus();
        }
        event.preventDefault();
        event.stopPropagation();
    }
    
     // 左键点击
    this.onClick = function(event) {
        event.preventDefault();
        event.stopPropagation();
        
        var mouseX = event.pageX - this._offsetLeft - this._viewHalfX;
        var mouseY = event.pageY - this._offsetTop - this._viewHalfY;
        this.object.position.x = mouseX * this.proportion;
        this.object.position.z =  mouseY * this.proportion;
    }

    // 右键菜单
    this.onContextMenu = function ( event ) {
        event.preventDefault();
        event.stopPropagation() ;
        
        var mouseX = event.pageX - this._offsetLeft - this._viewHalfX;
        var mouseY = event.pageY - this._offsetTop - this._viewHalfY;
        var vector = new THREE.Vector3( );
        vector.x = mouseX * this.proportion;
        vector.y = this.object.position.y;
        vector.z =  mouseY * this.proportion;
        this.object.lookAt ( vector );
    }

    // 禁止事件冒泡
    function forbidden(event) {
        event.preventDefault();
        event.stopPropagation();
        return false;
    }
    
    // 绑定事件
    function bind( scope, fn ) {
        return function () {
            fn.apply( scope, arguments );
        };
    };
    
    //  侦听事件
    window.addEventListener( 'resize', bind( this, this.onResize), false );
    this.domElement.addEventListener( 'mousedown', bind( this, this.onMouseDown), false );
    this.domElement.addEventListener( 'mouseup', forbidden, false );
    this.domElement.addEventListener( 'mouseout', forbidden, false );
    this.domElement.addEventListener( 'mouseover', forbidden, false );
    this.domElement.addEventListener( 'click', bind( this, this.onClick), false );
    this.domElement.addEventListener( 'contextmenu', bind( this, this.onContextMenu), false );

    this.onResize();
};
