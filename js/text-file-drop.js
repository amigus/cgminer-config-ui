function TextFileDrop(callback, document) {
	function preventAndStop(evt) {
		evt.stopPropagation();
		evt.preventDefault();
	}

	document.addEventListener('dragenter', preventAndStop, false);
	document.addEventListener('dragover', preventAndStop, false);
	document.addEventListener('drop', function (evt) {
		preventAndStop(evt);

		var reader = new FileReader(), file = evt.dataTransfer.files[0];

		reader.onloadend = function(nestedEvt) {
			if (nestedEvt.target.readyState == FileReader.DONE) {
				callback(nestedEvt.target.result, file.name);
			}
		}
		reader.readAsText(file);
	}, false);
}
