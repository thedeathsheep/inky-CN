/*
	用于随机化选项的快速函数

	用法： 

		*	{maybe()} [询问苹果]
		*	{maybe()} [询问橙子]
		*	{maybe()} [询问香蕉]
		

*/

=== function maybe(list)
	~ return RANDOM(1, 3) == 1
