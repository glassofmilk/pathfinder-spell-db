
jQuery.fn.toggle_fieldset = function() {
	var fieldset = $(this);
	if (fieldset.prop('tagName').toLowerCase() != 'fieldset') {
		fieldset = fieldset.closest('fieldset');
	}
	
	var content = fieldset.children('.content');
	
	content.toggle();
	fieldset.toggleClass('open');
	fieldset.toggleClass('closed');
}

$(document).ready(function() {
	$('select[name=class]').change(class_change);
	$('select[name=level]').change(level_change);
	$('fieldset legend').click($(this).toggle_fieldset);
	
	$('form').submit(handle_submit);
	$('button[name=select_all]').click(select_all);
	$('button[name=unselect_all]').click(unselect_all);
	
	$('fieldset.closed .content').hide();
	
	load_spells();
});

function select_all() {
	var checkboxes = $(this).closest('fieldset').find('input[type="checkbox"]');
	checkboxes.prop('checked', true);
}

function unselect_all() {
	var checkboxes = $(this).closest('fieldset').find('input[type="checkbox"]');
	checkboxes.prop('checked', false);
}

function handle_desc_click() {
	var desc = $(this);
	desc.toggleClass('closed');
	
	var row = desc.closest('tr');
	var id = row.attr('data-spell_id');

	var full_desc = row.next().find('.description.full')
	full_desc.toggleClass('closed');
	
	if (! full_desc.hasClass('loaded')) {
		$.ajax({
			url: 'spell_db/get_spell',
			dataType: 'html',
			type: 'post',
			data: 'spell_id='+id,
			success: function(response) {
				full_desc.html(response);
				full_desc.addClass('loaded');
			}
		});
	}
}

function handle_submit(e) {
	e.preventDefault();
	
	var form = $(this);
	form.children('fieldset').toggle_fieldset();
	
	var options = form.serialize();	
	send_update_request(this.action, options);
}

function class_change() {
	var class_id = $('select[name=class]').val();
	
	$.ajax({
	  url: 'spell_db/get_levels',
	  dataType: 'json',
	  type: 'post',
	  data: 'class=' + class_id,
	  success: function(response) {
			var levels = $('select[name=level]').empty();
			
			$.each(response, function(i, value) {
				levels.append($("<option />").val(value).text(value));
			});
			
			load_spells();
		}
	});
}

function level_change() {
	var level = $('select[name=level]').val();
	send_update_request('spell_db/set_level', 'level=' + level);	
}

function load_spells() {
	send_update_request('spell_db/get_spells');
}

function send_update_request(url, data) {
	setSpinner(true);
	
	$.ajax({
		  url: url,
		  dataType: 'html',
		  type: 'post',
		  data: data? data : '',
		  success: function(response) {
				
			$('#spells').html(response);
				
				setSpinner(false);
				
				$('.description.button').click(handle_desc_click);
				
				$('.description.all').click(desc_click_all);
			}
	});
}

function desc_click_all() {
	obj = $(this);
		
	if (obj.hasClass('closed')) {
		$('.description.full').removeClass('closed');
	}
	else {
		$('.description.full').addClass('closed');
	}
	
	obj.toggleClass('closed');
}

function setSpinner(value) {
	if (value) {
		$('#spell_table').addClass('spinner');
	}
	else {
		$('#spell_table').removeClass('spinner');
	}
}