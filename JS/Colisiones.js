import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.117.1/build/three.module.js'
var pos_a=1;
var pos_b=1;
var pos_c=1;
var pos_d=1;


var pos1_a=1;
var pos1_b=1;
var pos1_c=1;
var pos1_d=1;
var pos1_e=1;
var pos1_f=1;
var pos1_g=1;

var vel=.08;		    
var VelGiro=.003
function killPlayer(player){
	
    player.death=true; //a lo mejor esta condicion es para ejecutar el killplayer
    player.mixer.stopAllAction();
    player.actions.death.play();
}
function singleLevel1Colision(deltatime,Vcolision,scene,player,Jugadornum,typep)
{
 
        const P1 =scene.getObjectByName('Jugador');
        const P2 =scene.getObjectByName('Jugador1');
        const P3 =scene.getObjectByName('Jugador2');



        const E1 =scene.getObjectByName('C1');
        const E2 =scene.getObjectByName('C2');
        const E3 =scene.getObjectByName('C3');
        const E4 =scene.getObjectByName('C4');
        const CO1 = scene.getObjectByName('Muro1');
        const CO2 = scene.getObjectByName('Muro2');
        const CO3 = scene.getObjectByName('Muro3');
        const CO4 = scene.getObjectByName('Muro4');
        const CO4_1 = scene.getObjectByName('Muro4_1');
        const CO5 = scene.getObjectByName('Muro5');
        const CO6 = scene.getObjectByName('Muro6');
        const CO7 = scene.getObjectByName('Muro7');
        const CO7_1 = scene.getObjectByName('Muro7_1');
        const CO7_2 = scene.getObjectByName('Muro7_2');
        const CO9 = scene.getObjectByName('Muro9');
        const CO10 = scene.getObjectByName('Muro10');
        const CO11 = scene.getObjectByName('Muro11');
        const CO11_1 = scene.getObjectByName('Muro11_1');
        const CO12 = scene.getObjectByName('Muro12');
        const CO13 = scene.getObjectByName('Muro13');
        const CO13_1 = scene.getObjectByName('Muro13_1');
        const CO14 = scene.getObjectByName('Muro14');
        const CO15 = scene.getObjectByName('Muro15');
        const CO16 = scene.getObjectByName('Muro16');

        if(typep==1){
        var enemy1 =new THREE.Box3().setFromObject(E1);
		var enemy2 =new THREE.Box3().setFromObject(E2);
		var enemy3 =new THREE.Box3().setFromObject(E3);
		var enemy4 =new THREE.Box3().setFromObject(E4);
        }


        if (CO1 && (P1 || P2 || P3))
        {

            if(Jugadornum==0)
            {
            var SecondBB = new THREE.Box3().setFromObject(P1);
            }
            if(Jugadornum==1)
            {
            var SecondBB = new THREE.Box3().setFromObject(P2);
            }
            if(Jugadornum==2)
            {
            var SecondBB = new THREE.Box3().setFromObject(P3);
            }
            var firstBB = new THREE.Box3().setFromObject(CO1);
            var firstBB1 = new THREE.Box3().setFromObject(CO2);
            var firstBB2 = new THREE.Box3().setFromObject(CO3);
            var firstBB3 = new THREE.Box3().setFromObject(CO4);
            var firstBB3_1 = new THREE.Box3().setFromObject(CO4_1);
    
            var firstBB4 = new THREE.Box3().setFromObject(CO5);
            var firstBB5 = new THREE.Box3().setFromObject(CO6);
            var firstBB6 = new THREE.Box3().setFromObject(CO7);
            var firstBB6_1 = new THREE.Box3().setFromObject(CO7_1);
            var firstBB6_2 = new THREE.Box3().setFromObject(CO7_2);
    
    
            var firstBB8 = new THREE.Box3().setFromObject(CO9);
            var firstBB9 = new THREE.Box3().setFromObject(CO10);
            var firstBB10 = new THREE.Box3().setFromObject(CO11);
            var firstBB10_1 = new THREE.Box3().setFromObject(CO11_1);
    
    
            var firstBB11 = new THREE.Box3().setFromObject(CO12);
            var firstBB12 = new THREE.Box3().setFromObject(CO13);
            var firstBB12_1 = new THREE.Box3().setFromObject(CO13_1);
    
            var firstBB13 = new THREE.Box3().setFromObject(CO14);
            var firstBB14 = new THREE.Box3().setFromObject(CO15);
            var firstBB15 = new THREE.Box3().setFromObject(CO16);
    
             if (firstBB.intersectsBox(SecondBB))
             {
                 player.handler.translateZ(Vcolision);	
                }
            if (firstBB1.intersectsBox(SecondBB))
            {
                player.handler.translateZ(Vcolision);	
            }
           if (firstBB2.intersectsBox(SecondBB))
           {
               player.handler.translateZ(Vcolision);		
          }
          if (firstBB3.intersectsBox(SecondBB))
          {
              player.handler.translateZ(Vcolision);		
         }
         if (firstBB4.intersectsBox(SecondBB))
         {
             player.handler.translateZ(Vcolision);		
        }
        if (firstBB3_1.intersectsBox(SecondBB))
        {
            player.handler.translateZ(Vcolision);		
       }
        if (firstBB5.intersectsBox(SecondBB))
        {
            player.handler.translateZ(Vcolision);		
       }
       if (firstBB6.intersectsBox(SecondBB))
       {
           player.handler.translateZ(Vcolision);		
      }
      if (firstBB6_1.intersectsBox(SecondBB))
      {
          player.handler.translateZ(Vcolision);		
     }
     if (firstBB6_2.intersectsBox(SecondBB))
     {
         player.handler.translateZ(Vcolision);		
    }
    
     if (firstBB8.intersectsBox(SecondBB))
     {
         player.handler.translateZ(Vcolision);		
    }
    if (firstBB9.intersectsBox(SecondBB))
    {
        player.handler.translateZ(Vcolision);		
    }
    if (firstBB10.intersectsBox(SecondBB))
    {
        player.handler.translateZ(Vcolision);		
    }
    if (firstBB10_1.intersectsBox(SecondBB))
    {
        player.handler.translateZ(Vcolision);		
    }
    if (firstBB11.intersectsBox(SecondBB))
    {
        player.handler.translateZ(Vcolision);		
    }
    if (firstBB12.intersectsBox(SecondBB))
    {
        player.handler.translateZ(Vcolision);		
    }
    if (firstBB12_1.intersectsBox(SecondBB))
    {
        player.handler.translateZ(Vcolision);		
    }
    if (firstBB13.intersectsBox(SecondBB))
    {
        player.handler.translateZ(Vcolision);		
    }
    if (firstBB14.intersectsBox(SecondBB))
    {
        player.handler.translateZ(Vcolision);		
    }
    if (firstBB15.intersectsBox(SecondBB))
    {
        player.handler.translateZ(Vcolision);		
    }
        }
        if(E1 && (P1 || P2 || P3) && typep ==1)
        {
            if (enemy1.intersectsBox(SecondBB)||enemy2.intersectsBox(SecondBB)||enemy3.intersectsBox(SecondBB)||enemy4.intersectsBox(SecondBB))
            {
                player.handler.translateZ(Vcolision);
                killPlayer(player);	
            }
        }


}
function singleLevel1Enemy(deltatime,Vcolision,scene,typep)
{
    if(typep==1)
    {
    const E1 =scene.getObjectByName('C1');
	const E2 =scene.getObjectByName('C2');
	const E3 =scene.getObjectByName('C3');
	const E4 =scene.getObjectByName('C4');
    if(pos_a==1)
{
	E1.position.z+=vel;
	if(E1.position.z>6)
	{
		pos_a=0;
		E1.rotation.y=2 * Math.PI * (180 / 360);;
	}
}
if(pos_a==0)
{
	E1.position.z-=vel;

	if(E1.position.z<-21)
	{
		pos_a=1;
		E1.rotation.y=0;

	}
}
//2
if(pos_b==1)
{
	E2.position.x+=vel;
	if(E2.position.x>6)
	{
		pos_b=0;
		E2.rotation.y=2 * Math.PI * (270 / 360);
	}
}
if(pos_b==0)
{
	E2.position.x-=vel;

	if(E2.position.x<-6)
	{
		pos_b=1;
		E2.rotation.y=2 * Math.PI * (90 / 360);

	}
}
//3
if(pos_c==1)
{
	E3.position.z+=vel;
	if(E3.position.z>6)
	{
		pos_c=0;
		E3.rotation.y=2 * Math.PI * (180 / 360);
	}
}
if(pos_c==0)
{
	E3.position.z-=vel;

	if(E3.position.z<-21)
	{
		pos_c=1;
		E3.rotation.y=0;

	}
}
//4
if(pos_d==1)
{
	E4.position.x+=vel;
	if(E4.position.x>6)
	{
		pos_d=0;
		E4.rotation.y=2 * Math.PI * (270 / 360);
	}
}
if(pos_d==0)
{
	E4.position.x-=vel;

	if(E4.position.x<-6)
	{
		pos_d=1;
		E4.rotation.y=2 * Math.PI * (90 / 360);

	}
}
}
}
function singleLevel2Colision(deltatime,Vcolision,scene,player,Jugadornum){
 
        const P1 =scene.getObjectByName('Jugador');
        const P2 =scene.getObjectByName('Jugador1');
        const P3 =scene.getObjectByName('Jugador2');

   

        const EB1 =scene.getObjectByName('CB1');
        const EB2 =scene.getObjectByName('CB2');
        const EB3 =scene.getObjectByName('CB3');
        const EB4 =scene.getObjectByName('CB4');
        const EB5 =scene.getObjectByName('CB5');
        const EB6 =scene.getObjectByName('CB6');
        const EB7 =scene.getObjectByName('CB7');
    
        const CO2_1 = scene.getObjectByName('2Muro1');
        const CO2_2 = scene.getObjectByName('2Muro2');
        const CO2_3 = scene.getObjectByName('2Muro3');
        const CO2_4 = scene.getObjectByName('2Muro4');
        const CO2_5 = scene.getObjectByName('2Muro5');
        const CO2_6 = scene.getObjectByName('2Muro6');
        const CO2_7 = scene.getObjectByName('2Muro7');
        const CO2_8 = scene.getObjectByName('2Muro8');
        const CO2_9 = scene.getObjectByName('2Muro9');
        const CO2_10 = scene.getObjectByName('2Muro10');
        const CO2_11 = scene.getObjectByName('2Muro11');
        const CO2_12 = scene.getObjectByName('2Muro12');
        const CO2_13 = scene.getObjectByName('2Muro13');
        const CO2_14 = scene.getObjectByName('2Muro14');
        const CO2_15 = scene.getObjectByName('2Muro15');
        const CO2_16 = scene.getObjectByName('2Muro16');
        const CO2_17 = scene.getObjectByName('2Muro17');
        const CO2_18 = scene.getObjectByName('2Muro18');
        const CO2_19 = scene.getObjectByName('2Muro19');
        const CO2_20 = scene.getObjectByName('2Muro20');
        const CO2_21 = scene.getObjectByName('2Muro21');
        const CO2_22 = scene.getObjectByName('2Muro22');
        const CO2_23 = scene.getObjectByName('2Muro23');
        const CO2_24 = scene.getObjectByName('2Muro24');
        const CO2_25 = scene.getObjectByName('2Muro25');
        const CO2_26 = scene.getObjectByName('2Muro26');
        const CO2_27 = scene.getObjectByName('2Muro27');
        const CO2_28 = scene.getObjectByName('2Muro28');
        const CO2_29 = scene.getObjectByName('2Muro29');
        const CO2_30 = scene.getObjectByName('2Muro30');
        const CO2_31 = scene.getObjectByName('2Muro31');
        const CO2_32 = scene.getObjectByName('2Muro32');
    
     if (CO2_1 && (P1 || P2 || P3))
     {	
        if(Jugadornum==0)
        {
        var Second2BB = new THREE.Box3().setFromObject(P1);
        }
        if(Jugadornum==1)
        {
        var Second2BB = new THREE.Box3().setFromObject(P2);
        }
        if(Jugadornum==2)
        {
        var Second2BB = new THREE.Box3().setFromObject(P3);
        }
        var EnemyB1= new THREE.Box3().setFromObject(EB1);
        var EnemyB2= new THREE.Box3().setFromObject(EB2);
        var EnemyB3= new THREE.Box3().setFromObject(EB3);
        var EnemyB4= new THREE.Box3().setFromObject(EB4);
        var EnemyB5= new THREE.Box3().setFromObject(EB5);
        var EnemyB6= new THREE.Box3().setFromObject(EB6);
        var EnemyB7= new THREE.Box3().setFromObject(EB7);
         var first2BB_1 = new THREE.Box3().setFromObject(CO2_1);
         var first2BB_2 = new THREE.Box3().setFromObject(CO2_2);
         var first2BB_3 = new THREE.Box3().setFromObject(CO2_3);
         var first2BB_4 = new THREE.Box3().setFromObject(CO2_4);
         var first2BB_5 = new THREE.Box3().setFromObject(CO2_5);
         var first2BB_6 = new THREE.Box3().setFromObject(CO2_6);
         var first2BB_7 = new THREE.Box3().setFromObject(CO2_7);
         var first2BB_8 = new THREE.Box3().setFromObject(CO2_8);
         var first2BB_9 = new THREE.Box3().setFromObject(CO2_9);
         var first2BB_10 = new THREE.Box3().setFromObject(CO2_10);
         var first2BB_11 = new THREE.Box3().setFromObject(CO2_11);
         var first2BB_12 = new THREE.Box3().setFromObject(CO2_12);
         var first2BB_13 = new THREE.Box3().setFromObject(CO2_13);
         var first2BB_14 = new THREE.Box3().setFromObject(CO2_14);
         var first2BB_15 = new THREE.Box3().setFromObject(CO2_15);
         var first2BB_16 = new THREE.Box3().setFromObject(CO2_16);
         var first2BB_17 = new THREE.Box3().setFromObject(CO2_17);
         var first2BB_18 = new THREE.Box3().setFromObject(CO2_18);
         var first2BB_19 = new THREE.Box3().setFromObject(CO2_19);
         var first2BB_20 = new THREE.Box3().setFromObject(CO2_20);
         var first2BB_21 = new THREE.Box3().setFromObject(CO2_21);
         var first2BB_22 = new THREE.Box3().setFromObject(CO2_22);
         var first2BB_23 = new THREE.Box3().setFromObject(CO2_23);
         var first2BB_24 = new THREE.Box3().setFromObject(CO2_24);
         var first2BB_25 = new THREE.Box3().setFromObject(CO2_25);
         var first2BB_26 = new THREE.Box3().setFromObject(CO2_26);
         var first2BB_27 = new THREE.Box3().setFromObject(CO2_27);
         var first2BB_28 = new THREE.Box3().setFromObject(CO2_28);
         var first2BB_29 = new THREE.Box3().setFromObject(CO2_29);
         var first2BB_30 = new THREE.Box3().setFromObject(CO2_30);
         var first2BB_31 = new THREE.Box3().setFromObject(CO2_31);
         var first2BB_32= new THREE.Box3().setFromObject(CO2_32);
    
         if (EnemyB1.intersectsBox(Second2BB)||EnemyB2.intersectsBox(Second2BB)||EnemyB3.intersectsBox(Second2BB)
					||EnemyB4.intersectsBox(Second2BB)||EnemyB5.intersectsBox(Second2BB)||EnemyB6.intersectsBox(Second2BB)
					||EnemyB7.intersectsBox(Second2BB)){
						player.handler.translateZ(Vcolision);
						killPlayer(player);		
					}
    
         if (first2BB_1.intersectsBox(Second2BB))
             {
             player.handler.translateZ(Vcolision);	
             }
         if (first2BB_2.intersectsBox(Second2BB))
             {
             player.handler.translateZ(Vcolision);	
             }
         if (first2BB_3.intersectsBox(Second2BB))
             {
             player.handler.translateZ(Vcolision);	
             }
         if (first2BB_4.intersectsBox(Second2BB))
             {
             player.handler.translateZ(Vcolision);	
             }
         if (first2BB_5.intersectsBox(Second2BB))
             {
             player.handler.translateZ(Vcolision);	
             }
         if (first2BB_6.intersectsBox(Second2BB))
             {
             player.handler.translateZ(Vcolision);	
             }
         if (first2BB_7.intersectsBox(Second2BB))
             {
             player.handler.translateZ(Vcolision);	
             }
         if (first2BB_8.intersectsBox(Second2BB))
             {
             player.handler.translateZ(Vcolision);	
             }
         if (first2BB_9.intersectsBox(Second2BB))
             {
             player.handler.translateZ(Vcolision);	
             }
         if (first2BB_10.intersectsBox(Second2BB))
             {
             player.handler.translateZ(Vcolision);	
             }
         if (first2BB_11.intersectsBox(Second2BB))
             {
             player.handler.translateZ(Vcolision);	
             }
         if (first2BB_12.intersectsBox(Second2BB))
             {
             player.handler.translateZ(Vcolision);	
             }
         if (first2BB_13.intersectsBox(Second2BB))
             {
             player.handler.translateZ(Vcolision);	
             }
         if (first2BB_14.intersectsBox(Second2BB))
             {
             player.handler.translateZ(Vcolision);	
             }
         if (first2BB_15.intersectsBox(Second2BB))
             {
             player.handler.translateZ(Vcolision);	
             }
         if (first2BB_16.intersectsBox(Second2BB))
             {
             player.handler.translateZ(Vcolision);	
             }
         if (first2BB_17.intersectsBox(Second2BB))
             {
             player.handler.translateZ(Vcolision);	
             }
         if (first2BB_18.intersectsBox(Second2BB))
             {
             player.handler.translateZ(Vcolision);	
             }
         if (first2BB_19.intersectsBox(Second2BB))
             {
             player.handler.translateZ(Vcolision);	
             }
         if (first2BB_20.intersectsBox(Second2BB))
             {
             player.handler.translateZ(Vcolision);	
             }
         if (first2BB_21.intersectsBox(Second2BB))
             {
             player.handler.translateZ(Vcolision);	
             }
         if (first2BB_22.intersectsBox(Second2BB))
             {
             player.handler.translateZ(Vcolision);	
             }
         if (first2BB_23.intersectsBox(Second2BB))
             {
             player.handler.translateZ(Vcolision);	
             }
         if (first2BB_24.intersectsBox(Second2BB))
             {
             player.handler.translateZ(Vcolision);	
             }
         if (first2BB_25.intersectsBox(Second2BB))
             {
             player.handler.translateZ(Vcolision);	
             }
         if (first2BB_26.intersectsBox(Second2BB))
             {
             player.handler.translateZ(Vcolision);	
             }
         if (first2BB_27.intersectsBox(Second2BB))
             {
             player.handler.translateZ(Vcolision);	
             }
         if (first2BB_28.intersectsBox(Second2BB))
             {
             player.handler.translateZ(Vcolision);	
             }
         if (first2BB_29.intersectsBox(Second2BB))
             {
             player.handler.translateZ(Vcolision);	
             }
         if (first2BB_30.intersectsBox(Second2BB))
             {
             player.handler.translateZ(Vcolision);	
             }
         if (first2BB_31.intersectsBox(Second2BB))
             {
             player.handler.translateZ(Vcolision);	
             }
         if (first2BB_32.intersectsBox(Second2BB))
             {
             player.handler.translateZ(Vcolision);	
             }
     }
    
    
    
}
function singleLevel2Enemy(deltatime,Vcolision,scene){
    const EB1 =scene.getObjectByName('CB1');
    const EB2 =scene.getObjectByName('CB2');
    const EB3 =scene.getObjectByName('CB3');
    const EB4 =scene.getObjectByName('CB4');
    const EB5 =scene.getObjectByName('CB5');
    const EB6 =scene.getObjectByName('CB6');
    const EB7 =scene.getObjectByName('CB7');

//1
if(pos1_a==1)
{
    EB1.position.z+=vel;
    if(EB1.position.z>2)
    {
        pos1_a=0;
        EB1.rotation.y=2 * Math.PI * (180 / 360);
    }
}
if(pos1_a==0)
{
    EB1.position.z-=vel;

    if(EB1.position.z<-47)
    {
        pos1_a=1;
        EB1.rotation.y=0;

    }
}
//2
if(pos1_b==1)
{
    EB2.position.x+=vel;
    if(EB2.position.x>22.5)
    {
        pos1_b=0;
        EB2.rotation.y=2 * Math.PI * (270 / 360);
    }
}
if(pos1_b==0)
{
    EB2.position.x-=vel;

    if(EB2.position.x<-25)
    {
        pos1_b=1;
        EB2.rotation.y=2 * Math.PI * (90 / 360);

    }
}
//3
if(pos1_c==1)
{
    EB3.position.z+=vel;
    if(EB3.position.z>2)
    {
        pos1_c=0;
        EB3.rotation.y=2 * Math.PI * (180 / 360);;
    }
}
if(pos1_c==0)
{
    EB3.position.z-=vel;

    if(EB3.position.z<-47)
    {
        pos1_c=1;
        EB3.rotation.y=0;

    }
}
//4
if(pos1_d==1)
{
    EB4.position.z+=vel;
    if(EB4.position.z>0)
    {
        pos1_d=0;
        EB4.rotation.y=2 * Math.PI * (180 / 360);;
    }
}
if(pos1_d==0)
{
    EB4.position.z-=vel;

    if(EB4.position.z<-28)
    {
        pos1_d=1;
        EB4.rotation.y=0;

    }
}
//5
if(pos1_e==1)
{
    EB5.position.z+=vel;
    if(EB5.position.z>-15)
    {
        pos1_e=0;
        EB5.rotation.y=2 * Math.PI * (180 / 360);;
    }
}
if(pos1_e==0)
{
    EB5.position.z-=vel;

    if(EB5.position.z<-36)
    {
        pos1_e=1;
        EB5.rotation.y=0;

    }
}
//6
if(pos1_f==1)
{
    EB6.position.z+=vel;
    if(EB6.position.z>-6)
    {
        pos1_f=0;
        EB6.rotation.y=2 * Math.PI * (180 / 360);;
    }
}
if(pos1_f==0)
{
    EB6.position.z-=vel;

    if(EB6.position.z<-47)
    {
        pos1_f=1;
        EB6.rotation.y=0;

    }
}
//7
if(pos1_g==1)
{
    EB7.position.x+=vel;
    if(EB7.position.x>10)
    {
        pos1_g=0;
        EB7.rotation.y=2 * Math.PI * (270 / 360);
    }
}
if(pos1_g==0)
{
    EB7.position.x-=vel;

    if(EB7.position.x<-2)
    {
        pos1_g=1;
        EB7.rotation.y=2 * Math.PI * (90 / 360);

    }
}
//
}
function singleLevel3(deltatime,Vcolision,scene,player,Jugadornum){
   
        const P1 =scene.getObjectByName('Jugador');
        const P2 =scene.getObjectByName('Jugador1');
        const P3 =scene.getObjectByName('Jugador2');



		const CC1 =scene.getObjectByName('CC1');
        const CC2 =scene.getObjectByName('CC2');
		const CC3 =scene.getObjectByName('CC3');


		CC1.rotation.y+=VelGiro;

		const S_3 = scene.getObjectByName('Suelo3');
		const S_4 = scene.getObjectByName('Suelo4');
		const S_5 = scene.getObjectByName('Suelo5');
		const S_6 = scene.getObjectByName('Suelo6');
		const S_7 = scene.getObjectByName('Suelo7');
		const S_8 = scene.getObjectByName('Suelo8');
		const S_9 = scene.getObjectByName('Suelo9');
		const S_10 = scene.getObjectByName('Suelo10');
		const S_11 = scene.getObjectByName('Suelo11');
		const S_12= scene.getObjectByName('Suelo12');
		const S_13 = scene.getObjectByName('Suelo13');
		const S_14 = scene.getObjectByName('Suelo14');
		const T_1 = scene.getObjectByName('T1');
		const T_2 = scene.getObjectByName('T2');
		const T_3 = scene.getObjectByName('T3');
		const T_4 = scene.getObjectByName('T4');
		const T_5 = scene.getObjectByName('T5');
		const T_6 = scene.getObjectByName('T6');
		const T_7 = scene.getObjectByName('T7');
		const T_8 = scene.getObjectByName('T8');
		const T_9 = scene.getObjectByName('T9');
		const T_10 = scene.getObjectByName('T10');
		const T_11 = scene.getObjectByName('T11');
		const T_12 = scene.getObjectByName('T12');
		const T_13 = scene.getObjectByName('T13');
		const T_14 = scene.getObjectByName('T14');
		const T_15 = scene.getObjectByName('T15');
		const T_16 = scene.getObjectByName('T16');
		const T_17 = scene.getObjectByName('T17');
		const T_18 = scene.getObjectByName('T18');
		const T_19 = scene.getObjectByName('T19');
		const T_20 = scene.getObjectByName('T20');
		const T_21 = scene.getObjectByName('T21');
		const T_22 = scene.getObjectByName('T22');
		const T_23 = scene.getObjectByName('T23');
		const T_24 = scene.getObjectByName('T24');
		const J_C = scene.getObjectByName('ControladorJefe');


			if(S_3  && T_1 && (P1 || P2 || P3))
			{
                if(Jugadornum==0)
                {
                var Second2BB = new THREE.Box3().setFromObject(P1);
                }
                if(Jugadornum==1)
                {
                var Second2BB = new THREE.Box3().setFromObject(P2);
                }
                if(Jugadornum==2)
                {
                var Second2BB = new THREE.Box3().setFromObject(P3);
                }
				var first3BB_3 = new THREE.Box3().setFromObject(S_3);
				var first3BB_4 = new THREE.Box3().setFromObject(S_4);
				var first3BB_5 = new THREE.Box3().setFromObject(S_5);
				var first3BB_6 = new THREE.Box3().setFromObject(S_6);
				var first3BB_7 = new THREE.Box3().setFromObject(S_7);
				var first3BB_8 = new THREE.Box3().setFromObject(S_8);
				var first3BB_9 = new THREE.Box3().setFromObject(S_9);
				var first3BB_10 = new THREE.Box3().setFromObject(S_10);
				var first3BB_11 = new THREE.Box3().setFromObject(S_11);
				var first3BB_12 = new THREE.Box3().setFromObject(S_12);
				var first3BB_13 = new THREE.Box3().setFromObject(S_13);
				var first3BB_14 = new THREE.Box3().setFromObject(S_14);
				var first3BBT_1 = new THREE.Box3().setFromObject(T_1);
				var first3BBT_2 = new THREE.Box3().setFromObject(T_2);
				var first3BBT_3 = new THREE.Box3().setFromObject(T_3);
				var first3BBT_4 = new THREE.Box3().setFromObject(T_4);
				var first3BBT_5 = new THREE.Box3().setFromObject(T_5);
				var first3BBT_6 = new THREE.Box3().setFromObject(T_6);
				var first3BBT_7 = new THREE.Box3().setFromObject(T_7);
				var first3BBT_8 = new THREE.Box3().setFromObject(T_8);
				var first3BBT_9 = new THREE.Box3().setFromObject(T_9);
				var first3BBT_10 = new THREE.Box3().setFromObject(T_10);
				var first3BBT_11 = new THREE.Box3().setFromObject(T_11);
				var first3BBT_12 = new THREE.Box3().setFromObject(T_12);
				var first3BBT_13 = new THREE.Box3().setFromObject(T_13);
				var first3BBT_14 = new THREE.Box3().setFromObject(T_14);
				var first3BBT_15 = new THREE.Box3().setFromObject(T_15);
				var first3BBT_16 = new THREE.Box3().setFromObject(T_16);
				var first3BBT_17 = new THREE.Box3().setFromObject(T_17);
				var first3BBT_18 = new THREE.Box3().setFromObject(T_18);
				var first3BBT_19 = new THREE.Box3().setFromObject(T_19);
				var first3BBT_20 = new THREE.Box3().setFromObject(T_20);
				var first3BBT_21 = new THREE.Box3().setFromObject(T_21);
				var first3BBT_22 = new THREE.Box3().setFromObject(T_22);
				var first3BBT_23 = new THREE.Box3().setFromObject(T_23);
				var first3BBT_24 = new THREE.Box3().setFromObject(T_24);
				var first3BBJ = new THREE.Box3().setFromObject(J_C);
				var Cubo1 = new THREE.Box3().setFromObject(CC2);
				var Cubo2 = new THREE.Box3().setFromObject(CC3);


                if (Cubo1.intersectsBox(Second2BB)||Cubo2.intersectsBox(Second2BB))
				{
                    killPlayer(player);	
				}


				if (first3BB_3.intersectsBox(Second2BB))
				{
				player.handler.translateZ(Vcolision);	
				}
				if (first3BB_4.intersectsBox(Second2BB))
				{
				player.handler.translateZ(Vcolision);	
				}
				if (first3BB_5.intersectsBox(Second2BB))
				{
				player.handler.translateZ(Vcolision);	
				}
				if (first3BB_6.intersectsBox(Second2BB))
				{
				player.handler.translateZ(Vcolision);	
				}
				if (first3BB_7.intersectsBox(Second2BB))
				{
				player.handler.translateZ(Vcolision);	
				}
				if (first3BB_8.intersectsBox(Second2BB))
				{
				player.handler.translateZ(Vcolision);	
				}
				if (first3BB_9.intersectsBox(Second2BB))
				{
				player.handler.translateZ(Vcolision);	
				}
				if (first3BB_10.intersectsBox(Second2BB))
				{
				player.handler.translateZ(Vcolision);	
				}
				if (first3BB_11.intersectsBox(Second2BB))
				{
				player.handler.translateZ(Vcolision);	
				}
				if (first3BB_12.intersectsBox(Second2BB))
				{
				player.handler.translateZ(Vcolision);	
				}
				if (first3BB_13.intersectsBox(Second2BB))
				{
				player.handler.translateZ(Vcolision);	
				}
				if (first3BB_14.intersectsBox(Second2BB))
				{
				player.handler.translateZ(Vcolision);	
				}
				if (first3BBT_1.intersectsBox(Second2BB))
				{
				player.handler.translateZ(Vcolision);	
				}
				if (first3BBT_2.intersectsBox(Second2BB))
				{
				player.handler.translateZ(Vcolision);	
				}
				if (first3BBT_3.intersectsBox(Second2BB))
				{
				player.handler.translateZ(Vcolision);	
				}
				if (first3BBT_4.intersectsBox(Second2BB))
				{
				player.handler.translateZ(Vcolision);	
				}
				if (first3BBT_5.intersectsBox(Second2BB))
				{
				player.handler.translateZ(Vcolision);	
				}
				if (first3BBT_6.intersectsBox(Second2BB))
				{
				player.handler.translateZ(Vcolision);	
				}
				if (first3BBT_7.intersectsBox(Second2BB))
				{
				player.handler.translateZ(Vcolision);	
				}
				if (first3BBT_8.intersectsBox(Second2BB))
				{
				player.handler.translateZ(Vcolision);	
				}
				if (first3BBT_9.intersectsBox(Second2BB))
				{
				player.handler.translateZ(Vcolision);	
				}
				if (first3BBT_10.intersectsBox(Second2BB))
				{
				player.handler.translateZ(Vcolision);	
				}
				if (first3BBT_11.intersectsBox(Second2BB))
				{
				player.handler.translateZ(Vcolision);	
				}
				if (first3BBT_12.intersectsBox(Second2BB))
				{
				player.handler.translateZ(Vcolision);	
				}
				if (first3BBT_13.intersectsBox(Second2BB))
				{
				player.handler.translateZ(Vcolision);	
				}
				if (first3BBT_14.intersectsBox(Second2BB))
				{
				player.handler.translateZ(Vcolision);	
				}
				if (first3BBT_15.intersectsBox(Second2BB))
				{
				player.handler.translateZ(Vcolision);	
				}
				if (first3BBT_16.intersectsBox(Second2BB))
				{
				player.handler.translateZ(Vcolision);	
				}
				if (first3BBT_17.intersectsBox(Second2BB))
				{
				player.handler.translateZ(Vcolision);	
				}
				if (first3BBT_18.intersectsBox(Second2BB))
				{
				player.handler.translateZ(Vcolision);	
				}
				if (first3BBT_19.intersectsBox(Second2BB))
				{
				player.handler.translateZ(Vcolision);	
				}
				if (first3BBT_20.intersectsBox(Second2BB))
				{
				player.handler.translateZ(Vcolision);	
				}
				if (first3BBT_21.intersectsBox(Second2BB))
				{
				player.handler.translateZ(Vcolision);	
				}
				if (first3BBT_22.intersectsBox(Second2BB))
				{
				player.handler.translateZ(Vcolision);	
				}
				if (first3BBT_23.intersectsBox(Second2BB))
				{
				player.handler.translateZ(Vcolision);	
				}
				if (first3BBT_24.intersectsBox(Second2BB))
				{
				player.handler.translateZ(Vcolision);	
				}
				if (first3BBJ.intersectsBox(Second2BB))
				{
				player.handler.translateZ(Vcolision);	
				}

			}

	
}



export {singleLevel1Enemy,singleLevel1Colision,singleLevel2Colision,singleLevel2Enemy,singleLevel3};