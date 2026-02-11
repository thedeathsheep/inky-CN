 
/*

	概述： 

	追踪「好/坏」行为并返回玩家在流程中遇到的比例的系统。 

	例如玩家说了 15 句好话和 5 句坏话，则 75% 为好。

	使游戏可根据玩家选择平衡做决策，无需知道实际选项数量。 

	玩家行为会随时间趋于稳定——每个新决策对整体值的影响越来越小。「覆水难收」。

	系统：

	每个概念有「swing 变量」，赋初值后可「提升」或「降低」。

	重要行为可「抬高」或「抛弃」；几乎不可逆的行为可「升级」或「摧毁」。

	测试变量可用：「high」「up」「mid」「down」「low」。

	注意：玩家需做几个选择后系统才会返回「up」或「down」。

	用法:

	// 初始化
	VAR niceness = INITIAL_SWING

	// 修改
	~ raise(niceness) 		// 记录好选择
	~ lower(niceness)		// 记录坏选择 

	// 测试
	我是 <>
	{ 
	- up(niceness):
		好人 
	- down(niceness):
		坏人 
	- else: 
		未定 
	} 
	<>.


*/


CONST INITIAL_SWING = 1001

=== function swing_count(x) 
    ~ return (upness(x) + downness(x)) - 2

=== function swing_ready(x) 
    ~ return swing_count(x) >= 2

=== function raise(ref x)
	~ x = x + 1000
	
	

=== function elevate(ref x)
    ~ raise(x)
    ~ raise(x)
    ~ raise(x)

=== function lower(ref x)
	~ x = x + 1 

== function ditch (ref x) 
    ~ lower(x) 
    ~ lower(x) 
    ~ lower(x)

=== function demolish(ref x)
	~ x = x + 20
    
=== function escalate(ref x)
	~ x = x + (20 * 1000)

	

=== function upness(x)
	~ return x / 1000

=== function downness(x)
	~ return x % 1000


=== function high(x)
    ~ return (1 * upness(x) >= downness(x) * 9)

=== function up(x)
	~ return swing_ready(x) && (4 * upness(x) >= downness(x) * 6)

=== function down(x)
	~ return swing_ready(x) && (6 * upness(x) <= downness(x) * 4)
	
=== function low(x)
	~ return swing_ready(x) && (9 * upness(x) <= downness(x) * 1)
	
=== function mid(x)
    // 若 swing 未就绪则返回 true 
    ~ return (not up(x) && not down(x))
