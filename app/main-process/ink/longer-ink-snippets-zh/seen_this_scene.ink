/*
	检测流程是否在本场景内到达过某 gather。这是 "seen_more_recently_than" 的扩展，但非常实用故单独列出。

	用法： 

	// 定义场景起点
	~ sceneStart = -> start_of_scene

	- (start_of_scene)
		"欢迎！"

	- (opts)	
		<- cough_politely(-> opts)

		*	{ seen_this_scene(-> cough_politely.cough) }
			"你好！"
		
		+	{ not seen_this_scene(-> cough_politely.cough) }
			["你好！"]
			我想说话，却说不出来！
			-> opts


		
	=== cough_politely(-> go_to)
		*	(cough) [礼貌地咳嗽]
			我清了清嗓子。 
			-> go_to
		
*/


VAR sceneStart = -> seen_this_scene 

=== function seen_this_scene(-> link)
	{  sceneStart == -> seen_this_scene:
		[ERROR] - 使用 "seen_this_scene" 前需先初始化 sceneStart 变量！
		~ return false
	}
	~ return seen_more_recently_than(link, sceneStart)
	

=== function seen_more_recently_than(-> link, -> marker)
	{ TURNS_SINCE(link) >= 0: 
        { TURNS_SINCE(marker) == -1: 
            ~ return true 
        } 
        ~ return TURNS_SINCE(link) < TURNS_SINCE(marker) 
    }
    ~ return false 

