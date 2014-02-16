angular.module('cgminerConfigUI',[]).controller('cgminerConfigCtrl', function ($scope, $window) {
	document.addEventListener('dragover', function (evt) {
		evt.stopPropagation();
		evt.preventDefault();
	}, false);

	document.addEventListener('drop', function (evt) {
		evt.stopPropagation();
		evt.preventDefault();

		var reader = new FileReader();

		reader.onloadend = function(evt) {
			if (evt.target.readyState == FileReader.DONE) {
				$scope.cgminerConfig = JSON.parse(evt.target.result);
				$scope.gpus = $scope.cgminerConfig['intensity'].match(/,/)
						.length + 1;
				$scope.prePopulated = true;
				$scope.$apply();
			}
		};
		reader.readAsBinaryString(evt.dataTransfer.files[0]);
	}, false);

	$scope.cgminerConfig = { pools: [] };
	$scope.gpus = 1;

	($scope.addPool = function() {
		var pools = $scope.cgminerConfig.pools;

		$scope.cgminerConfig.pools = [];
		for (var i = 0; i < pools.length; i++) {
			if (pools[i].url && pools[i].url != "") {
				$scope.cgminerConfig.pools.push(pools[i]);
			}
		}
		$scope.cgminerConfig.pools.push({
			'url' : '', 'user' : '', 'pass' : ''
		});
	})();

	($scope.gpusChanged = function() {
		function adjust(setting) {
			var value = $scope.cgminerConfig[setting];
			var gpus = $scope.gpus;
			var result = ("" + $scope.cgminerConfig[setting]).split(",");

			if (result.length > gpus) {
				result = result.slice(0, gpus);
			} else {
				for (var i = 0; i < gpus - result.length; i++) {
					result.push(result[result.length - 1]);
				}
			}
			$scope.cgminerConfig[setting] = result.join(',');
		}
		for (var setting in $scope.cgminerConfig) {
			if ('auto-fan' != setting && 'auto-gpu' != setting
					&& 'pools' != setting && 'scrypt' != setting) {
				adjust(setting);
			}
		}
	})();

	$scope.save = function() {
		var a = document.createElement("a");
		a.download = "cgminer.conf";
		a.href = URL.createObjectURL(new Blob(
			[JSON.stringify($scope.cgminerConfig, null, "	")],
			{ name: "cgminer.conf", type: "application/json" }
		));
		a.style = "display:none";
		document.body.appendChild(a);
		a.click();
		URL.revokeObjectURL(a.href);
		a.remove();
	}
});