/*
	检测流程是否「最近」经过某 gather——即过去 3 回合内。

	用法： 

	- (welcome)
		"欢迎！"
	- (opts)
		*	{seen_very_recently(->welcome)}
			"抱歉，你好，是的。"
		+	"呃，什么？"
			-> opts
		*	"我们能继续吗？"
		
*/

=== function seen_very_recently(-> x)
    ~ return TURNS_SINCE(x) >= 0 && TURNS_SINCE(x) <= 3
