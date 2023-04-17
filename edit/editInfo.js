const EditInfoJSON =
{
                
        "config": {
                "coordinates": "euler-norm",        
                "FOV_theta" : 3.141592,
                "FOV_phi" : 1.570796,
                "max_roi" : 4,
                "tile_hor" : 3,
                "tile_vert" : 3
                },
        "edit" : [
                        {
                        "timestamp" : 10,
                        "type": "gradual",
                        "region_of_interest": [                                                                 
                                                {
                                                        "rank": 1,
                                                        "ROI_theta": 0.745
                                                }
                                                ]     
                        },
                        {
                        "timestamp" : 20,
                        "type": "gradual",
                        "region_of_interest": [                                                                 
                                                {
                                                        "rank": 1,
                                                        "ROI_theta": 0.745
                                                }
                                                ]     
                                },
                        {
                        "timestamp" : 25,
                        "type": "instant",
                        "region_of_interest": [                                                                 
                                                {
                                                        "rank": 1,
                                                        "ROI_theta": 0.2
                                                }
                                                ]     
                                }
        ]
}