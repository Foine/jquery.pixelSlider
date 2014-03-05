PixelSlider
===========

Documentation non exhaustive mais résumant les principales fonctionnalités du pixelSlider.
Current version: 1.0

**I/ Mise en place PixelSlider**

***1/ Inclure le fichier js***

Après l'installation de la lib pixelSlider, include dans le bottom du <body> la ligne suivante : 

	<script type="text/javascript" src="static/libs/jquery.pixelSlider/jquery.pixelSlider.js"></script>


***2/ construction html***

		Construire son slide de cette façon : 
		<div class="slide">
			<ul>
				<li> 
					<!--contenu texte ou image --> 
				</li>
				<li> 
					<!--contenu texte ou image --> 
				</li>
				<li> 
					<!--contenu texte ou image --> 
				</li>
				<!-- etc... -->
			</ul>
		</div>
		
		<div class="slide_navigation">
			<a href="javascript:;" class="go_left"> Aller à gauche </a>
			<a href="javascript:;" class="go_right"> Aller à droite </a>
		</div>


***3/ définir le css***

		Ici un exemple de slider de largeur 800px et hauteur 200px

		.slide {
			overflow : hidden;
			width : 800px;
			height : 200px;
		}
		.slide ul {
			margin : 0;
			padding : 0;
			list-style : none;
			width : 50000px; /* on prévoit une largeur importante pour s'assurer que les li soient ien tous les uns à la suite des autres, la largeur est ensuite recalculée en js */
			height : 100%;
		}
		.slide ul li {
			display : block;
			float : left;
			height : 100%;
			width : 800px;
		}
		
		/!\ Attention : bien respecter la même largeur du conteneur .slide et de chaque li.
		
***4/ initialisation slider***
		
Dans un fichier js, mise en place de l'initialisation du slider : 
		
	(function() {
		jQuery(document).ready(function() {
		
			$('.slide').pixelslider({
				'prev_button' 			: '.slide_navigation a.go_left',
				'next_button' 			: '.slide_navigation a.go_right',
				'hide_arrow'			: true, // masque les flèche à la fin du diapo
				'touch'					: true, // active la navigation swipe tablette
				'cycle'					: true, // en boucle
				'timer'                 : 5000, // lecture automatique
				'speed'                 : 900, // vitesse de défilement
				
				/* D'autres paramètres sont possibles, se référer au début du jquery.pixelSlider.js */
			});
		
		});
	});
		
		
Si plusieurs sliders ont les mêmes propriétés css dans le site, il suffit de boucler sur chaque iterration de slider pour l'initialisation : 
		
	$('.slide').each(function() {
		$(this).pixelslider({
			'prev_button' 			: '.slide_navigation a.go_left',
			'next_button' 			: '.slide_navigation a.go_right',
			'hide_arrow'			: true, // masque les flèche à la fin du diapo
			'touch'					: true, // active la navigation swipe tablette.
			'cycle'					: true, // en boucle
			'timer'                 : 5000, // lecture automatique
			'speed'                 : 900, // vitesse de défilement
		});
	});  
    
    
**II/ Fonctionnalités avancées**


***1/ loading_content***
	
Permet de charger les images à la volées pour éviter de charger tout le contenu de toutes les diapos.

Si on ajoute une zone de loading (gif animé ou animation css), on peut rajouter le paramètre 'loader' pour afficher cette zone au chargement de l'image suivante.
		
*a/ construction html
		
	<div class="slide">
		<ul>
			<li> 
				<img src="image1.jpg" alt="img1">
			</li>
			<li data-src="image2.jpg" data-alt="img2"></li>
			<li data-src="image3.jpg" data-alt="img3"></li>
			<!-- etc... -->
		</ul>
	</div>
			
	<img src="mon_loader.gif" class="zone_loader">
		
*b/ initialisation slider
		
	$('.slide').pixelslider({
		'loading_content'		: true,
		'loader'				: '.zone_loader' // facultatif
	});
			
			
		
			
***2/ auto_adjust***
	
Permet de croper / resizer les images présentes dans les li en fonction du conteneur.
Si la valeur est à true, simple crop resize. Si la valeur est background, le diapo se met en fond d'écran (full largeur, full hauteur)

*a/ construction html
		
	<div class="slide">
		<ul>
			<li> 
				<img src="image1grande.jpg" alt="img1">
			</li>
			<li> 
				<img src="image2grande.jpg" alt="img2">
			</li>
			<li> 
				<img src="image3grande.jpg" alt="img3">
			</li>
			<!-- etc... -->
		</ul>
	</div>
		
			
*b/ initialisation slider
		
	// simple crop resize 
	$('.slide').pixelslider({
		'auto_adjust'			: true,
	});
	
	
	// diaporama en fullscreen 
	$('.slide').pixelslider({
		'auto_adjust'			: 'background',
	});



***3/ numerotation***
	
Si on défini une zone de numérotation, le système créera automatiquement un contenu du type "5/11"
		
*a/ construction html
		
	<div class="slide">
		<ul>
			<li> 
				<!--contenu text ou image --> 
			</li>
			<li> 
				<!--contenu text ou image --> 
			</li>
		</ul>
	</div>
	
	<div class="zone_numerotation"></div>
			
*b/ initialisation js
		
	$('.slide').pixelslider({
		'numerotation'			: 'zone_numerotation',
	});
			
*c/ rendu html
			
	<div class="slide">
		<ul>
			<li> 
				<!--contenu text ou image --> 
			</li>
			<li> 
				<!--contenu text ou image --> 
			</li>
		</ul>
	</div>
	
	<div class="zone_numerotation">1/2</div>
			

***4/ lightbox***
	
