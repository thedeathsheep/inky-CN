/*

	将给定流程作为隧道，指定返回位置。

	若隧道内选项被选择，应以隧道返回 (->->) 结束。

	适用于在多个位置「粘贴」相同可选内容块。

	用法： 


	- (opts)
		<- thread_in_tunnel(-> eat_apple, -> opts)
		<- thread_in_tunnel(-> eat_banana, -> get_going)
		*	[ 饿着离开 ]
			-> get_going

	=== get_going
		你离开了。 
		-> END 

	=== eat_apple 
		*	[ 吃苹果 ]
			你吃了苹果。没什么用。
			->->

	=== eat_banana 
		*	[ 吃香蕉 ]
			你吃了香蕉。很满足。
			->->
		
		
*/

=== thread_in_tunnel(-> tunnel_to_run, -> place_to_return_to)

    ~ temp entryTurnChoice = TURNS()
    
    -> tunnel_to_run ->
 
 	// 若隧道内选项被选择，回合数会增加，应使用给定返回点继续流程
    {entryTurnChoice != TURNS():
        -> place_to_return_to      
    }  

    // 否则隧道只是经过，应将其作为旁支关闭
    -> DONE 
