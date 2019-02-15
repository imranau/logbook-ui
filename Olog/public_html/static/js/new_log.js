/*
 * Script specific to edit_log.html
 *
 * @author: Dejan Dežman <dejan.dezman@cosylab.com>
 */

$(document).ready(function(){

	// Activate resize manager
	resizeManager();


    var timenow = new Date(Date.now() - 20000);

    // Set datepickers
    $('#startdate_input').datetimepicker(
        {
            changeMonth: true,
            changeYear: true,
            dateFormat: "D, d M yy",
            timeFormat: "HH:mm:ss",
            maxDateTime: timenow,
            firstDay: datePickerFirstName
        }
    );

	// Wait for dataload
	$('#load_tags_m').on('dataloaded', function(e){
		autocompleteTags(savedTags);
	});

	// Load Tags
	loadTags("load_tags_m", true, false, true);

	// Wait for dataselected
	$('#load_tags_m').on('dataselected', function(e, data){

		$("#tags_input").tagsManager('empty');

		$.each(data['list2'], function(i, element){
			$("#tags_input").tagsManager('pushTag',element);
		});
	});

	// Wait for dataload
	$('#load_logbooks_m').on('dataloaded', function(e){
		autocompleteLogbooks(savedLogbooks);
	});

	// Load Logbooks
	loadLogbooks("load_logbooks_m", true, false, true);

	// Wait for dataselected
	$('#load_logbooks_m').on('dataselected', function(e, data){

		$("#logbooks_input").tagsManager('empty');

		$.each(data['list'], function(i, element){
			$("#logbooks_input").tagsManager('pushTag',element);
		});
	});

	// Listen for new Log form submit
	var submitting = false;

	$('#createForm').on('submit', function(e){
		e.preventDefault();

		if(submitting === true) {
			return;
		}

		submitting = true;

		var log = generateLogObject();
		l("submit log");

		if(isValidLog(log) === true) {
			// Create properties
			if(log[0].properties.length !== 0) {
				createProperty(log[0].properties);
			}
            var uploadDataCKE = [];

			if (log[0].description.includes("#!#!#!#")) {
				temp_desc = log[0].description;
				log[0].description = " ";
				var newLogId = createLog(log);
				l(newLogId);
				log[0].id=newLogId;

				for(var i=0; i<permUploadDataCKE.length; i++){
                		    var data = permUploadDataCKE[i];
                	            if(data !== null) {
                                        var file = data.files[0];
                                        if (temp_desc.includes("#!#!#!#"+file.name)) 
					    uploadDataCKE.push(data);
                                    }
                                }
				log[0].description = replaceAll(temp_desc, "#!#!#!#", serviceurl+"attachments/"+newLogId+"/");
				modifyLog(log);
			}
			else {
				var newLogId = createLog(log);
				l(newLogId);
				log[0].id=newLogId;
			}

			if(newLogId !== null) {
				$('#files div').addClass('upload-progress');
				$('#files div p button').remove();
				$('#files div button').remove();
				$('.upload-progress-loader').show();
				setTimeout(function(){
					uploadFiles(newLogId, uploadData, "#fileupload");
					//uploadFiles(newLogId, permUploadDataCKE, "#fileupload");
					uploadPastedFiles(newLogId, firefoxPastedData);
					uploadFiles(newLogId, uploadDataCKE, "#fileupload");
				
					window.location.href = firstPageName;
				}, 500);
			}

		} else {
			submitting = false;
		}
	});

	// Load levels
	var template = getTemplate('template_level_input');
	$('#level_input').html("");

	$.each(levels, function(index, name) {
		var html = Mustache.to_html(template, {"name": name, "selected":""});
		$('#level_input').append(html);
	});

	// Initialize common Log functionality
	initialize(null);

//    createMarkdownTextarea("log_body");

    // Upload
	upload('fileupload');

	// Start listening for Firefox paste events
	startListeningForPasteEvents("#files");

	// Add new propery table
	$('#add_a_property').click(function(e){
		var template = getTemplate("template_add_log_property");
		var html = Mustache.to_html(template);
		$('#add_a_property').before(html);

		// Start listening for Remove Property icon clicks
		startListeningForRemovePropertyClicks();

		// Add a key - value pair to property
		$('.add_a_key_value_pair').unbind('click');
		$('.add_a_key_value_pair').click(function(e){
			var dockingTr = $(e.target).parent().parent();
			var template = getTemplate("template_add_key_value_pair_to_property");
			var html = Mustache.to_html(template);
			dockingTr.before(html);
		});
	});

	// Focus the textarea when starting to add new log entry
	$('#log_body').focus();

    setMultilstCollapseEvent();

    // Initialize tooltip
    $('#tooltip').tooltip({placement: "bottom"});
    setMarkdownTooltips();

});

/**
 * Remove property from new Log entry
 */
function startListeningForRemovePropertyClicks() {
	// Remove property table
	$('.remove_property').unbind('div');
	$('.remove_property').click(function(e){
		l($(e.target).parents('div'));
		$($(e.target).parents('div')[0]).remove();
	});
}
/*
// Use image and overgive image src to ckeditor
function useImage(imgSrc, uploadData) {
    var funcNum = '1';
    var imgSrc = imgSrc;
    var fileUrl = imgSrc;
    CKEDITOR.tools.callFunction( funcNum, fileUrl );
    appendCKEImages(uploadData);
}

function selected() {
    var x = document.getElementById("fileupload);
    if ('files' in x) {
        if (x.files.length == 0) {
            console.log("Select one or more files.");
        } else {
                if ( x.files.length >1) {
                    alert("select single file only");
                }
                else {
                file=x.files[0];
                console.log(file.name);
                setTimeout(function(){
                    useImage("#!#!#!#"+file.name, uploadData);
                }, 300);
            }
         }
    }
    else {
        if (x.value == "") {
            console.log("Select one or more files.");
        } else {
            alert("The files property is not supported by your browser!");
        }
    }
}

function openFileBrowser() {
	l("in openFileBrowser");
	$('#fileupload2').trigger('click');
}
*/