Le pixelSlider permet d'avoir une lightbox pour zoomer chaque image. On peut également rajouter une url HD pour charger une image
à une résolution supérieure en lightbox. Il est également possible de rajouter un champ spécifique pour le click lightbox. Si ce 
dernier n'est pas renseigné, le click se fera sur l'image entière.
Pour finir il est possible d'ajouter une couleur de fond à la lightbox. Elle est par défaut en blanc semi transparent, mais on peut 
lui donner une valeur à black. 
		
*a/ construction html
		
	<div class="slide">
		<ul>
			<li data-hd="image1grande.jpg"> <!-- date-hd facultatif -->
				<img src="image1petite.jpg" alt="img1">
				<a href="#" class="zoom"><img src="loupe.jpg"></a> <!-- facultatif -->
			</li>
			<li data-hd="image2grande.jpg">
				<img src="image2petite.jpg" alt="img2">
				<a href="#" class="zoom"><img src="loupe.jpg"></a> 
			</li>
			<li data-hd="image3grande.jpg">
				<img src="image3petite.jpg" alt="img3">
				<a href="#" class="zoom"><img src="loupe.jpg"></a> 
			</li>
			<!-- etc... -->
		</ul>
	</div>
			
			
*b/ initialisation js
		
	$('.slide').pixelslider({
		'lightbox'				: true,
		'lightbox_click'		: '.zoom',  /* facultatif */
		'lightbox_color'		: 'black', /* facultatif */
	});
			
			
			
***5/ callback***

Le pixelSlider propose plusieurs points d'entrée 'callback' à différentes étapes du slider : 

							
- img_ready   	  	 	: après le chargement des images du slider 
- after_loading   	 	: après le chargement de l'image suivante / avant l'animation 
- after_resize_ul 	 	: après le recalcul de taille du ul (renvoi l'objet ul en paramètre de la fonction)
- after_animation		: après l'animation (renvoi l'objet li courant en paramètre de la fonction)
- before_animation	 	: avant l'animation

		
*a/ initialisation js
		
	$('.slide').pixelslider({
		 'callback' : { 'after_animation' : callback_slider }
	});

	function callback_slider(li) {
		// traitement
	}



***6/ points d'entrée externe***

Il est possible de controler post-initialisation le slider
		
	$('.slide').pixelslider('pause'); // met le slider en pause
	$('.slide').pixelslider('resume'); // met le slider en lecture
	$('.slide').pixelslider('reinitialise'); // réinitialise le slider en position de départ
	$('.slide').pixelslider('speed',300); // change la vitesse à 300ms
	$('.slide').pixelslider('next'); // affiche s'il existe le slide suivant
	$('.slide').pixelslider('previous'); // affiche s'il existe le slide précédent
	$('.slide').pixelslider('goTo',5); // accès direct au 5ème élément du slider 
		

***7/ exemple complexe***
	
Dans cet exemple on souhaite un slider fuulscreen avec un chargement d'image à la volée, ainsi qu'un zoom, et une zonne spécifique de bullet point
	
*a/ construction html
		
	<div class="content_slide">
		<div class="slide">
			<ul>
				<li data-id="1" data-hd="image1grande.jpg"> 
					<img src="image1petite.jpg" alt="img1">
					<img class="zoom" src="loope.jpg">
				</li>
				<li data-id="2" data-src="image2.jpg" data-alt="img2" data-hd="image2grande.jpg">
					<img class="zoom" src="loope.jpg">
				</li>
				<li data-id="3" data-src="image3.jpg" data-alt="img3" data-hd="image3grande.jpg">
					<img class="zoom" src="loope.jpg">
				</li>
			</ul>
		</div>
		<a href="javascript:;" class="go_left"><img src="go_left.jpg"></a>
		<a href="javascript:;" class="go_right"><img src="go_right.jpg"></a>
		
		<div class="zone_bullet">
			<ul>
				<li class="bullet_1" class="active"><a href="javascript:onclick="goto_slider(1);";">1</a>
				<li class="bullet_2"><a href="javascript:onclick="goto_slider(2);";">2</a>
				<li class="bullet_3"><a href="javascript:onclick="goto_slider(3);";">3</a>
			</ul>
		</div>
	</div>
			
*b/ définir le css

	.content_slide {
		position : absolute;
		width : 1000px;
		height	: 200px;
	}
	.content_slide .go_left, 
	.content_slide .go_right { 
		position : absolute;
		height : 50px;
		width : 50px;
		display : block;
	}
	.content_slide .go_left {
		left	: 50px
	}
	.content_slide .go_right {
		right	: 50px
	}
	.content_slide .slide {
		overflow : hidden;
		width : 800px;
		height : 200px;
		margin : auto;
	}
	.content_slide .slide ul {
		margin : 0;
		padding : 0;
		list-style : none;
		width : 50000px;
		height : 100%;
	}
	.content_slide .slide ul li {
		display : block;
		float : left;
		height : 100%;
		width : 800px;
	}
			
*c/ initialisation js
		
	$('.content_slide .slide').pixelslider(
	{
		'prev_button' 				: '.content_slide .slide .go_left',
		'next_button' 				: '.content_slide .slide .go_right',
		'loader'	  				: '',
		'timer'						: 3000,
		'loading_content' 			: true,
		'touch'						: true,
		'move_on_click'				: false,
		'hide_arrow'				: true,
		'fullscreen'				: true,
		'callback'	  : { 
			'after_animation'	 : after_animate_home
		}
	});
	
	function goto_slider(i) {
		$('.content_slide .slide').pixelslider('goTo',i);
	}
	
	function after_animate_home(li) {
		$('.zone_bullet').find('a.active').removeClass('active');
		$('.zone_bullet').find('a').each(function() {
			var $this = $(this);
			if ($this.hasClass('bullet_' + li.attr('data-id')) {
				this.addClass('active');
			}
		});
	}
			
