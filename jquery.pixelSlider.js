/*
 * PixelSlider
 * Version: 1.0
 * Copyright: Pixel
 *
 * Pour utiliser :
 * Cibler un �l�ment contenant une liste (ul)
 * Cibler les �l�ments qui serviront de bouton pour la navigation dans les options
 *
 */

/* EXTEND des transitions jquery pour l'animation par d�faut */
jQuery.easing['jswing'] = jQuery.easing['swing'];


jQuery.extend( jQuery.easing,
    {
        easeInOutQuint: function (x, t, b, c, d) {
            if ((t/=d/2) < 1) return c/2*t*t*t*t*t + b;
            return c/2*((t-=2)*t*t*t*t + 2) + b;
        }
    });

(function ($) {
    var methods = {
        //$.fn.pixelslider = function (options) {
        init : function( options ) {

            // Defaults
            var defaults = {
                "speed"						: 1100,					// vitesse de d�filement
                "end_go_to_start"			: false,				// lecture en boucle du slider
                "cycle"                     : false,                // lecture en boucle multi-elements , plus lourde que le end_go_to_start et incompatible avec fullscreen et animation type fade
                "next_button" 				: '.pixelSlider_next',	// class / id du lien diapo suivant
                "prev_button" 				: '.pixelSlider_prev',	// class / id du lien diapo pr�c�dent
                "move_on_click"				: true,					// activation du slide au clic sur les �l�ments suivants
                "apply_min_css"     		: false,				// mise en place d'un css minimum
                "css_this"          		: '',					// application du css sur l'objet courant
                "css_ul"            		: '',					// application du css sur l'ul
                "css_li"            		: '',					//application du css sur les li
                "animation"					: 'slide',				// type d'animation (slide / fade)
                "easing"            		: 'easeInOutQuint',		// type de translation (easeInOutQuint | easing)
                "loader"            		: false,				// class / id du loader � afficher au chargement d'image
                "hide_arrow"				: false,				// masquage des fl�ches de navigation en d�but ou fin de slider
                "timer"						: 0,					// si > 0, d�filement automatique activ� avec timer = temps (en ms) d'affichage de chaque slide
                "loading_content"   		: false,				// si != false, chargement des images de slides suivants avec infos contenues en data-src et data-alt de l'�l�ment li
                "numerotation"      		: false,				// class / id de la zone de num�rotation courante du slider
                "multiple_elem_visible"   	: false,				// si true, force dans la mesure du possible l'affichage de plusieurs �l�ments du slide
                "move_if_hide"				: false,				// si true, slide seulement si le nouvel �l�ment li est masqu� (ne fonctionne pas avec animation fade et cycle)
                "auto_adjust"               : false,                // si auto ajuste la taille des images de chaque li en fonction du conteneur, si background positionne le conteneur en background en plus
                "class_auto_adjust"	        : false,				// si != false, uniquement redimensionnement des images ayant cette classe (dans le cas d'un fullscreen)
                "touch"						: false,				// si true, activation du swipe sous navigateur tactile
                "content_touch"				: false,				// zone de swipe pour la navigation tactile
                "lightbox"                  : false,                // si true affiche au click sur l'image contenue dans chaque li l'image en lightbox
                "lightbox_click"            : false,                // class du lien pr�sent dans le li premettant l'affichage de la lightbox
                "lightbox_color"            : 'white',              // couleur de fond des lightbox : white ou black
                "callback"          : {								// appel de fonctions sp�cifiques :
                    "img_ready"   	    : false,					// apr�s le chargement des images du slider (en mode cycle)
                    "after_loading"   	: false,					// apr�s le chargement de l'image suivante / avant l'animation
                    "after_resize_ul" 	: false,					// apr�s le recalcul de taille du ul
                    "after_animation"	: false,					// apr�s l'animation
                    "before_animation"	: false						// avant l'animation
                },
                /*DEPRACATED*/
                "fullscreen"				: false,				// auto_adjust = background
                "class_images_fullscreen"   : false                 // class_auto_adjust = class_images_fullscreen
            };

            var options = $.extend(defaults, options);
            options.currentTimer = false;
            options.in_moving = false;
            options.timerOn	= false;

            return this.each(function () {

                /* gestion des deprecated */
                if(options.fullscreen) {
                    options.auto_adjust = 'background';
                }
                if(options.class_images_fullscreen) {
                    options.class_auto_adjust = options.class_images_fullscreen;
                }
                /* ---------------------- */


                // Vars
                var $this     = $(this).data('pixelSlider-options',options);
                var $ul       = $this.find('ul');
                var width_ul  = $ul.width();
                var $slides   = $ul.find('li');

                //evenement sur bouton suivant et precedent
                if(options.next_button.length) {
                    $(options.next_button).click(function(){
                        clearTimeout(options.currentTimer);
                        methods['move_diapo'].call($this);
                    });
                }
                if(options.prev_button.length) {
                    $(options.prev_button).click(function(){
                        clearTimeout(options.currentTimer);
                        methods['move_diapo'].call($this,'left');
                    });
                }

                if(options.hide_arrow) {
                    methods['hide_arrow'].call($this);
                    $(window).load(function () {
                        methods['hide_arrow'].call($this);
                    });
                }
                if (options.move_on_click) {
                    $slides.click(function() {
                        $(this).addClass('next');
                        methods['move_diapo'].call($this);
                    });
                }

                if (options.apply_min_css) {
                    var css_ul = {
                        'margin' : 0,
                        'padding' : 0,
                        'width' : '50000px',
                        'list-style' : 'none',
                        'height' : '100%'
                    };
                    var css_li = {
                        'float' : 'left',
                        'list-style' : 'none',
                        'height' : '100%',
                        'overflow' : 'hidden'
                    };
                    var css_this = {'overflow' : 'hidden'};
                    $this.css(css_this);
                    $ul.css(css_ul);
                    $slides.css(css_li);
                }

                //on active le premier de la liste
                $slides.eq(0).addClass('active');




                if(options.auto_adjust == 'background') {
                    var css_this = {
                        'bottom' : 0,
                        'left' : 0,
                        'overflow' : 'hidden',
                        'position' : 'fixed',
                        'right' : 0,
                        'top' : 0
                    };
                    $this.css(css_this);
                }
                if (typeof(options.css_this) == 'object') $this.css(options.css_this);
                if (typeof(options.css_ul) == 'object') $ul.css(options.css_ul);
                if (typeof(options.css_li) == 'object') $slides.css(options.css_li);
                if (options.numerotation) {
                    var span_curent = $('<span>', {
                        'class' : 'curent_slide',
                        text    : '1'
                    });
                    $(options.numerotation).prepend(span_curent);
                    $(options.numerotation).append(' / '+$slides.length);
                }
                if(options.move_if_hide) {
                    options.cycle = false;
                    options.end_go_to_start = true;
                }
                if(options.cycle && $slides.length > 20) {
                    options.cycle = false;
                }
                if(options.cycle) {
                    if (options.auto_adjust == 'background' || options.animation == 'fade' || options.loading_content) {
                        options.cycle = false;
                        options.end_go_to_start = true;
                    }
                }
                if(typeof options.callback.img_ready == 'function' || options.cycle) {
                    // gestion de l'initialisation du slider (en attendant le chargement de toutes les images avant d'appeler la fonction img_ready
                    // �galement utile pour le mode cycle, permettant de g�n�rer les clones � la fin de l'initialisation du slider
                    (function() {
                        var ready = false;
                        var tab_img_load = new Array();
                        var loadImg = function() {
                            if (tab_img_load.length == $slides.length && !ready) {
                                ready = true; // permet de passer qu'une seule fois dans la g�n�ration des clones
                                if (options.cycle) {
                                    var value_class = '';
                                    // g�n�ration des clones
                                    methods['resizeUl'].call($this);
                                    var ul_width = $ul.width();
                                    $slides.each(function(){
                                        var content_li = $(this).html();
                                        var value_class= $(this).attr('class');
                                        if(value_class == undefined) {
                                            value_class = '';
                                        }
                                        value_class = value_class.replace('active','');
                                        $(this).removeClass('active').addClass('li_prev_clone');
                                        $ul.append('<li class="'+value_class+'">'+content_li+'</li>');
                                    });
                                    var first = true;
                                    $ul.find('li').each(function(){
                                        if(!$(this).hasClass('li_prev_clone')) {
                                            var content_li = $(this).html();
                                            value_class = $(this).attr('class');
                                            if (first) {
                                                $(this).addClass('active');
                                            }
                                            $ul.append('<li class="'+value_class+' li_clone">'+content_li+'</li>');
                                            first = false;
                                        }
                                    });
                                    $ul.width(ul_width * 3).css('margin-left','-'+ul_width+'px');
                                    $slides.eq(0).addClass('first_clone');
                                }
                                methods['lightbox'].call($this);
                                methods['resizeUl'].call($this);
                                // gestion auto_adjust
                                if(options.auto_adjust) {
                                    methods['resize_img_ul'].call($this,$ul.find('li:first'));
                                }
                                var support_touch   = ('ontouchstart' in document.documentElement);
                                if (!support_touch) {
                                    $(window).bind('resize',function() {
                                        methods['reinitialise'].call($this);
                                        methods['resizeUl'].call($this);
                                        if(options.auto_adjust) {
                                            methods['resize_img_ul'].call($this,$ul.find('li:first'));
                                        }
                                        methods['resizeUl'].call($this);
                                    });
                                }
                                if (options.timer > 0) {
                                    options.timerOn = true;
                                    options.currentTimer = setTimeout(function(){
                                        methods['move_diapo'].call($this);
                                    },options.timer);
                                    $this.data('pixelSlider-options',options);
                                }

                                if (typeof options.callback.img_ready == 'function') {
                                    // appel de la fonction apr�s chargement des clones
                                    options.callback.img_ready(true);
                                }
                                return;
                            }
                        }
                        $slides.each(function(_i){
                            var $img = $(this).children('img');
                            if($img.length > 0) {
                                $img.on('load',function(){
                                    tab_img_load[_i] = true;
                                    loadImg();
                                });
                                if($img[0].complete || $img.height() > 0) {
                                    tab_img_load[_i] = true;
                                    loadImg();
                                }
                            }
                            else {
                                tab_img_load[_i] = true;
                                loadImg();
                            }
                        });
                    }());
                }
                else {
                    if (options.loading_content) {
                        if($ul.find('li:first').length > 0) {
                            var $first_img = $ul.find('li:first img');
                            $first_img.css('visibility','hidden').load(function(){
                                //resizeImgBack();
                                $(this).css('opacity',0).css('visibility','visible').animate({'opacity' : 1},300,function(){
                                    if(options.auto_adjust) {
                                        methods['resize_img_ul'].call($this,$ul.find('li:first'));
                                    }
                                });
                            });
                            if($first_img[0].complete || $first_img.height() > 0) {
                                $first_img.trigger("load");
                            }
                        }
                    }
                    methods['lightbox'].call($this);
                    methods['resizeUl'].call($this);
                    // gestion auto_adjust
                    if(options.auto_adjust) {
                        methods['resize_img_ul'].call($this,$ul.find('li:first'));
                    }
                    var support_touch   = ('ontouchstart' in document.documentElement);
                    if (!support_touch) {
                        $(window).bind('resize',function() {
                            methods['reinitialise'].call($this);
                            methods['resizeUl'].call($this);
                            if(options.auto_adjust) {
                                methods['resize_img_ul'].call($this,$ul.find('li:first'));
                            }
                            methods['resizeUl'].call($this);
                        });
                    }
                    if (options.timer > 0) {
                        options.timerOn = true;
                        options.currentTimer = setTimeout(function(){
                            methods['move_diapo'].call($this);
                        },options.timer);
                        $this.data('pixelSlider-options',options);
                    }
                }

                // traitement tactile
                if(options.touch) {
                    var support_touch   = ('ontouchstart' in document.documentElement);
                    // Temps pour calcul de la vitesse
                    var mouseEvents;
                    if ( support_touch ) {
                        if(!options.content_touch) {
                            var $content_touch = $(this);
                        }
                        else if (options.content_touch == 'body' || options.content_touch == 'BODY') {
                            var $content_touch = $(document);
                        }
                        else {
                            $content_touch = $(options.content_touch);
                        }
                        var jquery_version = jQuery(document).jquery;
                        var _tab_split = jquery_version.split('.');
                        if (_tab_split[1] < 7 && _tab_split[0] == 1) {
                            $content_touch.unbind('touchstart').bind('touchstart', on_touch_start);
                        }
                        else {
                            $content_touch.off('touchstart').on('touchstart', on_touch_start);
                        }
                    }
                    var jquery_version = jQuery(document).jquery;
                    var _tab_split = jquery_version.split('.');
                    if (_tab_split[1] < 7 && _tab_split[0] == 1) {
                        var version_1_7_plus = false;
                    }
                    else {
                        var version_1_7_plus = true;
                    }
                }

                var touchStartPos = null;

                function on_touch_start(e) {
                    var touch = e.originalEvent.touches || e.originalEvent.changedTouches;
                    mouseEvents = [{
                        pageX       : touch[0].pageX,
                        timeStamp   : e.timeStamp
                    }];
                    // On ecoute le deplacement/end
                    var jquery_version = jQuery(document).jquery;
                    var _tab_split = jquery_version.split('.');
                    if (!version_1_7_plus) {
                        $(document).bind('touchmove', on_touch_move).bind('touchend', on_touch_end);
                    }
                    else {
                        $(document).on('touchmove', on_touch_move).on('touchend', on_touch_end);
                    }
                    touchStartPos = touch;
                }
                function on_touch_move(e) {
                    var touch = e.originalEvent.touches || e.originalEvent.changedTouches;
                    // On garde ses deux derniers mouvements (position + timestamp)
                    if ( mouseEvents.length < 2 || e.timeStamp - mouseEvents[mouseEvents.length-1].timeStamp > 40 ) {
                        mouseEvents.push({
                            pageX       : touch[0].pageX,
                            timeStamp   : e.timeStamp
                        });
                        if ( mouseEvents.length > 2 ) {
                            mouseEvents.shift();
                        }
                    }
                    var sliding = Math.abs(touch[0].pageX - touchStartPos[0].pageX) > Math.abs(touch[0].pageY - touchStartPos[0].pageY);
                    if(sliding) {
                        e.preventDefault();
                    }
                }
                function on_touch_end(e) {
                    if(!version_1_7_plus) {
                        $(document).unbind('touchmove', on_touch_move).unbind('touchend', on_touch_end);
                    }
                    else {
                        $(document).off('touchmove', on_touch_move).off('touchend', on_touch_end);
                    }
                    var lastE = mouseEvents.shift(),
                        curE  = mouseEvents.shift();
                    if ( !lastE || !curE ) {
                        return;
                    }
                    var d = !e.pageX ? ( curE.pageX - lastE.pageX ) : ( e.pageX - lastE.pageX );

                    if ( Math.abs(d) < 5 ) {
                        return;
                    }
                    if ( d > 0 ) {
                        methods['previous'].call($this); // on va � gauche
                    } else {
                        methods['next'].call($this); // on va � droite
                    }
                }
                /* --- */
            });
        },
        hide_arrow : function() {
            return this.each(function () {
                var options = $(this).data('pixelSlider-options');
                var $this     = $(this);
                var $ul       = $this.find('ul');
                var width_ul  = $ul.width();
                var $slides   = $ul.find('li');

                var _first = false;
                var _last = false;
                var margin_ul = Math.abs(parseInt($ul.css('margin-left')));
                if(margin_ul == 0) {
                    _first = true;
                    if($ul.children('li').length == 1) {
                        _last = true;
                    }
                }
                else {
                    if(options.multiple_elem_visible) {
                        var width_ul = $ul.outerWidth();
                        var width_parent = $ul.parent().width();
                        if((width_ul - margin_ul) <= width_parent) {
                            _last = true;
                        }
                    }
                    else {
                        if($ul.children('li').last().hasClass('active')) {
                            _last = true;
                        }
                    }
                }

                if(_first && _last) {
                    $(options.next_button).css('visibility','hidden');
                    $(options.prev_button).css('visibility','hidden');
                }
                else {
                    if(_last) {
                        if(!options.end_go_to_start) {
                            if($(options.next_button).css('visibility') != 'hidden') {
                                $(options.next_button).animate({'opacity':'0'},300,function(){
                                    $(this).css('visibility','hidden').css('opacity','1');
                                });
                            }
                        }
                    }
                    else {
                        if($(options.next_button).css('visibility') == 'hidden') {
                            $(options.next_button).css('opacity',0).css('visibility','visible').animate({'opacity':'1'},150,function(){
                                $(this).css('opacity','1');
                            });
                        }
                    }
                    if(_first) {
                        if($(options.prev_button).css('visibility') != 'hidden') {
                            $(options.prev_button).animate({'opacity':'0'},300,function(){
                                $(this).css('visibility','hidden').css('opacity','1');
                            });
                        }
                    }
                    else {
                        if($(options.prev_button).css('visibility') == 'hidden') {
                            $(options.prev_button).css('opacity',0).css('visibility','visible').animate({'opacity':'1'},150,function(){
                                $(this).css('opacity','1');
                            });
                        }
                    }
                }
            });
        },
        updateNumerotation : function(curentLi) {
            return this.each(function(){
                var options = $(this).data('pixelSlider-options');
                var $this     = $(this);
                var $ul       = $this.find('ul');
                var $slides   = $ul.find('li');
                var num = curentLi.index()+1
                if(options.cycle) {
                    nb_elem = $slides.length / 3;
                    if (num > nb_elem) {
                        num = num - nb_elem;
                    }
                }
                $(options.numerotation).find('span.curent_slide').text(num);
            });
        },
        chargementImage : function(monLi, action) {
            return this.each(function(){
                var options = $(this).data('pixelSlider-options');
                var $this     = $(this);

                if (options.loader) $(options.loader).fadeIn(100);
                var url_img = monLi.attr('data-src');
                var alt_img =  monLi.attr('data-alt');
                monLi.removeAttr('data-src').removeAttr('data-alt');
                var img = $('<img>', {
                    src : url_img,
                    alt : alt_img
                });
                monLi.prepend(img);
                img.load(function() {
                    if (typeof options.callback.after_loading == 'function') {
                        options.callback.after_loading(true);
                    }
                    if (options.loader) setTimeout("$('"+options.loader+"').fadeOut(50)",200);
                    methods['move_diapo'].call($this,action);
                    return false;
                });
            });
        },
        resizeUl : function(e) {
            return this.each(function() {
                var options = $(this).data('pixelSlider-options');
                var $this     = $(this);
                var $ul       = $this.find('ul');
                var $slides   = $ul.find('li');


                var value_width = 0;
                $slides.each(function(){
                    if ($(this).outerWidth(true) && $(this).width() > 0) {
                        var width = $(this).outerWidth(true);
                    }
                    if(width == 'undefined') {
                        width = 150; //corrige le pb de
                    }
                    value_width += width;
                });
                if(isNaN(value_width) || value_width == 0) {
                    value_width = 50000;
                }
                $ul.css('width',value_width+'px');
                width_ul = $ul.width();
                if (typeof options.callback.after_resize_ul == 'function') {
                    options.callback.after_resize_ul($ul);
                }
            });
        },
        resize_img_ul : function(li_active) {
            return this.each(function() {
                var options = $(this).data('pixelSlider-options');
                var parent_width = 0;
                var parent_height = 0;
                if(options.auto_adjust == 'background') {
                    var window_width = window.innerWidth;
                    if(!window_width) {
                        window_width = $(window).width();
                    }
                    var window_height = window.innerHeight;
                    if(!window_height) {
                        window_height = $(window).height();
                    }
                    parent_width = window_width;
                    parent_height = window_height;

                }
                else {
                    parent_width  = li_active.outerWidth();
                    parent_height = li_active.outerHeight();
                }
                li_active.css('overflow','hidden');

                var img_width = 0;
                var img_height = 0;
                var $this     = $(this);
                var $ul       = $this.find('ul');
                var $slides   = $ul.find('li');
                $slides.each(function(){
                    $(this).css('height',parent_height+'px').css('width',parent_width+'px');
                });
                if((options.class_auto_adjust && li_active.hasClass(options.class_auto_adjust.replace('.',''))) || !options.class_auto_adjust) {
                    $_img = li_active.find('img');
                    $_img.css('width','auto').css('height','auto').css('margin-top',0).css('margin-left',0);
                    img_width = $_img.width();
                    img_height = $_img.height();
                    var rapport_img = img_width/img_height;
                    var rapport_ecran = parent_width/parent_height;
                    if(rapport_img > rapport_ecran) {
                        $_img.css('height',parent_height+'px').css('width','auto');
                        var new_width_img = $_img.width();

                        var margin_left = (new_width_img - parent_width) / 2;
                        $_img.css('margin-left','-'+margin_left+'px');
                    }
                    else {
                        $_img.css('width',parent_width+'px').css('height','auto');
                        var new_height_img = $_img.height();

                        var margin_top = (new_height_img - parent_height) / 2;
                        $_img.css('margin-top','-'+margin_top+'px');
                    }
                }
            });
        },
        lightbox : function() {
            return this.each(function() {

                var options = $(this).data('pixelSlider-options');
                var $this     = $(this);
                var $ul       = $this.find('ul');
                var $slides   = $ul.find('li');
                $('.pix_overlay, .pix_overlay_content, .pix_close_overlay, #pix_zone_overlay').remove();
                if(options.lightbox && options.auto_adjust != 'background' && !options.move_on_click) {
                    $('.pix_overlay, .pix_overlay_content, .pix_close_overlay').remove();
                    var css_zone_overlay = {
                        'height': '100%',
                        'left': '0',
                        'position': 'fixed',
                        'top': '0',
                        'width': '100%',
                        'z-index': '1000'
                    };
                    if(options.lightbox_color == 'black') {
                        var css_overlay = {
                            'background': '#000000',
                            'height': '100%',
                            'left': '0',
                            'opacity': '0.85',
                            'position': 'fixed',
                            'top': '0',
                            'width': '100%'
                        };
                    }
                    else {
                        var css_overlay = {
                            'background': '#FFFFFF',
                            'height': '100%',
                            'left': '0',
                            'opacity': '0.75',
                            'position': 'fixed',
                            'top': '0',
                            'width': '100%'
                        };
                    }
                    var css_overlay_content = {
                        'max-height': '95%',
                        'max-width': '95%',
                        'left': '0',
                        'right': '0',
                        'top': '0',
                        'bottom': '0',
                        'margin': 'auto',
                        'position': 'fixed',
                        'box-shadow' : '0 0 10px rgba(0,0,0,0.5)'
                    };
                    var css_close_overlay = {
                        'background': '#000000',
                        'border-radius': '15px',
                        'color': '#FFFFFF',
                        'font-family': 'arial',
                        'font-size': '15px',
                        'height': '30px',
                        'line-height': '30px',
                        'position': 'fixed',
                        'right': '0px',
                        'text-align': 'center',
                        'top': '0px',
                        'width': '30px',
                        'text-decoration' : 'none'
                    };

                    $('<div id="pix_zone_overlay"></div>').appendTo('BODY').css(css_zone_overlay).hide();
                    $('<div class="pix_overlay"></div>').appendTo('#pix_zone_overlay').css(css_overlay).hide();
                    $('<img class="pix_overlay_content" src="">').appendTo('#pix_zone_overlay').css(css_overlay_content).hide();
                    $('<a href="javascript:;" class="pix_close_overlay">x</a>').appendTo('#pix_zone_overlay').css(css_close_overlay).hide();
                    $slides.each(function(){
                        if($(this).find('img').length > 0) {
                            if(options.lightbox_click) {
                                var $obj_to_click = $(this).find(options.lightbox_click);
                                if($obj_to_click.attr('href') != '' && !$obj_to_click.attr('data-hd')) {
                                    $obj_to_click.attr('data-hd',$obj_to_click.attr('href'));
                                }
                            }
                            else {
                                var $obj_to_click = $(this).find('img');
                            }
                            $obj_to_click.css('cursor','pointer').css('cursor','-moz-zoom-in').css('cursor','-webkit-zoom-in').unbind().click(function() {
                                $obj_to_click.css('cursor','progress').css('cursor','-moz-progress').css('cursor','-moz-progress');
                                if($(this).attr('data-hd')) {
                                    var url = $(this).attr('data-hd');
                                }
                                else {
                                    var url = $(this).attr('src');
                                }
                                if($('.pix_overlay').length == 0) {
                                    $('<div id="pix_zone_overlay"></div>').appendTo('BODY').css(css_zone_overlay).hide();
                                    $('<div class="pix_overlay"></div>').appendTo('#pix_zone_overlay').css(css_overlay).hide();
                                    $('<img class="pix_overlay_content" src="">').appendTo('#pix_zone_overlay').css(css_overlay_content).hide();
                                    $('<a href="javascript:;" class="pix_close_overlay">x</a>').appendTo('#pix_zone_overlay').css(css_close_overlay).hide();
                                }

                                $('.pix_overlay_content').css('visibility','hidden').attr('src',url).css(css_overlay_content).load(function(){
                                    $(this).css('opacity',0).fadeIn().css('visibility','visible').animate({'opacity' : 1},300,function(){
                                        $obj_to_click.css('cursor','pointer').css('cursor','-moz-zoom-in').css('cursor','-webkit-zoom-in')
                                        $('.pix_overlay, #pix_zone_overlay').fadeIn();
                                        var offset_img = $('.pix_overlay_content').offset();
                                        var top_close = offset_img.top - 17 - $(window).scrollTop();
                                        var right_close = offset_img.left - 17;
                                        $('.pix_close_overlay').css('top',top_close+'px').css('right',right_close+'px').fadeIn();
                                    });
                                });
                                if($('.pix_overlay_content')[0].complete || $('.pix_overlay_content').height() > 0) {
                                    $('.pix_overlay_content').trigger("load");
                                }

                                $('.pix_overlay, .pix_close_overlay').click(function() {
                                    $('.pix_overlay, .pix_overlay_content, .pix_close_overlay, #pix_zone_overlay').fadeOut(300,function(){$(this).remove()});
                                });
                                return false;
                            });
                        }
                    });
                }
            });
        },
        move_diapo : function(action) { //Mouvement
            return this.each(function() {
                var options   = $(this).data('pixelSlider-options');
                var $this     = $(this);
                var $ul       = $this.find('ul');
                var width_ul  = $ul.width();
                var $slides   = $ul.find('li');
                if(!action) action  = 'right';
                if(!options.in_moving){
                    methods['resizeUl'].call($this);
                    options.in_moving = true;
                    var action_direction = false;
                    var monLi = $ul.find('li.active');
                    var moving_right = false;
                    var moving_left = false;
                    var nb_li = $slides.length;
                    if(options.cycle) {
                        nb_li = nb_li / 3;
                    }
                    if(parseInt(action)) {
                        if(options.cycle) {
                            if(action == 1) {
                                var nouveauLi = $ul.find('li')[nb_li];
                            }
                            else {
                                var nouveauLi = $ul.find('li')[nb_li + action-1];
                            }
                        }
                        else {
                            var nouveauLi = $ul.find('li')[action-1];
                        }
                        if (action < 1 || action > nb_li) {
                            options.in_moving = false;
                            return false;
                        }
                        nouveauLi = $(nouveauLi);
                        var _i = 0;
                        if(options.cycle) {
                            $ul.find('li').each(function(){
                                if(!$(this).hasClass('li_prev_clone')) {
                                    if($(this).hasClass('active')) {
                                        return false;
                                    }
                                    _i++;
                                }
                            });
                        }
                        else {
                            $ul.find('li').each(function(){
                                if($(this).hasClass('active')) {
                                    return false;
                                }
                                _i++;
                            });
                        }
                        if(monLi.hasClass('li_clone')) {
                            action_direction = 'left';
                        }
                        else if (monLi.hasClass('li_prev_clone')) {
                            action_direction = 'right';
                        }
                        else {
                            if((action-1) < _i) {
                                action_direction = 'left';
                            }
                            else if(((action-1) == _i)) {
                                action_direction = false;
                                options.in_moving = false;
                            }
                            else {
                                action_direction = 'right';
                            }
                        }
                    }
                    else {
                        var nouveauLi = $ul.find('li.next');
                        if (nouveauLi.length == 0) {
                            if (action == 'right') {
                                nouveauLi = monLi.next();
                            } else {
                                nouveauLi = monLi.prev();
                            }
                        }
                    }
                    if (options.loading_content && nouveauLi.attr('data-src') && nouveauLi.attr('data-src').length > 0) {
                        methods['chargementImage'].call($this,nouveauLi, action);
                        options.in_moving = false;
                        return false;
                    }
                    if(action_direction) {
                        action = action_direction;
                    }

                    if (nouveauLi.length == 1) {
                        if (action == 'right') {
                            if (options.multiple_elem_visible) {
                                var margin_ul = Math.abs(parseInt($ul.css('margin-left')));
                                var width_parent = $ul.parent().width();
                                if((width_ul - margin_ul) > width_parent) {
                                    moving_right = true;
                                }
                            } else {
                                moving_right = true;
                            }
                        } else {
                            moving_left = true;
                        }
                        var offset_current = monLi.offset();
                        var offset_next = nouveauLi.offset();

                        /*clic sur le slider en cours */
                        if (nouveauLi.hasClass('active')) {
                            moving_right = false;
                            moving_left = false;
                        }
                    } else {
                        moving_right = false;
                        moving_left = false;
                    }

                    if (moving_right || moving_left) {
                        if (typeof options.callback.before_animation == 'function') {
                            options.callback.before_animation();
                        }
                        if (options.auto_adjust) {
                            methods['resize_img_ul'].call($this,nouveauLi);
                        }
                    }
                    if (moving_right || moving_left) { monLi.removeClass('active'); nouveauLi.addClass('active'); }

                    var taille_decalage = 0;

                    if(action == 'right'){
                        if(moving_right){
                            taille_decalage = Math.abs(offset_next.left - offset_current.left);
                            if(options.animation == 'fade') {
                                if(!options.current_z_index) {
                                    recursive_z_index(monLi,options);
                                    options.current_z_index = options.return_recursive_z_index;
                                }
                                if(!options.current_z_index) {
									options.current_z_index = 0;
								}
                                
                                var old_z_index = nouveauLi.css('z-index') ? nouveauLi.css('z-index') : '0';
                                monLi.css('position','relative').css('z-index',options.current_z_index + 1);
                                nouveauLi.css('position','relative').css('z-index',(options.current_z_index - 1)).css('margin-left','-'+(taille_decalage)+'px');
                                var old_opacity = monLi.css('opacity');
                                monLi.animate(
                                    {opacity : '0'},
                                    options.speed,
                                    function() {
                                        nouveauLi.css('margin-left','auto').css('z-index',old_z_index);
                                        $ul.animate({marginLeft : '-='+taille_decalage},0);
                                        monLi.css('opacity',old_opacity).css('z-index','auto');
                                        callback_animation ($this,nouveauLi,'next');
                                    }
                                );
                            }
                            else {
                                if(options.move_if_hide) {
                                    var margin_ul = Math.abs(parseInt($ul.css('margin-left').replace('px',''))),
                                        position_nouveauLi = nouveauLi.offset(),
                                        position_this = $this.offset(),
                                        nouveauLi_width = nouveauLi.outerWidth(true),
                                        position_right_nouveau = position_nouveauLi.left - position_this.left + nouveauLi_width;
                                    if((position_right_nouveau - margin_ul) > $this.width()) {
                                        taille_decalage = nouveauLi_width;
                                    }
                                    else {
                                        taille_decalage = 0;
                                    }
                                }
                                $ul.animate(
                                    {marginLeft : '-='+taille_decalage},
                                    options.speed, options.easing,
                                    function(){
                                        callback_animation ($this,nouveauLi,'next');
                                    }
                                );
                            }
                        }
                        else {
                            if(options.end_go_to_start && $slides.length > 1){
                                taille_decalage = monLi.outerWidth();
                                var first_li = $ul.find('li:first');
                                var li_first = first_li.html(),
                                    width_li = first_li.outerWidth(),
                                    height_li = first_li.outerHeight();
                                var $new_li = $('<li/>').css({width:width_li, height:height_li,overflow:'hidden'}).html(li_first);
                                $ul.append($new_li);
                                methods['resizeUl'].call($this);
                                nouveauLi = first_li;
                                if(options.animation == 'fade') {
                                    if(!options.current_z_index) {
										recursive_z_index(monLi,options);
										options.current_z_index = options.return_recursive_z_index;
									}
									if(!options.current_z_index) {
										options.current_z_index = 0;
									}
                                    var old_z_index = $ul.find('li:first').css('z-index') ? $ul.find('li:first').css('z-index') : '0';
                                    monLi.css('position','relative').css('z-index',options.current_z_index + 1);
                                    $ul.find('li:last').css('position','relative').css('z-index',(options.current_z_index - 1)).css('margin-left','-'+(monLi.outerWidth())+'px');
                                    var old_opacity = monLi.css('opacity');
                                    monLi.animate(
                                        {opacity : '0'},
                                        options.speed,
                                        function() {
                                            $ul.css('margin-left','0px');
                                            $ul.find('li:last').css('margin-left','auto').css('z-index',old_z_index);
                                            monLi.css('opacity',old_opacity).css('z-index','auto');
                                            $ul.width(width_ul);
                                            $ul.find('li:last').remove();
                                            $slides.eq(0).addClass('active');
                                            monLi.removeClass('active');
                                            callback_animation($this,nouveauLi,'next');
                                        }
                                    );
                                }
                                else {
                                    $ul.animate(
                                        {marginLeft : '-='+taille_decalage},
                                        options.speed, options.easing,
                                        function(){
                                            $(this).css('margin-left','0px');
                                            $ul.width(width_ul);
                                            $ul.find('li:last').remove();
                                            $slides.eq(0).addClass('active');
                                            monLi.removeClass('active');

                                            callback_animation($this,nouveauLi,'next');
                                        }
                                    );
                                }
                            }
                            else {
                                options.in_moving = false;
                            }
                        }
                    }
                    if(action == 'left'){
                        if(moving_left){
                            taille_decalage = Math.abs(offset_current.left - offset_next.left);
                            if(options.animation == 'fade') {
                                if(!options.current_z_index) {
                                    recursive_z_index(monLi,options);
                                    options.current_z_index = options.return_recursive_z_index;
                                }
                                if(!options.current_z_index) {
									options.current_z_index = 0;
								}
                                monLi.css('position','relative').css('margin-left','-'+(taille_decalage)+'px');
                                $ul.animate({marginLeft : '+='+taille_decalage},0);
                                var old_opacity = monLi.css('opacity');
                                monLi.animate(
                                    {opacity : '0'},
                                    options.speed,
                                    function() {
                                        monLi.css('margin-left','auto').css('opacity',old_opacity);
                                        callback_animation($this,nouveauLi,'next');
                                    }
                                );
                            }
                            else {
                                if(options.move_if_hide) {
                                    /*var nb_elem_avant_slide = Math.ceil(options.nb_elem_visibles / 2),
                                     num_slide = parseInt(monLi.attr('data-num'));
                                     if(options.nb_elem_visibles%2 == 0) {
                                     nb_elem_avant_slide++;
                                     }*/
                                    var margin_ul = Math.abs(parseInt($ul.css('margin-left').replace('px',''))),
                                        position_nouveauLi = nouveauLi.offset(),
                                        position_this = $this.offset(),
                                        nouveauLi_width = nouveauLi.outerWidth(true),
                                        position_left_nouveau = position_nouveauLi.left - position_this.left;
                                    if(position_left_nouveau < 0) {
                                        taille_decalage = nouveauLi_width;
                                    }
                                    else {
                                        taille_decalage = 0;
                                    }
                                }
                                $ul.animate(
                                    {marginLeft : '+='+taille_decalage},
                                    options.speed, options.easing,
                                    function(){
                                        callback_animation($this,nouveauLi,'previous');
                                    }
                                );
                            }
                        }
                        else {
                            options.in_moving = false;
                        }
                    }
                }
                $slides.removeClass('next');
                
                
            });
            function callback_animation ($this,nouveauLi,type) {
                var options   = $this.data('pixelSlider-options');
                if(nouveauLi.hasClass('li_clone')) {
                    options.in_moving = false;
                    methods['reinitialise'].call($this);
                    $this.data('pixelSlider-options',options);
                    //methods['move_diapo'].call($(this));
                    return true;
                }
                else if(nouveauLi.hasClass('first_clone')) {
                    options.in_moving = false;
                    methods['reinitialise'].call($this);
                    $this.data('pixelSlider-options',options);
                }

                var options   = $this.data('pixelSlider-options');
                options.in_moving = false;
                if (options.numerotation) methods['updateNumerotation'].call($this,nouveauLi);
                if (options.lightbox) methods['lightbox'].call($this);
                if (typeof options.callback.after_animation == 'function') {
                    options.callback.after_animation(nouveauLi);
                }
                if (options.hide_arrow) methods['hide_arrow'].call($this);
                if(type == 'next') {
                    if (options.timer > 0 && options.timerOn) {
                        options.currentTimer = setTimeout(function(){methods['move_diapo'].call($this);},options.timer);
                        $this.data('pixelSlider-options',options);
                    }
                }
            }
            
            function recursive_z_index($elem,options) {
				if($elem.get(0).nodeName == 'BODY' && $elem.css('z-index') == 'auto') {
					options.return_recursive_z_index = 0;
					return '0';
				}
				else if ($elem.css('z-index') != 'auto') {
					options.return_recursive_z_index = parseInt($elem.css('z-index'));
					return parseInt($elem.css('z-index'));
				}
				else {
					recursive_z_index($elem.parent(),options);
				}
			}
        },
        next : function(e) {
            return this.each(function() {
                var options   = $(this).data('pixelSlider-options');
                if(options) {
                    clearTimeout(options.currentTimer);
                    methods['move_diapo'].call($(this));
                }
            });
        },
        previous : function(e) {
            return this.each(function() {
                var options   = $(this).data('pixelSlider-options');
                if(options) {
                    clearTimeout(options.currentTimer);
                    methods['move_diapo'].call($(this),'left');
                }
            });
        },
        goTo : function(e) {
            return this.each(function() {
                var options   = $(this).data('pixelSlider-options');
                if(options && parseInt(e) && !options.in_moving) {
                    methods['move_diapo'].call($(this),e);
                }
            });
        },
        speed : function(e) {
            return this.each(function() {
                var options   = $(this).data('pixelSlider-options');
                if(options && (parseInt(e) || !e)) {
                    options.speed = e;
                    $(this).data('pixelSlider-options',options);
                }
            });
        },
        reinitialise : function(e) {
            return this.each(function() {
                var options   = $(this).data('pixelSlider-options');
                if(options) {
                    var $this = $(this),
                        $ul = $this.children('ul');
                    var _speed = options.speed;
                    clearTimeout(options.currentTimer);
                    options.speed = 0;
                    methods['move_diapo'].call($(this),1);
                    if(options.auto_adjust) {
                        methods['resize_img_ul'].call($this,$ul.find('li:first'));
                    }
                    options.speed = _speed;
                    if (options.timer > 0) {
                        options.timerOn = true;
                        options.currentTimer = setTimeout(function(){methods['move_diapo'].call($this);},options.timer);
                    }
                    $(this).data('pixelSlider-options',options);
                }
            });
        },
        pause : function(e) {
            return this.each(function() {
                var options   = $(this).data('pixelSlider-options');
                if(options) {
                    clearTimeout(options.currentTimer);
                    options.timerOn = false;
                }
            });
        },
        stop : function(e) {
            return this.each(function() {
                var options   = $(this).data('pixelSlider-options');
                if(options) {
                    clearTimeout(options.currentTimer);
                    options.timer = 0;
                    options.timerOn = false;
                    $(this).data('pixelSlider-options',options);
                }
            });
        },
        resume : function(e) {
            return this.each(function() {
                var options   = $(this).data('pixelSlider-options');
                if(options) {
                    var $this = $(this);
                    clearTimeout(options.currentTimer);
                    if (options.timer > 0) {
                        options.timerOn = true;
                        options.currentTimer = setTimeout(function(){methods['move_diapo'].call($this);},options.timer);
                        $(this).data('pixelSlider-options',options);
                    }
                }
            });
        }
    };

    $.fn.pixelslider = function( method ) {
        // Methode protegee ?
        var _protected = [ 'move_diapo', 'hide_arow', 'resizeUl', 'chargementImage','updateNumerotation'];
        var is_protected = false;
        for (i = 0; i < _protected.length; i++) {
            if (method == _protected[i]) {
                is_protected = true;
                break;
            }
        }
        // Methode specifique
        if ( methods[method]) {
            return methods[ method ].apply( this, Array.prototype.slice.call( arguments, 1 ));
        }
        // Methode par defaut
        else if ( typeof method === 'object' || ! method ) {
            return methods.init.apply( this, arguments );
        }
        else {
            // Methode inexistante
        }
    };

})(jQuery);
