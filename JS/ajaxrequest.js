function insertarJugador(){
    if(localStorage.length>0){
        let playerConfig={
            typeOfPlayer: localStorage.getItem('typeOfPlayer'), //niño o monstruo
            gameScene: localStorage.getItem('gameScene'), //escenario 1, 2 o 3
            gameMode: localStorage.getItem('gameMode'), // single or multiplayer
            nameofPlayer1: "dummy1",
            nameofPlayer2: "dummy2",
            gameDifficulty:1,
        }
        var formData = new FormData();
        formData.append('username',playerConfig.nameofPlayer1);
        formData.append('typePlayer',playerConfig.typeOfPlayer);
        formData.append('scene',playerConfig.gameScene);
        formData.append('gameMode',playerConfig.gameMode);
        formData.append('gameDifficulty',playerConfig.gameDifficulty);
        formData.append('username2',playerConfig.nameofPlayer2);
        //const dataString= JSON.stringify(data);
        $.ajax({
            url     : "./php/service_include.php",
            method  : "POST",
            data    : formData,
            contentType:false,
            cache:false,
            processData: false
        }).done(function (data, textEstado, jqXHR){
           if(data.result!=0){
               return data.result;
           }else{
               return -1;
           }
        }).fail(function (data, textEstado, jqXHR){
            alert("la solicitud fallos porque: " + textEstado);
            console.log("la solicitud fallos porque: " + textEstado);
            return-1;
        });
    }else{
        return-1;
    }
    
}