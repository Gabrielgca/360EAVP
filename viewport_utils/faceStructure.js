
/* This variable maps the 3D position of some relevants vectors that make up the specific face
   Imagine a face in te 3D space, the variable maps the following points marked with '+', hence 25 in total:
                                +----+----+----+----+
                                |    |    |    |    |
                                +----+----+----+----+
                                |    |    |    |    |
                                +----+----+----+----+
                                |    |    |    |    |
                                +----+----+----+----+
                                |    |    |    |    |
                                +----+----+----+----+
   With the information of how many points of a face is in the camera vision, one can have an estimation
   of how much of that face is visible (percentage)                 

*/
var faceStructure = {
    ent_video_0: [  new THREE.Vector3( 240,  240, -240),   new THREE.Vector3(240,  240,    0),
            new THREE.Vector3( 240,  240,  240),   new THREE.Vector3(240,    0,  240),
            new THREE.Vector3( 240, -240,  240),   new THREE.Vector3(240, -240,    0),
            new THREE.Vector3( 240, -240, -240),   new THREE.Vector3(240,    0, -240),

            new THREE.Vector3( 240,  -240, 120),   new THREE.Vector3(240,  -120, 240),
            new THREE.Vector3( 240,  120,  240),   new THREE.Vector3(240,   240, 120),
            new THREE.Vector3( 240,  240, -120),   new THREE.Vector3(240,   120, -240),
            new THREE.Vector3( 240, -240, -120),   new THREE.Vector3(240,  -120, -240),

            new THREE.Vector3( 240,  120, -120),   new THREE.Vector3(240,  120,    0),
            new THREE.Vector3( 240,  120,  120),   new THREE.Vector3(240,    0,  120),
            new THREE.Vector3( 240, -120,  120),   new THREE.Vector3(240, -120,    0),
            new THREE.Vector3( 240, -120, -120),   new THREE.Vector3(240,    0, -120),
            new THREE.Vector3( 240 ,   0,   0)],
            
   
    ent_video_1: [  new THREE.Vector3(-240,  240, -240),   new THREE.Vector3(-240,  240,    0),
            new THREE.Vector3(-240,  240,  240),   new THREE.Vector3(-240,    0,  240),
            new THREE.Vector3(-240, -240,  240),   new THREE.Vector3(-240, -240,    0),
            new THREE.Vector3(-240, -240, -240),   new THREE.Vector3(-240,    0, -240),

            new THREE.Vector3( -240,  -240, 120),   new THREE.Vector3(-240,  -120, 240),
            new THREE.Vector3( -240,  120,  240),   new THREE.Vector3(-240,   240, 120),
            new THREE.Vector3( -240,  240, -120),   new THREE.Vector3(-240,   120, -240),
            new THREE.Vector3( -240, -240, -120),   new THREE.Vector3(-240,  -120, -240),
            
            new THREE.Vector3(-240,  120, -120),   new THREE.Vector3(-240,  120,    0),
            new THREE.Vector3(-240,  120,  120),   new THREE.Vector3(-240,    0,  120),
            new THREE.Vector3(-240, -120,  120),   new THREE.Vector3(-240, -120,    0),
            new THREE.Vector3(-240, -120, -120),   new THREE.Vector3(-240,    0, -120),
            new THREE.Vector3(-240 ,   0,   0)],
   
    ent_video_2: [  new THREE.Vector3(-240,  240, -240),   new THREE.Vector3(   0,    240, -240),
            new THREE.Vector3( 240,  240, -240),   new THREE.Vector3( 240,    240,    0),
            new THREE.Vector3( 240,  240,  240),   new THREE.Vector3(   0,    240,  240),
            new THREE.Vector3(-240,  240,  240),   new THREE.Vector3(-240,    240,    0),

            new THREE.Vector3(-240,   240,  120),   new THREE.Vector3(-120,     240,  240),
            new THREE.Vector3( 120,   240,  240),   new THREE.Vector3( 240,     240,  120),
            new THREE.Vector3( 240,   240, -120),   new THREE.Vector3( 120,     240, -240),
            new THREE.Vector3(-240,   240, -120),   new THREE.Vector3(-120,     240, -240),

            new THREE.Vector3(-120,   240, -120),   new THREE.Vector3(   0,    240, -120),
            new THREE.Vector3( 120,   240, -120),   new THREE.Vector3( 120,     240,    0),
            new THREE.Vector3( 120,   240,  120),   new THREE.Vector3(   0,    240,  120),
            new THREE.Vector3(-120,   240,  120),   new THREE.Vector3(-120,     240,    0),
            new THREE.Vector3(   0,  240,   0)],
   
    ent_video_3: [  new THREE.Vector3(-240,  -240, -240),  new THREE.Vector3(   0,   -240, -240),
            new THREE.Vector3( 240,  -240, -240),  new THREE.Vector3( 240,   -240,    0),
            new THREE.Vector3( 240,  -240,  240),  new THREE.Vector3(   0,   -240,  240),
            new THREE.Vector3(-240,  -240,  240),  new THREE.Vector3(-240,   -240,    0),

            new THREE.Vector3(-240,  -240,  120),   new THREE.Vector3(-120,  -240,  240),
            new THREE.Vector3( 120,  -240,  240),   new THREE.Vector3( 240,  -240,  120),
            new THREE.Vector3( 240,  -240, -120),   new THREE.Vector3( 120,  -240, -240),
            new THREE.Vector3(-240,  -240, -120),   new THREE.Vector3(-120,  -240, -240),

            new THREE.Vector3(-120,  -240, -120),  new THREE.Vector3(   0,  -240, -120),
            new THREE.Vector3( 120,  -240, -120),  new THREE.Vector3( 120,   -240,   0),
            new THREE.Vector3( 120,  -240,  120),  new THREE.Vector3(   0,  -240,  120),
            new THREE.Vector3(-120,  -240,  120),  new THREE.Vector3(-120,   -240,   0),
            new THREE.Vector3(   0, -240,   0)],
  
    ent_video_4: [  new THREE.Vector3(-240,  240, -240),   new THREE.Vector3(   0,   240,  -240),
            new THREE.Vector3( 240,  240, -240),   new THREE.Vector3( 240,     0,  -240),
            new THREE.Vector3( 240, -240, -240),   new THREE.Vector3(   0,  -240,  -240),
            new THREE.Vector3(-240, -240, -240),   new THREE.Vector3(-240,     0,  -240),

            new THREE.Vector3(-240,  120, -240),   new THREE.Vector3(-120,  -240,  -240),
            new THREE.Vector3( 120,  240, -240),   new THREE.Vector3( 120,  -240,  -240),
            new THREE.Vector3( 240, -120, -240),   new THREE.Vector3( 240,   120,  -240),
            new THREE.Vector3(-240, -120, -240),   new THREE.Vector3(-120,   240,  -240),

            new THREE.Vector3(-120,  120, -240),   new THREE.Vector3(   0,   120,  -240),
            new THREE.Vector3( 120,  120, -240),   new THREE.Vector3( 120,     0,  -240),
            new THREE.Vector3( 120, -120, -240),   new THREE.Vector3(   0,  -120,  -240),
            new THREE.Vector3(-120, -120, -240),   new THREE.Vector3(-120,     0,  -240),
            new THREE.Vector3(   0,  0, -240)],
   
    ent_video_5: [  new THREE.Vector3(-240,  240, 240),    new THREE.Vector3(   0,   240,   240),
            new THREE.Vector3( 240,  240, 240),    new THREE.Vector3( 240,     0,   240),
            new THREE.Vector3( 240, -240, 240),    new THREE.Vector3(   0,  -240,   240),
            new THREE.Vector3(-240, -240, 240),    new THREE.Vector3(-240,     0,   240),

            new THREE.Vector3(-240,  120,  240),    new THREE.Vector3(-120,  -240,   240),
            new THREE.Vector3( 120,  240,  240),    new THREE.Vector3( 120,  -240,   240),
            new THREE.Vector3( 240, -120,  240),    new THREE.Vector3( 240,   120,   240),
            new THREE.Vector3(-240, -120,  240),    new THREE.Vector3(-120,   240,   240),
 
            new THREE.Vector3(-120,  120,  240),    new THREE.Vector3(   0,   120,   240),
            new THREE.Vector3( 120,  120,  240),    new THREE.Vector3( 120,     0,   240),
            new THREE.Vector3( 120, -120, 240),     new THREE.Vector3(   0,  -120,   240),
            new THREE.Vector3(-120, -120, 240),     new THREE.Vector3(-120,     0,   240),
            new THREE.Vector3(   0,  0, 240)],
  }