/*
	检测流程是否先经过一个 divert 再经过另一个。

	若从未到达第一个 divert，返回 false。 
	若从未到达第二个 divert，返回 true。 

	适用于检测「本场景内是否做过 X」。

	用法： 

	- (start_of_scene)
		"欢迎！"

	- (opts)	
		<- cough_politely(-> opts)

		*	{ seen_more_recently_than(-> cough_politely.cough, -> start_of_scene) }
			"你好！"
		
		+	{ not seen_more_recently_than(-> cough_politely.cough, -> start_of_scene) }
			["你好！"]
			我想说话，却说不出来！
			-> opts


		
	=== cough_politely(-> go_to)
		*	(cough) [礼貌地咳嗽]
			我清了清嗓子。 
			-> go_to
		
*/

=== function seen_more_recently_than(-> link, -> marker)
	{ TURNS_SINCE(link) >= 0: 
        { TURNS_SINCE(marker) == -1: 
            ~ return true 
        } 
        ~ return TURNS_SINCE(link) < TURNS_SINCE(marker) 
    }
    ~ return false 
 
