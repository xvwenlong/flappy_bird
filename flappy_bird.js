
//加载图片函数[loadImages]
(function (win) {
    function loadImages(imageUrl,fn) {
        var imgObject={};//全部加载完毕后返回存储图片的对象
        var loaded=0;//加载图片次数计数器
        var imgLength=0;//遍历地址对象长度计数器
        var tempImg;//临时定义图片
        for(var key in imageUrl){
            imgLength++;
            tempImg=new Image();//新建图片对象
            tempImg.onload= function () {
                loaded++;
                if(loaded>=imgLength){
                    fn(imgObject);
                }
            }
            tempImg.src=imageUrl[key];
            imgObject[key]=tempImg;
        }
    }
    win.loadImages=loadImages
}(window));
//绘制背景[Sky]
(function (win) {
    function Sky(ctx,img,speed) {
        this.ctx=ctx;
        this.img=img;
        this.width = this.img.width; //画布宽高定义为图片的宽高
        this.height = this.img.height;
        this.speed=speed;
        Sky.len++;//计数器,每创建一个对象自加一次,为了实现无缝轮播效果
        this.x=this.width*(Sky.len-1);
        this.y=this.ctx.canvas.height-this.height;
    };
    Sky.len=0;
    //替换原型
    Sky.prototype={
        constructor:Sky,
        draw: function () {
            this.ctx.drawImage(this.img,this.x,this.y);
        },
        update: function () {
            this.x -= this.speed;
            if ( this.x <= -this.width ) {
                //当图片走出画布左端以后,将绘制位置瞬移到整组图的最后
                this.x += this.width*Sky.len;
            }
        }
    }
    //工厂模式
    win.getSky= function (ctx,img,speed) {
        return new Sky(ctx,img,speed);
    };
}(window));
//绘制小鸟
(function (win) {
    function Bird(ctx,img,widthFrame,heightFrame,x,y,speed) {
        this.ctx=ctx;
        this.img=img;
        this.widthFrame=widthFrame;
        this.heightFrame=heightFrame;
        this.x=x;
        this.y=y;
        this.width=this.img.width/this.widthFrame;
        this.height=this.img.height/this.heightFrame;
        this.currentFrame=0;
        this.speed=speed||2;
        this.speedPlus=0.1;
        this._bind();
    }
    Bird.prototype={
        constructor:Bird,
        draw: function () {
            var baseRotate=Math.PI/180*10;
            var minRotate=Math.PI/180*50;
            var currentRotate=baseRotate*this.speed;
            currentRotate=currentRotate>minRotate?minRotate:currentRotate;
            this.ctx.save();
            this.ctx.translate(this.x+this.width/2,this.y+this.height/2);
            this.ctx.rotate(currentRotate);
            this.ctx.drawImage(this.img,this.width*(++this.currentFrame%this.widthFrame),0,this.width,this.height,-this.width/2,-this.height/2,this.width,this.height);
            this.ctx.restore();
        },
        update: function () {
            this.y+=this.speed;
            this.speed+=this.speedPlus;
        },
        _bind: function () {
            var self=this;
            this.ctx.canvas.onclick= function () {
                self.speed=-2;
            }
        }
    }
    //单例模式
    var bird=null;
    win.getBird= function (ctx,img,widthFrame,heightFrame,x,y,speed) {
        if(!bird){
            bird=new Bird(ctx,img,widthFrame,heightFrame,x,y,speed);
        }
        return bird;
    };
}(window));
//绘制下方背景[Land]
(function (win) {
    function Land(ctx,img,speed) {
        this.ctx=ctx;
        this.img=img;
        this.width = this.img.width;
        this.height = this.img.height;
        this.speed=speed;
        Land.len++;//每创建一个对象自增一次,为了实现无缝轮播效果
        this.x=this.width*(Land.len-1);//每个对象绘制的起始位置(x)--->变化的
        this.y=this.ctx.canvas.height-this.height;//每个对象绘制的起始位置(y)--->固定的
    }
    Land.len=0;//计数器
    Land.prototype={
        constructor:Land,
        //绘制图片
        draw: function () {
            this.ctx.drawImage(this.img,this.x,this.y);
        },
        //计算下一帧绘制时的数据
        update: function () {
            this.x -= this.speed;
            if ( this.x <= -this.width ) {
                this.x += this.width*Land.len;
            }
        }
    }
    //工厂模式
    win.getLand= function (ctx,img,speed) {
        return new Land(ctx,img,speed);
    };
}(window));
//绘制上管道[Pipe]
(function (win) {
    function Pipe(ctx,imgDown,imgUp,space,landHeight,speed) {
        this.ctx=ctx;this.imgDown=imgDown;this.imgUp=imgUp;this.space=space;this.speed=speed;
        this.landHeight=landHeight;
        this.width=this.imgDown.width;
        this.height=this.imgDown.height;
        this.minHeight=80;
        Pipe.len++;
        this.x=300+this.width*4*(Pipe.len-1);
        this.y=0;
        this._init();
    }
    Pipe.len=0;
    Pipe.prototype={
        //初始化管道的坐标
        _init: function () {
            //管道的最大高度
            var maxHeight=this.ctx.canvas.height-this.landHeight-this.space-this.minHeight;
            //随机生成的高度,50--maxHeight之间
            var randomHeight=Math.random()*maxHeight;
            randomHeight=randomHeight<this.minHeight?this.minHeight:randomHeight;
            //上管道的y轴坐标=随机生成的高度-管道默认的高度--->(防止图片压缩)
            this.downY=randomHeight-this.height;
            //下管道的y轴坐标=随机生成的高度+上下管道的间隔空隙
            this.upY=randomHeight+this.space;
        },
        draw: function () {
            this.ctx.drawImage(this.imgDown,this.x,this.downY);
            this.ctx.drawImage(this.imgUp,this.x,this.upY);
            this._drawPath();
        },
        _drawPath: function () {
            this.ctx.rect(this.x,this.downY,this.width,this.height);
            this.ctx.rect(this.x,this.upY,this.width,this.height);
        },
        //更新下一帧数据
        update: function () {
            this.x-=this.speed;
            if(this.x<=-this.width){
                this._init();
                this.x +=this.width*4*Pipe.len;
            };
        }
    }
    //工厂模式
    win.getPipe= function (ctx,imgDown,imgUp,space,landHeight,speed) {
        return new Pipe(ctx,imgDown,imgUp,space,landHeight,speed);
    };
}(window));
//游戏场景绘制
(function (win) {
    function Scene(ctx, imgObj) {
        this.ctx=ctx;this.imgObj=imgObj;
        this.roles=[];
        this.listener=[];
        this._init();
    }
    Scene.prototype={
        constructor:Scene,
        _init: function () {
            //创建天空背景对象
            this.roles.push(getSky( ctx, this.imgObj.sky, 1 ));
            this.roles.push(getSky( ctx, this.imgObj.sky, 1 ));
            //创建管道对象
            for (var i = 0; i < 6; i++) {
                this.roles.push(getPipe( this.ctx,this.imgObj.pipeDown,this.imgObj.pipeUp,100,this.imgObj.land.height,1))
            }
            //创建陆地背景对象
            for (var i = 0; i < 4; i++) {
                this.roles.push(getLand( this.ctx, this.imgObj.land, 1 ))
            }
            //创建小鸟对象

            this.roles.push(getBird(this.ctx,this.imgObj.bird,3,1,10,10));
        },
        //※事件监听,当满足条件时,在事件中回调fn(用数组是为了复用)
        addlistener: function (fn) {
            this.listener.push(fn);
        },
        draw: function () {
            var bird=getBird();
            var birdCoodX=bird.x+bird.width/2;
            var birdCoodY=bird.y+bird.height/2;
            if(this.ctx.isPointInPath(birdCoodX,birdCoodY)
                ||birdCoodY<0
                ||birdCoodY>this.ctx.canvas.height-this.imgObj.land.height){
                //满足条件时,对事件监听数组进行遍历,然后调用回调函数.
                this.listener.forEach(function (listen) {
                        listen();
                })
            }else{
                this.ctx.beginPath();
                for (var i = 0; i < this.roles.length; i++) {
                    this.roles[i].draw();
                    this.roles[i].update();
                }
            }

        }
    }
    win.getGameScene= function (ctx, imgObj) {
        return new Scene(ctx, imgObj);
    }
}(window));
//游戏结束场景
(function (win) {
    function OverScene(ctx) {
        this.ctx=ctx;
    }
    OverScene.prototype={
        constructor:OverScene,
        draw: function () {
            this.ctx.save();
            this.ctx.fillStyle="rgba(100,100,100,0.6)";
            this.ctx.fillRect(0,0,this.ctx.canvas.width,this.ctx.canvas.height);
            this.ctx.font="900 60px 微软雅黑";
            this.ctx.textAlign="center";
            this.ctx.textBaseline="middle";
            this.ctx.fillStyle="red";
            this.ctx.fillText("Game Over!!!",this.ctx.canvas.width/2,this.ctx.canvas.height/2-30);
            this.ctx.restore();
        }
    }
    win.getOverScene= function (ctx) {
            return new OverScene(ctx);
    }
}(window));

