		function guardar(miLista){
			localStorage.setItem("config",JSON.stringify(miLista));
		}
		function leer(){
			var jsonlist=localStorage.getItem("config");
			return JSON.parse(jsonlist);
		}
		function eliminar(){
			localStorage.clear();
		}