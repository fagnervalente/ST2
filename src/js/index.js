$(function(){

	LoadVideos();
	
	$('.wrap-modal').on('click', function(event){
		if ( event.target.id == 'wrap-modal-video' || event.target.className == 'row' )
			Modal.close();
	});

	$('.wrap-modal .wrap-video .btn-close-bar').on('click', function(event){
		event.preventDefault();
		Modal.close();
	});

	$('#sec-videos').on('click', '.thumbnail-done, .new', function(event){
		event.preventDefault();

		$('#wrap-modal-video').find('video').attr('src', $(this).attr('href'));

		$('#wrap-modal-video').find('video-title').text($(this).attr('data-title') );

		$('#wrap-modal-video').css({ 
			'display': 'block',
			'opacity': 1
		});

		setTimeout(function(){
			$('#wrap-modal-video').find('video').trigger('play');
		},500);
	});

	$('.thumbnail.new-file input[name="myFile"]')
	.on('dragenter', 	function(e){ $(this).closest('.thumbnail').addClass('dragenter'); })
	.on('dragleave', 	function(e){ $(this).closest('.thumbnail').removeClass('dragenter'); });
	

	$('#myFile').on('change', function(){
		$(this).closest('form').submit();
	});


	$('form').on('submit', function(event) {
    	event.preventDefault();

    	NewFile.setLoading();

	    var formData = new FormData();

	    var file = document.getElementById('myFile').files[0];

	    formData.append('myFile', file);
	    
	    var xhr = new XMLHttpRequest();
	    
	    xhr.open('post', '/', true);
	    
	    xhr.upload.onprogress = function(e) {

	      if (e.lengthComputable) {

	        var percent = (e.loaded / e.total) * 100;
	        percent.toFixed(2);
	        
	        NewFile.setLoadingPercent(percent+'%');

	        if ( percent >= 100 )
	        {
	          NewFile.setLoadingPercent('Salvando...');
	        }
	      }
	    };
    
	    xhr.onerror = function(e) {

			console.log(e);

	  		NewFile.setError();

	      	console.log('Ocorreu um erro durante o envio do arquivo. Talvez a conexão tenha sido interrompida.');
	    };
    
	    xhr.onload = function() {
	      //showInfo(this.statusText);
	      ProcessEncode();
	    };
    
    	xhr.send(formData);
    
  	});

	
});

Modal = {};
Modal.self = $('#wrap-modal-video');

Modal.video = Modal.self.find('video');
Modal.close = function(){
		
	Modal.self.css('opacity', 0);

	Modal.self.find('video').trigger('pause');

	setTimeout(function(){
		Modal.self.css('display', 'none');
	},500);
}

Modal.open = function(){

	Modal.self.css({ 
		display: 'block',
		opacity: 1
	});

	Modal.video.trigger('play');
}

Modal.setVideo = function(url_video, title_video){
	Modal.self.find('.video-title').text(title_video);
	Modal.video.attr('src', url_video);
}

var $newFile = $('#new-file');

var NewFile = {};

