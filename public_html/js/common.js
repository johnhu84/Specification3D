// JavaScript Document

$(function(){
	//导航效果
	$(".nav_list"). mouseenter(function(){
		$(this).find(".sub_nav").slideDown(50);
		$(this).find(".nav_font").addClass("nav_xg");
	}).mouseleave(function(){
		$(this).find(".sub_nav").slideUp(50);
		$(this).find(".nav_font").removeClass("nav_xg");
	});
	//右侧浮动
	$(".left_conbox"). mouseenter(function(){
		$(this).find(".left_clickconbar").slideDown(50);
		$(this).find(".left_conicon").addClass("left_coniconhover");
	}).mouseleave(function(){
		$(this).find(".left_clickconbar").slideUp(50);
		$(this).find(".left_conicon").removeClass("left_coniconhover");
	});
});