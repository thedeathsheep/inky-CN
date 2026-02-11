/*
	检测流程是否在本回合经过某个 gather。

	用法： 

	- (welcome)
		"欢迎！"
	- (opts)
		*	{came_from(->welcome)}
			"欢迎回来！"
		*	"呃，什么？"
			-> opts
		*	"我们能继续吗？"
		
*/

=== function came_from(-> x) 
    ~ return TURNS_SINCE(x) == 0
