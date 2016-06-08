var CANVAS;
var CTX;
const FPS = 40;
const DT = 1/FPS;
var CANVAS_HEIGHT;
var CANVAS_WIDTH;
const INTERVALO_TIRO = 1/4;
const INTERVALO_TIRO_TIPO = 7;
const INTERVALO_INIMIGO = 10;
var intervaloInimigo;
var max_n_inimigos;
const MAX_N_INIMIGOS = 6;
var probTiroInimigo;
const PROB_TIRO_INIMIGO = 1000;
const HERO_ENERGIA = 200;
var nivel = 1;
var inicio = true;
var fim = false;
var bgo = 0;
function start() {
	CANVAS = document.getElementById("canvas");
	CTX = canvas.getContext("2d");
	var text = new Text();

	CANVAS_WIDTH = canvas.width;
	CANVAS_HEIGHT = canvas.height;

	setInterval(loop, 1000/FPS);

	var sprites = new Image(); //www.widgetworx.com
	sprites.src = "images/sprites.png";
	var scnenario = new Image();
	scnenario.src = "images/sky.png";         

	escrever = function(texto, tamanho, alinhamento, color, x, y) {
				CTX.fillStyle = color;
				CTX.font = tamanho + "px Arial";
				CTX.filStroke = color;
				CTX.textAlign = alinhamento;
				CTX.fillText(texto, x, y);
	}

	desenharInicio = function() {
		escrever("ENDLESS", 45, "center", "black", CANVAS_WIDTH/2, 100);
		escrever("FIGHT", 45, "center", "black", CANVAS_WIDTH/2, 150);
		escrever("PRESS ENTER", 30, "center", "black", CANVAS_WIDTH/2, 2*CANVAS_HEIGHT/3);
	}

	desenharFim = function() {
		escrever("ENDLESS", 45, "center", "black", CANVAS_WIDTH/2, 100);
		escrever("FIGHT", 45, "center", "black", CANVAS_WIDTH/2, 150);
		escrever("GAME OVER", 40, "center", "black", CANVAS_WIDTH/2, 2*CANVAS_HEIGHT/3-100);
		escrever("PRESS ENTER", 30, "center", "black", CANVAS_WIDTH/2, 2*CANVAS_HEIGHT/3);
	}

	desenharPlacar = function(hero) {
		escrever("PONTOS: " + hero.pontos ,12, "left", "black", 10, 30);
		escrever("NÍVEL: " + (nivel + 1), 12, "right", "black", CANVAS_WIDTH - 30, 30);
		CTX.fillStyle = "hsl("+ hero.energia + ", 75%, 59%)";
        CTX.fillRect(10,4, hero.energia * (CANVAS_WIDTH - 20)/200,10);
	}

	atualizarNivel = function(pontos) {
		nivel = Math.floor(pontos/200);
		max_n_inimigos = MAX_N_INIMIGOS + nivel;
		probTiroInimigo = PROB_TIRO_INIMIGO - nivel * 10;
	}

	Sprite = function() {
		this.x = 0;
		this.y = -10;
		this.vx = 0;
		this.ax = 0;
		this.vy = 0;
		this.ay = 0;
		this.raio = 16;
		this.cor = "lightgrey";
		this.acima = false;
		this.abaixo = false;
		this.esquerda = false;
		this.direita = false;
	}
	
	Sprite.prototype.desenhar = function(CTX){
		CTX.fillStyle = this.cor;
		CTX.strokeStyle = "red";
		CTX.lineWidth = 3;
		CTX.beginPath();
		CTX.arc(this.x, this.y, this.raio, 0, 2*Math.PI);
		CTX.closePath();
		CTX.fill();
		CTX.stroke();
	}
		
	Sprite.prototype.mover = function(){
		this.x = this.x + this.vx*DT;
		this.y = this.y + this.vy*DT;
		this.vx = this.vx + this.ax*DT;
		this.vy = this.vy + this.ay*DT;
	}	
	
	Sprite.prototype.colidiuComCircular = function (alvo) {
		var distancia = Math.sqrt(Math.pow((alvo.x - this.x),2) + Math.pow((alvo.y - this.y),2));
		return distancia < (alvo.raio + this.raio);
	}

	var hero = new Sprite();
	hero.danificado = 10;
	hero.raio = 15;
	hero.x = CANVAS_WIDTH/2;
	hero.y = CANVAS_HEIGHT-30;
	hero.velocidade = 200;
	hero.atirar = false;
	hero.tiroIntervalo = INTERVALO_TIRO;
	hero.tiroIntervaloTipo = INTERVALO_TIRO_TIPO;
	hero.tipoTiro = 1;
	hero.energia = HERO_ENERGIA;
	hero.pontos = 0;
	hero.desenhar = function() {
		CTX.drawImage(sprites, 326, 35, 48, 37, this.x-this.raio, this.y-this.raio, this.raio*2, this.raio*2);
	}
	hero.mover = function() {
		if(this.acima) 
			this.vy = this.ay = -this.velocidade;
		else if(this.abaixo) 
			this.vy = this.ay = this.velocidade;
		else {this.ay = 0; this.vy = 0;}
		if(this.esquerda) 
			this.vx = this.ax = -this.velocidade;
		else if(this.direita) 
			this.vx = this.ax = this.velocidade;
		else {this.ax = 0; this.vx = 0}
		this.x = this.x + this.vx*DT;
		this.y = this.y + this.vy*DT;		
		this.vx = this.vx + this.ax*DT;
		this.vy = this.vy + this.ay*DT;
	}
	hero.restricoes = function() {
		if(this.x < 25) {this.vx = 0; this.x = 25;}
		if(this.x > CANVAS_WIDTH - 25){this.vx = 0; this.x = CANVAS_WIDTH - 25;}
		if(this.y < 25) {this.vy = 0; this.y = 25;}
		if(this.y > CANVAS_HEIGHT - 25) {this.vy = 0; this.y = CANVAS_HEIGHT - 25;}
	}
	hero.atirando = function(tirosHero) {
		if(this.atirar && this.tiroIntervalo < 0) {
			switch (this.tipoTiro) {
				case 3:					
					tirosHero.push(criarTiroHero(hero.x, hero.y, -50));
					tirosHero.push(criarTiroHero(hero.x, hero.y, 50));
				case 2:
					tirosHero.push(criarTiroHero(hero.x, hero.y, -25));
					tirosHero.push(criarTiroHero(hero.x, hero.y, 25));
				default:
					tirosHero.push(criarTiroHero(hero.x, hero.y, 0));
				break;
			}
			this.tiroIntervalo = INTERVALO_TIRO;
			if (this.tiroIntervaloTipo < 0 && this.tipoTiro > 1) {
				this.tiroIntervaloTipo = INTERVALO_TIRO_TIPO;
				this.tipoTiro--;	
			}
		}
		this.tiroIntervalo -= DT;
		this.tiroIntervaloTipo -= DT;
	}
	hero.diminuirEnergia = function(dano) {
		this.energia -= dano;
		if (this.energia <= 0) {
			fim = true;
		}
	}
	hero.adicionarPontos = function(ponto) {
		this.pontos += ponto;
	}
	hero.upgradeTiro = function() {
		if(this.tipoTiro < 3) {
			this.tipoTiro++;
			this.tiroIntervaloTipo = INTERVALO_TIRO_TIPO;
		}
	}

	var premios = [];
	var criarPremio = function(x, y) {
		var premio = new Sprite();
		premio.raio = 8;
		premio.x = x;
		premio.y = y;
		premio.vx = 0;
		premio.vy = 0;
		premio.duracao = 5;
		premio.desenhar = function() {
			CTX.drawImage(sprites, 49, 214, 10, 10, this.x-this.raio, this.y-this.raio, this.raio*2, this.raio*2);
		};
		premio.restricoes = function() {
			this.duracao -= DT;
			if (this.duracao < 0)
				return true;
			return false;
		}
		return premio;
	}

	var tirosHero = [];
	var criarTiroHero = function(x, y, vx) {
		var tiro = new Sprite();
		tiro.x = x;
		tiro.y = y;
		tiro.raio = 3;
		tiro.vx = vx;
		tiro.vy = -400;
		tiro.ay = 0;
		tiro.desenhar = function(){
			CTX.drawImage(sprites, 49, 214, 9, 9, this.x-this.raio, this.y-this.raio, this.raio*2, this.raio*2);
		}
		tiro.restricoes = function() {
			if (this.y < -this.raio) return true;
		}
		return tiro;
	}	

	var explosoes = [];
	var criarExplosao = function(x, y, raio) {
		var explosao = new Sprite();
		explosao.x = x - raio;
		explosao.y = y - raio;
		explosao.raio = raio;
		explosao.t = 0;
		explosao.desenhar = function(){
        	CTX.save();
        	this.t += 10 * DT;
        	if(Math.floor(this.t) > 4){
        	    this.t = 0;
	            this.x = -100;
            	this.y = -100;
        	}
        	CTX.drawImage(sprites, Math.floor(this.t)* 33 + 71, 169, 30, 30, this.x, this.y, this.raio*2, this.raio*2);
        	CTX.restore();
		};
		explosao.restricoes = function() {
			if (this.y < 0)
				return true;
			return false;
		};
		return explosao;
	}

	var inimigos = [];
	criarInimigo = function (modelo) {
		var inimigo = new Sprite();
		inimigo.tipo = modelo.tipo ? modelo.tipo : 1;
		inimigo.raio = modelo.raio ? modelo.raio : 10;
		inimigo.x = modelo.x ? modelo.x : 0;
		inimigo.y = modelo.y ? modelo.y : 0;
		inimigo.vx = modelo.vx ? modelo.vx : 0;
		inimigo.vy = modelo.vy ? modelo.vy : 0;
		inimigo.ax = modelo.ax ? modelo.ax : 0;
		inimigo.ay = modelo.ay ? modelo.ay : 0;
		inimigo.sx = modelo.sx ? modelo.sx : 0;
		inimigo.sy = modelo.sy ? modelo.sy : 0;
		inimigo.sw = modelo.sw ? modelo.sw : 0;
		inimigo.sh = modelo.sh ? modelo.sh : 0;
		inimigo.max = modelo.max ? modelo.max : max_n_inimigos;
		inimigo.dano = modelo.dano ? modelo.dano : 0;
		
		inimigo.restricoes = modelo.restricoes ? modelo.restricoes : function() {};

		inimigo.mover = modelo.mover ? modelo.mover : sprite.mover;
		inimigo.recebeTiro = modelo.recebeTiro ? modelo.recebeTiro : function() {};
		inimigo.desenhar = function() {
			CTX.drawImage(sprites, this.sx, this.sy, this.sw, this.sh, this.x-this.raio, this.y-this.raio, this.raio*2, this.raio*2);
		};
		inimigo.atirar = function(tirosInimigo) {
			var sorteio = (this.tipo == 2 ? Math.floor(Math.random() * (probTiroInimigo - 500)) : Math.floor(Math.random() * probTiroInimigo));
			if( sorteio < 5 && this.y > 0) {
				switch (this.tipo) {
					case 2: 
						tirosInimigo.push(criarTiroInimigo(this.x, this.y, 25));
						tirosInimigo.push(criarTiroInimigo(this.x, this.y, -25));
					default:
						tirosInimigo.push(criarTiroInimigo(this.x, this.y, 0));
				}
			}
		}
		return inimigo;
	}

	var inimigos1 = {
		raio: 12,
		x: 0,
		xRandom: true,
		y: -12,
		sx: 4,
		sy: 4,
		sw: 32,
		sh: 30,
		vx: 90 + 20 * nivel,
		vy: 60,
		dx: -25,
		dy: -25,
		mover: function() {
			this.x = this.x + this.vx*DT;          
			this.y = this.y + this.vy*DT;
			this.vx = this.vx + this.ax*DT;
			this.vy = this.vy + this.ay*DT;
		},
		restricoes: function() {
			if (this.x < 15 && this.vx < 0) this.vx = -this.vx;
			if (this.x > CANVAS_WIDTH - 15 && this.vx > 0) this.vx = -this.vx;
			if (this.y > CANVAS_HEIGHT + 15) return true;
			return false;
		},
		recebeTiro: function() {
			explosoes.push(criarExplosao(this.x, this.y, this.raio));
			this.y = 1200;
		}
	}

	var inimigos2 = {
		raio: 12,
		x: 0,
		xRandom: true,
		y: -12,
		sx: 4,
		sy: 71,
		sw: 32,
		sh: 30,
		vx: -(90 + 20 * nivel),
		vy: 60,
		dx: 25,
		dy: -25,
		mover: function() {
			this.x = this.x + this.vx*DT;
			this.y = this.y + this.vy*DT;
			this.vx = this.vx + this.ax*DT;
			this.vy = this.vy + this.ay*DT;
		},
		restricoes: function() {
			if(this.x < 15 && this.vx < 0) this.vx = -this.vx;
			if(this.x > CANVAS_WIDTH - 15 && this.vx > 0) this.vx = -this.vx;
			if (this.y > CANVAS_HEIGHT + 15) return true;
			return false;
		},
		recebeTiro: function() {
			explosoes.push(criarExplosao(this.x, this.y, this.raio));
			this.y = 1200;
		}
	}

	var inimigos3 = {
		raio: 12,
		x: 0,
		xRandom: false,
		y: 100,
		sx: 5,
		sy: 104,
		sw: 30,
		sh: 30,
		vx: 60 + 20 * nivel,
		vy: 0,
		dx: -40,
		dy: 0,
		mover: function() {
			this.x = this.x + this.vx * DT;
			this.y = this.y + this.vy*DT;
			this.vx = this.vx + this.ax*DT;
			this.vy = this.vy + this.ay*DT;
		},
		restricoes: function() {
			if(this.x < 15 && this.vx < 0) {
				this.vy = 60 + nivel;
				this.vx = -this.vx;
			}
			if(this.x > CANVAS_WIDTH - 15 && this.vx > 0) {
				this.vy = 60 + nivel;
				this.vx = -this.vx;
			}
			if((this.y % 51) == 0) this.vy = 0;
			if (this.y > CANVAS_HEIGHT + 15) return true;
			return false;
		},
		recebeTiro: function() {
			explosoes.push(criarExplosao(this.x, this.y, this.raio));
			this.y = 1200;
		}
	}

	var inimigos4 = {
		raio: 12,
		x: CANVAS_WIDTH,
		xRandom: false,
		y: 100,
		sx: 5,
		sy: 136,
		sw: 30,
		sh: 30,
		vx: -(60 + 20 * nivel),
		vy: 0,
		dx: 40,
		dy: 0,
		mover: function() {
			this.x = this.x + this.vx * DT;
			this.y = this.y + this.vy*DT;
			this.vx = this.vx + this.ax*DT;
			this.vy = this.vy + this.ay*DT;
		},
		restricoes: function() {
			if(this.x < 15 && this.vx < 0) {
				this.vy = 60 + nivel;
				this.vx = -this.vx;
			}
			if(this.x > CANVAS_WIDTH - 15 && this.vx > 0) {
				this.vy = 60 + nivel;
				this.vx = -this.vx;
			}
			if((this.y % 51) == 0) this.vy = 0;
			if (this.y > CANVAS_HEIGHT + 15) return true;
			return false;
		},
		recebeTiro: function() {
			explosoes.push(criarExplosao(this.x, this.y, this.raio));
			this.y = 1200;
		}
	}

	var inimigos5 = {
		tipo: 2,
		raio: 30,
		x: -30,
		xRandom: false,
		y: -12,
		sx: 702,
		sy: 120,
		sw: 88,
		sh: 62,
		vx: 40 + 10 * nivel,
		vy: 60,
		dx: 0,
		dy: 0,
		max: 1,
		dano: 4 + nivel,
		mover: function() {
			this.x = this.x + this.vx*DT;
			this.y = this.y + this.vy*DT;
			this.vx = this.vx + this.ax*DT;
			this.vy = this.vy + this.ay*DT;
		},
		restricoes: function() {
			if (this.y > CANVAS_HEIGHT + 15) return true;
			return false;
		},
		recebeTiro: function() {
			this.dano -= 1;
			if (this.dano <= 0) {
				explosoes.push(criarExplosao(this.x, this.y, this.raio));
				if (premios.length == 0)
					premios.push(criarPremio(this.x, this.y));
				this.y = 1200;
			}
		}
	}

	var inimigos6 = {
		tipo: 2,
		raio: 30,
		x: CANVAS_WIDTH + 30,
		xRandom: false,
		y: -12,
		sx: 702,
		sy: 120,
		sw: 88,
		sh: 62,
		vx: -(40 + 10 * nivel),
		vy: 60,
		dx: 0,
		dy: 0,
		max: 1,
		dano: 4 + nivel,
		mover: function() {
			this.x = this.x + this.vx*DT;
			this.y = this.y + this.vy*DT;
			this.vx = this.vx + this.ax*DT;
			this.vy = this.vy + this.ay*DT;
		},
		restricoes: function() {
			if (this.y > CANVAS_HEIGHT + 15) return true;
			return false;
		},
		recebeTiro: function() {
			this.dano -= 1;
			if (this.dano <= 0) {
				explosoes.push(criarExplosao(this.x, this.y, this.raio));
				if (premios.length == 0)
					premios.push(criarPremio(this.x, this.y));
				this.y = 1200;
			}
		}
	}

	var modelosInimigos = [inimigos1,
							inimigos2,
							inimigos3,
							inimigos4,
							inimigos5,
							inimigos6
						];
	
	var criarFrotaInimigos = function(modelosInimigos) {		
		if (inimigos.length < 4  || intervaloInimigo < 0) {
			var escolha =  Math.floor(Math.random() * (modelosInimigos.length));
			var inim = modelosInimigos[escolha];
			inim.x = inim.xRandom ? Math.random() * (CANVAS_WIDTH - 20 - 20) + 20 : inim.x; 
			var max =  inim.max ? inim.max : max_n_inimigos;
			var i = 0;
			while (i < max) {
				inim.x += inim.dx;
				inim.y += inim.dy;
				inimigos.push(criarInimigo(inim));
				i++;
			}
			intervaloInimigo = (INTERVALO_INIMIGO - nivel < 2 ? 2 : INTERVALO_INIMIGO - nivel);
		}
		intervaloInimigo -= DT;
	}

	var tirosInimigo = [];
	var criarTiroInimigo = function(x, y, vx) {
		var tiroIni = new Sprite();
		tiroIni.x = x;
		tiroIni.y = y;
		tiroIni.raio = 3;
		tiroIni.vx = vx;
		tiroIni.vy = 400;
		tiroIni.ay = 0;
		tiroIni.desenhar = function(){
			CTX.drawImage(sprites, 280, 148, 9, 9, this.x - this.raio, this.y - this.raio, this.raio * 2, this.raio * 2);
		};
		tiroIni.restricoes = function() {
			if (this.y > CANVAS_HEIGHT + 10) return true;
		};
		return tiroIni;
	}

	function loop(){
		drawScenario(scnenario);
		if (inicio) {
			resetGame(hero);
			desenharInicio();
		}
		else if(fim) {
			desenharFim();			
			resetGame(hero);
		}
		else {
			criarFrotaInimigos(modelosInimigos);
			tirosInimigo.forEach(function(t) {
				if (t.colidiuComCircular(hero)) {
					tirosInimigo.splice(tirosInimigo.indexOf(t), 1);
					hero.diminuirEnergia(5);
				}
			});
	
			hero.mover();
			inimigos.forEach(function(inim) {
			 	inim.mover();
			 	inim.atirar(tirosInimigo);
			 	if (inim.restricoes()) {
			 		inimigos.splice(inimigos.indexOf(inim), 1);
			 	}
			});
			hero.restricoes();
			hero.desenhar();
			hero.atirando(tirosHero);
			tirosHero.forEach(function(tiro) {
				if(tiro.restricoes()) 
					tirosHero.splice(tirosHero.indexOf(tiro), 1);
				tiro.mover();
				tiro.desenhar();
			});
			inimigos.forEach(function(inim) {
			 	tirosHero.forEach(function(tiro) {
			 		if(tiro.colidiuComCircular(inim)){
						inim.recebeTiro();
						tiro.y = -1200;
						hero.adicionarPontos(10);
					}
				});
				if (inim.colidiuComCircular(hero)) {
					hero.diminuirEnergia(10);
					explosoes.push(criarExplosao(inim.x, inim.y, inim.raio));
					inimigos.splice(inimigos.indexOf(inim), 1);
				}
				inim.desenhar();
			});
			tirosInimigo.forEach(function(tiro) {
				if(tiro.restricoes()) 
					tirosInimigo.splice(tirosInimigo.indexOf(tiro), 1);
				tiro.mover();
				tiro.desenhar();
			});
			explosoes.forEach(function(explosao) {
				explosao.desenhar();
				if (explosao.restricoes()) {
					explosoes.splice(explosoes.indexOf(explosao), 1);
				}
			});
			premios.forEach(function(premio) {
				premio.desenhar();
				if (premio.restricoes()) {
					premios.splice(premios.indexOf(premio), 1);
				}
				if (premio.colidiuComCircular(hero)) {
					hero.upgradeTiro();
					premios.splice(premios.indexOf(premio), 1);
				}
			});
			desenharPlacar(hero);
			atualizarNivel(hero.pontos);
		}
	}

	teclaPressionada = function(e) {
		switch(e.keyCode) {
			case 13:
				inicio = false;
				fim = false;
			break;
			case 32:
				hero.atirar = true;
			break;
			case 37:
				hero.esquerda = true;
			break;
			case 38:
				hero.acima = true;
			break;
			case 39:
				hero.direita = true;
			break;
			case 40:
				hero.abaixo = true;
			break;
		}
	}

	teclaSolta = function(e) {
		switch(e.keyCode) {
			case 32:
				hero.atirar = false;
			break;
			case 37:
				hero.esquerda = false;
			break;
			case 38:
				hero.acima = false;
			break;
			case 39:
				hero.direita = false;
			break;
			case 40:
				hero.abaixo = false;
			break;
		}
	}
	addEventListener("keydown", teclaPressionada);
	addEventListener("keyup", teclaSolta);

	resetGame = function(hero) {
		max_n_inimigos = MAX_N_INIMIGOS;
		probTiroInimigo = PROB_TIRO_INIMIGO;
		nivel = 1;
		tirosHero = [];
		inimigos = [];
		tirosInimigo = [];
		premios = [];
		explosoes = [];
		hero.pontos = 0;
		hero.energia = HERO_ENERGIA;
		hero.x = CANVAS_WIDTH/2;
		hero.y = CANVAS_HEIGHT-30;
		hero.desenhar();
	}
}

function drawScenario (scnenario){
	if(bgo >= canvas.height){
		bgo =0;
	};
	CTX.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
	CTX.drawImage(scnenario, 0, 0, scnenario.width, scnenario.height, 0, 0+bgo, CANVAS_WIDTH, CANVAS_HEIGHT);
	CTX.drawImage(scnenario, 0, 0, scnenario.width, scnenario.height, 0, 0+bgo-CANVAS_HEIGHT, CANVAS_WIDTH, CANVAS_HEIGHT);
	bgo += 20*(nivel+1)*DT;
};