NewFile.setNewFile = function(){

	$newFile
		.removeClass()
  		.addClass('thumbnail new-file')
  		.empty()
  		.html('<span class="glyphicon glyphicon-cloud-upload"></span>
                <strong>Upload new file</strong>
                <span>Drap & Drop a file here.</span>
				
				<form action="">
                	<input type="file" name="video" >
                </form>');
}
NewFile.setError = function(){
	$newFile
		.removeClass('loading dragenter')
  		.addClass('error')
  		.empty()
  		.html('<img src="../images/bad.png" alt="">
           		<strong>Sorry, something is wrong</strong>');
}
NewFile.setLoading = function(){
	$newFile
		.removeClass('new-file')
		.addClass('loading')
		.empty()
		.html('<span>Your media is transfering.</span>
                    <img src="../images/loading.gif" class="loading" />
                    <span class="percent">Aguardando...</span>');
}

NewFile.setLoadingPercent = function(message)
{
	$newFile.find('percent').text(message);
}

NewFile.setSuccess = function(url_video, url_thumbnail, nome){

	var $wrapper_first = $newFile.closest('.div');

	var $novo_video = $('<div class="col-lg-2 col-md-4 col-xs-6 thumb">
	                <a class="thumbnail success" href="'+url_video+'">
		                <div class="overlay-sucess">
	                		<strong>Upload Completed</strong>
	                		<span>Edit Informations</span>
	                	</div>
	                    
	                </a>
	                <span class="title-video">'+nome+'</span>
                </div>');

	$novo_video.insertAfter($('#new-file').closest('div'));

	$img = $('<img src="'+url_thumbnail+'" alt="">');

    $img.on('load', function(){
    	$novo_video.find('a.thumbnail').append($(this));
    });

    setTimeout(function(){
    	
    	NewFile.setNew($novo_video.find('a.thumbnail'));
    	
    },2000);

   
}

NewFile.setNew = function($target){
	$target
		.removeClass('success')
  		.addClass('new')
  		.find('.overlay-sucess').css('opacity', 0);

  	setTimeout(function(){
  		$target.find('.overlay-sucess').remove();
  	},500);
}

function ProcessEncode()
{
	var countRequest = 0;

  	$('#new-file .percent').text('Aguardando ...');

  	var intervalZStatus = setInterval(function(){
		$.ajax({
      		url: '/zstatus',
      		type: 'GET',
      		dataType: 'JSON',
      		success: function(data){

				countRequest++;

        		if (!data.error)
        		{
          			console.log(data.nome + ' | ' + data.percent);

  					if ( data.nome != '' || data.percent > 0 )
	          		{
	            		$('#new-file .percent').text(data.percent+'%');
	          		}

	          		if ( data.percent == 100 )
	      			{
	            		clearInterval(intervalZStatus);
	            		console.log(data);

	            		NewFile.setNewFile();

	            		NewFile.setSuccess(data.url, data.url.split('.mp4')[0]+'.png', data.filename);
	          		}
    			}else{

					console.log('Ocorreu um erro');
					NewFile.setError();
					clearInterval(intervalZStatus);
        		}

        		if ( countRequest >= 2000 )
        		{
          			if ( confirm('O zencoder está demorando tempo demais para converter o arquivo... Deseja cancelar a ação?') )
          			{
          				NewFile.setError();
            			clearInterval(intervalZStatus);
          			}
        		}
		},
		error: function(){
	    	NewFile.setError();
	        clearInterval(intervalZStatus);    
      	}
    });

  }, 2000);
}

function LoadVideos(){

	var index_param = NaN;
	var array_url = document.URL.split('/videos/');

	if ( array_url.length == 2 )
		index_param = parseInt(array_url[1]);

	$.ajax({
		url: '/listavideos',
		dataType: 'JSON',
		success: function(data){

			var index_video = 0;

			for (var i = 0; i < data.Contents.length; i++) {

				var thumb = '';
				var next = false;

				if ( data.Contents[i].Key.split('.mp4')[0] == data.Contents[i + 1].Key.split('.png')[0] )
				{
					thumb = data.Contents[i + 1].Key
					next = true;
				}

				var filename = data.Contents[i].Key.split('.mp4')[0].split('zen-')[1];

				var html = '<div class="col-lg-2 col-md-4 col-xs-6 thumb">
	                <a class="thumbnail thumbnail-done" href="https://s3.amazonaws.com/upload.sambatech/'+data.Contents[i].Key+'" data-title="'+filename+'">
	                    <img src="https://s3.amazonaws.com/upload.sambatech/'+thumb+'" alt="">
	                </a>
	                <span class="title-video">'+filename+'</span>
                </div>';

                if ( index_video == index_param )
                {
                	Modal.setVideo('https://s3.amazonaws.com/upload.sambatech/'+data.Contents[i].Key, filename);
                	Modal.open();
                }

                if (next){
                	i++;
                }

                index_video++;

                $('#sec-videos .row').append(html);
				
			};
		}
	})

}